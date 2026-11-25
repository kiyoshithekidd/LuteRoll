import type { KeyboardVoiceId, RareFeat } from './api';

export type BardCosmeticSlot = 'hat' | 'cloak' | 'prop' | 'frame';

export type BardPortraitId =
  | 'busker'
  | 'minstrel'
  | 'baroque'
  | 'clockwork'
  | 'arcane'
  | 'dragon'
  | 'celesta'
  | 'astral'
  | 'nat20'
  | 'flawless'
  | 'brutal';

export type BardPortraitMeta = {
  id: BardPortraitId;
  name: string;
  subtitle: string;
  unlockRelics?: number;
  unlockRelicId?: string;
  unlockFeatId?: RareFeat;
};

export const BARD_PORTRAITS: readonly BardPortraitMeta[] = [
  { id: 'busker', name: 'Tavern Busker', subtitle: 'Starter • Feathered Cap & Lute', unlockRelics: 0 },
  { id: 'minstrel', name: 'Hooded Minstrel', subtitle: 'Starter • Candlelit Quill & Scroll', unlockRelics: 0 },
  { id: 'baroque', name: 'Baroque Noble', subtitle: '3 Relics or Velvet Bench Pad', unlockRelics: 3, unlockRelicId: 'velvet_bench' },
  { id: 'clockwork', name: 'Clockwork Tinker', subtitle: '6 Relics or Clockwork Arpeggiator', unlockRelics: 6, unlockRelicId: 'clock_arp' },
  { id: 'arcane', name: 'Arcane Rune-Weaver', subtitle: '12 Relics or Runic Diapason', unlockRelics: 12, unlockRelicId: 'runic_diapason' },
  { id: 'dragon', name: 'Dragoncrest Troubadour', subtitle: '18 Relics or Dragonbone Hammer', unlockRelics: 18, unlockRelicId: 'dragon_hammer' },
  { id: 'celesta', name: 'Starlight Celesta', subtitle: '25 Relics or Crystal Organ Pipe', unlockRelics: 25, unlockRelicId: 'crystal_pipe' },
  { id: 'astral', name: 'Astral Sovereign', subtitle: 'Mythic Relic or Crown of the Keys', unlockRelicId: 'grand_crown', unlockFeatId: 'mythic_relic' },
  { id: 'nat20', name: 'Nat 20 Champion', subtitle: 'Feat: Blessed by Fate (Nat 20)', unlockFeatId: 'nat20' },
  { id: 'flawless', name: 'Golden Ear Virtuoso', subtitle: 'Feat: Golden Ear (100% Clear)', unlockFeatId: 'flawless' },
  { id: 'brutal', name: 'Brutal Underdog', subtitle: 'Feat: Underdog Encore (Nat 1 Clear)', unlockFeatId: 'nat1_clear' },
] as const;

export function isPortraitUnlocked(
  portrait: BardPortraitMeta,
  ownedRelics: readonly string[],
  ownedFeats: readonly RareFeat[]
): boolean {
  if (portrait.unlockRelics === 0) return true;
  if (portrait.unlockRelics !== undefined && ownedRelics.length >= portrait.unlockRelics) {
    return true;
  }
  if (portrait.unlockRelicId && ownedRelics.includes(portrait.unlockRelicId)) {
    return true;
  }
  if (portrait.unlockFeatId && ownedFeats.includes(portrait.unlockFeatId)) {
    return true;
  }
  return false;
}

export type DiceSkinId =
  | 'tavern_gold'
  | 'emerald_felt'
  | 'obsidian_crimson'
  | 'starlight_crystal'
  | 'astral_galaxy';

export type DiceSkinMeta = {
  id: DiceSkinId;
  name: string;
  unlockHint: string;
  unlockStreak?: number;
  unlockRelics?: number;
  unlockFeat?: RareFeat;
  gradInner: string;
  gradMid: string;
  gradOuter: string;
  ringColor: string;
  numColor: string;
  nat20Color: string;
  nat1Color: string;
};

export const DICE_SKINS: readonly DiceSkinMeta[] = [
  {
    id: 'tavern_gold',
    name: 'Tavern Gold',
    unlockHint: 'Starter',
    gradInner: '#ffe875',
    gradMid: '#d4af37',
    gradOuter: '#8a6412',
    ringColor: 'rgba(255, 245, 200, 0.35)',
    numColor: '#1c1208',
    nat20Color: '#1b0f00',
    nat1Color: '#5c0a0a',
  },
  {
    id: 'emerald_felt',
    name: 'Emerald Felt d20',
    unlockHint: '3-Day Streak',
    unlockStreak: 3,
    gradInner: '#6ee7b7',
    gradMid: '#10b981',
    gradOuter: '#064e3b',
    ringColor: 'rgba(255, 232, 117, 0.5)',
    numColor: '#fef3c7',
    nat20Color: '#ffe875',
    nat1Color: '#fca5a5',
  },
  {
    id: 'obsidian_crimson',
    name: 'Obsidian & Crimson',
    unlockHint: 'Feat: Underdog Encore (Nat 1)',
    unlockFeat: 'nat1_clear',
    gradInner: '#3f3f46',
    gradMid: '#18181b',
    gradOuter: '#09090b',
    ringColor: 'rgba(239, 68, 68, 0.55)',
    numColor: '#fca5a5',
    nat20Color: '#fde047',
    nat1Color: '#ef4444',
  },
  {
    id: 'starlight_crystal',
    name: 'Starlight Crystal',
    unlockHint: '25 Relics',
    unlockRelics: 25,
    gradInner: '#e0f2fe',
    gradMid: '#38bdf8',
    gradOuter: '#0c4a6e',
    ringColor: 'rgba(255, 255, 255, 0.55)',
    numColor: '#082f49',
    nat20Color: '#fef08a',
    nat1Color: '#9f1239',
  },
  {
    id: 'astral_galaxy',
    name: 'Astral Galaxy d20',
    unlockHint: 'Feat: Mythic Resonance',
    unlockFeat: 'mythic_relic',
    gradInner: '#c084fc',
    gradMid: '#4c1d95',
    gradOuter: '#1e1b4b',
    ringColor: 'rgba(253, 224, 71, 0.65)',
    numColor: '#fef08a',
    nat20Color: '#ffffff',
    nat1Color: '#fb7185',
  },
] as const;

