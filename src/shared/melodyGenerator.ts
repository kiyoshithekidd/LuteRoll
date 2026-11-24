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
  chromaticExtras: number[];
} {
  const isWhite = (m: number) => {
    const pc = m % 12;
    return (
      pc === 0 ||
      pc === 2 ||
      pc === 4 ||
      pc === 5 ||
      pc === 7 ||
      pc === 9 ||
      pc === 11
    );
  };

  const pool: number[] = [];
  const chromaticExtras: number[] = [];

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
      // Full chromatic (Brutal / Nat 1):
      // Build a dramatic A Hungarian/Harmonic minor skeleton (A, B, C, D, D#, E, F, G#)
      // for wide musical contours, with remaining chromatic notes available as spicy passing tones.
      const isMinorSkeleton =
        pc === 9 ||
        pc === 11 ||
        pc === 0 ||
        pc === 2 ||
        pc === 3 ||
        pc === 4 ||
        pc === 5 ||
        pc === 8;
      if (isMinorSkeleton) {
        pool.push(m);
      } else {
        chromaticExtras.push(m);
      }
    }
  }

  // Tonic: C4 (60) for major/white tiers, A4 (69) for minor/chromatic
  const tonicMidi =
    tier.keyMode === 'chromatic-minor' || tier.keyMode === 'full-chromatic'
      ? 69
      : 60;

  return { pool, tonicMidi, chromaticExtras };
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

  const { pool, tonicMidi, chromaticExtras } = getScalePoolForTier(tier);
  const tonicIdx = Math.max(
    0,
    pool.findIndex((m) => m >= tonicMidi)
  );

  // Start on tonic or true perfect 5th (+7 semitones) above tonic
  const fifthMidi = tonicMidi + 7;
  const exactFifthIdx = pool.findIndex((m) => m === fifthMidi);
  const fifthIdx =
    exactFifthIdx !== -1
      ? exactFifthIdx
      : Math.min(pool.length - 1, tonicIdx + 4);

  let currentIdx = rng() < 0.65 ? tonicIdx : fifthIdx;
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

    // Second-to-last note gravitates toward leading tone, 2nd, or 5th for smooth resolution
    if (i === noteCount - 2) {
      const candidates = [tonicIdx + 1, tonicIdx - 1, fifthIdx].filter(
        (idx) => idx >= 0 && idx < pool.length
      );
      if (candidates.length > 0) {
        currentIdx = candidates[Math.floor(rng() * candidates.length)]!;
        notes.push(pool[currentIdx]!);
        continue;
      }
    }

    const prevNote = notes[notes.length - 1]!;
    const prevPrevNote = notes.length >= 2 ? notes[notes.length - 2] : null;
    const repeatedTwice = prevPrevNote !== null && prevNote === prevPrevNote;

    // For Brutal (full-chromatic), occasionally weave a dramatic chromatic passing tone
    if (
      tier.keyMode === 'full-chromatic' &&
      chromaticExtras.length > 0 &&
      rng() < 0.16
    ) {
      const nearby = chromaticExtras.filter(
        (m) => Math.abs(m - prevNote) >= 1 && Math.abs(m - prevNote) <= 3
      );
      if (nearby.length > 0) {
        const picked = nearby[Math.floor(rng() * nearby.length)]!;
        if (!(repeatedTwice && picked === prevNote)) {
          notes.push(picked);
          // Snap currentIdx to nearest skeleton index for next step
          let closestIdx = currentIdx;
          let bestDist = Infinity;
          for (let k = 0; k < pool.length; k++) {
            const dist = Math.abs(pool[k]! - picked);
            if (dist < bestDist) {
              bestDist = dist;
              closestIdx = k;
            }
          }
          currentIdx = closestIdx;
          continue;
        }
      }
    }

    // Stepwise contour with wider dramatic leaps on Brutal/Very Hard
    let step: number;
    const r = rng();
    if (!repeatedTwice && r < 0.08) {
      step = 0;
    } else if (r < 0.68) {
      step = rng() < 0.5 ? 1 : -1;
    } else if (r < 0.92 || tier.keyMode === 'white') {
      step = rng() < 0.5 ? 2 : -2;
    } else {
      // Dramatic triad / arpeggio leap (±3 or ±4 scale degrees) for higher tiers
      step = rng() < 0.5 ? 3 : -3;
    }

    let nextIdx = currentIdx + step;
    if (nextIdx < 0)
      nextIdx = Math.min(pool.length - 1, currentIdx + Math.abs(step));
    if (nextIdx >= pool.length)
      nextIdx = Math.max(0, currentIdx - Math.abs(step));

    // Hard guard against >2 identical notes in a row
    if (repeatedTwice && pool[nextIdx] === prevNote) {
      nextIdx =
        nextIdx + 1 < pool.length ? nextIdx + 1 : Math.max(0, nextIdx - 1);
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
