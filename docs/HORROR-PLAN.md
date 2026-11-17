# The horror series: wiring plan

This plan covers how the ten horror Snabits turn up in the game and how each one joins a ranch. The horror chat designed them and drew them (`docs/art/horror-group1.png` to `horror-group3.png`). The main chat wires everything into the game on the batch-horror branch: moves, animations, entrances, the Deep Rift, the myths and the fights. Gid OKed the plan and made the open calls on 16 and 17 Nov 2026, listed under his decisions near the end.

## The ten

| Code name | Shown as | Where its myth starts | Its lair in the Deep Rift |
|---|---|---|---|
| Ghoul | Ghoul | deep Hollow Moor | the Burrows (Outer Ring) |
| Nightgaunt | Nightgaunt | deep Dream Garden | the Night Cliffs (Outer Ring) |
| Migo | Mi-Go | deep Granite Steps | the Humming Mine (Outer Ring) |
| Dagon | Dagon | deep Coral Shallows | the Drowned Steps (Outer Ring) |
| Shub | Shub-Niggurath | deep Tanglewood | the Thousand Grove (Outer Ring) |
| Gug | Gug | deep Cinder Peak | the Sealed Gate (Middle Ring) |
| Shoggoth | Shoggoth | deep Iron Foundry | the Empty Workshop (Middle Ring) |
| Hastur | Hastur | deep Static Plains | the Yellow Stage (Middle Ring) |
| Yog | Yog-Sothoth | the Tower | the Gate (the Heart) |
| Cthulhu | Cthulhu | the ranch, in dreams | the Sunken City (the Heart) |

## Where they turn up

The horrors are late game. The first of each joins a ranch that has followed its myth to the end and beaten it in its lair. After that, it can only come back through its Pattern Stone (see Stones and the witching hour).

**The Deep Rift.** A team expedition past the Rift's edge, built on `deep.js`. It opens at grade A, once the Rift's edge map has been crossed, the same week Walt takes the player in (story step 9). It has three rings, and each one opens later than the last:

- **The Outer Ring** opens at grade A and holds five lairs.
- **The Middle Ring** opens at grade S and holds three lairs.
- **The Heart** opens after the Legend Cup and holds the last two. This is the expedition into the Rift's heart from story step 12.

**Tears in the hard places.** From grade A, the deep map of each region in the table can show a tear: a crack in the air on one wild circle. A tear holds that region's horror at Byte. A tear shows up about one season in four, in a different circle each time, so seeing one is a chance and never a sure thing. Beating it leaves the first part of its myth behind and sends it back through the tear. Losing sends it back through the tear too, and the tear stays open for the rest of that expedition.

## Each one's myth

Every horror has a myth told in three parts, kept in a new Myths tab in the Journal, next to Helena's pages. The first part comes from its tear. The second comes from somewhere in town or on the ranch. The third waits at the door of its lair. Once all three are found, the lair opens and the horror waits inside at Mega.

**Ghoul: the Diggers.** People say you should leave a bone on a grave at Hollow Moor so the diggers leave the rest alone. The diggers keep to their tunnels and settle everything with a wrestle, the way people shake hands, and some of them used to be people who stayed underground too long. Part two is a bone left on the barn step one morning with a thank-you note scratched into it.

**Nightgaunt: the Ones Who Tickle.** Children who wander on Dream Garden at night are carried off by something with no face and dropped home at dawn, giggling and unable to say why. The Nightgaunts can't talk, so tickling is the only way they have to tell you something. Part two comes in a week when one of the ranch's Snabits won't stop giggling.

**Mi-Go: the Pink Lights.** Hikers on Granite Steps see pink lights over the peaks, and a Snabit that wanders up there comes back knowing a move nobody taught it. The Mi-Go keep what they learn in jars, and they're always looking for something new to learn. Part two is a jar left at Dr. Ines's lab with a note asking for her notes in return.

