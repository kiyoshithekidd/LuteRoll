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

/**
 * Spell-themed forgiveness:
 * - 3+ day streak: Ward of Grace (1 free missed note per run)
 * - 7+ day streak: Greater Ward of Grace (2 free missed notes per run)
 */
export function getWardOfGraceCharges(streak: number): number {
  if (streak >= 7) return 2;
  if (streak >= 3) return 1;
  return 0;
}

export type FeatMeta = {
  id:
    | 'first_tune'
    | 'flawless'
    | 'nat20'
    | 'nat1_clear'
    | 'streak3'
    | 'streak7'
    | 'streak30'
    | 'grinder5'
    | 'grace_note'
    | 'relic5'
    | 'relic15'
    | 'relic30'
    | 'mythic_relic'
    | 'voice6'
    | 'level25';
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
    description: 'Build a 3-day streak & unlock Ward of Grace (1 free miss).',
    icon: '🍺',
  },
  {
    id: 'streak7',
    title: 'Tavern Legend',
    description: 'Build a 7-day streak & upgrade Ward of Grace (2 free misses).',
    icon: '🛡️',
  },
  {
    id: 'streak30',
    title: 'Tavern Immortal',
    description: 'Reach a legendary 30-day streak.',
    icon: '👑',
  },
  {
    id: 'grinder5',
    title: 'Encore Virtuoso',
    description: 'Play 5+ runs in a single day.',
    icon: '🎻',
  },
  {
    id: 'grace_note',
    title: 'Ward of Grace',
    description: 'Clear a melody saved by the Ward of Grace spell.',
    icon: '🪄',
  },
  {
    id: 'relic5',
    title: 'Pocket Collector',
    description: 'Discover 5 unique Tavern Relics.',
    icon: '🎒',
  },
  {
    id: 'relic15',
    title: 'Curator of Keys',
    description: 'Discover 15 unique Tavern Relics.',
    icon: '🗝️',
  },
  {
    id: 'relic30',
    title: 'Archivist of the Vault',
    description: 'Discover 30 unique Tavern Relics.',
    icon: '🏛️',
  },
  {
    id: 'mythic_relic',
    title: 'Mythic Resonance',
    description: 'Unearth a Mythic-rarity Relic from a Mystery Chest.',
    icon: '🌌',
  },
  {
    id: 'voice6',
    title: 'Multi-Instrumentalist',
    description: 'Unlock 6 keyboard voices (12+ relics).',
    icon: '🎹',
  },
  {
    id: 'level25',
    title: 'Grand Virtuoso',
    description: 'Reach Bard Level 25.',
    icon: '🌟',
  },
] as const;

export type RelicMeta = {
  id: string;
  name: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'mythic';
  icon: string;
};

