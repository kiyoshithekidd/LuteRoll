import type { KeyboardVoiceId, RareFeat } from './api';

export type BardCosmeticSlot = 'hair' | 'hat' | 'outfit' | 'prop' | 'frame';

export type BardVisualTier =
  | 'starter'
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'mythic';

export type BardFaceStyleId = 'bright' | 'lashes' | 'serene';

export type BardFaceStyleMeta = {
  id: BardFaceStyleId;
  name: string;
  subtitle: string;
};

export const BARD_FACE_STYLES: readonly BardFaceStyleMeta[] = [
  { id: 'bright', name: 'Bright-Eyed', subtitle: 'Cheerful tavern grin' },
  { id: 'lashes', name: 'Warm Lashes', subtitle: 'Expressive & lively' },
  { id: 'serene', name: 'Serene Minstrel', subtitle: 'Calm & composed' },
] as const;

export type BardSilhouetteId =
  // Hair
  | 'hair_bald'
  | 'hair_bowl'
  | 'hair_tail'
  | 'hair_curls'
  | 'hair_braid'
  | 'hair_swept'
  | 'hair_baroque'
  | 'hair_arcane'
  | 'hair_mythic_mane'
  // Hats
  | 'hat_none'
  | 'hat_beanie'
  | 'hat_hood'
  | 'hat_beret'
  | 'hat_feather'
  | 'hat_circlet'
  | 'hat_tricorne'
  | 'hat_dragon_helm'
  | 'hat_crown'
  // Outfits
  | 'outfit_burlap'
  | 'outfit_tavern'
  | 'outfit_coat'
  | 'outfit_doublet'
  | 'outfit_clockwork'
  | 'outfit_royal_cape'
  | 'outfit_phoenix_robes'
  | 'outfit_astral_regalia'
  // Props
  | 'prop_cracked_lute'
  | 'prop_spoon_whistle'
  | 'prop_scroll'
  | 'prop_fork_pipe'
  | 'prop_lute'
  | 'prop_horn_bell'
  | 'prop_baton'
  | 'prop_clockwork_lute'
  | 'prop_arcane_instrument'
  | 'prop_celestial_lute'
  // Frames / Auras (rendered procedurally in CSS + Canvas)
  | 'frame_plain'
  | 'frame_warm'
  | 'frame_felt'
  | 'frame_spark'
  | 'frame_glow'
  | 'frame_ring'
  | 'frame_aura'
  | 'frame_halo'
  | 'frame_supernova';

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

export type BardFamiliarId =
  | 'none'
  | 'songbird'
  | 'lute_fox'
  | 'tavern_cat'
  | 'scholar_owl'
  | 'ember_drake'
  | 'cosmic_sprite';

export type BardFamiliarMeta = {
  id: BardFamiliarId;
  name: string;
  unlockHint: string;
  unlockRelics?: number;
  unlockFeat?: RareFeat;
};

export const BARD_FAMILIARS: readonly BardFamiliarMeta[] = [
  { id: 'none', name: 'Solo Bard', unlockHint: 'Starter' },
  { id: 'songbird', name: 'Tavern Songbird', unlockHint: 'Starter', unlockRelics: 0 },
  { id: 'lute_fox', name: 'Lute Fox Kit', unlockHint: '3 Relics', unlockRelics: 3 },
  { id: 'tavern_cat', name: 'Ginger Tavern Cat', unlockHint: 'Feat: Encore Virtuoso', unlockFeat: 'grinder5' },
  { id: 'scholar_owl', name: 'Scroll Owl', unlockHint: '10 Relics', unlockRelics: 10 },
  { id: 'ember_drake', name: 'Ember Drake Hatchling', unlockHint: 'Feat: Underdog Encore (Nat 1)', unlockFeat: 'nat1_clear' },
  { id: 'cosmic_sprite', name: 'Astral Fox-Sprite', unlockHint: 'Feat: Mythic Resonance', unlockFeat: 'mythic_relic' },
] as const;

export function isFamiliarUnlocked(
  fam: BardFamiliarMeta,
  ownedRelics: readonly string[],
  ownedFeats: readonly RareFeat[]
): boolean {
  if (fam.id === 'none' || fam.unlockRelics === 0) return true;
  if (fam.unlockRelics !== undefined && ownedRelics.length < fam.unlockRelics) {
    return false;
  }
  if (fam.unlockFeat && !ownedFeats.includes(fam.unlockFeat)) return false;
  return true;
}

export type BardAvatarConfig = {
  hair: string;
  hat: string;
  outfit: string;
  prop: string;
  frame: string;
  skinTone: string;
  faceStyle: BardFaceStyleId;
  familiar?: BardFamiliarId;
  badgeId?: string | null;
  diceSkin?: DiceSkinId;
  particleSkin?: NoteParticleId;
  epithet?: BardEpithetId;
  useSnoovatar?: boolean;
  /** Legacy fields accepted during sanitization for smooth profile migration */
  cloak?: string;
  portrait?: string;
};

export type BardCosmeticItem = {
  id: string;
  slot: BardCosmeticSlot;
  name: string;
  visualTier: BardVisualTier;
  silhouetteId: BardSilhouetteId;
  /** null = not gated by relic; otherwise exact relic ID from RELIC_CATALOG */
  unlockRelicId: string | null;
  /** optional exact feat ID from FEAT_CATALOG */
  unlockFeatId?: RareFeat | null;
  primaryColor: string;
  accentColor: string;
  /** Optional CSS filter applied to the modular layer for rich dye/material variety */
  tintFilter?: string;
};

export type SkinToneMeta = {
  id: string;
  name: string;
  fill: string;
  shade: string;
  /** CSS filter applied to the neutral warm-peach base mannequin */
  tintFilter: string;
};

export const BARD_SKIN_TONES: readonly SkinToneMeta[] = [
  { id: 'porcelain', name: 'Porcelain', fill: '#f6d5be', shade: '#deb092', tintFilter: 'brightness(1.1) saturate(0.82)' },
  { id: 'peach', name: 'Warm Peach', fill: '#e8b896', shade: '#c9906b', tintFilter: 'none' },
  { id: 'tan', name: 'Golden Tan', fill: '#cf966b', shade: '#ad7249', tintFilter: 'brightness(0.88) saturate(1.12) sepia(0.12)' },
  { id: 'amber', name: 'Rich Amber', fill: '#9f6741', shade: '#7d4c2c', tintFilter: 'brightness(0.7) saturate(1.18) sepia(0.22)' },
  { id: 'umber', name: 'Deep Umber', fill: '#6b4027', shade: '#4d2b18', tintFilter: 'brightness(0.52) saturate(1.08) sepia(0.26) contrast(1.06)' },
] as const;