export function isDiceSkinUnlocked(
  skin: DiceSkinMeta,
  ownedRelics: readonly string[],
  ownedFeats: readonly RareFeat[],
  streak: number
): boolean {
  if (skin.unlockStreak !== undefined && streak < skin.unlockStreak) return false;
  if (skin.unlockRelics !== undefined && ownedRelics.length < skin.unlockRelics) {
    return false;
  }
  if (skin.unlockFeat && !ownedFeats.includes(skin.unlockFeat)) return false;
  return true;
}

export type NoteParticleId =
  | 'emerald_spark'
  | 'golden_note'
  | 'arcane_rune'
  | 'ember_spark'
  | 'frost_flake';

export type NoteParticleMeta = {
  id: NoteParticleId;
  name: string;
  symbol: string;
  colorClass: string;
  unlockHint: string;
  unlockRelics?: number;
  unlockFeat?: RareFeat;
};

export const NOTE_PARTICLE_SKINS: readonly NoteParticleMeta[] = [
  {
    id: 'emerald_spark',
    name: 'Emerald Spark',
    symbol: '✦',
    colorClass: 'text-emerald-300',
    unlockHint: 'Starter',
  },
  {
    id: 'golden_note',
    name: 'Golden Notes',
    symbol: '♪',
    colorClass: 'text-[#ffe875]',
    unlockHint: 'Feat: Golden Ear (100%)',
    unlockFeat: 'flawless',
  },
  {
    id: 'arcane_rune',
    name: 'Arcane Runes',
    symbol: '✧',
    colorClass: 'text-cyan-300',
    unlockHint: '10 Relics',
    unlockRelics: 10,
  },
  {
    id: 'ember_spark',
    name: 'Ember Sparks',
    symbol: '🔥',
    colorClass: 'text-orange-300',
    unlockHint: 'Feat: Encore Virtuoso (5+ plays)',
    unlockFeat: 'grinder5',
  },
  {
    id: 'frost_flake',
    name: 'Frostflakes',
    symbol: '❄️',
    colorClass: 'text-sky-200',
    unlockHint: '20 Relics',
    unlockRelics: 20,
  },
] as const;

export function isParticleSkinUnlocked(
  skin: NoteParticleMeta,
  ownedRelics: readonly string[],
  ownedFeats: readonly RareFeat[]
): boolean {
  if (skin.unlockRelics !== undefined && ownedRelics.length < skin.unlockRelics) {
    return false;
  }
  if (skin.unlockFeat && !ownedFeats.includes(skin.unlockFeat)) return false;
  return true;
}

export type BardEpithetId =
  | 'none'
  | 'tomato_dodger'
  | 'nat20_magnet'
  | 'midnight_grinder'
  | 'lute_whisperer'
  | 'underdog_hero'
  | 'vault_curator'
  | 'tavern_immortal';

export type BardEpithetMeta = {
  id: BardEpithetId;
  label: string;
  unlockHint: string;
  unlockFeat?: RareFeat;
  unlockRelics?: number;
};

export const BARD_EPITHETS: readonly BardEpithetMeta[] = [
  { id: 'none', label: 'No Epithet', unlockHint: 'Starter' },
  { id: 'tomato_dodger', label: 'Tomato Dodger', unlockHint: 'Feat: Tavern Debut', unlockFeat: 'first_tune' },
  { id: 'nat20_magnet', label: 'Nat 20 Magnet', unlockHint: 'Feat: Blessed by Fate', unlockFeat: 'nat20' },
  { id: 'midnight_grinder', label: 'Midnight Grinder', unlockHint: 'Feat: Encore Virtuoso', unlockFeat: 'grinder5' },
  { id: 'lute_whisperer', label: 'Lute Whisperer', unlockHint: 'Feat: Golden Ear', unlockFeat: 'flawless' },
  { id: 'underdog_hero', label: 'Brutal Conqueror', unlockHint: 'Feat: Underdog Encore', unlockFeat: 'nat1_clear' },
  { id: 'vault_curator', label: 'Vault Curator', unlockHint: '15 Relics', unlockRelics: 15 },
  { id: 'tavern_immortal', label: 'Tavern Immortal', unlockHint: 'Feat: 30-Day Streak', unlockFeat: 'streak30' },
] as const;

export function isEpithetUnlocked(
  ep: BardEpithetMeta,
  ownedRelics: readonly string[],
  ownedFeats: readonly RareFeat[]
): boolean {
  if (ep.id === 'none') return true;
  if (ep.unlockRelics !== undefined && ownedRelics.length < ep.unlockRelics) {
    return false;
  }
  if (ep.unlockFeat && !ownedFeats.includes(ep.unlockFeat)) return false;
  return true;
}

export type BardAvatarConfig = {
  portrait?: BardPortraitId;
  badgeId?: string | null;
  diceSkin?: DiceSkinId;
  particleSkin?: NoteParticleId;
  epithet?: BardEpithetId;
  hat: string;
  cloak: string;
  prop: string;
  frame: string;
  skinTone: string;
  useSnoovatar?: boolean;
};