export const RELIC_CATALOG: readonly RelicMeta[] = [
  // 16 Common
  { id: 'ivory_keycap', name: 'Ivory Keycap', rarity: 'common', icon: '🎹' },
  { id: 'brass_fork', name: 'Brass Tuning Fork', rarity: 'common', icon: '🔱' },
  { id: 'maple_metro', name: 'Maple Metronome', rarity: 'common', icon: '⏳' },
  { id: 'felt_damper', name: 'Felt Damper', rarity: 'common', icon: '🧶' },
  { id: 'key_polish', name: 'Resin Key Polish', rarity: 'common', icon: '🧴' },
  { id: 'pitch_pipe', name: 'Tin Pitch Pipe', rarity: 'common', icon: '🎺' },
  { id: 'staff_scroll', name: 'Parchment Staff', rarity: 'common', icon: '📜' },
  { id: 'candle_sheet', name: 'Candlelit Score', rarity: 'common', icon: '🕯️' },
  { id: 'oak_keyslip', name: 'Oak Keyslip', rarity: 'common', icon: '🪵' },
  { id: 'linen_cover', name: 'Linen Key Cover', rarity: 'common', icon: '🧣' },
  { id: 'quill_nib', name: 'Composer Quill', rarity: 'common', icon: '🪶' },
  { id: 'wax_seal', name: 'Encore Wax Seal', rarity: 'common', icon: '🔏' },
  { id: 'copper_peg', name: 'Copper Tuning Peg', rarity: 'common', icon: '🔩' },
  { id: 'rosin_cake', name: 'Amber Rosin Cake', rarity: 'common', icon: '🍯' },
  { id: 'leather_folio', name: 'Leather Score Folio', rarity: 'common', icon: '📁' },
  { id: 'tavern_mug', name: 'Tip Jar Tankard', rarity: 'common', icon: '🍺' },
  // 14 Uncommon
  { id: 'silver_capo', name: 'Silver Octave Key', rarity: 'uncommon', icon: '🗝️' },
  { id: 'velvet_bench', name: 'Velvet Bench Pad', rarity: 'uncommon', icon: '🛋️' },
  { id: 'ebony_sharp', name: 'Ebony Sharp Key', rarity: 'uncommon', icon: '⬛' },
  { id: 'copper_coil', name: 'Copper String Coil', rarity: 'uncommon', icon: '🌀' },
  { id: 'oak_stand', name: 'Oak Music Stand', rarity: 'uncommon', icon: '🎼' },
  { id: 'tavern_book', name: 'Tavern Songbook', rarity: 'uncommon', icon: '📖' },
  { id: 'gilded_pedals', name: 'Gilded Sustain Pedals', rarity: 'uncommon', icon: '🦶' },
  { id: 'bronze_chime', name: 'Bronze Door Chime', rarity: 'uncommon', icon: '🔔' },
  { id: 'bellows_strap', name: 'Concertina Bellows', rarity: 'uncommon', icon: '🪗' },
  { id: 'reed_plate', name: 'Brass Reed Plate', rarity: 'uncommon', icon: '🎞️' },
  { id: 'stained_glass', name: 'Chapel Rose Glass', rarity: 'uncommon', icon: '🪟' },
  { id: 'silver_baton', name: 'Silver Conductor Baton', rarity: 'uncommon', icon: '🪄' },
  { id: 'velvet_case', name: 'Velvet Key Roll', rarity: 'uncommon', icon: '🎒' },
  { id: 'echo_horn', name: 'Brass Echo Horn', rarity: 'uncommon', icon: '📯' },
  // 12 Rare
  { id: 'amber_box', name: 'Amber Resonance Box', rarity: 'rare', icon: '🔶' },
  { id: 'sapphire_key', name: 'Sapphire Tuning Key', rarity: 'rare', icon: '💎' },
  { id: 'clock_arp', name: 'Clockwork Arpeggiator', rarity: 'rare', icon: '⚙️' },
  { id: 'moon_ring', name: 'Moonstone Chord Ring', rarity: 'rare', icon: '🌙' },
  { id: 'dragon_hammer', name: 'Dragonbone Hammer', rarity: 'rare', icon: '🐉' },
  { id: 'phantom_pedal', name: 'Phantom Reverb Pedal', rarity: 'rare', icon: '👻' },
  { id: 'crystal_pipe', name: 'Crystal Organ Pipe', rarity: 'rare', icon: '🧊' },
  { id: 'runic_diapason', name: 'Runic Diapason', rarity: 'rare', icon: '🔮' },
  { id: 'gilded_harp', name: 'Gilded Soundboard', rarity: 'rare', icon: '✨' },
  { id: 'storm_coil', name: 'Stormglass Osc', rarity: 'rare', icon: '⚡' },
  { id: 'phoenix_wire', name: 'Phoenix Bass Wire', rarity: 'rare', icon: '🔥' },
  { id: 'star_compass', name: 'Harmonic Astrolabe', rarity: 'rare', icon: '🧭' },
  // 6 Mythic
  { id: 'grand_crown', name: 'Crown of the Keys', rarity: 'mythic', icon: '👑' },
  { id: 'astral_board', name: 'Astral Soundboard', rarity: 'mythic', icon: '🌌' },
  { id: 'conservatory_heart', name: 'Conservatory Heart', rarity: 'mythic', icon: '❤️‍🔥' },
  { id: 'celestial_carillon', name: 'Celestial Carillon', rarity: 'mythic', icon: '🌠' },
  { id: 'chronos_escapement', name: 'Chronos Escapement', rarity: 'mythic', icon: '🕰️' },
  { id: 'sovereign_octave', name: 'Sovereign Octave', rarity: 'mythic', icon: '🏆' },
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
    unlockRelics: 3,
    icon: '🏰',
  },
  {
    id: 'music_box',
    name: 'Clockwork Music Box',
    description: 'Delicate wind-up chime keys.',
    unlockRelics: 6,
    icon: '⚙️',
  },
  {
    id: 'electric_piano',
    name: 'Velvet Electric Keys',
    description: 'Smooth bell-toned electric piano.',
    unlockRelics: 9,
    icon: '⚡',
  },
  {
    id: 'clavinet',
    name: 'Funky Clavinet',
    description: 'Punchy percussive electric clav.',
    unlockRelics: 12,
    icon: '🎸',
  },
  {
    id: 'cathedral_organ',
    name: 'Cathedral Pipe Organ',
    description: 'Rich, resonant multi-pipe organ.',
    unlockRelics: 16,
    icon: '⛪',
  },
  {
    id: 'accordion',
    name: 'Tavern Concertina',
    description: 'Bellows-driven folk reed organ.',
    unlockRelics: 20,
    icon: '🪗',
  },
  {
    id: 'arcane_synth',
    name: 'Arcane Lead Synth',
    description: 'Detuned fantasy analog synth.',
    unlockRelics: 25,
    icon: '🔮',
  },
  {
    id: 'bell_organ',
    name: 'Gilded Carillon',
    description: 'Shimmering bronze tower bells.',
    unlockRelics: 30,
    icon: '🔔',
  },
  {
    id: 'celesta',
    name: 'Starlight Celesta',
    description: 'Crystalline bell-keyed celesta.',
    unlockRelics: 35,
    icon: '✨',
  },
  {
    id: 'astral_grand',
    name: 'Astral Concert Grand',
    description: 'Lush harmonic masterwork grand.',
    unlockRelics: 40,
    icon: '👑',
  },
] as const;
