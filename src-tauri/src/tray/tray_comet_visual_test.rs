// Stage 1 (spec-round6, revised after on-device feedback): the ring keeps
// the original full-width double-comet silhouette at every progress, and
// fill is encoded purely by tint weight. The round-5 encoding (resting
// alphas 200/118 vs fill 255) was invisible on a light menu bar; the
// resting comets are now darkened to 150/90 so both fill steps read.
// These tests guard that contract.
//
// Included from `tray/comet.rs`'s `tests` module (see the `include!` site
// there) so the private rasterizer symbols are visible; a sibling module
// would not see them.

#[test]
fn silhouette_is_identical_at_zero_and_full() {
    // Silhouette = any coverage at all, so count with a near-zero
    // threshold; the ≥80 painted_count threshold would misread the dimmer
    // anti-aliased edges of the resting tint as a shape change.
    fn coverage(img: &[u8]) -> usize {
        img.chunks_exact(4).filter(|p| p[3] > 10).count()
    }
    let empty = progress_ring_rgba(0.0);
    let full = progress_ring_rgba(1.0);
    let n0 = painted_count(&empty);
    assert!(n0 > 2_000, "0% must still paint both comets, got {n0}");
    let c0 = coverage(&empty);
    let c100 = coverage(&full);
    // 1% tolerance: 4x supersampling quantises the faintest edge ring
    // differently at resting vs fill alpha (~0.7% of pixels), which is
    // quantisation noise, not a silhouette change.
    assert!(
        (c0 as i64 - c100 as i64).abs() <= c100 as i64 / 100,
        "the icon's shape must not change with progress — fill is tint-only, {c0} vs {c100}"
    );
}

#[test]
fn fill_step_is_visible_against_the_resting_tint() {
    // The on-device complaint that motivated this file: 200 -> 255 read as
    // no change in a light menu bar. Sample a body pixel on each comet's
    // centreline (12 o'clock sits on the upper comet, 6 o'clock on the
    // lower — the 30° tilt puts both on the arcs) and require the fill to
    // be a large, clearly distinguishable step up from the resting tint.
    let empty = progress_ring_rgba(0.0);
    let full = progress_ring_rgba(1.0);
    let (x12, y12) = ring_xy(0.0);
    let (x6, y6) = ring_xy(std::f64::consts::PI);
    let upper_rest = alpha_at(&empty, x12, y12);
    let lower_rest = alpha_at(&empty, x6, y6);
    let upper_fill = alpha_at(&full, x12, y12);
    let lower_fill = alpha_at(&full, x6, y6);
    assert!(
        u16::from(upper_fill) * 10 >= u16::from(upper_rest) * 15,
        "upper fill must beat resting tint by >=1.5x, got {upper_rest} -> {upper_fill}"
    );
    assert!(
        u16::from(lower_fill) * 10 >= u16::from(lower_rest) * 15,
        "lower fill must beat resting tint by >=1.5x, got {lower_rest} -> {lower_fill}"
    );
    // ...and the resting tint itself must stay clearly visible, not fade
    // into the menu bar.
    assert!(upper_rest >= 100, "0% upper comet too faint: {upper_rest}");
    assert!(lower_rest >= 60, "0% lower comet too faint: {lower_rest}");
}
