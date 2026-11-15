# Snabits batch plan, 16 Nov 2026

Two chats build the next 40 families at the same time. Chat A makes the 10 commons and 10 uncommons, and Chat B makes the 20 specials. Each chat works on its own branch and never pushes to main, since both edit the same family lists. Chat A merges both branches into main at the end.

| | Chat A: regular | Chat B: specials |
|---|---|---|
| Families | 10 common, 10 uncommon | 20 special |
| Branch | `batch-regular` | `batch-specials` |
| Where its code goes | after the Burr entries in each list | after the Jack entries in each list |
| Scans | a new scan layer for the commons, unlocks for the uncommons | a colour egg and a Pattern Stone for each special |

## How each chat works

Gid, 16 Nov 2026: a Mega is a new form, never the Byte made bigger with a few effects added. Wick turns into a candelabra, Lumo into a firefly queen on a lantern, Snooze into a floating dream cloud, and Cobble into a geode with stones orbiting it.


1. Draw the families in `chibi.js` in groups of 5, with Bit, Byte and Mega looking clearly different.
2. Show Gid a sheet of the group for his OK before wiring anything, since he wants stills before big art builds.
3. Wire each approved group: `FAMILY` stats and ability, `FAM_MOVES` (8 moves at Lv 1, 3, 5, 8, 14, 20, 30, 40), a signature skill in `SKILLS` and `FAMILY_SIG`, `AR_KIND` animations, `FAM_WALK`, `AR_FAM_DMG`, `AT_FAMCOL`, `CHIBI_FAMS`, `SIZE_CM`, the cry, the `ENTER` entrance, `EVO_TOTAL` and the dex.
4. Check every move name against `SKILLS` and against the other chat's names below.
5. Run `tools/tests/arena/sim2.py` and tune `AR_FAM_DMG` and base stats until every family wins 44% to 55%.
6. Run the tests in `tools/tests` and `node tools/lint-strings.mjs`, update `STORY/WORLD.md` and `STORY/REGISTRY.md`, and push to the chat's branch.

Rules that hold for both: Gid's writing style in every string, no line in the game says how anything unlocks, characters never explain rules, Pattern Stones are abstract designs, and Opus runs the main thread.

## Chat A: 10 commons

These come from scans from the start. They need a new scan layer, so the share of the first eight families doesn't drop by much. The plan is to read how light the main colour is: very dark photos give one group of five and very pale photos give the other. Chat A tunes the cut-offs so each group lands on about 1 scan in 12.

| Family | What it is | Scan group | Ability idea |
|---|---|---|---|
| Wick | a candle stub with a flame for hair | dark | Short Fuse: Power up 1 step under half HP |
| Lumo | a firefly with a glowing tail | dark | Flicker: 1 hit in 10 on it misses |
| Snooze | a sleepy pillow with a nightcap | dark | Nap: heals 3% when it hasn't moved for 2 s |
| Inky | an ink blot with a pen nib | dark | Smudge: its Casts have a 15% chance to Blind |
| Cobble | a little pile of pebbles | dark | Rock Shed: Constitution up 2 steps the first time it drops under half HP |
| Nimbo | a small rain cloud | pale | Drizzle: its Casts have a 15% chance to Soak |
| Dango | three dumplings on a stick | pale | Stack: each hit it takes makes the next ones 3% softer, up to 9% |
| Oaklet | an acorn with a leaf cap | pale | Sprout: once a fight, under 30% HP, heals 20% |
| Roly | a pill bug that rolls into a ball | pale | Roll Up: under half HP, Close Strikes hit it 25% softer |
| Trundle | a snail with a spiral shell | pale | Slow and Sure: its hit chance can't be lowered, and Root can't land on it |

## Chat A: 10 uncommons

These are registered families. Each opens a different way, and nothing in the game says how. `LICENCE` needs a grade for each.

