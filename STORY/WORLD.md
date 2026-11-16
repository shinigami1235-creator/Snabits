# Snabits story canon

This file is the canon for the Snabits story. Every new scene, quest, item line and exploration find gets checked against it before it goes in, and REGISTRY.md lists every piece of story already in the game. Sections marked **Proposed** came from Gid's direction on 15 Nov 2026 and wait for his yes before any content is built on them. When the code and this file disagree, Gid picks which one wins.

## Premise

Snabits are part of everyday life. People raise them, fight them in cups and keep them as pets, and a phone works as a Snaboscope to find them. Nobody knows where they come from. The Snabit League manages Snabits and the exploration teams that go looking for the answer, and it keeps the dangerous regions closed to anyone who hasn't proven their Snabit in its cups. The player is the ranch hand Josie hires, and the story follows two mothers who went into the Rift fifteen years ago and didn't come back.

## Tone

Light and warm on the ranch, with real weight in the story. Kids play it, so nothing cruel is shown, but the losses are real and the people who cause harm have reasons a reasonable person could hold.

## World structure

- **The ranch:** Josie's ranch, three screens wide, with the barn, the yard and the training ground (`ranch.js`, `scenes.js`).
- **Town:** Nora's shop, the Workshop, the Town Hall and Dr. Ines's lab (`town.js`, `npcs.js`, `lab.js`).
- **The stadium:** where the League runs its cups (`tourney.js`, `cupshow.js`).
- **The 12 regions,** one per element, each with four places and a teacher (`REGIONS` in `missions.js`, `TRIP_AREAS` in `areas.js`). They open by the ranch's best grade: 4 at E, 7 at D, 10 at C, all 12 at B (`tripRegionCount` in `game.js`).
- **The Rift,** past the edge of the map. The League has known about it for years and its teams map the edge, so the Rift's edge opens as an expedition at grade C (`exRegions` in `explore.js`). The skill trip to the Rift Lord at its heart opens at grade A (`TRIP_REGIONS` in `trips.js`).

## Factions

- **The Snabit League (named by Gid, 15 Nov 2026).** Runs the cups and the grades, licenses ranches and exploration teams, and issues the permits that open regions. The grades exist because some regions are too dangerous for weak Snabits, so a cup win is how a ranch earns the right to go further. This explains why regions open by grade in the code today.
- **The Grand Ranch.** The biggest ranch, run by Rook's father, Victor. It funds the League's expeditions, which gives Victor a seat on the board that decides permits.
- **Josie's ranch.** Small and in debt. It used to belong to Josie's mother, Helena.
- **The Northreach League (Proposed, 15 Nov 2026).** A league from across the sea that sails in once a year for the Northreach Invitational (Autumn, month 8, week 1). Its breeders raise the five families the Snabit League keeps on licence, and they never guard, so nobody guards in their cup. Winning it gets the ranch a signed League form for one family it can't register yet (`VISIT_FAMS`, `arRule` in `tourney.js`). Its breeders: Astrid Hale, Gunnar, Erling, Freya and Tove, Captain Ulla, picked so no first sound clashes with the cast or the cup breeders.
- **The League's meadow (Proposed).** Where retired Snabits spend their days. A ranch keeps a statue of each one behind its fence (`hall.js`).

## Cast

| Name | Role | Wants | Status | Defined in |
|---|---|---|---|---|
| Josie | Owns the ranch, hired the player | To keep her mother's ranch and find out what happened to her (Proposed) | Alive | `tala.js`, `onboard.js`, `story.js` |
| Rook | Rival, son of the Grand Ranch | To beat the player at the cups, and his mother back (Proposed) | Alive | `story.js` |
| Walt | Trip guide | Proposed: to make up for coming back from the Rift alone | Alive | `npcs.js` |
| Nora | Shopkeeper | To run her shop | Alive | `npcs.js`, `town.js` |
| Dr. Ines | Runs the lab: fusion, rebirth, growth reads | To understand the Rift signal | Alive | `npcs.js`, `lab.js` |
| Benji | Dr. Ines's assistant, keeps the Freezer | | Alive | `npcs.js` |
| Mira | Cup announcer | | Alive | `npcs.js`, `cupshow.js` |
| Helena (Proposed) | Josie's mother, the League's lead explorer | To find where Snabits come from | Missing in the Rift for 15 years | her journal, `EX_PAGES` in `explore.js` |
| Celia (Proposed) | Rook's mother, an explorer on Helena's team | | Missing in the Rift for 15 years | named in Helena's journal |
| Victor (Proposed) | Rook's father, runs the Grand Ranch, sits on the League board | His wife back, whatever it takes | Alive | named in Helena's journal |
| The Rift Lord | Teacher at the Rift's heart, a Moko | Unknown | | `areas.js` |

