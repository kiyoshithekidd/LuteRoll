# Lute Roll

Roll a d20, learn the tune, earn the XP.

Lute Roll is a daily melody game for the Reddit Game of the Day Hackathon. Each day you roll a twenty-sided die. The roll sets how hard your melody is and seeds the melody itself. You listen to the tune, then tap it back note by note on an on-screen keyboard. Every play earns XP. Harder melodies and cleaner playing pay more. Botch it badly and the tavern throws tomatoes.

One sentence version: roll the die, learn the tune, earn the XP, come back tomorrow.

## How it plays

1. **Roll a d20:** High roll means an easier melody. **Nat 20** is the easiest tune with a **3.0x crit payout**. **Nat 1** is the hardest (*Brutal*) tune, still clearable, and pays **3.0x**. You get **1 reroll per day** and can replay as many times a day as you want.
2. **Listen & Replay:** Watch the keys light up as Web Audio plays the daily melody, then tap it back note for note on the on-screen keyboard.
3. **Score & Survive:** Hit **50%+ accuracy** to clear and earn XP (below 50% = tomatoes & 0 XP). Maintain a **3-day streak** to unlock **Ward of Grace** (1 free missed note per run; **2** at a 7-day streak) and earn a **Streak Freeze** every 5 days.
4. **Collect & Progress:** Earn up to **2 Mystery Chests per day** to collect **48 Tavern Relics** (with 3-pull duplicate pity) and unlock **12 synthesized piano, organ, and synth voices**. Level up across **15 Bard Title tiers** from *Busker* (Lvl 1) to *Mythic Maestro* (Lvl 100), complete **Daily Bounties**, and unlock **15 Feats**.
5. **Compete on Reddit:** Your Bard Title syncs to your `r/luteroll` user flair. Share your result card in the daily thread and climb the daily & all-time leaderboards.

## Contest

Reddit Game of the Day Hackathon, Nov 11 to Dec 8, 2026. Submissions close Dec 8, 2026 at 9:00 PM ET.

- Subreddit: r/luteroll
- Contest page: https://redditgameofday2026.devpost.com/
- Targets both top prizes: Best Daily Game ($15,000) and Best Ported Daily Game ($6,000). Lute Roll is a port of my own College of Keys IP: the d20 Performance Check (issue 25) and the Daily Quest System (issue 53).

## Status

Playable & verified on Devvit Web (`r/lute_roll_dev`), featuring:

- **3D d20 Tavern Tray:** Three.js + physics-driven d20 roll with 1 daily reroll and 950ms reveal banner.
- **Deterministic Daily Melodies:** Seeded per `UTC date + player + roll`, auto-played via Web Audio with lit key guides.
- **12 Unlockable Keyboard Voices:** *Tavern Upright*, *Saloon Honky-Tonk*, *Baroque Harpsichord*, *Clockwork Music Box*, *Velvet Electric Keys*, *Funky Clavinet*, *Cathedral Pipe Organ*, *Tavern Concertina*, *Arcane Lead Synth*, *Gilded Carillon*, *Starlight Celesta*, and *Astral Concert Grand* — all synthesized with zero external audio samples.
- **Tavern Vault & Retention Loop:** 48 Collectible Relics (Common/Uncommon/Rare/Mythic) with 3-pull Duplicate Pity, 15 Feats, 15 Bard Title tiers (Levels 1–100), Daily Tavern Bounties, Ward of Grace spell forgiveness, and Tavern Streak Freezes.
- **Mobile & Desktop Controls:** Thumb-friendly 2-row touch keyboard (`C5–C6` over `C4–B4`) with mobile haptics, plus desktop keyboard shortcuts (`A W S E D F T G Y H U J K` for `C4–C5`), with out-of-range keys dimmed per tier and an in-card Tavern Guide accessible before rolling.
- **Reddit-Native Loop:** Automatic `r/luteroll` user flair sync, Snoovatars in HUD & leaderboards, one-tap result card posting to thread comments, subreddit subscribe CTA, auto-stickied daily UTC midnight post scheduler, and Devvit Journeys telemetry.

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
