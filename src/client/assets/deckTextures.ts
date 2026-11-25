import type { KeyboardVoiceId } from '../../shared/api';
import deckCedarLuteUrl from './decks/deck_cedar_lute.webp';
import deckBaroqueCrimsonUrl from './decks/deck_baroque_crimson.webp';
import deckClockworkBrassUrl from './decks/deck_clockwork_brass.webp';
import deckArcaneAstralUrl from './decks/deck_arcane_astral.webp';

export const KEYBOARD_DECK_TEXTURES: Partial<Record<KeyboardVoiceId, string>> = {
  tavern_lute: deckCedarLuteUrl,
  accordion: deckCedarLuteUrl,
  honky_tonk: deckBaroqueCrimsonUrl,
  harpsichord: deckBaroqueCrimsonUrl,
  clavinet: deckBaroqueCrimsonUrl,
  music_box: deckClockworkBrassUrl,
  bell_organ: deckClockworkBrassUrl,
  cathedral_organ: deckClockworkBrassUrl,
  electric_piano: deckArcaneAstralUrl,
  arcane_synth: deckArcaneAstralUrl,
  celesta: deckArcaneAstralUrl,
  astral_grand: deckArcaneAstralUrl,
};
