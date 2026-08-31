// Stage 6 (spec-round6 L3): the double-comet progress ring rasteriser,
// extracted from tray.rs. tray.rs owns the tray chrome (menu, ticker,
// macOS polishing); this module owns nothing but pure geometry: given a
// progress fraction it produces the ring's RGBA pixels. No AppKit, no
// Tauri, no scheduler state — which is what makes it unit-testable.

pub(super) const PROGRESS_RING_SIZE: u32 = 200;
// Two clockwise comets on a slightly wide ellipse, tilted 30°. Template
// tint: one system colour, three alphas (upper / lower / fill).
pub(super) const RING_PATH_RX: f64 = 76.0;
pub(super) const RING_PATH_RY: f64 = 71.0;
pub(super) const COMET_HEAD_HALF: f64 = 23.0;
pub(super) const COMET_GAP: f64 = 22.0 * std::f64::consts::PI / 180.0;
pub(super) const COMET_TILT: f64 = std::f64::consts::FRAC_PI_6;
pub(super) const COMET_TAPER: f64 = 0.85;
// Stage 1 revisited after on-device feedback: the silhouette stays the
// original full-width double comet at every progress — only the *tint
// weight* encodes fill. The round-5 alphas (200/118) sat too close to the
// fill's 255 for the step to read on a light menu bar, so the resting
// comets are darkened instead: 150->255 (1.7x) and 90->255 (2.8x) are
// both visible steps, and the icon keeps its original shape at 0%.
pub(super) const COMET_UPPER_ALPHA: u8 = 150;
pub(super) const COMET_LOWER_ALPHA: u8 = 90;
pub(super) const COMET_FILL_ALPHA: u8 = 255;

pub(super) fn progress_bucket(remaining_secs: u64, interval_secs: u64) -> u8 {
    if interval_secs == 0 {
        return 60;
    }
    let progress = 1.0 - remaining_secs.min(interval_secs) as f64 / interval_secs as f64;
    (progress * 60.0).round().clamp(0.0, 60.0) as u8
}

pub(super) fn wrap_2pi(angle: f64) -> f64 {
    let tau = std::f64::consts::TAU;
    let wrapped = angle % tau;
    if wrapped < 0.0 {
        wrapped + tau
    } else {
        wrapped
    }
}

pub(super) fn comet_half_width(s: f64) -> f64 {
    // Needle at the tail, full width at the round head, thickening along
    // the whole body — no uniform-sausage plateau.
    COMET_HEAD_HALF * s.clamp(0.0, 1.0).powf(COMET_TAPER)
}

pub(super) fn arc_param(theta: f64, start: f64, span: f64) -> Option<f64> {
    let d = wrap_2pi(theta - start);
    if d <= span {
        Some(d / span)
    } else {
        None
    }
}

pub(super) fn path_point(ang: f64) -> (f64, f64) {
    (RING_PATH_RX * ang.sin(), -RING_PATH_RY * ang.cos())
}

pub(super) fn eccentric_angle(px: f64, py: f64) -> f64 {
    (px / RING_PATH_RX).atan2(-py / RING_PATH_RY)
}

pub(super) fn dist2_on_path(px: f64, py: f64, ang: f64) -> f64 {
    let (cx, cy) = path_point(ang);
    let dx = px - cx;
    let dy = py - cy;
    dx * dx + dy * dy
}

pub(super) fn dist_to_centerline(px: f64, py: f64) -> (f64, f64) {
    let theta = eccentric_angle(px, py);
    let (cx, cy) = path_point(theta);
    ((px - cx).hypot(py - cy), theta)
}

/// Cover of one comet: `(on_full_shape, on_fill)`. `fill_s` is 0..=1 along
/// the comet from tail to round head. A local-width cap sits at the fill
/// frontier so the growing end is round, not a radial slice. The silhouette
/// is progress-independent — fill is encoded purely by the tint alphas.
pub(super) fn comet_cover(
    px: f64,
    py: f64,
    dist: f64,
    theta: f64,
    fill_s: f64,
    tail: f64,
    span: f64,
) -> (bool, bool) {
    let mut on_full = false;
    let mut on_fill = false;
    if let Some(s) = arc_param(theta, tail, span) {
        if dist <= comet_half_width(s) {
            on_full = true;
            if fill_s > 0.0 && s <= fill_s {
                on_fill = true;
            }
        }
    }
    let head = wrap_2pi(tail + span);
    if dist2_on_path(px, py, head) <= COMET_HEAD_HALF * COMET_HEAD_HALF {
        on_full = true;
        if fill_s >= 1.0 {
            on_fill = true;
        }
    }
    if fill_s > 0.0 && fill_s < 1.0 {
        let cap = wrap_2pi(tail + span * fill_s);
        let rw = comet_half_width(fill_s);
        if dist2_on_path(px, py, cap) <= rw * rw {
            on_fill = true;
        }
    }
    (on_full, on_fill)
}

