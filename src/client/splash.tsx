import './index.css';

import { context, requestExpandedMode } from '@devvit/web/client';
import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { StateResponse } from '../shared/api';
import { getTierForRoll } from '../shared/constants';
import streakFlameUrl from './assets/streak-flame.webp';
import bountySealUrl from './assets/bounty-seal.webp';
import { trackAppReady } from './telemetry';

function D20Emblem({ value }: { value: number | string }) {
  return (
    <div className="relative flex items-center justify-center w-20 h-20 select-none animate-gold-pulse rounded-full">
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-[0_6px_12px_rgba(0,0,0,0.7)]"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="goldDie" cx="40%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#fff3b0" />
            <stop offset="55%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#8a6412" />
          </radialGradient>
        </defs>
        <polygon
          points="50,4 92,28 92,72 50,96 8,72 8,28"
          fill="url(#goldDie)"
          stroke="#fff8d6"
          strokeWidth="2.5"
        />
        <polygon
          points="50,14 82,66 18,66"
          fill="none"
          stroke="rgba(28,18,8,0.35)"
          strokeWidth="2"
        />
      </svg>
      <span className="absolute font-serif text-2xl font-bold text-[#1c1208] translate-y-0.5">
        {value}
      </span>
    </div>
  );
}

export const Splash = () => {
  const [state, setState] = useState<StateResponse | null>(null);

  useEffect(() => {
    trackAppReady();
    let active = true;
    fetch('/api/state')
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

  return (
    <main className="tavern-stage-bg min-h-screen w-full flex items-center justify-center p-3 sm:p-5">
      <section className="tavern-wood-frame w-full max-w-md rounded-2xl p-5 flex flex-col items-center text-center gap-4">
        <div className="w-full flex items-center justify-between text-xs uppercase tracking-wider text-[#ffe875]/90">
          <span>Tavern Stage • {utcDate}</span>
          <div className="flex items-center gap-2">
            {state && state.profile.streak > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/45 border border-amber-400/40 text-amber-200 font-bold">
                <img
                  src={streakFlameUrl}
                  alt=""
                  className="w-3.5 h-3.5 object-contain"
                />
                {state.profile.streak}
              </span>
            )}
            <span className="px-2 py-0.5 rounded-full bg-black/45 border border-[#d4af37]/40">
              r/luteroll
            </span>
          </div>
        </div>

        <D20Emblem value={finalRoll ?? 'd20'} />

        <div className="space-y-1">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#ffe875] drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
            Lute Roll
          </h1>
          <p className="text-sm text-[#f5ead2]/90">
            {state ? (
              <>
                <span className="font-semibold text-white">{username}</span> •
                Lvl {state.profile.level} {state.profile.title}
              </>
            ) : (
              'Roll a d20, learn the tune, earn the XP.'
            )}
          </p>
        </div>

        {finalRoll !== null && tier ? (
          <div className="parchment-card w-full rounded-xl px-3.5 py-2.5 text-sm flex items-center justify-between gap-2">
            <div className="text-left">
              <p className="font-bold text-[#26160a]">
                Today&apos;s Roll: {finalRoll} ({tier.name})
              </p>
              <p className="text-xs text-[#6e4726]">
                {tier.xpMultiplier}x XP • {state?.daily.attemptsCount ?? 0} plays
                • +{state?.daily.todayXp ?? 0} XP today
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

        <button
          type="button"
          onClick={(e) => requestExpandedMode(e.nativeEvent, 'game')}
          className="gold-btn w-full py-3.5 px-5 rounded-xl font-bold text-base tracking-wide cursor-pointer transition-transform"
        >
          {finalRoll !== null ? 'Play Today’s Tune' : 'Enter the Tavern & Roll'}
        </button>
      </section>
    </main>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Splash />
  </StrictMode>
);
