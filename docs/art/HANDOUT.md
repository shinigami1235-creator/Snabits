# Snabits art direction: handout

This is the handout for the Snabits art work. The pixel monsters were replaced with smooth chibi monsters drawn the way Nong Tape was drawn for the Apex Slim site, with the Mega drawn first and detail taken away for Byte and Bit. The new art is built, pushed and the default since 12 Nov 2026. `#art=pixel` at the end of the address brings back the pixel game. Read "Start here" first.

## Start here

The overnight build of 12 Nov 2026 added the story, the bestiary, contests, festivals, upgrades, late skills and skill sounds (see Decided). Gid gave the go-ahead to build without showing art first, so all of it is waiting for his review. `story.js`, `dex.js` and `contests.js` are the new files.

Before writing any line a player reads, load the my-writing-style and humanizer skills, then run the string lint before every push:

    node tools/lint-strings.mjs          checks the game and the README, fails on an error
    node tools/lint-strings.mjs --test   checks the rules still catch what Gid rejected

Gid caught AI slop in the storyboard lines on 12 Nov 2026 because the skills weren't loaded first, and he asked for the lint so it can't happen again. It fails on dashes, semicolons, curly quotes, "That is" glosses, "not X but Y", split contrasts, beats like "Mostly.", reassurance lines, fragment openers like "Four weeks, and ..." and the banned words. It warns on short verbless sentences and mid-line colons, which need a person to read them. A line that breaks a rule on purpose goes in `ALLOW` at the top of the file with the reason.

## Where everything is

- Game repo: `shinigami1235-creator/Snabits` (it was renamed from `snabits`, and pushes to the old name still go through). The game is in `prototype/` and the art files are in `docs/art/`.
- Live build: https://shinigami1235-creator.github.io/Snabits/prototype/ (add `#art=pixel` for the old pixel art, or `#debug` to see the camera's colour bars and percentages).
- Design doc: https://claude.ai/artifact/PMVvxgWxXbo37jP5CVrMZG. Its mission table and work-hours paragraph are out of date, since missions now play out on screen over game weeks.
- Nong Tape's code: repo `shinigami1235-creator/Apex-Slim-and-Longevity`, files `assets/js/buddy-art.js` (the drawing) and `assets/js/buddy.js` (the live character).
- The monsters are drawn in `prototype/chibi.js`, marks, care variants and hybrids included. `prototype/chibi-hook.js` puts them into the ranch, battle, tiles and stadium, holds the first-pass attacks and the hit effects, the monster sizes, and the waterline cut for swimming. `prototype/moves.js` maps every skill to its animation and holds the second-pass effects (orbs, shards, tornadoes, webs, support effects). `prototype/scenes.js` draws every smooth background (the training places included), the ranch props and particles, and Tala. `prototype/npcs.js` draws Kiko, Nena, Dr. Ines and Benji, the shop, the lab, the camp tent and the trip nights, and runs the trip leave, camp and homecoming and the shop and lab visits. `prototype/info.js` is the info page. `prototype/summon.js` plays the camera summon, the family entrances and the fusion scene. `prototype/music.js` holds the tunes and the crossfades. `prototype/ranch.js` runs the drills, the day fades and the place changes, `trips.js` and `missions.js` the errantry, `heavy.js` the heavy drill scenes, `town.js` the town and Nena's shop, and `lab.js` the lab and the Freezer.
- `tools/lint-strings.mjs` is the string lint (see Start here).
- `prototype/cupshow.js` plays the cup show and holds Mira's and Tala's cup lines (`CUPLINE`). Mira is drawn in `npcs.js` as `mc`.
- The app icons (`prototype/icon-192.png`, `icon-512.png`, `icon-maskable-512.png`) are drawn by `docs/art/icon-maker.html`, and `prototype/manifest.webmanifest` lets Chrome install the game.
- Review sheets: open `docs/art/art-sheets.html` with `#poses`, `#battle`, `#back`, `#ouch`, `#hybrids`, `#marks`, `#variants`, `#bit`, `#elements`, `#worn`, `#effects` (add `-dark` for grass) or `#new` at the end. `docs/art/moves.mp4` plays 37 skills in the real arena and `moves-sheet.png` has a labelled frame of each. In `docs/art/`:
  - `summon-in-game.mp4`, `fusion-in-game.mp4`, `day-transitions.mp4` and `training-places.mp4` are recordings from the game.
  - `training-places.png` shows the six everyday training places.
  - `people.png` shows the four new people with their four faces, next to Tala at full height, drawn by `npc-concept.html`. `errantry-storyboard.png` and `shop-lab.png` are the approved storyboards, made from screenshots of the game.
  - `cup-storyboard.png` is the approved cup show, drawn by the game's own code, and `arena-music-preview.mp3` has the arena drums and the square-off sting.
  - `summon-storyboard.png`, `entrances-storyboard.png` and `fusion-storyboard.png` are the approved storyboards, rendered by `summon-concept.html`.
  - `hybrids-sheet.png` shows every body on every set of legs, and `booly-options.png` the three Booly looks that were tried.
  - `marks-sheet.png` and `variants-sheet.png` show every mark and variant on every family.
  - `info-mockup.png` is the approved info page mockup and `info-in-game.png` the built page.
  - `ranch-sidescroll.png` shows the three-screen ranch, `barn-inside.png` the barn room, `away-scenes.png` the 13 regions and 6 heavy drill places, and `trip-tasks.png` the trip tasks.
  - `stadium-crowd-sizes.png` shows the crowd and battle sizes, `stadium-screen.png` the stadium screen and `intro-scenes.png` the title and intro (the tree there is from before it became an oak).
  - `docs/art/ranch-concept.html` (with `#sizes`, `#spread`, `#ranch`, `#crowd` or `#barn`) holds the approved concept sheets.