**Dagon: the Fisherman's Friend.** The fishing boats off Coral Shallows always come home full, and the old fishers won't say who they thank for it. The Deep One under the steps gives a good catch for a song and chases off anyone who comes to the water without one. Part two comes from the Harvest Fair, where an old fisher hums the song.

**Shub: the Goat with a Thousand Kids.** In Tanglewood, goats wander off and come back with more kids than any goat could have, and the trees there grow in rings where her kids sleep. All of them are hers. Part two comes in the spring week when a stray kid turns up at the ranch and goes home on its own.

**Gug: the Giants Below.** Under Cinder Peak is a door so big it reads as a cliff, and something on the other side knocks on it every hundred years. The Gugs were shut below the world by the ancient people, and the Ghouls keep the tunnels to the door so the Gugs can't come up. This year the knocks run out, and the Ghouls ask the ranch for help. Part two is the knock itself, heard in the barn on a heatwave week.

**Shoggoth: the Servant That Forgot.** The ancient people made a helper out of living goo that could take any shape their work needed. When they left, it stayed, and it still copies whatever shape it last saw, which is why it has so many eyes. It guards their tools, since they're the last thing it remembers. Part two is a mess in the Workshop that cleans itself up overnight. Shoggoth also answers one of the open Holes, since it's the first thing in the game that saw the ancient people.

**Hastur: the King in Yellow.** There's a play nobody has read to the end, since everyone who tries falls asleep at the third act. A figure in a yellow cloak buys a seat at every performance and never stays to the end either. Part two is a ticket in the Town Hall's lost and found, for a seat that doesn't exist. Anywhere the game would write his name a third time in one place, it shows a blank.

**Yog-Sothoth: the Gate.** Every door has the same thing on the other side of it if you open it the right way. Yog-Sothoth is that thing, it tests whoever wants through, and the Rift is the biggest door it knows about. Its first part comes from the Tower in place of a tear, as a door on floor 60 that wasn't there the week before. Part two is the bestiary at 150 kinds seen, when Dr. Ines finds every page has the same globe drawn faintly in the corner.

**Cthulhu: the Sleeper.** Under the sea past the Rift lies a city, and the thing asleep in it dreams loud enough for Snabits to hear. Every special called through Helena's lens makes the dream louder, which is the signal Dr. Ines has been measuring. Cthulhu has no tear. Its first two parts come as dreams on the ranch, in a nightmare week that happens once the ranch has called fifteen specials and again at thirty. This ties it to the open Hole about whether the ending changes with how many specials the player called.

## Why each one fights (Gid, 17 Nov 2026)

Most of the horrors are friendly, so no fight happens just because the team ran into one. Each one has a reason from its myth, shown as the fight's banner, and Walt says it before the fight. The Gug is the only hostile one, which makes it the fight with real stakes. The reasons live in `HORROR_WHY` in `horror.js`.

| Horror | Banner | At its tear | In its lair | Why a little one follows |
|---|---|---|---|---|
| Ghoul | A game | it wrestles the lead Snabit as a hello | the bout for a seat at its feast | a young digger wants to see the surface |
| Nightgaunt | Afraid | it grabs the lead Snabit, sure it's a lost child to carry home | it tries again, and winning shows it the Snabit's home is the ranch | it decides the ranch is where Snabits go home |
| Mi-Go | Curious | it wants to see the lead Snabit's moves | it trades one of its jars for a full fight | it's sent along to keep learning |
| Dagon | On guard | nobody sang, so it thinks the team came to steal from the fishers | it tests whether the team will keep the fishers' secret | it keeps an eye on that promise |
| Shub-Niggurath | On guard | the team walked into the ring where her kids sleep | her kids play-fight and she sees how the team plays with them | one of her kids chooses to follow, and she lets it go |
| Gug | Hostile | it's pushing up through the tear and has to be held back | the Ghouls ask for help putting it back below the Sealed Gate | a young Gug got through before the gate shut and can't go back |
| Shoggoth | Afraid | it copies the lead Snabit's fighting stance and fights back | it guards its makers' tools | a bit of goo copied the lead Snabit and won't leave it |
| Hastur | The play | it needs a partner for the first act | the third act nobody has seen to the end, and finishing it lets people stay awake for the play | its understudy follows |
| Yog-Sothoth | A test | no tear: the door on the Tower's floor 60 | the Gate tests whoever wants through | a globe slips through when the Gate opens |
| Cthulhu | A dream | no tear: the nightmare weeks | the fight happens inside its dream, and winning quiets it, so Dr. Ines's signal drops | a piece of the dream stays behind |

