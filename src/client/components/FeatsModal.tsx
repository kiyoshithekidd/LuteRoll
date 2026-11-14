import type { RareFeat } from '../../shared/api';
import { FEAT_CATALOG } from '../../shared/constants';
import bountySealUrl from '../assets/bounty-seal.webp';
import nat20SealUrl from '../assets/nat20-seal.webp';

type FeatsModalProps = {
  unlocked: RareFeat[];
  onClose: () => void;
};

export function FeatsModal({ unlocked, onClose }: FeatsModalProps) {
  const unlockedSet = new Set(unlocked);
  const count = FEAT_CATALOG.filter((f) => unlockedSet.has(f.id)).length;
  const pct = Math.round((count / FEAT_CATALOG.length) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="tavern-wood-frame w-full max-w-md rounded-2xl p-4 sm:p-5 flex flex-col gap-3.5 max-h-[88vh]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <img
              src={bountySealUrl}
              alt=""
              className="w-6 h-6 object-contain"
            />
            <h2 className="font-serif text-lg font-bold text-[#ffe875]">
              Tavern Trophy Case
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs px-2.5 py-1 rounded-lg bg-black/45 hover:bg-black/65 border border-[#d4af37]/40 text-[#ffe875] cursor-pointer"
          >
            Close
          </button>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-[#ffe875]/90 font-semibold">
            <span>Collectible Feats</span>
            <span>
              {count} / {FEAT_CATALOG.length} ({pct}%)
            </span>
          </div>
          <div className="h-2 rounded-full bg-black/50 overflow-hidden border border-[#d4af37]/30">
            <div
              className="h-full bg-gradient-to-r from-[#d4af37] to-[#fff099] transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="overflow-y-auto space-y-2 pr-0.5">
          {FEAT_CATALOG.map((feat) => {
            const isUnlocked = unlockedSet.has(feat.id);
            return (
              <div
                key={feat.id}
                className={`rounded-xl px-3 py-2.5 flex items-center gap-3 border transition-colors ${
                  isUnlocked
                    ? 'parchment-card border-[#d4af37]'
                    : 'bg-black/40 border-[#d4af37]/20 opacity-65'
                }`}
              >
                {isUnlocked && feat.id === 'nat20' ? (
                  <img
                    src={nat20SealUrl}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover border border-[#d4af37] shrink-0"
                  />
                ) : (
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0 border ${
                      isUnlocked
                        ? 'bg-[#2c1b0e] border-[#d4af37] text-[#ffe875]'
                        : 'bg-black/60 border-white/15 text-white/40 grayscale'
                    }`}
                  >
                    {isUnlocked ? feat.icon : '🔒'}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p
                    className={`text-xs font-bold ${
                      isUnlocked ? 'text-[#1c1208]' : 'text-[#f5ead2]/80'
                    }`}
                  >
                    {feat.title}
                  </p>
                  <p
                    className={`text-[11px] ${
                      isUnlocked ? 'text-[#6e4726]' : 'text-[#f5ead2]/55'
                    }`}
                  >
                    {feat.description}
                  </p>
                </div>

                {isUnlocked && (
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#103524] text-[#ffe875] shrink-0">
                    Earned
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
