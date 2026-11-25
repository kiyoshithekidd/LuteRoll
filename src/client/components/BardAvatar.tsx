import { FEAT_CATALOG, RELIC_CATALOG } from '../../shared/constants';
import {
  BARD_COSMETICS,
  DEFAULT_BARD_AVATAR,
  getAuraVfxTier,
  type BardAvatarConfig,
  type BardPortraitId,
} from '../../shared/cosmetics';
import { BARD_PORTRAIT_URLS } from '../assets/bardPortraits';
import { FAMILIAR_URLS } from '../assets/familiarAssets';

type BardAvatarProps = {
  config?: BardAvatarConfig | null | undefined;
  snoovatarUrl?: string | null | undefined;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
};

const SIZE_CLASSES: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', string> = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-11 h-11',
  lg: 'w-20 h-20',
  xl: 'w-24 h-24',
};

const BADGE_SIZE_CLASSES: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', string> = {
  xs: 'w-3 h-3 text-[7px] -bottom-0.5 -right-0.5',
  sm: 'w-4 h-4 text-[9px] -bottom-0.5 -right-0.5',
  md: 'w-5 h-5 text-[10px] -bottom-1 -right-1',
  lg: 'w-7 h-7 text-sm -bottom-1 -right-1',
  xl: 'w-7 h-7 text-sm -bottom-1 -right-1',
};

const FAMILIAR_SIZE_CLASSES: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', string> = {
  xs: 'hidden',
  sm: 'w-4 h-4 -top-0.5 -left-0.5',
  md: 'w-5 h-5 -top-1 -left-1',
  lg: 'w-8 h-8 -top-1 -left-1',
  xl: 'w-9 h-9 -top-1 -left-1',
};

function resolveBadgeIcon(badgeId?: string | null): string | null {
  if (!badgeId) return null;
  if (badgeId.startsWith('relic:')) {
    const id = badgeId.slice(6);
    return RELIC_CATALOG.find((r) => r.id === id)?.icon ?? null;
  }
  if (badgeId.startsWith('feat:')) {
    const id = badgeId.slice(5);
    return FEAT_CATALOG.find((f) => f.id === id)?.icon ?? null;
  }
  return null;
}

export function BardAvatar({
  config,
  snoovatarUrl,
  size = 'sm',
  className = '',
}: BardAvatarProps) {
  const cfg = config ?? DEFAULT_BARD_AVATAR;

  const frame =
    BARD_COSMETICS.find((c) => c.slot === 'frame' && c.id === cfg.frame) ??
    BARD_COSMETICS.find((c) => c.id === DEFAULT_BARD_AVATAR.frame)!;

  const portraitId: BardPortraitId =
    cfg.portrait && cfg.portrait in BARD_PORTRAIT_URLS
      ? cfg.portrait
      : 'busker';
  const imgSrc =
    cfg.useSnoovatar && snoovatarUrl
      ? snoovatarUrl
      : BARD_PORTRAIT_URLS[portraitId];

  const familiarUrl =
    cfg.familiar && cfg.familiar !== 'none' && cfg.familiar in FAMILIAR_URLS
      ? FAMILIAR_URLS[cfg.familiar]
      : null;

  const badgeIcon = resolveBadgeIcon(cfg.badgeId);
  const vfxTier = getAuraVfxTier(frame.id);
  const glowShadow =
    vfxTier === 'mythic'
      ? `0 0 18px ${frame.accentColor}, 0 0 6px #ffffffaa`
      : vfxTier === 'rare'
        ? `0 0 13px ${frame.accentColor}cc, 0 2px 6px rgba(0,0,0,0.65)`
        : '0 2px 6px rgba(0,0,0,0.65)';

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {vfxTier === 'rare' && size !== 'xs' && (
        <span
          aria-hidden="true"
          style={{ borderColor: frame.accentColor }}
          className="animate-aura-rare pointer-events-none absolute -inset-1 rounded-full border opacity-75"
        />
      )}
      {vfxTier === 'mythic' && size !== 'xs' && (
        <span
          aria-hidden="true"
          style={{
            borderColor: frame.accentColor,
            boxShadow: `0 0 12px ${frame.accentColor}99`,
          }}
          className="animate-aura-mythic pointer-events-none absolute -inset-1.5 rounded-full border-2 border-dashed opacity-90"
        />
      )}
      <img
        src={imgSrc}
        alt="Bard Avatar"
        style={{
          borderColor: frame.accentColor,
          boxShadow: glowShadow,
        }}
        className={`relative ${SIZE_CLASSES[size]} rounded-full object-cover border-2 bg-[#1c1208]`}
      />
      {familiarUrl && size !== 'xs' && (
        <img
          src={familiarUrl}
          alt="Bard Familiar"
          style={{ borderColor: frame.accentColor }}
          className={`absolute ${FAMILIAR_SIZE_CLASSES[size]} rounded-full object-cover border-2 bg-[#1c1208] shadow-md`}
        />
      )}
      {badgeIcon && (
        <span
          aria-hidden="true"
          style={{ borderColor: frame.accentColor }}
          className={`absolute ${BADGE_SIZE_CLASSES[size]} rounded-full bg-[#1c1208] border flex items-center justify-center leading-none shadow`}
        >
          {badgeIcon}
        </span>
      )}
    </div>
  );
}
