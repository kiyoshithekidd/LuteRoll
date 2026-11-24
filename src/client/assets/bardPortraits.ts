import type { BardPortraitId } from '../../shared/cosmetics';
import bardBuskerUrl from './bards/bard_busker.webp';
import bardMinstrelUrl from './bards/bard_minstrel.webp';
import bardBaroqueUrl from './bards/bard_baroque.webp';
import bardClockworkUrl from './bards/bard_clockwork.webp';
import bardArcaneUrl from './bards/bard_arcane.webp';
import bardDragonUrl from './bards/bard_dragon.webp';
import bardCelestaUrl from './bards/bard_celesta.webp';
import bardAstralUrl from './bards/bard_astral.webp';
import bardNat20Url from './bards/bard_nat20.webp';
import bardFlawlessUrl from './bards/bard_flawless.webp';
import bardBrutalUrl from './bards/bard_brutal.webp';

export const BARD_PORTRAIT_URLS: Record<BardPortraitId, string> = {
  busker: bardBuskerUrl,
  minstrel: bardMinstrelUrl,
  baroque: bardBaroqueUrl,
  clockwork: bardClockworkUrl,
  arcane: bardArcaneUrl,
  dragon: bardDragonUrl,
  celesta: bardCelestaUrl,
  astral: bardAstralUrl,
  nat20: bardNat20Url,
  flawless: bardFlawlessUrl,
  brutal: bardBrutalUrl,
};