export const DEFAULT_BARD_AVATAR: BardAvatarConfig = {
  hair: 'bedhead_crop',
  hat: 'bareheaded',
  outfit: 'burlap_tunic',
  prop: 'cracked_lute',
  frame: 'plain_wood',
  skinTone: 'peach',
  faceStyle: 'bright',
  familiar: 'none',
  badgeId: null,
  diceSkin: 'tavern_gold',
  particleSkin: 'emerald_spark',
  epithet: 'none',
  useSnoovatar: false,
};

/**
 * 130 Modular Build-a-Bard Wearables (26 per slot x 5 slots):
 * - 20 Humble Day-1 Starters (4 per slot)
 * - 85 Relic-Unlocked Wearables (17 per slot — strict 1-to-1 with RELIC_CATALOG)
 * - 25 Feat-Unlocked Wearables (5 per slot — strict 1-to-1 with FEAT_CATALOG)
 */
export const BARD_COSMETICS: readonly BardCosmeticItem[] = [
  // =========================================================================
  // 1. HAIR (4 Starters + 17 Relics + 5 Feats = 26)
  // =========================================================================
  // Starters (Humble / Boring)
  { id: 'bedhead_crop', slot: 'hair', name: 'Scruffy Bedhead Crop', visualTier: 'starter', silhouetteId: 'hair_bowl', unlockRelicId: null, primaryColor: '#5c4028', accentColor: '#8c6947', tintFilter: 'saturate(0.85) brightness(0.95)' },
  { id: 'plain_bowl', slot: 'hair', name: 'Plain Bowl Cut', visualTier: 'starter', silhouetteId: 'hair_bowl', unlockRelicId: null, primaryColor: '#3f2e21', accentColor: '#6b5340', tintFilter: 'brightness(0.75) saturate(0.7)' },
  { id: 'string_tail', slot: 'hair', name: 'String-Tied Low Tail', visualTier: 'starter', silhouetteId: 'hair_tail', unlockRelicId: null, primaryColor: '#6e4e32', accentColor: '#a38262', tintFilter: 'saturate(0.8)' },
  { id: 'shaved_bald', slot: 'hair', name: 'Clean Shaved', visualTier: 'starter', silhouetteId: 'hair_bald', unlockRelicId: null, primaryColor: '#c9906b', accentColor: '#e8b896' },
  // Common Hair Relics (7)
  { id: 'boxwood_bob', slot: 'hair', name: 'Hearthside Chestnut Bob', visualTier: 'common', silhouetteId: 'hair_curls', unlockRelicId: 'wooden_comb', primaryColor: '#7a4522', accentColor: '#b87442' },
  { id: 'hemp_ponytail', slot: 'hair', name: 'Lute-String Ponytail', visualTier: 'common', silhouetteId: 'hair_tail', unlockRelicId: 'hemp_tie', primaryColor: '#4a301d', accentColor: '#d4af37', tintFilter: 'hue-rotate(-8deg) brightness(0.9)' },
  { id: 'copper_curls', slot: 'hair', name: 'Copper-Pinned Curls', visualTier: 'common', silhouetteId: 'hair_curls', unlockRelicId: 'copper_pin', primaryColor: '#a84a1e', accentColor: '#f59e0b', tintFilter: 'hue-rotate(-14deg) saturate(1.25)' },
  { id: 'tonic_waves', slot: 'hair', name: 'Slicked Tavern Waves', visualTier: 'common', silhouetteId: 'hair_swept', unlockRelicId: 'barber_tonic', primaryColor: '#2e221b', accentColor: '#8c7260', tintFilter: 'brightness(0.72) saturate(0.75)' },
  { id: 'bone_bun', slot: 'hair', name: 'Bone-Clasped Bun', visualTier: 'common', silhouetteId: 'hair_tail', unlockRelicId: 'bone_clasp', primaryColor: '#8c6239', accentColor: '#f3e4c3', tintFilter: 'brightness(1.08) saturate(0.9)' },
  { id: 'meadow_locks', slot: 'hair', name: 'Meadow-Sprig Curls', visualTier: 'common', silhouetteId: 'hair_curls', unlockRelicId: 'meadow_sprig', primaryColor: '#b07b38', accentColor: '#84cc16', tintFilter: 'hue-rotate(12deg) brightness(1.12)' },
  { id: 'cedar_crop', slot: 'hair', name: 'Brushed Cedar Crop', visualTier: 'common', silhouetteId: 'hair_bowl', unlockRelicId: 'cedar_brush', primaryColor: '#783c18', accentColor: '#d97706', tintFilter: 'hue-rotate(-10deg) saturate(1.2)' },
  // Uncommon Hair Relics (5)
  { id: 'velvet_braid', slot: 'hair', name: 'Crimson-Ribbon Braid', visualTier: 'uncommon', silhouetteId: 'hair_braid', unlockRelicId: 'velvet_ribbon', primaryColor: '#7c2d12', accentColor: '#dc2626', tintFilter: 'hue-rotate(-18deg) saturate(1.2)' },
  { id: 'silver_leaf_swept', slot: 'hair', name: 'Silver-Leaf Swept Locks', visualTier: 'uncommon', silhouetteId: 'hair_swept', unlockRelicId: 'silver_fork', primaryColor: '#cbd5e1', accentColor: '#f8fafc', tintFilter: 'saturate(0.15) brightness(1.38)' },
  { id: 'jade_braid', slot: 'hair', name: 'Jade-Beaded Side Braid', visualTier: 'uncommon', silhouetteId: 'hair_braid', unlockRelicId: 'jade_bead', primaryColor: '#1f2937', accentColor: '#34d399', tintFilter: 'brightness(0.68) hue-rotate(110deg)' },
  { id: 'auburn_balladeer_braid', slot: 'hair', name: 'Auburn Balladeer Braid', visualTier: 'uncommon', silhouetteId: 'hair_braid', unlockRelicId: 'auburn_henna', primaryColor: '#b45309', accentColor: '#fbbf24' },
  { id: 'gilded_ring_locks', slot: 'hair', name: 'Gilded-Ring Swept Locks', visualTier: 'uncommon', silhouetteId: 'hair_swept', unlockRelicId: 'braid_ring', primaryColor: '#ca8a04', accentColor: '#ffe875', tintFilter: 'hue-rotate(16deg) saturate(1.25) brightness(1.15)' },
  // Rare Hair Relics (3)
  { id: 'baroque_curls', slot: 'hair', name: 'Baroque Powdered Curls', visualTier: 'rare', silhouetteId: 'hair_baroque', unlockRelicId: 'powder_puff', primaryColor: '#f1f5f9', accentColor: '#fde047' },
  { id: 'arcane_braid', slot: 'hair', name: 'Arcane Cyan-Streaked Hair', visualTier: 'rare', silhouetteId: 'hair_arcane', unlockRelicId: 'arcana_dye', primaryColor: '#1e1b4b', accentColor: '#22d3ee' },
  { id: 'tempest_plume_hair', slot: 'hair', name: 'Tempest Roc Flowing Locks', visualTier: 'rare', silhouetteId: 'hair_baroque', unlockRelicId: 'storm_feather', primaryColor: '#0284c7', accentColor: '#e0f2fe', tintFilter: 'hue-rotate(175deg) saturate(1.35)' },
  // Mythic Hair Relics (2 — Challenge Earned)
  { id: 'phoenix_mane', slot: 'hair', name: 'Living Phoenix Fire Mane', visualTier: 'mythic', silhouetteId: 'hair_mythic_mane', unlockRelicId: 'phoenix_plume', primaryColor: '#ea580c', accentColor: '#fef08a' },
  { id: 'nebula_tresses', slot: 'hair', name: 'Astral Nebula Tresses', visualTier: 'mythic', silhouetteId: 'hair_mythic_mane', unlockRelicId: 'nebula_comb', primaryColor: '#6d28d9', accentColor: '#38bdf8', tintFilter: 'hue-rotate(225deg) saturate(1.4) brightness(1.08)' },
  // Feat Hair (5)
  { id: 'guildmaster_braids', slot: 'hair', name: 'Guildmaster Messy Braids', visualTier: 'common', silhouetteId: 'hair_braid', unlockRelicId: null, unlockFeatId: 'bounty_hunter', primaryColor: '#6b4027', accentColor: '#d4af37', tintFilter: 'saturate(0.95) brightness(0.92)' },
  { id: 'silver_minstrel_locks', slot: 'hair', name: "Minstrel's Silver-Tipped Locks", visualTier: 'uncommon', silhouetteId: 'hair_swept', unlockRelicId: null, unlockFeatId: 'level10', primaryColor: '#64748b', accentColor: '#e2e8f0', tintFilter: 'saturate(0.35) brightness(1.2)' },
  { id: 'virtuoso_mane', slot: 'hair', name: 'Windswept Virtuoso Mane', visualTier: 'rare', silhouetteId: 'hair_baroque', unlockRelicId: null, unlockFeatId: 'encore_champ', primaryColor: '#92400e', accentColor: '#ffe875', tintFilter: 'hue-rotate(-12deg) saturate(1.3)' },
  { id: 'tempest_lightning_mane', slot: 'hair', name: 'Tempest Lightning Mane', visualTier: 'mythic', silhouetteId: 'hair_arcane', unlockRelicId: null, unlockFeatId: 'flawless_hard', primaryColor: '#0ea5e9', accentColor: '#fef08a', tintFilter: 'hue-rotate(190deg) saturate(1.5) brightness(1.15)' },
  { id: 'champion_crest_mane', slot: 'hair', name: "Champion's Blazing Crest-Mane", visualTier: 'mythic', silhouetteId: 'hair_mythic_mane', unlockRelicId: null, unlockFeatId: 'gauntlet_champion', primaryColor: '#dc2626', accentColor: '#ffe875', tintFilter: 'hue-rotate(-25deg) saturate(1.45) brightness(1.05)' },

  // =========================================================================
  // 2. HATS (4 Starters + 17 Relics + 5 Feats = 26)
  // =========================================================================
  // Starters (Humble / Boring)
  { id: 'bareheaded', slot: 'hat', name: 'Bareheaded (None)', visualTier: 'starter', silhouetteId: 'hat_none', unlockRelicId: null, primaryColor: '#3b2414', accentColor: '#d4af37' },
  { id: 'wool_beanie', slot: 'hat', name: 'Slouchy Wool Beanie', visualTier: 'starter', silhouetteId: 'hat_beanie', unlockRelicId: null, primaryColor: '#6b5b4b', accentColor: '#9c8b78', tintFilter: 'saturate(0.6) brightness(0.95)' },
  { id: 'rag_bandana', slot: 'hat', name: 'Patched Rag Bandana', visualTier: 'starter', silhouetteId: 'hat_beanie', unlockRelicId: null, primaryColor: '#5c3c28', accentColor: '#a68966', tintFilter: 'hue-rotate(-12deg) saturate(0.75)' },
  { id: 'tavern_hood', slot: 'hat', name: 'Faded Travel Hood', visualTier: 'starter', silhouetteId: 'hat_hood', unlockRelicId: null, primaryColor: '#4e392a', accentColor: '#8c725a', tintFilter: 'saturate(0.65) brightness(0.88)' },
  // Common Hat Relics (6)
  { id: 'linen_hood', slot: 'hat', name: 'Linen Bard Hood', visualTier: 'common', silhouetteId: 'hat_hood', unlockRelicId: 'linen_cover', primaryColor: '#d8c9aa', accentColor: '#8c6239', tintFilter: 'brightness(1.22) saturate(0.75)' },
  { id: 'wax_beret', slot: 'hat', name: 'Crimson Wax Beret', visualTier: 'common', silhouetteId: 'hat_beret', unlockRelicId: 'wax_seal', primaryColor: '#8f1d24', accentColor: '#ffe875' },
  { id: 'tavern_cap', slot: 'hat', name: 'Tavern Regular Cap', visualTier: 'common', silhouetteId: 'hat_beanie', unlockRelicId: 'tavern_mug', primaryColor: '#7a4b21', accentColor: '#f5d78e', tintFilter: 'saturate(1.15) brightness(1.05)' },
  { id: 'busker_straw', slot: 'hat', name: 'Woven Busker Straw Hat', visualTier: 'common', silhouetteId: 'hat_hood', unlockRelicId: 'straw_brim', primaryColor: '#d4a657', accentColor: '#6e4726', tintFilter: 'hue-rotate(18deg) brightness(1.18)' },
  { id: 'pinned_wool_cap', slot: 'hat', name: 'Pinned Busker Cap', visualTier: 'common', silhouetteId: 'hat_beret', unlockRelicId: 'wool_pin', primaryColor: '#1f5c3e', accentColor: '#d4af37', tintFilter: 'hue-rotate(115deg) saturate(0.95)' },
  { id: 'felt_hatband_cap', slot: 'hat', name: 'Emerald Felt Beret', visualTier: 'common', silhouetteId: 'hat_beret', unlockRelicId: 'felt_band', primaryColor: '#14532d', accentColor: '#fde68a', tintFilter: 'hue-rotate(128deg) saturate(1.15)' },
  // Uncommon Hat Relics (5)
  { id: 'silver_circlet', slot: 'hat', name: 'Silver Octave Circlet', visualTier: 'uncommon', silhouetteId: 'hat_circlet', unlockRelicId: 'silver_capo', primaryColor: '#cbd5e1', accentColor: '#38bdf8' },
  { id: 'velvet_cap', slot: 'hat', name: 'Velvet Troubadour Cap', visualTier: 'uncommon', silhouetteId: 'hat_feather', unlockRelicId: 'velvet_bench', primaryColor: '#581c87', accentColor: '#f59e0b', tintFilter: 'hue-rotate(245deg) saturate(1.25)' },
  { id: 'concertina_cap', slot: 'hat', name: 'Folk Concertina Cap', visualTier: 'uncommon', silhouetteId: 'hat_beret', unlockRelicId: 'bellows_strap', primaryColor: '#991b1b', accentColor: '#fef3c7', tintFilter: 'saturate(1.3) brightness(1.08)' },
  { id: 'chapel_crown', slot: 'hat', name: 'Chapel Rose Circlet', visualTier: 'uncommon', silhouetteId: 'hat_circlet', unlockRelicId: 'stained_glass', primaryColor: '#1d4ed8', accentColor: '#fbbf24', tintFilter: 'hue-rotate(190deg) saturate(1.3)' },
  { id: 'feathered_cap', slot: 'hat', name: 'Pheasant-Plume Busker Cap', visualTier: 'uncommon', silhouetteId: 'hat_feather', unlockRelicId: 'plume_brooch', primaryColor: '#1f5c3e', accentColor: '#ffe875' },
  // Rare Hat Relics (4)
  { id: 'moonstone_tiara', slot: 'hat', name: 'Moonstone Tiara', visualTier: 'rare', silhouetteId: 'hat_circlet', unlockRelicId: 'moon_ring', primaryColor: '#e0f2fe', accentColor: '#38bdf8', tintFilter: 'hue-rotate(175deg) brightness(1.18)' },
  { id: 'dragon_helm', slot: 'hat', name: 'Dragoncrest Winged Helm', visualTier: 'rare', silhouetteId: 'hat_dragon_helm', unlockRelicId: 'dragon_hammer', primaryColor: '#7f1d1d', accentColor: '#fbbf24' },
  { id: 'astrolabe_hat', slot: 'hat', name: 'Astrolabe Tricorne', visualTier: 'rare', silhouetteId: 'hat_tricorne', unlockRelicId: 'star_compass', primaryColor: '#1e293b', accentColor: '#facc15' },
  { id: 'opal_harmonic_tiara', slot: 'hat', name: 'Opal Harmonic Diadem', visualTier: 'rare', silhouetteId: 'hat_circlet', unlockRelicId: 'opal_circlet', primaryColor: '#c084fc', accentColor: '#67e8f9', tintFilter: 'hue-rotate(255deg) saturate(1.4) brightness(1.1)' },
  // Mythic Hat Relics (2 — Challenge Earned)
  { id: 'crown_of_keys', slot: 'hat', name: 'Crown of the Keys', visualTier: 'mythic', silhouetteId: 'hat_crown', unlockRelicId: 'grand_crown', primaryColor: '#f59e0b', accentColor: '#fffbeb' },
  { id: 'sovereign_diadem', slot: 'hat', name: 'Sovereign Astral Diadem', visualTier: 'mythic', silhouetteId: 'hat_crown', unlockRelicId: 'sovereign_octave', primaryColor: '#fde047', accentColor: '#a855f7', tintFilter: 'hue-rotate(245deg) saturate(1.45) brightness(1.12)' },
  // Feat Hats (5)
  { id: 'debut_hat', slot: 'hat', name: 'Debut Busker Cap', visualTier: 'common', silhouetteId: 'hat_feather', unlockRelicId: null, unlockFeatId: 'first_tune', primaryColor: '#92400e', accentColor: '#fde68a', tintFilter: 'hue-rotate(-30deg) saturate(1.1)' },
  { id: 'duelist_tricorne', slot: 'hat', name: "Duelist's Plumed Tricorne", visualTier: 'rare', silhouetteId: 'hat_tricorne', unlockRelicId: null, unlockFeatId: 'gauntlet_victor', primaryColor: '#7f1d1d', accentColor: '#ffe875', tintFilter: 'hue-rotate(-38deg) saturate(1.35)' },
  { id: 'golden_laurel', slot: 'hat', name: 'Golden Ear Laurel', visualTier: 'rare', silhouetteId: 'hat_circlet', unlockRelicId: null, unlockFeatId: 'flawless', primaryColor: '#facc15', accentColor: '#fffbeb', tintFilter: 'hue-rotate(28deg) saturate(1.45) brightness(1.12)' },
  { id: 'brutal_helm', slot: 'hat', name: 'Brutal Underdog Horned Helm', visualTier: 'mythic', silhouetteId: 'hat_dragon_helm', unlockRelicId: null, unlockFeatId: 'nat1_clear', primaryColor: '#450a0a', accentColor: '#ef4444', tintFilter: 'brightness(0.82) saturate(1.55) contrast(1.12)' },
  { id: 'immortal_crown', slot: 'hat', name: 'Immortal Sun Crown', visualTier: 'mythic', silhouetteId: 'hat_crown', unlockRelicId: null, unlockFeatId: 'streak30', primaryColor: '#fde047', accentColor: '#f97316', tintFilter: 'hue-rotate(-12deg) saturate(1.5) brightness(1.12)' },

  // =========================================================================
  // 3. OUTFITS (4 Starters + 17 Relics + 5 Feats = 26)
  // =========================================================================
  // Starters (Humble / Boring)
  { id: 'burlap_tunic', slot: 'outfit', name: 'Patched Burlap Tunic', visualTier: 'starter', silhouetteId: 'outfit_burlap', unlockRelicId: null, primaryColor: '#7c664c', accentColor: '#a68f72', tintFilter: 'saturate(0.7)' },
  { id: 'homespun_shirt', slot: 'outfit', name: 'Faded Homespun Shirt', visualTier: 'starter', silhouetteId: 'outfit_burlap', unlockRelicId: null, primaryColor: '#8f8778', accentColor: '#bfb6a6', tintFilter: 'saturate(0.35) brightness(1.12)' },
  { id: 'tavern_brown', slot: 'outfit', name: 'Worn Canvas Vest', visualTier: 'starter', silhouetteId: 'outfit_burlap', unlockRelicId: null, primaryColor: '#523c2a', accentColor: '#8c6f54', tintFilter: 'brightness(0.85) saturate(0.8)' },
  { id: 'forest_green', slot: 'outfit', name: 'Faded Moss Poncho', visualTier: 'starter', silhouetteId: 'outfit_tavern', unlockRelicId: null, primaryColor: '#364d3e', accentColor: '#7b947f', tintFilter: 'saturate(0.6) brightness(0.9)' },
  // Common Outfit Relics (6)
  { id: 'felt_cloak', slot: 'outfit', name: 'Emerald Felt Cloak', visualTier: 'common', silhouetteId: 'outfit_tavern', unlockRelicId: 'felt_damper', primaryColor: '#0f5132', accentColor: '#ffe875' },
  { id: 'oakleaf_mantle', slot: 'outfit', name: 'Oakleaf Mantle', visualTier: 'common', silhouetteId: 'outfit_tavern', unlockRelicId: 'oak_keyslip', primaryColor: '#4d3319', accentColor: '#84cc16', tintFilter: 'hue-rotate(-45deg) saturate(1.1)' },
  { id: 'songsmith_coat', slot: 'outfit', name: 'Leather Songsmith Coat', visualTier: 'common', silhouetteId: 'outfit_coat', unlockRelicId: 'leather_folio', primaryColor: '#3f2514', accentColor: '#f59e0b' },
  { id: 'barkeeper_apron', slot: 'outfit', name: 'Tavern Linen Apron', visualTier: 'common', silhouetteId: 'outfit_tavern', unlockRelicId: 'tavern_apron', primaryColor: '#92400e', accentColor: '#fef3c7', tintFilter: 'hue-rotate(-65deg) brightness(1.1)' },
  { id: 'hemp_sash_tunic', slot: 'outfit', name: 'Sash-Belted Busker Tunic', visualTier: 'common', silhouetteId: 'outfit_burlap', unlockRelicId: 'hemp_sash', primaryColor: '#1e3a5f', accentColor: '#d4af37', tintFilter: 'hue-rotate(175deg) saturate(1.15)' },
  { id: 'hearthside_shawl', slot: 'outfit', name: 'Hearthside Wool Shawl', visualTier: 'common', silhouetteId: 'outfit_tavern', unlockRelicId: 'patched_shawl', primaryColor: '#7c2d12', accentColor: '#f5d78e', tintFilter: 'hue-rotate(-85deg) saturate(1.2)' },
  // Uncommon Outfit Relics (5)
  { id: 'ebony_coat', slot: 'outfit', name: 'Ebony Formal Coat', visualTier: 'uncommon', silhouetteId: 'outfit_coat', unlockRelicId: 'ebony_sharp', primaryColor: '#18181b', accentColor: '#f8fafc', tintFilter: 'saturate(0.2) brightness(0.75) contrast(1.12)' },
  { id: 'minstrel_tabard', slot: 'outfit', name: 'Minstrel Tabard', visualTier: 'uncommon', silhouetteId: 'outfit_doublet', unlockRelicId: 'tavern_book', primaryColor: '#7c2d12', accentColor: '#fde68a' },
  { id: 'brass_tunic', slot: 'outfit', name: 'Brass-Trimmed Coat', visualTier: 'uncommon', silhouetteId: 'outfit_coat', unlockRelicId: 'reed_plate', primaryColor: '#78350f', accentColor: '#fbbf24', tintFilter: 'hue-rotate(10deg) saturate(1.25) brightness(1.08)' },
  { id: 'velvet_cape', slot: 'outfit', name: 'Velvet Key-Roll Doublet', visualTier: 'uncommon', silhouetteId: 'outfit_doublet', unlockRelicId: 'velvet_case', primaryColor: '#4c1d95', accentColor: '#e9d5ff', tintFilter: 'hue-rotate(245deg) saturate(1.25)' },
  { id: 'brocade_doublet', slot: 'outfit', name: 'Gilded Brocade Doublet', visualTier: 'uncommon', silhouetteId: 'outfit_doublet', unlockRelicId: 'brocade_cuff', primaryColor: '#065f46', accentColor: '#ffe875', tintFilter: 'hue-rotate(135deg) saturate(1.2)' },
  // Rare Outfit Relics (4)
  { id: 'amber_mantle', slot: 'outfit', name: 'Amber Resonance Mantle', visualTier: 'rare', silhouetteId: 'outfit_royal_cape', unlockRelicId: 'amber_box', primaryColor: '#b45309', accentColor: '#fef08a', tintFilter: 'hue-rotate(-140deg) saturate(1.35)' },
  { id: 'sapphire_cloak', slot: 'outfit', name: 'Sapphire Silk Cloak', visualTier: 'rare', silhouetteId: 'outfit_royal_cape', unlockRelicId: 'sapphire_key', primaryColor: '#1e3a8a', accentColor: '#7dd3fc' },
  { id: 'phoenix_cloak', slot: 'outfit', name: 'Phoenix Ember Cloak', visualTier: 'rare', silhouetteId: 'outfit_phoenix_robes', unlockRelicId: 'phoenix_wire', primaryColor: '#991b1b', accentColor: '#fb923c' },
  { id: 'clockwork_gear_coat', slot: 'outfit', name: 'Clockwork Brass Gear-Coat', visualTier: 'rare', silhouetteId: 'outfit_clockwork', unlockRelicId: 'clockwork_pauldrons', primaryColor: '#78350f', accentColor: '#38bdf8' },
  // Mythic Outfit Relics (2 — Challenge Earned)
  { id: 'astral_cloak', slot: 'outfit', name: 'Astral Starlight Regalia', visualTier: 'mythic', silhouetteId: 'outfit_astral_regalia', unlockRelicId: 'astral_board', primaryColor: '#312e81', accentColor: '#fde047' },
  { id: 'conservatory_robes', slot: 'outfit', name: 'Conservatory Royal Regalia', visualTier: 'mythic', silhouetteId: 'outfit_phoenix_robes', unlockRelicId: 'conservatory_heart', primaryColor: '#7f1d1d', accentColor: '#ffe875', tintFilter: 'hue-rotate(-12deg) saturate(1.4) brightness(1.1)' },
  // Feat Outfits (5)
  { id: 'apprentice_guild_tunic', slot: 'outfit', name: 'Apprentice Guild Tunic', visualTier: 'common', silhouetteId: 'outfit_coat', unlockRelicId: null, unlockFeatId: 'level5', primaryColor: '#1e3a5f', accentColor: '#fbbf24', tintFilter: 'hue-rotate(175deg) saturate(1.1)' },
  { id: 'legend_ward_mantle', slot: 'outfit', name: "Legend's Ward Mantle", visualTier: 'uncommon', silhouetteId: 'outfit_royal_cape', unlockRelicId: null, unlockFeatId: 'streak7', primaryColor: '#0c4a6e', accentColor: '#38bdf8', tintFilter: 'hue-rotate(-12deg) saturate(1.15)' },
  { id: 'curator_mantle', slot: 'outfit', name: "Curator's Velvet Mantle", visualTier: 'uncommon', silhouetteId: 'outfit_doublet', unlockRelicId: null, unlockFeatId: 'relic15', primaryColor: '#581c87', accentColor: '#fde047', tintFilter: 'hue-rotate(265deg) saturate(1.3)' },
  { id: 'virtuoso_cape', slot: 'outfit', name: 'Grand Virtuoso Cape', visualTier: 'rare', silhouetteId: 'outfit_royal_cape', unlockRelicId: null, unlockFeatId: 'level25', primaryColor: '#7c2d12', accentColor: '#fef08a', tintFilter: 'hue-rotate(-175deg) saturate(1.35)' },
  { id: 'starforged_regalia', slot: 'outfit', name: 'Starforged Fortnight Regalia', visualTier: 'mythic', silhouetteId: 'outfit_astral_regalia', unlockRelicId: null, unlockFeatId: 'streak14', primaryColor: '#1e1b4b', accentColor: '#67e8f9', tintFilter: 'hue-rotate(-30deg) saturate(1.45) brightness(1.12)' },

  // =========================================================================
  // 4. PROPS / INSTRUMENTS (4 Starters + 17 Relics + 5 Feats = 26)
  // =========================================================================
  // Starters (Humble / Boring)
  { id: 'cracked_lute', slot: 'prop', name: 'Cracked Practice Lute', visualTier: 'starter', silhouetteId: 'prop_cracked_lute', unlockRelicId: null, primaryColor: '#8c6239', accentColor: '#c2a378', tintFilter: 'saturate(0.75)' },
  { id: 'wooden_spoon', slot: 'prop', name: 'Wooden Tavern Spoon', visualTier: 'starter', silhouetteId: 'prop_spoon_whistle', unlockRelicId: null, primaryColor: '#785232', accentColor: '#b38b67', tintFilter: 'saturate(0.7)' },
  { id: 'reed_whistle', slot: 'prop', name: 'Whittled Reed Whistle', visualTier: 'starter', silhouetteId: 'prop_spoon_whistle', unlockRelicId: null, primaryColor: '#8c7a4b', accentColor: '#d4c394', tintFilter: 'hue-rotate(22deg) brightness(1.08)' },
  { id: 'quill_scroll', slot: 'prop', name: 'Crumpled Chord Scrap', visualTier: 'starter', silhouetteId: 'prop_scroll', unlockRelicId: null, primaryColor: '#d6c5a3', accentColor: '#8c7250', tintFilter: 'saturate(0.65) brightness(0.92)' },
  // Common Prop Relics (6)
  { id: 'brass_fork_prop', slot: 'prop', name: 'Brass Tuning Fork', visualTier: 'common', silhouetteId: 'prop_fork_pipe', unlockRelicId: 'brass_fork', primaryColor: '#d4af37', accentColor: '#fef08a' },
  { id: 'maple_metro_prop', slot: 'prop', name: 'Maple Metronome', visualTier: 'common', silhouetteId: 'prop_fork_pipe', unlockRelicId: 'maple_metro', primaryColor: '#9a5b25', accentColor: '#ffe875', tintFilter: 'hue-rotate(-18deg) saturate(1.15)' },
  { id: 'pitch_pipe_prop', slot: 'prop', name: 'Tin Pitch Pipe', visualTier: 'common', silhouetteId: 'prop_fork_pipe', unlockRelicId: 'pitch_pipe', primaryColor: '#94a3b8', accentColor: '#e2e8f0', tintFilter: 'saturate(0.15) brightness(1.18)' },
  { id: 'staff_scroll_prop', slot: 'prop', name: 'Parchment Staff Scroll', visualTier: 'common', silhouetteId: 'prop_scroll', unlockRelicId: 'staff_scroll', primaryColor: '#fde68a', accentColor: '#92400e' },
  { id: 'composer_quill', slot: 'prop', name: 'Golden Composer Quill', visualTier: 'common', silhouetteId: 'prop_scroll', unlockRelicId: 'quill_nib', primaryColor: '#facc15', accentColor: '#fffbeb', tintFilter: 'saturate(1.35) brightness(1.1)' },
  { id: 'copper_lute', slot: 'prop', name: 'Copper-Pegged Lute', visualTier: 'common', silhouetteId: 'prop_lute', unlockRelicId: 'copper_peg', primaryColor: '#c2410c', accentColor: '#fdba74' },
  // Uncommon Prop Relics (5)
  { id: 'oak_stand_prop', slot: 'prop', name: 'Oak Music Folio', visualTier: 'uncommon', silhouetteId: 'prop_scroll', unlockRelicId: 'oak_stand', primaryColor: '#78350f', accentColor: '#fef3c7', tintFilter: 'hue-rotate(-12deg) contrast(1.08)' },
  { id: 'bronze_chime_prop', slot: 'prop', name: 'Bronze Bell Chime', visualTier: 'uncommon', silhouetteId: 'prop_horn_bell', unlockRelicId: 'bronze_chime', primaryColor: '#b45309', accentColor: '#fde68a' },
  { id: 'silver_baton_prop', slot: 'prop', name: 'Silver Conductor Baton', visualTier: 'uncommon', silhouetteId: 'prop_baton', unlockRelicId: 'silver_baton', primaryColor: '#e2e8f0', accentColor: '#38bdf8' },
  { id: 'echo_horn_prop', slot: 'prop', name: 'Brass Echo Horn', visualTier: 'uncommon', silhouetteId: 'prop_horn_bell', unlockRelicId: 'echo_horn', primaryColor: '#eab308', accentColor: '#fef9c3', tintFilter: 'hue-rotate(14deg) brightness(1.12)' },
  { id: 'cedar_lute_prop', slot: 'prop', name: 'Polished Cedar Lute', visualTier: 'uncommon', silhouetteId: 'prop_lute', unlockRelicId: 'cedar_pick', primaryColor: '#a16207', accentColor: '#ffe875', tintFilter: 'hue-rotate(10deg) saturate(1.2) brightness(1.08)' },
  // Rare Prop Relics (4)
  { id: 'clock_arp_prop', slot: 'prop', name: 'Clockwork Arpeggiator Lute', visualTier: 'rare', silhouetteId: 'prop_clockwork_lute', unlockRelicId: 'clock_arp', primaryColor: '#d97706', accentColor: '#38bdf8' },
  { id: 'dragonbone_lute', slot: 'prop', name: 'Dragonbone Neck Lute', visualTier: 'rare', silhouetteId: 'prop_clockwork_lute', unlockRelicId: 'dragon_lute_peg', primaryColor: '#991b1b', accentColor: '#fde047', tintFilter: 'hue-rotate(-28deg) saturate(1.35)' },
  { id: 'crystal_ocarina_prop', slot: 'prop', name: 'Frost-Crystal Ocarina', visualTier: 'rare', silhouetteId: 'prop_arcane_instrument', unlockRelicId: 'crystal_ocarina', primaryColor: '#38bdf8', accentColor: '#e0f2fe' },
  { id: 'runic_lyre_prop', slot: 'prop', name: 'Arcane Runic Lyre', visualTier: 'rare', silhouetteId: 'prop_arcane_instrument', unlockRelicId: 'runic_lyre_string', primaryColor: '#7c3aed', accentColor: '#22d3ee', tintFilter: 'hue-rotate(60deg) saturate(1.4)' },
  // Mythic Prop Relics (2 — Challenge Earned)
  { id: 'celestial_bell', slot: 'prop', name: 'Celestial Carillon Harp', visualTier: 'mythic', silhouetteId: 'prop_celestial_lute', unlockRelicId: 'celestial_carillon', primaryColor: '#fde047', accentColor: '#c084fc' },
  { id: 'solar_sovereign_lyre', slot: 'prop', name: 'Solar Sovereign Star-Lute', visualTier: 'mythic', silhouetteId: 'prop_celestial_lute', unlockRelicId: 'orpheus_lyre', primaryColor: '#f59e0b', accentColor: '#fffbeb', tintFilter: 'hue-rotate(-14deg) saturate(1.45) brightness(1.14)' },
  // Feat Props (5)
  { id: 'collector_satchel', slot: 'prop', name: "Collector's Relic Lute", visualTier: 'common', silhouetteId: 'prop_lute', unlockRelicId: null, unlockFeatId: 'relic5', primaryColor: '#78350f', accentColor: '#facc15', tintFilter: 'saturate(1.15)' },
  { id: 'encore_lute', slot: 'prop', name: 'Encore Gilded Lute', visualTier: 'uncommon', silhouetteId: 'prop_lute', unlockRelicId: null, unlockFeatId: 'grinder5', primaryColor: '#f59e0b', accentColor: '#fffbeb', tintFilter: 'hue-rotate(14deg) saturate(1.4) brightness(1.15)' },
  { id: 'maestro_baton', slot: 'prop', name: "Maestro's Golden Baton", visualTier: 'rare', silhouetteId: 'prop_baton', unlockRelicId: null, unlockFeatId: 'voice6', primaryColor: '#fde047', accentColor: '#38bdf8', tintFilter: 'hue-rotate(-165deg) saturate(1.5) brightness(1.12)' },
  { id: 'archivist_grimoire_lute', slot: 'prop', name: "Archivist's Gilded Lyre", visualTier: 'rare', silhouetteId: 'prop_arcane_instrument', unlockRelicId: null, unlockFeatId: 'relic30', primaryColor: '#eab308', accentColor: '#fef08a', tintFilter: 'hue-rotate(-155deg) saturate(1.4)' },
  { id: 'oracle_astral_lute', slot: 'prop', name: "Oracle's Astral Star-Lute", visualTier: 'mythic', silhouetteId: 'prop_celestial_lute', unlockRelicId: null, unlockFeatId: 'blind_maestro', primaryColor: '#38bdf8', accentColor: '#fde047', tintFilter: 'hue-rotate(170deg) saturate(1.45) brightness(1.12)' },

  // =========================================================================
  // 5. FRAMES / AURAS (4 Starters + 17 Relics + 5 Feats = 26)
  // =========================================================================
  // Starters (Humble / Boring)
  { id: 'plain_wood', slot: 'frame', name: 'Plain Wooden Rim', visualTier: 'starter', silhouetteId: 'frame_plain', unlockRelicId: null, primaryColor: '#26180f', accentColor: '#7c5d41' },
  { id: 'candlelit_hearth', slot: 'frame', name: 'Dim Tallow Hearth', visualTier: 'starter', silhouetteId: 'frame_plain', unlockRelicId: null, primaryColor: '#2c180b', accentColor: '#a8834a' },
  { id: 'emerald_felt', slot: 'frame', name: 'Worn Green Felt', visualTier: 'starter', silhouetteId: 'frame_felt', unlockRelicId: null, primaryColor: '#102e1f', accentColor: '#4b8a64' },
  { id: 'slate_tavern', slot: 'frame', name: 'Dusty Slate Wall', visualTier: 'starter', silhouetteId: 'frame_plain', unlockRelicId: null, primaryColor: '#1f242c', accentColor: '#6b7280' },
  // Common Frame Relics (5)
  { id: 'ivory_gleam', slot: 'frame', name: 'Ivory Gleam Frame', visualTier: 'common', silhouetteId: 'frame_warm', unlockRelicId: 'ivory_keycap', primaryColor: '#3b2b1a', accentColor: '#fffbeb' },
  { id: 'resin_gloss', slot: 'frame', name: 'Resin Gloss Frame', visualTier: 'common', silhouetteId: 'frame_spark', unlockRelicId: 'key_polish', primaryColor: '#451a03', accentColor: '#fbbf24' },
  { id: 'candle_score_aura', slot: 'frame', name: 'Candlelit Score Glow', visualTier: 'common', silhouetteId: 'frame_glow', unlockRelicId: 'candle_sheet', primaryColor: '#431407', accentColor: '#fb923c' },
  { id: 'amber_glow', slot: 'frame', name: 'Warm Amber Glow', visualTier: 'common', silhouetteId: 'frame_glow', unlockRelicId: 'rosin_cake', primaryColor: '#78350f', accentColor: '#fde047' },
  { id: 'hearth_spark_frame', slot: 'frame', name: 'Hearth Flint Ember', visualTier: 'common', silhouetteId: 'frame_spark', unlockRelicId: 'hearth_spark', primaryColor: '#3b1508', accentColor: '#f97316' },
  // Uncommon Frame Relics (5)
  { id: 'copper_trim', slot: 'frame', name: 'Copper Coil Ring', visualTier: 'uncommon', silhouetteId: 'frame_ring', unlockRelicId: 'copper_coil', primaryColor: '#431407', accentColor: '#f97316' },
  { id: 'gilded_trim', slot: 'frame', name: 'Gilded Pedal Ring', visualTier: 'uncommon', silhouetteId: 'frame_ring', unlockRelicId: 'gilded_pedals', primaryColor: '#291b06', accentColor: '#facc15' },
  { id: 'emerald_stage_lantern', slot: 'frame', name: 'Emerald Stage Lantern', visualTier: 'uncommon', silhouetteId: 'frame_ring', unlockRelicId: 'emerald_lens', primaryColor: '#064e3b', accentColor: '#34d399' },
  { id: 'silver_chime_aura', slot: 'frame', name: 'Silver Chime Shimmer', visualTier: 'uncommon', silhouetteId: 'frame_spark', unlockRelicId: 'silver_chime_ring', primaryColor: '#1e293b', accentColor: '#e2e8f0' },
  { id: 'velvet_spotlight_aura', slot: 'frame', name: 'Velvet Stage Spotlight', visualTier: 'uncommon', silhouetteId: 'frame_glow', unlockRelicId: 'velvet_spotlight', primaryColor: '#4c0519', accentColor: '#fda4af' },
  // Rare Frame Relics (5)
  { id: 'phantom_mist', slot: 'frame', name: 'Phantom Mist Aura', visualTier: 'rare', silhouetteId: 'frame_aura', unlockRelicId: 'phantom_pedal', primaryColor: '#1e1b4b', accentColor: '#a78bfa' },
  { id: 'crystal_frost', slot: 'frame', name: 'Crystal Frost Aura', visualTier: 'rare', silhouetteId: 'frame_aura', unlockRelicId: 'crystal_pipe', primaryColor: '#0c4a6e', accentColor: '#7dd3fc' },
  { id: 'runic_halo', slot: 'frame', name: 'Runic Arcane Halo', visualTier: 'rare', silhouetteId: 'frame_halo', unlockRelicId: 'runic_diapason', primaryColor: '#2e1065', accentColor: '#22d3ee' },
  { id: 'gilded_sunburst', slot: 'frame', name: 'Gilded Sunburst Aura', visualTier: 'rare', silhouetteId: 'frame_halo', unlockRelicId: 'gilded_harp', primaryColor: '#451a03', accentColor: '#fde047' },
  { id: 'storm_lightning', slot: 'frame', name: 'Stormglass Lightning', visualTier: 'rare', silhouetteId: 'frame_aura', unlockRelicId: 'storm_coil', primaryColor: '#0f172a', accentColor: '#38bdf8' },
  // Mythic Frame Relics (2 — Challenge Earned)
  { id: 'chronos_halo', slot: 'frame', name: 'Chronos Golden Clock-Halo', visualTier: 'mythic', silhouetteId: 'frame_supernova', unlockRelicId: 'chronos_escapement', primaryColor: '#1c1208', accentColor: '#ffe875' },
  { id: 'void_supernova_halo', slot: 'frame', name: 'Astral Void Supernova', visualTier: 'mythic', silhouetteId: 'frame_supernova', unlockRelicId: 'void_resonator', primaryColor: '#09071a', accentColor: '#38bdf8' },
  // Feat Frames (5)
  { id: 'tavern_flame_aura', slot: 'frame', name: 'Tavern Hearth Flame', visualTier: 'uncommon', silhouetteId: 'frame_glow', unlockRelicId: null, unlockFeatId: 'streak3', primaryColor: '#431407', accentColor: '#fb923c' },
  { id: 'grace_shield_aura', slot: 'frame', name: 'Arcane Grace Shield', visualTier: 'uncommon', silhouetteId: 'frame_ring', unlockRelicId: null, unlockFeatId: 'grace_note', primaryColor: '#082f49', accentColor: '#38bdf8' },
  { id: 'nat20_crit_aura', slot: 'frame', name: 'Nat 20 Golden Crit Aura', visualTier: 'rare', silhouetteId: 'frame_halo', unlockRelicId: null, unlockFeatId: 'nat20', primaryColor: '#422006', accentColor: '#ffe875' },
  { id: 'realm_singer_halo', slot: 'frame', name: 'Voice of the Realm Halo', visualTier: 'mythic', silhouetteId: 'frame_supernova', unlockRelicId: null, unlockFeatId: 'level50', primaryColor: '#3b0764', accentColor: '#fde047' },
  { id: 'mythic_starburst', slot: 'frame', name: 'Mythic Starburst Supernova', visualTier: 'mythic', silhouetteId: 'frame_supernova', unlockRelicId: null, unlockFeatId: 'mythic_relic', primaryColor: '#2e1065', accentColor: '#fde047' },
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

  // Migrate legacy `cloak` field to `outfit` seamlessly
  const outfitCandidate = input?.outfit ?? input?.cloak;

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

  let familiar: BardFamiliarId = 'none';
  if (input?.familiar) {
    const foundFam = BARD_FAMILIARS.find((f) => f.id === input.familiar);
    if (foundFam && isFamiliarUnlocked(foundFam, ownedRelics, ownedFeats)) {
      familiar = foundFam.id;
    }
  }

  const validSkin = BARD_SKIN_TONES.some((s) => s.id === input?.skinTone)
    ? (input!.skinTone as string)
    : DEFAULT_BARD_AVATAR.skinTone;

  const validFace: BardFaceStyleId = BARD_FACE_STYLES.some(
    (f) => f.id === input?.faceStyle
  )
    ? (input!.faceStyle as BardFaceStyleId)
    : DEFAULT_BARD_AVATAR.faceStyle;

  return {
    hair: pickValid('hair', input?.hair),
    hat: pickValid('hat', input?.hat),
    outfit: pickValid('outfit', outfitCandidate),
    prop: pickValid('prop', input?.prop),
    frame: pickValid('frame', input?.frame),
    skinTone: validSkin,
    faceStyle: validFace,
    familiar,
    badgeId,
    diceSkin,
    particleSkin,
    epithet,
    useSnoovatar: Boolean(input?.useSnoovatar),
  };
}

export type AuraVfxTier = 'base' | 'rare' | 'mythic';

export function getAuraVfxTier(frameId: string): AuraVfxTier {
  const item = BARD_COSMETICS.find((c) => c.slot === 'frame' && c.id === frameId);
  if (!item) return 'base';
  if (item.visualTier === 'mythic' || item.silhouetteId === 'frame_supernova') {
    return 'mythic';
  }
  if (
    item.visualTier === 'rare' ||
    item.silhouetteId === 'frame_halo' ||
    item.silhouetteId === 'frame_aura'
  ) {
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
