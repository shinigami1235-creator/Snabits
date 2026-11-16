# Snabits move rework plan, 16 Nov 2026

Every family gets its own set of moves, sized to the MR2 breed it's closest to, instead of the same 8-move template. Gid picked how it works on 16 Nov 2026: core moves come by level through growth, stronger ones only from specific errantries (and a chain's middle steps from fights), set sizes match MR2, a fused Snabit can learn a few marked moves from its other parent's family, and each element has a shared pool of moves that a Snabit can learn if its body fits. The MR2 counts come from the MR2 FAQ by KurasuSoratobu (v3.0, section D2), copied to `/tmp/mr2/mr2_techniques.json` in Claude's workspace.

## How a Snabit learns a move

| Way | Which moves | How |
|---|---|---|
| Level | the Basic and Hit moves, about a third of the set | learned through growth at set levels, the way all moves are now |
| Errantry | Heavy, Sharp and Withering moves, and the top step of each chain | the stronger moves are sought on specific errantries, the way MR2 does it (Gid, 16 Nov 2026). Each move is tied to one region in `errantry.js`, picked from what the move is: a fire breath at Cinder Peak, a heavy kick at Saffron Dojo, a sharp claw at Tanglewood. The Snabit needs the stat the move leans on and the step before it in its chain |
| Fight | the middle step of a chain | MR2 builds moves in chains (Jump Blow, then 2 Jump Blows, then 3 Jump Blows). Using a move in fights gives a chance to learn its next step, except a chain's top step, which only an errantry teaches |
| Signature | the family's own big move | learned by level as now. Each family's signature gets its own wind-up and a bespoke animation (see Animations) |

Element pool moves and fusion marks are learned on errantries too: element moves in that element's region, and a marked move from the other parent's family in the region its move belongs to.

Nothing in the game says how a move is learned. The ranch report just says it learned one.

## Shared family moves

Basic and Special moves belong to their family, and element moves are shared (Gid, 16 Nov 2026). Each family also marks 2 to 4 moves its body could pass on, with the body parts they need, the way MR2 lets a Pixie/Kato learn Phantom Claw. Any Snabit whose body has those parts can learn a marked move on the errantry that teaches it, and it needs more training for it than the family's own Snabits do. A fused Snabit has the parts of both parents. `FAM_BODY` in arena.js lists each family's parts: mouth, fangs, beak, arms, legs, claws, wings, tail, tentacles, horn, shell, trunk and round (a round body that rolls or flops).

## Element moves

Each of the 12 elements gets a pool of about 8 moves. Every move in a pool lists the body parts it needs (a mouth, arms, legs, tentacles, wings, a shell, or none for Casts), and every family lists the parts it has. A Snabit can learn the moves of its own element that its body fits, on errantries to its element's region. The first move keeping its element name, like Flame Bite, stays.

## The technique card

The Skills tab shows each move the MR2 way: its name, Strike or Cast, its category (Basic, Hit, Heavy, Sharp, Withering or Special), its focus cost, and Force, Hit%, Withering and Sharpness graded A to E, worked out from the move's numbers.

## Animations

How big the wind-up is depends on the move's category (Gid, 16 Nov 2026). A Basic or Hit move only rears back for a moment. A Heavy, Sharp or Withering move gathers its colour or element for under half a second. A Special winds up in its family's style at a smaller size, without the close-up. Element moves sort into the same tiers by the level they come at. A contact move uses the Snabit's own body (Gid, 16 Nov 2026): arms swing, push and punch, Squib, Kraken and Hydra reach with their own tentacles, arms or side heads, Plod swats and slams with its own trunk, and anything without the part leads with its whole body. Stabs with a horn, nose, spout or skewer are a thrust of the body or arm, not thrown spears. A projectile comes out of the part that makes it, like the water Plod sprays from its trunk. Chomp's bites come from its own mouth, which swells over the target for Crunch and Chomp Combo. Every signature plays as the full special: the long wind-up with the close-up, in one of 27 wind-up styles picked from what the family is (`AT_WIND` in arena-fx.js), then its own attack. Every signature also has its own attack, sound and reaction on the target. The 15 batch 4 attacks are in arena-fx.js, and the other 71 (16 Nov 2026) are in `arena-sigs.js` as `sg_` kinds, each with its sound in `KSND`. A signature always plays its own animation, Bunker Down, Curl Up and Phase Shift included. These signatures gained a status where the move called for one: Crunch, Claw Swipe and Feral Slash Crack; Static Screen, Attract and Thunder Wing Shock; Ink Jet and Prism Beam Blind; High Kick, Trunk Slam, Big Swing, Belly Drum and Bridge Smash Daze; Rain Shot Soak; Toast Pop, Garuda Dive, Wyrm Breath, Holy Flame and Flame Tail Burn; Avalanche Freeze; Many Heads Poison; Gate Fang Dread; Lamp Blast Curse.

