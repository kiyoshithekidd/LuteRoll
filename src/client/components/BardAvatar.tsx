import { FEAT_CATALOG, RELIC_CATALOG } from '../../shared/constants';
import {
  DEFAULT_BARD_AVATAR,
  getAuraVfxTier,
  type BardAvatarConfig,
} from '../../shared/cosmetics';
import { resolveBardPaperDoll } from '../assets/bardLayerAssets';

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
  const resolved = resolveBardPaperDoll(cfg);
  const { frame, layers } = resolved;

  const badgeIcon = resolveBadgeIcon(cfg.badgeId);
  const vfxTier = getAuraVfxTier(frame.id);
  const glowShadow =
    vfxTier === 'mythic'
      ? `0 0 18px ${frame.accentColor}, 0 0 6px #ffffffaa`
      : vfxTier === 'rare'
        ? `0 0 13px ${frame.accentColor}cc, 0 2px 6px rgba(0,0,0,0.65)`
        : '0 2px 6px rgba(0,0,0,0.65)';

  const backdropStyle = {
    background:
      vfxTier === 'mythic'
        ? `radial-gradient(circle at 50% 35%, ${frame.accentColor}55 0%, ${frame.primaryColor} 68%, #09050e 100%)`
        : vfxTier === 'rare'
          ? `radial-gradient(circle at 50% 38%, ${frame.accentColor}38 0%, ${frame.primaryColor} 76%)`
          : `radial-gradient(circle at 50% 38%, ${frame.accentColor}1c 0%, ${frame.primaryColor} 82%)`,
    borderColor: frame.accentColor,
    boxShadow: glowShadow,
  };

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

      {cfg.useSnoovatar && snoovatarUrl ? (
        <img
          src={snoovatarUrl}
          alt="Bard Avatar"
          style={{
            borderColor: frame.accentColor,
            boxShadow: glowShadow,
          }}
          className={`relative ${SIZE_CLASSES[size]} rounded-full object-cover border-2 bg-[#1c1208]`}
        />
      ) : (
        <div
          role="img"
          aria-label="Custom Modular Bard Avatar"
          style={backdropStyle}
          className={`relative ${SIZE_CLASSES[size]} rounded-full overflow-hidden border-2 select-none`}
        >
          {layers.map((layer) => (
            <img
              key={layer.key}
              src={layer.src}
              alt=""
              draggable={false}
              style={layer.filter ? { filter: layer.filter } : undefined}
              className="pointer-events-none absolute inset-0 w-full h-full object-contain"
            />
          ))}
        </div>
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
