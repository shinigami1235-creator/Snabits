# Snabits move rework plan, 16 Nov 2026

Every family gets its own set of moves, sized to the MR2 breed it's closest to, instead of the same 8-move template. Gid picked how it works on 16 Nov 2026: core moves come by level and the rest only from training or fights, set sizes match MR2, a fused Snabit can learn a few marked moves from its other parent's family, and each element has a shared pool of moves that a Snabit can learn if its body fits. The MR2 counts come from the MR2 FAQ by KurasuSoratobu (v3.0, section D2), copied to `/tmp/mr2/mr2_techniques.json` in Claude's workspace.

## How a Snabit learns a move

| Way | Which moves | How |
|---|---|---|
| Level | the Basic and Hit moves, about a third of the set | learned at set levels, the way all moves are now |
| Drill | Heavy, Sharp and Withering moves | each drill has a chance to teach the next move that matches it: Boulder push teaches heavy Strikes, Puzzle box teaches Casts, Meditate teaches sharp moves, Brace teaches withering moves, Dodgeball teaches quick hits |
| Fight | the stronger step of a chain | MR2 builds moves in chains (Jump Blow, then 2 Jump Blows, then 3 Jump Blows). Using a move in fights gives a chance to learn its next step |
| Signature | the family's own big move | stays as it is, with the animation it has now |

Nothing in the game says how a move is learned. The ranch report just says it learned one.

## Fusion

Each family marks 2 to 4 moves its body could pass on, the way MR2 lets a Pixie/Kato learn Phantom Claw. A fused or hybrid Snabit can learn its other parent's marked moves through drills, on top of its own set.

## Element moves

Each of the 12 elements gets a pool of about 8 moves. Every move in a pool lists the body parts it needs (a mouth, arms, legs, tentacles, wings, a shell, or none for Casts), and every family lists the parts it has. A Snabit can learn the moves of its own element that its body fits, through drills. The first move keeping its element name, like Flame Bite, stays.

## The technique card

The Skills tab shows each move the MR2 way: its name, Strike or Cast, its category (Basic, Hit, Heavy, Sharp, Withering or Special), its focus cost, and Force, Hit%, Withering and Sharpness graded A to E, worked out from the move's numbers.

## Animations

Regular moves use the stock animation that fits them best. Signatures keep the animations they have.

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

1. One family written out in full for Gid's OK: Chomp, 17 moves.
2. The rest in groups of about 10 families, with the balance sim after each group.
3. The drill and fight learning, fusion marks and element pools.
4. The technique card in the Skills tab.