| Wind-up | What it shows | Families |
|---|---|---|
| flame | a flame of light behind the body | Phoenix, Wick, Dragon, Salamander |
| steam | steam billows off the lid and spout, the whistle shrieks | Teep |
| heat | the toaster coils glow red-hot, heat ripples, smoke curls up | Sizzle |
| lava | lava-lamp blobs rise and wobble round it | Lava |
| storm | a storm cloud overhead drops lightning on it | Brolly, Nimbo, Thunderbird |
| signal | broadcast arcs from the antenna, static snow and scan lines | Antik |
| field | red and blue field lines with metal bits orbiting | Magna |
| vortex | wind rings spiral up with leaves and dust | Eagle, Crease, Aero, Vroom, Tengu, Garuda |
| quake | the ground cracks with light in the seams, rocks float up | Plod, Burr, Golem, Cobble, Roly, Troll |
| tide | water spirals up from a pool, with drops and bubbles | Pinch, Squib, Kraken, Helm, Bloop |
| bubbles | foam piles up round its feet, soap bubbles rise and pop | Suds |
| shadow | a dark pool and smoke tendrils, embers in its colour | Booly, Vampire, Jack, Cerberus, Inky |
| halo | rays fan out behind, a halo lights up, feathers fall | Lern, Unicorn, Kirin, Sarimanok |
| fireflies | a swarm of fireflies circles it, blinking brighter | Lumo |
| frost | ice spikes grow in a ring, snowflakes spiral in | Yeti, Swirl, Scoop |
| bloom | a flower opens behind, vines climb, petals swirl | Oaklet, Twiglet, Pina, Diwata |
| spores | mushrooms pop up in a ring, glowing spores drift off its cap | Puff |
| sigil | a magic circle turns underfoot, runes rise | Moko, Tome, Presto, Sphinx, Mummy |
| web | a web spins out behind it strand by strand, dew glints on it | Skit |
| fury | a spiky battle aura, speed lines, dust kicked up | Chomp, Stilt, Bipped, Mitt, Spine, Sox, Pogo, Minotaur |
| gears | clockwork behind, a wind-up key spins, steam and sparks | Tock, Clank, Yoyo |
| lens | an aperture iris turns behind it, focus brackets close in | Shutter |
| toxic | a bubbling pool, rising bubbles that pop, drips | Fizz, Naga, Glop, Trundle, Hydra |
| sweet | a candy swirl, orbiting sprinkles, hearts | Dango, Nesta, Cuppy, Gumball |
| melody | sound rings under a wavy staff, notes spiral up | Flit, Ditty, Tanuki, Mermaid |
| moon | a moon rises behind in silver mist, stars twinkle | Kitsune, Snooze, Werewolf, Bakunawa |
| gold | gold light, orbiting coins, glints | Jingle, Djinn, Griffin |

The body moves with its wind-up: it floats up for storm, field, vortex, halo, sigil, melody, moon, gold, bubbles, fireflies and lava, digs in and shakes for quake and fury, flickers for shadow, jitters for signal and rattles for gears and steam.

Root takes its look from whoever put it on: Kraken's tentacles, Naga's coils, Mummy's bandages and Skit's silk, and otherwise the binder's main element. Wild binds with vines, Tide with water rings, Shade and Void with shadow, Steel with chains, Stone with rock shackles, Frost with ice cuffs, Blaze with a fire rope, Spark with crackling bands, Venom with dripping goo, Light with rings of light, Charm with ribbons and Brawl with rope. Any other element binds with bands in the binder's body colour. The status chip, the floating label and the tint on the body take the same colour.

## Chomp, written out in full

