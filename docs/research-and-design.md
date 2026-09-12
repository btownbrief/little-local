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
| Legible goods | Twelve original illustrated goods, an item-count legend, optional name labels, keyboard activation/navigation, and reduced-motion support. |
| A place with personality | The corner shop, morning bakery, and lakeside stand offer different colors and goods for future deliveries. A small journal records completed deliveries, matches, and chains. |
| Pick up where you left off | Device-local saves retain separate Cozy, Daily, and Rush sessions, undo history, settings, and journal totals. |

## Fairness and difficulty, precisely

The generator shuffles complete triples across six shelves. The solver searches sequences of visible complete triples, advances newly emptied shelves, and returns actual shelf/slot choices through the entire board. Acceptance therefore establishes at least one solution, rather than merely checking that every type occurs a multiple of three times.

This is not an optimal-move or human-speed proof. A player can make choices that fill the basket or complicate the board; free undo and rearrange provide recovery. Hints first look for a full solution when the basket is empty, then favor completing already held goods. If no immediate triple fits, the UI explains that stock is tucked away and points to recovery.

Early deliveries have 36 goods and six kinds. Later deliveries have 54 goods and gradually introduce more kinds, up to twelve. Item hit targets do not shrink as the number of kinds grows. The current progression broadens visual search and hidden-stock planning; it does not yet introduce mechanical obstacles.

## Ideas deliberately left for a playtest-led next iteration

Conveyors, locks, fragile goods, wildcards, category substitutions, and delivery interruptions can change the rules substantially. Category substitutions also complicate exact-three conservation; fragile objects and move bombs can undermine the requested cozy feel. They should enter as separately introduced puzzle variants only after direct playtesting of this core loop.

Whole-row slides belong to the other game and were excluded following the user’s clarification. Multiplayer, global leaderboards, accounts, a native App Store release, physical-device validation, and a fully decorated store simulation are not implemented. The current journal is modest progression, not an unlockable building system.

## Artwork

The original twelve-good atlas was created with one built-in imagegen request and integrated as clipped raster artwork. No competitor art or brand assets were reused. The atlas has a genuine alpha channel; nested SVG viewports only crop and display the original raster and do not redraw it.

- Saved atlas: `dist/assets/goods-atlas.png`
- Exact generation prompt: `docs/art-prompt.txt`
- Items: maple syrup, apple, milk, cheddar, coffee, blueberries, croissant, flowers, strawberry jam, mitten, honey, and sourdough.

All web research used free built-in search and fetch. Firecrawl pages fetched: **0**.
