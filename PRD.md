# Lute Roll: Product Requirements Document

**Working title:** Lute Roll
**Version:** 1.0 (Nov 12, 2026)
**Owner:** Kiyoshi Kidd
**Platform:** Devvit Web (React), as a Reddit Interactive Post
**Subreddit:** r/luteroll (verified available Nov 12, 2026; created Nov 12, 2026, the game lives there)
**Subreddit description (short):** "Roll a d20, learn the tune, earn the XP. Lute Roll is a daily melody game: your roll sets the difficulty, then you listen and tap the melody back on the keys. Nat 20 means an easy tune with a huge payout. Nat 1 means the hardest tune, and the tavern throws tomatoes if you botch it. Play daily, keep your streak, climb from Busker to Legend of the Tavern."
**Contest:** Reddit Game of the Day Hackathon, Nov 11 to Dec 8, 2026. Submissions close Dec 8, 2026 at 9:00 PM ET. Devpost: https://redditgameofday2026.devpost.com/

**Source:** Built from a player interview with Kiyoshi on Nov 12, 2026. Decisions he made in the interview are marked [decided]. Numbers and details he did not set are marked [proposed] and are tunable starting values, not gospel.

## 1. What it is

Lute Roll is a daily melody game with a d20 twist. Each day you roll a twenty-sided die. The roll sets how hard your melody is and seeds the melody itself. You listen to the melody, then tap it back note by note on an on-screen keyboard. Every play earns XP. Harder melodies and cleaner playing pay more. A bad day at the tavern ends with tomatoes.

One sentence version: roll the die, learn the tune, earn the XP, come back tomorrow.

## 2. Contest context

Prizes ($35,000 total): Best Daily Game $15,000 (1 winner). Best Ported Daily Game $6,000 (1 winner, must be a port of your own existing IP). Honorable Mentions $1,000 x10. Devvit Helper $500 x6. Feedback $200 x5.

Lute Roll targets both top prizes. It is a daily game, and it is a port of Kiyoshi's own College of Keys IP: the d20 Performance Check (backlog issue #25, D&D Beyond style physics die roll) and the Daily Quest System (backlog issue #53). The PRD should call out that lineage in the submission.

Submission requires two links: the app listing on developers.reddit.com, and a demo post in the subreddit running the game. Do NOT publish the app. Upload it and playtest only.

Judging criteria: Delightful UX, Polish, Reddit-y, Daily Content. Explicitly not wanted: AI slop, on-the-nose Reddit theming, and common ideas (space shooters, clones, simple platformers, collaborative storytelling, trivia).

## 3. Target player

A casual Redditor on their phone, not a musician. No sheet music reading, no music theory, no account beyond Reddit. The game must be understandable in under ten seconds: roll, listen, tap it back.

The player persona is Kiyoshi himself as a player: a busy adult who likes gamified progress (Duolingo style), real songs over drills, and D&D flavor as identity rather than decoration. The game is built for players like him, not for piano students.

## 4. Core loop

One daily round, in order:

