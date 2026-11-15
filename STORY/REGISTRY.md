# Snabits story registry

Every piece of story in the game, one row each, seeded from `story.js` and `onboard.js` on 15 Nov 2026. A beat fires once and is marked in `story().seen[id]` with the week it played (`playBeat` in `story.js`), and `nextBeat` picks which one is due at the end of a week. Add a row in the same change as the code.

| id | type | file | trigger | who | where | changes | sets | reads | calls back to | arc |
|---|---|---|---|---|---|---|---|---|---|---|
| onboard | intro | onboard.js `OB_INTRO` | new game | Tala | town board, first Snaboscope trip | first Snabit, unlimited scans on the first trip | | | | main |
| intro | beat | story.js | end of the first week | Tala, Rook | ranch | the loan and Rook's deal: win the Legend Cup first and his father drops the rest | seen.intro | | onboard | loan, rival |
| loan25 | beat | story.js | a quarter of 30,000 paid at the Town Hall | Tala | ranch | Workshop builds barn upgrades | seen.loan25 | story().paid | intro | loan |
| loan50 | beat | story.js | half paid | Tala | ranch | first level of each training place | seen.loan50 | story().paid | loan25 | loan |
| loan75 | beat | story.js | three quarters paid | Tala | ranch | second level of each training place | seen.loan75 | story().paid | loan50 | loan |
| loan100 | beat | story.js | all paid | Rook | ranch | the deed, and Rook's line that the cups go on | seen.loan100 | story().paid | intro | loan, rival |
| gradeD | beat | story.js | best grade reaches D | Rook | ranch | rival matches in week 3 of every month | seen.gradeD | bestGrade() | intro | rival |
| gradeC | beat | story.js | best grade reaches C | Nena | ranch | a second held item in the shop each week | seen.gradeC | bestGrade() | | shop |
| gradeB | beat | story.js | best grade reaches B | Dr. Ines, Tala | ranch | the Rift signal: every scanned Snabit gives off the same faint signal | seen.gradeB | bestGrade() | | rift |
| gradeA | beat | story.js | best grade reaches A | Kiko | ranch | The Rift opens as a skill trip | seen.gradeA | bestGrade() | gradeB | rift |
| gradeS | beat | story.js | best grade reaches S | Rook | ranch | the Majors open | seen.gradeS | bestGrade() | gradeD | rival |
| master | beat | story.js | all four Majors won | Rook | ranch | the Legend Cup opens | seen.master | anyMaster | gradeS | rival |
| legend | beat | story.js | Legend Cup won | Rook, Dr. Ines, Tala | ranch | Rook's family drops the loan (or gives a Life fruit), Dr. Ines explains Snabits come through the Rift, "The End" | seen.legend | story().legendWon | intro, gradeB | rival, rift, loan |
| festivals | event | story.js `FESTIVALS` | week 2 of months 1, 5, 7, 10 | Tala | ranch | a free item, 10 stress off | | weekParts | | seasons |
| rift-teachers | teacher | areas.js `TEACHER` | last place of each region's trip | 12 teachers and the Rift Lord | regions | better skill teaching that week | | | | regions |
