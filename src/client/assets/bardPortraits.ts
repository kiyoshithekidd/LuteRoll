import type { BardPortraitId } from '../../shared/cosmetics';
import bardBuskerUrl from './bards/bard_busker.webp';
import bardMinstrelUrl from './bards/bard_minstrel.webp';
import bardBaseMaleUrl from './bards/bard_base_male.webp';
import bardBaseFemaleUrl from './bards/bard_base_female.webp';
import bardBaseNonbinaryUrl from './bards/bard_base_nonbinary.webp';
import bardBaroqueUrl from './bards/bard_baroque.webp';
import bardClockworkUrl from './bards/bard_clockwork.webp';
import bardArcaneUrl from './bards/bard_arcane.webp';
import bardDragonUrl from './bards/bard_dragon.webp';
import bardCelestaUrl from './bards/bard_celesta.webp';
import bardAstralUrl from './bards/bard_astral.webp';
import bardNat20Url from './bards/bard_nat20.webp';
import bardFlawlessUrl from './bards/bard_flawless.webp';
import bardBrutalUrl from './bards/bard_brutal.webp';

/**
 * Tiered pre-built Chibi Bard portraits.
 * New tiered portrait IDs (guild_apprentice, tavern_regular, etc.) temporarily
 * reuse closest existing WebPs until image-gen quota resets.
 */
export const BARD_PORTRAIT_URLS: Record<BardPortraitId, string> = {
  // Starter
  busker: bardBuskerUrl,
  minstrel: bardMinstrelUrl,
  base_male: bardBaseMaleUrl,
  base_female: bardBaseFemaleUrl,
  base_nonbinary: bardBaseNonbinaryUrl,
  // Common / Early Progression
  guild_apprentice: bardBaseMaleUrl,
  bounty_tracker: bardMinstrelUrl,
  // Uncommon
  baroque: bardBaroqueUrl,
  clockwork: bardClockworkUrl,
  tavern_duelist: bardBuskerUrl,
  // Rare
  arcane: bardArcaneUrl,
  dragon: bardDragonUrl,
  celesta: bardCelestaUrl,
  encore_virtuoso: bardFlawlessUrl,
  nat20: bardNat20Url,
  flawless: bardFlawlessUrl,
  // Mythic (Earned-Only Challenges, High Levels & Streaks)
  brutal: bardBrutalUrl,
  astral: bardAstralUrl,
  phoenix_maestro: bardDragonUrl,
  blind_oracle: bardArcaneUrl,
  storm_virtuoso: bardCelestaUrl,
  realm_sovereign: bardAstralUrl,
  immortal_sun: bardNat20Url,
};
