import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateMelody } from '../src/shared/melodyGenerator';
import {
  getIsoWeekKey,
  getLevelFromXp,
  getTierForRoll,
  getTitleForLevel,
  KEYBOARD_VOICES,
  xpRequiredForLevel,
} from '../src/shared/constants';
import {
  formatNoteResultsGrid,
  formatResultCardText,
} from '../src/shared/resultCard';
import { formatBardFlairText } from '../src/server/flairService';
import type { PlayerProfile } from '../src/shared/api';
import {
  BARD_COSMETICS,
  BARD_EPITHETS,
  BARD_FAMILIARS,
  DEFAULT_BARD_AVATAR,
  DICE_SKINS,
  getCosmeticForFeat,
  getCosmeticForRelic,
  KEYBOARD_SKIN_THEMES,
  NOTE_PARTICLE_SKINS,
  sanitizeBardAvatarConfig,
} from '../src/shared/cosmetics';
import { getPerformanceCommentary } from '../src/shared/commentary';
import {
  CHEST_RELIC_CATALOG,
  FEAT_CATALOG,
  MYTHIC_RELIC_CATALOG,
  RELIC_CATALOG,
} from '../src/shared/constants';

function isWhiteKey(midi: number): boolean {
  const pc = midi % 12;
  return (
    pc === 0 ||
    pc === 2 ||
    pc === 4 ||
    pc === 5 ||
    pc === 7 ||
    pc === 9 ||
    pc === 11
  );
}

describe('generateMelody', () => {
  it('is deterministic for the same (utcDate, playerKey, roll)', () => {
    const a = generateMelody('2026-11-14', 'KiyoshiTheKidd', 14);
    const b = generateMelody('2026-11-14', 'KiyoshiTheKidd', 14);
    assert.deepEqual(a.notes, b.notes);
    assert.equal(a.tempoMs, b.tempoMs);
    assert.equal(a.seedKey, b.seedKey);
  });

  it('produces distinct melodies for different players or dates', () => {
    const a = generateMelody('2026-11-14', 'KiyoshiTheKidd', 14);
    const b = generateMelody('2026-11-14', 'AnotherBard', 14);
    const c = generateMelody('2026-11-15', 'KiyoshiTheKidd', 14);
    assert.notDeepEqual(a.notes, b.notes);
    assert.notDeepEqual(a.notes, c.notes);
  });

  it('respects note count, pitch range, key mode, and max-2-repeat rule across all tiers', () => {
    const sampleRolls = [20, 18, 14, 10, 5, 1];
    for (const roll of sampleRolls) {
      const tier = getTierForRoll(roll);
      const melody = generateMelody('2026-11-14', 'TestBard', roll);

      assert.ok(
        melody.notes.length >= tier.minNotes &&
          melody.notes.length <= tier.maxNotes,
        `Roll ${roll} note count ${melody.notes.length} outside [${tier.minNotes}, ${tier.maxNotes}]`
      );

      for (let i = 0; i < melody.notes.length; i++) {
        const note = melody.notes[i]!;
        assert.ok(
          note >= tier.minMidi && note <= tier.maxMidi,
          `Roll ${roll} note ${note} outside [${tier.minMidi}, ${tier.maxMidi}]`
        );
        if (tier.keyMode === 'white') {
          assert.ok(
            isWhiteKey(note),
            `Roll ${roll} expected white key, got ${note}`
          );
        }
        if (i >= 2) {
          assert.ok(
            !(
              melody.notes[i] === melody.notes[i - 1] &&
              melody.notes[i - 1] === melody.notes[i - 2]
            ),
            `Roll ${roll} had >2 identical notes in a row at index ${i}`
          );
        }
      }
    }
  });

  it('generates musical Brutal (Nat 1) melodies starting on A4 or E5 and resolving to A', () => {
    for (let s = 0; s < 10; s++) {
      const m = generateMelody('2026-11-24', `BrutalBard${s}`, 1);
      const first = m.notes[0]!;
      const last = m.notes[m.notes.length - 1]!;
      assert.ok(
        first === 69 || first === 76,
        `Expected Brutal opening on A4 (69) or E5 (76), got ${first}`
      );
      assert.equal(last % 12, 9, `Expected Brutal cadence on A, got ${last}`);
    }
  });
});

