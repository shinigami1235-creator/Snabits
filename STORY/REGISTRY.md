# Snabits story registry

Every piece of story in the game, one row each, seeded from `story.js` and `onboard.js` on 15 Nov 2026. A beat fires once and is marked in `story().seen[id]` with the week it played (`playBeat` in `story.js`), and `nextBeat` picks which one is due at the end of a week. Add a row in the same change as the code.

| id | type | file | trigger | who | where | changes | sets | reads | calls back to | arc |
|---|---|---|---|---|---|---|---|---|---|---|
| onboard | intro | onboard.js `OB_INTRO` | new game | Josie | town board, first Snaboscope trip | first Snabit, unlimited scans on the first trip | | | | main |
| intro | beat | story.js | end of the first week | Josie, Rook | ranch | the loan and Rook's deal: win the Legend Cup first and his father drops the rest | seen.intro | | onboard | loan, rival |
| loan25 | beat | story.js | a quarter of 30,000 paid at the Town Hall | Josie | ranch | Workshop builds barn upgrades | seen.loan25 | story().paid | intro | loan |
| loan50 | beat | story.js | half paid | Josie | ranch | first level of each training place | seen.loan50 | story().paid | loan25 | loan |
| loan75 | beat | story.js | three quarters paid | Josie | ranch | second level of each training place | seen.loan75 | story().paid | loan50 | loan |
| loan100 | beat | story.js | all paid | Rook | ranch | the deed, and Rook's line that the cups go on | seen.loan100 | story().paid | intro | loan, rival |
| gradeD | beat | story.js | best grade reaches D | Rook | ranch | rival matches in week 3 of every month | seen.gradeD | bestGrade() | intro | rival |
| gradeC | beat | story.js | best grade reaches C | Nora | ranch | a second held item in the shop each week | seen.gradeC | bestGrade() | | shop |
| gradeB | beat | story.js | best grade reaches B | Dr. Ines, Josie | ranch | the Rift signal: every scanned Snabit gives off the same faint signal | seen.gradeB | bestGrade() | | rift |
| gradeA | beat | story.js | best grade reaches A | Walt | ranch | The Rift opens as a skill trip | seen.gradeA | bestGrade() | gradeB | rift |
| gradeS | beat | story.js | best grade reaches S | Rook | ranch | the Majors open | seen.gradeS | bestGrade() | gradeD | rival |
| master | beat | story.js | all four Majors won | Rook | ranch | the Legend Cup opens | seen.master | anyMaster | gradeS | rival |
| legend | beat | story.js | Legend Cup won | Rook, Dr. Ines, Josie | ranch | Rook's family drops the loan (or gives a Life fruit), Dr. Ines explains Snabits come through the Rift, "The End" | seen.legend | story().legendWon | intro, gradeB | rival, rift, loan |
| festivals | event | story.js `FESTIVALS` | week 2 of months 1, 5, 7, 10 | Josie | ranch | a free item, 10 stress off | | weekParts | | seasons |
| rift-teachers | teacher | areas.js `TEACHER` | last place of each region's trip | 12 teachers and the Rift Lord | regions | better skill teaching that week | | | | regions |
| licence-cups | cup | tourney.js `cupsOfWeek`, game.js `LICENCE_CUP` | week 4 of months 1, 2, 7, 8, 10, 11 while Plod or Teep is locked | League | stadium | first place lets the ranch scan that family | PLAYER.famOpen | famOpen() | | league |
| bipped-form | contest result | contests.js | first Strength contest win | judges | town | Bipped can be scanned | PLAYER.famOpen | famOpen() | | league |
| fizz-form | beat line | story.js gradeB | the grade B scene | Dr. Ines | ranch | Fizz can be scanned | PLAYER.famOpen | famOpen() | gradeB | league |
| lern-lanterns | week note | ranch.js | the Lantern Festival at grade C or higher | League stand | town | Lern can be scanned | PLAYER.famOpen | famOpen(), bestGrade() | festivals | league |
| mitt-form | week note | ranch.js `endWeek` | 3 wins against Rook | Rook | ranch | Mitt can be scanned | PLAYER.famOpen | story().rookW | rook-cups | league |
| brolly-form | week note | ranch.js `endWeek` | a Rain week at grade D or higher | Walt, a wild Brolly | ranch | Brolly can be scanned | PLAYER.famOpen | s.weather, bestGrade() | | league |
| spine-form | week note | ranch.js `endWeek` | the Snabit is Mega at the end of a week | Dr. Ines | ranch | Spine can be scanned | PLAYER.famOpen | s.stage | | league |
| burr-form | week note | ranch.js `endWeek` | 5 journal pages found | Walt, a wild Burr | ranch | Burr can be scanned | PLAYER.famOpen | PLAYER.journal | helena-pages | league |
| clank-form | week note | ranch.js `endWeek` | far end of the Iron Foundry map | Walt, a wild Clank | ranch | Clank can be scanned | PLAYER.famOpen | PLAYER.explore | expeditions | league |
| crease-form | week note | ranch.js `endWeek` | the fan mail event has happened | the kid from the fan letter | ranch | Crease can be scanned | PLAYER.famOpen | PLAYER.evSeen.fan | week-events | league |
| twiglet-form | week note | ranch.js `endWeek` | the Snabit's 104th week on the ranch | Nora | ranch | Twiglet can be scanned | PLAYER.famOpen | s.born | | league |
| swirl-form | week note | ranch.js `endWeek` | a Snow week at grade C or higher | Walt, a wild Swirl | ranch | Swirl can be scanned | PLAYER.famOpen | s.weather, bestGrade() | | league |
| ditty-form | week note | ranch.js `endWeek` | the first finished trade | a friend | ranch | Ditty can be scanned | PLAYER.famOpen, PLAYER.traded | PLAYER.traded | trade | league |
| stones-15nov | Pattern Stones | scenes.js `stoneGlyph`, explore.js `EX_DEEP_STONE` | deep map guardians at Tanglewood, Coral Shallows, Granite Steps, Dawn Temple | Walt | deep maps | Jack, Kraken, Golem, Unicorn can be called | PLAYER.stones | stoneOpen() | pattern-stones | specials |
| costume-cards | unlock lines | contests.js, ranch.js, trips.js, dex.js, town.js | contest wins, festivals, good trip weeks, bestiary counts, the Duck pattern | judges, League stand, Walt, Dr. Ines, Nora | various | a costume can be scanned | PLAYER.cosOpen | cosOpen() | festivals | league |
| expeditions | exploration | explore.js `runExpedition`, `exMap` | Out, Expeditions, from 1 heart; each region once a season | Walt | each open region | a week, +12 fatigue, +4 stress; items, bits from wild bounties | PLAYER.explore, PLAYER.stones, PLAYER.journal | tripRegionCount(), rankIdx() | | exploration |
| rift-edge | exploration | explore.js `exRegions` | best grade C | Walt | the Rift's edge | the last journal page at the far end | PLAYER.journal | rankIdx() | gradeB | rift |
| journal-pages | lore | explore.js `EX_PAGES` | the page circle on each region's map | Helena (written), Josie, Celia, Victor, Walt (named) | 13 regions | none | PLAYER.journal | | | rift, helena |
| pattern-stones | lore + unlock | explore.js `EX_STONE`, scenes.js `stoneGlyph`, monster.js `hatch` | the far circle of six regions' maps | | Cinder Peak, Static Plains, Hollow Moor, Dream Garden, Nightshade Marsh, Glacier Rim | that special can be scanned | PLAYER.stones | stoneOpen() | | specials |
| ines-rift-line | beat line | story.js gradeB | best grade reaches B | Dr. Ines | ranch | the League's teams have been going to the Rift's edge for years | | | rift-edge | rift |
| deep-expeditions | exploration | deep.js `runDeep`, `deepMap` | grade C, and the region's regular map crossed to its far end; once a season | Walt, a team of three | each open region's deep map | two weeks, +20 fatigue and +8 stress on each of the three; rarer items, bounties | PLAYER.deep, PLAYER.stones | deepRegions(), exState().got | expeditions | exploration |
| deep-guardians | boss | deep.js `deepNode` (guard) | the far end of a deep map | the region's teacher (`TEACHER` in areas.js) | each deep map | a tag-team fight; the Kitsune or Vampire stone, or two rare items, and a bounty | PLAYER.stones | stoneList() | rift-teachers | exploration, specials |
| disobey | fight rule | game.js `wilfulness`, arena.js `start` | a tapped move in a fight it controls, below 2 hearts | the player's Snabit | any fight | the move is ignored or swapped | | loyalty() | | care |
| hall-of-fame | retirement | hall.js | Retire in the Freezer, past Bit or past its lifespan | Josie | ranch, yard fence | the Snabit leaves the roster; a statue; next fresh Snabit gets one move and 10% of its training | PLAYER.hall, PLAYER.legacy | | | ranch |
| northreach-cup | cup | tourney.js `cupsOfWeek`, `arRule`; cupshow.js `rules` | Autumn, month 8, week 1, every year | Mira, Northreach breeders | stadium | no guards for anyone; first place opens one licence family | famOpen list | famOpen() | licence-families | leagues |
| week-events | events | events.js `EVENT_LIST` | about 1 week in 4 after week 4; same one not within 8 weeks | breeders from BREEDERS, Nora, a kid, the town paper | ranch | items, bits, stress, spoil, fear, a friendly fight | PLAYER.evSeen | | cups (paper), Nora | ranch |
| tower | ladder | tower.js | Town, grade A | Keepers Quill, Zeno, Ivo, Yuki | town | a week; bits per floor, items at floors 5 to 50 | s.towerBest, PLAYER.towerBest | | | endgame |
| drifter | roamer | roam.js, wild.js `wildCard`, explore.js wild node, dex.js | grade D; 1 in 8 wild scans, half the expedition wild circles in its region | Josie (rumours) | its week's region | beat it and it joins the Freezer | PLAYER.roam | exRegions() | licence-families | exploration |
| trade | online | trade.js | Friends, then Trade | a friend | | two Snabits swap ranches | roster | NET_VER | | friends |
| mystery-codes | rewards | codes.js | Settings, Mystery code | Gid's posts | | items and bits, once per save | PLAYER.codes | | | |
