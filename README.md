# Little Local

An original cozy shelf-matching browser game set in a Burlington corner shop. The expanded release includes **600 fixed Trail levels, 12 chapters, five modes, six shops, 24 goods, and 24 achievement keepsakes**.

**[Play Little Local](https://play.btownbrief.com/little-local/)** · [Btown Hub](https://hub.btownbrief.com/) · [Btown Arcade](https://play.btownbrief.com/)

Run `npm run dev` and open `http://localhost:4173`. The static game is in `dist/`; there are no package dependencies and no build step. Run `npm test` for rules, generation, migration, and progression checks, and `npm run check` for JavaScript syntax checks.

## Play

Tap identical goods from any shelf into a seven-space basket. Three of a kind disappear automatically. Empty the front of a shelf to expose its back stock. A full basket is recoverable with free undo or rearrange. Hints are free too.

| Mode | What to expect |
| --- | --- |
| Cozy | Unlimited untimed deliveries; three difficulty settings; optional shelf surprises and automatic next deliveries. |
| Trail | 600 reproducible levels across 12 chapters; open replay/jump map; three stars per level; ribbon locks, frosted previews, and conveyors. |
| Daily | One seeded board per Burlington date; untimed; unlimited attempts; local personal best and copyable results. |
| Rush | 120/180-second deliveries; starts on first tap; pauses away/in dialogs; final triple stops the clock; free untimed continuation after expiry. |
| Grand Pantry | 72 or 144 goods on 8 or 12 shelves; an internally scrolling cabinet and an untimed long-session loop. |

Every three matches earns a lantern that can pack one available triple. Optional neighbor orders add planning bonuses. Collection goods have bronze/silver/gold tiers; four favorite finds can be displayed in the illustrated shop. Twenty-four keepsakes and four earned scene moods provide lasting progression.

Settings include six shop themes, item labels, reduced motion, volume, synthesized tap sounds, rain/lake ambience, and a distraction-free shelf view. Keyboard: Tab/Enter/Space for controls, arrows among goods, U for undo, H for hint.

## Saving and phone use

Progress is local to each browser/site origin. The version-2 profile imports version-1 totals and sessions, preserving the original saved data. Different modes retain separate unfinished boards. Completed level medals never decrease on replay. Export/restore a JSON backup from My records, with selectable text and paste-to-restore alternatives for browsers that limit file downloads.

A web manifest and service worker support Home Screen use and offline loading after a successful initial visit. Wait for “Ready offline” in the footer. On iPhone, open the site in Safari, Share → Add to Home Screen, and enable Open as Web App. The public game needs no account. This is a browser game, not a native iOS binary.

Moving from the original private prototype? Export your progress in **My records** on the old site, then restore it in My records on the public game. Each site's browser storage is separate; the old save stays on the old site.

For development, service-worker asset fetches try the network first. Increment the cache version in `dist/sw.js` whenever publishing changed offline assets. Offline caches store the game; progress remains in localStorage and should be backed up separately.

## Publishing

GitHub Pages publishes `dist/` at `https://play.btownbrief.com/little-local/` after changes merge to `main` and the game checks pass. The project inherits the Btown Arcade's custom domain; it does not need its own CNAME. Paths, the web-app manifest, and the service worker are scoped to the game subdirectory.

The canonical name and description live in `games.json` in [btownbrief/btownbrief.github.io](https://github.com/btownbrief/btownbrief.github.io). The Arcade, Hub, and shared network search read that entry automatically. `.openai/hosting.json` retains the original private prototype binding; GitHub Actions does not use it.

## Source and design

- `dist/engine.js`: deterministic generation, complete-clear search, shelf mechanics, basket, recovery, hints, and timing.
- `dist/content.js`: 24 goods, six shops, 12 chapters, 600 level specifications, achievements, and decoration thresholds.
- `dist/profile.js`: save migration, validation, progression, medals, collections, and backup import/export.
- `dist/app.js`: rendering, dialogs, controls, animations, browser lifecycle, and optional page-defined WebMCP tools.
- `dist/audio.js`: synthesized notes and ambient sound; no media downloads.
- `dist/sw.js` and `dist/manifest.webmanifest`: offline files and standalone web-app metadata.

See [research and decisions](docs/research-and-design.md), [original artwork prompt](docs/art-prompt.txt), and [validation record](docs/validation.md). No competitor art or branding is reused. No advertising, payments, tracking SDK, account database, or invented leaderboard is present.