Chomp follows MR2's Gaboo move for move: 17 moves, the same mix of categories and ranges, with Gaboo's chops and kicks turned into bites, since Chomp is mostly mouth. Its 8 moves today stay in the set. Rows use the arena's numbers: damage, accuracy, sharpness, withering, push and focus cost.

| Move | From Gaboo | Category | Range | Damage / Acc | Cost | How it's learned |
|---|---|---|---|---|---|---|
| Bite | Slap | Basic | Close | 24 / 85 | 10 | level 1 |
| Nibble | Chop | Basic | Near | 22 / 88 | 11 | level 2 |
| Lunge | Long Punch | Hit | Near | 35 / 75 | 16 | level 3 |
| Crunch | (signature) | Special | Close | 64 / 70, Crack | 30 | level 5 |
| Rolling Bite | Rolling Chop | Basic | Near | 34 / 80 | 19 | level 6, then Bite leads to it |
| Leapfrog Bite | | Basic | Close | 20 / 70, swaps sides | 14 | level 8 |
| Tooth Shot | Long Punch | Hit | Far | 26 / 92 | 18 | level 10 |
| Chatter | Shock Wave | Hit | Near | 24 / 94, push | 17 | level 12 |
| Body Slam | Back Blow | Heavy | Close | 46 / 70 | 26 | errantry, Granite Steps |
| Jaw Lock | | Withering | Close | 25 / 80, holds | 20 | errantry, Hollow Moor |
| Big Gulp | Kiss | Withering | Mid | 18 / 82, drains focus | 16 | errantry, Dream Garden, needs Mind |
| Drool | Spit | Withering | Far | 26 / 72, Poison | 24 | errantry, Nightshade Marsh, needs Mind |
| Belly Flop | Diving Press | Sharp | Close | 34 / 80, high crit | 18 | errantry, Saffron Dojo, after Body Slam |
| Jaw Drop | Jumping Chop | Sharp | Far | 40 / 72, high crit | 28 | errantry, Granite Steps |
| Charge | Electric Blow | Heavy | Mid | 60 / 65 | 34 | errantry, Saffron Dojo, needs Power |
| Gnash | Ninja Kick | Special | Close | 15 x4 / 80 | 38 | errantry, Hollow Moor |
| Chomp Combo | Chop Combo | Special | Close | 70 / 86 | 40 | errantry, Saffron Dojo, top of the Bite chain, needs Power |

Chains: Bite, then Rolling Bite, then Chomp Combo. Body Slam, then Belly Flop. Lunge, then Charge.

Shared: Jaw Lock and Tooth Shot to any Snabit with fangs, Belly Flop to any with a round body.

Built 16 Nov 2026. A Chomp that already had Body Slam, Jaw Lock, Charge or Gnash by level keeps it. Each new move has its own animation and sound in `arena-moves.js`, and the sim has Chomp at 51%.

## Families and their MR2 breeds

86 families, 1421 moves in all (688 now).

