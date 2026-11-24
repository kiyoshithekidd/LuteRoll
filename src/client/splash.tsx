import './index.css';

import { context, requestExpandedMode } from '@devvit/web/client';
import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { StateResponse } from '../shared/api';
import { getTierForRoll } from '../shared/constants';
import { apiFetch } from './apiClient';
import streakFlameUrl from './assets/streak-flame.webp';
import bountySealUrl from './assets/bounty-seal.webp';
import luteCrestUrl from './assets/lute-crest.webp';
import { TavernGuideModal } from './components/TavernGuideModal';
import { BardAvatar } from './components/BardAvatar';
import { trackAppReady } from './telemetry';

function getUtcResetCountdown(): string {
  const now = new Date();
  const nextMidnight = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1
  );
  const diffMs = Math.max(0, nextMidnight - now.getTime());
  const hours = Math.floor(diffMs / 3_600_000);
  const mins = Math.floor((diffMs % 3_600_000) / 60_000);
  return `${hours}h ${mins}m`;
}

function D20Emblem({ value }: { value: number | null }) {
  return (
    <div className="relative flex items-center justify-center w-24 h-24 select-none animate-gold-pulse rounded-full">
      <img
        src={luteCrestUrl}
        alt="Lute Roll Crest"
        className="w-24 h-24 rounded-full object-cover border-2 border-[#d4af37] shadow-[0_6px_18px_rgba(0,0,0,0.75)]"
      />
      {value !== null && (
        <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-[#1c1208] border border-[#ffe875] font-serif text-xs font-bold text-[#ffe875] shadow">
          d20: {value}
        </span>
      )}
    </div>
  );
}

function formatShortUtcDate(utcDate: string): string {
  const dt = new Date(`${utcDate}T00:00:00Z`);
  if (Number.isNaN(dt.getTime())) return utcDate;
  return dt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export const Splash = () => {
  const [state, setState] = useState<StateResponse | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    trackAppReady();
    let active = true;
    apiFetch('/api/state')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: StateResponse | null) => {
        if (active && data?.type === 'state') {
          setState(data);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const username =
    state?.profile.username ?? context.username ?? 'Wandering Bard';
  const utcDate = state?.daily.utcDate ?? new Date().toISOString().slice(0, 10);
  const finalRoll = state?.daily.finalRoll ?? null;
  const tier = finalRoll !== null ? getTierForRoll(finalRoll) : null;
  const rollersToday = state?.tavernStats?.rollersToday ?? 0;

  return (
    <main className="tavern-stage-bg min-h-screen w-full flex items-center justify-center p-2.5 sm:p-5">
      <section className="tavern-wood-frame w-full max-w-md rounded-2xl p-4 sm:p-5 flex flex-col items-center text-center gap-3">
        <div className="w-full flex items-center justify-between gap-2 text-[11px] uppercase tracking-wider text-[#ffe875]/90">
          <span className="whitespace-nowrap">
            Tavern • {formatShortUtcDate(utcDate)}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {state && state.profile.streak > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/45 border border-amber-400/40 text-amber-200 font-bold">
                <img
                  src={streakFlameUrl}
                  alt=""
                  className="w-3 h-3 object-contain"
                />
                {state.profile.streak}
              </span>
            )}
            <span className="px-2 py-0.5 rounded-full bg-black/45 border border-[#d4af37]/40 whitespace-nowrap">
              r/luteroll
            </span>
          </div>
        </div>

        <D20Emblem value={finalRoll} />

        <div className="space-y-0.5">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#ffe875] drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
            Lute Roll
          </h1>
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-[#f5ead2]/90">
            {state ? (
              <>
                <BardAvatar
                  config={state.profile.bardAvatar}
                  snoovatarUrl={state.profile.snoovatarUrl}
                  size="xs"
                />
                <span>
                  <span className="font-semibold text-white">{username}</span> •
                  Lvl {state.profile.level} {state.profile.title}
                </span>
              </>
            ) : (
              <span>Roll a d20, learn the tune, earn the XP.</span>
            )}
          </div>
          {/* Issue #7: Live tavern stat — hidden cleanly if 0 or unavailable */}
          {rollersToday > 0 && (
            <p className="text-[11px] font-semibold text-[#ffe875]/90 pt-0.5">
              🎲 {rollersToday.toLocaleString()}{' '}
              {rollersToday === 1 ? 'bard has' : 'bards have'} rolled today
            </p>
          )}
        </div>

        {finalRoll !== null && tier ? (
          <div className="parchment-card w-full rounded-xl px-3 py-2 text-sm flex items-center justify-between gap-2">
            <div className="text-left min-w-0">
              <p className="font-bold text-[#26160a] text-xs sm:text-sm">
                Today&apos;s Roll: {finalRoll} ({tier.name}) •{' '}
                {tier.xpMultiplier}x XP
              </p>
              <p className="text-[11px] text-[#6e4726] whitespace-nowrap">
                {state?.daily.attemptsCount ?? 0} plays • +
                {state?.daily.todayXp ?? 0} XP • Next {getUtcResetCountdown()}
              </p>
            </div>
            {state && state.profile.feats.length > 0 && (
              <img
                src={bountySealUrl}
                alt="Rare Feat Unlocked"
                className="w-9 h-9 object-contain shrink-0"
              />
            )}
          </div>
        ) : (
          <div className="tavern-felt-bg w-full rounded-xl border border-[#d4af37]/30 px-3 py-2 text-xs text-[#f5ead2]/85">
            Roll today&apos;s d20 to set your melody difficulty and XP payout.
          </div>
        )}

        <div className="w-full flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowGuide(true)}
            className="px-3.5 py-3.5 rounded-xl font-bold text-xs sm:text-sm bg-black/45 border border-[#d4af37]/50 text-[#ffe875] hover:bg-black/60 cursor-pointer shrink-0"
          >
            📜 Guide
          </button>
          <button
            type="button"
            onClick={(e) => requestExpandedMode(e.nativeEvent, 'game')}
            className="gold-btn flex-1 py-3.5 px-4 rounded-xl font-bold text-sm sm:text-base tracking-wide cursor-pointer transition-transform"
          >
            {finalRoll !== null ? 'Play Today’s Tune' : 'Enter & Roll d20'}
          </button>
        </div>
      </section>

      {showGuide && <TavernGuideModal onClose={() => setShowGuide(false)} />}
    </main>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Splash />
  </StrictMode>
);
