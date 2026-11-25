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
  BARD_EPITHETS,
  BARD_PORTRAITS,
  DICE_SKINS,
  getCosmeticForFeat,
  getCosmeticForRelic,
  isCosmeticUnlocked,
  isDiceSkinUnlocked,
  isEpithetUnlocked,
  isParticleSkinUnlocked,
  isPortraitUnlocked,
  KEYBOARD_SKIN_THEMES,
  NOTE_PARTICLE_SKINS,
  type BardAvatarConfig,
} from '../../shared/cosmetics';
import { soundEngine } from '../audio/soundEngine';
import bountySealUrl from '../assets/bounty-seal.webp';
import nat20SealUrl from '../assets/nat20-seal.webp';
import { BARD_PORTRAIT_URLS } from '../assets/bardPortraits';
import { BardAvatar } from './BardAvatar';

type FeatsModalProps = {
  profile: PlayerProfile;
  onSelectVoice: (voiceId: KeyboardVoiceId) => Promise<void>;
  onSaveAvatar: (config: BardAvatarConfig) => Promise<void>;
  onClose: () => void;
};

type VaultTab = 'relics' | 'voices' | 'bard' | 'feats';
type BardCategory = 'portrait' | 'frame' | 'dice' | 'sparks' | 'epithet' | 'badge';

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
  onSaveAvatar,
  onClose,
}: FeatsModalProps) {
  const [tab, setTab] = useState<VaultTab>('bard');
  const [bardCat, setBardCat] = useState<BardCategory>('portrait');
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

  const unlockedPortraitsCount = BARD_PORTRAITS.filter((p) =>
    isPortraitUnlocked(p, profile.relics, profile.feats)
  ).length;

  const frameCosmetics = BARD_COSMETICS.filter((c) => c.slot === 'frame');

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
        <div
          className="overflow-y-auto min-h-0 overscroll-contain touch-pan-y space-y-2.5 pr-0.5 flex-1"
          style={{ WebkitOverflowScrolling: 'touch' }}
          onTouchMove={(e) => e.stopPropagation()}
        >
          {tab === 'bard' && (
            <>
              {/* Live Illustrated Bard Preview */}
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
                    Shown in HUD &amp; Leaderboards •{' '}
                    <strong>
                      {unlockedPortraitsCount}/{BARD_PORTRAITS.length}
                    </strong>{' '}
                    Bards unlocked
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
                        ? '🎭 Switch to Chibi Bard'
                        : '👤 Use Reddit Snoovatar'}
                    </button>
                  )}
                </div>
              </div>

              {/* Category Pills */}
              <div className="grid grid-cols-3 gap-1.5">
                {(
                  [
                    ['portrait', '🎭 Bards'],
                    ['frame', '✨ Auras'],
                    ['dice', '🎲 d20 Skins'],
                    ['sparks', '✦ Sparks'],
                    ['epithet', '🏷️ Epithet'],
                    ['badge', '📌 Crest Pin'],
                  ] as const
                ).map(([cat, label]) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setBardCat(cat)}
                    className={`py-1.5 px-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold cursor-pointer ${
                      bardCat === cat
                        ? 'bg-[#103524] text-[#ffe875] border border-[#ffe875]'
                        : 'bg-black/35 text-[#f5ead2]/75 border border-[#d4af37]/25'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Dice Skin Grid (#28) */}
              {bardCat === 'dice' && (
                <div className="grid grid-cols-2 gap-1.5">
                  {DICE_SKINS.map((d) => {
                    const unlocked = isDiceSkinUnlocked(
                      d,
                      profile.relics,
                      profile.feats,
                      profile.streak
                    );
                    const equipped =
                      (profile.bardAvatar.diceSkin ?? 'tavern_gold') === d.id;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        disabled={!unlocked || savingAvatar}
                        onClick={() =>
                          void handleUpdateAvatar({ diceSkin: d.id })
                        }
                        className={`rounded-xl p-2 flex items-center gap-2 text-left border transition-colors ${
                          equipped
                            ? 'bg-[#103524] border-[#ffe875] text-[#ffe875]'
                            : unlocked
                              ? 'parchment-card border-[#d4af37] cursor-pointer'
                              : 'bg-black/40 border-[#d4af37]/20 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <span
                          className="w-7 h-7 rounded-full border shrink-0 flex items-center justify-center text-[10px] font-bold"
                          style={{
                            background: `radial-gradient(circle, ${d.gradInner}, ${d.gradMid}, ${d.gradOuter})`,
                            borderColor: d.ringColor,
                            color: d.numColor,
                          }}
                        >
                          {unlocked ? '20' : '🔒'}
                        </span>
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
                            {d.name}
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
                            {equipped ? '✓ Active' : d.unlockHint}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Note Sparks Grid (#30) */}
              {bardCat === 'sparks' && (
                <div className="grid grid-cols-2 gap-1.5">
                  {NOTE_PARTICLE_SKINS.map((sp) => {
                    const unlocked = isParticleSkinUnlocked(
                      sp,
                      profile.relics,
                      profile.feats
                    );
                    const equipped =
                      (profile.bardAvatar.particleSkin ?? 'emerald_spark') ===
                      sp.id;
                    return (
                      <button
                        key={sp.id}
                        type="button"
                        disabled={!unlocked || savingAvatar}
                        onClick={() =>
                          void handleUpdateAvatar({ particleSkin: sp.id })
                        }
                        className={`rounded-xl p-2 flex items-center gap-2 text-left border transition-colors ${
                          equipped
                            ? 'bg-[#103524] border-[#ffe875] text-[#ffe875]'
                            : unlocked
                              ? 'parchment-card border-[#d4af37] cursor-pointer'
                              : 'bg-black/40 border-[#d4af37]/20 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <span className="w-7 h-7 rounded-full bg-[#1c1208] border border-[#d4af37] shrink-0 flex items-center justify-center text-sm">
                          {unlocked ? sp.symbol : '🔒'}
                        </span>
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
                            {sp.name}
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
                            {equipped ? '✓ Active' : sp.unlockHint}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Epithet Grid (#29) */}
              {bardCat === 'epithet' && (
                <div className="grid grid-cols-2 gap-1.5">
                  {BARD_EPITHETS.map((ep) => {
                    const unlocked = isEpithetUnlocked(
                      ep,
                      profile.relics,
                      profile.feats
                    );
                    const equipped =
                      (profile.bardAvatar.epithet ?? 'none') === ep.id;
                    return (
                      <button
                        key={ep.id}
                        type="button"
                        disabled={!unlocked || savingAvatar}
                        onClick={() =>
                          void handleUpdateAvatar({ epithet: ep.id })
                        }
                        className={`rounded-xl p-2 text-left border transition-colors ${
                          equipped
                            ? 'bg-[#103524] border-[#ffe875] text-[#ffe875]'
                            : unlocked
                              ? 'parchment-card border-[#d4af37] cursor-pointer'
                              : 'bg-black/40 border-[#d4af37]/20 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <p
                          className={`text-[11px] font-bold truncate ${
                            equipped
                              ? 'text-[#ffe875]'
                              : unlocked
                                ? 'text-[#1c1208]'
                                : 'text-[#f5ead2]/75'
                          }`}
                        >
                          {unlocked ? ep.label : `🔒 ${ep.label}`}
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
                          {equipped ? '✓ Equipped' : ep.unlockHint}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Illustrated Chibi Bard Portrait Grid */}
              {bardCat === 'portrait' && (
                <div className="grid grid-cols-2 gap-2">
                  {BARD_PORTRAITS.map((p) => {
                    const unlocked = isPortraitUnlocked(
                      p,
                      profile.relics,
                      profile.feats
                    );
                    const equipped =
                      !profile.bardAvatar.useSnoovatar &&
                      (profile.bardAvatar.portrait ?? 'busker') === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        disabled={!unlocked || savingAvatar}
                        onClick={() =>
                          void handleUpdateAvatar({
                            portrait: p.id,
                            useSnoovatar: false,
                          })
                        }
                        className={`rounded-xl p-2 flex items-center gap-2 text-left border transition-all ${
                          equipped
                            ? 'bg-[#103524] border-[#ffe875] text-[#ffe875] shadow-[0_0_12px_rgba(255,232,117,0.4)]'
                            : unlocked
                              ? 'parchment-card border-[#d4af37] cursor-pointer hover:brightness-105'
                              : 'bg-black/45 border-[#d4af37]/20 opacity-65 cursor-not-allowed'
                        }`}
                      >
                        <div className="relative shrink-0">
                          <img
                            src={BARD_PORTRAIT_URLS[p.id]}
                            alt={p.name}
                            className={`w-12 h-12 rounded-full object-cover border border-[#d4af37] ${
                              unlocked ? '' : 'grayscale brightness-50'
                            }`}
                          />
                          {!unlocked && (
                            <span className="absolute inset-0 flex items-center justify-center text-sm">
                              🔒
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p
                            className={`text-[11px] font-bold leading-tight truncate ${
                              equipped
                                ? 'text-[#ffe875]'
                                : unlocked
                                  ? 'text-[#1c1208]'
                                  : 'text-[#f5ead2]/80'
                            }`}
                          >
                            {p.name}
                          </p>
                          <p
                            className={`text-[9px] leading-tight mt-0.5 line-clamp-2 ${
                              equipped
                                ? 'text-[#ffe875]/80'
                                : unlocked
                                  ? 'text-[#6e4726]'
                                  : 'text-[#f5ead2]/55'
                            }`}
                          >
                            {equipped ? '✓ Active' : p.subtitle}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Aura Rings Grid */}
              {bardCat === 'frame' && (
                <div className="grid grid-cols-2 gap-1.5">
                  {frameCosmetics.map((item) => {
                    const unlocked = isCosmeticUnlocked(
                      item,
                      profile.relics,
                      profile.feats
                    );
                    const equipped = profile.bardAvatar.frame === item.id;
                    const relicMeta = item.unlockRelicId
                      ? RELIC_CATALOG.find((r) => r.id === item.unlockRelicId)
                      : null;
                    const featMeta = item.unlockFeatId
                      ? FEAT_CATALOG.find((f) => f.id === item.unlockFeatId)
                      : null;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        disabled={!unlocked || savingAvatar}
                        onClick={() => void handleUpdateAvatar({ frame: item.id })}
                        className={`rounded-xl p-2 flex items-center gap-2 text-left border transition-colors ${
                          equipped
                            ? 'bg-[#103524] border-[#ffe875] text-[#ffe875]'
                            : unlocked
                              ? 'parchment-card border-[#d4af37] cursor-pointer'
                              : 'bg-black/40 border-[#d4af37]/20 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <span
                          className="w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center text-[10px]"
                          style={{
                            backgroundColor: item.primaryColor,
                            borderColor: item.accentColor,
                            boxShadow: `0 0 8px ${item.accentColor}88`,
                          }}
                        >
                          {!unlocked ? '🔒' : equipped ? '✓' : ''}
                        </span>
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
                              ? 'Aura Unlocked'
                              : featMeta
                                ? `Feat: ${featMeta.title}`
                                : relicMeta
                                  ? `Relic: ${relicMeta.name}`
                                  : 'Starter'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Corner Crest Pin Picker (Any Owned Relic or Feat!) */}
              {bardCat === 'badge' && (
                <div className="space-y-2">
                  <button
                    type="button"
                    disabled={savingAvatar}
                    onClick={() => void handleUpdateAvatar({ badgeId: null })}
                    className={`w-full py-1.5 px-3 rounded-lg text-[11px] font-bold border cursor-pointer ${
                      !profile.bardAvatar.badgeId
                        ? 'bg-[#103524] border-[#ffe875] text-[#ffe875]'
                        : 'bg-black/35 border-[#d4af37]/30 text-[#f5ead2]/80'
                    }`}
                  >
                    No Corner Pin
                  </button>
                  <div className="grid grid-cols-3 gap-1.5">
                    {FEAT_CATALOG.filter((f) => unlockedFeats.has(f.id)).map(
                      (f) => {
                        const val = `feat:${f.id}`;
                        const active = profile.bardAvatar.badgeId === val;
                        return (
                          <button
                            key={val}
                            type="button"
                            disabled={savingAvatar}
                            onClick={() =>
                              void handleUpdateAvatar({ badgeId: val })
                            }
                            className={`rounded-lg p-1.5 flex items-center gap-1.5 border text-left cursor-pointer ${
                              active
                                ? 'bg-[#103524] border-[#ffe875] text-[#ffe875]'
                                : 'parchment-card border-[#d4af37]'
                            }`}
                          >
                            <span className="text-sm shrink-0">{f.icon}</span>
                            <span className="text-[9px] font-bold truncate">
                              {f.title}
                            </span>
                          </button>
                        );
                      }
                    )}
                    {RELIC_CATALOG.filter((r) => unlockedRelics.has(r.id)).map(
                      (r) => {
                        const val = `relic:${r.id}`;
                        const active = profile.bardAvatar.badgeId === val;
                        return (
                          <button
                            key={val}
                            type="button"
                            disabled={savingAvatar}
                            onClick={() =>
                              void handleUpdateAvatar({ badgeId: val })
                            }
                            className={`rounded-lg p-1.5 flex items-center gap-1.5 border text-left cursor-pointer ${
                              active
                                ? 'bg-[#103524] border-[#ffe875] text-[#ffe875]'
                                : 'parchment-card border-[#d4af37]'
                            }`}
                          >
                            <span className="text-sm shrink-0">{r.icon}</span>
                            <span className="text-[9px] font-bold truncate">
                              {r.name}
                            </span>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {tab === 'relics' && (
            <>
              <div className="flex items-center justify-between gap-2 text-[11px] text-[#f5ead2]/80">
                <span>
                  Every relic unlocks a Crest Pin, Aura, Bard Portrait, or
                  Instrument Skin!
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
                              owned
                                ? 'text-[#103524] font-semibold'
                                : 'text-[#f5ead2]/55'
                            }`}
                          >
                            📌 Pin &amp; {wearable.name}
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
              const portraitReward = BARD_PORTRAITS.find(
                (p) => p.unlockFeatId === feat.id
              );
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
                    {(portraitReward || wearable) && (
                      <p
                        className={`text-[10px] font-semibold mt-0.5 ${
                          isUnlocked ? 'text-[#103524]' : 'text-[#ffe875]/70'
                        }`}
                      >
                        🎭 Unlocks:{' '}
                        {portraitReward
                          ? `Bard Portrait "${portraitReward.name}"`
                          : wearable?.name}
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