## Decided

- **Smooth monsters over pixel art.** The backgrounds get redrawn flat to match, and Gid is fine redrawing everything.
- **Element:** colour at every stage, small element marks on the sides of the face, and a body pattern at Mega (stripes, spots and so on). Nothing from the element goes on the head, since the head holds the modular parts.
- **Chomp** was approved first: a squat box with small teeth at Bit, tiger stripes as the Brawl pattern.
- **Every family looks clearly different.** Pinch is a crab shell. Antik is an old TV with its face on the screen.
- **Booly's trait is a wisp:** a blue ghost flame circling its head, so it reads as more than a plain ghost. Yurei (a forehead triangle and a misty bottom) and Sheet (bedsheet folds and a patch) were tried and dropped.
- **New bodies, drawn but not in the game yet:** Quad (four-legged), Bipped (upright), Flask, Teep (teapot) and Lern (paper lantern). Quad and Flask still need names, and Gid hasn't said whether they join the photo's family pick or come in as rare finds.
- **Your own monster is seen from behind in battle,** and the opponent faces you. Beams and eye or mouth attacks from behind start just past the body's edge on the enemy's side.
- **Hits show an ouch face:** squeezed eyes and gritted teeth.
- **Flashes are for big hits only.** The white body flash, the dark impact frame, the crowd cheer and the lightning screen flash only happen on crits and super-effective hits. Ordinary hits get a short freeze, a small shake and a slight brighten.
- **Effects grow with a skill's power.** Under 55 total power a skill draws small, 55 to 94 medium, 95 and up big, with more pieces and a bigger blast (`movePower` in `moves.js`). Gid asked for weaker moves to look weaker and stronger versions to get the better effects.
- **Support skills have their own effects:** arrows up for buffs, arrows down for drops, a hex bubble for shields (ice for Frost Armor, rock for Shard Wall, steel for Iron Wall), sparkles for heals, a gathering glow on charge turns, and a screen-wide change for fields (sun rays, rain, snow, static, moonlight).
- **Signature skills (11 Nov 2026).** Each family learns its own move at level 5, and worn wings teach Fly. They never appear in scan pools, shops or trips (`SIG_SKILLS`, `FAMILY_SIG`, `sigSkills()` in `skills.js`):
  - Skit: a web in its own element (Fire Web burns, Ice Web freezes, Water Web soaks, and so on), 40 power, always lowers Speed.
  - Pinch: Bunker Down, raises Constitution 2 and Insight 1, drawn as the crab tucking into its shell.
  - Chomp: Crunch, 80 power, may lower Constitution. Squib: Ink Jet, 40 power, 40% Blind. Antik: Static Screen, 45 power, 30% Daze. Moko: Glare, lowers Power and Speed. Stilt: High Kick, 90 power. Booly: Phase Shift, +30% dodge for 3 turns.
  - Bat wings or Angel wings: Fly, 90 power, goes up out of sight on the first turn and dives on the second.
- **New skills, learnable outside the scan pool:** Fire Spin (Blaze, 25 x 3, Burn), Shadow Strike (Shade, 85, can't be dodged, rises out of the target's shadow), Gust (neutral chip, 40, goes first) and Tornado (neutral chip, 90, may lower Speed). Leaf Storm, Inferno and Maelstrom now play as leaf, fire and water tornadoes.
- **Marks look the same on every family (11 Nov 2026).** Stout makes the body 12% wider with a pale belly. Horned puts two horns on the head. Shelled puts a spiked shell on the back, with the rim and spikes showing round the body from the front and the plates from behind. Sage adds two feathery feelers with glowing tips. Haloed floats a gold ring over the head, raised above any hat, horns, feelers or Antik's antenna. Winged adds small feathered wings in the body's colours, and worn wings take their place.
- **Care variants are drawn on every family.** Devoted gets a pink glow and a heart that drifts up. Pampered gets a rounder body, star sparkles in its eyes and a couple of sparkles round it. Feral gets a dark outline, two fangs and narrowed eyes at every stage. Bulky is 12% wider, and Lean is narrower and taller. Wanderer and Moonlit change colours, and Moonlit also gets silver eyes and a few stars. Champion wears a gold medal on a ribbon, with a gold star on its back from behind. Scruffy has tufts of fur round its edge and a few dirt spots.
- **Fusion hybrids (12 Nov 2026)** stand any family's body on any other family's legs, in the smooth art too. A body on Booly's legs floats on a ghost tail, and a body on Squib's legs gets a jelly skirt with tapered tentacles. A hybrid learns its body family's signature skill and stands at the average height of both parents (`hybrid()` in `chibi.js`).
- **Evolution is a surprise.** The scan card no longer shows what the Byte form will look like.
- **The info page (11 Nov 2026)** follows Monster Rancher 2's monster data, with three tabs. It opens from the Info button in the ranch's top bar, by tapping the name, from Care > Skills, and from the skill book's Back button.
  - Status: a portrait, the stage, level, grade, age, height and build, loyalty hearts, the six stats with family ranks, personality, ability, likes and dislikes, a Spoiled to Strict bar for how it's been raised, fatigue and stress as five-step meters, its condition (including "Hungry, no meal yet today"), its marks and variant, and a line from Tala.
  - Skills: four slots and the full list of learned skills, with filters for Strike, Cast and Support. Pick a slot, then tap a skill to put it there. A skill already in another slot swaps over.
  - Record: wins, losses, cups won, fight style, favourite move, mastered skills, trips, marks, birthday, lifespan, and what it did each of the last 8 weeks.
