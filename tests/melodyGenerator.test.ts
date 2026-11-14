import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateMelody } from '../src/shared/melodyGenerator';
import {
  getLevelFromXp,
  getTierForRoll,
  getTitleForLevel,
  xpRequiredForLevel,
} from '../src/shared/constants';

function isWhiteKey(midi: number): boolean {
  const pc = midi % 12;
  return pc === 0 || pc === 2 || pc === 4 || pc === 5 || pc === 7 || pc === 9 || pc === 11;
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
        melody.notes.length >= tier.minNotes && melody.notes.length <= tier.maxNotes,
        `Roll ${roll} note count ${melody.notes.length} outside [${tier.minNotes}, ${tier.maxNotes}]`
      );

      for (let i = 0; i < melody.notes.length; i++) {
        const note = melody.notes[i]!;
        assert.ok(
          note >= tier.minMidi && note <= tier.maxMidi,
          `Roll ${roll} note ${note} outside [${tier.minMidi}, ${tier.maxMidi}]`
        );
        if (tier.keyMode === 'white') {
          assert.ok(isWhiteKey(note), `Roll ${roll} expected white key, got ${note}`);
        }
        if (i >= 2) {
          assert.ok(
            !(melody.notes[i] === melody.notes[i - 1] && melody.notes[i - 1] === melody.notes[i - 2]),
            `Roll ${roll} had >2 identical notes in a row at index ${i}`
          );
        }
      }
    }
  });
});

describe('XP curve and Bard Title ladder', () => {
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
});
