export type DifficultyTier = {
  id: 'trivial' | 'easy' | 'medium' | 'hard' | 'very-hard' | 'brutal';
  name: string;
  minRoll: number;
  maxRoll: number;
  minNotes: number;
  maxNotes: number;
  tempoMs: number;
  minMidi: number;
  maxMidi: number;
  keyMode: 'white' | 'white-plus-1-black' | 'chromatic-minor' | 'full-chromatic';
  xpMultiplier: number;
};

export const FAIL_ACCURACY_THRESHOLD = 0.5;
export const BASE_XP_PER_RUN = 100;

export const DIFFICULTY_TIERS: readonly DifficultyTier[] = [
  {
    id: 'trivial',
    name: 'Trivial',
    minRoll: 20,
    maxRoll: 20,
    minNotes: 4,
    maxNotes: 4,
    tempoMs: 600,
    minMidi: 60, // C4
    maxMidi: 67, // G4 (5 white notes)
    keyMode: 'white',
    xpMultiplier: 3.0,
  },
  {
    id: 'easy',
    name: 'Easy',
    minRoll: 17,
    maxRoll: 19,
    minNotes: 5,
    maxNotes: 6,
    tempoMs: 600,
    minMidi: 60, // C4
    maxMidi: 69, // A4 (6 white notes)
    keyMode: 'white',
    xpMultiplier: 1.0,
  },
  {
    id: 'medium',
    name: 'Medium',
    minRoll: 13,
    maxRoll: 16,
    minNotes: 7,
    maxNotes: 8,
    tempoMs: 450,
    minMidi: 60, // C4
    maxMidi: 72, // C5 (1 octave)
    keyMode: 'white',
    xpMultiplier: 1.5,
  },
  {
    id: 'hard',
    name: 'Hard',
    minRoll: 8,
    maxRoll: 12,
    minNotes: 9,
    maxNotes: 11,
    tempoMs: 450,
    minMidi: 60, // C4
    maxMidi: 76, // E5 (1 octave+)
    keyMode: 'white-plus-1-black',
    xpMultiplier: 2.0,
  },
  {
    id: 'very-hard',
    name: 'Very Hard',
    minRoll: 2,
    maxRoll: 7,
    minNotes: 12,
    maxNotes: 14,
    tempoMs: 350,
    minMidi: 60, // C4
    maxMidi: 79, // G5 (1.5 octaves)
    keyMode: 'chromatic-minor',
    xpMultiplier: 2.5,
  },
  {
    id: 'brutal',
    name: 'Brutal',
    minRoll: 1,
    maxRoll: 1,
    minNotes: 14,
    maxNotes: 16,
    tempoMs: 300,
    minMidi: 60, // C4
    maxMidi: 84, // C6 (2 octaves)
    keyMode: 'full-chromatic',
    xpMultiplier: 3.0,
  },
] as const;

export function getTierForRoll(roll: number): DifficultyTier {
  const clamped = Math.max(1, Math.min(20, Math.round(roll)));
  const found = DIFFICULTY_TIERS.find(
    (t) => clamped >= t.minRoll && clamped <= t.maxRoll
  );
  return found ?? DIFFICULTY_TIERS[2]!;
}

export const BARD_TITLE_LADDER: readonly { minLevel: number; title: string }[] = [
  { minLevel: 50, title: 'Voice of the Realm' },
  { minLevel: 40, title: 'Legend of the Tavern' },
  { minLevel: 30, title: 'Master of the Lute' },
  { minLevel: 20, title: 'Tavern Bard' },
  { minLevel: 15, title: 'Songsmith' },
  { minLevel: 10, title: 'Wandering Minstrel' },
  { minLevel: 5, title: 'Tavern Singer' },
  { minLevel: 1, title: 'Busker' },
] as const;

export function xpRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.round(250 * Math.pow(level - 1, 1.35));
}

export function getLevelFromXp(totalXp: number): number {
  let level = 1;
  while (level < 100 && totalXp >= xpRequiredForLevel(level + 1)) {
    level++;
  }
  return level;
}

export function getTitleForLevel(level: number): string {
  const entry = BARD_TITLE_LADDER.find((t) => level >= t.minLevel);
  return entry?.title ?? 'Busker';
}
