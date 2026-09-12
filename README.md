# Little Local

An original cozy shelf-matching browser game set in a Burlington corner shop.

Run `npm run dev` and open `http://localhost:4173`. The static game is in `dist/`; there are no package dependencies and no build step. Run `npm test` for game-rule and generation checks, and `npm run check` for JavaScript syntax checks.

## Play

Tap three identical goods from any shelf to clear them from the seven-space basket. Empty a shelf’s front row to expose its back stock. Undo, hints, and rearrange are free. A full basket is recoverable, never a paid failure screen.

- **Cozy:** unlimited untimed deliveries.
- **Daily:** one reproducible board per Burlington date, unlimited attempts, device-local personal best, and copyable results.
- **Rush:** 120 seconds for the early deliveries, 180 for larger ones; starts on the first tap, pauses when away, and stops for the last triple. Finish untimed or retry after expiry.

Settings include sound, motion, good-name labels, and three shop themes. Keyboard: Tab/Enter/Space for controls, arrows among goods, U for undo, H for hint. Progress saves in browser localStorage; it is not synced between devices or origins. The private hosted version requires the owner’s sign-in.

## Design and assets

See [research and decisions](docs/research-and-design.md), [original artwork prompt](docs/art-prompt.txt), and [validation record](docs/validation.md).

The generated artwork is an original transparent PNG atlas. `good()` in `dist/app.js` crops objects with nested SVG viewports to prevent adjacent sprites from bleeding into letterbox space. Shop shelves and other interface geometry are CSS. Fonts use Google Fonts with local system fallbacks. Gentle audio is synthesized with Web Audio after the player enables sound.

`dist/engine.js` holds deterministic generation, the complete-clear search, match rules, tray capacity, reshuffle, hints, and timing. `dist/app.js` handles rendering, dialogs, local persistence, animation, audio, and optional page-defined WebMCP tools. The latter were tested through the browser’s supported tool interface.

This is a playable browser implementation, not a native iOS binary. No advertising, tracking SDK, payment, account database, or external leaderboard is present.