| Family | Closest MR2 breed | Why | Moves |
|---|---|---|---|
| Chomp | Gaboo | a round biter that's mostly mouth | 17 |
| Squib | Jell | a squid on tentacles that squirts ink | 20 |
| Antik | Henger | an old TV robot with antennae | 20 |
| Moko | Suezo | one big eye on stubby roots | 12 |
| Pinch | Arrow Head | a crab with claws and a shell | 24 |
| Stilt | Hopper | long jointed legs that kick | 13 |
| Skit | Kato | a quick spider with a sneaky streak | 22 |
| Booly | Ghost | a floating ghost | 12 |
| Plod | Baku | a heavy dome on pillar legs with a trunk | 16 |
| Bipped | Hare | an upright boxer | 17 |
| Fizz | Color Pandora | a potion flask full of tricks | 15 |
| Teep | Bajarl | a teapot, close to MR2's genie in a jar | 15 |
| Lern | Pixie | a glowing paper lantern | 21 |
| Puff | Plant | a mushroom | 12 |
| Flit | Mew | a small quick bat | 18 |
| Glop | Jell | a slime | 20 |
| Tock | Metalner | a clockwork alarm clock | 13 |
| Mitt | Ape | a boxing glove that hits hard | 12 |
| Brolly | Wracky | an umbrella that spins and hops like a doll | 24 |
| Spine | Plant | a potted cactus | 12 |
| Burr | Worm | a mole that digs | 15 |
| Wick | Gali | a candle, a fire spirit like Gali | 22 |
| Lumo | Pixie | a firefly caster | 21 |
| Snooze | Baku | a sleepy pillow, and Baku eats dreams | 16 |
| Inky | Joker | an ink blot, dark and tricky | 6 |
| Cobble | Golem | a pile of stones | 22 |
| Nimbo | Undine | a rain cloud | 21 |
| Dango | Mocchi | soft dumplings that roll and press | 20 |
| Oaklet | Mock | an acorn that grows into a tree | 9 |
| Roly | Beaclon | a pill bug that rolls like a beetle | 21 |
| Trundle | Niton | a snail with a shell | 17 |
| Clank | Durahan | a tin robot in armour | 22 |
| Crease | Ducken | an origami crane | 18 |
| Twiglet | Mock | a bonsai tree | 9 |
| Swirl | Jill | a snow globe | 12 |
| Ditty | Wracky | a music box dancer | 24 |
| Sizzle | Metalner | a toaster | 13 |
| Aero | Phoenix | a kite that flies | 10 |
| Nesta | Color Pandora | a nesting doll, a box within a box | 15 |
| Magna | Henger | a magnet that zaps and pulls | 20 |
| Helm | Durahan | a diving helmet, heavy armour | 22 |
| Bloop | Jell | a jellyfish | 20 |
| Sox | Mew | a sock that flings itself | 18 |
| Cuppy | Mocchi | a cupcake | 20 |
| Suds | Undine | soap and bubbles | 21 |
| Scoop | Jill | ice cream, cold and heavy | 12 |
| Tome | Monol | a book, close to Monol's stone slab | 21 |
| Gumball | Henger | a gumball machine | 20 |
| Pina | Plant | a pineapple | 12 |
| Jingle | Gaboo | a round piggy bank | 17 |
| Presto | Bajarl | a magician's hat | 15 |
| Vroom | Metalner | a robot vacuum | 13 |
| Shutter | Henger | a camera | 20 |
| Yoyo | Hopper | a yo-yo that swings and strikes | 13 |
| Lava | Gali | a lava lamp, fire again | 22 |
| Pogo | Hopper | a pogo stick | 13 |
| Eagle | Ducken | a bird of prey | 18 |
| Vampire | Pixie | a vampire caster that steals life | 21 |
| Phoenix | Phoenix | the fire bird | 10 |
| Kitsune | Kato | a fox with fox-fire | 22 |
| Naga | Naga | the snake | 12 |
| Yeti | Jill | a snow beast | 12 |
| Kraken | Jell | a sea monster that grabs | 20 |
| Golem | Golem | the stone giant | 22 |
| Unicorn | Centaur | a horned horse | 17 |
| Jack | Joker | a jack-o'-lantern | 6 |
| Tengu | Gali | a mountain spirit with a fan | 22 |
| Tanuki | Mocchi | a round raccoon dog | 20 |
| Mermaid | Undine | a water spirit | 21 |
| Diwata | Pixie | a forest fairy | 21 |
| Sphinx | Tiger | a lion | 12 |
| Garuda | Phoenix | a bird warrior | 10 |
| Werewolf | Tiger | a wolf | 12 |
| Minotaur | Durahan | a bull warrior with an axe | 22 |
| Dragon | Dragon | the dragon | 19 |
| Thunderbird | Phoenix | a storm bird | 10 |
| Hydra | Naga | a many-headed serpent | 12 |
| Griffin | Centaur | a beast that's two animals in one | 17 |
| Kirin | Centaur | a scaled deer | 17 |
| Salamander | Zuum | a fire lizard | 24 |
| Bakunawa | Zilla | a giant sea serpent | 14 |
| Cerberus | Tiger | a three-headed dog | 12 |
| Djinn | Bajarl | a genie | 15 |
| Troll | Ape | a big brute | 12 |
| Mummy | Ghost | an undead wrap | 12 |
| Sarimanok | Phoenix | a magic rooster | 10 |

## Order of work

