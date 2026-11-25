import type { BardFamiliarId } from '../../shared/cosmetics';
import familiarSongbirdUrl from './familiars/familiar_songbird.webp';
import familiarLuteFoxUrl from './familiars/familiar_lute_fox.webp';
import familiarTavernCatUrl from './familiars/familiar_tavern_cat.webp';
import familiarScholarOwlUrl from './familiars/familiar_scholar_owl.webp';
import familiarEmberDrakeUrl from './familiars/familiar_ember_drake.webp';
import familiarCosmicSpriteUrl from './familiars/familiar_cosmic_sprite.webp';

export const FAMILIAR_URLS: Record<Exclude<BardFamiliarId, 'none'>, string> = {
  songbird: familiarSongbirdUrl,
  lute_fox: familiarLuteFoxUrl,
  tavern_cat: familiarTavernCatUrl,
  scholar_owl: familiarScholarOwlUrl,
  ember_drake: familiarEmberDrakeUrl,
  cosmic_sprite: familiarCosmicSpriteUrl,
};