Voice samples:
- Josie: "Cup prizes are the quickest way to pay him back."
- Rook: "This doesn't change anything at the cups. I'm still going to beat you at the Majors."
- Walt: "So you made grade A. I've never taken anyone to the Rift, but I'll take you."
- Dr. Ines: "Every Snabit you've scanned with the Snaboscope gives off the same faint signal."

## World rules

- Snabits hide in the colour of whatever they're in, and a Snaboscope reads that colour to find the one hiding there. The photo's colours decide its element, family and stats (`monster.js`).
- Every Snabit gives off the same faint signal, and it comes from the Rift (`story.js`, the grade B scene).
- **Pattern Stones.** An ancient people kept Snabits as colour patterns carved and painted on stone, so a Snabit could be carried and called back. The people are gone and the stones are scattered through the regions. Their patterns were copied into banners, lanterns and cloth by people who didn't know what they were. Each stone is abstract and nobody in the game says which real pattern it matches, so the player connects it themselves (Gid, 15 Nov 2026). A picture that looks like a stone calls its special. The stones, drawn by `stoneGlyph` in `scenes.js` and shown in `docs/art/pattern-stones.png`, `docs/art/specials-group1.png` to `docs/art/specials-group4.png`:
  - Phoenix (Cinder Peak): zigzag flame bands, red at the bottom up to yellow.
  - Eagle (Static Plains): a blue sky band over red and white chevrons spreading like wings.
  - Vampire (Hollow Moor, deep map): a pale crescent and a red drop on black.
  - Kitsune (Dream Garden, deep map): three red tails fanning up from one point on pale stone.
  - Naga (Nightshade Marsh): a yellow coil on green.
  - Yeti (Glacier Rim): an ice-blue six-point star over a grey band.
  - Kraken (Coral Shallows, deep map): a violet curl rising out of dark water on deep blue.
  - Golem (Granite Steps, deep map): a grey block with dark cracks and one line of moss.
  - Unicorn (Dawn Temple, deep map): a pale pink horn over pink, lilac and yellow bands on white.
  - Jack (Tanglewood, deep map): an orange round with a stem, two cut eyes and a cut mouth.
  - Tengu (Saffron Dojo): a cream wedge pointing out across red, with a green fan of three blades below it.
  - Tanuki (Tanglewood): a dark band with two brown rings across brown, and a green leaf above.
  - Mermaid (Coral Shallows): rows of pale scales on teal under a pink fin.
  - Diwata (Dream Garden): two pairs of green wings either side of a small yellow middle, on pink.
  - Sphinx (Granite Steps): blue stripes in the shape of a head cloth on gold, with a red dot below.
  - Garuda (Dawn Temple): two red wings rising in a V over gold, with a blue gem where they meet.
  - Werewolf (Hollow Moor): a full moon over grey, and three dark slashes below it.
  - Minotaur (Iron Foundry): a silver ring on brown under two pale horns.
  - Dragon (Cinder Peak, deep map): dark scales on green under an orange flame.
  - Thunderbird (Static Plains, deep map): a yellow zigzag spreading both ways across blue.
  - Hydra (Nightshade Marsh, deep map): three green necks rising from one root on violet.
  - Griffin (Glacier Rim, deep map): a white band over the top of orange, with a gold beak pointing down from it.
  - Kirin (Saffron Dojo, deep map): rows of teal scales over a row of orange flames.
  - Salamander (Iron Foundry, deep map): orange spots on black, with one yellow flame in the corner.
  - Bakunawa (the Rift's edge): a pale moon over a teal serpent on deep blue.
  - Cerberus (the Tower, floor 25): a red collar across black under three white spikes.
  - Djinn (the Tower, floor 50): pale smoke curling up out of a gold lamp on blue.
  - Troll (the Northreach Invitational): a brown club across green, with two white tusks under it.
  - Mummy (the Hall of Fame): grey and white wraps across the stone, with one gold eye.
  - Sarimanok (the Harvest Fair): a fan of rainbow feathers on white.
- **Specials need their stone (Gid's rule).** Scanning a special's pattern calls the special only after its Pattern Stone has been found on an expedition. Before that, the same scan gives a regular Snabit, and the special's Secrets hint shows ??? (`stoneOpen` in `explore.js`, the gate in `hatch`). A save that already raised a special keeps it open.
- **Helena's lens (Proposed).** Helena fitted her Snaboscope with a lens that reads Pattern Stones. Josie gives it to the player, and it's what lets the player's scans call specials. Every special called through it pulls on the Rift, and Dr. Ines measures the signal getting stronger each time.

## What can be scanned (Gid's tiers, decided 15 Nov 2026)

1. **Basic Snabits:** the first eight families (Chomp, Squib, Antik, Moko, Pinch, Stilt, Skit, Booly), scanned from the start, plus four commons added 15 Nov 2026 (Puff, Flit, Glop, Tock) that come from a scan whose main colour surrounds the middle of the shot (`ring` in `pickFamily`), and ten added 16 Nov 2026: Wick, Lumo, Snooze, Inky and Cobble from dark photos, and Nimbo, Dango, Oaklet, Roly and Trundle from pale ones (`pick5` in `pickFamily`, by the photo's second colour or the tint of its main one). Batch 4 added eight more the same day, from vivid photos that are bright and strongly coloured: Bloop, Sox, Cuppy, Suds, Scoop, Tome, Gumball and Pina.
2. **Registered Snabits:** the League only lets a ranch register twenty-six families so far once it has proven itself, and each opens a different way, since Gid wants locked Snabits but not one route for all of them (`LICENCE`, `UNLOCK_HOW`, `famOpen` in `game.js`). Until then a scan that would give one gives one of the first eight. Nothing in the game says how any of them opens, since Gid wants it found by playing (15 Nov 2026). A save from before keeps any of the five it had already raised.
   - Plod: win the Plod Licence Cup, grade D.
   - Bipped: win a Strength contest. The judges are Bipped breeders and sign the League form.
   - Fizz: Dr. Ines signs the form when the ranch reaches grade B.
   - Teep: win the Teep Licence Cup, grade A.
   - Lern: go to the Lantern Festival at grade C or higher.
   - Mitt (added 15 Nov 2026): beat Rook three times. Rook drops off a signed form.
   - Brolly: a Rain week at grade D or higher. A wild Brolly shelters in the barn and Walt files its form.
   - Spine: raise a Snabit to Mega. Dr. Ines comes to see it and signs the form.
   - Burr: five pages of Helena's journal. A Burr digs in under the fence and Walt files its form.
   - Clank (added 16 Nov 2026, batch 3): reach the far end of the Iron Foundry map. A tin Clank follows the ranch home.
   - Crease: the fan mail week event. The kid who wrote folds a crane and posts the form.
   - Twiglet: the Snabit's second year on the ranch. Nora sends a potted tree with the form in it.
   - Swirl: a Snow week at grade C or higher. A Swirl rolls down the hill to the barn door.
   - Ditty: the first trade with a friend. The friend sends a music box with the form under the dancer.
   - Sizzle: the ranch buys the Kitchen upgrade. The first breakfast burns and a Sizzle hops out of the toaster.
   - Aero: floor 10 of the Tower. A kite caught up there comes down at the ranch with the form tied to its tail.
   - Nesta: the first fusion in Dr. Ines's lab. She sends a nesting doll with the form inside the smallest one.
   - Magna: the ranch beats the Drifter. It drags home a horseshoe magnet with the form stuck to it.
   - Helm: 100 kinds seen in the bestiary. Dr. Ines sends a brass diving helmet with the form in it.
   - Jingle (added 16 Nov 2026, batch 4): 20,000 bits saved. A gold coin turns up in the bits jar and the form comes with the bank statement.
   - Presto: six different week events seen. A travelling magician pulls the form out of a top hat and leaves the hat.
   - Vroom: the Better hut upgrade. Something keeps the new barn spotless and Walt finds a Vroom under the hay.
   - Shutter: the first costume opened. A photographer from the town paper comes to shoot the pattern card.
   - Yoyo: 20 wins. A kid who watched them sends a yo-yo with the form wound round the string.
   - Lava: a heatwave week at grade C or higher. A candle in the barn melts into a glowing blob.
   - Pogo: five hearts of loyalty. The Snabit bounces round the yard all week and a Pogo bounces along with it.
   - Batch 3's and batch 4's registered families come from busy photos with four or more colours, once registered (`pickFamily`).
   - Licence Cups run in week 4 of the first two months of each season except Summer, with a field of that family only. They grow with the grade (Gid, 15 Nov 2026): 4 entrants at E and D, 6 at C and B, 8 at A and S, where 8 is a knockout.
3. **Costumes:** twelve, each opened its own way and never explained in the game (`cosOpen`, `openCos` in `game.js`). A costume's pattern scanned before then makes a plain Snabit, and its Secrets hint shows ??? until it opens. Each brings a skill and teaches a second at level 6 (`COSTUME_SKILLS` in `skills.js`).
   - Contests: Bee (Smarts), Zebra (Speed), Penguin (Style).
   - Festivals: Strawberry (Blossom Festival), Watermelon (Harvest Fair), Candy cane (Snow Fair).
   - A good trip week: Tiger (Saffron Dojo), Clownfish (Coral Shallows), Ladybug (Tanglewood).
   - The bestiary: Panda (30 kinds seen), Cow (10 kinds raised).
   - Nora's shop: Rubber duck, as a Duck pattern card for 5,000 bits.
4. **Specials:** unlocked by finding their Pattern Stone on an expedition, deeper into the story. All thirty are in the game: Eagle, Vampire, Phoenix, Kitsune, Naga, Yeti, Kraken, Golem, Unicorn, Jack, then from 16 Nov 2026 Tengu, Tanuki, Mermaid, Diwata, Sphinx, Garuda, Werewolf, Minotaur, Dragon, Thunderbird, and from 17 Nov 2026 Hydra, Griffin, Kirin, Salamander, Bakunawa, Cerberus, Djinn, Troll, Mummy, Sarimanok. Jack is the Jack-o'-lantern from the plan.

## Story spine (Proposed)

Each step is caused by the one before.

1. **Fifteen years ago.** Helena finds the first Pattern Stone and works out that the patterns are Snabits stored as colour. She traces where the stones point and finds they all point at the Rift. She leads a League expedition into it with Celia, guided by Walt. Walt comes back alone.
2. **After.** Helena's ranch falls into debt with no one to run it. Victor buys it, since Helena's notes say the Rift runs thinnest under that land.
3. **Before the game.** Josie borrows 30,000 bits from the Grand Ranch to buy her mother's ranch back, since Helena's notes are hidden somewhere on it and she won't let Victor have them. Victor agrees because a loan she can't pay gets him the land and the notes later. Josie hires the player. This is where the game starts, and the loan stays as the opening.
4. **Grade E.** Cups, the loan and Rook, as the game has now.
5. **The barn upgrade (at a quarter of the loan).** The Workshop pulls up the old barn floor and finds Helena's lens and the first page of her journal. Josie fits the lens to the player's Snaboscope. The page names a ruin in a region the ranch can reach.
6. **Grade E (built at 1 heart).** The League gives the ranch its first expedition permits through Walt, and expeditions find Pattern Stones and Helena's pages. Still to build: the ruin the first page names, and Rook turning up, sent by his father to get the stones first.
7. **Grade C.** The Rift's edge opens as an expedition, since the League's teams have mapped it for years (built). The pages start to disagree with what Walt has always said about the last expedition.
8. **Grade B.** Dr. Ines reads the stones and the lens, and finds that every special called through the lens strengthens the Rift signal. Rook tells the player his mother went in with Helena and never came back.
9. **Grade A.** The Rift permit. Walt takes the player in and tells his side of what happened: he turned back.
10. **Grade S and the Majors.** Victor uses his League seat to make the Legend Cup the only way into the Rift's heart, and enters Rook to win it for him.
11. **The Legend Cup.** Whoever wins gets the permit. Rook has to decide whether he's winning it for his father.
12. **After the Legend Cup.** The expedition into the Rift's heart. What's there is a hole (see Holes).

## Exploration mode (built 15 Nov 2026, `explore.js`)

League expeditions, the way MR2 ran them. Walt hands out a permit for each open region (Out, then Expeditions, from 1 heart). An expedition takes the week, and each region can be explored once a season. The region is a map of circles in seven columns with fog over what hasn't been reached, the same map every time. Each step costs 1 energy, and the energy (10 to 19) comes from Stamina against the other stats. Columns 2 and 4 are obstacles, one stat each, and nothing names the stat since Gid wants the obstacle to show it (15 Nov 2026): a giant boulder to push (Power), a dart totem firing over pressure plates (Speed), a rune door with books left lying in front of it (Mind), a hedge with three archways where two are mirages (Insight), and a bramble wall to push through (Constitution). Walt's lines say what happened without naming a stat either. A fail costs 3 energy and shuts that way for the trip. Finds are chests, springs (4 energy back), wild Snabits (a League bounty for a win, 3 energy for a loss), one journal page per region and, at the far end, the Pattern Stone, a big chest or the Rift's last page. What's seen and found stays seen and found. Walt's trips stay as they are for training and skills.

**Helena's journal,** one page per region, read in the Journal on the Expeditions screen (`EX_PAGES`): the Cinder Peak stone, the dojo banner, scans near stones, Josie's fourth birthday, the stones pointing past the map, the permit Victor signed, Walt not liking it, the lens that hums, the signal loudest at the stones, Celia's silence, Victor's letter, the notes under the barn floor, and Walt told to wait three days at the Rift's edge.

## Team expeditions (built 15 Nov 2026, `deep.js`)

Deep expeditions for a team of three trained Snabits, approved by Gid from `docs/art/team-expedition-concept.png`. They show up on the Expeditions screen once one opens, with nothing saying beforehand how.

- **When:** from grade C (Gid). Each open region gets a deep map past its regular one, and it opens once the team has reached the far end of the regular map.
- **The team:** three Snabits from the ranch. Each has its own energy from its own Stamina, shown on its own card over the map. The one leading makes every move and faces each obstacle. Some deep obstacles need two stats at once, and two different Snabits have to cover them.
- **Switching:** a different Snabit can take the lead at any time for 1 of its energy (Gid).
- **Days and camps:** a deep expedition takes two weeks, split into days. Camp circles end the day, give everyone energy back and bring back anyone who's out. A wild Snabit can wander next to camp overnight.
- **Fights:** a tag team (Gid). The leader fights first, and if it loses, the next one steps in against the same Snabit with whatever HP it has left. A Snabit that loses is out until the next camp and nothing worse (Gid). If all three are out, the team goes home with everything it found.
- **Finds:** rarer items, bigger League bounties, the region's teacher as a guardian at the far end, and Pattern Stones.
- **Stones:** the Kitsune, Vampire, Jack, Kraken, Golem and Unicorn stones sit behind the guardians of deep Dream Garden, Hollow Moor, Tanglewood, Coral Shallows, Granite Steps and Dawn Temple, so team expeditions have stones to find from grade C, as Gid asked. The Phoenix, Eagle, Yeti and Naga stones stay on the regular maps. The Tengu, Tanuki, Mermaid, Diwata, Sphinx, Garuda, Werewolf and Minotaur stones sit at the far end of the regular Saffron Dojo, Tanglewood, Coral Shallows, Dream Garden, Granite Steps, Dawn Temple, Hollow Moor and Iron Foundry maps (16 Nov 2026), where a big chest used to be. The Dragon and Thunderbird stones sit behind the guardians of deep Cinder Peak and deep Static Plains. A save that already opened that chest still finds the stone there. The Hydra, Griffin, Kirin and Salamander stones sit behind the guardians of deep Nightshade Marsh, Glacier Rim, Saffron Dojo and Iron Foundry (17 Nov 2026).
- **Stones away from the maps (Gid, 16 Nov 2026).** Six stones turn up outside the region maps, and no line says what earns them:
  - Bakunawa's stone lies on the last ring of circles before the Rift's edge, in front of the circle with the last journal page.
  - Cerberus's stone waits on floor 25 of the Tower and Djinn's on floor 50. Winning that floor brings the stone home with the climb's other prizes.
  - The Northreach team leaves one of their painted stones with the trophy when the ranch wins the Northreach Invitational.
  - Someone leaves a painted stone at the foot of the first statue the ranch puts up in the Hall of Fame. A save that retired a Snabit before this finds it at the next statue.
  - A farmer at the Harvest Fair gives the ranch a painted stone from her stall once its best Snabit has reached grade B.
- **The cost:** fatigue and stress on all three, so the player plans for it like a Major.

## The horror series (Proposed, built 16 Nov 2026, `horror.js`)

Ten cosmic horrors from past the Rift, drawn cute: Cthulhu, Hastur, Shoggoth, Dagon, Mi-Go, Nightgaunt, Ghoul, Gug, Yog-Sothoth and Shub-Niggurath. Gid OKed the plan in `docs/HORROR-PLAN.md` on 16 Nov 2026. They're late game, and no scan calls one until it has joined the ranch once.

- **The Deep Rift.** A team expedition past the Rift's edge in three rings. The Outer Ring opens at grade A once the Rift's edge map has been crossed, the Middle Ring at S and the Heart after the Legend Cup. The lairs: the Burrows (Ghoul), the Night Cliffs (Nightgaunt), the Humming Mine (Mi-Go), the Drowned Steps (Dagon) and the Thousand Grove (Shub-Niggurath) in the Outer Ring; the Sealed Gate (Gug), the Empty Workshop (Shoggoth) and the Yellow Stage (Hastur) in the Middle Ring; the Gate (Yog-Sothoth) and the Sunken City (Cthulhu) at the Heart.
- **Tears.** From grade A, the deep maps of Hollow Moor, Dream Garden, Granite Steps, Coral Shallows, Tanglewood, Cinder Peak, Iron Foundry and Static Plains show a tear about one season in four, on a different circle each time. The tear holds that region's horror at Byte, and beating it gives the first part of its myth.
- **Myths.** Each horror has a myth in three parts, kept in the Journal's Myths tab. The second part comes from the ranch or town: a bone on the barn step (Ghoul), a week of giggling (Nightgaunt), a jar at the lab (Mi-Go), a fisher's song at the Harvest Fair (Dagon), a stray kid in spring (Shub-Niggurath), a knock under the barn in a heatwave (Gug), a mess in the Workshop that cleans itself (Shoggoth) and a ticket in the Town Hall's lost and found (Hastur). Yog-Sothoth's first part is a door on the Tower's floor 60 and its second the bestiary at 150 kinds. Cthulhu's first two parts are nightmare weeks at 15 and 30 specials called. The third part of each is on its lair's door.
- **Lairs.** With all three parts, the lair opens and the horror waits inside at Mega, once a season. Losing sends the team home with extra stress. The first win sends a little one home at Bit.
- **One at a time.** A ranch holds one horror at once, Freezer included. Fusion can pass a horror's family on and never makes a hybrid with one.
- **Stones and the witching hour.** A horror at the end of its lifespan on the ranch leaves in the night and leaves its Pattern Stone. A retired horror's statue is gone after 4 weeks with its stone on the plinth. A scan with the stone's three colours filling the middle of the shot calls it back at Bit, only between 9pm and 3am on the phone's clock and only with no other horror on the ranch.
- **The ancient people** made the Shoggoth as a helper and shut the Gugs below the world, and the Ghouls keep the tunnels to the Gugs' door (Gid OKed the Shoggoth part).
- **Hastur's name** is left blank the third time it would be written in one place.

## Built on 15 Nov 2026 from Gid's MR2 and Pokemon list

- **It doesn't always listen.** Below 2 hearts, a tapped move is sometimes ignored or swapped for another, up to about 1 in 3 at no hearts (`wilfulness` in `game.js`, the `sulk` and `wilful` events in `arena.js`).
- **Hall of Fame.** A Snabit past Bit, or past its lifespan, can retire from the Freezer. It turns to stone on a plinth at dusk, its statue stands behind the yard fence (newest three), and the next fresh Snabit raised starts with one of its moves and a tenth of its training (`hall.js`).
- **Letters and visitors.** About one week in four after the first month: a gift basket, a kid who wants to play, a friendly match, a stray, a paid day hauling logs, the town paper, Nora's cart, fan mail and a storm. The people are the breeders the cups already name (`events.js`).
- **The Tower (Proposed name).** In town from grade A. One fight per floor against a slightly stronger Snabit, back to full between floors, a keeper every fifth floor (Keepers Quill, Zeno, Ivo and Yuki, in turn), items at set floors, and the best streak kept (`tower.js`).
- **The Drifter (Proposed).** One Snabit in colours no scan gives, of a family the ranch can't register yet. From grade D it turns up in about 1 in 8 wild scans (once a week at most), and half the time in an expedition's wild circle when it's near that region. Every sixth week someone in town has seen it near a region. Beat it and it follows you home (`roam.js`).
- **Trading** over a 5-letter code on the friend-room link (`trade.js`), and **mystery codes** in Settings that work once per save, stored as hashes (`codes.js`).

## Name sets

Usual game names that read well anywhere, not tied to one country (Gid, 15 Nov 2026). No two cast names start with the same sound. Josie, Walt and Nora were Tala, Kiko and Nena until Gid asked for this rule (15 Nov 2026).

## Holes

- More families are planned to fill more roles (Gid, 15 Nov 2026).
- Who the ancient people were and why they left the stones.
- What the Rift Lord wants, and whether it knew Helena.
- Where Northreach is, and why its league doesn't keep the five families on licence.
- Where the Drifter's colours come from.
- What's at the Rift's heart, and whether Helena and Celia are alive.
- What Victor does if he gets into the Rift's heart.
- How the story ends, and whether the ending changes with how many specials the player called through the lens.