describe('XP curve, Bard Title ladder & Voices', () => {
  it('starts at Level 1 Busker with 0 XP', () => {
    assert.equal(getLevelFromXp(0), 1);
    assert.equal(getTitleForLevel(1), 'Busker');
  });

  it('increases XP requirements monotonically and maps titles', () => {
    for (let lvl = 1; lvl < 50; lvl++) {
      assert.ok(xpRequiredForLevel(lvl + 1) > xpRequiredForLevel(lvl));
    }
    assert.equal(getTitleForLevel(5), 'Tavern Singer');
    assert.equal(getTitleForLevel(50), 'Voice of the Realm');
  });

  it('includes both Tavern Upright and Tavern Lute unlocked at 0 relics', () => {
    const starterVoices = KEYBOARD_VOICES.filter((v) => v.unlockRelics === 0).map(
      (v) => v.id
    );
    assert.ok(starterVoices.includes('grand_piano'));
    assert.ok(starterVoices.includes('tavern_lute'));
  });
});

describe('getIsoWeekKey (Weekly Leaderboard Monday 00:00 UTC)', () => {
  it('rolls over cleanly between Sunday 23:59 UTC and Monday 00:00 UTC', () => {
    const sunday = new Date('2026-11-22T23:59:59Z');
    const monday = new Date('2026-11-23T00:00:00Z');
    assert.equal(getIsoWeekKey(sunday), '2026-W47');
    assert.equal(getIsoWeekKey(monday), '2026-W48');
  });

  it('handles ISO year boundaries accurately', () => {
    assert.equal(getIsoWeekKey(new Date('2025-12-29T00:00:00Z')), '2026-W01');
    assert.equal(getIsoWeekKey(new Date('2026-01-01T12:00:00Z')), '2026-W01');
  });
});

describe('formatResultCardText (B2 & Wordle-style grid)', () => {
  it('renders emoji note grid and Reddit Markdown two-space line breaks', () => {
    assert.equal(
      formatNoteResultsGrid(['hit', 'grace', 'miss', 'hit']),
      '🟩🟦🟥🟩'
    );
    const md = formatResultCardText({
      utcDate: '2026-11-24',
      roll: 14,
      accuracy: 0.75,
      xpEarned: 113,
      passed: true,
      noteResults: ['hit', 'grace', 'miss', 'hit'],
      profile: { streak: 4, level: 5, title: 'Tavern Singer' },
      forRedditMarkdown: true,
    });
    assert.ok(md.includes('  \n'), 'Expected Reddit Markdown line breaks');
    assert.ok(md.includes('🟩🟦🟥🟩'));
    assert.ok(md.includes('+113 XP'));
  });

  it('displays actual bounty XP earned on failed runs instead of hardcoded +0 XP', () => {
    const text = formatResultCardText({
      utcDate: '2026-11-24',
      roll: 4,
      accuracy: 0.25,
      xpEarned: 50,
      passed: false,
      noteResults: ['hit', 'miss', 'miss', 'miss'],
      profile: { streak: 2, level: 3, title: 'Apprentice Bard' },
    });
    assert.ok(text.includes('+50 XP'));
    assert.ok(!text.includes('+0 XP'));
  });
});

describe('formatBardFlairText (B8 badge priority)', () => {
  const baseProfile: PlayerProfile = {
    username: 'TestBard',
    isAnonymous: false,
    totalXp: 5000,
    level: 10,
    title: 'Wandering Minstrel',
    streak: 30,
    streakFreezes: 1,
    dupePity: 0,
    lastPlayedDate: '2026-11-24',
    feats: ['nat20', 'streak30'],
    relics: [],
    selectedVoice: 'grand_piano',
    bardAvatar: DEFAULT_BARD_AVATAR,
  };

  it('prioritizes 30-day streak trophy over Nat 20 dice badge', () => {
    const flair = formatBardFlairText(baseProfile);
    assert.ok(flair.endsWith('🏆'), `Expected 🏆 badge, got "${flair}"`);
    assert.ok(flair.length <= 64);
  });
});

