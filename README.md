# Lute Roll

Roll a d20, learn the tune, earn the XP.

Lute Roll is a daily melody game for the Reddit Game of the Day Hackathon. Each day you roll a twenty-sided die. The roll sets how hard your melody is and seeds the melody itself. You listen to the tune, then tap it back note by note on an on-screen keyboard. Every play earns XP. Harder melodies and cleaner playing pay more. Botch it badly and the tavern throws tomatoes.

One sentence version: roll the die, learn the tune, earn the XP, come back tomorrow.

## How it plays

1. **Roll a d20:** High roll means an easier melody. **Nat 20** is the easiest tune with a **3.0x crit payout**. **Nat 1** is the hardest (*Brutal*) tune, still clearable, and pays **3.0x**. You get **1 reroll per day** and can replay as many times a day as you want.
2. **Listen & Replay:** Watch the keys light up as Web Audio plays the daily melody, then tap it back note for note on the on-screen keyboard.
3. **Score & Survive:** Hit **50%+ accuracy** to clear and earn XP (below 50% = tomatoes & 0 XP). Maintain a **3-day streak** to unlock **Ward of Grace** (1 free missed note per run; **2** at a 7-day streak) and earn a **Streak Freeze** every 5 days.
4. **Collect & Progress:** Earn up to **2 Mystery Chests per day** to collect **75 Chest Relics** (with 3-pull duplicate pity), forge **10 Earned-Only Mythic Relics** through hard challenges, streaks, and high levels (0% chest RNG), and unlock **13 synthesized lute, piano, organ, and synth voices** (*Tavern Upright* & *Tavern Lute* start unlocked). Level up across **15 Bard Title tiers** from *Busker* (Lvl 1) to *Mythic Maestro* (Lvl 100), complete **Daily Bounties**, and unlock **25 Feats**.
5. **Compete on Reddit:** Your Bard Title syncs to your `r/luteroll` user flair. Share your Wordle-style emoji result card (`🟩🟦🟥`) in the daily thread, help fill the subreddit's **Tavern Tip Jar** for a **+15% Encore XP** buff, and climb the **Daily, Weekly, and All-Time** leaderboards.

## Contest

Reddit Game of the Day Hackathon, Nov 11 to Dec 8, 2026. Submissions close Dec 8, 2026 at 9:00 PM ET.

- Subreddit: r/luteroll
- Contest page: https://redditgameofday2026.devpost.com/
- Targets both top prizes: Best Daily Game ($15,000) and Best Ported Daily Game ($6,000). Lute Roll is a port of my own College of Keys IP: the d20 Performance Check (issue 25) and the Daily Quest System (issue 53).

## Status

Playable & verified on Devvit Web (`r/luteroll` & `r/lute_roll_dev`), featuring:

