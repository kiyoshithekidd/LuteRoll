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
  { minLevel: 100, title: 'Mythic Maestro' },
  { minLevel: 90, title: 'Grand Conservatory' },
  { minLevel: 75, title: 'Sovereign of Keys' },
  { minLevel: 60, title: 'Archmage of Song' },
  { minLevel: 50, title: 'Voice of the Realm' },
  { minLevel: 40, title: 'Legend of the Tavern' },
  { minLevel: 30, title: 'Master of the Lute' },
  { minLevel: 25, title: 'Royal Kapellmeister' },
  { minLevel: 20, title: 'Tavern Virtuoso' },
  { minLevel: 15, title: 'Songsmith' },
  { minLevel: 10, title: 'Wandering Minstrel' },
  { minLevel: 7, title: 'Balladeer' },
  { minLevel: 4, title: 'Tavern Singer' },
  { minLevel: 2, title: 'Apprentice Bard' },
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

export type FeatMeta = {
  id:
    | 'first_tune'
    | 'flawless'
    | 'nat20'
    | 'nat1_clear'
    | 'streak3'
    | 'streak30'
    | 'grinder5';
  title: string;
  description: string;
  icon: string;
};

export const FEAT_CATALOG: readonly FeatMeta[] = [
  {
    id: 'first_tune',
    title: 'Tavern Debut',
    description: 'Clear your first daily melody.',
    icon: '🎵',
  },
  {
    id: 'flawless',
    title: 'Golden Ear',
    description: 'Clear a daily melody with 100% accuracy.',
    icon: '✨',
  },
  {
    id: 'nat20',
    title: 'Blessed by Fate',
    description: 'Roll a Natural 20 on the d20.',
    icon: '🎲',
  },
  {
    id: 'nat1_clear',
    title: 'Underdog Encore',
    description: 'Clear a Brutal (Nat 1) melody.',
    icon: '🔥',
  },
  {
    id: 'streak3',
    title: 'Regular Patron',
    description: 'Build a 3-day tavern streak.',
    icon: '🍺',
  },
  {
    id: 'grinder5',
    title: 'Encore Virtuoso',
    description: 'Play 5+ runs in a single day.',
    icon: '🎻',
  },
  {
    id: 'streak30',
    title: 'Tavern Immortal',
    description: 'Reach a legendary 30-day streak.',
    icon: '👑',
  },
] as const;

export type RelicMeta = {
  id: string;
  name: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'mythic';
  icon: string;
};

export const RELIC_CATALOG: readonly RelicMeta[] = [
  // 8 Common
  { id: 'ivory_keycap', name: 'Ivory Keycap', rarity: 'common', icon: '🎹' },
  { id: 'brass_fork', name: 'Brass Tuning Fork', rarity: 'common', icon: '🔱' },
  { id: 'maple_metro', name: 'Maple Metronome', rarity: 'common', icon: '⏳' },
  { id: 'felt_damper', name: 'Felt Damper', rarity: 'common', icon: '🧶' },
  { id: 'key_polish', name: 'Resin Key Polish', rarity: 'common', icon: '🧴' },
  { id: 'pitch_pipe', name: 'Tin Pitch Pipe', rarity: 'common', icon: '🎺' },
  { id: 'staff_scroll', name: 'Parchment Staff', rarity: 'common', icon: '📜' },
  { id: 'candle_sheet', name: 'Candlelit Score', rarity: 'common', icon: '🕯️' },
  // 7 Uncommon
  { id: 'silver_capo', name: 'Silver Octave Key', rarity: 'uncommon', icon: '🗝️' },
  { id: 'velvet_bench', name: 'Velvet Bench Pad', rarity: 'uncommon', icon: '🛋️' },
  { id: 'ebony_sharp', name: 'Ebony Sharp Key', rarity: 'uncommon', icon: '⬛' },
  { id: 'copper_coil', name: 'Copper String Coil', rarity: 'uncommon', icon: '🌀' },
  { id: 'oak_stand', name: 'Oak Music Stand', rarity: 'uncommon', icon: '🪵' },
  { id: 'tavern_book', name: 'Tavern Songbook', rarity: 'uncommon', icon: '📖' },
  { id: 'gilded_pedals', name: 'Gilded Sustain Pedals', rarity: 'uncommon', icon: '🦶' },
  // 6 Rare
  { id: 'amber_box', name: 'Amber Resonance Box', rarity: 'rare', icon: '🔶' },
  { id: 'sapphire_key', name: 'Sapphire Tuning Key', rarity: 'rare', icon: '💎' },
  { id: 'clock_arp', name: 'Clockwork Arpeggiator', rarity: 'rare', icon: '⚙️' },
  { id: 'moon_ring', name: 'Moonstone Chord Ring', rarity: 'rare', icon: '🌙' },
  { id: 'dragon_hammer', name: 'Dragonbone Hammer', rarity: 'rare', icon: '🐉' },
  { id: 'phantom_pedal', name: 'Phantom Reverb Pedal', rarity: 'rare', icon: '👻' },
  // 3 Mythic
  { id: 'grand_crown', name: 'Crown of the Keys', rarity: 'mythic', icon: '👑' },
  { id: 'astral_board', name: 'Astral Soundboard', rarity: 'mythic', icon: '🌌' },
  { id: 'conservatory_heart', name: 'Conservatory Heart', rarity: 'mythic', icon: '❤️‍🔥' },
] as const;