- **Every stage fights with 4 skills,** picked from everything it has learned. Evolution keeps its stat bonus and new look, and it no longer opens slots. There's one loadout and no saved sets. Computer opponents also get 4.
- **Likes and dislikes, the MR2 way.** Each Snabit has one like and one dislike. Either can be a meal (30%), a drill (30%), a snack (15%), something to wear (10%) or battles (15%). Both read "Not found yet" on the info page until they happen the first time, and Tala says so when they do (`TASTE_KINDS`, `taste()` in `ranch.js`).
  - Meal: the old meal effects.
  - Drill: −4 stress and +2 spoil if liked, +8 stress and −2 spoil if disliked.
  - Snack: −5 stress and +3 spoil if liked, +8 stress and −3 spoil if disliked.
  - Something to wear: −3 stress a week if liked, +4 if disliked.
  - Battles: −4 stress and +2 spoil after a fight if liked, +6 stress and −1 spoil if disliked.
  - Monsters from older saves keep their meal like and dislike.
- **Meals follow the phone's calendar (12 Nov 2026),** which sets Snabits apart from MR2's monthly feeding. One meal a day, whatever the game week. Each day it went without one adds 5 stress, 3 weight off and 1 spoil off, up to 4 days, and Tala says so when the ranch opens on a new day (`dayKey()`, `fedToday()`, `hungerCheck()` in `ranch.js`). Snacks stay at one per game week.
- **Item descriptions hint, they don't spell out.** Every meal, snack, item, held item and worn item has a short line like "A minty leaf that relieves stress." or "Sweet and fattening. It'll love you for it." (`DESC` in `game.js`). The exact effect shows after it in brackets when Show hidden numbers is on. The Bitter root's line is "Tastes awful. It listens better afterwards." since in this game it disciplines rather than heals. Gid's own example called it a recovery item, so that can change if he wants it to heal.
- **Training happens at its own place (12 Nov 2026),** MR2-style. Picking a drill fades to black and opens on its place with the training tune. The result, the stat pops and the praise or scold happen there, then the sun sets, night falls, it goes black, and morning comes up at home (`DRILL_PLACE`, `HEAVY_PLACE`, `goPlace()`, `backHome()` in `ranch.js`). Pixel mode keeps the everyday drills in the yard.
  - Laps: a swimming pool. It swims across and back cut at the waterline. A great starts with a dive off the board, and a fail ends bobbing in a red and white swim ring.
  - Boulder push: a rocky trail under a layered cliff with pines.
  - Brace: a batting cage, with a pitching machine firing the balls at its body.
  - Puzzle box: a study room with a chalkboard, a sunny window and shelves. It slides tiles on a wooden cube while three shapes light up in a thought bubble. A great opens it in one go with a lightbulb, confetti and a wind-up mouse, a success takes one wrong try, and a fail snaps the lid on its face and leaves it frustrated with a black scribble over its head (`studyPuzzle` in `ranch.js`, `puzzle.mp4`). Training places zoom in at most 1.1 times so the props show.
  - Meditate: a lotus pond at dawn with bamboo and a stone lantern. It sits on a stone in the pond while ripples spread and the koi gather round. A great makes it float up as the lotuses bloom, and a fail has it doze off until a frog hops onto its head.
  - Dodgeball: an indoor court with painted lines, bleachers and a ball launcher.
  - The heavy drills keep their places (the long road, the quarry, the old fortress, the library, the waterfall shrine and the obstacle course) and use the same fades, music and nightfall.
- **Four new people (12 Nov 2026),** drawn the way Tala is, each with a portrait and four faces (happy, talking, worried, surprised) and a coloured name tag in the speech box (`npcs.js`, `say(text, who)` in `ranch.js`):
  - Kiko, the trip guide: an old ranger with a wide olive hat, a white mustache, a backpack and a walking stick.
  - Nena, the shopkeeper: round glasses, a bun with a pencil through it and a striped apron.
  - Dr. Ines, who runs the lab: wild silver hair and brass goggles pushed up. She does fusion and rebirth.
  - Benji, her assistant: messy hair and thick square glasses. He keeps the Freezer and says how well two Snabits will fuse.
- **Errantry with Kiko (12 Nov 2026),** approved from `errantry-storyboard.png`. Trips and missions both go with him (`tripLeave`, `tripArrive`, `campNight`, `tripHome` in `npcs.js`):
  - He waits by the road to town, the Snabit walks over, and the yard fades to black.
  - The region fades in with a new travel tune, "The Long Road". Kiko stands on the left and coaches each week's task, and on a good week he teaches one of the region's skills.
  - Between trip weeks, and between mission weeks, they camp for a short night by a fire with a tent, stars and a moon, and the night tune plays. Then the next week starts at sunrise.
  - On a mission he says each stop's result, and the end fight still opens in the arena.
  - The last week ends at sunset in the region. They walk into the ranch at night, the screen goes black, and morning comes up at home with Tala's summary.
  - Pixel mode keeps the old walk off and walk back, without Kiko on screen.
- **Trips go through four places (12 Nov 2026),** the way MR2's expeditions move from spot to spot (`TRIP_AREAS`, `AREA_ART`, `TEACHER`, `routeMap` and `showRoute` in `areas.js`):
  - Each of the 13 regions has four places, one a week. The first is the region's own picture and the last is where its teacher lives, such as Snowfield trail, Frozen lake, Ice cave and Summit hut for Glacier Rim.
  - Each place has two tasks and one is picked each week. Task kinds are search, cross, climb, haul, track, dodge, puzzle, fish and lesson, and the place's colours tint the bushes, ledges and water. The task's stat counts toward success along with hearts and fatigue.
  - After each camp night the route map shows on the black screen, and a marker walks to the next place before the morning comes up there.
  - The teacher at the last place is a big Mega with the Haloed mark in the region's colours, for example the Frost Matron (a Squib) or the Foreman (an Antik). A skill learned that week is taught by the teacher, with a better chance than Kiko's weeks.
