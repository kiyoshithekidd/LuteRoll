import {
  BARD_COSMETICS,
  BARD_FACE_STYLES,
  BARD_SKIN_TONES,
  DEFAULT_BARD_AVATAR,
  type BardAvatarConfig,
  type BardCosmeticItem,
  type BardFaceStyleId,
  type BardSilhouetteId,
} from '../../shared/cosmetics';
import baseBrightUrl from './bardLayers/base_bright.webp';
import baseLashesUrl from './bardLayers/base_lashes.webp';
import baseSereneUrl from './bardLayers/base_serene.webp';
import hairBowlUrl from './bardLayers/hair_bowl.webp';
import hairTailUrl from './bardLayers/hair_tail.webp';
import hairCurlsUrl from './bardLayers/hair_curls.webp';
import hairBraidUrl from './bardLayers/hair_braid.webp';
import hairSweptUrl from './bardLayers/hair_swept.webp';
import hairBaroqueUrl from './bardLayers/hair_baroque.webp';
import hairMythicManeUrl from './bardLayers/hair_mythic_mane.webp';
import hatFeatherUrl from './bardLayers/hat_feather.webp';
import outfitBurlapUrl from './bardLayers/outfit_burlap.webp';
import propCrackedLuteUrl from './bardLayers/prop_cracked_lute.webp';

/**
 * Modular Paper-Doll Layer Asset Registry (Issue #42).
 *
 * All layers share a strict 512x512 coordinate anchor derived from `base_bright.webp`.
 */