export type KeyboardVoiceMeta = {
  id:
    | 'grand_piano'
    | 'honky_tonk'
    | 'harpsichord'
    | 'music_box'
    | 'electric_piano'
    | 'clavinet'
    | 'cathedral_organ'
    | 'accordion'
    | 'arcane_synth'
    | 'bell_organ'
    | 'celesta'
    | 'astral_grand';
  name: string;
  description: string;
  unlockRelics: number;
  icon: string;
};

export const KEYBOARD_VOICES: readonly KeyboardVoiceMeta[] = [
  {
    id: 'grand_piano',
    name: 'Tavern Upright',
    description: 'Warm wooden upright piano.',
    unlockRelics: 0,
    icon: '🎹',
  },
  {
    id: 'honky_tonk',
    name: 'Saloon Honky-Tonk',
    description: 'Detuned ragtime tavern upright.',
    unlockRelics: 1,
    icon: '🍺',
  },
  {
    id: 'harpsichord',
    name: 'Baroque Harpsichord',
    description: 'Crisp, plucked royal harpsichord.',
    unlockRelics: 2,
    icon: '🏰',
  },
  {
    id: 'music_box',
    name: 'Clockwork Music Box',
    description: 'Delicate wind-up chime keys.',
    unlockRelics: 4,
    icon: '⚙️',
  },
  {
    id: 'electric_piano',
    name: 'Velvet Electric Keys',
    description: 'Smooth bell-toned electric piano.',
    unlockRelics: 6,
    icon: '⚡',
  },
  {
    id: 'clavinet',
    name: 'Funky Clavinet',
    description: 'Punchy percussive electric clav.',
    unlockRelics: 8,
    icon: '🎸',
  },
  {
    id: 'cathedral_organ',
    name: 'Cathedral Pipe Organ',
    description: 'Rich, resonant multi-pipe organ.',
    unlockRelics: 10,
    icon: '⛪',
  },
  {
    id: 'accordion',
    name: 'Tavern Concertina',
    description: 'Bellows-driven folk reed organ.',
    unlockRelics: 12,
    icon: '🪗',
  },
  {
    id: 'arcane_synth',
    name: 'Arcane Lead Synth',
    description: 'Detuned fantasy analog synth.',
    unlockRelics: 15,
    icon: '🔮',
  },
  {
    id: 'bell_organ',
    name: 'Gilded Carillon',
    description: 'Shimmering bronze tower bells.',
    unlockRelics: 18,
    icon: '🔔',
  },
  {
    id: 'celesta',
    name: 'Starlight Celesta',
    description: 'Crystalline bell-keyed celesta.',
    unlockRelics: 21,
    icon: '✨',
  },
  {
    id: 'astral_grand',
    name: 'Astral Concert Grand',
    description: 'Lush harmonic masterwork grand.',
    unlockRelics: 24,
    icon: '👑',
  },
] as const;