1. One family written out in full for Gid's OK: Chomp, 17 moves. Built with its learning (level, errantry, fights, shared by body) on 16 Nov 2026.
2. The rest in groups of about 10 families, with the balance sim after each group. Group 1 (Squib, Antik, Moko, Pinch, Stilt, Skit, Booly, Plod, Bipped, Fizz: 171 moves) was built on 16 Nov 2026, with eight new animations (Rocket Arm, Knee Strike, Sand Spray, Claw Spin, Dread Crawl, Ink Fog, Jet Spin, Wind Kick). The sim has all ten between 45% and 53% after Booly's damage went down and Bipped's went up. The family rows are in `FAM_MOVES` and every move's errantry region, chain and shared body parts are in its row. Group 2 (Teep, Lern, Puff, Flit, Glop, Tock, Mitt, Brolly, Spine, Burr: 172 moves) followed the same day, with twelve new animations (Spin Crash, Snap Shut, Rainbow, Burst Up, Wing Storm, Goo Spin, Dim Light, Firecracker, Fireworks, Rocket Glove, Iced Tea, Lid Toss), and Twister uses the stock tornado. The sim has all ten between 47% and 54% after Flit's damage went up. Group 3 (Snooze, Inky, Cobble, Nimbo, Dango, Oaklet, Roly, Trundle, Clank, Crease: 174 moves) came next, with twelve new animations (Saw Throw, Paper Boomerang, Roll Bump, Edge Roll, Big Roll, Moss Smear, Spin Skewer, Poke Flurry, Petal Swirl, Lullaby, Bop Barrage, Slime Slide). Inky keeps its 8 since Joker has only 6. Trundle's Shell Smoke and Smoke Ring puff out of the top of its shell, which is the chimney on the Mega. The sim has all ten between 46% and 54% after Snooze and Nimbo went down and Roly, Trundle and Crease went up. Group 4 (Twiglet, Swirl, Ditty, Sizzle, Aero, Nesta, Magna, Helm, Bloop, Sox: 163 moves) needed one new animation, Nesta's sisters: the top of the doll lifts off and a smaller doll pops out and hops across to bonk the target, one for Little Sister and Big Sister and four in a row for Sister Parade. Its other new moves use the closest animations made so far, like Ditty's Sound Wave on Plod's trumpet rings and Aero's Grit Blast on Sand Spray. The sim has all ten between 46% and 54% after Swirl, Sizzle, Helm and Bloop went up and Aero and Sox went down. Bloop's Big Swat swings its own thin tentacles up and down across the target, and gust moves blow bigger air waves. Group 5 (Cuppy, Suds, Scoop, Tome, Gumball, Pina, Jingle, Presto, Vroom, Shutter: 171 moves) added Page Cyclone (Petal Swirl with loose pages), Coin Flick (a spinning gold coin, which Coin Toss uses too) and Shutter's snapshots: the lens flashes and a photo frame snaps over the target twice for Double Snap, four times for Snap Combo, and once with frost for Freeze Frame. The sim has all ten between 46% and 52% after Suds and Gumball went down and Shutter went up. Tome's Slam Shut leaps over the target, opens its covers wide and slams shut on it, and Scoop's Freezer Burn presses its cold scoop on so frost spreads over the target. Group 6 (Yoyo, Lava, Pogo, Eagle, Vampire, Phoenix, Kitsune, Naga, Yeti, Kraken: 163 moves) added Yoyo's Long Throw and Loop the Loop, where its own body flies out on its string, straight at the target or round a full loop first, and snaps back, and Kraken's Drag Under, where both long arms wrap the target and haul it down into a dark pool before dropping it back. Lava's second Heat Haze is Heat Shimmer, since Phoenix has Heat Haze. The sim has all ten between 46% and 52% after Lava, Eagle and Kitsune went up and Kraken went down. Vampire's Wing Wrap uses its own cape: it breaks into bats, appears behind the target, drawn behind it, takes the cape off its back and wraps it round the target over about 1.2 seconds like a one-armed shoulder hug that pulls the target in toward it: the cape first reaches round behind the target to its far side, then comes round the front, closing back toward Vampire (a move's `back` layer draws between the attacker and its target), hanging vertical from its shoulders to the floor with the bat-wing hem along the bottom, then an impact lands and it flies back as bats. Lava's Bubble Over rolls a wave of molten lava, and its Steam Burst, Bubble Over and Magma Geyser are taught at Cinder Peak and Granite Steps instead of Coral Shallows. Kitsune's tails now rise behind it from its back and curl at white tips (one, three, then nine), and it has a small black fox nose.
3. The element pools with body parts.
4. The technique card in the Skills tab.
