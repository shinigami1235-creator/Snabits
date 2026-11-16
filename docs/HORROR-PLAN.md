# The horror series: wiring plan

This plan covers how the ten horror Snabits turn up in the game and how each one joins a ranch. The drawings are done and on the batch-horror branch (`docs/art/horror-group1.png` to `horror-group3.png`). The other chat is doing their moves and animations, so this plan leaves those out. Everything here is a proposal until Gid OKs it, and the questions at the end are the calls he still needs to make.

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

The horrors are late game and they're the only Snabits that can't be scanned. The ancient people painted every other special onto a Pattern Stone, but they never painted these, so no colour calls them. A horror only joins a ranch that has followed its myth to the end and beaten it in its lair.

**The Deep Rift.** A team expedition past the Rift's edge, built on `deep.js`. It opens at grade A, once the Rift's edge map has been crossed, the same week Walt takes the player in (story step 9). It has three rings, and each one opens later than the last:

- **The Outer Ring** opens at grade A and holds five lairs.
- **The Middle Ring** opens at grade S and holds three lairs.
- **The Heart** opens after the Legend Cup and holds the last two. This is the expedition into the Rift's heart from story step 12.

**Tears in the hard places.** From grade A, the deep map of each region in the table can show a tear: a crack in the air on one wild circle. A tear holds that region's horror at Byte. A tear shows up about one season in four, in a different circle each time, so seeing one is a chance and never a sure thing. Beating it leaves the first part of its myth behind and sends it back through the tear. Losing sends it back through the tear too, and the tear stays open for the rest of that expedition.

## Each one's myth

Every horror has a myth told in three parts, kept in a new Myths tab in the Journal, next to Helena's pages. The first part comes from its tear. The second comes from somewhere in town or on the ranch. The third waits at the door of its lair. Once all three are found, the lair opens and the horror waits inside at Mega.

**Ghoul: the Diggers.** People say you should leave a bone on a grave at Hollow Moor so the diggers leave the rest alone. The diggers are polite and keep to their tunnels, and some of them used to be people who stayed underground too long. Part two is a bone left on the barn step one morning with a thank-you note scratched into it.

**Nightgaunt: the Ones Who Tickle.** Children who wander on Dream Garden at night are carried off by something with no face and dropped home at dawn, giggling and unable to say why. The Nightgaunts can't talk, so tickling is the only way they have to tell you something. Part two comes in a week when one of the ranch's Snabits won't stop giggling.

**Mi-Go: the Pink Lights.** Hikers on Granite Steps see pink lights over the peaks, and a Snabit that wanders up there comes back knowing a move nobody taught it. The Mi-Go keep what they learn in jars, and they're always looking for something new to learn. Part two is a jar left at Dr. Ines's lab with a note asking for her notes in return.

**Dagon: the Fisherman's Friend.** The fishing boats off Coral Shallows always come home full, and the old fishers won't say who they thank for it. The Deep One under the steps gives a good catch for a song and comes up to listen when one is sung. Part two comes from the Harvest Fair, where an old fisher hums the song.

**Shub: the Goat with a Thousand Kids.** In Tanglewood, goats wander off and come back with more kids than any goat could have, and the trees there grow in rings. All of them are hers, and she remembers every one of their birthdays. Part two comes in the spring week when a stray kid turns up at the ranch and goes home on its own.

**Gug: the Giants Below.** Under Cinder Peak is a door so big it reads as a cliff, and something on the other side knocks on it every hundred years. The Gugs were shut below the world by the ancient people, and the Ghouls keep the tunnels to the door so the Gugs can't come up. Part two is the knock itself, heard in the barn on a heatwave week.

**Shoggoth: the Servant That Forgot.** The ancient people made a helper out of living goo that could take any shape their work needed. When they left, it stayed, and it still copies whatever shape it last saw, which is why it has so many eyes. Part two is a mess in the Workshop that cleans itself up overnight. Shoggoth also answers one of the open Holes, since it's the first thing in the game that saw the ancient people.

**Hastur: the King in Yellow.** There's a play nobody has read to the end, since everyone who tries falls asleep at the third act. A figure in a yellow cloak buys a seat at every performance and never stays to the end either. Part two is a ticket in the Town Hall's lost and found, for a seat that doesn't exist. Anywhere the game would write his name a third time in one place, it shows a blank.

**Yog-Sothoth: the Gate.** Every door has the same thing on the other side of it if you open it the right way. Yog-Sothoth is that thing, and the Rift is the biggest door it knows about. Its first part comes from the Tower in place of a tear, as a door on floor 60 that wasn't there the week before. Part two is the bestiary at 150 kinds seen, when Dr. Ines finds every page has the same globe drawn faintly in the corner.

**Cthulhu: the Sleeper.** Under the sea past the Rift lies a city, and the thing asleep in it dreams loud enough for Snabits to hear. Every special called through Helena's lens makes the dream louder, which is the signal Dr. Ines has been measuring. Cthulhu has no tear. Its first two parts come as dreams on the ranch, in a nightmare week that happens once the ranch has called fifteen specials and again at thirty. This ties it to the open Hole about whether the ending changes with how many specials the player called.

## Joining the ranch

- **The lair fight:** the horror at Mega against the team, tag-team style as on any deep map, but nobody is let back in at camp. A lair can be tried once a season.
- **Losing:** the team goes home with everything it found, and all three come back with extra stress.
- **Winning:** the horror goes back through the Rift, and a little one stays behind and follows the ranch home at Bit. It's the only way to get one, so each save gets one of each unless Gid says fusion can pass a horror family on (see the questions).
- **The Secrets tab:** a new Horrors row after the specials, with ten hints that show ??? until the myth's first part is found.

## What this chat builds

- `FAMILY` entries in `monster.js` with stats and abilities. Ability ideas are below and need Gid's OK.
- The Deep Rift in `deep.js`, with its three rings and ten lairs, plus tears on the deep maps of the eight regions.
- The Myths tab in the Journal, and the town and ranch hooks for each myth's second part (`events.js`, `ranch.js`, `lab.js`, `tower.js`, `hall.js`, `dex.js`).
- Cries, sizes, evolution totals and Secrets tiles, the same as for the specials.
- Tests: a run through each myth, each lair fight, the tear rate, and a check that no scan can give a horror.
- The canon in `STORY/WORLD.md` and `STORY/REGISTRY.md`, marked Proposed until Gid OKs it.

The other chat builds their moves, signature skills, arena animations and entrances. Balance comes last, once their moves are in, since `sim2.py` needs them.

## Ability ideas

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

## Questions for Gid

1. Does a horror join at Bit after its lair, or at Mega?
2. One of each per save, or can fusion pass a horror family on to a child?
3. Is the Deep Rift's opening right: Outer Ring at A, Middle Ring at S, the Heart after the Legend Cup?
4. Can the Shoggoth myth say the ancient people made it, which answers part of one of the Holes?
5. Are the ability ideas OK to build?
