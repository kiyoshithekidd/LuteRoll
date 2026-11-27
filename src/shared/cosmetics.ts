import type { KeyboardVoiceId, RareFeat } from './api';

export type BardCosmeticSlot = 'frame';

export type BardVisualTier =
  | 'starter'
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'mythic';

export type BardPortraitId =
  | 'busker'
  | 'minstrel'
  | 'base_male'
  | 'base_female'
  | 'base_nonbinary'
  | 'guild_apprentice'
  | 'bounty_tracker'
  | 'baroque'
  | 'clockwork'
  | 'tavern_duelist'
  | 'arcane'
  | 'dragon'
  | 'celesta'
  | 'encore_virtuoso'
  | 'nat20'
  | 'flawless'
  | 'brutal'
  | 'astral'
  | 'phoenix_maestro'
  | 'blind_oracle'
  | 'storm_virtuoso'
  | 'realm_sovereign'
  | 'immortal_sun';

export type BardPortraitMeta = {
  id: BardPortraitId;
  name: string;
  tier: BardVisualTier;
  subtitle: string;
  unlockRelics?: number;
  unlockRelicId?: string;
  unlockFeatId?: RareFeat;
};

export const BARD_PORTRAITS: readonly BardPortraitMeta[] = [
  // === STARTERS (5) ===
  { id: 'busker', name: 'Tavern Busker', tier: 'starter', subtitle: 'Starter • Feathered Cap & Lute', unlockRelics: 0 },
  { id: 'minstrel', name: 'Hooded Minstrel', tier: 'starter', subtitle: 'Starter • Candlelit Quill & Scroll', unlockRelics: 0 },
  { id: 'base_male', name: 'Hearthside Troubadour', tier: 'starter', subtitle: 'Starter • Male Chibi Bard', unlockRelics: 0 },
  { id: 'base_female', name: 'Auburn Balladeer', tier: 'starter', subtitle: 'Starter • Female Chibi Bard', unlockRelics: 0 },
  { id: 'base_nonbinary', name: 'Silver-Leaf Minstrel', tier: 'starter', subtitle: 'Starter • Non-Binary Chibi Bard', unlockRelics: 0 },
  // === COMMON / EARLY PROGRESSION (2) ===
  { id: 'guild_apprentice', name: 'Apprentice Guild Bard', tier: 'common', subtitle: 'Feat: Apprentice Graduate (Lvl 5)', unlockFeatId: 'level5' },
  { id: 'bounty_tracker', name: 'Tavern Bounty Hunter', tier: 'common', subtitle: 'Feat: Claim a Daily Bounty', unlockFeatId: 'bounty_hunter' },
  // === UNCOMMON (3) ===
  { id: 'baroque', name: 'Baroque Noble', tier: 'uncommon', subtitle: '6 Relics or Velvet Bench Pad', unlockRelics: 6, unlockRelicId: 'velvet_bench' },
  { id: 'clockwork', name: 'Clockwork Tinker', tier: 'uncommon', subtitle: '10 Relics or Clockwork Arpeggiator', unlockRelics: 10, unlockRelicId: 'clock_arp' },
  { id: 'tavern_duelist', name: 'Stage Duelist', tier: 'uncommon', subtitle: 'Feat: Win a Bardic Gauntlet', unlockFeatId: 'gauntlet_victor' },
  // === RARE (6) ===
  { id: 'arcane', name: 'Arcane Rune-Weaver', tier: 'rare', subtitle: '18 Relics or Runic Diapason', unlockRelics: 18, unlockRelicId: 'runic_diapason' },
  { id: 'dragon', name: 'Dragoncrest Troubadour', tier: 'rare', subtitle: '25 Relics or Dragonbone Hammer', unlockRelics: 25, unlockRelicId: 'dragon_hammer' },
  { id: 'celesta', name: 'Starlight Celesta', tier: 'rare', subtitle: '35 Relics or Crystal Organ Pipe', unlockRelics: 35, unlockRelicId: 'crystal_pipe' },
  { id: 'encore_virtuoso', name: 'Encore Daredevil', tier: 'rare', subtitle: 'Feat: Clear an Encore Mode run', unlockFeatId: 'encore_champ' },
  { id: 'nat20', name: 'Nat 20 Champion', tier: 'rare', subtitle: 'Feat: Blessed by Fate (Nat 20)', unlockFeatId: 'nat20' },
  { id: 'flawless', name: 'Golden Ear Virtuoso', tier: 'rare', subtitle: 'Feat: Golden Ear (100% Clear)', unlockFeatId: 'flawless' },
  // === MYTHIC (7 — Earned-Only Challenges, High Levels & Streaks) ===
  { id: 'brutal', name: 'Brutal Underdog', tier: 'mythic', subtitle: 'Feat: Underdog Encore (Nat 1 Clear)', unlockFeatId: 'nat1_clear' },
  { id: 'astral', name: 'Astral Sovereign', tier: 'mythic', subtitle: 'Mythic Relic: Crown of the Keys', unlockRelicId: 'grand_crown', unlockFeatId: 'mythic_relic' },
  { id: 'phoenix_maestro', name: 'Living Phoenix Maestro', tier: 'mythic', subtitle: 'Mythic Relic: Living Phoenix Plume', unlockRelicId: 'phoenix_plume' },
  { id: 'blind_oracle', name: 'Blindfold Oracle', tier: 'mythic', subtitle: 'Feat: Blindfold Maestro (95%+ No-Lights)', unlockFeatId: 'blind_maestro' },
  { id: 'storm_virtuoso', name: 'Virtuoso of the Storm', tier: 'mythic', subtitle: 'Feat: 100% on Very Hard / Brutal', unlockFeatId: 'flawless_hard' },
  { id: 'realm_sovereign', name: 'Voice of the Realm', tier: 'mythic', subtitle: 'Feat: Reach Bard Level 50', unlockFeatId: 'level50' },
  { id: 'immortal_sun', name: 'Immortal Sun Sovereign', tier: 'mythic', subtitle: 'Feat: 30-Day Tavern Streak', unlockFeatId: 'streak30' },
] as const;