export type BardCosmeticItem = {
  id: string;
  slot: BardCosmeticSlot;
  name: string;
  /** null = not gated by relic; otherwise exact relic ID from RELIC_CATALOG */
  unlockRelicId: string | null;
  /** optional exact feat ID from FEAT_CATALOG */
  unlockFeatId?: RareFeat | null;
  primaryColor: string;
  accentColor: string;
  shape: string;
};

export type SkinToneMeta = {
  id: string;
  name: string;
  fill: string;
  shade: string;
};

export const BARD_SKIN_TONES: readonly SkinToneMeta[] = [
  { id: 'porcelain', name: 'Porcelain', fill: '#f6d5be', shade: '#deb092' },
  { id: 'peach', name: 'Warm Peach', fill: '#e8b896', shade: '#c9906b' },
  { id: 'tan', name: 'Golden Tan', fill: '#cf966b', shade: '#ad7249' },
  { id: 'amber', name: 'Rich Amber', fill: '#9f6741', shade: '#7d4c2c' },
  { id: 'umber', name: 'Deep Umber', fill: '#6b4027', shade: '#4d2b18' },
] as const;

export const DEFAULT_BARD_AVATAR: BardAvatarConfig = {
  portrait: 'busker',
  badgeId: null,
  diceSkin: 'tavern_gold',
  particleSkin: 'emerald_spark',
  epithet: 'none',
  hat: 'feathered_cap',
  cloak: 'forest_green',
  prop: 'wooden_lute',
  frame: 'candlelit_hearth',
  skinTone: 'peach',
  useSnoovatar: false,
};

/**
 * Base options (unlockRelicId: null & no unlockFeatId)
 * + exact 1-to-1 mapping for all 48 Relics in RELIC_CATALOG
 * + exact 1-to-1 mapping for all 15 Feats in FEAT_CATALOG.
 */
