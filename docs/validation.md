# Validation record

September 12, 2026. Expanded Little Local browser release. These are distinct automated, browser, and visual checks; no physical-iPhone or App Store acceptance is implied.

## Automated rules and content checks

**19 Node test cases pass.** The suite covers:

- Every one of the **600 released Trail seeds**: 600 distinct layouts, a complete executable solution for each, valid saved state after every pick, and three-star attainability. All 24 goods appear across the campaign.
- **120 additional seeded boards** across the original modes, themes, and progression samples.
- **36 Grand Pantry boards**: both 72/144 sizes across six themes and three seeds each, fully solved with item conservation checks.
- Initial ribbon restrictions, match-based unlocking, conveyor front-row exchange, unchanged underlying stock, and frosted-stock metadata.
- **24 late-level/Pantry recoveries** and the original **25 full-basket recoveries**, preserving every remaining good and restoring a solvable board.
- Exact-three clearing, invalid selections, seven-space capacity, hint-led clears, and undo snapshots.
- Untimed Cozy, Rush start/expiry/free untimed finish, and the final-triple clock stop.
- Lantern earning/cap, optional neighbor orders, once-only delivery rewards, non-duplicating unique Trail counts, medal retention, collection totals, and Daily record ranking.
- Version-1 migration preserving existing totals and unfinished boards without inventing past per-good collection counts.
- Backup round trips and rejection of malformed mechanics, orders, impossible completion states, and level metadata.
- Offline asset inventory, standalone manifest, and valid PNG app icons.

All JavaScript modules pass syntax checks. All 14 precache URLs return HTTP 200 locally with the expected HTML, JavaScript, CSS, manifest, or image content type. There is no build step or runtime package dependency.

A separate generation-quality sweep found **zero all-uniform-row boards among the 600 Trail levels**, with all 600 generated in about 7.4 seconds on this development machine; the slowest observed level took about 91 ms. These are local measurements, not phone-performance promises. The solver establishes that a route exists; it does not prove optimal human speed or that every player choice can recover without assistance.

## Browser playtest

Tested in the Codex browser through visible controls and the page-defined WebMCP pick interface:

- Complete Cozy deliveries, success rewards, journal progression, and transition to the next delivery.
- **Trail level 1** cleared without hints, with three stars and collection credit.
- **Trail level 600** cleared through all 24 matches, with ribbons opening, conveyor front rows moving, frosted previews, a fulfilled neighbor order, and an earned lantern used through its button.
- **144-good Grand Pantry** cleared through all 48 matches. A direct click on shelf 12 scrolled the cabinet to its lower shelves; undo restored that pick.
- Switch Cozy → Trail map → Resume to recover the exact partially played Trail board and basket. Reload preserves it.
- Full seven-slot basket and free rearrange recovery (initial release); conservation is additionally checked against the expanded engine.
- Rush tested with its real countdown: first tap starts the clock, expiry opens the free retry/untimed dialog, and untimed continuation retains the board and survives reload without reactivating the timer. Pausing and away handling were also checked in the initial release.
- Flow enabled through Settings: completing Cozy delivery 2 automatically advanced to delivery 3 after the five-second breather; the preference was then turned off.
- A **210,607-character progress backup** was read from the visible export field, pasted through the restore UI, reviewed, and restored successfully. The delivery, collection, and Trail counts persisted. JSON file download was requested, but the browser's download destination was not independently confirmed; selectable backup text provides a verified alternative.
- Collections, achievement records, theme choices, and the distraction-free shelf view inspected. Original Daily replay/share and item-label/motion preferences were verified in the initial release.
- No application error or warning logs at the final checked point.

## Offline and responsive checks

The service worker completed installation and the UI reported **Ready offline**. The local HTTP server was then stopped; a direct request failed with no server response. The game was reloaded successfully from its cached files, restored Trail level 2, and accepted a new pick. The server was then restarted. This verifies operation without the game origin available; it is not a physical-phone airplane-mode test.

Desktop screenshots were inspected at approximately 1365 pixels wide, alongside **390px and 320px** phone widths. No horizontal page overflow was observed. At 320px, good targets measured approximately **44.66px wide** and Trail level buttons **44px wide**. At 390px, Pantry good targets measured approximately **50px wide**. Cabinet scrolling, basket placement, focus view, and the Trail map were inspected visually.

All 24 goods and the illustrated shop scene were inspected. The white-matte expansion atlas is blended at the shelf group so it does not show white rectangles on the wood; clipped viewports prevent neighboring sprites from leaking into each icon.

## Practical limits

This is a browser implementation with Home Screen metadata, not a native iOS binary or App Store submission. Physical iPhone/iPad installation, browser storage eviction behavior, and audio playback through speakers still need device acceptance. Synthesized ambience is opt-in. The original clipboard read-back was inconclusive, so share and backup dialogs provide selectable text. Progress is local to each browser and origin, with explicit backup/restore rather than cross-device account sync.
