# A little calm. A real puzzle.

September 13, 2026. This revision changes the default interaction in response to the request for a harder game where matches happen on shelves and unlock other stock. It supersedes the original tap-to-basket decision; the five original modes remain available with their saves intact.

## What the reference games contribute

These games have confusingly similar names, so their controls should not be treated as interchangeable.

- [Goods Sort — Triple Master 3D, official App Store listing](https://apps.apple.com/us/app/goods-sort-triple-master-3d/id1658958534) describes tapping three identical goods from shelves with level timers. Reviews discuss making room, moving goods to expose stock, and frustrations with time pressure and paid help. Those reviews are individual reports, not verified defects in every current version.
- [Good Sort — Match, VacuumGames, official App Store listing](https://apps.apple.com/nz/app/good-sort-match/id6749694655) describes moving entire rows or columns, gathering adjacent identical goods on a shelf, and clearing triples. That sliding mechanic is different from moving one good at a time.
- [Goods Sort 3D browser rules](https://www.culinaryschools.org/kids-games/goods-sort-3d/) describe three-slot shelf matching, dark stock behind the front row, and glass restrictions opened by matches. The instructions explicitly warn about running out of working space. This is the closest reference for the new shelf interaction.
- [Goods Sort Match, GamoVation, official Google Play listing](https://play.google.com/store/apps/details?hl=en_US&id=com.hypervation.goodssort) describes dragging goods to shelf slots to match triples. A July 22, 2026 review says later hard levels mostly take longer, and the developer acknowledges the repetition feedback. A May 26 review values untimed play. These are useful design signals, not a representative survey.

The design inference: the satisfying work is choosing which goods to park, which stock to reveal, and which match creates useful space. A shrinking timer adds urgency, but it does not create those choices. More items can simply lengthen a scanning task. The new mode therefore concentrates on space and dependencies while staying untimed. It uses original Burlington goods and artwork, without reproducing a competitor's levels, code, or interface.

## Why the old version felt too easy

The original `makeShelves` generator in `dist/engine.js` only accepts a board that `planClear` can solve by repeatedly taking a complete visible triple. Its full-clear guarantee intentionally filters out the need to park unmatched goods to uncover the next match. Raising item counts retains that shortcut.

The new campaign uses a different rules engine and stored, executable solutions. A legal move transfers one good to an empty slot on another unlocked shelf. All three slots containing the same good clear on that shelf. There is no external basket.

## Decisions that now matter

1. **Protect your space.** Start with four or five open slots distributed among shelves. Filling them carelessly can leave no legal move.
2. **Plan the reveal.** An emptied front row immediately brings the next row forward. Moving a last obstructing good can consume more space than it releases. Free stock notes show every row in order so this is a planning problem, not a guessing tax.
3. **Make the key match.** A locked shelf requires a specific kind of triple on an open shelf. An unrelated match will not open it. From puzzle 101 there are two keyed shelves; from 201 there are eight shelves, additional goods, and more stock.
4. **Find a shorter route.** Earn one star for clearing, one for no hints, and one for meeting the displayed move target. Undo is free and rewinds the move count. Hints stay recorded after undo. Targets are known complete solutions, not claims of mathematical optimality.

The opening board has a target of 30 moves. A breadth-first check proves that no match is possible before move four. All 600 opening layouts reject a one-move match, and each stored route is replayed in tests to a complete clear. This validates solvability and a harder opening constraint; it does not establish a perfectly monotonic human difficulty curve or guarantee every arbitrary move remains recoverable.

## Fair recovery and feedback

Tap a good and then an empty slot, or drag between shelves. Sources and legal destinations are highlighted; matches animate in place. Empty-slot and locked-shelf buttons explain their rules. Peek is free. There are no paid recoveries, shuffle shortcuts, or timer in this mode. Undo or restart can recover a blocked board.

A hint first checks the known solution for the current board. Otherwise, a bounded search runs in a browser worker so the interface remains responsive. A successful hint highlights a source and destination and explains whether it clears, unlocks, reveals, or parks stock. A failed search is described as a failure to find a route, not proof that the board is impossible. Board changes cancel pending hints.

## Campaign, progress, and generation

The campaign adds **600 distinct shelf puzzles** across the existing 12 themed chapters. The **600 original Basket Trail levels** remain separate, alongside Cozy, Daily, Rush, and Grand Pantry: six modes in total. Collection and shop rewards remain shared; shelf medals and classic Trail medals are separate. Version-3 profiles preserve version-1/2 totals and unfinished basket games, then introduce existing players to the new default once.

`dist/shelf-catalog.js` stores all layouts and complete routes. The generator uses seeded candidates, small free-space budgets, keyed gates, a required setup-move constraint, and bounded complete-clear search. To regenerate from the repository root:

```sh
node scripts/generate-shelf-puzzles.mjs 10
node scripts/build-shelf-catalog.mjs
npm test
```

Generation is an offline development task and can take several minutes. Players load the already checked catalog; generation does not run during play. Replacing the catalog would change saved puzzle identities, so existing released IDs should be treated as stable for future content updates.

See [validation](validation.md) for automated, browser, responsive, and deployment evidence. Physical-phone controls and individual difficulty preferences still benefit from real-device playtesting.
