# Snabits art direction: handout

This is the handout for the chat that settles how Snabits monsters look. The plan is to drop the 20×20 pixel monsters and draw them the way Nong Tape was drawn for the Apex Slim site, smooth vector chibi shapes, then strip detail away to get the Bit and Byte stages from the Mega. Nothing about the art has been built yet. Start by reading this, looking at the two pictures in `docs/art/`, and answering the open decisions below with Gid before writing code.

## Where everything is

- Game repo: `shinigami1235-creator/snabits`. The game is in `prototype/` and the art files for this chat are in `docs/art/`.
- Live build: https://shinigami1235-creator.github.io/Snabits/prototype/
- Design doc: https://claude.ai/artifact/PMVvxgWxXbo37jP5CVrMZG. Its mission table and work-hours paragraph are out of date, since missions now play out on screen over game weeks.
- Nong Tape's code: repo `shinigami1235-creator/Apex-Slim-and-Longevity`, files `assets/js/buddy-art.js` (the drawing) and `assets/js/buddy.js` (the live character).
- `docs/art/nong-tape-reference.png` shows Nong Tape in 8 poses and expressions.
- `docs/art/chomp-stages.svg` (and `.png`) is the first sketch of a Chomp as Bit, Byte and Mega.

## What the game is now

Snabits is a phone web game in plain JavaScript with no build step. A camera photo's colours hatch a monster, which you raise Monster Rancher 2 style. The latest push (commit `9b0bab5`, 11 Nov 2026) added:
- a title screen with Continue and New game;
- a 4-panel intro where Tala gives the player the Snabscope, which is the phone's camera;
- a first scan where the player scans 3 things and keeps 1, then walks it to the ranch;
- Team battle, a 6 on 6 mode for monsters that are Mega or past their prime.

Most players are on phones, but Gid checks it on his laptop, so every screen also has a laptop layout (the media query at the end of `prototype/ui.css`).

## How monsters are drawn today

- `monster.js` builds a 20×20 grid of numbered pixels from the family's body rows, legs, eyes, mouth, arms and top. `paint()` turns the grid into a canvas, and `scale2x()` doubles it to 40×40 for Byte and Mega.
- The palette comes from the photo. The main colour's average RGB becomes the body, the second colour becomes the parts (a darker body shade on a mono scan), and a third colour becomes the accent. The dark and outline shades are worked out from the body. A black main colour gives a near-black body with gold pupils.
- On the ranch, `makePuppet()` in `ranch.js` splits the grid into body, eyes, mouth and legs so the monster can move. These poses are in use: idle, walk, run, happy, sad, tired, hurt, dizzy, effort, eat, sleep, sit, lean, guard and float.
- In battle, each side is one canvas (`#b-me-sprite`, `#b-foe-sprite`) with CSS classes for hit, cast, guard and knockout.

## What decides a monster's look

The new art has to cover every one of these, since they're all live game systems:

| Source | What it sets | Where |
|---|---|---|
| The photo | Body and parts colours, element (12 kinds), family (8), size and shape | `monster.js` `hatch()` |
| Family | Base silhouette and signature part | `FAMILY` in `monster.js` |
| Training | The evolution mark, picked by the stat trained most | `MARK` in `ranch.js` |
| Mega | A second mark | `mark2` |
| Care | A variant | `VARIANT_TEXT` in `ranch.js` |
| Shop | Worn items in 5 slots | `WORN` and `drawWorn()` in `town.js` |
| Fusion | A hybrid: one family's body on another's legs | `registerHybrid()` in `game.js` |

The families and the part each one has to keep at every stage:

| Family | Body | Signature |
|---|---|---|
| Squib | Round dome | Tentacles |
| Antik | Rounded box | Two legs and a top antenna |
| Chomp | Wide box | Big toothy mouth |
| Moko | Oval | One big eye |
| Pinch | Square | Big claws |
| Stilt | Thin body | Long legs |
| Skit | Flat body | Spider legs, no arms |
| Booly | Tall cone | Ghost tail |

The 12 elements are Blaze, Brawl, Spark, Wild, Frost, Tide, Venom, Charm, Stone, Light, Steel and Shade. The Byte look adds one of 6 marks, set by the stat trained most:

| Stat trained most | Mark | What it adds |
|---|---|---|
| HP | Stout | A wider body and a pale belly |
| Power | Horned | Horns |
| Guard | Shelled | A spiked shell |
| Mind | Sage | Antennae |
| Spirit | Haloed | A gold halo |
| Speed | Winged | Small wings |

Mega keeps that mark and adds a second.

The care variants are:

| Variant | Look |
|---|---|
| Devoted | A soft glow |
| Pampered | A rounder body and sparkly eyes |
| Feral | Sharp teeth and a dark outline |
| Bulky | A wider body |
| Lean | Longer legs |
| Wanderer | The colours of the region it roamed |
| Champion | A champion's crest |
| Moonlit | A night palette and silver eyes |
| Scruffy | Messy fur |

Worn items go in 5 slots:

| Slot | Items |
|---|---|
| Head | Cap, Top hat, Crown, Party hat, Bow |
| Face | Sunglasses, Monocle |
| Mouth | Mustache |
| Back | Bat wings, Angel wings |
| Feet | Boots |

The Chomp sketch gave Mega a Brawl headband and brows from its element. That clashes with the game as built, since Byte and Mega features come from training marks, not the element. One of the open decisions is whether the element adds anything beyond colour.

## Why Nong Tape worked

These are the construction rules the sketch copied:
- **Depth:** a darker copy of the body sits 3 to 4px lower and works as both outline and depth.
- **Highlight:** one white arc at 55% opacity on the upper left.
- **Eyes:** big and dark, with one large and one small white sparkle.
- **Cheeks:** pink blush.
- **Limbs:** thick lines with round ends.
- **Colour:** every colour comes from one family of shades, with no extra hues.
- **Motion:** each arm is 3 curve segments, so any pose can blend into any other. Faces cross-fade and the eyes follow the pointer.

## The proposal from the last chat

- **Mega first:** draw the Mega in full, then remove things for the earlier stages.
- **Byte:** loses the extra details.
- **Bit:** keeps only the silhouette, the eyes, the feet and the colour.
- **The signature part survives to Bit:** a Moko Bit still has its one eye, so a kid can tell the Bit and the Mega are the same monster.
- **Colours stay procedural:** the photo's colour becomes the body, and the rim, highlight and belly are worked out from it, so every scan still looks different.

## Open decisions for Gid

1. **Smooth monsters on a pixel world?** The ranch, the regions, the stadium, the intro scenes and the Jersey 10 font are all pixel art, and a smooth monster on a pixel field looks pasted on. Option A: smooth monsters now, then redraw the backgrounds in the same flat style over a few sessions. Option B: draw smooth, shrink to about 48px and blow it up again for a pixel look, which keeps the world but loses most of the charm and the smooth poses. The last chat recommended A.
2. **What the element adds.** It could be colour only, or colour plus a small element detail at Mega, such as a flame tip for Blaze or an ice crest for Frost.
3. **The first family to build.** The last chat suggested Chomp at all three stages with a few poses, placed in the real ranch and battle screens before touching the other seven.

## Every place the art shows up

- Battle sprites in `battle-ui.js`, which also serve cups, missions, wild battles, friend rooms and Team battle.
- The ranch scene, the puppet poses and props (`ranch.js`), and region art for missions and trips (`errantry.js`, `REGION_ART`).
- The stadium in `venue.js`.
- Tiles on the scan result sheet, the Freezer, the fusion lab and the first-scan picker (`.mon-tile`).
- The title and intro scenes, plus Tala, drawn in pixels in `onboard.js` (`OB_SCENES`, `obTala`).
- Worn items in `drawWorn()`, which have to sit on any body shape.
- Hybrid families from fusion.

## Limits the art has to live with

- Every monster is generated from a photo, so the art has to be a parts system that works for any colour and any mix of family, mark, variant and hat. Hand-drawing each monster isn't possible.
- It runs in phone browsers, often several monsters at once in the stadium. Drawing should be canvas or inline SVG, cheap enough for 60 frames a second on a mid-range phone.
- The players are kids, but there's competitive depth, so the monsters can look cute and still look strong at Mega.

## How Gid works

- **Voice:** write everything in his voice, chat replies included, using the my-writing-style and humanizer skills. No stacked fragments, no sentences announcing their own importance, no padding. Join a reason to its instruction with "since". End with one line saying what to do next.
- **Show before building:** for animation and art, show screenshots of the planned poses or stages and get his OK before building everything.
- **Models:** the main thread runs on Opus. Haiku or Sonnet sub-agents only for mechanical jobs. Ask before every Fable dispatch. Say which model did what.
- **Pushing:** push to GitHub without asking.
- **Risky changes:** warn plainly before anything that could delete or overwrite files.
- **Long waits:** don't sit on a long job. Schedule a check-back instead.

## Loose ends from the last chat

- GitHub Pages is still set to "Deploy from a branch", so the build number and the Update bar don't work yet. Gid needs to open the repo's Settings → Pages and set Source to GitHub Actions.
- The design doc's old real-time mission table should come out once Gid says so.
- Team battle is against computer teams only. Friend rooms are still 1 on 1.
- Tests live outside the repo in the old chat's workspace. They open the game with `#test` in the address to skip the title screen.