## Joining the ranch

- **The lair fight:** the horror at Mega against the team, tag-team style as on any deep map, but nobody is let back in at camp. A lair can be tried once a season.
- **Losing:** the team goes home with everything it found, and all three come back with extra stress.
- **Winning:** the horror goes back through the Rift, and a little one stays behind and follows the ranch home at Bit (Gid). Its lair stays open for a rematch each season, though only the first win sends a little one home.
- **Fusion:** a child fused from a horror can come out as the same horror family (Gid). Fusion uses up both parents, so the ranch still has only one.
- **One at a time (Gid):** a ranch can hold one horror at once, counting the Freezer. While it has one, a lair win sends no little one home and a horror's stone scan gives a regular Snabit.

## Stones and the witching hour (Gid, 16 Nov 2026)

- **Leaving:** a horror that reaches the end of its lifespan outside the Freezer doesn't retire. A week event plays instead, and it vanishes or flies off into the night, leaving its Pattern Stone behind on the ranch. A horror retired to the Hall of Fame gets a statue like any Snabit, and after 4 weeks the statue is gone and its stone sits on the empty plinth.
- **The stone:** abstract like every other Pattern Stone, drawn in the horror's colours, so it hints at the colour combination that calls it. Each one needs its own colour egg in `eggOf`, tested against the costumes, the specials and the clutter pictures the same way.
- **Calling it back:** once its stone is on the ranch, a scan that matches the stone, with the stone's colours filling the middle of the shot, calls the horror at Bit. It only works between 9pm and 3am on the phone's own clock, and only while the ranch has no other horror. Outside those hours the same scan gives a regular Snabit.
- **The clues stay vague:** nothing in the game names the hours or the colours. The stone's Secrets hint and a few lines around the ranch point at them, such as a line about the hour when the town is asleep and the lamps are out, or a hint at the colours read off the stone. Every line goes past Gid first.
- **The Secrets tab:** a new Horrors row after the specials, with ten hints that show ??? until the myth's first part is found. Once a horror's stone is on the ranch, its hint becomes a vague clue to the colours and the hour.

## What gets built

- `FAMILY` entries in `monster.js` with stats and the abilities below.
- The Deep Rift in `deep.js`, with its three rings and ten lairs, plus tears on the deep maps of the eight regions.
- The Myths tab in the Journal, and the town and ranch hooks for each myth's second part (`events.js`, `ranch.js`, `lab.js`, `tower.js`, `hall.js`, `dex.js`).
- Cries, sizes, evolution totals and Secrets tiles, the same as for the specials.
- Tests: a run through each myth, each lair fight, the tear rate, and a check that no scan can give a horror.
- The canon in `STORY/WORLD.md` and `STORY/REGISTRY.md`, marked Proposed until Gid OKs it.

The moves, signature skills, arena animations and entrances are built in the main chat too, and balance came last, once the moves were in, since `sim2.py` needs them.

## Abilities (OKed by Gid)

