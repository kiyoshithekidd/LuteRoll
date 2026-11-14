import './index.css';

import { context } from '@devvit/web/client';
import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { StateResponse, TestRollResponse } from '../shared/api';

export const Game = () => {
  const [state, setState] = useState<StateResponse | null>(null);
  const [lastRoll, setLastRoll] = useState<TestRollResponse | null>(null);
  const [rolling, setRolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/state')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Failed'))))
      .then((data: StateResponse) => {
        if (active) setState(data);
      })
      .catch(() => {
        if (active) setError('Could not reach the Tavern Keeper (/api/state).');
      });
    return () => {
      active = false;
    };
  }, []);

  const handleRoll = async () => {
    if (rolling) return;
    setRolling(true);
    setError(null);
    try {
      const res = await fetch('/api/test-roll', { method: 'POST' });
      if (!res.ok) throw new Error('Roll failed');
      const data = (await res.json()) as TestRollResponse;
      setLastRoll(data);
      setState((prev) =>
        prev
          ? {
              ...prev,
              lastTestRoll: data.roll,
              testRollCount: data.testRollCount,
            }
          : prev
      );
    } catch {
      setError('The d20 bounced off the table. Try again.');
    } finally {
      setRolling(false);
    }
  };

  const username = state?.username ?? context.username ?? 'Wandering Bard';
  const activeDie = lastRoll?.roll ?? state?.lastTestRoll;

  return (
    <div className="tavern-felt-bg min-h-screen w-full flex flex-col justify-between p-4 sm:p-6">
      <header className="tavern-wood-frame rounded-xl px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-xl font-bold text-[#ffe875]">
            Lute Roll
          </h1>
          <p className="text-xs text-[#f5ead2]/75">
            Bard: {username} • Level 1 Busker
          </p>
        </div>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-black/40 border border-[#d4af37]/40 text-[#ffe875]">
          {state?.utcDate ?? 'UTC Today'}
        </span>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center my-4">
        <div className="tavern-wood-frame w-full max-w-md rounded-2xl p-6 flex flex-col items-center text-center gap-5">
          <div className="tavern-felt-bg w-full rounded-xl border border-[#d4af37]/30 py-8 px-4 flex flex-col items-center gap-3 shadow-inner">
            <div className="w-24 h-24 rounded-full bg-gradient-to-b from-[#ffe875] via-[#d4af37] to-[#8a6412] flex items-center justify-center shadow-lg border-2 border-[#fff3b0]">
              <span className="font-serif text-4xl font-bold text-[#1c1208]">
                {activeDie ?? 'd20'}
              </span>
            </div>

            {lastRoll ? (
              <div className="space-y-1">
                <p className="text-lg font-bold text-[#ffe875]">
                  Rolled {lastRoll.roll}
                </p>
                <p className="text-sm text-[#f5ead2]/90">{lastRoll.tierLabel}</p>
              </div>
            ) : (
              <p className="text-sm text-[#f5ead2]/80 max-w-xs">
                Dark green felt tray ready. Tap Roll to test the server &amp;
                Redis round-trip.
              </p>
            )}
          </div>

          {error && (
            <p className="text-xs text-red-300 bg-red-950/60 border border-red-500/40 rounded-lg px-3 py-2 w-full">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={() => void handleRoll()}
            disabled={rolling}
            className="gold-btn w-full py-3.5 px-6 rounded-xl font-bold text-base tracking-wide cursor-pointer transition-transform disabled:opacity-60"
          >
            {rolling ? 'Rolling the d20...' : 'Roll d20 (Milestone 1 Test)'}
          </button>

          <p className="text-xs text-[#f5ead2]/60">
            Milestone 1 Placeholder • Redis test rolls:{' '}
            {state?.testRollCount ?? 0} • 3D physics d20 &amp; Web Audio
            keyboard arrive in Milestone 2
          </p>
        </div>
      </main>

      <footer className="text-center text-[11px] text-[#f5ead2]/50">
        Lute Roll • Devvit Web Playtest • r/luteroll
      </footer>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Game />
  </StrictMode>
);
