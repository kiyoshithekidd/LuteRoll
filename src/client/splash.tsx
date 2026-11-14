import './index.css';

import { context, requestExpandedMode } from '@devvit/web/client';
import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { StateResponse } from '../shared/api';
import { getTierForRoll } from '../shared/constants';

function D20Emblem({ value }: { value: number | string }) {
  return (
    <div className="relative flex items-center justify-center w-20 h-20 select-none">
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-[0_6px_12px_rgba(0,0,0,0.6)]"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="goldDie" cx="40%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffe875" />
            <stop offset="55%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#8a6412" />
          </radialGradient>
        </defs>
        <polygon
          points="50,4 92,28 92,72 50,96 8,72 8,28"
          fill="url(#goldDie)"
          stroke="#fff3b0"
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
    <main className="tavern-felt-bg min-h-screen w-full flex items-center justify-center p-3 sm:p-5">
      <section className="tavern-wood-frame w-full max-w-md rounded-2xl p-5 flex flex-col items-center text-center gap-4">
        <div className="w-full flex items-center justify-between text-xs uppercase tracking-wider text-[#d4af37]/90">
          <span>Tavern Stage • {utcDate}</span>
          <span className="px-2 py-0.5 rounded-full bg-black/30 border border-[#d4af37]/30">
            r/luteroll
          </span>
        </div>

        <D20Emblem value={finalRoll ?? 'd20'} />

        <div className="space-y-1">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#ffe875]">
            Lute Roll
          </h1>
          <p className="text-sm text-[#f5ead2]/85">
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
          <div className="w-full rounded-xl bg-black/35 border border-[#d4af37]/40 px-3 py-2.5 text-sm">
            <p className="font-semibold text-[#ffe875]">
              Today&apos;s Roll: {finalRoll} ({tier.name} • {tier.xpMultiplier}x
              XP)
            </p>
            <p className="text-xs text-[#f5ead2]/75 mt-0.5">
              {state?.daily.attemptsCount ?? 0} plays today • +
              {state?.daily.todayXp ?? 0} XP earned
            </p>
          </div>
        ) : (
          <p className="text-xs text-[#f5ead2]/70">
            Roll today&apos;s d20 to set your melody difficulty and XP payout.
          </p>
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