export const BARD_COSMETICS: readonly BardCosmeticItem[] = [
  // === HATS (3 base + 12 relic-unlocked + 4 feat-unlocked) ===
  { id: 'feathered_cap', slot: 'hat', name: 'Feathered Cap', unlockRelicId: null, primaryColor: '#1f5c3e', accentColor: '#ffe875', shape: 'feather' },
  { id: 'tavern_hood', slot: 'hat', name: 'Tavern Hood', unlockRelicId: null, primaryColor: '#4e2c18', accentColor: '#d4af37', shape: 'hood' },
  { id: 'bareheaded', slot: 'hat', name: 'Bareheaded', unlockRelicId: null, primaryColor: '#3b2414', accentColor: '#d4af37', shape: 'none' },
  { id: 'linen_hood', slot: 'hat', name: 'Linen Bard Hood', unlockRelicId: 'linen_cover', primaryColor: '#d8c9aa', accentColor: '#8c6239', shape: 'hood' },
  { id: 'wax_beret', slot: 'hat', name: 'Crimson Wax Beret', unlockRelicId: 'wax_seal', primaryColor: '#8f1d24', accentColor: '#ffe875', shape: 'beret' },
  { id: 'tavern_cap', slot: 'hat', name: 'Tavern Regular Cap', unlockRelicId: 'tavern_mug', primaryColor: '#7a4b21', accentColor: '#f5d78e', shape: 'feather' },
  { id: 'silver_circlet', slot: 'hat', name: 'Silver Octave Circlet', unlockRelicId: 'silver_capo', primaryColor: '#cbd5e1', accentColor: '#38bdf8', shape: 'circlet' },
  { id: 'velvet_cap', slot: 'hat', name: 'Velvet Troubadour Cap', unlockRelicId: 'velvet_bench', primaryColor: '#581c87', accentColor: '#f59e0b', shape: 'feather' },
  { id: 'concertina_cap', slot: 'hat', name: 'Folk Concertina Cap', unlockRelicId: 'bellows_strap', primaryColor: '#991b1b', accentColor: '#fef3c7', shape: 'beret' },
  { id: 'chapel_crown', slot: 'hat', name: 'Chapel Rose Crown', unlockRelicId: 'stained_glass', primaryColor: '#1d4ed8', accentColor: '#fbbf24', shape: 'circlet' },
  { id: 'moonstone_tiara', slot: 'hat', name: 'Moonstone Tiara', unlockRelicId: 'moon_ring', primaryColor: '#e0f2fe', accentColor: '#38bdf8', shape: 'circlet' },
  { id: 'dragon_helm', slot: 'hat', name: 'Dragoncrest Helm', unlockRelicId: 'dragon_hammer', primaryColor: '#7f1d1d', accentColor: '#fbbf24', shape: 'wizard' },
  { id: 'astrolabe_hat', slot: 'hat', name: 'Astrolabe Tricorne', unlockRelicId: 'star_compass', primaryColor: '#1e293b', accentColor: '#facc15', shape: 'tricorne' },
  { id: 'crown_of_keys', slot: 'hat', name: 'Crown of the Keys', unlockRelicId: 'grand_crown', primaryColor: '#f59e0b', accentColor: '#fffbeb', shape: 'crown' },
  { id: 'sovereign_diadem', slot: 'hat', name: 'Sovereign Diadem', unlockRelicId: 'sovereign_octave', primaryColor: '#fde047', accentColor: '#a855f7', shape: 'crown' },
  // Feat Hats
  { id: 'debut_hat', slot: 'hat', name: 'Debut Busker Cap', unlockRelicId: null, unlockFeatId: 'first_tune', primaryColor: '#92400e', accentColor: '#fde68a', shape: 'beret' },
  { id: 'golden_laurel', slot: 'hat', name: 'Golden Ear Laurel', unlockRelicId: null, unlockFeatId: 'flawless', primaryColor: '#facc15', accentColor: '#fffbeb', shape: 'circlet' },
  { id: 'brutal_helm', slot: 'hat', name: 'Brutal Underdog Helm', unlockRelicId: null, unlockFeatId: 'nat1_clear', primaryColor: '#450a0a', accentColor: '#ef4444', shape: 'tricorne' },
  { id: 'immortal_crown', slot: 'hat', name: 'Immortal Sun Crown', unlockRelicId: null, unlockFeatId: 'streak30', primaryColor: '#fde047', accentColor: '#f97316', shape: 'crown' },

  // === CLOAKS (4 base + 12 relic-unlocked + 4 feat-unlocked) ===
  { id: 'forest_green', slot: 'cloak', name: 'Forest Green', unlockRelicId: null, primaryColor: '#154731', accentColor: '#d4af37', shape: 'standard' },
  { id: 'burgundy_wine', slot: 'cloak', name: 'Burgundy Wine', unlockRelicId: null, primaryColor: '#6b1d28', accentColor: '#e5c158', shape: 'standard' },
  { id: 'tavern_brown', slot: 'cloak', name: 'Tavern Brown', unlockRelicId: null, primaryColor: '#523018', accentColor: '#d4af37', shape: 'standard' },
  { id: 'midnight_navy', slot: 'cloak', name: 'Midnight Navy', unlockRelicId: null, primaryColor: '#1e2f4d', accentColor: '#93c5fd', shape: 'standard' },
  { id: 'felt_cloak', slot: 'cloak', name: 'Emerald Felt Cloak', unlockRelicId: 'felt_damper', primaryColor: '#0f5132', accentColor: '#ffe875', shape: 'trim' },
  { id: 'oakleaf_mantle', slot: 'cloak', name: 'Oakleaf Mantle', unlockRelicId: 'oak_keyslip', primaryColor: '#4d3319', accentColor: '#84cc16', shape: 'trim' },
  { id: 'songsmith_coat', slot: 'cloak', name: 'Leather Songsmith Coat', unlockRelicId: 'leather_folio', primaryColor: '#3f2514', accentColor: '#f59e0b', shape: 'collared' },
  { id: 'ebony_coat', slot: 'cloak', name: 'Ebony Formal Coat', unlockRelicId: 'ebony_sharp', primaryColor: '#18181b', accentColor: '#f8fafc', shape: 'collared' },
  { id: 'minstrel_tabard', slot: 'cloak', name: 'Minstrel Tabard', unlockRelicId: 'tavern_book', primaryColor: '#7c2d12', accentColor: '#fde68a', shape: 'trim' },
  { id: 'brass_tunic', slot: 'cloak', name: 'Brass-Trimmed Tunic', unlockRelicId: 'reed_plate', primaryColor: '#78350f', accentColor: '#fbbf24', shape: 'collared' },
  { id: 'velvet_cape', slot: 'cloak', name: 'Velvet Key-Roll Cape', unlockRelicId: 'velvet_case', primaryColor: '#4c1d95', accentColor: '#e9d5ff', shape: 'royal' },
  { id: 'amber_mantle', slot: 'cloak', name: 'Amber Resonance Mantle', unlockRelicId: 'amber_box', primaryColor: '#b45309', accentColor: '#fef08a', shape: 'royal' },
  { id: 'sapphire_cloak', slot: 'cloak', name: 'Sapphire Silk Cloak', unlockRelicId: 'sapphire_key', primaryColor: '#1e3a8a', accentColor: '#7dd3fc', shape: 'royal' },
  { id: 'phoenix_cloak', slot: 'cloak', name: 'Phoenix Ember Cloak', unlockRelicId: 'phoenix_wire', primaryColor: '#991b1b', accentColor: '#fb923c', shape: 'royal' },
  { id: 'astral_cloak', slot: 'cloak', name: 'Astral Starlight Cloak', unlockRelicId: 'astral_board', primaryColor: '#312e81', accentColor: '#fde047', shape: 'astral' },
  { id: 'conservatory_robes', slot: 'cloak', name: 'Conservatory Royal Robes', unlockRelicId: 'conservatory_heart', primaryColor: '#7f1d1d', accentColor: '#ffe875', shape: 'astral' },
  // Feat Cloaks
  { id: 'legend_ward_mantle', slot: 'cloak', name: "Legend's Ward Mantle", unlockRelicId: null, unlockFeatId: 'streak7', primaryColor: '#0c4a6e', accentColor: '#38bdf8', shape: 'royal' },
  { id: 'curator_mantle', slot: 'cloak', name: "Curator's Velvet Mantle", unlockRelicId: null, unlockFeatId: 'relic15', primaryColor: '#581c87', accentColor: '#fde047', shape: 'royal' },
  { id: 'archivist_robes', slot: 'cloak', name: "Archivist's Gilded Robes", unlockRelicId: null, unlockFeatId: 'relic30', primaryColor: '#1e293b', accentColor: '#ffe875', shape: 'astral' },
  { id: 'virtuoso_cape', slot: 'cloak', name: 'Grand Virtuoso Cape', unlockRelicId: null, unlockFeatId: 'level25', primaryColor: '#7c2d12', accentColor: '#fef08a', shape: 'astral' },

  // === PROPS (2 base + 12 relic-unlocked + 3 feat-unlocked) ===
  { id: 'wooden_lute', slot: 'prop', name: 'Wooden Lute', unlockRelicId: null, primaryColor: '#b47438', accentColor: '#ffe875', shape: 'lute' },
  { id: 'quill_scroll', slot: 'prop', name: 'Quill & Scroll', unlockRelicId: null, primaryColor: '#f3e4c3', accentColor: '#d4af37', shape: 'scroll' },
  { id: 'brass_fork_prop', slot: 'prop', name: 'Brass Tuning Fork', unlockRelicId: 'brass_fork', primaryColor: '#d4af37', accentColor: '#fef08a', shape: 'fork' },
  { id: 'maple_metro_prop', slot: 'prop', name: 'Maple Metronome', unlockRelicId: 'maple_metro', primaryColor: '#9a5b25', accentColor: '#ffe875', shape: 'metro' },
  { id: 'pitch_pipe_prop', slot: 'prop', name: 'Tin Pitch Pipe', unlockRelicId: 'pitch_pipe', primaryColor: '#94a3b8', accentColor: '#e2e8f0', shape: 'horn' },
  { id: 'staff_scroll_prop', slot: 'prop', name: 'Parchment Staff', unlockRelicId: 'staff_scroll', primaryColor: '#fde68a', accentColor: '#92400e', shape: 'scroll' },
  { id: 'composer_quill', slot: 'prop', name: 'Golden Composer Quill', unlockRelicId: 'quill_nib', primaryColor: '#facc15', accentColor: '#fffbeb', shape: 'quill' },
  { id: 'copper_lute', slot: 'prop', name: 'Copper-Pegged Lute', unlockRelicId: 'copper_peg', primaryColor: '#c2410c', accentColor: '#fdba74', shape: 'lute' },
  { id: 'oak_stand_prop', slot: 'prop', name: 'Oak Music Stand', unlockRelicId: 'oak_stand', primaryColor: '#78350f', accentColor: '#fef3c7', shape: 'scroll' },
  { id: 'bronze_chime_prop', slot: 'prop', name: 'Bronze Bell Chime', unlockRelicId: 'bronze_chime', primaryColor: '#b45309', accentColor: '#fde68a', shape: 'bell' },
  { id: 'silver_baton_prop', slot: 'prop', name: 'Silver Conductor Baton', unlockRelicId: 'silver_baton', primaryColor: '#e2e8f0', accentColor: '#38bdf8', shape: 'baton' },
  { id: 'echo_horn_prop', slot: 'prop', name: 'Brass Echo Horn', unlockRelicId: 'echo_horn', primaryColor: '#eab308', accentColor: '#fef9c3', shape: 'horn' },
  { id: 'clock_arp_prop', slot: 'prop', name: 'Clockwork Arpeggiator', unlockRelicId: 'clock_arp', primaryColor: '#d97706', accentColor: '#38bdf8', shape: 'gear' },
  { id: 'celestial_bell', slot: 'prop', name: 'Celestial Carillon Bell', unlockRelicId: 'celestial_carillon', primaryColor: '#fde047', accentColor: '#c084fc', shape: 'bell' },
  // Feat Props
  { id: 'encore_lute', slot: 'prop', name: 'Encore Gilded Lute', unlockRelicId: null, unlockFeatId: 'grinder5', primaryColor: '#f59e0b', accentColor: '#fffbeb', shape: 'lute' },
  { id: 'collector_satchel', slot: 'prop', name: "Collector's Relic Gear", unlockRelicId: null, unlockFeatId: 'relic5', primaryColor: '#78350f', accentColor: '#facc15', shape: 'gear' },
  { id: 'maestro_baton', slot: 'prop', name: "Maestro's Golden Baton", unlockRelicId: null, unlockFeatId: 'voice6', primaryColor: '#fde047', accentColor: '#38bdf8', shape: 'baton' },

  // === FRAMES / AURAS (2 base + 12 relic-unlocked + 4 feat-unlocked) ===
  { id: 'candlelit_hearth', slot: 'frame', name: 'Candlelit Hearth', unlockRelicId: null, primaryColor: '#2c180b', accentColor: '#d4af37', shape: 'warm' },
  { id: 'emerald_felt', slot: 'frame', name: 'Emerald Felt', unlockRelicId: null, primaryColor: '#0e3623', accentColor: '#4ade80', shape: 'felt' },
  { id: 'ivory_gleam', slot: 'frame', name: 'Ivory Gleam Frame', unlockRelicId: 'ivory_keycap', primaryColor: '#3b2b1a', accentColor: '#fffbeb', shape: 'warm' },
  { id: 'resin_gloss', slot: 'frame', name: 'Resin Gloss Frame', unlockRelicId: 'key_polish', primaryColor: '#451a03', accentColor: '#fbbf24', shape: 'spark' },
  { id: 'candle_score_aura', slot: 'frame', name: 'Candlelit Score Aura', unlockRelicId: 'candle_sheet', primaryColor: '#431407', accentColor: '#fb923c', shape: 'glow' },
  { id: 'amber_glow', slot: 'frame', name: 'Warm Amber Glow', unlockRelicId: 'rosin_cake', primaryColor: '#78350f', accentColor: '#fde047', shape: 'glow' },
  { id: 'copper_trim', slot: 'frame', name: 'Copper Coil Trim', unlockRelicId: 'copper_coil', primaryColor: '#431407', accentColor: '#f97316', shape: 'ring' },
  { id: 'gilded_trim', slot: 'frame', name: 'Gilded Pedal Trim', unlockRelicId: 'gilded_pedals', primaryColor: '#291b06', accentColor: '#facc15', shape: 'ring' },
  { id: 'phantom_mist', slot: 'frame', name: 'Phantom Mist Aura', unlockRelicId: 'phantom_pedal', primaryColor: '#1e1b4b', accentColor: '#a78bfa', shape: 'aura' },
  { id: 'crystal_frost', slot: 'frame', name: 'Crystal Frost Aura', unlockRelicId: 'crystal_pipe', primaryColor: '#0c4a6e', accentColor: '#7dd3fc', shape: 'spark' },
  { id: 'runic_halo', slot: 'frame', name: 'Runic Arcane Halo', unlockRelicId: 'runic_diapason', primaryColor: '#2e1065', accentColor: '#22d3ee', shape: 'halo' },
  { id: 'gilded_sunburst', slot: 'frame', name: 'Gilded Sunburst Aura', unlockRelicId: 'gilded_harp', primaryColor: '#451a03', accentColor: '#fde047', shape: 'halo' },
  { id: 'storm_lightning', slot: 'frame', name: 'Stormglass Lightning', unlockRelicId: 'storm_coil', primaryColor: '#0f172a', accentColor: '#38bdf8', shape: 'aura' },
  { id: 'chronos_halo', slot: 'frame', name: 'Chronos Golden Halo', unlockRelicId: 'chronos_escapement', primaryColor: '#1c1208', accentColor: '#ffe875', shape: 'halo' },
  // Feat Frames
  { id: 'nat20_crit_aura', slot: 'frame', name: 'Nat 20 Crit Aura', unlockRelicId: null, unlockFeatId: 'nat20', primaryColor: '#422006', accentColor: '#ffe875', shape: 'halo' },
  { id: 'tavern_flame_aura', slot: 'frame', name: 'Tavern Hearth Flame', unlockRelicId: null, unlockFeatId: 'streak3', primaryColor: '#431407', accentColor: '#fb923c', shape: 'glow' },
  { id: 'grace_shield_aura', slot: 'frame', name: 'Arcane Grace Shield', unlockRelicId: null, unlockFeatId: 'grace_note', primaryColor: '#082f49', accentColor: '#38bdf8', shape: 'ring' },
  { id: 'mythic_starburst', slot: 'frame', name: 'Mythic Starburst Halo', unlockRelicId: null, unlockFeatId: 'mythic_relic', primaryColor: '#2e1065', accentColor: '#fde047', shape: 'halo' },
] as const;

