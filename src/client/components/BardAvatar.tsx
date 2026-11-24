import {
  BARD_COSMETICS,
  BARD_SKIN_TONES,
  DEFAULT_BARD_AVATAR,
  type BardAvatarConfig,
} from '../../shared/cosmetics';

type BardAvatarProps = {
  config?: BardAvatarConfig | null | undefined;
  snoovatarUrl?: string | null | undefined;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
};

const SIZE_CLASSES: Record<'xs' | 'sm' | 'md' | 'lg', string> = {
  xs: 'w-6 h-6',
  sm: 'w-7 h-7',
  md: 'w-10 h-10',
  lg: 'w-20 h-20',
};

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
  const cloak =
    BARD_COSMETICS.find((c) => c.slot === 'cloak' && c.id === cfg.cloak) ??
    BARD_COSMETICS.find((c) => c.id === DEFAULT_BARD_AVATAR.cloak)!;
  const hat =
    BARD_COSMETICS.find((c) => c.slot === 'hat' && c.id === cfg.hat) ??
    BARD_COSMETICS.find((c) => c.id === DEFAULT_BARD_AVATAR.hat)!;
  const prop =
    BARD_COSMETICS.find((c) => c.slot === 'prop' && c.id === cfg.prop) ??
    BARD_COSMETICS.find((c) => c.id === DEFAULT_BARD_AVATAR.prop)!;
  const skin =
    BARD_SKIN_TONES.find((s) => s.id === cfg.skinTone) ?? BARD_SKIN_TONES[1]!;

  if (cfg.useSnoovatar && snoovatarUrl) {
    return (
      <img
        src={snoovatarUrl}
        alt="Bard Avatar"
        style={{ borderColor: frame.accentColor }}
        className={`${SIZE_CLASSES[size]} rounded-full object-cover border-2 bg-black/40 shrink-0 ${className}`}
      />
    );
  }

  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label="Custom Bard Avatar"
      className={`${SIZE_CLASSES[size]} rounded-full shrink-0 shadow-md ${className}`}
    >
      {/* Frame / Backdrop */}
      <circle cx="32" cy="32" r="31" fill={frame.primaryColor} />
      {(frame.shape === 'glow' || frame.shape === 'halo' || frame.shape === 'aura') && (
        <circle
          cx="32"
          cy="30"
          r="24"
          fill={frame.accentColor}
          fillOpacity={frame.shape === 'halo' ? 0.24 : 0.16}
        />
      )}
      {frame.shape === 'halo' && (
        <circle
          cx="32"
          cy="30"
          r="21"
          fill="none"
          stroke={frame.accentColor}
          strokeWidth="1.5"
          strokeDasharray="3 3"
          strokeOpacity="0.85"
        />
      )}
      {(frame.shape === 'spark' || frame.shape === 'halo') && (
        <g fill={frame.accentColor} fillOpacity="0.9">
          <circle cx="14" cy="18" r="1.4" />
          <circle cx="50" cy="16" r="1.6" />
          <circle cx="48" cy="44" r="1.2" />
          <circle cx="15" cy="42" r="1.2" />
        </g>
      )}

      {/* Side Prop (peeking behind right shoulder) */}
      <g>
        {prop.shape === 'lute' && (
          <g transform="translate(46 34) rotate(18)">
            <rect x="-1.5" y="-14" width="3" height="14" rx="1" fill="#4a2810" />
            <ellipse cx="0" cy="5" rx="6.5" ry="8" fill={prop.primaryColor} stroke={prop.accentColor} strokeWidth="1" />
            <circle cx="0" cy="4" r="2.2" fill="#2c1608" />
          </g>
        )}
        {prop.shape === 'scroll' && (
          <g transform="translate(48 38) rotate(14)">
            <rect x="-4" y="-9" width="8" height="18" rx="2" fill={prop.primaryColor} stroke={prop.accentColor} strokeWidth="1.2" />
            <line x1="-2" y1="-4" x2="2" y2="-4" stroke={prop.accentColor} strokeWidth="1" />
            <line x1="-2" y1="0" x2="2" y2="0" stroke={prop.accentColor} strokeWidth="1" />
            <line x1="-2" y1="4" x2="2" y2="4" stroke={prop.accentColor} strokeWidth="1" />
          </g>
        )}
        {prop.shape === 'fork' && (
          <g transform="translate(49 36) rotate(16)" stroke={prop.primaryColor} strokeWidth="2.2" fill="none" strokeLinecap="round">
            <path d="M-3 -10 V-2 Q0 2 3 -2 V-10" />
            <line x1="0" y1="1" x2="0" y2="11" />
          </g>
        )}
        {prop.shape === 'metro' && (
          <g transform="translate(49 41)">
            <polygon points="0,-10 -6,6 6,6" fill={prop.primaryColor} stroke={prop.accentColor} strokeWidth="1" />
            <line x1="0" y1="4" x2="4" y2="-7" stroke={prop.accentColor} strokeWidth="1.4" />
          </g>
        )}
        {prop.shape === 'horn' && (
          <g transform="translate(49 37) rotate(22)">
            <path d="M-4 8 Q-2 0 4 -9 L8 -5 Q1 2 0 9 Z" fill={prop.primaryColor} stroke={prop.accentColor} strokeWidth="1" />
          </g>
        )}
        {prop.shape === 'quill' && (
          <g transform="translate(49 35) rotate(20)">
            <path d="M0 -12 Q6 -4 1 8 Q-4 -2 0 -12 Z" fill={prop.primaryColor} stroke={prop.accentColor} strokeWidth="1" />
            <line x1="0" y1="-8" x2="0" y2="11" stroke={prop.accentColor} strokeWidth="1.2" />
          </g>
        )}
        {prop.shape === 'bell' && (
          <g transform="translate(49 38)">
            <path d="M-5 5 Q-5 -5 0 -7 Q5 -5 5 5 Z" fill={prop.primaryColor} stroke={prop.accentColor} strokeWidth="1.2" />
            <circle cx="0" cy="6" r="1.8" fill={prop.accentColor} />
          </g>
        )}
        {prop.shape === 'baton' && (
          <g transform="translate(49 36) rotate(24)">
            <line x1="0" y1="-12" x2="0" y2="10" stroke={prop.primaryColor} strokeWidth="2" strokeLinecap="round" />
            <circle cx="0" cy="-12" r="2.2" fill={prop.accentColor} />
          </g>
        )}
        {prop.shape === 'gear' && (
          <g transform="translate(49 39)">
            <circle cx="0" cy="0" r="6" fill={prop.primaryColor} stroke={prop.accentColor} strokeWidth="1.8" strokeDasharray="2.5 2" />
            <circle cx="0" cy="0" r="2.2" fill={frame.primaryColor} />
          </g>
        )}
      </g>

      {/* Cloak / Shoulders */}
      <path
        d="M10 62 C11 46 20 41 32 41 C44 41 53 46 54 62 Z"
        fill={cloak.primaryColor}
      />
      {(cloak.shape === 'trim' || cloak.shape === 'royal' || cloak.shape === 'astral') && (
        <path
          d="M20 43 L32 54 L44 43"
          fill="none"
          stroke={cloak.accentColor}
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      )}
      {cloak.shape === 'collared' && (
        <path
          d="M23 41 L32 49 L41 41"
          fill={cloak.accentColor}
          fillOpacity="0.85"
        />
      )}
      {(cloak.shape === 'royal' || cloak.shape === 'astral') && (
        <g fill={cloak.accentColor}>
          <circle cx="21" cy="46" r="2.3" />
          <circle cx="43" cy="46" r="2.3" />
        </g>
      )}
      {cloak.shape === 'astral' && (
        <g fill={cloak.accentColor} fillOpacity="0.9">
          <circle cx="26" cy="55" r="1.1" />
          <circle cx="38" cy="56" r="1.1" />
          <circle cx="32" cy="58" r="1.3" />
        </g>
      )}

      {/* Neck & Head */}
      <rect x="28" y="36" width="8" height="7" rx="3" fill={skin.shade} />
      <circle cx="32" cy="29" r="11.5" fill={skin.fill} />
      {/* Subtle hair tuft */}
      <path
        d="M21 26 C22 18 42 18 43 26 C40 22 24 22 21 26 Z"
        fill="#3b2314"
      />
      {/* Friendly Eyes & Bard Smirk */}
      <circle cx="27.8" cy="29.5" r="1.5" fill="#1c1208" />
      <circle cx="36.2" cy="29.5" r="1.5" fill="#1c1208" />
      <path
        d="M28.5 34 Q32 36.8 35.5 34"
        fill="none"
        stroke="#5c2c16"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Hat / Headgear */}
      {hat.shape === 'feather' && (
        <g>
          <path d="M18 23 Q32 10 46 23 Q32 19 18 23 Z" fill={hat.primaryColor} />
          <path d="M40 18 Q48 8 51 11 Q46 16 42 20 Z" fill={hat.accentColor} />
        </g>
      )}
      {hat.shape === 'hood' && (
        <path
          d="M17 31 C16 14 48 14 47 31 C44 21 20 21 17 31 Z"
          fill={hat.primaryColor}
          stroke={hat.accentColor}
          strokeWidth="1.2"
        />
      )}
      {hat.shape === 'beret' && (
        <g>
          <ellipse cx="32" cy="18" rx="14" ry="6.5" fill={hat.primaryColor} />
          <circle cx="39" cy="17" r="2.2" fill={hat.accentColor} />
        </g>
      )}
      {hat.shape === 'circlet' && (
        <g>
          <path
            d="M21 22 Q32 18 43 22"
            fill="none"
            stroke={hat.primaryColor}
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <polygon points="32,16 34.5,20 32,23 29.5,20" fill={hat.accentColor} />
        </g>
      )}
      {hat.shape === 'wizard' && (
        <g>
          <ellipse cx="32" cy="21" rx="15" ry="3.5" fill={hat.primaryColor} />
          <polygon points="32,5 21,21 43,21" fill={hat.primaryColor} />
          <rect x="24" y="18" width="16" height="2.4" rx="1" fill={hat.accentColor} />
        </g>
      )}
      {hat.shape === 'tricorne' && (
        <g>
          <path
            d="M16 22 Q32 8 48 22 L42 24 Q32 19 22 24 Z"
            fill={hat.primaryColor}
            stroke={hat.accentColor}
            strokeWidth="1.3"
          />
          <circle cx="32" cy="16" r="2" fill={hat.accentColor} />
        </g>
      )}
      {hat.shape === 'crown' && (
        <g>
          <polygon
            points="20,22 22,12 27,17 32,9 37,17 42,12 44,22"
            fill={hat.primaryColor}
            stroke={hat.accentColor}
            strokeWidth="1.2"
          />
          <circle cx="32" cy="16.5" r="1.8" fill={hat.accentColor} />
        </g>
      )}

      {/* Outer Frame Border */}
      <circle
        cx="32"
        cy="32"
        r="30.5"
        fill="none"
        stroke={frame.accentColor}
        strokeWidth={frame.shape === 'ring' || frame.shape === 'halo' ? 2.8 : 2}
      />
    </svg>
  );
}
