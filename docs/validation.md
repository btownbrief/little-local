# Validation record

September 12, 2026. Validation applies to the browser implementation in this checkout.

## Rules and generation

All nine Node test cases passed (`npm test`). Coverage includes executable complete solutions for 120 boards spanning three modes, three themes, and rounds 1–15; deterministic daily seeds; exact-three clearing; rejecting invalid picks; full-basket capacity; 25 recoveries preserving every good; untimed Cozy play; Rush start/expiry/untimed continuation; the final-triple clock stop; full-clear hints; undo snapshots; and saved-state validation.

A preceding exploratory sweep also solved 60 generated boards. These checks prove the tested layouts can be cleared. They do not measure human solving speed or prove every player-selected route remains solvable without assistance.

## Browser playtest

Tested in the Codex browser through actual controls and the page-defined WebMCP interface:

- Complete 36-good Cozy delivery, success dialog, journal stamp, and transition to delivery 2.
- Restore progress after reload, undo a completed triple back to two basket items, then finish through hints.
- Fill all seven basket spaces deliberately, verify further selections are disabled, and rearrange to an empty basket with remaining goods preserved.
- Enter Rush, verify it stays at 2:00 before the first pick, then use Pause. The paused clock remained unchanged while other work continued.
- Complete the 54-good Daily, reopen the identical board, and verify the original visible arrangement matches exactly.
- Change to the lakeside theme without changing the Daily goods; enable item labels and reduced motion; verify all three settings survive reload.
- Return from Daily to the saved Cozy delivery without losing its state.
- WebMCP read and pick tools registered; valid batched picks changed the visible board and returned current state; an out-of-range shelf was rejected without mutation.
- No captured browser error or warning logs at the checked point.

## Visual and responsive checks

Inspected full-page screenshots at desktop width (1366px), 390px, and 320px. Verified no horizontal document overflow at the mobile widths. The 390px board uses roughly 51 × 85px good hit targets. The smallest checked layout keeps good targets at least 44px wide. The sprite atlas was inspected, and nested viewports fixed neighboring-art leakage around non-square icons.

The default preview panel is narrow; the game remains playable there. Temporary viewport overrides were reset after testing.

## Limits

This was browser responsive testing, not a physical iPhone/iPad or native iOS test. Synthesized audio was not independently auditioned on speakers. The browser tool’s clipboard read-back was blank, so clipboard transfer is not claimed as verified; the result dialog also exposes selectable text for manual copying and returns to the completion screen. The timer-expiry/untimed path was checked at engine level; its full real-time expiry was not waited through in browser QA. Device-local storage is intentionally not cross-device sync.
