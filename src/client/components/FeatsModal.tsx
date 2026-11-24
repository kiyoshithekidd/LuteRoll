import { useEffect, useRef, useState } from 'react';
import type { KeyboardVoiceId, PlayerProfile, RareFeat } from '../../shared/api';
import {
  DUPE_PITY_THRESHOLD,
  FEAT_CATALOG,
  KEYBOARD_VOICES,
  RELIC_CATALOG,
} from '../../shared/constants';
import {
  BARD_COSMETICS,
  BARD_SKIN_TONES,
  getCosmeticForFeat,
  getCosmeticForRelic,
  isCosmeticUnlocked,
  KEYBOARD_SKIN_THEMES,
  type BardAvatarConfig,
  type BardCosmeticSlot,
} from '../../shared/cosmetics';
import { soundEngine } from '../audio/soundEngine';
import bountySealUrl from '../assets/bounty-seal.webp';
import nat20SealUrl from '../assets/nat20-seal.webp';
import { BardAvatar } from './BardAvatar';

type FeatsModalProps = {
  profile: PlayerProfile;
  onSelectVoice: (voiceId: KeyboardVoiceId) => Promise<void>;
  onSaveAvatar: (config: BardAvatarConfig) => Promise<void>;
  onClose: () => void;
};

type VaultTab = 'relics' | 'voices' | 'bard' | 'feats';
type BardCategory = BardCosmeticSlot | 'tone';

const RARITY_STYLES: Record<
  'common' | 'uncommon' | 'rare' | 'mythic',
  string
> = {
  common: 'bg-stone-700 text-stone-200 border-stone-500/50',
  uncommon: 'bg-emerald-900 text-emerald-200 border-emerald-500/50',
  rare: 'bg-sky-900 text-sky-200 border-sky-400/60',
  mythic: 'bg-amber-900 text-amber-200 border-amber-400/70',
};

const SLOT_LABELS: Record<BardCosmeticSlot, string> = {
  hat: 'Hat',
  cloak: 'Cloak',
  prop: 'Prop',
  frame: 'Aura',
};