export function isPortraitUnlocked(
  portrait: BardPortraitMeta,
  ownedRelics: readonly string[],
  ownedFeats: readonly RareFeat[]
): boolean {
  if (portrait.unlockRelics === 0) return true;
  if (
    portrait.unlockRelics !== undefined &&
    ownedRelics.length >= portrait.unlockRelics
  ) {
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
  portrait?: BardPortraitId;
  frame: string;
  familiar?: BardFamiliarId;
  badgeId?: string | null;
  diceSkin?: DiceSkinId;
  particleSkin?: NoteParticleId;
  epithet?: BardEpithetId;
  useSnoovatar?: boolean;
};

export type BardCosmeticItem = {
  id: string;
  slot: BardCosmeticSlot;
  name: string;
  visualTier: BardVisualTier;
  shape: 'plain' | 'warm' | 'felt' | 'spark' | 'glow' | 'ring' | 'aura' | 'halo' | 'supernova';
  /** null = not gated by relic; otherwise exact relic ID from RELIC_CATALOG */
  unlockRelicId: string | null;
  /** optional exact feat ID from FEAT_CATALOG */
  unlockFeatId?: RareFeat | null;
  primaryColor: string;
  accentColor: string;
};

export const DEFAULT_BARD_AVATAR: BardAvatarConfig = {
  portrait: 'busker',
  frame: 'candlelit_hearth',
  familiar: 'none',
  badgeId: null,
  diceSkin: 'tavern_gold',
  particleSkin: 'emerald_spark',
  epithet: 'none',
  useSnoovatar: false,
};

/**
 * 26 Stage Auras / Frames (4 Starters + 17 Relic-unlocked + 5 Feat-unlocked),
 * escalating from humble wooden/felt rims up to animated Rare & Mythic halos.
 */
export const BARD_COSMETICS: readonly BardCosmeticItem[] = [
  // Starters
  { id: 'plain_wood', slot: 'frame', name: 'Plain Wooden Rim', visualTier: 'starter', shape: 'plain', unlockRelicId: null, primaryColor: '#26180f', accentColor: '#7c5d41' },
  { id: 'candlelit_hearth', slot: 'frame', name: 'Candlelit Hearth', visualTier: 'starter', shape: 'warm', unlockRelicId: null, primaryColor: '#2c180b', accentColor: '#d4af37' },
  { id: 'emerald_felt', slot: 'frame', name: 'Emerald Felt', visualTier: 'starter', shape: 'felt', unlockRelicId: null, primaryColor: '#0e3623', accentColor: '#4ade80' },
  { id: 'slate_tavern', slot: 'frame', name: 'Dusty Slate Rim', visualTier: 'starter', shape: 'plain', unlockRelicId: null, primaryColor: '#1f242c', accentColor: '#6b7280' },
  // Common Relics
  { id: 'ivory_gleam', slot: 'frame', name: 'Ivory Gleam Frame', visualTier: 'common', shape: 'warm', unlockRelicId: 'ivory_keycap', primaryColor: '#3b2b1a', accentColor: '#fffbeb' },
  { id: 'resin_gloss', slot: 'frame', name: 'Resin Gloss Frame', visualTier: 'common', shape: 'spark', unlockRelicId: 'key_polish', primaryColor: '#451a03', accentColor: '#fbbf24' },
  { id: 'candle_score_aura', slot: 'frame', name: 'Candlelit Score Glow', visualTier: 'common', shape: 'glow', unlockRelicId: 'candle_sheet', primaryColor: '#431407', accentColor: '#fb923c' },
  { id: 'amber_glow', slot: 'frame', name: 'Warm Amber Glow', visualTier: 'common', shape: 'glow', unlockRelicId: 'rosin_cake', primaryColor: '#78350f', accentColor: '#fde047' },
  { id: 'hearth_spark_frame', slot: 'frame', name: 'Hearth Flint Ember', visualTier: 'common', shape: 'spark', unlockRelicId: 'hearth_spark', primaryColor: '#3b1508', accentColor: '#f97316' },
  // Uncommon Relics
  { id: 'copper_trim', slot: 'frame', name: 'Copper Coil Ring', visualTier: 'uncommon', shape: 'ring', unlockRelicId: 'copper_coil', primaryColor: '#431407', accentColor: '#f97316' },
  { id: 'gilded_trim', slot: 'frame', name: 'Gilded Pedal Ring', visualTier: 'uncommon', shape: 'ring', unlockRelicId: 'gilded_pedals', primaryColor: '#291b06', accentColor: '#facc15' },
  { id: 'emerald_stage_lantern', slot: 'frame', name: 'Emerald Stage Lantern', visualTier: 'uncommon', shape: 'ring', unlockRelicId: 'emerald_lens', primaryColor: '#064e3b', accentColor: '#34d399' },
  { id: 'silver_chime_aura', slot: 'frame', name: 'Silver Chime Shimmer', visualTier: 'uncommon', shape: 'spark', unlockRelicId: 'silver_chime_ring', primaryColor: '#1e293b', accentColor: '#e2e8f0' },
  { id: 'velvet_spotlight_aura', slot: 'frame', name: 'Velvet Stage Spotlight', visualTier: 'uncommon', shape: 'glow', unlockRelicId: 'velvet_spotlight', primaryColor: '#4c0519', accentColor: '#fda4af' },
  // Rare Relics
  { id: 'phantom_mist', slot: 'frame', name: 'Phantom Mist Aura', visualTier: 'rare', shape: 'aura', unlockRelicId: 'phantom_pedal', primaryColor: '#1e1b4b', accentColor: '#a78bfa' },
  { id: 'crystal_frost', slot: 'frame', name: 'Crystal Frost Aura', visualTier: 'rare', shape: 'aura', unlockRelicId: 'crystal_pipe', primaryColor: '#0c4a6e', accentColor: '#7dd3fc' },
  { id: 'runic_halo', slot: 'frame', name: 'Runic Arcane Halo', visualTier: 'rare', shape: 'halo', unlockRelicId: 'runic_diapason', primaryColor: '#2e1065', accentColor: '#22d3ee' },
  { id: 'gilded_sunburst', slot: 'frame', name: 'Gilded Sunburst Aura', visualTier: 'rare', shape: 'halo', unlockRelicId: 'gilded_harp', primaryColor: '#451a03', accentColor: '#fde047' },
  { id: 'storm_lightning', slot: 'frame', name: 'Stormglass Lightning', visualTier: 'rare', shape: 'aura', unlockRelicId: 'storm_coil', primaryColor: '#0f172a', accentColor: '#38bdf8' },
  // Mythic Relics (Earned-Only)
  { id: 'chronos_halo', slot: 'frame', name: 'Chronos Golden Clock-Halo', visualTier: 'mythic', shape: 'supernova', unlockRelicId: 'chronos_escapement', primaryColor: '#1c1208', accentColor: '#ffe875' },
  { id: 'void_supernova_halo', slot: 'frame', name: 'Astral Void Supernova', visualTier: 'mythic', shape: 'supernova', unlockRelicId: 'void_resonator', primaryColor: '#09071a', accentColor: '#38bdf8' },
  // Feat Frames
  { id: 'tavern_flame_aura', slot: 'frame', name: 'Tavern Hearth Flame', visualTier: 'uncommon', shape: 'glow', unlockRelicId: null, unlockFeatId: 'streak3', primaryColor: '#431407', accentColor: '#fb923c' },
  { id: 'grace_shield_aura', slot: 'frame', name: 'Arcane Grace Shield', visualTier: 'uncommon', shape: 'ring', unlockRelicId: null, unlockFeatId: 'grace_note', primaryColor: '#082f49', accentColor: '#38bdf8' },
  { id: 'nat20_crit_aura', slot: 'frame', name: 'Nat 20 Golden Crit Aura', visualTier: 'rare', shape: 'halo', unlockRelicId: null, unlockFeatId: 'nat20', primaryColor: '#422006', accentColor: '#ffe875' },
  { id: 'realm_singer_halo', slot: 'frame', name: 'Voice of the Realm Halo', visualTier: 'mythic', shape: 'supernova', unlockRelicId: null, unlockFeatId: 'level50', primaryColor: '#3b0764', accentColor: '#fde047' },
  { id: 'mythic_starburst', slot: 'frame', name: 'Mythic Starburst Supernova', visualTier: 'mythic', shape: 'supernova', unlockRelicId: null, unlockFeatId: 'mythic_relic', primaryColor: '#2e1065', accentColor: '#fde047' },
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
  let frame = DEFAULT_BARD_AVATAR.frame;
  if (input?.frame) {
    const foundFrame = BARD_COSMETICS.find(
      (c) => c.slot === 'frame' && c.id === input.frame
    );
    if (foundFrame && isCosmeticUnlocked(foundFrame, ownedRelics, ownedFeats)) {
      frame = foundFrame.id;
    }
  }

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

  let familiar: BardFamiliarId = 'none';
  if (input?.familiar) {
    const foundFam = BARD_FAMILIARS.find((f) => f.id === input.familiar);
    if (foundFam && isFamiliarUnlocked(foundFam, ownedRelics, ownedFeats)) {
      familiar = foundFam.id;
    }
  }

  return {
    portrait,
    frame,
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
  if (item.visualTier === 'mythic' || item.shape === 'supernova') {
    return 'mythic';
  }
  if (item.visualTier === 'rare' || item.shape === 'halo' || item.shape === 'aura') {
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