1. **Roll.** The player rolls a d20. Physics-style die roll, D&D Beyond style, drawn live (Three.js plus cannon-es dice-box per the College of Keys #25 spec). Gold die on dark green felt. The die decides the result by landing face up. [decided: die roll comes first]
2. **The roll sets the difficulty.** A high roll means an easier melody. A low roll means a harder one. Nat 20 is the easiest melody. Nat 1 is the hardest. [decided]
3. **The roll seeds the melody.** The melody is procedurally generated and random per player, seeded by the roll (plus the date, so replays on the same day give the same tune). Two players who roll the same number on the same day get the same difficulty but their melodies come from their own seed. [decided: random based on the dice roll]
4. **Reroll.** The player gets one reroll per day if they hate the first roll. The reroll replaces the roll and the melody. [decided]
5. **Listen.** The melody plays once, with the keys lighting up as each note sounds. The player can replay the melody as many times as they want before attempting it.
6. **Play it back.** The player taps the melody back note by note on the on-screen keyboard. [decided: listen and repeat]
7. **Score.** Every play earns XP. XP scales with difficulty and accuracy. [decided]
8. **Repeat.** The player can play as many times a day as they want. Every play earns its XP. Grinding is the point. [decided: "I want to be able to grind. If I'm playing 20/day, I want the XP for all of them."]
9. **Share.** After a run, the player gets a shareable result card to post in the daily thread.

## 5. Roll to difficulty

[decided: high roll is easier; nat 20 super easy; nat 1 really hard]

| Roll | Tier | Notes | Tempo (ms per note) | Range | Keys | XP multiplier |
|---|---|---|---|---|---|---|
| 20 (nat 20) | Trivial | 4 | 600 | 5 notes | White only | 3.0x (crit payout) |
| 17-19 | Easy | 5-6 | 600 | 5-6 notes | White only | 1.0x |
| 13-16 | Medium | 7-8 | 450 | 1 octave | White only | 1.5x |
| 8-12 | Hard | 9-11 | 450 | 1 octave plus | White plus 1 black key | 2.0x |
| 2-7 | Very hard | 12-14 | 350 | 1.5 octaves | Black keys in play | 2.5x |
| 1 (nat 1) | Brutal | 14-16 | 300 | 2 octaves | Full chromatic | 3.0x |

All numbers in this table are [proposed] starting values for tuning. The shape is [decided]: easy means fewer notes, slower, narrow range, white keys only; hard means more notes, faster, wider range, black keys in play.

**Nat 20 (critical success).** [decided] The easiest melody, but it pays XP at the hardest tier's rate (3.0x). A crit is a gift run: easy tune, huge payout.

**Nat 1.** [decided] The hardest melody, but still clearable. Clearing it pays the top rate (3.0x), so the reward is worth the attempt instead of an instant reroll. It should feel punishing, not impossible.

## 6. The melody

**Generated originals only.** [decided] Real songs are out because of licensing (publishing plus recording rights, out of scope for a hackathon game). The game generates original melodies. No licensing, endless variety.

Melody generator rules [proposed]:

- Deterministic per (date, final roll). Same day plus same roll gives the same melody, so grinding means practicing one tune, not chasing a new one each attempt.
- Diatonic to a key (C major or A minor to start). Mostly stepwise motion with occasional leaps. Singable, not random notes. No run of the same note longer than two in a row.
- Note count, tempo, range, and black-key use come from the difficulty table in section 5.
- Playback uses Web Audio. Piano timbre for the MVP. A plucked lute-like timbre is a nice-to-have flavor item, not a launch requirement.

## 7. Playing a round

**Listen and repeat.** [decided] The melody plays with the keys lighting up. The player then taps it back note by note on the on-screen keyboard. No sheet music anywhere. No falling-note highway in the MVP (that is a v2 mode).

**On-screen keyboard.** [proposed] Two octaves, C4 to C6, white and black keys, tap to play with sound. Must work with touch on mobile. Keys light up during melody playback and on correct taps.

**Wrong notes.** [decided] A wrong note costs accuracy and shows a visual cue (the key flashes red), but the attempt keeps going. The player finishes the melody and gets an accuracy score.

**Fail state.** [decided] If the player is really botching it, the attempt fails. The tavern throws tomatoes: a tomato-throw animation and a heckle line ("Boo!", "My ears!", "Get off the stage!"). The exact fail threshold is [proposed] at 50% accuracy and is tunable. A failed attempt earns 0 XP.

**Accuracy.** [proposed] Accuracy is the share of correct notes out of the melody's total notes. A tap on the wrong key counts as a miss for that position, and the player keeps going from the next note.

## 8. XP and progression

**XP formula.** [decided: XP scales with difficulty and accuracy] [proposed] XP per attempt equals 100 times the difficulty multiplier times accuracy. Example: a clean run (100% accuracy) on a hard melody (2.0x) earns 200 XP. A clean run on a nat 20 (easiest melody, 3.0x crit payout) earns 300 XP. A 70% run on a medium melody (1.5x) earns 105 XP.

**Every play pays.** [decided] XP is earned on every completed (non-failed) play, not just the best run of the day. Playing 20 times earns XP 20 times.

**Levels and titles.** [decided: both levels with bard titles and flair] Level up by earning XP. Titles are the bard ladder. [proposed] ladder: Level 1 Busker, Level 5 Tavern Singer, Level 10 Wandering Minstrel, Level 15 Songsmith, Level 20 Tavern Bard, Level 30 Master of the Lute, Level 40 Legend of the Tavern, Level 50 Voice of the Realm. Titles are tunable.

**Flair.** [decided] The player's level and title become their user flair in r/luteroll, so it shows up in every comment they make. Rare flair for rare feats [decided]: clearing a nat 1 melody, rolling a nat 20, a 30-day streak. Flair is the visible progression system.

**Streaks.** [decided] One play a day that did not fail keeps the streak alive. A failed play does not count toward the streak, but it does not break it either, because the player can try again the same day. Missing a day entirely breaks the streak. Streak count shows on the result card and next to the player's name.

**Leaderboards.** [proposed] Daily XP board and all-time XP board, subreddit-wide. Cheap to build, very sticky. Show the top 10 plus the player's own rank.

**Result card.** [decided] After a run, the player gets a short shareable card to paste into the daily thread comments. [proposed] format, one block of text:

```
Lute Roll, Nov 12
Rolled 14, 92% accuracy, +276 XP
Streak 3, Level 5 Tavern Singer
```

The card must be copyable in one tap. The comments thread is the tavern: players post their cards, brag about nat 20s, and commiserate about nat 1s.

## 9. Social and Reddit features

These are the contest's "Reddit-y" layer. Use Devvit's native features, do not rebuild them:

- **Flair:** level and title flair (section 8).
- **Streaks:** Devvit journeys for daily streak tracking where it fits.
- **Comments:** the daily thread is the tavern. The result card is built for pasting there.
- **Leaderboards:** daily and all-time, in the app.
- **Snoovatar:** listed by Reddit as a bonus feature, but it is the weakest lever for a small app. Do not build around it.

Do not use on-the-nose Reddit theming (no Snoo jokes, no upvote puns as the core joke). The tavern and bard theme is the identity.

## 10. Visual and audio direction

- **Theme:** a cozy fantasy tavern. Warm wood, gold, dark green felt (the dice tray from College of Keys #25). The bard is the fantasy, not a skin on top of it.
- **Die:** gold d20 on dark green felt, physics roll, drawn live. This is the ported College of Keys #25 spec.
- **Feedback:** correct tap lights the key green. Wrong tap flashes red. Fail triggers the tomato throw. Nat 20 triggers a gold burst and a "CRITICAL SUCCESS" banner. Nat 1 triggers a low drum and a "BRUTAL" banner.
- **Sound:** Web Audio only. Melody playback, tap sounds, a thud for tomatoes, a chime for level-ups. No copyrighted audio. Mute toggle always visible.
- **Layout:** mobile-first. The keyboard is thumb-reachable at the bottom. One screen per step: roll, listen, play, results. No scrolling during play.

## 11. IP and legal guardrails

Kiyoshi asked this directly, and it is a hard constraint. [decided, verified Nov 12, 2026]

- **Never use:** "Dungeons & Dragons", "D&D", the ampersand dragon logo, "Dungeon Master" (use Game Master or Tavern Keeper instead), "d20 System", Forgotten Realms, Faerun, beholder, mind flayer, any named D&D character or setting, any D&D art or logo.
- **Safe to use:** d20 as a plain term for a twenty-sided die, nat 20, critical hit and critical fail, bard, tavern, quest, hit points, dice checks. Game mechanics cannot be copyrighted.
- **SRD path:** the D&D System Reference Documents (SRD 5.1 and 5.2.1) are under Creative Commons CC-BY-4.0, permanent and irrevocable. If the game ever needs actual 5e mechanics text, it can use SRD text with an attribution line. Lute Roll does not need it; generic terms cover everything.
- **Do not rely on the Fan Content Policy.** It covers non-commercial fan work, and a contest entry chasing cash prizes is not the place to lean on "it is just fan content." The clean route is generic terms plus the SRD.
- **Music:** generated original melodies only (section 6). No real songs, no licensed recordings.

## 12. Technical requirements

- **Stack:** Devvit Web, React, TypeScript, Hono, Redis, Three.js, Tailwind CSS, Web Audio API.
- **Surface:** a Reddit Interactive Post in r/luteroll. Mobile-first; most players are on phones.
- **State:** per-player, per-day state stored through Devvit (roll, reroll used, attempts, XP, streak, level, flair). The daily seed uses the UTC date so every player shares the same day boundary. [proposed: UTC date; confirm in build]
- **Melody generation:** client-side, deterministic from (date, final roll). No server round trip per melody.
- **Audio:** Web Audio API. Works on mobile browsers without extra permissions.
- **Performance:** the game must load fast inside a Reddit post. Keep the bundle small. No heavy assets on first load.
- **First milestone:** get a hello-world Devvit app deployed and running as an interactive post in the first few days. Do not leave platform setup to the end. Build speed is not the risk; Devvit quirks are.

## 13. MVP scope (launch) and out of scope (v2)

**MVP, must ship by Dec 8:**

1. Daily d20 roll with physics animation, one reroll per day.
2. Roll-seeded generated melody, listen-and-repeat playback, on-screen keyboard.
3. Accuracy scoring, wrong-note cue, tomato fail state.
4. XP per attempt (difficulty times accuracy), levels with bard titles, flair.
5. Streaks (one non-failed play per day).
6. Shareable result card.
7. Daily and all-time leaderboards.
8. r/luteroll created, demo post running the game, submission links ready.

**Out of scope for the MVP (v2 ideas, do not build now):**

- Falling-note highway or rhythm mode.
- Real songs or licensed music.
- Head-to-head multiplayer or duels.
- Setlists, song collections, or achievements beyond flair.
- Snoovatar rewards.
- A second game mode.

## 14. Milestones

1. **Days 1-3:** hello-world Devvit app deployed in r/luteroll. Create the subreddit. Prove the platform works before building game logic.
2. **Days 4-7:** core loop playable end to end: roll, melody, keyboard, accuracy, XP. No flair or leaderboards yet.
3. **Days 8-12:** progression layer: levels, titles, flair, streaks, result card, leaderboards.
4. **Days 13-17:** polish: tomato fail animation, nat 20 and nat 1 moments, sound, mobile layout, tuning pass on the difficulty table.
5. **Days 18-21:** playtest with real players, fix the worst friction, record the demo post, submit before Dec 8 at 9:00 PM ET.

## 15. Open decisions and tuning knobs

These were not decided in the interview. The builder should pick sensible defaults and flag them, not block on them:

- Fail threshold: 50% accuracy is the proposed starting value.
- XP base (100) and level curve: proposed, tune so a regular player levels up every few days, not every session.
- Level titles: the ladder in section 8 is proposed.
- Daily reset timezone: UTC date is proposed.
- Leaderboard scope: subreddit-wide is proposed.
- Melody generator musicality rules: the constraints in section 6 are proposed; the builder owns making generated melodies sound good, not random.

## Appendix: interview decisions log

Player interview with Kiyoshi, Nov 12, 2026, one question at a time. Verbatim decisions:

- "I would think the die roll would come first and that sets the difficulty of the melody. The randomness would make people want to try again."
- "High roll is easier. Nat 20 would be super easy, nat 1 would be really hard."
- "You get one reroll per day BUT you can play as many times a day as you want."
- Mechanic: listen and repeat was recommended and accepted (hear it play with keys lighting up, tap it back on an on-screen keyboard).
- "Random based on their dice roll" (the melody is random per player, seeded by the roll).
- "I want to be able to grind. So if I'm playing 20/day, I want the XP for all of them." (Corrected from "cup" to "XP.")
- "XP should scale with difficulty and accuracy."
- Progression: "Both?" (levels with bard titles and flair), plus "What do Redditors like that we could provide with this?" Answer given: flair with level and title, streaks, shareable result card, leaderboards, rare flair for rare feats.
- "Keep going and costs accuracy. Should be a visual cue that you messed up."
- "If you are REALLY botching it you should fail. Tomatoes getting thrown and what not."
- "Can't use real songs due to licensing right? So we'd have to generate melodies." (Confirmed: yes.)
- "One play a day that didn't fail." (Streak rule.)
- "Nat 20 should still feel like a critical success. Could be the XP scaling of the hardest one? But nat 1 should feel the opposite but not punishable to where it's impossible and the reward was still worth it."
- Name: "I kind of like lute roll?" after rejecting two earlier rounds of suggestions as not catchy enough. r/luteroll verified available Nov 12, 2026.
