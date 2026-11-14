import { getTierForRoll, type DifficultyTier } from './constants';
import { createSeededRng } from './prng';

export type GeneratedMelody = {
  seedKey: string;
  roll: number;
  tier: DifficultyTier;
  notes: number[]; // MIDI note numbers (60..84)
  tempoMs: number;
};

const NOTE_NAMES = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
] as const;

export function midiToNoteName(midi: number): string {
  const name = NOTE_NAMES[((midi % 12) + 12) % 12] ?? 'C';
  const octave = Math.floor(midi / 12) - 1;
  return `${name}${octave}`;
}

export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function getScalePoolForTier(tier: DifficultyTier): {
  pool: number[];
  tonicMidi: number;
} {
  const isWhite = (m: number) => {
    const pc = m % 12;
    return pc === 0 || pc === 2 || pc === 4 || pc === 5 || pc === 7 || pc === 9 || pc === 11;
  };

  const pool: number[] = [];
  for (let m = tier.minMidi; m <= tier.maxMidi; m++) {
    const pc = m % 12;
    if (tier.keyMode === 'white') {
      if (isWhite(m)) pool.push(m);
    } else if (tier.keyMode === 'white-plus-1-black') {
      // C major / G mixolydian flavor with F# (pc === 6)
      if (isWhite(m) || pc === 6) pool.push(m);
    } else if (tier.keyMode === 'chromatic-minor') {
      // A minor / D dorian with F#, G#, Bb
      if (isWhite(m) || pc === 6 || pc === 8 || pc === 10) pool.push(m);
    } else {
      // Full chromatic across 2 octaves, weighted toward playable intervals
      pool.push(m);
    }
  }

  // Tonic: C4 (60) for major/white tiers, A4 (69) or C4 (60) for minor/chromatic
  const tonicMidi =
    tier.keyMode === 'chromatic-minor' || tier.keyMode === 'full-chromatic'
      ? 69
      : 60;

  return { pool, tonicMidi };
}

/**
 * Generates a deterministic, singable original melody for (utcDate, playerKey, roll).
 */
export function generateMelody(
  utcDate: string,
  playerKey: string,
  roll: number
): GeneratedMelody {
  const tier = getTierForRoll(roll);
  const seedKey = `${utcDate}:${playerKey}:${roll}`;
  const rng = createSeededRng(seedKey);

  const noteCount =
    tier.minNotes === tier.maxNotes
      ? tier.minNotes
      : tier.minNotes + Math.floor(rng() * (tier.maxNotes - tier.minNotes + 1));

  const { pool, tonicMidi } = getScalePoolForTier(tier);
  const tonicIdx = Math.max(
    0,
    pool.findIndex((m) => m >= tonicMidi)
  );

  // Start on tonic or 5th above tonic
  const fifthIdx = Math.min(pool.length - 1, tonicIdx + 4);
  let currentIdx = rng() < 0.7 ? tonicIdx : fifthIdx;
  const notes: number[] = [pool[currentIdx]!];

  for (let i = 1; i < noteCount; i++) {
    // Final note resolves back to tonic (or nearest tonic octave) for a musical cadence
    if (i === noteCount - 1) {
      const upperTonicIdx = pool.findIndex(
        (m, idx) => idx > tonicIdx && m % 12 === tonicMidi % 12
      );
      const targetTonic =
        upperTonicIdx !== -1 &&
        Math.abs(upperTonicIdx - currentIdx) < Math.abs(tonicIdx - currentIdx)
          ? upperTonicIdx
          : tonicIdx;
      currentIdx = targetTonic;
      notes.push(pool[currentIdx]!);
      continue;
    }

    // Second-to-last note gravitates toward leading tone or 2nd for smooth resolution
    if (i === noteCount - 2) {
      const candidates = [tonicIdx + 1, tonicIdx - 1, tonicIdx + 4].filter(
        (idx) => idx >= 0 && idx < pool.length
      );
      if (candidates.length > 0) {
        currentIdx = candidates[Math.floor(rng() * candidates.length)]!;
        notes.push(pool[currentIdx]!);
        continue;
      }
    }

    const prevNote = notes[notes.length - 1];
    const prevPrevNote = notes.length >= 2 ? notes[notes.length - 2] : null;
    const repeatedTwice = prevPrevNote !== null && prevNote === prevPrevNote;

    // Stepwise contour: 70% ±1 step, 20% ±2 leap, 10% repeat (unless repeated twice)
    let step: number;
    const r = rng();
    if (!repeatedTwice && r < 0.08) {
      step = 0;
    } else if (r < 0.75) {
      step = rng() < 0.5 ? 1 : -1;
    } else {
      step = rng() < 0.5 ? 2 : -2;
    }

    let nextIdx = currentIdx + step;
    if (nextIdx < 0) nextIdx = Math.min(pool.length - 1, currentIdx + Math.abs(step));
    if (nextIdx >= pool.length) nextIdx = Math.max(0, currentIdx - Math.abs(step));

    // Hard guard against >2 identical notes in a row
    if (repeatedTwice && pool[nextIdx] === prevNote) {
      nextIdx = nextIdx + 1 < pool.length ? nextIdx + 1 : Math.max(0, nextIdx - 1);
    }

    currentIdx = nextIdx;
    notes.push(pool[currentIdx]!);
  }

  return {
    seedKey,
    roll,
    tier,
    notes,
    tempoMs: tier.tempoMs,
  };
}