export function getCosmeticForRelic(relicId: string): BardCosmeticItem | undefined {
  return BARD_COSMETICS.find((item) => item.unlockRelicId === relicId);
}

export function getCosmeticForFeat(featId: RareFeat): BardCosmeticItem | undefined {
  return BARD_COSMETICS.find((item) => item.unlockFeatId === featId);
}

export function isCosmeticUnlocked(
  item: BardCosmeticItem,
  ownedRelics: readonly string[],
  ownedFeats: readonly RareFeat[] = []
): boolean {
  if (item.unlockRelicId !== null) {
    return ownedRelics.includes(item.unlockRelicId);
  }
  if (item.unlockFeatId) {
    return ownedFeats.includes(item.unlockFeatId);
  }
  return true;
}

export function sanitizeBardAvatarConfig(
  input: Partial<BardAvatarConfig> | null | undefined,
  ownedRelics: readonly string[],
  ownedFeats: readonly RareFeat[] = [],
  streak = 0
): BardAvatarConfig {
  const pickValid = (slot: BardCosmeticSlot, candidate?: string): string => {
    if (candidate) {
      const found = BARD_COSMETICS.find(
        (c) => c.slot === slot && c.id === candidate
      );
      if (found && isCosmeticUnlocked(found, ownedRelics, ownedFeats)) {
        return found.id;
      }
    }
    return DEFAULT_BARD_AVATAR[slot];
  };

  let portrait: BardPortraitId = 'busker';
  if (input?.portrait) {
    const foundPortrait = BARD_PORTRAITS.find((p) => p.id === input.portrait);
    if (
      foundPortrait &&
      isPortraitUnlocked(foundPortrait, ownedRelics, ownedFeats)
    ) {
      portrait = foundPortrait.id;
    }
  }

  let badgeId: string | null = null;
  if (typeof input?.badgeId === 'string') {
    if (
      input.badgeId.startsWith('relic:') &&
      ownedRelics.includes(input.badgeId.slice(6))
    ) {
      badgeId = input.badgeId;
    } else if (
      input.badgeId.startsWith('feat:') &&
      ownedFeats.includes(input.badgeId.slice(5) as RareFeat)
    ) {
      badgeId = input.badgeId;
    }
  }

  let diceSkin: DiceSkinId = 'tavern_gold';
  if (input?.diceSkin) {
    const foundDice = DICE_SKINS.find((d) => d.id === input.diceSkin);
    if (
      foundDice &&
      isDiceSkinUnlocked(foundDice, ownedRelics, ownedFeats, streak)
    ) {
      diceSkin = foundDice.id;
    }
  }

  let particleSkin: NoteParticleId = 'emerald_spark';
  if (input?.particleSkin) {
    const foundParticle = NOTE_PARTICLE_SKINS.find(
      (p) => p.id === input.particleSkin
    );
    if (
      foundParticle &&
      isParticleSkinUnlocked(foundParticle, ownedRelics, ownedFeats)
    ) {
      particleSkin = foundParticle.id;
    }
  }

  let epithet: BardEpithetId = 'none';
  if (input?.epithet) {
    const foundEp = BARD_EPITHETS.find((e) => e.id === input.epithet);
    if (foundEp && isEpithetUnlocked(foundEp, ownedRelics, ownedFeats)) {
      epithet = foundEp.id;
    }
  }

  const validSkin = BARD_SKIN_TONES.some((s) => s.id === input?.skinTone)
    ? (input!.skinTone as string)
    : DEFAULT_BARD_AVATAR.skinTone;

  return {
    portrait,
    badgeId,
    diceSkin,
    particleSkin,
    epithet,
    hat: pickValid('hat', input?.hat),
    cloak: pickValid('cloak', input?.cloak),
    prop: pickValid('prop', input?.prop),
    frame: pickValid('frame', input?.frame),
    skinTone: validSkin,
    useSnoovatar: Boolean(input?.useSnoovatar),
  };
}