| Family | Ability | What it does |
|---|---|---|
| Ghoul | Gnaw | Its Close Strikes heal it for 10% of the damage they do |
| Nightgaunt | Tickle | Its hits have a 20% chance to Daze |
| Migo | Brain Jar | Each Cast that hits it raises its Mind 1 step, up to three times a fight |
| Dagon | Deep Song | Tide moves hit 20% harder, and Soak heals it instead of hurting it |
| Shub | Thousand Young | The first time it would faint, a kid takes its place with 25% of its HP |
| Gug | Mountain | Knockback can't move it |
| Shoggoth | Mimic | It takes the foe's ability for the rest of the fight |
| Hastur | Yellow Sign | The foe starts every fight Cursed for 6 seconds |
| Yog | All Doors | Its swap moves cost nothing and it can't be Rooted |
| Cthulhu | Dreamer | Its hits have a 15% chance to Dread, and Dread lasts twice as long on its foes |

## Gid's decisions (16 and 17 Nov 2026)

1. A horror joins at Bit after its lair.
2. Fusion can pass a horror family on to a child.
3. The rings open as planned: the Outer Ring at A, the Middle Ring at S and the Heart after the Legend Cup.
4. The Shoggoth myth can say the ancient people made it.
5. The ten abilities are OK to build.
6. Horrors have Pattern Stones, and a ranch can hold one horror at a time.
7. A horror that reaches the end of its lifespan outside the Freezer vanishes or flies off in a week event and leaves its stone. A retired one's statue is gone after 4 weeks and leaves its stone on the plinth.
8. A stone scan calls its horror only between 9pm and 3am on the phone's clock, with vague clues to the hour and the colours.
9. Cthulhu has no mouth.
10. Most horrors are friendly, so each fight has a reason from its myth (17 Nov 2026): the Ghoul's wrestle is a game, the Nightgaunt and the Shoggoth are afraid, the Mi-Go is curious, the Dagon and Shub-Niggurath are on guard, the Gug is the only hostile one, Hastur's is a play, Yog-Sothoth's a test and Cthulhu's a dream. The reason shows as the fight's banner, and Walt's lines and the myths say it (`HORROR_WHY` in horror.js).

## Built (16 Nov 2026, batch-horror)

- `monster.js`: the ten `FAMILY` entries with their abilities, `HORROR_EGG`, `horrorEgg` and `horrorCall`. A stone scan calls its horror from 9pm to 3am on the phone's clock, with the stone on the ranch and no other horror there or in the Freezer.
- `arena.js` and `battle.js`: the ten abilities. Gnaw, Tickle, Brain Jar, Dreamer, Mimic, Yellow Sign, Thousand Young, Deep Song and All Doors work in both fights, and Mountain works on the arena, since the old turn battle has no knockback.
- `scenes.js`: `horrorGlyph`, the ten stones (`docs/art/horror-stones.png`).
- `horror.js`: the Deep Rift's rings and lairs, the tears, the myths and their second parts, the lair fights, leaving at the end of a lifespan, the statue that goes after 4 weeks, and the Secrets tab's Horrors row.
- `explore.js`: the ring buttons on the Expeditions screen, the Journal's Myths tab and the map icons for a tear and a lair.
- Cries, sizes, evolution totals, arena colours and ability effects for all ten.
- Tests: `tools/tests/audit/horrors.py` (hatching, abilities, stones, the hour) and `tools/tests/audit/rift.py` (rings, tears, a walk to the Ghoul's lair, the second parts, leaving and the Secrets row).
- Every myth line, Secrets hint, leaving line and Walt line waits on Gid's OK, in the review doc "Snabits horror lines for review".
- Moves, two signatures each, arena animations and balance are built (17 Nov 2026). Each horror has 16 moves, and the sim has all ten between 47% and 54%. Their summon entrances are built too (17 Nov 2026, `ENTER` in `summon.js`, `docs/art/horror-entrances.jpg`): each one comes out of something, like a grave mound, a black pool, a sealed gate or a yellow curtain.
- Why each one fights (17 Nov 2026): the banners, Walt's lines at every tear and lair, a reason for each little one, and six myth parts rewritten to set it up.
