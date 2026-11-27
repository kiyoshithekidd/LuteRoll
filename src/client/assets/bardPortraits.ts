import type { BardPortraitId } from '../../shared/cosmetics';
import bardBuskerUrl from './bards/bard_busker.webp';
import bardMinstrelUrl from './bards/bard_minstrel.webp';
import bardBaseMaleUrl from './bards/bard_base_male.webp';
import bardBaseFemaleUrl from './bards/bard_base_female.webp';
import bardBaseNonbinaryUrl from './bards/bard_base_nonbinary.webp';
import bardGuildApprenticeUrl from './bards/bard_guild_apprentice.webp';
import bardBountyTrackerUrl from './bards/bard_bounty_tracker.webp';
import bardBaroqueUrl from './bards/bard_baroque.webp';
import bardClockworkUrl from './bards/bard_clockwork.webp';
import bardTavernDuelistUrl from './bards/bard_tavern_duelist.webp';
import bardArcaneUrl from './bards/bard_arcane.webp';
import bardDragonUrl from './bards/bard_dragon.webp';
import bardCelestaUrl from './bards/bard_celesta.webp';
import bardEncoreVirtuosoUrl from './bards/bard_encore_virtuoso.webp';
import bardAstralUrl from './bards/bard_astral.webp';
import bardNat20Url from './bards/bard_nat20.webp';
import bardFlawlessUrl from './bards/bard_flawless.webp';
import bardBrutalUrl from './bards/bard_brutal.webp';
import bardPhoenixMaestroUrl from './bards/bard_phoenix_maestro.webp';
import bardBlindOracleUrl from './bards/bard_blind_oracle.webp';
import bardStormVirtuosoUrl from './bards/bard_storm_virtuoso.webp';
import bardRealmSovereignUrl from './bards/bard_realm_sovereign.webp';
import bardImmortalSunUrl from './bards/bard_immortal_sun.webp';

/**
 * Tiered pre-built Chibi Bard portraits (23 unique portraits across Starter, Common, Uncommon, Rare, and Mythic tiers).
 */
export const BARD_PORTRAIT_URLS: Record<BardPortraitId, string> = {
  // Starter
  busker: bardBuskerUrl,
  minstrel: bardMinstrelUrl,
  base_male: bardBaseMaleUrl,
  base_female: bardBaseFemaleUrl,
  base_nonbinary: bardBaseNonbinaryUrl,
  // Common / Early Progression
  guild_apprentice: bardGuildApprenticeUrl,
  bounty_tracker: bardBountyTrackerUrl,
  // Uncommon
  baroque: bardBaroqueUrl,
  clockwork: bardClockworkUrl,
  tavern_duelist: bardTavernDuelistUrl,
  // Rare
  arcane: bardArcaneUrl,
  dragon: bardDragonUrl,
  celesta: bardCelestaUrl,
  encore_virtuoso: bardEncoreVirtuosoUrl,
  nat20: bardNat20Url,
  flawless: bardFlawlessUrl,
  // Mythic (Earned-Only Challenges, High Levels & Streaks)
  brutal: bardBrutalUrl,
  astral: bardAstralUrl,
  phoenix_maestro: bardPhoenixMaestroUrl,
  blind_oracle: bardBlindOracleUrl,
  storm_virtuoso: bardStormVirtuosoUrl,
  realm_sovereign: bardRealmSovereignUrl,
  immortal_sun: bardImmortalSunUrl,
};