- **Live 3D d20 Tavern Tray & Unlockable Dice Skins:** Three.js + Cannon-es physics-driven d20 roll with idle candlelit spin, wood/felt collision audio, **5 unlockable d20 dice skins** (*Tavern Gold*, *Emerald Felt*, *Obsidian & Crimson*, *Starlight Crystal*, *Astral Galaxy*), server-authoritative roll integrity, 1 daily reroll, and 650ms reveal banner with Nat 20 confetti & Nat 1 rumble.
- **Deterministic Daily Melodies & Encore Challenges:** Seeded per `UTC date + player + roll`, auto-played via Web Audio with warm tavern room ambience, root-5th lute cadence cue, lit key guides, and visual progress pips. After your first daily clear, unlock **Encore Challenge Modes** (**No-Lights** or **Fast Tempo +20%**) for **+50% Bonus XP**.
- **Bardic Gauntlet (Rival Duels):** Throw a **Bardic Gauntlet** after clearing a tune or accept a **Random Gauntlet** to duel another bard's exact `(utcDate, seedKey, roll)` melody for **+35 XP** victory bonuses.
- **13 Unlockable Voices, Painted Keyboard Decks & Note Sparks:** *Tavern Upright*, *Tavern Lute* (both free at start), *Saloon Honky-Tonk*, *Baroque Harpsichord* (with authentic inverted ebony & gilded ivory keys), *Clockwork Music Box*, *Velvet Electric Keys*, *Funky Clavinet*, *Cathedral Pipe Organ*, *Tavern Concertina*, *Arcane Lead Synth*, *Gilded Carillon*, *Starlight Celesta*, and *Astral Concert Grand* — each visually transforms the keyboard with hand-painted instrument deck textures (carved cedar lute, baroque crimson velvet, clockwork brass, arcane astral) and **5 unlockable Note-Hit Spark skins**.
- **Tiered Chibi Bard Portraits, Animal Familiars, Auras & Earned-Only Mythics:** Choose from **23 Tiered Chibi Bard portraits** (5 Day-1 starters, escalating through Common, Uncommon, Rare, and 7 **Mythic** portraits) or toggle your Reddit Snoovatar, pair with **6 collectible Animal Familiars** (*Tavern Songbird*, *Lute Fox Kit*, *Ginger Tavern Cat*, *Scroll Owl*, *Ember Drake Hatchling*, *Astral Fox-Sprite*), and equip **26 Stage Auras**, **Crest Pins**, and **Bard Epithets** from the **Tavern Vault** — backed by **85 Relics** (`75` Mystery Chest Relics + `10` Earned-Only Challenge/Streak Mythic Relics with 0% chest RNG) and **25 Feats**.
- **Mobile & Desktop Controls:** Thumb-friendly 2-row touch keyboard (`C5–C6` over `C4–B4`) with mobile haptics & customizable hit sparks, plus full 2-octave desktop keyboard shortcuts (`Z–M` + `S D G H J` for `C4–B4`, `Q–I` + `2 3 5 6 7` for `C5–C6`), with out-of-range keys dimmed per tier and an expanded-mode Tavern Guide accessible before rolling.
- **Reddit-Native Loop:** Live splash stat (*"X bards have rolled today"*), automatic `r/luteroll` user flair sync, Snoovatars & Epithets in **Daily / Weekly / All-Time** leaderboards, server-verified one-tap Wordle-style emoji result cards with a **composite Layered Bard + Familiar + Aura PNG banner** embedded directly in Reddit comments, Community Co-Op **Tavern Tip Jar** (+15% Encore XP) & **Tavern Pulse**, subreddit subscribe CTA, auto-stickied daily UTC midnight post scheduler with *Yesterday's Headliner Bard* and *Monday Weekly Headliner Spotlight* recaps, and Devvit Journeys telemetry.

> **HACKATHON DEPLOYMENT RULE — DO NOT PUBLISH:**
> Never run `devvit publish` (or `npm run launch`). Per the Reddit Game of the Day Hackathon rules, apps must remain **private/unpublished** during the contest. Use `npm run dev` (`devvit playtest`) for live testing and `npm run deploy` (`devvit upload`) to upload private versions.

## Tech

Devvit Web, React, TypeScript, Hono, Redis, Three.js, Tailwind CSS, and Web Audio API as a Reddit Interactive Post. Melodies are generated originals, deterministic per date and final roll. Audio is Web Audio only. No real songs, no licensed music.

## Docs

- PRD.md: the full product requirements document.
- assets/ASSETS.md: the asset manifest, every asset with its source.

## Inspiration, not a copy

Lute Roll borrows the look and feel of my College of Keys piano practice app (https://github.com/kiyoshithekidd/college-of-keys): the cozy tavern theme, the gold d20 on dark green felt, and the d20 roller approach from issue 25. It does not copy that repo. No Electron code, no Web MIDI, no MusicXML, no Grimoire song library, no Quest Board. Assets copied into this repo live under assets/images/ and are listed in assets/ASSETS.md.

## IP guardrails

Generic fantasy terms only. Never use "Dungeons & Dragons", "D&D", the ampersand dragon logo, "Dungeon Master" (use Game Master or Tavern Keeper), "d20 System", Forgotten Realms, Faerun, beholder, mind flayer, or any named D&D character, setting, or art. Safe: d20 as a plain term, nat 20, critical hit and critical fail, bard, tavern, quest, hit points. Game mechanics cannot be copyrighted, and the D&D System Reference Documents are under Creative Commons CC-BY-4.0.