describe('Keyboard Skins & Modular Build-a-Bard (85 Relics + 25 Feats + 130 Wearables)', () => {
  it('maps every single voice to an instrument-matched keyboard skin', () => {
    for (const voice of KEYBOARD_VOICES) {
      const skin = KEYBOARD_SKIN_THEMES[voice.id];
      assert.ok(skin, `Missing keyboard skin theme for voice ${voice.id}`);
      assert.equal(skin.id, voice.id);
    }
  });

  it('separates 75 Chest Relics (0% Mythic) from 10 Earned-Only Challenge Mythic Relics', () => {
    assert.equal(RELIC_CATALOG.length, 85);
    assert.equal(CHEST_RELIC_CATALOG.length, 75);
    assert.equal(MYTHIC_RELIC_CATALOG.length, 10);
    assert.equal(
      CHEST_RELIC_CATALOG.filter((r) => r.rarity === 'mythic').length,
      0,
      'Mythic relics must NEVER appear in the random Mystery Chest pool'
    );
    for (const mythic of MYTHIC_RELIC_CATALOG) {
      assert.equal(mythic.rarity, 'mythic');
      assert.ok(
        mythic.challengeHint && mythic.challengeHint.length > 5,
        `Mythic relic ${mythic.id} must have a challengeHint`
      );
    }
  });

  it('maps all 85 relics and all 25 feats 1-to-1 to 130 Build-a-Bard wearables (26 per slot)', () => {
    assert.equal(BARD_COSMETICS.length, 130);
    for (const slot of ['hair', 'hat', 'outfit', 'prop', 'frame'] as const) {
      const slotItems = BARD_COSMETICS.filter((c) => c.slot === slot);
      assert.equal(
        slotItems.length,
        26,
        `Expected 26 wearables in slot ${slot}, got ${slotItems.length}`
      );
      const starters = slotItems.filter(
        (c) => c.unlockRelicId === null && !c.unlockFeatId
      );
      assert.equal(
        starters.length,
        4,
        `Expected 4 humble starters in slot ${slot}, got ${starters.length}`
      );
    }

    const seenIds = new Set<string>();
    for (const c of BARD_COSMETICS) {
      assert.ok(!seenIds.has(c.id), `Duplicate cosmetic ID: ${c.id}`);
      seenIds.add(c.id);
    }

    for (const relic of RELIC_CATALOG) {
      const matches = BARD_COSMETICS.filter(
        (c) => c.unlockRelicId === relic.id
      );
      assert.equal(
        matches.length,
        1,
        `Relic ${relic.id} (${relic.name}) expected 1 mapped wearable, got ${matches.length}`
      );
      assert.ok(getCosmeticForRelic(relic.id));
    }

    assert.equal(FEAT_CATALOG.length, 25);
    for (const feat of FEAT_CATALOG) {
      const matches = BARD_COSMETICS.filter((c) => c.unlockFeatId === feat.id);
      assert.equal(
        matches.length,
        1,
        `Feat ${feat.id} (${feat.title}) expected 1 mapped wearable, got ${matches.length}`
      );
      assert.ok(getCosmeticForFeat(feat.id));
    }
  });

  it('enforces relic/feat unlock rules and migrates legacy cloak configs safely', () => {
    const lockedAttempt = sanitizeBardAvatarConfig(
      {
        hair: 'phoenix_mane',
        hat: 'crown_of_keys',
        cloak: 'virtuoso_cape',
        prop: 'celestial_bell',
        frame: 'nat20_crit_aura',
      },
      [],
      []
    );
    assert.equal(lockedAttempt.hair, DEFAULT_BARD_AVATAR.hair);
    assert.equal(lockedAttempt.hat, DEFAULT_BARD_AVATAR.hat);
    assert.equal(lockedAttempt.outfit, DEFAULT_BARD_AVATAR.outfit);
    assert.equal(lockedAttempt.prop, DEFAULT_BARD_AVATAR.prop);
    assert.equal(lockedAttempt.frame, DEFAULT_BARD_AVATAR.frame);

    const unlockedAttempt = sanitizeBardAvatarConfig(
      {
        hair: 'phoenix_mane',
        hat: 'crown_of_keys',
        cloak: 'virtuoso_cape',
        prop: 'celestial_bell',
        frame: 'nat20_crit_aura',
        faceStyle: 'serene',
        skinTone: 'amber',
      },
      ['phoenix_plume', 'grand_crown', 'celestial_carillon'],
      ['level25', 'nat20']
    );
    assert.equal(unlockedAttempt.hair, 'phoenix_mane');
    assert.equal(unlockedAttempt.hat, 'crown_of_keys');
    assert.equal(unlockedAttempt.outfit, 'virtuoso_cape');
    assert.equal(unlockedAttempt.prop, 'celestial_bell');
    assert.equal(unlockedAttempt.frame, 'nat20_crit_aura');
    assert.equal(unlockedAttempt.faceStyle, 'serene');
    assert.equal(unlockedAttempt.skinTone, 'amber');
  });

  it('defines Phase A dice skins, particle skins, familiars, and epithets with unlock enforcement', () => {
    assert.ok(DICE_SKINS.length >= 5);
    assert.ok(NOTE_PARTICLE_SKINS.length >= 5);
    assert.ok(BARD_EPITHETS.length >= 6);

    const locked = sanitizeBardAvatarConfig(
      {
        diceSkin: 'obsidian_crimson',
        particleSkin: 'ember_spark',
        epithet: 'nat20_magnet',
      },
      [],
      []
    );
    assert.equal(locked.diceSkin, DEFAULT_BARD_AVATAR.diceSkin);
    assert.equal(locked.particleSkin, DEFAULT_BARD_AVATAR.particleSkin);
    assert.equal(locked.epithet, DEFAULT_BARD_AVATAR.epithet);

    const unlocked = sanitizeBardAvatarConfig(
      {
        diceSkin: 'obsidian_crimson',
        particleSkin: 'ember_spark',
        epithet: 'nat20_magnet',
      },
      [],
      ['nat1_clear', 'grinder5', 'nat20']
    );
    assert.equal(unlocked.diceSkin, 'obsidian_crimson');
    assert.equal(unlocked.particleSkin, 'ember_spark');
    assert.equal(unlocked.epithet, 'nat20_magnet');

    assert.ok(BARD_FAMILIARS.length >= 7);
    const drakeLocked = sanitizeBardAvatarConfig(
      { familiar: 'ember_drake' },
      [],
      []
    );
    assert.equal(drakeLocked.familiar, 'none');

    const drakeUnlocked = sanitizeBardAvatarConfig(
      { familiar: 'ember_drake' },
      [],
      ['nat1_clear']
    );
    assert.equal(drakeUnlocked.familiar, 'ember_drake');
  });

  it('produces deterministic, tiered performance commentary across outcomes', () => {
    const nat20Flawless = getPerformanceCommentary({
      accuracy: 1,
      passed: true,
      roll: 20,
      graceUsed: false,
      seed: '2026-11-24:1',
    });
    const nat20Repeat = getPerformanceCommentary({
      accuracy: 1,
      passed: true,
      roll: 20,
      graceUsed: false,
      seed: '2026-11-24:1',
    });
    assert.deepEqual(nat20Flawless, nat20Repeat);
    assert.ok(nat20Flawless.headline.length > 0);
    assert.ok(nat20Flawless.subline.length > 0);

    const nearMiss = getPerformanceCommentary({
      accuracy: 0.48,
      passed: false,
      roll: 10,
      graceUsed: false,
      seed: '2026-11-24:2',
    });
    const wipeout = getPerformanceCommentary({
      accuracy: 0.1,
      passed: false,
      roll: 10,
      graceUsed: false,
      seed: '2026-11-24:2',
    });
    assert.notEqual(nearMiss.headline, wipeout.headline);
  });
});