function svgUri(inner: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${inner}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const BARD_FACE_STYLE_URLS: Record<BardFaceStyleId, string> = {
  bright: baseBrightUrl,
  lashes: baseLashesUrl,
  serene: baseSereneUrl,
};

/**
 * Equipment Silhouette URLs (null for intentionally empty slots like hair_bald, hat_none, and procedural frames).
 */
export const BARD_SILHOUETTE_URLS: Partial<Record<BardSilhouetteId, string>> = {
  // === HAIR (Storybook WebPs) ===
  hair_bowl: hairBowlUrl,
  hair_tail: hairTailUrl,
  hair_curls: hairCurlsUrl,
  hair_braid: hairBraidUrl,
  hair_swept: hairSweptUrl,
  hair_baroque: hairBaroqueUrl,
  hair_arcane: hairMythicManeUrl,
  hair_mythic_mane: hairMythicManeUrl,

  // === HATS ===
  hat_beanie: svgUri(`
    <path d="M148 164 C156 96 202 74 256 74 C310 74 356 96 364 164 Z" fill="#7c634c" stroke="#2c1608" stroke-width="7"/>
    <rect x="142" y="148" width="228" height="28" rx="14" fill="#5e4936" stroke="#2c1608" stroke-width="7"/>
  `),
  hat_hood: svgUri(`
    <path d="M126 266 C116 144 166 64 256 64 C346 64 396 144 386 266 L354 266 C356 178 320 120 256 120 C192 120 156 178 158 266 Z" fill="#6e4b30" stroke="#2c1608" stroke-width="7" stroke-linejoin="round"/>
  `),
  hat_beret: svgUri(`
    <path d="M132 162 C116 112 184 68 266 72 C344 76 390 112 368 162 Z" fill="#8f1d24" stroke="#2c1608" stroke-width="7"/>
    <path d="M150 158 Q256 142 362 158" fill="none" stroke="#ffe875" stroke-width="7" stroke-linecap="round"/>
  `),
  hat_feather: hatFeatherUrl,
  hat_circlet: svgUri(`
    <path d="M156 156 Q256 120 356 156" fill="none" stroke="#e2e8f0" stroke-width="14" stroke-linecap="round"/>
    <path d="M156 156 Q256 120 356 156" fill="none" stroke="#475569" stroke-width="4" stroke-linecap="round"/>
    <polygon points="256,108 274,132 256,154 238,132" fill="#38bdf8" stroke="#0f172a" stroke-width="5"/>
  `),
  hat_tricorne: svgUri(`
    <path d="M112 162 L182 72 L256 96 L330 72 L400 162 Q256 138 112 162 Z" fill="#1e293b" stroke="#0f172a" stroke-width="7" stroke-linejoin="round"/>
    <path d="M118 158 Q256 134 394 158" fill="none" stroke="#facc15" stroke-width="8" stroke-linecap="round"/>
    <circle cx="256" cy="116" r="14" fill="#facc15" stroke="#0f172a" stroke-width="5"/>
  `),
  hat_dragon_helm: svgUri(`
    <path d="M152 126 C112 96 110 56 146 42 C142 74 162 92 184 104 Z" fill="#fbbf24" stroke="#450a0a" stroke-width="6"/>
    <path d="M360 126 C400 96 402 56 366 42 C370 74 350 92 328 104 Z" fill="#fbbf24" stroke="#450a0a" stroke-width="6"/>
    <path d="M148 164 C150 92 198 66 256 66 C314 66 362 92 364 164 Q256 140 148 164 Z" fill="#7f1d1d" stroke="#2c0808" stroke-width="7"/>
    <polygon points="256,80 272,124 256,144 240,124" fill="#fbbf24" stroke="#450a0a" stroke-width="5"/>
  `),
  hat_crown: svgUri(`
    <path d="M158 156 L144 76 L204 114 L256 54 L308 114 L368 76 L354 156 Q256 138 158 156 Z" fill="#f59e0b" stroke="#5e3a06" stroke-width="7" stroke-linejoin="round"/>
    <circle cx="256" cy="108" r="13" fill="#fffbeb" stroke="#5e3a06" stroke-width="5"/>
    <circle cx="196" cy="126" r="9" fill="#38bdf8" stroke="#5e3a06" stroke-width="4"/>
    <circle cx="316" cy="126" r="9" fill="#38bdf8" stroke="#5e3a06" stroke-width="4"/>
  `),

  // === OUTFITS ===
  outfit_burlap: outfitBurlapUrl,
  outfit_tavern: svgUri(`
    <path d="M104 486 L136 328 C162 298 206 292 256 292 C306 292 350 298 376 328 L408 486 Z" fill="#14532d" stroke="#0c2616" stroke-width="7"/>
    <path d="M174 304 L256 356 L338 304" fill="none" stroke="#d4af37" stroke-width="7"/>
    <circle cx="256" cy="356" r="12" fill="#d4af37" stroke="#3b2818" stroke-width="4"/>
  `),
  outfit_coat: svgUri(`
    <path d="M102 486 L132 324 C160 296 204 290 256 290 C308 290 352 296 380 324 L410 486 Z" fill="#4a2c18" stroke="#1f1108" stroke-width="7"/>
    <path d="M210 294 L256 376 L302 294" fill="#f5ead2" stroke="#1f1108" stroke-width="6"/>
    <circle cx="222" cy="402" r="7" fill="#f59e0b"/>
    <circle cx="290" cy="402" r="7" fill="#f59e0b"/>
  `),
  outfit_doublet: svgUri(`
    <path d="M98 486 L128 322 C158 292 204 288 256 288 C308 288 354 292 384 322 L414 486 Z" fill="#7c2d12" stroke="#2c0c04" stroke-width="7"/>
    <path d="M178 298 L256 374 L334 298" fill="none" stroke="#ffe875" stroke-width="9"/>
    <line x1="256" y1="364" x2="256" y2="486" stroke="#ffe875" stroke-width="7"/>
  `),
  outfit_clockwork: svgUri(`
    <path d="M96 486 L124 320 C156 290 204 286 256 286 C308 286 356 290 388 320 L416 486 Z" fill="#78350f" stroke="#291204" stroke-width="7"/>
    <circle cx="152" cy="338" r="24" fill="#d97706" stroke="#291204" stroke-width="6"/>
    <circle cx="360" cy="338" r="24" fill="#d97706" stroke="#291204" stroke-width="6"/>
    <circle cx="256" cy="364" r="18" fill="#38bdf8" stroke="#ffe875" stroke-width="6"/>
  `),
  outfit_royal_cape: svgUri(`
    <path d="M88 486 L118 318 C154 286 204 284 256 284 C308 284 358 286 394 318 L424 486 Z" fill="#1e3a8a" stroke="#0c1942" stroke-width="7"/>
    <path d="M140 314 Q256 368 372 314" fill="none" stroke="#ffe875" stroke-width="11" stroke-linecap="round"/>
    <polygon points="256,336 274,358 256,380 238,358" fill="#7dd3fc" stroke="#ffe875" stroke-width="5"/>
  `),
  outfit_phoenix_robes: svgUri(`
    <path d="M86 486 L116 316 C152 284 204 282 256 282 C308 282 360 284 396 316 L426 486 Z" fill="#991b1b" stroke="#3b0707" stroke-width="7"/>
    <path d="M126 322 Q188 386 256 352 Q324 386 386 322" fill="none" stroke="#fb923c" stroke-width="12" stroke-linecap="round"/>
    <circle cx="256" cy="356" r="18" fill="#fef08a" stroke="#dc2626" stroke-width="5"/>
  `),
  outfit_astral_regalia: svgUri(`
    <path d="M84 486 L114 314 C150 282 204 280 256 280 C308 280 362 282 398 314 L428 486 Z" fill="#312e81" stroke="#0f0b2e" stroke-width="7"/>
    <path d="M132 318 Q256 376 380 318" fill="none" stroke="#fde047" stroke-width="10"/>
    <circle cx="176" cy="402" r="5" fill="#fde047"/>
    <circle cx="336" cy="410" r="5" fill="#fde047"/>
    <circle cx="222" cy="438" r="4" fill="#7dd3fc"/>
    <circle cx="298" cy="382" r="4" fill="#7dd3fc"/>
    <polygon points="256,334 274,358 256,382 238,358" fill="#fde047" stroke="#0f0b2e" stroke-width="5"/>
  `),

  // === PROPS ===
  prop_cracked_lute: propCrackedLuteUrl,
  prop_spoon_whistle: svgUri(`
    <g transform="rotate(-28 340 400)">
      <rect x="296" y="388" width="118" height="16" rx="8" fill="#8c6239" stroke="#2c1608" stroke-width="6"/>
      <ellipse cx="290" cy="396" rx="26" ry="18" fill="#a87948" stroke="#2c1608" stroke-width="6"/>
    </g>
  `),
  prop_scroll: svgUri(`
    <rect x="276" y="352" width="106" height="114" rx="14" fill="#f3e4c3" stroke="#5e3a18" stroke-width="7"/>
    <line x1="296" y1="384" x2="362" y2="384" stroke="#8c6239" stroke-width="5"/>
    <line x1="296" y1="408" x2="362" y2="408" stroke="#8c6239" stroke-width="5"/>
    <line x1="296" y1="432" x2="346" y2="432" stroke="#8c6239" stroke-width="5"/>
  `),
  prop_fork_pipe: svgUri(`
    <path d="M334 328 L334 396 C334 416 368 416 368 396 L368 328" fill="none" stroke="#d4af37" stroke-width="12" stroke-linecap="round"/>
    <line x1="351" y1="412" x2="351" y2="466" stroke="#d4af37" stroke-width="12" stroke-linecap="round"/>
  `),
  prop_lute: svgUri(`
    <g transform="rotate(-24 270 400)">
      <ellipse cx="242" cy="422" rx="72" ry="54" fill="#c27430" stroke="#2c1608" stroke-width="7"/>
      <rect x="300" y="408" width="134" height="26" rx="6" fill="#7c3f18" stroke="#2c1608" stroke-width="6"/>
      <circle cx="242" cy="422" r="18" fill="#2c1608" stroke="#ffe875" stroke-width="4"/>
      <line x1="260" y1="416" x2="424" y2="416" stroke="#ffe875" stroke-width="3"/>
      <line x1="260" y1="426" x2="424" y2="426" stroke="#ffe875" stroke-width="3"/>
    </g>
  `),
  prop_horn_bell: svgUri(`
    <path d="M294 420 Q346 374 396 346 L418 398 Q364 412 308 438 Z" fill="#eab308" stroke="#451a03" stroke-width="7" stroke-linejoin="round"/>
  `),
  prop_baton: svgUri(`
    <line x1="292" y1="454" x2="414" y2="320" stroke="#e2e8f0" stroke-width="10" stroke-linecap="round"/>
    <circle cx="414" cy="320" r="14" fill="#38bdf8" stroke="#0c4a6e" stroke-width="5"/>
  `),
  prop_clockwork_lute: svgUri(`
    <g transform="rotate(-24 270 400)">
      <ellipse cx="242" cy="422" rx="74" ry="56" fill="#b45309" stroke="#1c1208" stroke-width="7"/>
      <rect x="302" y="408" width="136" height="26" rx="6" fill="#334155" stroke="#1c1208" stroke-width="6"/>
      <circle cx="242" cy="422" r="22" fill="#38bdf8" stroke="#ffe875" stroke-width="6" stroke-dasharray="8 4"/>
    </g>
  `),
  prop_arcane_instrument: svgUri(`
    <path d="M292 464 C264 410 278 342 332 326 C386 342 400 410 372 464 Z" fill="none" stroke="#38bdf8" stroke-width="12"/>
    <line x1="312" y1="340" x2="312" y2="458" stroke="#e0f2fe" stroke-width="4"/>
    <line x1="332" y1="334" x2="332" y2="458" stroke="#e0f2fe" stroke-width="4"/>
    <line x1="352" y1="340" x2="352" y2="458" stroke="#e0f2fe" stroke-width="4"/>
  `),
  prop_celestial_lute: svgUri(`
    <g transform="rotate(-24 270 400)">
      <ellipse cx="242" cy="422" rx="76" ry="58" fill="#fde047" stroke="#4c1d95" stroke-width="7"/>
      <rect x="304" y="408" width="142" height="26" rx="6" fill="#4c1d95" stroke="#fde047" stroke-width="5"/>
      <polygon points="242,396 254,414 272,422 254,430 242,448 230,430 212,422 230,414" fill="#c084fc" stroke="#fffbeb" stroke-width="4"/>
    </g>
  `),
};

export type ResolvedPaperDollLayer = {
  key: string;
  src: string;
  filter?: string;
};

export type ResolvedPaperDoll = {
  frame: BardCosmeticItem;
  hair: BardCosmeticItem;
  hat: BardCosmeticItem;
  outfit: BardCosmeticItem;
  prop: BardCosmeticItem;
  layers: ResolvedPaperDollLayer[];
};

function findSlotItem(
  slot: BardCosmeticItem['slot'],
  id?: string
): BardCosmeticItem {
  return (
    BARD_COSMETICS.find((c) => c.slot === slot && c.id === id) ??
    BARD_COSMETICS.find(
      (c) => c.slot === slot && c.id === DEFAULT_BARD_AVATAR[slot]
    )!
  );
}

/**
 * Resolves a BardAvatarConfig into its ordered 512x512 paper-doll layer stack.
 * Shared by both live `<BardAvatar />` DOM rendering and `ResultCard` `<canvas>` export.
 */
export function resolveBardPaperDoll(
  config?: BardAvatarConfig | null
): ResolvedPaperDoll {
  const cfg = config ?? DEFAULT_BARD_AVATAR;
  const frame = findSlotItem('frame', cfg.frame);
  const outfit = findSlotItem('outfit', cfg.outfit ?? cfg.cloak);
  const hair = findSlotItem('hair', cfg.hair);
  const hat = findSlotItem('hat', cfg.hat);
  const prop = findSlotItem('prop', cfg.prop);

  const skin =
    BARD_SKIN_TONES.find((s) => s.id === cfg.skinTone) ?? BARD_SKIN_TONES[1]!;
  const faceId: BardFaceStyleId = BARD_FACE_STYLES.some(
    (f) => f.id === cfg.faceStyle
  )
    ? cfg.faceStyle
    : DEFAULT_BARD_AVATAR.faceStyle;

  const layers: ResolvedPaperDollLayer[] = [
    {
      key: `base_${faceId}`,
      src: BARD_FACE_STYLE_URLS[faceId],
      ...(skin.tintFilter !== 'none' ? { filter: skin.tintFilter } : {}),
    },
  ];

  const pushCosmetic = (item: BardCosmeticItem) => {
    const src = BARD_SILHOUETTE_URLS[item.silhouetteId];
    if (!src) return;
    layers.push({
      key: `${item.slot}_${item.id}`,
      src,
      ...(item.tintFilter ? { filter: item.tintFilter } : {}),
    });
  };

  pushCosmetic(outfit);
  pushCosmetic(hair);
  pushCosmetic(hat);
  pushCosmetic(prop);

  return { frame, hair, hat, outfit, prop, layers };
}