- **The story (12 Nov 2026, built overnight on Gid's go-ahead, to be reviewed)** mixes three threads (`story.js`):
  - Tala bought the ranch with a 30,000 bit loan from the Grand Ranch, and the player is the ranch hand she hired in the intro. Rook, the son of the family that runs the Grand Ranch, wants the land back for the business (Gid's call). Prize money pays the loan at the Town Hall in town, 1,000 or 5,000 or the rest at a time.
  - Each quarter paid has a scene and opens more of the Workshop: home upgrades at a quarter, the first level of each training place at half, the second level at three quarters. Paying it all brings Rook with the deed and a Life fruit.
  - Rook enters the official cups, the Majors and the Legend Cup with the same Snabit (a Shade monster trained up to each grade), waiting in the other half of a knockout. From grade D there's a rival match with him in week 3 of every month. Wins and losses against him are counted.
  - The first time any Snabit reaches a grade, a scene plays: Rook at D, Nena at C (a second held item in the shop each week), Dr. Ines at B (a signal from the Rift), Kiko at A (The Rift opens for trips), Rook at S, Rook again after all four Majors.
  - Winning the Legend Cup ends it: Rook drops the rest of the loan, and Dr. Ines explains that Snabits come through the Rift as colour and blend in so well that only a Snaboscope can uncover them. "The End" shows, and the game carries on.
  - Rook is drawn like the others: spiky navy hair with a white streak, a navy jacket with gold trim and the Grand Ranch pin, a red scarf, and an orange name tag. During a scene the camera centres between the Snabit and whoever walked in.
  - Out > Goals shows the loan, the next grade step, the record against Rook, the bestiary and contests.
- **The intro (12 Nov 2026):** Snabits are camouflaged in the colour of whatever they hide in, and only a Snaboscope can uncover them (Gid's call). Tala is putting up a job request on the town board for help on her ranch, sees the player and offers them the job. The first Snaboscope trip has no scan limit: after each scan you keep it, scan again, or choose from the last six.
- **The camera picks the main back lens.** Phones with several back lenses could give the game the macro or ultra-wide one, which is blurry past a few centimetres. After the first open it lists the lenses, skips any labelled macro, wide, tele or depth, prefers camera 0 and then the biggest sensor, asks for 1920 by 1080 and turns on continuous autofocus. Flip steps through every back lens and then the front one.
- **The bestiary** (`dex.js`): the 8 families in the 12 elements, 96 kinds. A kind is seen once it's scanned or fought and raised once it lives on the ranch, with a star per stage reached. Unseen kinds show as dark shapes. Prizes at 10, 25, 40, 60, 80 and 96 seen and 3, 8, 15 and 24 raised.
- **Contests** (`contests.js`): one in the first week of every month, taking turns between Strength (Power and Constitution, at the quarry), Speed (Speed and Stamina, on the long road), Smarts (Mind and Insight, in the study room) and Style (loyalty, what it wears and its cups, on the court). Junior for E and D, Senior for C and B, Pro for A and S. Three rounds scored out of 10 against four other entrants. Prizes for the top three, a thing to wear at 1, 3, 6 and 12 wins, and 15 stress off.
- **Festivals:** the Blossom Festival, the Lantern Festival, the Harvest Fair and the Snow Fair, one a season in week 2. Each gives a free item and takes 10 stress off. The calendar shows festivals, contests and rival matches.
- **Upgrades:** the barn gets a Cozy rug (petting takes 3 more stress off), a Toy chest (playing takes 5 more off) and Potted plants (stress -2 a week), each drawn in the barn. Each of the six training places has two levels, drawn as bunting and then lamps and a scoreboard, giving 15% then 30% more from that drill and more great results.
- **Late skills:** every element has two more skills at levels 34 and 42 so grade A and S monsters still learn, and Void has seven. Each uses an effect its element didn't have yet, such as Heat Wave as a push, Ion Beam as a beam, Ice Age as falling ice and Event Horizon as a beam.
- **Sounds for skills and abilities:** each element has its own sound when a skill leaves and when it lands (a crackle for Blaze, a chime for Frost, a splash for Tide, a zap for Spark, a clang for Steel and so on), and beams, lightning, storms, meteors, volleys, pillars and waves have their own on top. Abilities show an aura and particles in their element with the same sound.
- **Moods show on the ranch.** A tired or worn out Snabit droops, with heavy eyelids and a sigh. A rested one with low stress looks fresh, and on some weeks in top shape it looks determined instead (`moodPose()` in `ranch.js`).
- **Forms without arms don't punch.** Jab shows as Headbutt, Iron Palm as Shoulder Ram, Focus Punch as Focus Ram and Haymaker as Big Headbutt until the Snabit grows arms (`skillLabel()` in `skills.js`).
- **Cups follow a fixed calendar (13 Nov 2026)** so a player can plan the rest before one (`cupsOfWeek` in `tourney.js`). Each grade has one regular cup a month on its own week (E in week 0, D in week 1 and so on), the Open Cup runs in week 2 of every other month, and the Friendly match only in week 3 of each season's middle month. The Majors, the Legend Cup, the officials, the Summer Qualifier and the team Summer Exhibition keep their dates. A Snabit can enter cups one grade above its own and everything below. Regular cups give an item, and every cup lowers stress and adds fatigue the way MR2 does.
- **Fight shape on cup day (13 Nov 2026)** comes from fatigue and stress (`fightCond` in `tourney.js`): Top shape fights 5% above itself, Good as it is, Worn 5% below and Exhausted 12% below. The ranch shows the next cup and the fight shape, and Tala says in the lobby and in the week's notes when a cup coming up can raise the grade and how the Snabit will fight.
- **Even fatigue rates (13 Nov 2026),** checked against the MR2 guide. A heavy drill adds 20 fatigue and 10 stress, a light one 10 and 5, and a rest week takes 55 fatigue and 25 stress off (65 with the Better barn), so two heavy drills, a light one and a rest bring it back to Top shape. A trip week adds 14 fatigue and 6 stress, so a whole trip leaves it worn out and one rest clears it. Strain is fatigue plus twice the stress, and at 110 it costs a week of its prime, at 140 two. Stamina still cuts all of it by up to 30%.
- **Liked drills go better.** A liked drill lands more greats and a disliked one more slacks, as in MR2.
- **Strays (13 Nov 2026).** After a trip with at least three good weeks, a wild Snabit of the region may pick a fight on the last day 60% of the time. It fights on its habits, and a win pays three quarters of a cup purse. One time in seven it's the region's champion, tougher and worth twice that.
- **Lifespans are 3 to 4 years** (36 to 48 months by the photo's brightness), so a Snabit reaches S around the middle of its life. The top purses came down to A 5,000, S 8,000, the Majors 15,000 and the Legend Cup 30,000.
- **The ranch's best grade opens things (13 Nov 2026),** listed under Out > Goals (`PERKS` in `game.js`):
  - E: trips to 4 regions, 3 wild fights a week, a Freezer for 20.
  - D: 7 regions, 4 wild fights, rival matches with Rook, new scans start 2 points higher in every stat.
  - C: 10 regions, 5 more Freezer spaces, Nena's second held item, hidden abilities in scans at half the A rate.
  - B: all 12 regions, 5 wild fights, Nena sells the fusion catalysts (Stat seed, Element stone, Lucky bit), scans 6 higher.
  - A: The Rift, 5 more Freezer spaces, hidden abilities twice as often as at C.
  - S: the Majors and the Legend Cup, Nena sells Life seeds, scans 10 higher.
- **Kiko charges for trips:** 800 bits, 3,000 for The Rift.
- **After a cup, a trip or a mission the Snabit goes to bed** in the barn and the screen fades once into the next morning (`toBed` in `ranch.js`). A drill also fades once, sunset straight into morning.
- **The cup show (12 Nov 2026),** approved from `cup-storyboard.png` (`cupshow.js`, hooked into `matchCard`, `afterMatch` and `finishCup` in `tourney.js`). Every cup but the team exhibition plays it, and a tap finishes a line or moves on while Skip ends the show:
  - The first match opens with the lights down, two spotlights sweeping the stands, then the cup's name on a gold ribbon with fireworks. Mira the announcer welcomes everyone with the purse and gives the rules. Tala stands with the Snabit at the entrance tunnel and gives one tip about the first opponent, worked out from the elements and stats (`CUPLINE.advice`). Knockouts then show the draw, eight tiles lighting up with lines to a trophy, the player's in gold and Rook's in orange.
  - Every match starts with a VS card: the two Snabits slide in from each side, VS slams down and Mira calls their names.
  - After each match the winner hops in the ring under a ribbon, Mira sums it up from the turns, HP left and judges' call (`CUPLINE.recap`), and Tala says what it means for the cup when the cup goes on.
  - At the end the top three stand on a podium with the trophy, fireworks and confetti. Mira calls the result and Tala's line depends on the place: a win and a grade up, one win from the trophy, or the prize money going to the loan.
  - Mira is the announcer: a tall swept-up quiff, gold hoops, a purple jacket with gold lapels and a red bow tie, and a microphone. She started as Rico, and Gid said he looked like a girl, so the name changed.
  - Music: "Drums Up", a tom-heavy drum track in D minor, plays under the build-up and the recaps. The VS card has a square-off sting (a rising sweep, two big hits and a brass stab) before the cup tune comes in for the fight, and a cup win plays the win fanfare on the podium. `arena-music-preview.mp3` has both.
- **Six stats, reworked (12 Nov 2026).** Gid merged HP and Guard into Constitution, renamed Spirit to Insight and added Stamina. The index order stays the same so every drill, place, mark and heavy drill keeps its slot (`STATS` in `monster.js`, the rules in `battle.js`):
  - Stamina (0, Laps, Stout mark): a chance of one more energy each turn against the opponent's Stamina, an extra energy at the start with 20% more Stamina, and up to 30% less fatigue from drills, trips, missions, cups and wild fights (`tireMul()` in `game.js`).
  - Power (1, Boulder push, Horned): Strike damage and more crits against a lower Constitution.
  - Constitution (2, Brace, Shelled): sets HP and cuts all damage, at half weight against Strikes and a quarter against Casts since it already sets HP. The battle code still calls it `grd`.
  - Mind (3, Puzzle box, Sage): Cast damage and the chance to land a status, against the target's Insight (`statusOdds`).
  - Insight (4, Meditate, Haloed): hit rate against the target's Speed and resisting statuses. The battle code still calls it `spr`.
  - Speed (5, Dodgeball, Winged): goes first, dodges (the free Attack can miss now too) and sometimes gets a free follow-up Attack when much quicker (`followUp`).
  - The family bases were redone for the new stats with the same total: Pinch leans Constitution, Moko and Booly lean Mind and Insight, Stilt leans Stamina and Speed, Skit Speed and Insight. In a 5,000-fight simulation every family wins 45% to 56% of the time.
  - Contests now judge Strength on Power and Constitution, Speed on Speed and Stamina, and Smarts on Mind and Insight.
- **The scan card shows the ability, the starting skills and the stats.** Growth ranks, the faster and slower stats and the skill count only show with `#debug`, on the ranch and the info page too, since a paid NPC who reveals a Snabit's potential is planned for later.
- **The Snaboscope** stops the camera when the ranch opens and reopens it fresh, reopens a picture that hasn't moved for 2 seconds, and gives up on a lens after 6 seconds. A Light button turns on the phone's flash where the camera has one. The gallery button stays for now and comes out later.
- **Summon and fusion music** (`musCue` in `music.js`): a build-up timed to the scene into a crash, a major chord and a four-note fanfare, and each family has a cry when it appears (`cry()` in `chibi-hook.js`). `summon-music-preview.mp3` has both scores and the eight cries.
- **Meditate at the pond** (`pondMeditate` in `ranch.js`): eyes shut, a growing glow, a dragonfly that lands on its head, a leaping koi and a petal gust, pebbles circling it on a great, two wobbling pebbles on a success, and the frog on a fail. `meditate.mp4` and `meditate-sheet.png` show all three.
- **Battles keep drawing if an effect fails.** A beam's end glow could get a negative size from the far side, which threw and froze the arena for the rest of the session. That's fixed, and a frame that throws now drops the effect in progress.
- **Cups come home at night too.** Going to the stadium fades out first. After the prize ceremony the Snabit walks into the ranch at night and goes to bed, then black and morning, then Tala's notes.
- **The cup opening fades in smoothly.** The lights dim without a black gap, each beat dissolves into the next and the fireworks skip the glow blur, since Gid read the old opening as a stutter.
- **Nena's shop (12 Nov 2026).** Town has Nena's shop and the Workshop. The shop is a place you walk into, with shelves, hats and wings on the wall, a sign, and a counter with the skill chips in a glass case. Snacks and medicine, things to wear, skill chips and selling are all bought from her, and she answers each sale in the box at the top of the panel.
- **The lab (12 Nov 2026)** is a place too: Freezer pods with sleeping shapes, a screen, flasks and the fusion pads under a ring. Dr. Ines greets you and runs fusion and rebirth, and Benji runs the Freezer. Out > Lab and Out > Freezer both open it.
- **Music crossfades slowly.** The old tune keeps playing while it fades out over 2 seconds, and the new one comes up over 2.5 seconds after a short pause. The training tune "Work It Out" plays at the training places until night falls, "The Long Road" plays on trips and missions, and the town tune plays in the shop and the lab.
- **The camera is a plain camera (12 Nov 2026)** with corner marks and an aim ring with a cross in the middle. The live colour bars, element chips and the percentage explanation on the card only show with `#debug`. The summon, the entrances and the fusion were approved from the storyboards and play in the game:
  - Summon, after the shutter and after Scan for gallery photos: a flash and an iris snap, the photo shrinks to a card, a scan line turns it into blocks of its own colours, the blocks spin into a disc on a glowing MR2-style platform with a pillar of light, fall into an egg that cracks, a burst, then the entrance and its name, and the card slides up. The build-up to the burst plays 1.35 times slower than first built so players can take in the effects, which brings the whole summon to about 6.3 seconds. A tap skips it, and dragging the circle afterwards makes a new result without replaying it. Wild battle scans skip it.
  - Entrances: Chomp drops in and chomps twice, Squib floats down, Antik flickers on like an old TV, Moko blinks its eye open, Pinch scuttles in and clacks its claws, Stilt unfolds its legs, Skit drops on a silk thread, Booly fades in from mist. Hybrids use their body family's entrance, and pixel art pops in.
  - Fusion, in the lab: both parents hop, a beam links them, they break into square bits of their own drawings, the bits orbit in two rings and mix colours, crush into a flash, then fly out and build the new Snabit from the feet up before melting into the drawing. The ranch then opens on the new Snabit and Tala says what it kept.
  - Sounds come from the battle sound effects at the snap, the lift-off, the charge, the burst and the crush.
- **Save files.** Settings has Save to a file and Load a save file, and the title screen has Load a save file. The file is `snabits-save.json`, the whole save gzipped into one line, about 4 KB for 20 Snabits, and files from before still load. Phones keep each save as a new file, since a web page can't write over an existing download. Loading asks first since it replaces the game on that device. The game also asks the browser to keep its storage. A refresh never loses the game, but clearing the site's data does. Cloud save with a short code waits for the PvP server, so both share it.
- **Install as an app.** The game has a manifest and icons (a happy Chomp on a night-blue tile), so Chrome can install it from its menu. When Chrome offers the install, an Install Snabits button shows on the title screen and in Settings.
- **The ranch keeps its own day (12 Nov 2026)** instead of following the phone's clock. Each week starts in the morning and stays bright while the player plans it (`ranchHour()`, `dayFade()` in `ranch.js`, and the music follows the same hour).
  - After a drill: one fade to black, then the next morning at home, and Tala's notes for the week come up.
  - A rest week: it falls asleep, the screen fades slowly to black, then the morning light comes up.
  - Trips, missions and cups end the same way, with the night at the ranch before the morning.
  - Skip speeds all of them up.
- **Brace throws aim at the body.** Each ball arcs to about 40% of the way down from the monster's head, so it lands on a small Bit and a tall Mega alike.
- **The intro's hiding tree is a broad oak:** a short trunk flaring into roots, two branches, and a crown much wider than it is tall. The old narrow trunk under a round crown read badly.
- **Weather effects are saved for the farm.** The weather-effects and night-glow skills wait until the farm and environment work.
- **The camera is called the Snaboscope** (renamed from Snabscope, done in the game and README).
- **The ranch is a sidescroller.** It's three screens wide: the barn on the left, the yard in the middle, the training ground on the right with the road to town. The camera follows the monster, zooms in on small ones and can be dragged to look around. It shows the whole width whenever one of the new people is on screen. Trips come home along the road.
- **The inside of the barn is the cozy home.** Tap the barn door to go in, and the "◂ Outside" button to leave. Inside: a hay bed (rest weeks and naps), a toy shelf (tap for fetch on the rug), a wardrobe (opens the worn items), a trophy shelf with a cup per tournament won, a window and a wall lamp that lights at night. Town upgrades show as furniture: the Kitchen is a stove that opens Feed, and the Better barn (saved as "Better hut") gives a bigger bed with a blue quilt.
- **Sizes are real.** A person is 160 cm. Each family has a height at Bit, Byte and Mega (`SIZE_CM` in `chibi-hook.js`): Bits are 35 to 70 cm, Bytes about 1 m, Megas 1.1 to 2.4 m. Every monster is 85% to 115% of that from its photo and keeps it for life. The ranch uses 48 px to a metre, so the fence is 1 m and the barn door 2.3 m. Kiko is 165 cm, Nena 150, Dr. Ines 168, Benji 172, Rook 170 and Mira 172. Battle and the stadium show the difference squeezed, so a Bit facing a Mega is small without being a speck. The height shows on the ranch card next to the shape.
- **Tala lives in the speech box,** as a portrait the way Monster Rancher 2 shows Colt, with four faces (happy, talking, worried, surprised) picked from what she's saying. She has a brown bob with a fringe and a red clip, and a slim build. She's no longer drawn in the yard, and a toy box stands where she was. She still appears full body in the intro scenes.
- **The stadium crowd is people and little monsters of mixed sizes.** A few wave at any time, and everyone stands and cheers on a big hit. A taller stand gets more rows (3 to 5) instead of bigger spectators.

## Where the art is now (12 Nov 2026)

- All 8 game families draw at Bit, Byte and Mega in 32 poses, covering the ranch moods and every battle frame. All 56 hybrids draw too.
- All six marks and all nine care variants draw on every family (`marksBehind`, `marksOver` and the `variant` functions in `chibi.js`).
- All 12 elements have their face marks and Mega patterns.
- Worn items sit on each family's own spots. Families without feet (Squib, Pinch, Skit, Booly) skip boots.
- Effects: glow, flame, shadow, frost and sparkle, each working on the body itself.
- Limb swaps: any arm, hand, leg, foot or tentacle can be robot, slime, vine, light or shadow. What gives a monster a swap isn't decided.
- Every skill in the game has an animation (`MOVE_KIND` in `moves.js`). Contact: bite, tackle, stomp, punch, claw, shadow strike, fly. Projectiles: element orbs (a real fireball, ice star, water drop, venom glob, heart, seed, rock, gear, ink, ki ball) with trails and element blasts, faceted ice shards, beams, volleys, shadow claws, lightning, webs. Area: fire and ice pillars, rock paths, boulders, tornadoes, fire spin, gust, falling ice and meteors, a curling wave, drain, mist. Projectiles leave from the eyes, mouth or hands.
- Battle feel, from the action-juice and lightning-vfx skills: hit stop, screen shake, knockback, sparks, afterimages, a stretch along fast dashes with dust and speed lines, attacker recoil, a stomp that flattens the enemy with stars, a faint that pops into smoke, and hand-drawn lightning.
- Every background is smooth now: the battle field, the cup arena, the stadium screen (crowd, painted ring, podium with confetti), the three-screen ranch, the barn room, all 13 trip regions with their camp nights, the six everyday training places, the six heavy drill places, Nena's shop, the lab and the six intro scenes. The ranch's seasons follow the game's weeks.
- Every ranch prop, trip prop and particle is drawn smooth, the swim ring, the pond frog, the tent and the shop counter included.
- On a laptop the sprite boxes grow with the arena, so the monsters fill it.
- Smooth monsters also show on the scan card, the Freezer, the fusion lab, the first-scan picker, the wild battle card and the info page.
- The camera summon and the fusion scene play in the game, in both the smooth and the pixel art.
- The info page works in both the pixel and the smooth art.
- Knockouts say the monster faints instead of breaking into pixels.

## Next

- **The new arena (in progress, 14 Nov 2026).** Gid approved a real-time arena: a line between two walls, the Snabits facing the camera and looking at each other, four range bands (Close, Near, Mid, Far), focus that fills over time, Shove at Close, swap moves, push and pull, and a scrolling move list in place of the 4-slot loadout. The plan and every family's moveset are in the doc https://claude.ai/artifact/D3krLg77oc8unWRzAbfRLC, the mockup is `docs/art/arena-mockup.png`, and the engine is `prototype/arena.js` (not loaded by the game yet). Stamina fills focus, Mind adds Wither strength, Insight resists Wither. Gid approved the doc on 14 Nov 2026: 60-second fights, a free Shove with a 1.5 second wait, the move names, a walking speed per family (`FAM_WALK`), each family's first move taking its element (`EL_PREFIX`), and every element skill kept. The test arena is `prototype/arena-ui.js`, opened from Practice battle on the title screen or with `#arena` at the end of the address. Practice can use a ranch Snabit as it is (the opponent matches its level and grade), a fresh scan trained to level 30 (the scan card shows Practice with it), or a family preset at level 30. Moves are turns, the MR2 way (14 Nov 2026): whoever acts first goes, the fight and the clock stop while the move plays its full animation from the battle's `ANIM`, then both carry on. The computer takes 0.35 to 0.7 seconds to react, and a Snabit waits 0.6 seconds after its own move before it can act again. In the second balance run families won 39% to 65%. Next: Gid plays the test arena, tune from his feedback, then the full switch (re-aim the attack animations, cups, wild fights and Auto on the new engine).
- Computer opponents don't use signature skills yet.
- An NPC who reveals a Snabit's growth ranks and lifespan for a fee.
- Remove the gallery button from the Snaboscope.
- Cloud save with a short code, built together with the PvP server.
- Gid's answer on the Bitter root: keep it as discipline or make it a recovery item.
- Ideas from the procedural-creatures skill, proposed only: stepping IK legs for Stilt and Skit, a swinging chain for tentacles, tails and Booly's wisp, and more genes read from the photo.
- The last balance run had Pinch winning 59% and Moko 43%, a little wider than the 45% to 56% after the stat rework.
- Later, for the cozy side: furniture and wall colours to buy and place.

## What decides a monster's look

| Source | What it sets | Where |
|---|---|---|
| The photo | Body and parts colours, element (12 kinds), family (8), size and shape, height (85% to 115%), its like and dislike | `monster.js` `hatch()`, `sizeK()` in `chibi-hook.js`, `tastePick()` in `ranch.js` |
| Family | Base silhouette, signature part, signature skill, entrance and height per stage | `FAMILY` in `monster.js`, `FAMILY_SIG` in `skills.js`, `ENTER` in `summon.js`, `SIZE_CM` in `chibi-hook.js` |
| Training | The evolution mark, picked by the stat trained most | `MARK` in `ranch.js` |
| Mega | A second mark | `mark2` |
| Feeding | Thin to heavy, drawn wider or narrower | `SHAPES` in `ranch.js` |
| Care | A variant | `VARIANT_TEXT` in `ranch.js` |
| Shop | Worn items in 5 slots (wings also teach Fly) | `WORN` and `drawWorn()` in `town.js` |
| Fusion | A hybrid: one family's body on another's legs | `registerHybrid()` in `game.js`, `hybrid()` in `chibi.js` |

| Family | Body | Signature part | Signature skill | Bit / Byte / Mega |
|---|---|---|---|---|
| Squib | Jellyfish dome | Tentacles | Ink Jet | 40 / 85 / 150 cm |
| Antik | Old TV | Antennae, face on the screen | Static Screen | 60 / 120 / 200 cm |
| Chomp | Wide box | Big toothy mouth | Crunch | 50 / 100 / 170 cm |
| Moko | Oval | One big eye | Glare | 50 / 95 / 160 cm |
| Pinch | Crab shell | Big claws | Bunker Down | 45 / 90 / 150 cm |
| Stilt | Pill on long legs | Long jointed legs | High Kick | 70 / 140 / 240 cm |
| Skit | Flat body | Spider legs, no arms | Web in its element | 35 / 70 / 110 cm |
| Booly | Floating cone | Ghost tail and a blue wisp | Phase Shift | 55 / 110 / 190 cm |

| Stat trained most | Mark | What it adds |
|---|---|---|
| Stamina | Stout | A wider body and a pale belly |
| Power | Horned | Two horns |
| Constitution | Shelled | A spiked shell on the back |
| Mind | Sage | Two feathery feelers with glowing tips |
| Insight | Haloed | A gold halo |
| Speed | Winged | Small feathered wings |

Care variants: Devoted (pink glow, a drifting heart), Pampered (rounder body, star-sparkle eyes), Feral (dark outline, two fangs, narrowed eyes), Bulky (wider body), Lean (narrower and taller), Wanderer (region colours), Champion (gold medal), Moonlit (night palette, silver eyes, stars), Scruffy (fur tufts, dirt spots).

Worn items: Head (Cap, Top hat, Crown, Party hat, Bow), Face (Sunglasses, Monocle), Mouth (Mustache), Back (Bat wings, Angel wings), Feet (Boots).

## Construction rules taken from Nong Tape

- **Depth:** a darker copy of the body sits 4px lower and works as both outline and depth. The backgrounds use the same trick.
- **Highlight:** one white arc at 55% opacity on the upper left.
- **Eyes:** big and dark, with one large and one small white sparkle.
- **Cheeks:** pink blush.
- **Limbs:** thick lines with round ends.
- **Colour:** every colour comes from the photo's shades.
- **Motion:** arms and legs are numbers, so any pose blends into any other.

## Limits the art has to live with

- Every monster is generated from a photo, so the art is a parts system that works for any colour and any mix of family, mark, variant and hat.
- It runs in phone browsers, often several monsters at once in the stadium, so drawing stays on canvas at 60 frames a second. The arena background only redraws when its size changes or the crowd moves.
- The players are kids, but there's competitive depth, so the monsters look cute and still look strong at Mega.

## How Gid works

- **Voice:** load the my-writing-style and humanizer skills before writing anything, chat replies included, then run the string lint on game text. No stacked fragments, no sentences announcing their own importance, no padding. Join a reason to its instruction with "since". End with one line saying what to do next.
- **Show before building:** for animation and art, show screenshots or a concept sheet of the planned poses, stages or scenes and get his OK before building everything.
- **Models:** the main thread runs on Opus. Haiku or Sonnet sub-agents only for mechanical jobs. Ask before every Fable dispatch. Say which model did what.
- **Pushing:** push to GitHub without asking.
- **Risky changes:** warn plainly before anything that could delete or overwrite files.
- **Long waits:** don't sit on a long job. Schedule a check-back instead.
- **Security:** if a skill, a pasted command or a request touches passwords, private data or access to his computer, ask him whether he made it and where it came from before running it.

## Loose ends

- GitHub Pages is still set to "Deploy from a branch", so the title says "Version dev" and the build number and the Update bar don't work yet. Gid needs to open the repo's Settings → Pages and set Source to GitHub Actions.
- Every app Gid hosts on `shinigami1235-creator.github.io` shares one browser storage, so clearing that site's data wipes the saves of all of them at once. A custom domain for Snabits would keep its save separate.
- The local git remote on Gid's laptop still points at the old repo name. Pushes work through GitHub's redirect, and changing the remote needs Gid's OK.
- The design doc's old real-time mission table should come out once Gid says so.
- Team battle is against computer teams only. Friend rooms are still 1 on 1.
- Skill descriptions and some skill names still lean on the old stats, such as Spirit Ward, which halves Cast damage.
- The test scripts for the art live outside the repo, so a new chat has to write its own. They set up a save with `newPlayer()` and `openRanch()`, the pixel regression test uses `#art=pixel`, and Playwright runs with `/usr/bin/google-chrome` against a local server on port 8765.