export function FeatsModal({
  profile,
  onSelectVoice,
  onSaveAvatar,
  onClose,
}: FeatsModalProps) {
  const [tab, setTab] = useState<VaultTab>('bard');
  const [bardCat, setBardCat] = useState<BardCategory>('hat');
  const [savingVoice, setSavingVoice] = useState<KeyboardVoiceId | null>(null);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const previewTimersRef = useRef<number[]>([]);

  const clearPreviewTimers = () => {
    for (const id of previewTimersRef.current) {
      window.clearTimeout(id);
    }
    previewTimersRef.current = [];
  };

  useEffect(() => {
    return () => {
      clearPreviewTimers();
    };
  }, []);

  const unlockedFeats = new Set<RareFeat>(profile.feats);
  const unlockedRelics = new Set<string>(profile.relics);
  const featCount = FEAT_CATALOG.filter((f) => unlockedFeats.has(f.id)).length;
  const relicCount = RELIC_CATALOG.filter((r) => unlockedRelics.has(r.id)).length;

  const handlePreviewVoice = (voiceId: KeyboardVoiceId) => {
    soundEngine.unlock();
    clearPreviewTimers();
    soundEngine.playNote(60, 220, voiceId);
    const t1 = window.setTimeout(() => {
      soundEngine.playNote(64, 220, voiceId);
    }, 150);
    const t2 = window.setTimeout(() => {
      soundEngine.playNote(67, 320, voiceId);
    }, 300);
    previewTimersRef.current.push(t1, t2);
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

  const handleUpdateAvatar = async (patch: Partial<BardAvatarConfig>) => {
    if (savingAvatar) return;
    setSavingAvatar(true);
    try {
      await onSaveAvatar({
        ...profile.bardAvatar,
        ...patch,
      });
    } finally {
      setSavingAvatar(false);
    }
  };

  const getUnlockHint = (
    relicId: string | null,
    featId?: RareFeat | null
  ): string => {
    if (relicId) {
      const r = RELIC_CATALOG.find((x) => x.id === relicId);
      return r ? `Relic: ${r.name}` : 'Mystery Chest Relic';
    }
    if (featId) {
      const f = FEAT_CATALOG.find((x) => x.id === featId);
      return f ? `Feat: ${f.title}` : 'Rare Feat';
    }
    return 'Starter';
  };

  const unlockedWearablesCount = BARD_COSMETICS.filter((c) =>
    isCosmeticUnlocked(c, profile.relics, profile.feats)
  ).length;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Tavern Vault"
    >
      <div className="tavern-wood-frame w-full max-w-md rounded-2xl p-3.5 sm:p-5 flex flex-col gap-3 max-h-[90vh]">
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

        {/* 4 Tabs */}
        <div className="grid grid-cols-4 gap-1">
          <button
            type="button"
            onClick={() => setTab('bard')}
            className={`py-1.5 px-1 rounded-lg text-[10px] sm:text-[11px] font-bold cursor-pointer ${
              tab === 'bard'
                ? 'gold-btn'
                : 'bg-black/35 text-[#f5ead2]/80 border border-[#d4af37]/30'
            }`}
          >
            🎭 Bard
          </button>
          <button
            type="button"
            onClick={() => setTab('voices')}
            className={`py-1.5 px-1 rounded-lg text-[10px] sm:text-[11px] font-bold cursor-pointer ${
              tab === 'voices'
                ? 'gold-btn'
                : 'bg-black/35 text-[#f5ead2]/80 border border-[#d4af37]/30'
            }`}
          >
            🎹 Skins
          </button>
          <button
            type="button"
            onClick={() => setTab('relics')}
            className={`py-1.5 px-1 rounded-lg text-[10px] sm:text-[11px] font-bold cursor-pointer ${
              tab === 'relics'
                ? 'gold-btn'
                : 'bg-black/35 text-[#f5ead2]/80 border border-[#d4af37]/30'
            }`}
          >
            🗝️ {relicCount}/{RELIC_CATALOG.length}
          </button>
          <button
            type="button"
            onClick={() => setTab('feats')}
            className={`py-1.5 px-1 rounded-lg text-[10px] sm:text-[11px] font-bold cursor-pointer ${
              tab === 'feats'
                ? 'gold-btn'
                : 'bg-black/35 text-[#f5ead2]/80 border border-[#d4af37]/30'
            }`}
          >
            🎖️ {featCount}/{FEAT_CATALOG.length}
          </button>
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto space-y-2.5 pr-0.5 flex-1">
          {tab === 'bard' && (
            <>
              {/* Live Bard Preview */}
              <div className="parchment-card rounded-xl p-3 flex items-center gap-3">
                <BardAvatar
                  config={profile.bardAvatar}
                  snoovatarUrl={profile.snoovatarUrl}
                  size="lg"
                />
                <div className="min-w-0 flex-1 space-y-1 text-left">
                  <p className="font-serif text-sm font-bold text-[#1c1208] truncate">
                    {profile.username}
                  </p>
                  <p className="text-[11px] text-[#6e4726]">
                    Shown in HUD &amp; Community Leaderboards •{' '}
                    <strong>
                      {unlockedWearablesCount}/{BARD_COSMETICS.length}
                    </strong>{' '}
                    unlocked
                  </p>
                  {profile.snoovatarUrl && (
                    <button
                      type="button"
                      disabled={savingAvatar}
                      onClick={() =>
                        void handleUpdateAvatar({
                          useSnoovatar: !profile.bardAvatar.useSnoovatar,
                        })
                      }
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#2c1b0e] text-[#ffe875] border border-[#9c7538] cursor-pointer"
                    >
                      {profile.bardAvatar.useSnoovatar
                        ? '🎭 Switch to Custom Bard'
                        : '👤 Use Reddit Snoovatar'}
                    </button>
                  )}
                </div>
              </div>

              {/* Category Pills */}
              <div className="grid grid-cols-5 gap-1">
                {(
                  [
                    ['hat', '🎩 Hat'],
                    ['cloak', '🧥 Cloak'],
                    ['prop', '🪕 Prop'],
                    ['frame', '✨ Aura'],
                    ['tone', '🎨 Tone'],
                  ] as const
                ).map(([cat, label]) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setBardCat(cat)}
                    className={`py-1 px-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                      bardCat === cat
                        ? 'bg-[#103524] text-[#ffe875] border border-[#ffe875]'
                        : 'bg-black/35 text-[#f5ead2]/75 border border-[#d4af37]/25'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Category Items */}
              {bardCat === 'tone' ? (
                <div className="grid grid-cols-5 gap-2">
                  {BARD_SKIN_TONES.map((tone) => {
                    const active = profile.bardAvatar.skinTone === tone.id;
                    return (
                      <button
                        key={tone.id}
                        type="button"
                        disabled={savingAvatar}
                        onClick={() =>
                          void handleUpdateAvatar({
                            skinTone: tone.id,
                            useSnoovatar: false,
                          })
                        }
                        className={`rounded-xl p-2 flex flex-col items-center gap-1 border cursor-pointer ${
                          active
                            ? 'parchment-card border-[#ffe875]'
                            : 'bg-black/40 border-[#d4af37]/25 text-[#f5ead2]'
                        }`}
                      >
                        <span
                          className="w-7 h-7 rounded-full border border-black/30"
                          style={{ backgroundColor: tone.fill }}
                        />
                        <span className="text-[9px] font-bold truncate w-full text-center">
                          {tone.name.split(' ').pop()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-1.5">
                  {BARD_COSMETICS.filter((c) => c.slot === bardCat).map(
                    (item) => {
                      const unlocked = isCosmeticUnlocked(
                        item,
                        profile.relics,
                        profile.feats
                      );
                      const equipped =
                        !profile.bardAvatar.useSnoovatar &&
                        profile.bardAvatar[bardCat] === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          disabled={!unlocked || savingAvatar}
                          onClick={() =>
                            void handleUpdateAvatar({
                              [bardCat]: item.id,
                              useSnoovatar: false,
                            })
                          }
                          className={`rounded-xl p-2 flex items-center gap-2 text-left border transition-colors ${
                            equipped
                              ? 'bg-[#103524] border-[#ffe875] text-[#ffe875]'
                              : unlocked
                                ? 'parchment-card border-[#d4af37] cursor-pointer hover:brightness-105'
                                : 'bg-black/40 border-[#d4af37]/20 opacity-60 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex flex-col gap-0.5 shrink-0">
                            <span
                              className="w-5 h-5 rounded-full border border-black/30 flex items-center justify-center text-[10px]"
                              style={{
                                backgroundColor: item.primaryColor,
                                borderColor: item.accentColor,
                              }}
                            >
                              {!unlocked ? '🔒' : equipped ? '✓' : ''}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p
                              className={`text-[11px] font-bold truncate ${
                                equipped
                                  ? 'text-[#ffe875]'
                                  : unlocked
                                    ? 'text-[#1c1208]'
                                    : 'text-[#f5ead2]/75'
                              }`}
                            >
                              {item.name}
                            </p>
                            <p
                              className={`text-[9px] truncate ${
                                equipped
                                  ? 'text-[#ffe875]/80'
                                  : unlocked
                                    ? 'text-[#6e4726]'
                                    : 'text-[#f5ead2]/55'
                              }`}
                            >
                              {unlocked
                                ? item.unlockFeatId
                                  ? 'Feat Exclusive'
                                  : item.unlockRelicId
                                    ? 'Relic Unlocked'
                                    : 'Base Starter'
                                : getUnlockHint(
                                    item.unlockRelicId,
                                    item.unlockFeatId
                                  )}
                            </p>
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>
              )}
            </>
          )}

          {tab === 'relics' && (
            <>
              <div className="flex items-center justify-between gap-2 text-[11px] text-[#f5ead2]/80">
                <span>
                  Every relic unlocks a matching Bard wearable &amp; progresses
                  instrument skins!
                </span>
                <span className="shrink-0 px-2 py-0.5 rounded-full bg-black/45 border border-[#d4af37]/35 text-[#ffe875] font-bold">
                  Pity: {profile.dupePity}/{DUPE_PITY_THRESHOLD}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {RELIC_CATALOG.map((relic) => {
                  const owned = unlockedRelics.has(relic.id);
                  const wearable = getCosmeticForRelic(relic.id);
                  return (
                    <div
                      key={relic.id}
                      className={`rounded-xl p-2 flex items-center gap-2 border ${
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
                        {wearable && (
                          <p
                            className={`text-[9px] truncate ${
                              owned ? 'text-[#103524] font-semibold' : 'text-[#f5ead2]/55'
                            }`}
                          >
                            🎭 {SLOT_LABELS[wearable.slot]}: {wearable.name}
                          </p>
                        )}
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
              const skin = KEYBOARD_SKIN_THEMES[voice.id];
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
                      <div className="flex items-center gap-1.5">
                        <p
                          className={`text-xs font-bold truncate ${
                            unlocked ? 'text-[#1c1208]' : 'text-[#f5ead2]/80'
                          }`}
                        >
                          {voice.name}
                        </p>
                        <span
                          title={`Keyboard Skin: ${skin.label}`}
                          className="inline-flex items-center gap-0.5 shrink-0"
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-xs border border-black/40"
                            style={{ backgroundColor: skin.swatchNatural }}
                          />
                          <span
                            className="w-2.5 h-2.5 rounded-xs border border-black/40"
                            style={{ backgroundColor: skin.swatchSharp }}
                          />
                        </span>
                      </div>
                      <p
                        className={`text-[10px] truncate ${
                          unlocked ? 'text-[#6e4726]' : 'text-[#f5ead2]/55'
                        }`}
                      >
                        {unlocked
                          ? `${skin.label} • ${voice.description}`
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
              const wearable = getCosmeticForFeat(feat.id);
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
                    {wearable && (
                      <p
                        className={`text-[10px] font-semibold mt-0.5 ${
                          isUnlocked ? 'text-[#103524]' : 'text-[#ffe875]/70'
                        }`}
                      >
                        🎭 Reward ({SLOT_LABELS[wearable.slot]}): {wearable.name}
                      </p>
                    )}
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
