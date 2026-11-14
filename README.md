# Lute Roll

Roll a d20, learn the tune, earn the XP.

Lute Roll is a daily melody game for the Reddit Game of the Day Hackathon. Each day you roll a twenty-sided die. The roll sets how hard your melody is and seeds the melody itself. You listen to the tune, then tap it back note by note on an on-screen keyboard. Every play earns XP. Harder melodies and cleaner playing pay more. Botch it badly and the tavern throws tomatoes.

One sentence version: roll the die, learn the tune, earn the XP, come back tomorrow.

## How it plays

1. Roll a d20. High roll means an easier melody. Nat 20 is the easiest tune with the biggest payout. Nat 1 is the hardest tune, still clearable, and worth attempting.
2. You get one reroll per day, but you can play as many times a day as you want. Every play earns its XP.
3. Listen to the generated melody, with the keys lighting up as each note sounds, then tap it back on the on-screen keyboard.
4. Wrong notes cost accuracy and flash red, but the attempt keeps going. Fall below the fail threshold and the attempt fails for 0 XP.
5. Level up through bard titles, from Busker to Legend of the Tavern. Your title becomes your user flair in r/luteroll. Keep a daily streak, share your result card in the daily thread, and climb the leaderboards.

## Contest

Reddit Game of the Day Hackathon, Nov 11 to Dec 8, 2026. Submissions close Dec 8, 2026 at 9:00 PM ET.

- Subreddit: r/luteroll
- Contest page: https://redditgameofday2026.devpost.com/
- Targets both top prizes: Best Daily Game ($15,000) and Best Ported Daily Game ($6,000). Lute Roll is a port of my own College of Keys IP: the d20 Performance Check (issue 25) and the Daily Quest System (issue 53).

## Status

Milestone 1 in progress: hello-world Devvit Web app deployed as an unpublished test post in r/luteroll. The full plan is in PRD.md. Do not publish the app, upload and playtest only.

## Tech

Devvit Web, React, as a Reddit Interactive Post. Mobile-first, most players are on phones. Melodies are generated originals, deterministic per date and final roll. Audio is Web Audio only. No real songs, no licensed music.

## Docs

- PRD.md: the full product requirements document, built from a player interview on Nov 12, 2026.
- antigravity-prompt.md: the starter prompt for building Milestone 1 in Antigravity, including what to borrow from College of Keys and what to leave behind.
- assets/ASSETS.md: the asset manifest, every borrowed asset with its source in the College of Keys repo.

## Inspiration, not a copy

Lute Roll borrows the look and feel of my College of Keys piano practice app (https://github.com/kiyoshithekidd/college-of-keys): the cozy tavern theme, the gold d20 on dark green felt, and the d20 roller approach from issue 25. It does not copy that repo. No Electron code, no Web MIDI, no MusicXML, no Grimoire song library, no Quest Board. Assets copied into this repo live under assets/images/ and are listed in assets/ASSETS.md.

## IP guardrails

Generic fantasy terms only. Never use "Dungeons & Dragons", "D&D", the ampersand dragon logo, "Dungeon Master" (use Game Master or Tavern Keeper), "d20 System", Forgotten Realms, Faerun, beholder, mind flayer, or any named D&D character, setting, or art. Safe: d20 as a plain term, nat 20, critical hit and critical fail, bard, tavern, quest, hit points. Game mechanics cannot be copyrighted, and the D&D System Reference Documents are under Creative Commons CC-BY-4.0.
