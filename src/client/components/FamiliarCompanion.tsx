import {
  BARD_FAMILIARS,
  type BardFamiliarId,
} from '../../shared/cosmetics';
import { FAMILIAR_URLS } from '../assets/familiarAssets';

type FamiliarCompanionProps = {
  familiarId?: BardFamiliarId | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  mood?: 'idle' | 'cheer' | 'tomato';
  showLabel?: boolean;
  className?: string;
};

const SIZE_CLASSES: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'w-12 h-12',
  md: 'w-14 h-14',
  lg: 'w-16 h-16',
};

export function FamiliarCompanion({
  familiarId,
  size = 'md',
  mood = 'idle',
  showLabel = false,
  className = '',
}: FamiliarCompanionProps) {
  if (!familiarId || familiarId === 'none' || !(familiarId in FAMILIAR_URLS)) {
    return null;
  }

  const meta = BARD_FAMILIARS.find((f) => f.id === familiarId);
  const imgUrl = FAMILIAR_URLS[familiarId];
  const moodBadge =
    mood === 'cheer' ? '✨' : mood === 'tomato' ? '🍅' : null;
  const animClass =
    mood === 'cheer'
      ? 'animate-bounce'
      : mood === 'tomato'
        ? 'animate-stage-shake'
        : '';

  return (
    <div
      className={`inline-flex flex-col items-center shrink-0 select-none ${className}`}
      title={meta?.name ?? 'Bard Familiar'}
    >
      <div className={`relative ${animClass}`}>
        <img
          src={imgUrl}
          alt={meta?.name ?? 'Bard Familiar'}
          className={`${SIZE_CLASSES[size]} rounded-full object-cover border-2 border-[#d4af37] bg-[#1c1208] shadow-[0_4px_12px_rgba(0,0,0,0.65)]`}
        />
        {moodBadge && (
          <span
            aria-hidden="true"
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#1c1208] border border-[#ffe875] flex items-center justify-center text-[10px] shadow"
          >
            {moodBadge}
          </span>
        )}
      </div>
      {showLabel && meta && (
        <span className="mt-0.5 text-[10px] font-semibold text-[#ffe875]/90 max-w-[76px] truncate">
          {meta.name}
        </span>
      )}
    </div>
  );
}
