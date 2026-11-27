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
    | 'streak14'
    | 'streak30'
    | 'grinder5'
    | 'grace_note'
    | 'relic5'
    | 'relic15'
    | 'relic30'
    | 'mythic_relic'
    | 'voice6'
    | 'level5'
    | 'level10'
    | 'level25'
    | 'level50'
    | 'bounty_hunter'
    | 'encore_champ'
    | 'gauntlet_victor'
    | 'flawless_hard'
    | 'blind_maestro'
    | 'gauntlet_champion';
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
    id: 'bounty_hunter',
    title: 'Tavern Bounty Hunter',
    description: 'Complete and claim a Daily Tavern Bounty.',
    icon: '🎯',
  },
  {
    id: 'level5',
    title: 'Apprentice Graduate',
    description: 'Reach Bard Level 5.',
    icon: '📜',
  },
  {
    id: 'level10',
    title: 'Wandering Troubadour',
    description: 'Reach Bard Level 10.',
    icon: '🪕',
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
    id: 'streak14',
    title: 'Fortnight Headliner',
    description: 'Maintain an unbroken 14-day Tavern streak.',
    icon: '🌙',
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
    id: 'encore_champ',
    title: 'Encore Daredevil',
    description: 'Clear a melody in No-Lights or Fast Tempo Encore mode.',
    icon: '⚡',
  },
  {
    id: 'gauntlet_victor',
    title: 'Stage Duelist',
    description: 'Win a Bardic Gauntlet duel against a rival bard.',
    icon: '⚔️',
  },
  {
    id: 'gauntlet_champion',
    title: 'Grand Stage Champion',
    description: 'Win 5 Bardic Gauntlet rival duels.',
    icon: '🏆',
  },
  {
    id: 'flawless_hard',
    title: 'Virtuoso of the Storm',
    description: 'Score 100% Flawless on a Very Hard or Brutal tune (roll ≤ 7).',
    icon: '🌩️',
  },
  {
    id: 'blind_maestro',
    title: 'Blindfold Maestro',
    description: 'Clear a No-Lights Encore melody with 95%+ accuracy.',
    icon: '🕶️',
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
    description: 'Forge your first Mythic Relic through a hard challenge or streak.',
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
  {
    id: 'level50',
    title: 'Voice of the Realm',
    description: 'Reach Bard Level 50.',
    icon: '🌠',
  },
] as const;

export type RelicMeta = {
  id: string;
  name: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'mythic';
  icon: string;
  /** 'chest' = drops from Mystery Chests; 'challenge' = forged strictly by hard challenges/streaks (0% chest RNG) */
  source: 'chest' | 'challenge';
  /** Human-readable unlock condition for earned-only Mythic Relics */
  challengeHint?: string;
};