| Family | What it is | Grade | Opens when | Ability idea |
|---|---|---|---|---|
| Clank | a tin wind-up robot | C | the ranch reaches the far end of the Iron Foundry map | Wind-Up Key: Speed up 1 step every 10 s |
| Crease | an origami crane | D | the fan mail week event comes | Paper Fold: Close Strikes hit it 15% softer |
| Twiglet | a bonsai in a pot | B | a Snabit has its second birthday on the ranch | Deep Roots: can't be pushed back |
| Swirl | a snow globe | C | a Snow week at grade C or higher | Shaken: its Casts have a 15% chance to Daze |
| Ditty | a music box with a dancer on top | D | the first trade with a friend | Lullaby: the opponent's focus fills 10% slower |
| Sizzle | a toaster | C | the ranch buys the Kitchen upgrade | Pop Up: its first hit each fight can't miss |
| Aero | a kite with a ribbon tail | B | floor 10 of the Tower | Tailwind: walks 20% faster |
| Nesta | a nesting doll | B | the first fusion in Dr. Ines's lab | Inner Doll: once a fight, a hit that would knock it out leaves it at 1 HP |
| Magna | a horseshoe magnet | A | the ranch beats the Drifter | Pull: its Strikes pull the target 10 closer |
| Helm | a brass diving helmet | B | 100 kinds seen in the bestiary | Pressure: Tide moves hit it 25% softer |

## Chat B: 20 specials

Each needs a colour egg in `eggOf` that can't overlap the costumes or the ten specials already in, and an abstract Pattern Stone in `stoneGlyph` that scans to it. A test like the one from 15 Nov draws every stone full screen and checks each scans to its own special. The 14 region slots are free maps today. The 6 other places are new and wait for Gid's yes.

| Special | Stone found at | Look | Ability idea |
|---|---|---|---|
| Tengu | Saffron Dojo | a long-nosed mountain spirit with a leaf fan | Gust: its Casts push 30% harder |
| Tanuki | Tanglewood | a round raccoon dog with a leaf on its head | Trick Leaf: the first hit on it each fight misses |
| Mermaid | Coral Shallows | a fish-tailed Snabit with a shell crown | Siren: its Casts have a 20% chance to Daze |
| Diwata | Dream Garden | a forest fairy with flower wings | Blessing: heals 1% every 2 s |
| Sphinx | Granite Steps | a lion body with a head cloth | Riddle: Mind moves hit it 20% softer |
| Garuda | Dawn Temple | a gold eagle-man with red wings | Sky King: can't be Rooted, and its Dash moves cross the field 30% faster |
| Werewolf | Hollow Moor | a wolf-kid with a torn shirt | Full Moon: Power up 2 steps under 40% HP, once |
| Minotaur | Iron Foundry | a bull with a nose ring and an axe | Charge: Dash moves hit 20% harder |
| Dragon | Cinder Peak, deep map | a winged dragon with horns | Dragon Scale: Blaze and Frost hit it 20% softer |
| Thunderbird | Static Plains, deep map | a huge bird with lightning wings | Storm Call: its hits have a 15% chance to Shock |
| Hydra | Nightshade Marsh, deep map | a three-headed serpent | Regrowth: once a fight, heals 25% at half HP |
| Griffin | Glacier Rim, deep map | an eagle head on a lion body | Swoop: Far moves hit 15% harder |
| Kirin | Saffron Dojo, deep map | a scaled deer with one horn and flame hooves | Pure Step: can't be Poisoned or Cursed |
| Salamander | Iron Foundry, deep map | a fire lizard with a flame tail | Heat Up: Power up 1 step each time it's hit by Blaze |
| Bakunawa | the Rift's edge | a sea serpent that swallows the moon | Eclipse: Light moves hit it 30% softer |
| Cerberus | Tower, floor 25 | a three-headed guard dog | Three Bites: its Close Strikes hit twice for 60% each |
| Djinn | Tower, floor 50 | a genie from a lamp | Three Wishes: the first three Casts it's hit by do 50% less |
| Troll | wins the Northreach Invitational | a mossy bridge troll with a club | Thick Hide: crits can't land on it |
| Mummy | the first Snabit retired to the Hall of Fame | a wrapped Snabit with one eye showing | Undying: once a fight, comes back with 10% HP |
| Sarimanok | the Harvest Fair at grade B | a rooster with rainbow tail feathers and a fish in its beak | Good Omen: crit chance up 10% |

## Names

None of the 40 names repeats a family already in the game. Commons and uncommons start with different sounds from each other, except Trundle and Twiglet, and Swirl and Sizzle, whose first sounds stay apart when said aloud. A chat that wants a new name checks this list and the families in `chibi.js` first.

## Merging

When both branches pass their tests, Chat A merges `batch-specials` into `batch-regular`, sorts out the conflicts in the shared lists (both chats add lines to the same tables), reruns `sim2.py` with all 71 families, then merges into main and pushes.
