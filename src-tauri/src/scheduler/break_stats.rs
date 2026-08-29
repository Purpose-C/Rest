use chrono::{Local, NaiveDate};
use serde::Serialize;

use crate::stats::{EventPayload, LoggedEvent, Outcome};

const POSTPONE_DODGE_WEIGHT: f32 = 0.5;

/// Today's break counters surfaced to the Insights tab and used by Break
/// Health. Startup seeds them from the persistent JSONL event log;
/// `postponed` counts each postpone, not unique breaks.
#[derive(Debug, Clone, Default, Serialize)]
pub struct BreakStats {
    pub taken: u32,
    pub skipped: u32,
    pub postponed: u32,
}

impl BreakStats {
    /// Skip ratio in `[0, 1]`, used to drive the overlay's "break
    /// health" vignette: 0 when every offered break is taken, 1 when
    /// every offered break is dismissed.
    pub fn intensity(&self) -> f32 {
        let weighted_dodge = self.skipped as f32 + self.postponed as f32 * POSTPONE_DODGE_WEIGHT;
        let total = self.taken as f32 + weighted_dodge;
        if total == 0.0 {
            return 0.0;
        }
        (weighted_dodge / total).clamp(0.0, 1.0)
    }

    pub fn from_events_on_date(events: &[LoggedEvent], date: NaiveDate) -> Self {
        let mut stats = Self::default();
        for event in events {
            if event.t.with_timezone(&Local).date_naive() != date {
                continue;
            }
            match event.event {
                EventPayload::BreakEnd {
                    outcome: Outcome::Completed,
                    ..
                } => stats.taken = stats.taken.saturating_add(1),
                EventPayload::BreakEnd {
                    outcome: Outcome::Dismissed,
                    ..
                }
                | EventPayload::BreakSkipped { .. } => {
                    stats.skipped = stats.skipped.saturating_add(1)
                }
                EventPayload::BreakPostponed { .. } => {
                    stats.postponed = stats.postponed.saturating_add(1)
                }
                _ => {}
            }
        }
        stats
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn break_stats_intensity() {
        let mut s = BreakStats::default();
        assert_eq!(s.intensity(), 0.0);
        s.taken = 4;
        s.skipped = 1;
        let i = s.intensity();
        assert!((i - 0.2).abs() < 0.001);
        s.skipped = 10;
        s.taken = 0;
        assert_eq!(s.intensity(), 1.0);
    }

    #[test]
    fn break_stats_intensity_counts_postpones_at_half_weight() {
        let s = BreakStats {
            taken: 1,
            skipped: 0,
            postponed: 2,
        };
        assert!((s.intensity() - 0.5).abs() < 0.001);
    }

    #[test]
    fn seeds_only_todays_break_outcomes_from_logged_events() {
        use crate::scheduler::types::BreakKind;
        use crate::stats::SkipSource;
        use chrono::{Duration, Utc};

        let now = Utc::now();
        let event = |t, event| LoggedEvent { t, event };
        let events = vec![
            event(
                now,
                EventPayload::BreakEnd {
                    kind: BreakKind::Micro,
                    outcome: Outcome::Completed,
                },
            ),
            event(
                now,
                EventPayload::BreakSkipped {
                    kind: BreakKind::Long,
                    source: SkipSource::User,
                },
            ),
            event(
                now,
                EventPayload::BreakPostponed {
                    kind: BreakKind::Micro,
                    minutes: 5,
                },
            ),
            event(
                now - Duration::days(1),
                EventPayload::BreakEnd {
                    kind: BreakKind::Micro,
                    outcome: Outcome::Dismissed,
                },
            ),
        ];

        let seeded =
            BreakStats::from_events_on_date(&events, now.with_timezone(&Local).date_naive());
        assert_eq!(seeded.taken, 1);
        assert_eq!(seeded.skipped, 1);
        assert_eq!(seeded.postponed, 1);
    }
}
