# Little Local: research and design decisions

Research checked September 12, 2026. The user chose **tap any three identical goods** and a **cozy Burlington corner shop**. The implementation is an original browser game with original artwork, names, interface, and code.

## What the reference games actually do

The supplied notes mixed two different interactions. VacuumGames’ **Good Sort – Match** slides whole rows or columns. Adjacent identical goods gather onto one shelf, and groups of three disappear. Its listing requires objectives to be completed within a timer. Apple still shows insufficient reviews for an overview, so it is not a sound basis for claiming a large consensus about this particular title. [Good Sort – Match, official App Store listing](https://apps.apple.com/us/app/good-sort-match/id6749694655)

**Goods Sort – Triple Master 3D** describes selecting three identical items across shelves and strict level timers. That is the interaction the user explicitly selected. The current US listing names Shinrays Games; the older supplied notes name Clap Palms. Product identity should follow the app ID and mechanic rather than relying solely on an older developer name. [Goods Sort, official App Store listing](https://apps.apple.com/us/app/goods-sort-triple-master-3d/id1658958534)

There is also a rearrange-on-the-shelf variant. A browser distributor’s instructions describe moving goods into three matching shelf positions, exposing darker stock behind the front row, and later unlocking glass shelves. This is useful evidence for layered stock and buffer-space planning, but its placement controls should not be silently substituted for the requested tap-three interaction. [Goods Sort 3D, playable browser edition and rules](https://www.culinaryschools.org/kids-games/goods-sort-3d/)

## What player feedback supports

**Untimed play is an explicit request, not just an aesthetic interpretation.** A CozyGamers discussion asks specifically for a goods-sorting game without a timer. Replies include people agreeing, discovering timers after downloading, and preferring more generous time limits. This is a qualitative audience signal; it does not establish market size or prove that every competing game has this problem. [CozyGamers discussion](https://www.reddit.com/r/CozyGamers/comments/1kr3nl8/anyone_know_a_good_sorting_game_like_this_but/)

**Preserve concentration and make recovery predictable.** Reviews shown on the Goods Sort listing complain about booster prompts obscuring the board and about situations perceived as requiring purchased help. Other reviews describe alleged space/match bugs. These are individual reports, some dating to 2023–2024, rather than verified defects in the current release. They informed permanently available, player-triggered controls and free recovery in Little Local. [Goods Sort reviews](https://apps.apple.com/us/app/goods-sort-triple-master-3d/id1658958534)

**The pleasure is real, but repetition matters.** A Sortime reviewer praises becoming absorbed in sorting, then asks for varied shelf behaviors and describes difficult outcomes as feeling random. This supports protecting the tactile loop while making puzzle state readable and later adding deliberate variations. It does not justify implementing every suggested obstacle at once. [Sortime, official listing and reviews](https://apps.apple.com/us/app/sortime-goods-sort-puzzle/id6738376983)

The Android **Goods Triple Match: Sorting 3D** listing provides another example of the broader shelf-sorting category, with triple matching, numerous goods, and boosters. It was cross-checked as genre context; the specific “400 repetitive levels” quotation in the supplied notes was not independently verified and is not presented here as a finding. [Google Play listing](https://play.google.com/store/apps/details?hl=en&id=com.goods.sorting.games.triple.match3d.puzzle)

The supplied claims about an eight-minute level requiring forty minutes, trying exactly 35 games, and exact advertising/playtime ratios were not independently established. They were not used as factual performance targets.

## The implemented interpretation

Little Local combines direct selection with a seven-space basket. Any three identical goods disappear automatically, including goods taken from the same shelf. The basket makes selection order matter while shelf depth provides a planning layer. This basket rule is an intentional adaptation, not a claim that every reference game uses the same rules.

| Player need | Implemented behavior |
| --- | --- |
| Relaxation without a deadline | Cozy is the default. It has unlimited generated deliveries and no countdown, energy, lives, advertising, or purchases. |
| A reason to inspect the shelves | Three front slots per shelf, with visible previews of the next row. The back row advances only when that shelf’s front is empty. |
| Fair starting boards | Every random candidate must pass a constructive complete-clear search. If search attempts are exhausted, a deterministically solvable arrangement is used. |
| Recovery without pressure | Free undo, a hint that highlights a match, and rearrange. Rearrange returns basket goods to stock, preserves all remaining item counts, and creates another verified layout. |
| Optional excitement | Rush begins on the first pick. It pauses in dialogs, when the page is hidden, and when the window loses focus. The final three items stop the clock. At expiry, retry or finish that same board untimed. |
| A shared daily ritual | A deterministic daily board based on the date in America/New_York. Unlimited replays; a shareable text result; bests saved on this device. No fabricated global rankings. |
| Reward skill without requiring speed | Consecutive triples build a chain based on the sequence of picks, not a time window. Taking a thoughtful break never breaks a Cozy chain. |
| Legible goods | Twenty-four original illustrated goods, an item-count legend, optional name labels, keyboard activation/navigation, and reduced-motion support. |
| A place with personality | Six shops offer different palettes and goods. A 24-good collection, four earned shop moods, favorite displays, and 24 keepsakes add persistent progression. |
| Pick up where you left off | Device-local saves retain separate Cozy, Trail, Daily, Rush, and Pantry sessions, undo history, settings, medals, collections, and records. Export and restore a JSON backup. |

## Fairness and difficulty, precisely

The generator shuffles complete triples across six shelves, or eight/twelve for the Grand Pantry. The solver searches sequences of visible complete triples, advances newly emptied shelves, decrements ribbon locks, rotates conveyor front rows after matches, and returns actual shelf/slot choices through the entire board. Acceptance therefore establishes at least one solution, rather than merely checking that every type occurs a multiple of three times.

This is not an optimal-move or human-speed proof. A player can make choices that fill the basket or complicate the board; free undo and rearrange provide recovery. Hints first look for a full solution when the basket is empty, then favor completing already held goods. If no immediate triple fits, the UI explains that stock is tucked away and points to recovery.

The 600-level Trail is a fixed, reproducible campaign with 12 chapters of 50 levels. It starts with 18 goods and four kinds, introduces ribbons in chapter 2, conveyors in chapter 3, and frosted stock in chapter 4. Later chapters combine these mechanics. Every tenth level in a chapter is a larger 72-good delivery. All levels are available for exploration and replay; there are no purchase or energy gates.

Random candidates must pass a complete-clear search. The constructive fallback mixes whole depth layers across shelves while preserving complete triples. Its initial open and ribboned stock are mixed separately so open shelves can supply the matches needed to unwrap ribbons. This fallback is itself checked by the solver. A sweep of the 600 released seeds found 600 distinct layouts and no boards consisting exclusively of same-good rows.

## Features added in the expanded version

- **Five modes:** endless untimed Cozy, the 600-level Trail, a shared untimed Daily, optional Rush, and 72/144-good Grand Pantry.
- **Three Cozy difficulty settings:** Gentle, Balanced, and Thoughtful. Optional later shelf surprises can be disabled. Flow automatically brings a new Cozy delivery after a cancellable five-second breather.
- **Three stars per clear:** finish, avoid rearranges, and reach the displayed chain goal or fulfill a neighbor order. Taking longer never lowers a Trail or Cozy star rating.
- **Optional neighbor orders:** match the requested type within a number of matches for a bonus. The deadline is a move-planning constraint, not a clock; missing it never ends a delivery.
- **Earned lanterns:** each three matches yields one, up to three held. A lantern packs an available triple using the ordinary selection rules. Free undo, hints, and rearrange remain available regardless.
- **Twenty-four goods:** bronze, silver, and gold collection tiers at 3, 30, and 90 sorted goods of each kind. Completed deliveries contribute their matched goods; old saves preserve totals without inventing historical per-item counts.
- **A little shop:** pin up to four found goods, collect 24 achievement keepsakes, and earn sunny, rainy, golden-hour, and evening shop scenes.
- **Comfort controls:** item names, reduced motion, sound volume, quiet/rain/lake ambience, and a distraction-free shelf view. Large Pantry cabinets scroll internally so the basket stays directly below the shelves.
- **Home Screen and offline support:** a web-app manifest, original app icons, and a service worker cache the game and its local art. Initial access requires a connection and the private site's sign-in. The browser reports when offline files are ready. Browser data can still be evicted or manually cleared, so backups remain useful. [Apple Home Screen instructions](https://support.apple.com/guide/iphone/open-as-web-app-iphea86e5236/ios), [WebKit web-app manifest support](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/).

## Deliberate boundaries

Whole-row player sliding belongs to the other reference game and remains excluded. Conveyors move automatically only after matches. Fragile goods, move bombs, category substitutions, and arbitrary mid-level stock drops would undermine the current readable, conserved-item rules and cozy default, so they were not added just to inflate the feature list.

The Daily is seeded procedural content, not a hand-authored puzzle. No global leaderboard, multiplayer service, cross-device account sync, native iOS binary, or App Store submission is included. Shop progression is illustrated scenes and collected favorites, not a full store-management simulation. Testing is described separately from physical-device acceptance in the validation record.

## Artwork

The original twelve-good atlas, twelve-good expansion, and shop interior were created with built-in imagegen and integrated as raster artwork. No competitor art or brand assets were reused. The first atlas has a genuine alpha channel. The expansion uses a white matte blended against the shelf background. Nested SVG viewports crop the supplied raster without redrawing the goods.

- Saved atlas: `dist/assets/goods-atlas.png`
- Exact generation prompt: `docs/art-prompt.txt`
- Items: maple syrup, apple, milk, cheddar, coffee, blueberries, croissant, flowers, strawberry jam, mitten, honey, and sourdough.

The expansion assets and prompts are `dist/assets/goods-expansion.png`, `dist/assets/shop-interior.png`, `docs/expansion-art-prompt.txt`, and `docs/shop-art-prompt.txt`. Simple app-icon geometry matches the existing Little Local monogram.

All web research used free built-in search and fetch. Firecrawl pages fetched: **0**.