export type AuraVfxTier = 'base' | 'rare' | 'mythic';

export function getAuraVfxTier(frameId: string): AuraVfxTier {
  const item = BARD_COSMETICS.find((c) => c.slot === 'frame' && c.id === frameId);
  if (!item) return 'base';
  if (
    item.unlockFeatId === 'mythic_relic' ||
    item.unlockFeatId === 'nat20' ||
    item.unlockRelicId === 'chronos_escapement' ||
    item.unlockRelicId === 'gilded_harp' ||
    item.unlockRelicId === 'runic_diapason'
  ) {
    return 'mythic';
  }
  if (item.shape === 'halo' || item.shape === 'aura' || item.shape === 'ring') {
    return 'rare';
  }
  return 'base';
}

export type KeyboardSkinTheme = {
  id: KeyboardVoiceId;
  label: string;
  swatchNatural: string;
  swatchSharp: string;
  trayClass: string;
  headerClass: string;
  whiteKeyClass: string;
  blackKeyClass: string;
};

/**
 * 13 distinct Instrument-Matched Keyboard Skins (1-to-1 with KeyboardVoiceId).
 * Keeps playback (gold), correct (emerald), and wrong (red) highlights crystal-clear.
 */
export const KEYBOARD_SKIN_THEMES: Record<KeyboardVoiceId, KeyboardSkinTheme> = {
  grand_piano: {
    id: 'grand_piano',
    label: 'Classic Ivory & Walnut',
    swatchNatural: '#fffdf7',
    swatchSharp: '#1c1208',
    trayClass: 'tavern-felt-bg border-[#754c28]/80',
    headerClass: 'text-[#d4af37]/80',
    whiteKeyClass:
      'bg-gradient-to-b from-[#fffdf7] to-[#ede2ca] border-[#bfa87e] text-[#3a2312] active:bg-[#d4af37]/30',
    blackKeyClass:
      'bg-gradient-to-b from-[#2b211a] to-[#120c07] border-[#4a3525] text-[#f5ead2]/75 active:bg-[#4a3525]',
  },
  tavern_lute: {
    id: 'tavern_lute',
    label: 'Carved Cedar & Brass Fretboard',
    swatchNatural: '#e6be8a',
    swatchSharp: '#5c2e12',
    trayClass:
      'bg-gradient-to-b from-[#2b170b] to-[#1a0d05] border-[#b47438]/90',
    headerClass: 'text-[#f5c77e]/90',
    whiteKeyClass:
      'bg-gradient-to-b from-[#f4d7ad] via-[#e2b87e] to-[#c99555] border-[#9a622a] text-[#2c1506] active:bg-[#d4af37]/40',
    blackKeyClass:
      'bg-gradient-to-b from-[#5e2f12] to-[#341808] border-[#c48b47] text-[#fde68a]/85 active:bg-[#7c3f18]',
  },
  honky_tonk: {
    id: 'honky_tonk',
    label: 'Saloon Cream & Mahogany',
    swatchNatural: '#f7e5b7',
    swatchSharp: '#4a151b',
    trayClass:
      'bg-gradient-to-b from-[#3a1219] to-[#21080c] border-[#a16207]/85',
    headerClass: 'text-amber-300/85',
    whiteKeyClass:
      'bg-gradient-to-b from-[#fdf3d0] to-[#e5ca87] border-[#b4832b] text-[#3a1d06] active:bg-amber-300/40',
    blackKeyClass:
      'bg-gradient-to-b from-[#541920] to-[#290b0f] border-[#a16207] text-amber-200/80 active:bg-[#6e212a]',
  },
  harpsichord: {
    id: 'harpsichord',
    label: 'Inverted Royal Ebony & Ivory',
    swatchNatural: '#1c1917',
    swatchSharp: '#fef3c7',
    trayClass:
      'bg-gradient-to-b from-[#450a0a] to-[#230404] border-[#d4af37]/90',
    headerClass: 'text-[#fde68a]/90',
    // Historically authentic inverted Baroque Harpsichord manual: ebony naturals, ivory sharps!
    whiteKeyClass:
      'bg-gradient-to-b from-[#292524] to-[#0c0a09] border-[#a16207]/80 text-[#fde68a] active:bg-[#44403c]',
    blackKeyClass:
      'bg-gradient-to-b from-[#fffbeb] to-[#e7d6a7] border-[#d4af37] text-[#291b06] active:bg-[#fde68a]',
  },
  music_box: {
    id: 'music_box',
    label: 'Clockwork Brass & Midnight Velvet',
    swatchNatural: '#eab308',
    swatchSharp: '#334155',
    trayClass:
      'bg-gradient-to-b from-[#0f172a] to-[#020617] border-[#d97706]/85',
    headerClass: 'text-amber-300/85',
    whiteKeyClass:
      'bg-gradient-to-b from-[#fef08a] via-[#eab308] to-[#b45309] border-[#78350f] text-[#1c1208] active:bg-amber-200',
    blackKeyClass:
      'bg-gradient-to-b from-[#334155] to-[#0f172a] border-[#f59e0b]/80 text-amber-200 active:bg-[#475569]',
  },
  electric_piano: {
    id: 'electric_piano',
    label: 'Velvet Indigo & Brushed Silver',
    swatchNatural: '#f1f5f9',
    swatchSharp: '#1e293b',
    trayClass:
      'bg-gradient-to-b from-[#1e1b4b] to-[#0f172a] border-[#818cf8]/60',
    headerClass: 'text-indigo-200/85',
    whiteKeyClass:
      'bg-gradient-to-b from-[#f8fafc] to-[#cbd5e1] border-[#94a3b8] text-[#0f172a] active:bg-indigo-200',
    blackKeyClass:
      'bg-gradient-to-b from-[#312e81] to-[#0f172a] border-[#818cf8]/75 text-indigo-200 active:bg-[#3730a3]',
  },
  clavinet: {
    id: 'clavinet',
    label: 'Retro Burnt-Amber Keybed',
    swatchNatural: '#fed7aa',
    swatchSharp: '#7c2d12',
    trayClass:
      'bg-gradient-to-b from-[#431407] to-[#1c0a03] border-[#ea580c]/80',
    headerClass: 'text-orange-300/85',
    whiteKeyClass:
      'bg-gradient-to-b from-[#fff7ed] to-[#fed7aa] border-[#ea580c]/75 text-[#431407] active:bg-orange-200',
    blackKeyClass:
      'bg-gradient-to-b from-[#9a3412] to-[#431407] border-[#fb923c]/80 text-orange-100 active:bg-[#c2410c]',
  },
  cathedral_organ: {
    id: 'cathedral_organ',
    label: 'Cathedral Alabaster & Stained Gold',
    swatchNatural: '#fafaf9',
    swatchSharp: '#450a0a',
    trayClass:
      'bg-gradient-to-b from-[#2e1065] via-[#1e1b4b] to-[#140b24] border-[#d4af37]/85',
    headerClass: 'text-[#fde68a]/90',
    whiteKeyClass:
      'bg-gradient-to-b from-[#ffffff] to-[#e7e5e4] border-[#b45309]/70 text-[#292524] active:bg-amber-100',
    blackKeyClass:
      'bg-gradient-to-b from-[#581c87] to-[#1e1b4b] border-[#d4af37]/80 text-[#fde68a] active:bg-[#6b21a8]',
  },
  accordion: {
    id: 'accordion',
    label: 'Pearlescent Ivory & Crimson Bellows',
    swatchNatural: '#fff1f2',
    swatchSharp: '#881337',
    trayClass:
      'bg-gradient-to-b from-[#4c0519] to-[#26020d] border-[#fda4af]/60',
    headerClass: 'text-rose-200/90',
    whiteKeyClass:
      'bg-gradient-to-b from-[#fff5f7] to-[#ffe4e6] border-[#be123c]/60 text-[#4c0519] active:bg-rose-200',
    blackKeyClass:
      'bg-gradient-to-b from-[#9f1239] to-[#4c0519] border-[#fda4af]/80 text-rose-100 active:bg-[#be123c]',
  },
  arcane_synth: {
    id: 'arcane_synth',
    label: 'Runic Obsidian & Cyan Arcana',
    swatchNatural: '#1e1b4b',
    swatchSharp: '#06b6d4',
    trayClass:
      'bg-gradient-to-b from-[#090d1f] to-[#040611] border-[#22d3ee]/70',
    headerClass: 'text-cyan-300/90',
    whiteKeyClass:
      'bg-gradient-to-b from-[#1e293b] to-[#0f172a] border-[#22d3ee]/65 text-cyan-100 active:bg-cyan-900',
    blackKeyClass:
      'bg-gradient-to-b from-[#4c1d95] to-[#1e1b4b] border-[#38bdf8] text-cyan-200 active:bg-[#6d28d9]',
  },
  bell_organ: {
    id: 'bell_organ',
    label: 'Hammered Bronze & Sunlit Gold',
    swatchNatural: '#fde68a',
    swatchSharp: '#713f12',
    trayClass:
      'bg-gradient-to-b from-[#422006] to-[#1c0f03] border-[#facc15]/85',
    headerClass: 'text-yellow-200/90',
    whiteKeyClass:
      'bg-gradient-to-b from-[#fef9c3] via-[#fde047] to-[#ca8a04] border-[#854d0e] text-[#291704] active:bg-yellow-200',
    blackKeyClass:
      'bg-gradient-to-b from-[#713f12] to-[#3b1f06] border-[#fde047]/80 text-yellow-100 active:bg-[#854d0e]',
  },
  celesta: {
    id: 'celesta',
    label: 'Starlight Frost & Silver Keys',
    swatchNatural: '#e0f2fe',
    swatchSharp: '#0369a1',
    trayClass:
      'bg-gradient-to-b from-[#0c4a6e] to-[#082f49] border-[#7dd3fc]/75',
    headerClass: 'text-sky-200/90',
    whiteKeyClass:
      'bg-gradient-to-b from-[#f0f9ff] to-[#bae6fd] border-[#38bdf8]/80 text-[#0c4a6e] active:bg-sky-200',
    blackKeyClass:
      'bg-gradient-to-b from-[#0369a1] to-[#082f49] border-[#bae6fd]/85 text-sky-100 active:bg-[#0284c7]',
  },
  astral_grand: {
    id: 'astral_grand',
    label: 'Astral Obsidian & Celestial Gold',
    swatchNatural: '#1e1b4b',
    swatchSharp: '#fde047',
    trayClass:
      'bg-gradient-to-b from-[#1e1b4b] via-[#0f172a] to-[#020617] border-[#ffe875]/90',
    headerClass: 'text-[#ffe875]',
    whiteKeyClass:
      'bg-gradient-to-b from-[#1e1b4b] to-[#09081c] border-[#ffe875]/75 text-[#ffe875] active:bg-[#312e81]',
    blackKeyClass:
      'bg-gradient-to-b from-[#fef08a] via-[#d4af37] to-[#854d0e] border-[#fffbeb] text-[#1c1208] active:bg-[#fde047]',
  },
};
