# Lute Roll: Antigravity starter prompt (Milestone 1)

Copy everything in the block below into Antigravity. Attach PRD.md with it.

```
Build Lute Roll, a daily melody game for the Reddit Game of the Day Hackathon, as a Devvit Web React app that runs as a Reddit Interactive Post in r/luteroll.

Target repo for this build: https://github.com/kiyoshithekidd/LuteRoll
That repo is currently empty except for a README. This is where the new app lives.

Source of truth: the attached PRD.md (Lute Roll PRD v1.0, Nov 12, 2026). Follow it. Where the PRD marks something [proposed], pick a sensible default and flag it. Where it marks something [decided], do not change it.

Milestone 1 only. Do not build the full game yet.
Goal: a hello-world Devvit Web app deployed as an unpublished test post in r/luteroll, proving the platform works before game logic.
1. Scaffold a Devvit Web React app in the LuteRoll repo.
2. Render a mobile-first Interactive Post: title "Lute Roll", tavern-styled placeholder screen, one button that shows a test state change (for example, "Roll" shows a placeholder result). No game logic yet.
3. Wire up the Devvit config and the local playtest and deploy commands. Verify it loads in r/luteroll.
4. Do NOT publish the app. Upload and playtest only.

Use my other GitHub repo as inspiration only. Do NOT copy it.
Inspiration repo: https://github.com/kiyoshithekidd/college-of-keys
That is my College of Keys piano practice app (Electron, desktop). Lute Roll is a port of its idea, not a copy of its code. Take the look, the feel, and the pieces listed below. Leave the rest behind.

What to borrow:
- Visual direction: cozy fantasy tavern, warm wood, gold, dark green felt. Bard flavor is the identity, not a skin.
- The d20 idea from College of Keys issue 25: a gold d20 on dark green felt, physics roll, die drawn live, result decided by the face that lands up. For Milestone 1, plan for this. Do not build the roller yet.
- The keyboard and practice UI layout in index.html and renderer.js as a layout reference only.
- The bard title ladder and tavern tone from PERSONAS.md and the PRD (Busker up to Legend of the Tavern).

Assets you may pull, only if the Milestone 1 screen actually uses them. Copy the single file into this repo under assets/, do not import the whole repo:
- college-of-keys/assets/images/dice-tray/tray-felt.png (dark green felt for the dice tray)
- college-of-keys/assets/images/dice-tray/tray-wood.png
- college-of-keys/assets/images/dice-tray/d20-roll-button.png
- college-of-keys/assets/images/menu/tavern-menu-scene.png (tavern backdrop reference)
- college-of-keys/assets/images/logo/title-logo-crest-transparent.png (crest style reference only, do not reuse the College of Keys title)
- college-of-keys/assets/images/practice/practice-stage-backdrop.png
- college-of-keys/assets/images/profile/bard-profile-banner.png
- college-of-keys/assets/images/notation/parchment-scroll-tile.png
- college-of-keys/assets/images/icons/streak-flame-transparent.png
- college-of-keys/assets/images/icons/bounty-seal-transparent.png
- college-of-keys/assets/images/icons/icon-play.png
- college-of-keys/assets/images/icons/icon-settings.png
- college-of-keys/assets/images/grimoire/grimoire-open-book.png
- college-of-keys/assets/images/quest-board/quest-board-closeup.png
Keep the bundle small. No heavy asset on first load. Resize or compress anything you pull for mobile web.

Code to study, not to copy verbatim:
- college-of-keys/d20-roller.js: Three.js plus cannon-es, gold icosahedron, 5x4 numbered face atlas, reads the top face on settle. When we build the roller later, reimplement it in browser-safe ESM for React. No require(), no Electron APIs, no Node-only code.

Do NOT bring over:
- Electron shell (main.js), Web MIDI, MusicXML converter, notation engine, Grimoire song library, Quest Board YouTube-to-MIDI, python_ml, or any desktop-only code.
- No real songs and no licensed music. Melodies will be generated originals (PRD section 6). That comes after Milestone 1.
- No falling-note highway, duels, setlists, achievements beyond flair, or Snoovatar. Those are v2.

Hard IP guardrails. Never use: "Dungeons & Dragons", "D&D", the ampersand dragon logo, "Dungeon Master" (use Game Master or Tavern Keeper), "d20 System", Forgotten Realms, Faerun, beholder, mind flayer, any named D&D character or setting, or any D&D art or logo.
Safe: d20 as a plain term, nat 20, critical hit and critical fail, bard, tavern, quest, hit points.

Tech constraints:
- Devvit Web, React. Mobile-first. Most players are on phones.
- Web Audio later, not in Milestone 1.
- Fast load inside a Reddit post. Small bundle.
- Subreddit is r/luteroll. Deadline is Dec 8, 2026 at 9:00 PM ET. Milestone 1 is days 1 to 3, so do not leave platform setup to the end.

Acceptance for Milestone 1:
- The app builds, the playtest post loads in r/luteroll on mobile, the test button works, and nothing is published.
- Tell me the exact commands to playtest and redeploy, and what you borrowed from College of Keys versus what is new.
- List any Devvit quirk you hit and how you worked around it.
```

## Notes for Kiyoshi (not part of the pasted prompt)

- Checked Nov 14, 2026: the LuteRoll repo is empty except for a one-line README ("# LuteRoll"), created Nov 14, 2026. It holds no assets yet. The assets above all live in college-of-keys.
- College of Keys asset folders checked Nov 14, 2026: dice-tray (3 files), menu (1), logo (1), practice (1), grimoire (1), icons (9), profile (1), quest-board (1), notation (1), samples/piano (folder).
- Subreddit branding (approved Nov 12) lives locally, not in either repo: ~/workspace/lute-roll/lute-roll-banner.png and ~/workspace/lute-roll/lute-roll-icon-v2.png.
- Next prompt after Milestone 1 lands: core loop (roll, seeded melody, listen and repeat, keyboard, accuracy, XP), PRD sections 4 to 8.