pub(super) fn comet_fills(progress: f64) -> (f64, f64) {
    let p = progress.clamp(0.0, 1.0);
    if p <= 0.5 {
        (p / 0.5, 0.0)
    } else {
        (1.0, (p - 0.5) / 0.5)
    }
}

pub(super) fn comet_geometry() -> (f64, f64, f64) {
    let span = std::f64::consts::PI - COMET_GAP;
    let tail_left = COMET_TILT + std::f64::consts::PI + COMET_GAP * 0.5;
    let tail_right = COMET_TILT + COMET_GAP * 0.5;
    (tail_left, tail_right, span)
}

#[allow(clippy::too_many_arguments)]
pub(super) fn comet_sample(
    px: f64,
    py: f64,
    dist: f64,
    theta: f64,
    fill_left: f64,
    fill_right: f64,
    tail_left: f64,
    tail_right: f64,
    span: f64,
) -> Option<u8> {
    let (full_l, fill_l) = comet_cover(px, py, dist, theta, fill_left, tail_left, span);
    if fill_l {
        return Some(COMET_FILL_ALPHA);
    }
    if full_l {
        return Some(COMET_UPPER_ALPHA);
    }
    let (full_r, fill_r) = comet_cover(px, py, dist, theta, fill_right, tail_right, span);
    if fill_r {
        return Some(COMET_FILL_ALPHA);
    }
    if full_r {
        return Some(COMET_LOWER_ALPHA);
    }
    None
}

pub(super) fn progress_ring_rgba(progress: f64) -> Vec<u8> {
    let size = PROGRESS_RING_SIZE as usize;
    let center = PROGRESS_RING_SIZE as f64 / 2.0;
    let (tail_left, tail_right, span) = comet_geometry();
    let (fill_left, fill_right) = comet_fills(progress);
    let mut rgba = vec![0u8; size * size * 4];
    for y in 0..size {
        for x in 0..size {
            let mut alpha_sum = 0u32;
            for sy in 0..4 {
                for sx in 0..4 {
                    let px = x as f64 + (sx as f64 + 0.5) / 4.0 - center;
                    let py = y as f64 + (sy as f64 + 0.5) / 4.0 - center;
                    let (dist, theta) = dist_to_centerline(px, py);
                    if let Some(a) = comet_sample(
                        px,
                        py,
                        dist,
                        theta,
                        fill_left,
                        fill_right,
                        tail_left,
                        tail_right,
                        span,
                    ) {
                        alpha_sum += u32::from(a);
                    }
                }
            }
            if alpha_sum > 0 {
                // Black body, alpha carries the template tint weight.
                rgba[(y * size + x) * 4 + 3] = (alpha_sum / 16) as u8;
            }
        }
    }
    rgba
}

#[cfg(test)]
mod tests {
    use super::*;

    // Fork-added visual guards for the stage-1 shape encoding. A separate
    // file so upstream test bodies in the old tray.rs module stayed
    // untouched; they live with the geometry they guard now.
    include!("tray_comet_visual_test.rs");

    #[test]
    fn progress_bucket_quantizes_sixty_steps() {
        assert_eq!(progress_bucket(3_000, 3_000), 0);
        assert_eq!(progress_bucket(1_500, 3_000), 30);
        assert_eq!(progress_bucket(0, 3_000), 60);
        assert_eq!(progress_bucket(9_000, 3_000), 0);
    }

    fn alpha_at(img: &[u8], x: u32, y: u32) -> u8 {
        img[((y * PROGRESS_RING_SIZE + x) * 4 + 3) as usize]
    }

    fn alpha_near(got: u8, want: u8, tol: u8) -> bool {
        got.abs_diff(want) <= tol
    }

    fn painted_count(img: &[u8]) -> usize {
        img.chunks_exact(4).filter(|p| p[3] >= 80).count()
    }

    fn ring_xy(ang: f64) -> (u32, u32) {
        let x = (100.0 + RING_PATH_RX * ang.sin()).round() as u32;
        let y = (100.0 - RING_PATH_RY * ang.cos()).round() as u32;
        (x, y)
    }