export const RELIC_CATALOG: readonly RelicMeta[] = [
  // === 30 COMMON (Chest Drops — 6 Hats, 6 Outfits, 6 Props, 5 Auras, 7 Hair) ===
  { id: 'ivory_keycap', name: 'Ivory Keycap', rarity: 'common', icon: '🎹', source: 'chest' },
  { id: 'brass_fork', name: 'Brass Tuning Fork', rarity: 'common', icon: '🔱', source: 'chest' },
  { id: 'maple_metro', name: 'Maple Metronome', rarity: 'common', icon: '⏳', source: 'chest' },
  { id: 'felt_damper', name: 'Felt Damper', rarity: 'common', icon: '🧶', source: 'chest' },
  { id: 'key_polish', name: 'Resin Key Polish', rarity: 'common', icon: '🧴', source: 'chest' },
  { id: 'pitch_pipe', name: 'Tin Pitch Pipe', rarity: 'common', icon: '🎺', source: 'chest' },
  { id: 'staff_scroll', name: 'Parchment Staff', rarity: 'common', icon: '📜', source: 'chest' },
  { id: 'candle_sheet', name: 'Candlelit Score', rarity: 'common', icon: '🕯️', source: 'chest' },
  { id: 'oak_keyslip', name: 'Oak Keyslip', rarity: 'common', icon: '🪵', source: 'chest' },
  { id: 'linen_cover', name: 'Linen Key Cover', rarity: 'common', icon: '🧣', source: 'chest' },
  { id: 'quill_nib', name: 'Composer Quill', rarity: 'common', icon: '🪶', source: 'chest' },
  { id: 'wax_seal', name: 'Encore Wax Seal', rarity: 'common', icon: '🔏', source: 'chest' },
  { id: 'copper_peg', name: 'Copper Tuning Peg', rarity: 'common', icon: '🔩', source: 'chest' },
  { id: 'rosin_cake', name: 'Amber Rosin Cake', rarity: 'common', icon: '🍯', source: 'chest' },
  { id: 'leather_folio', name: 'Leather Score Folio', rarity: 'common', icon: '📁', source: 'chest' },
  { id: 'tavern_mug', name: 'Tip Jar Tankard', rarity: 'common', icon: '🍺', source: 'chest' },
  // New Common Relics (+14)
  { id: 'straw_brim', name: 'Woven Busker Straw', rarity: 'common', icon: '👒', source: 'chest' },
  { id: 'wool_pin', name: 'Stitched Wool Pin', rarity: 'common', icon: '🧷', source: 'chest' },
  { id: 'felt_band', name: 'Tavern Felt Hatband', rarity: 'common', icon: '🎀', source: 'chest' },
  { id: 'tavern_apron', name: 'Barkeeper Linen Apron', rarity: 'common', icon: '🧥', source: 'chest' },
  { id: 'hemp_sash', name: 'Braided Hemp Sash', rarity: 'common', icon: '🪢', source: 'chest' },
  { id: 'patched_shawl', name: 'Hearthside Wool Shawl', rarity: 'common', icon: '🧣', source: 'chest' },
  { id: 'hearth_spark', name: 'Tinderbox Hearth Flint', rarity: 'common', icon: '🪨', source: 'chest' },
  { id: 'wooden_comb', name: 'Carved Boxwood Comb', rarity: 'common', icon: '🪮', source: 'chest' },
  { id: 'hemp_tie', name: 'Twisted Lute-String Tie', rarity: 'common', icon: '🧵', source: 'chest' },
  { id: 'copper_pin', name: 'Copper Clef Hairpin', rarity: 'common', icon: '📍', source: 'chest' },
  { id: 'barber_tonic', name: 'Bay Rum Hair Tonic', rarity: 'common', icon: '🧪', source: 'chest' },
  { id: 'bone_clasp', name: 'Carved Bone Clasp', rarity: 'common', icon: '🦴', source: 'chest' },
  { id: 'meadow_sprig', name: 'Dried Meadow Sprig', rarity: 'common', icon: '🌿', source: 'chest' },
  { id: 'cedar_brush', name: 'Cedar Bristle Brush', rarity: 'common', icon: '🪥', source: 'chest' },

  // === 25 UNCOMMON (Chest Drops — 5 per slot) ===
  { id: 'silver_capo', name: 'Silver Octave Key', rarity: 'uncommon', icon: '🗝️', source: 'chest' },
  { id: 'velvet_bench', name: 'Velvet Bench Pad', rarity: 'uncommon', icon: '🛋️', source: 'chest' },
  { id: 'ebony_sharp', name: 'Ebony Sharp Key', rarity: 'uncommon', icon: '⬛', source: 'chest' },
  { id: 'copper_coil', name: 'Copper String Coil', rarity: 'uncommon', icon: '🌀', source: 'chest' },
  { id: 'oak_stand', name: 'Oak Music Stand', rarity: 'uncommon', icon: '🎼', source: 'chest' },
  { id: 'tavern_book', name: 'Tavern Songbook', rarity: 'uncommon', icon: '📖', source: 'chest' },
  { id: 'gilded_pedals', name: 'Gilded Sustain Pedals', rarity: 'uncommon', icon: '🦶', source: 'chest' },
  { id: 'bronze_chime', name: 'Bronze Door Chime', rarity: 'uncommon', icon: '🔔', source: 'chest' },
  { id: 'bellows_strap', name: 'Concertina Bellows', rarity: 'uncommon', icon: '🪗', source: 'chest' },
  { id: 'reed_plate', name: 'Brass Reed Plate', rarity: 'uncommon', icon: '🎞️', source: 'chest' },
  { id: 'stained_glass', name: 'Chapel Rose Glass', rarity: 'uncommon', icon: '🪟', source: 'chest' },
  { id: 'silver_baton', name: 'Silver Conductor Baton', rarity: 'uncommon', icon: '🪄', source: 'chest' },
  { id: 'velvet_case', name: 'Velvet Key Roll', rarity: 'uncommon', icon: '🎒', source: 'chest' },
  { id: 'echo_horn', name: 'Brass Echo Horn', rarity: 'uncommon', icon: '📯', source: 'chest' },
  // New Uncommon Relics (+11)
  { id: 'plume_brooch', name: 'Pheasant Plume Brooch', rarity: 'uncommon', icon: '🪶', source: 'chest' },
  { id: 'brocade_cuff', name: 'Gilded Brocade Cuff', rarity: 'uncommon', icon: '🧵', source: 'chest' },
  { id: 'cedar_pick', name: 'Inlaid Cedar Plectrum', rarity: 'uncommon', icon: '🎸', source: 'chest' },
  { id: 'emerald_lens', name: 'Emerald Stage Lantern', rarity: 'uncommon', icon: '🏮', source: 'chest' },
  { id: 'silver_chime_ring', name: 'Silver Chime Ring', rarity: 'uncommon', icon: '💍', source: 'chest' },
  { id: 'velvet_spotlight', name: 'Velvet Stage Curtain', rarity: 'uncommon', icon: '🎭', source: 'chest' },
  { id: 'velvet_ribbon', name: 'Crimson Velvet Ribbon', rarity: 'uncommon', icon: '🎀', source: 'chest' },
  { id: 'silver_fork', name: 'Silver Tuning Hair-Fork', rarity: 'uncommon', icon: '🍴', source: 'chest' },
  { id: 'jade_bead', name: 'Carved Jade Braid Bead', rarity: 'uncommon', icon: '🟢', source: 'chest' },
  { id: 'auburn_henna', name: 'Tavern Spice Henna', rarity: 'uncommon', icon: '🍂', source: 'chest' },
  { id: 'braid_ring', name: 'Gilded Braid Rings', rarity: 'uncommon', icon: '🪙', source: 'chest' },

  // === 20 RARE (Chest Drops — 4 Hats, 4 Outfits, 4 Props, 5 Auras, 3 Hair) ===
  { id: 'amber_box', name: 'Amber Resonance Box', rarity: 'rare', icon: '🔶', source: 'chest' },
  { id: 'sapphire_key', name: 'Sapphire Tuning Key', rarity: 'rare', icon: '💎', source: 'chest' },
  { id: 'clock_arp', name: 'Clockwork Arpeggiator', rarity: 'rare', icon: '⚙️', source: 'chest' },
  { id: 'moon_ring', name: 'Moonstone Chord Ring', rarity: 'rare', icon: '🌙', source: 'chest' },
  { id: 'dragon_hammer', name: 'Dragonbone Hammer', rarity: 'rare', icon: '🐉', source: 'chest' },
  { id: 'phantom_pedal', name: 'Phantom Reverb Pedal', rarity: 'rare', icon: '👻', source: 'chest' },
  { id: 'crystal_pipe', name: 'Crystal Organ Pipe', rarity: 'rare', icon: '🧊', source: 'chest' },
  { id: 'runic_diapason', name: 'Runic Diapason', rarity: 'rare', icon: '🔮', source: 'chest' },
  { id: 'gilded_harp', name: 'Gilded Soundboard', rarity: 'rare', icon: '✨', source: 'chest' },
  { id: 'storm_coil', name: 'Stormglass Osc', rarity: 'rare', icon: '⚡', source: 'chest' },
  { id: 'phoenix_wire', name: 'Phoenix Bass Wire', rarity: 'rare', icon: '🔥', source: 'chest' },
  { id: 'star_compass', name: 'Harmonic Astrolabe', rarity: 'rare', icon: '🧭', source: 'chest' },
  // New Rare Relics (+8)
  { id: 'opal_circlet', name: 'Opal Harmonic Circlet', rarity: 'rare', icon: '💠', source: 'chest' },
  { id: 'clockwork_pauldrons', name: 'Brass Clockwork Cogs', rarity: 'rare', icon: '🛠️', source: 'chest' },
  { id: 'dragon_lute_peg', name: 'Dragonbone Lute Peg', rarity: 'rare', icon: '🦴', source: 'chest' },
  { id: 'crystal_ocarina', name: 'Frost-Crystal Ocarina', rarity: 'rare', icon: '❄️', source: 'chest' },
  { id: 'runic_lyre_string', name: 'Arcane Runic Lyre-String', rarity: 'rare', icon: '🌌', source: 'chest' },
  { id: 'powder_puff', name: 'Courtly Baroque Powder', rarity: 'rare', icon: '🦢', source: 'chest' },
  { id: 'arcana_dye', name: 'Vial of Cyan Arcana', rarity: 'rare', icon: '🧪', source: 'chest' },
  { id: 'storm_feather', name: 'Tempest Roc Hairpin', rarity: 'rare', icon: '🦅', source: 'chest' },

  // === 10 MYTHIC (0% Chest RNG — 100% Earned via Hard Challenges, High Levels & Streaks — 2 per slot) ===
  {
    id: 'grand_crown',
    name: 'Crown of the Keys',
    rarity: 'mythic',
    icon: '👑',
    source: 'challenge',
    challengeHint: 'Score 100% Flawless on a Hard, Very Hard, or Brutal tune (roll ≤ 12)',
  },
  {
    id: 'sovereign_octave',
    name: 'Sovereign Octave',
    rarity: 'mythic',
    icon: '🏆',
    source: 'challenge',
    challengeHint: 'Reach Bard Level 40 (Legend of the Tavern)',
  },
  {
    id: 'astral_board',
    name: 'Astral Soundboard',
    rarity: 'mythic',
    icon: '🌌',
    source: 'challenge',
    challengeHint: 'Build an unbroken 14-Day Tavern Streak',
  },
  {
    id: 'conservatory_heart',
    name: 'Conservatory Heart',
    rarity: 'mythic',
    icon: '❤️‍🔥',
    source: 'challenge',
    challengeHint: 'Clear a Very Hard or Brutal tune (roll ≤ 7) in Encore Mode',
  },
  {
    id: 'phoenix_plume',
    name: 'Living Phoenix Plume',
    rarity: 'mythic',
    icon: '🔥',
    source: 'challenge',
    challengeHint: 'Clear a Brutal (Nat 1) melody with 85%+ accuracy',
  },
  {
    id: 'nebula_comb',
    name: 'Astral Nebula Comb',
    rarity: 'mythic',
    icon: '✨',
    source: 'challenge',
    challengeHint: 'Build an unbroken 21-Day Tavern Streak',
  },
  {
    id: 'celestial_carillon',
    name: 'Celestial Carillon',
    rarity: 'mythic',
    icon: '🌠',
    source: 'challenge',
    challengeHint: 'Win 3 Bardic Gauntlet rival duels',
  },
  {
    id: 'orpheus_lyre',
    name: 'Solar Sovereign Lyre',
    rarity: 'mythic',
    icon: '☀️',
    source: 'challenge',
    challengeHint: 'Collect 50 Chest Relics in the Tavern Vault',
  },
  {
    id: 'chronos_escapement',
    name: 'Chronos Escapement',
    rarity: 'mythic',
    icon: '🕰️',
    source: 'challenge',
    challengeHint: 'Clear 3 Fast-Tempo (+20%) Encore runs',
  },
  {
    id: 'void_resonator',
    name: 'Astral Void Resonator',
    rarity: 'mythic',
    icon: '🌀',
    source: 'challenge',
    challengeHint: 'Clear 3 No-Lights Encore runs',
  },
] as const;

