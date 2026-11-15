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
- **The Rift,** past the edge of the map, open at grade A, with the Rift Lord at its heart (`TRIP_REGIONS` in `trips.js`).

## Factions

- **The Snabit League (named by Gid, 15 Nov 2026).** Runs the cups and the grades, licenses ranches and exploration teams, and issues the permits that open regions. The grades exist because some regions are too dangerous for weak Snabits, so a cup win is how a ranch earns the right to go further. This explains why regions open by grade in the code today.
- **The Grand Ranch.** The biggest ranch, run by Rook's father, Victor. It funds the League's expeditions, which gives Victor a seat on the board that decides permits.
- **Josie's ranch.** Small and in debt. It used to belong to Josie's mother, Helena.

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
| Helena (Proposed) | Josie's mother, the League's lead explorer | To find where Snabits come from | Missing in the Rift for 15 years | not in code yet |
| Celia (Proposed) | Rook's mother, an explorer on Helena's team | | Missing in the Rift for 15 years | not in code yet |
| Victor (Proposed) | Rook's father, runs the Grand Ranch, sits on the League board | His wife back, whatever it takes | Alive | not in code yet |
| The Rift Lord | Teacher at the Rift's heart, a Moko | Unknown | | `areas.js` |

Voice samples:
- Josie: "Cup prizes are the quickest way to pay him back."
- Rook: "This doesn't change anything at the cups. I'm still going to beat you at the Majors."
- Walt: "So you made grade A. I've never taken anyone to the Rift, but I'll take you."
- Dr. Ines: "Every Snabit you've scanned with the Snaboscope gives off the same faint signal."

## World rules

- Snabits hide in the colour of whatever they're in, and a Snaboscope reads that colour to find the one hiding there. The photo's colours decide its element, family and stats (`monster.js`).
- Every Snabit gives off the same faint signal, and it comes from the Rift (`story.js`, the grade B scene).
- **Pattern Stones (Proposed).** An ancient people kept Snabits as colour patterns carved and painted on stone, so a Snabit could be carried and called back. The people are gone and the stones are scattered through the regions. Their patterns were copied into flags, banners, lanterns and cloth by people who didn't know what they were. That's why a US flag pattern can call the Eagle and a Japanese flag the Kitsune.
- **Specials need their stone (Proposed, Gid's rule).** Scanning a special's pattern calls the special only after its Pattern Stone has been found on an expedition. Before that, the same scan gives a regular Snabit.
- **Helena's lens (Proposed).** Helena fitted her Snaboscope with a lens that reads Pattern Stones. Josie gives it to the player, and it's what lets the player's scans call specials. Every special called through it pulls on the Rift, and Dr. Ines measures the signal getting stronger each time.

## What can be scanned (Gid's tiers, decided 15 Nov 2026)

1. **Basic Snabits:** the first eight families (Chomp, Squib, Antik, Moko, Pinch, Stilt, Skit, Booly), scanned from the start.
2. **Registered Snabits:** the League only lets a ranch register the other five families once it has proven itself, and each opens a different way, since Gid wants locked Snabits but not one route for all of them (`LICENCE`, `UNLOCK_HOW`, `famOpen` in `game.js`). Until then a scan that would give one gives one of the first eight, and the bestiary says how each one opens. A save from before keeps any of the five it had already raised.
   - Plod: win the Plod Licence Cup, grade D.
   - Bipped: win a Strength contest. The judges are Bipped breeders and sign the League form.
   - Fizz: Dr. Ines signs the form when the ranch reaches grade B.
   - Teep: win the Teep Licence Cup, grade A.
   - Lern: go to the Lantern Festival at grade C or higher.
   - Licence Cups run in week 4 of the first two months of each season except Summer, with a field of that family only. They grow with the grade (Gid, 15 Nov 2026): 4 entrants at E and D, 6 at C and B, 8 at A and S, where 8 is a knockout.
3. **Specials:** unlocked by finding their Pattern Stone on an expedition, deeper into the story. The six in the game (Eagle, Vampire, Phoenix, Kitsune, Naga, Yeti) and the seven planned (Garuda, Sarimanok, Kraken, Golem, Unicorn, Bakunawa, Jack-o'-lantern).

## Story spine (Proposed)

Each step is caused by the one before.

1. **Fifteen years ago.** Helena finds the first Pattern Stone and works out that the patterns are Snabits stored as colour. She traces where the stones point and finds they all point at the Rift. She leads a League expedition into it with Celia, guided by Walt. Walt comes back alone.
2. **After.** Helena's ranch falls into debt with no one to run it. Victor buys it, since Helena's notes say the Rift runs thinnest under that land.
3. **Before the game.** Josie borrows 30,000 bits from the Grand Ranch to buy her mother's ranch back, since Helena's notes are hidden somewhere on it and she won't let Victor have them. Victor agrees because a loan she can't pay gets him the land and the notes later. Josie hires the player. This is where the game starts, and the loan stays as the opening.
4. **Grade E.** Cups, the loan and Rook, as the game has now.
5. **The barn upgrade (at a quarter of the loan).** The Workshop pulls up the old barn floor and finds Helena's lens and the first page of her journal. Josie fits the lens to the player's Snaboscope. The page names a ruin in a region the ranch can reach.
6. **Grade D.** The League gives the ranch its first expedition permit. The first expedition finds the ruin, a Pattern Stone and the second page. Rook is there too, sent by his father to get the stones first.
7. **Grade C.** The pages start to disagree with what Walt has always said about the last expedition.
8. **Grade B.** Dr. Ines reads the stones and the lens, and finds that every special called through the lens strengthens the Rift signal. Rook tells the player his mother went in with Helena and never came back.
9. **Grade A.** The Rift permit. Walt takes the player in and tells his side of what happened: he turned back.
10. **Grade S and the Majors.** Victor uses his League seat to make the Legend Cup the only way into the Rift's heart, and enters Rook to win it for him.
11. **The Legend Cup.** Whoever wins gets the permit. Rook has to decide whether he's winning it for his father.
12. **After the Legend Cup.** The expedition into the Rift's heart. What's there is a hole (see Holes).

## Exploration mode (Proposed)

League expeditions, the way MR2 ran them. A permit opens a region's expedition, the player picks a Snabit and leads it across the region's map, and its stats decide where it can go. Power moves boulders, Speed clears gaps, Mind opens puzzle doors, Insight spots hidden paths, Constitution gets through hazards, and Stamina sets how far it can go on one trip. Finds are journal pages, Pattern Stones, items and rare Snabits to fight. Walt's trips stay as they are for training and skills.

## Name sets

Usual game names that read well anywhere, not tied to one country (Gid, 15 Nov 2026). No two cast names start with the same sound. Josie, Walt and Nora were Tala, Kiko and Nena until Gid asked for this rule (15 Nov 2026).

## Holes

- More costumes are coming (Gid, 15 Nov 2026), each with its own way to unlock, spread across festivals, contests, cups, trips and the bestiary. Today the five costumes can be scanned from the start (`eggOf` in `monster.js`).
- More families are planned to fill more roles (Gid, 15 Nov 2026).
- Who the ancient people were and why they left the stones.
- What the Rift Lord wants, and whether it knew Helena.
- What's at the Rift's heart, and whether Helena and Celia are alive.
- What Victor does if he gets into the Rift's heart.
- How the story ends, and whether the ending changes with how many specials the player called through the lens.
