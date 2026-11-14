import './index.css';

import { context, requestExpandedMode } from '@devvit/web/client';
import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { StateResponse, TestRollResponse } from '../shared/api';

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
  const [rollResult, setRollResult] = useState<TestRollResponse | null>(null);
  const [rolling, setRolling] = useState(false);

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

  const handleQuickRoll = async () => {
    if (rolling) return;
    setRolling(true);
    try {
      const res = await fetch('/api/test-roll', { method: 'POST' });
      if (res.ok) {
        const data = (await res.json()) as TestRollResponse;
        setRollResult(data);
        setState((prev) =>
          prev
            ? {
                ...prev,
                lastTestRoll: data.roll,
                testRollCount: data.testRollCount,
              }
            : prev
        );
      }
    } finally {
      setRolling(false);
    }
  };

  const displayDie = rollResult?.roll ?? state?.lastTestRoll ?? 20;
  const username = state?.username ?? context.username ?? 'Wandering Bard';
  const utcDate = state?.utcDate ?? new Date().toISOString().slice(0, 10);

  return (
    <main className="tavern-felt-bg min-h-screen w-full flex items-center justify-center p-3 sm:p-5">
      <section className="tavern-wood-frame w-full max-w-md rounded-2xl p-5 flex flex-col items-center text-center gap-4">
        <div className="w-full flex items-center justify-between text-xs uppercase tracking-wider text-[#d4af37]/90">
          <span>Tavern Stage • {utcDate}</span>
          <span className="px-2 py-0.5 rounded-full bg-black/30 border border-[#d4af37]/30">
            r/luteroll
          </span>
        </div>

        <D20Emblem value={displayDie} />

        <div className="space-y-1">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#ffe875]">
            Lute Roll
          </h1>
          <p className="text-sm text-[#f5ead2]/85">
            Welcome, <span className="font-semibold text-white">{username}</span>.
            Roll a d20, learn the tune, earn the XP.
          </p>
        </div>

        {rollResult ? (
          <div className="w-full rounded-xl bg-black/35 border border-[#d4af37]/40 px-3 py-2.5 text-sm">
            <p className="font-semibold text-[#ffe875]">
              Test Roll: {rollResult.roll} — {rollResult.tierLabel}
            </p>
            <p className="text-xs text-[#f5ead2]/70 mt-0.5">
              Tavern placeholder verified • Total test rolls:{' '}
              {rollResult.testRollCount}
            </p>
          </div>
        ) : (
          <p className="text-xs text-[#f5ead2]/65">
            Milestone 1 Playtest • {state?.testRollCount ?? 0} test rolls logged
          </p>
        )}

        <div className="w-full flex flex-col sm:flex-row gap-2.5 pt-1">
          <button
            type="button"
            onClick={(e) => requestExpandedMode(e.nativeEvent, 'game')}
            className="gold-btn flex-1 py-3 px-4 rounded-xl font-bold text-sm tracking-wide cursor-pointer transition-transform"
          >
            Enter the Tavern
          </button>
          <button
            type="button"
            onClick={() => void handleQuickRoll()}
            disabled={rolling}
            className="flex-1 py-3 px-4 rounded-xl font-semibold text-sm bg-[#103524] hover:bg-[#164731] text-[#ffe875] border border-[#d4af37]/50 cursor-pointer transition-colors disabled:opacity-60"
          >
            {rolling ? 'Rolling...' : 'Test Roll d20'}
          </button>
        </div>
      </section>
    </main>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Splash />
  </StrictMode>
);