    #[test]
    fn two_comets_fill_left_then_right() {
        let empty = progress_ring_rgba(0.0);
        let quarter = progress_ring_rgba(0.25);
        let half = progress_ring_rgba(0.5);
        let full = progress_ring_rgba(1.0);
        assert_eq!(
            empty.len(),
            (PROGRESS_RING_SIZE * PROGRESS_RING_SIZE * 4) as usize
        );
        assert_eq!(alpha_at(&empty, 100, 100), 0, "centre must stay hollow");
        assert_eq!(alpha_at(&full, 100, 100), 0, "a full ring is still hollow");
        for (x, y) in [(100, 90), (100, 110), (90, 100), (110, 100)] {
            assert_eq!(alpha_at(&full, x, y), 0, "hollow disc at ({x},{y})");
        }

        let n0 = painted_count(&empty);
        let n100 = painted_count(&full);
        assert!(n0 > 2_000, "0% already paints both comets, got {n0}");
        // Stage 1 (spec-round6): fill must now change the silhouette too —
        // the unfilled track is narrow, the filled arc full width. The old
        // assertion demanded the opposite (alpha-only encoding).
        assert!(
            (n0 as i32 - n100 as i32).unsigned_abs() < n0 as u32 / 3,
            "fill changes alpha, not the silhouette, {n0} vs {n100}"
        );

        let (x9, y9) = ring_xy(std::f64::consts::PI * 1.5);
        let (x3, y3) = ring_xy(std::f64::consts::FRAC_PI_2);
        let (x12, y12) = ring_xy(0.0);
        let (x6, y6) = ring_xy(std::f64::consts::PI);

        assert!(
            alpha_near(alpha_at(&empty, x12, y12), COMET_UPPER_ALPHA, 30),
            "12 o'clock is the upper comet at 0%, got {}",
            alpha_at(&empty, x12, y12)
        );
        assert!(
            alpha_near(alpha_at(&empty, x6, y6), COMET_LOWER_ALPHA, 30),
            "6 o'clock is the lower comet at 0%, got {}",
            alpha_at(&empty, x6, y6)
        );
        assert!(
            alpha_near(alpha_at(&quarter, x9, y9), COMET_FILL_ALPHA, 30),
            "left fill has reached 9 o'clock by 25%, got {}",
            alpha_at(&quarter, x9, y9)
        );
        assert!(
            alpha_near(alpha_at(&quarter, x12, y12), COMET_UPPER_ALPHA, 30),
            "12 o'clock still upper-alpha at 25%, got {}",
            alpha_at(&quarter, x12, y12)
        );
        assert!(
            alpha_near(alpha_at(&half, x12, y12), COMET_FILL_ALPHA, 30)
                && alpha_near(alpha_at(&half, x9, y9), COMET_FILL_ALPHA, 30),
            "50% paints the whole left comet at fill alpha"
        );
        assert!(
            alpha_near(alpha_at(&half, x6, y6), COMET_LOWER_ALPHA, 30)
                && alpha_near(alpha_at(&half, x3, y3), COMET_LOWER_ALPHA, 30),
            "right comet is still lower-alpha at 50%, got 3={} 6={}",
            alpha_at(&half, x3, y3),
            alpha_at(&half, x6, y6)
        );
        assert!(alpha_near(alpha_at(&full, x3, y3), COMET_FILL_ALPHA, 30));
        assert!(alpha_near(alpha_at(&full, x9, y9), COMET_FILL_ALPHA, 30));
    }

    #[test]
    fn comets_leave_a_gap_on_the_tilted_seams() {
        let full = progress_ring_rgba(1.0);
        // Gap centres sit at 1:00 and 7:00; the round head eats the 12-side
        // of each gap, so sample toward the opposing tail.
        let (gx, gy) = ring_xy(COMET_TILT + COMET_GAP * 0.5);
        assert!(
            alpha_at(&full, gx, gy) < 80,
            "1:30 seam must stay open, got {} at ({gx},{gy})",
            alpha_at(&full, gx, gy)
        );
        let (gx2, gy2) = ring_xy(COMET_TILT + std::f64::consts::PI + COMET_GAP * 0.5);
        assert!(
            alpha_at(&full, gx2, gy2) < 80,
            "7:30 seam must stay open, got {} at ({gx2},{gy2})",
            alpha_at(&full, gx2, gy2)
        );
        let (x12, y12) = ring_xy(0.0);
        assert!(
            alpha_at(&full, x12, y12) >= 200,
            "tilt is 30°: 12 o'clock is on the left comet, not a seam"
        );
    }

    #[test]
    fn ring_reaches_near_the_canvas_edge() {
        let img = progress_ring_rgba(1.0);
        let mut max_r2 = 0u32;
        for y in 0..PROGRESS_RING_SIZE {
            for x in 0..PROGRESS_RING_SIZE {
                if alpha_at(&img, x, y) > 80 {
                    let dx = x as i32 - 100;
                    let dy = y as i32 - 100;
                    max_r2 = max_r2.max((dx * dx + dy * dy) as u32);
                }
            }
        }
        assert!(
            max_r2 >= 80 * 80,
            "glyph must reach the outer rim, max r²={max_r2}"
        );
        assert_eq!(alpha_at(&img, 0, 0), 0, "circle cannot fill the corner");
    }
}
