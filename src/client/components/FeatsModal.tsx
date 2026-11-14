import { useState } from 'react';
import type { KeyboardVoiceId, PlayerProfile, RareFeat } from '../../shared/api';
import {
  FEAT_CATALOG,
  KEYBOARD_VOICES,
  RELIC_CATALOG,
} from '../../shared/constants';
import { soundEngine } from '../audio/soundEngine';
import bountySealUrl from '../assets/bounty-seal.webp';
import nat20SealUrl from '../assets/nat20-seal.webp';

type FeatsModalProps = {
  profile: PlayerProfile;
  onSelectVoice: (voiceId: KeyboardVoiceId) => Promise<void>;
  onClose: () => void;
};

type VaultTab = 'feats' | 'relics' | 'voices';

const RARITY_STYLES: Record<
  'common' | 'uncommon' | 'rare' | 'mythic',
  string
> = {
  common: 'bg-stone-700 text-stone-200 border-stone-500/50',
  uncommon: 'bg-emerald-900 text-emerald-200 border-emerald-500/50',
  rare: 'bg-sky-900 text-sky-200 border-sky-400/60',
  mythic: 'bg-amber-900 text-amber-200 border-amber-400/70',
};

export function FeatsModal({
  profile,
  onSelectVoice,
  onClose,
}: FeatsModalProps) {
  const [tab, setTab] = useState<VaultTab>('relics');
  const [savingVoice, setSavingVoice] = useState<KeyboardVoiceId | null>(null);

  const unlockedFeats = new Set<RareFeat>(profile.feats);
  const unlockedRelics = new Set<string>(profile.relics);
  const featCount = FEAT_CATALOG.filter((f) => unlockedFeats.has(f.id)).length;
  const relicCount = RELIC_CATALOG.filter((r) => unlockedRelics.has(r.id)).length;

  const handlePreviewVoice = (voiceId: KeyboardVoiceId) => {
    soundEngine.unlock();
    const prev = soundEngine.getVoice();
    soundEngine.setVoice(voiceId);
    soundEngine.playNote(60, 220);
    window.setTimeout(() => {
      soundEngine.setVoice(voiceId);
      soundEngine.playNote(64, 220);
    }, 150);
    window.setTimeout(() => {
      soundEngine.setVoice(voiceId);
      soundEngine.playNote(67, 320);
    }, 300);
    window.setTimeout(() => {
      soundEngine.setVoice(prev);
    }, 700);
  };

  const handleEquipVoice = async (voiceId: KeyboardVoiceId) => {
    setSavingVoice(voiceId);
    try {
      await onSelectVoice(voiceId);
      handlePreviewVoice(voiceId);
    } finally {
      setSavingVoice(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="tavern-wood-frame w-full max-w-md rounded-2xl p-4 sm:p-5 flex flex-col gap-3 max-h-[88vh]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <img
              src={bountySealUrl}
              alt=""
              className="w-6 h-6 object-contain"
            />
            <h2 className="font-serif text-lg font-bold text-[#ffe875]">
              Tavern Vault
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

        {/* Tabs */}
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => setTab('relics')}
            className={`py-1.5 px-2 rounded-lg text-[11px] font-bold cursor-pointer ${
              tab === 'relics'
                ? 'gold-btn'
                : 'bg-black/35 text-[#f5ead2]/80 border border-[#d4af37]/30'
            }`}
          >
            🗝️ Relics ({relicCount}/{RELIC_CATALOG.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('voices')}
            className={`py-1.5 px-2 rounded-lg text-[11px] font-bold cursor-pointer ${
              tab === 'voices'
                ? 'gold-btn'
                : 'bg-black/35 text-[#f5ead2]/80 border border-[#d4af37]/30'
            }`}
          >
            🎹 Voices ({KEYBOARD_VOICES.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('feats')}
            className={`py-1.5 px-2 rounded-lg text-[11px] font-bold cursor-pointer ${
              tab === 'feats'
                ? 'gold-btn'
                : 'bg-black/35 text-[#f5ead2]/80 border border-[#d4af37]/30'
            }`}
          >
            🎖️ Feats ({featCount}/{FEAT_CATALOG.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto space-y-2 pr-0.5 flex-1">
          {tab === 'relics' && (
            <>
              <p className="text-[11px] text-[#f5ead2]/80">
                Clear your daily tune to earn a Mystery Chest! Collect relics to
                unlock new piano, organ &amp; synth voices.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {RELIC_CATALOG.map((relic) => {
                  const owned = unlockedRelics.has(relic.id);
                  return (
                    <div
                      key={relic.id}
                      className={`rounded-xl p-2.5 flex items-center gap-2 border ${
                        owned
                          ? 'parchment-card border-[#d4af37]'
                          : 'bg-black/40 border-[#d4af37]/20 opacity-60'
                      }`}
                    >
                      <span
                        className={`text-xl shrink-0 ${owned ? '' : 'grayscale opacity-50'}`}
                      >
                        {owned ? relic.icon : '❔'}
                      </span>
                      <div className="min-w-0">
                        <p
                          className={`text-[11px] font-bold truncate ${
                            owned ? 'text-[#1c1208]' : 'text-[#f5ead2]/75'
                          }`}
                        >
                          {owned ? relic.name : 'Unknown Relic'}
                        </p>
                        <span
                          className={`inline-block mt-0.5 text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${RARITY_STYLES[relic.rarity]}`}
                        >
                          {relic.rarity}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {tab === 'voices' &&
            KEYBOARD_VOICES.map((voice) => {
              const unlocked = relicCount >= voice.unlockRelics;
              const equipped = profile.selectedVoice === voice.id;
              return (
                <div
                  key={voice.id}
                  className={`rounded-xl px-3 py-2.5 flex items-center justify-between gap-2 border ${
                    unlocked
                      ? 'parchment-card border-[#d4af37]'
                      : 'bg-black/40 border-[#d4af37]/20 opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xl shrink-0">{voice.icon}</span>
                    <div className="min-w-0">
                      <p
                        className={`text-xs font-bold ${
                          unlocked ? 'text-[#1c1208]' : 'text-[#f5ead2]/80'
                        }`}
                      >
                        {voice.name}
                      </p>
                      <p
                        className={`text-[11px] ${
                          unlocked ? 'text-[#6e4726]' : 'text-[#f5ead2]/55'
                        }`}
                      >
                        {unlocked
                          ? voice.description
                          : `Unlock at ${voice.unlockRelics} relics (${relicCount}/${voice.unlockRelics})`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handlePreviewVoice(voice.id)}
                      className="text-[11px] px-2 py-1 rounded-lg bg-[#2c1b0e] hover:bg-[#3e2614] text-[#ffe875] border border-[#9c7538] cursor-pointer"
                    >
                      🔊 Try
                    </button>
                    {unlocked && (
                      <button
                        type="button"
                        disabled={equipped || savingVoice === voice.id}
                        onClick={() => void handleEquipVoice(voice.id)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg font-bold cursor-pointer ${
                          equipped
                            ? 'bg-[#103524] text-[#ffe875] border border-[#2f6f4e]'
                            : 'gold-btn'
                        }`}
                      >
                        {equipped
                          ? '✓ Active'
                          : savingVoice === voice.id
                            ? '...'
                            : 'Equip'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

          {tab === 'feats' &&
            FEAT_CATALOG.map((feat) => {
              const isUnlocked = unlockedFeats.has(feat.id);
              return (
                <div
                  key={feat.id}
                  className={`rounded-xl px-3 py-2.5 flex items-center gap-3 border ${
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
