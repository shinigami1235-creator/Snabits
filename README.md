# Snabits

Snabits is a phone game where you point your camera at something and the colours in the photo hatch a pixel monster. It plays like Monster Rancher with photos in place of CDs: you raise the monster, train it, send it on missions and fight with it.

The full design lives in the [Snabits design doc](https://claude.ai/artifact/PMVvxgWxXbo37jP5CVrMZG).

## Prototype

Live: https://shinigami1235-creator.github.io/Snabits/prototype/

It opens on a title screen. A new player sees a short intro, meets Tala in town, gets the Snaboscope (the phone's camera), scans 3 things, keeps 1 and walks it to the ranch. A returning player taps Continue and goes straight back to the ranch, since the save lives in the browser's local storage.

From there it plays like Monster Rancher 2: weekly drills and rests, feeding and care, praise and scolding, evolution from Bit to Byte to Mega, missions and skill trips played out on screen, MR2-style cups in a stadium, wild battles, the fusion lab, the town shops, friend battles in live rooms or by ghost code, and Team battle, a 6 on 6 mode for fully trained monsters.

The camera needs a phone browser with camera permission. "From gallery" loads a saved photo instead. Adding `#test` to the address skips the title screen, which the test scripts use.

## Files

| File | What it holds |
|---|---|
| `prototype/index.html` | Camera, colour scan rules, the result sheet and the Snaboscope screen |
| `prototype/ui.css` | Every screen's styles, including the laptop layout at the end |
| `prototype/onboard.js` | Title screen, intro scenes, the first-scan tutorial (scan 3, keep 1) and the walk to the ranch |
| `prototype/skills.js` | All skills, skill pools and the one-line skill descriptions |
| `prototype/monster.js` | Families, sprite builder, palettes from the photo, names, stats, abilities and starting skills |
| `prototype/battle.js` | Fight rules: damage, element chart, energy, statuses, fields, abilities, switching and the computer's choices |
| `prototype/battle-ui.js` | The skill picker and the fight screen |
| `prototype/team.js` | Team battle: 6 on 6 with switching, team picker and the computer's teams |
| `prototype/game.js` | The save, roster and Freezer, levels, grades, opponents, items and fight habits |
| `prototype/ranch.js` | The ranch: weeks, drills, care, feeding, reactions, aging, evolution looks and the ranch scene |
| `prototype/tala.js` | Tala's tips at the ranch |
| `prototype/errantry.js` | Region art and the on-screen tasks for missions and trips |
| `prototype/missions.js` | Missions: planning the stops, playing them out and the report |
| `prototype/trips.js` | Skill trips: 4 weeks in a region |
| `prototype/heavy.js` | Heavy drills |
| `prototype/tourney.js`, `prototype/venue.js` | Cups and the stadium screens |
| `prototype/wild.js` | Wild battles from a fresh scan |
| `prototype/lab.js` | Fusion and rebirth |
| `prototype/town.js` | Shops, worn and held items, and ranch upgrades |
| `prototype/netfight.js`, `prototype/ghost.js`, `prototype/peer.js` | Friend battles in live rooms (PeerJS) and ghost codes |
| `prototype/music.js` | Chiptune music for each screen |
| `prototype/version.js` | Version check and the Update bar |