export const CHEST_RELIC_CATALOG: readonly RelicMeta[] = RELIC_CATALOG.filter(
  (r) => r.source === 'chest'
);

export const MYTHIC_RELIC_CATALOG: readonly RelicMeta[] = RELIC_CATALOG.filter(
  (r) => r.source === 'challenge'
);

export type KeyboardVoiceMeta = {
  id:
    | 'grand_piano'
    | 'tavern_lute'
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
    id: 'tavern_lute',
    name: 'Tavern Lute',
    description: 'Crisp plucked fantasy lute strings.',
    unlockRelics: 0,
    icon: '🪕',
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

export const DUPE_PITY_THRESHOLD = 3;

export type DailyBountyId =
  | 'accuracy90'
  | 'runs3'
  | 'flawless'
  | 'clear2'
  | 'accuracy85';

export type DailyBountyMeta = {
  id: DailyBountyId;
  title: string;
  description: string;
  bonusXp: number;
  icon: string;
};

export const DAILY_BOUNTIES: readonly DailyBountyMeta[] = [
  {
    id: 'accuracy90',
    title: 'Precision Encore',
    description: 'Clear today’s melody with 90%+ accuracy.',
    bonusXp: 60,
    icon: '🎯',
  },
  {
    id: 'runs3',
    title: 'Tavern Regular',
    description: 'Complete 3 runs today (pass or fail).',
    bonusXp: 50,
    icon: '🍻',
  },
  {
    id: 'flawless',
    title: 'Golden Standard',
    description: 'Score 100% accuracy on any run today.',
    bonusXp: 80,
    icon: '✨',
  },
  {
    id: 'clear2',
    title: 'Double Encore',
    description: 'Clear today’s melody 2 times.',
    bonusXp: 60,
    icon: '🔁',
  },
  {
    id: 'accuracy85',
    title: 'Steady Hands',
    description: 'Clear today’s melody with 85%+ accuracy.',
    bonusXp: 50,
    icon: '🎵',
  },
] as const;

export function getDailyBounty(utcDate: string): DailyBountyMeta {
  let hash = 0;
  for (let i = 0; i < utcDate.length; i += 1) {
    hash = (hash * 31 + utcDate.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % DAILY_BOUNTIES.length;
  return DAILY_BOUNTIES[idx]!;
}

export const COMMUNITY_DAILY_XP_GOAL = 2500;
export const ENCORE_XP_BONUS_RATE = 0.15;

/**
 * Returns ISO-8601 UTC week key (e.g., "2026-W48") starting Monday 00:00 UTC.
 */
export function getIsoWeekKey(date = new Date()): string {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
  const dayNum = d.getUTCDay() || 7; // Monday = 1 .. Sunday = 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum); // Nearest Thursday determines ISO week-year
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7
  );
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}


