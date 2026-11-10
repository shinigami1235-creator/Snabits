# Snabits

Snabits is a phone game where you point your camera at something and the colours in the photo hatch a pixel monster. It plays like Monster Rancher with photos in place of CDs: you raise the monster, train it, send it on missions and fight with it.

The full design lives in the [Snabits design doc](https://claude.ai/artifact/PMVvxgWxXbo37jP5CVrMZG).

## Prototype

Live: https://shinigami1235-creator.github.io/Snabits/prototype/

It covers build steps 1 and 2 from the design doc:

1. Scan to monster. The live camera reads the frame's colours, and a circle in the middle counts three times, so you aim it at what you want scanned. The scan picks the elements, the family, the parts and the stats, then hatches a Bit monster with its name, ability, personality and two starting skills.
2. Fight the computer. Pick 2 skills from the monster's pool at level 10, 20 or 30, then fight a random monster with the basic attack, Guard, energy, the element chart, statuses, fields and every ability.

The camera needs a phone browser with camera permission. "From gallery" loads a saved photo for testing.

## Files

| File | What it holds |
|---|---|
| `prototype/index.html` | Camera, colour scan rules and the monster card |
| `prototype/skills.js` | All 80 skills, skill pools and the one-line skill descriptions |
| `prototype/monster.js` | Families, sprite builder, names, stats, abilities and starting skills |
| `prototype/battle.js` | Fight rules: damage, element chart, energy, statuses, fields, skill mechanics, abilities and the computer's choices |
| `prototype/battle-ui.js` | The skill picker and the fight screen |
