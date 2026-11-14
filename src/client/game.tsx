import './index.css';

import {
  lazy,
  StrictMode,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createRoot } from 'react-dom/client';
import type {
  CommitRollResponse,
  StateResponse,
  SubmitAttemptResponse,
} from '../shared/api';
import {
  FAIL_ACCURACY_THRESHOLD,
  getTierForRoll,
  xpRequiredForLevel,
} from '../shared/constants';
import { generateMelody } from '../shared/melodyGenerator';
import streakFlameUrl from './assets/streak-flame.webp';
import bountySealUrl from './assets/bounty-seal.webp';
import { soundEngine } from './audio/soundEngine';
import { Keyboard, type KeyFeedbackState } from './components/Keyboard';

const DiceTray3D = lazy(() =>
  import('./components/DiceTray3D').then((m) => ({ default: m.DiceTray3D }))
);
import { LeaderboardModal } from './components/LeaderboardModal';
import { ResultCard } from './components/ResultCard';
import {
  trackAppReady,
  trackJourneyEnd,
  trackJourneyProgress,
  trackJourneyStart,
} from './telemetry';

type Phase = 'LOADING' | 'ROLL' | 'LISTEN' | 'PLAY' | 'RESULTS';

const HECKLE_LINES = [
  'Boo! Get off the stage!',
  'My ears! Even the tavern rat left!',
  'More practice, less ale, bard!',
  'The Tavern Keeper reaches for the tomatoes!',
];

export const Game = () => {
  const [state, setState] = useState<StateResponse | null>(null);
  const [phase, setPhase] = useState<Phase>('LOADING');
  const [muted, setMuted] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 3D Dice Tray state
  const [rollTrigger, setRollTrigger] = useState(0);
  const [isRolling, setIsRolling] = useState(false);
  const [isRerollPending, setIsRerollPending] = useState(false);

  // Listen & Play state
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [highlightedMidi, setHighlightedMidi] = useState<number | null>(null);
  const [playIdx, setPlayIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedbackMidi, setFeedbackMidi] = useState<number | null>(null);
  const [feedbackState, setFeedbackState] = useState<KeyFeedbackState>(null);

  // Results state
  const [lastResult, setLastResult] = useState<SubmitAttemptResponse | null>(
    null
  );
  const [heckle, setHeckle] = useState(HECKLE_LINES[0]!);

  const demoTimersRef = useRef<number[]>([]);
  const feedbackTimerRef = useRef<number | null>(null);

  const clearDemoTimers = useCallback(() => {
    for (const id of demoTimersRef.current) {
      window.clearTimeout(id);
    }
    demoTimersRef.current = [];
    setIsPlayingDemo(false);
    setHighlightedMidi(null);
  }, []);

  useEffect(() => {
    trackAppReady();
    let active = true;
    fetch('/api/state')
      .then((res) =>
        res.ok ? res.json() : Promise.reject(new Error('Failed to load state'))
      )
      .then((data: StateResponse) => {
        if (!active) return;
        setState(data);
        setPhase(data.daily.finalRoll !== null ? 'LISTEN' : 'ROLL');
      })
      .catch(() => {
        if (active) setError('Could not reach the Tavern Keeper.');
      });

    return () => {
      active = false;
      clearDemoTimers();
      if (feedbackTimerRef.current !== null) {
        window.clearTimeout(feedbackTimerRef.current);
      }
    };
  }, [clearDemoTimers]);

  const melody = useMemo(() => {
    if (!state || state.daily.finalRoll === null) return null;
    return generateMelody(
      state.daily.utcDate,
      state.profile.username,
      state.daily.finalRoll
    );
  }, [state]);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    soundEngine.setMuted(next);
  };

  const handleTriggerRoll = (reroll: boolean) => {
    soundEngine.unlock();
    trackJourneyStart();
    setError(null);
    setIsRerollPending(reroll);
    setIsRolling(true);
    setRollTrigger((n) => n + 1);
    setPhase('ROLL');
  };

  const handleDiceSettled = useCallback(
    async (value: number) => {
      setIsRolling(false);
      if (value === 20) soundEngine.playFanfare();
      else if (value === 1) soundEngine.playLowDrum();
      else soundEngine.playNote(67, 260);

      trackJourneyProgress(0.3, `rolled_${value}`);

      try {
        const res = await fetch('/api/roll', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roll: value, isReroll: isRerollPending }),
        });
        if (!res.ok) {
          const errData = (await res.json()) as { message?: string };
          throw new Error(errData.message ?? 'Roll failed');
        }
        const data = (await res.json()) as CommitRollResponse;
        setState((prev) =>
          prev
            ? {
                ...prev,
                daily: data.daily,
                profile:
                  data.unlockedFeat &&
                  !prev.profile.feats.includes(data.unlockedFeat)
                    ? {
                        ...prev.profile,
                        feats: [...prev.profile.feats, data.unlockedFeat],
                      }
                    : prev.profile,
              }
            : prev
        );
        setPhase('LISTEN');
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to lock in your roll.'
        );
      }
    },
    [isRerollPending]
  );

  const playMelodyDemo = useCallback(() => {
    if (!melody || isPlayingDemo) return;
    soundEngine.unlock();
    clearDemoTimers();
    setIsPlayingDemo(true);
    trackJourneyProgress(0.55, 'listen_melody');

    melody.notes.forEach((midi, idx) => {
      const startAt = idx * melody.tempoMs;
      const t1 = window.setTimeout(() => {
        setHighlightedMidi(midi);
        soundEngine.playNote(midi, melody.tempoMs * 0.85);
      }, startAt);
      const t2 = window.setTimeout(() => {
        setHighlightedMidi((curr) => (curr === midi ? null : curr));
      }, startAt + melody.tempoMs * 0.72);
      demoTimersRef.current.push(t1, t2);
    });

    const endTimer = window.setTimeout(() => {
      setIsPlayingDemo(false);
      setHighlightedMidi(null);
    }, melody.notes.length * melody.tempoMs + 80);
    demoTimersRef.current.push(endTimer);
  }, [melody, isPlayingDemo, clearDemoTimers]);

  const startAttempt = () => {
    soundEngine.unlock();
    trackJourneyStart();
    clearDemoTimers();
    setPlayIdx(0);
    setCorrectCount(0);
    setFeedbackMidi(null);
    setFeedbackState(null);
    setLastResult(null);
    setPhase('PLAY');
  };

  const finishAttempt = async (finalCorrect: number, totalNotes: number) => {
    const accuracy = totalNotes > 0 ? finalCorrect / totalNotes : 0;
    try {
      const res = await fetch('/api/attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accuracy }),
      });
      if (!res.ok) throw new Error('Failed to save attempt');
      const data = (await res.json()) as SubmitAttemptResponse;
      setLastResult(data);
      setState((prev) =>
        prev
          ? {
              ...prev,
              profile: data.profile,
              daily: data.daily,
            }
          : prev
      );
      trackJourneyEnd(data.passed, data.xpEarned);

      if (!data.passed) {
        setHeckle(
          HECKLE_LINES[Math.floor(Math.random() * HECKLE_LINES.length)]!
        );
        soundEngine.playTomatoSplat();
      } else if (data.leveledUp || accuracy === 1) {
        soundEngine.playFanfare();
      }
      setPhase('RESULTS');
    } catch {
      setError('Could not save your performance to the tavern ledger.');
    }
  };

  const handleKeyPress = (midi: number) => {
    if (phase !== 'PLAY' || !melody) return;
    soundEngine.unlock();

    const expected = melody.notes[playIdx];
    if (expected === undefined) return;

    const isCorrect = midi === expected;
    if (isCorrect) {
      soundEngine.playNote(midi, 320);
    } else {
      soundEngine.playWrongNote();
    }

    if (feedbackTimerRef.current !== null) {
      window.clearTimeout(feedbackTimerRef.current);
    }
    setFeedbackMidi(midi);
    setFeedbackState(isCorrect ? 'correct' : 'wrong');
    feedbackTimerRef.current = window.setTimeout(() => {
      setFeedbackMidi(null);
      setFeedbackState(null);
    }, 260);

    const nextCorrect = correctCount + (isCorrect ? 1 : 0);
    const nextIdx = playIdx + 1;
    setCorrectCount(nextCorrect);
    setPlayIdx(nextIdx);

    if (nextIdx >= melody.notes.length) {
      void finishAttempt(nextCorrect, melody.notes.length);
    }
  };

  const finalRoll = state?.daily.finalRoll ?? null;
  const tier = finalRoll !== null ? getTierForRoll(finalRoll) : null;

  // XP progress bar calculation
  const level = state?.profile.level ?? 1;
  const totalXp = state?.profile.totalXp ?? 0;
  const currLevelXp = xpRequiredForLevel(level);
  const nextLevelXp = xpRequiredForLevel(level + 1);
  const levelProgressPct =
    nextLevelXp > currLevelXp
      ? Math.min(
          100,
          Math.max(
            0,
            ((totalXp - currLevelXp) / (nextLevelXp - currLevelXp)) * 100
          )
        )
      : 100;

  return (
    <div className="tavern-stage-bg min-h-screen w-full flex flex-col justify-between p-3 sm:p-5 gap-2.5">
      {/* Top Tavern HUD */}
      <header className="tavern-wood-frame rounded-xl px-3.5 py-2.5 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="font-serif text-lg sm:text-xl font-bold text-[#ffe875] leading-tight">
              Lute Roll
            </h1>
            <p className="text-[11px] sm:text-xs text-[#f5ead2]/85 truncate">
              {state
                ? `${state.profile.username} • Lvl ${level} ${state.profile.title}`
                : 'Entering the tavern...'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {state && state.profile.streak > 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg bg-black/45 border border-amber-400/40 text-amber-200">
                <img
                  src={streakFlameUrl}
                  alt="Streak"
                  className="w-3.5 h-3.5 object-contain"
                />
                {state.profile.streak}
              </span>
            )}
            <button
              type="button"
              onClick={() => setShowLeaderboard(true)}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-black/45 hover:bg-black/65 border border-[#d4af37]/40 text-[#ffe875] cursor-pointer"
              aria-label="Open leaderboards"
            >
              🏆 Ranks
            </button>
            <button
              type="button"
              onClick={toggleMute}
              className="text-xs px-2 py-1.5 rounded-lg bg-black/45 hover:bg-black/65 border border-[#d4af37]/40 text-[#ffe875] cursor-pointer"
              aria-label={muted ? 'Unmute audio' : 'Mute audio'}
            >
              {muted ? '🔇' : '🔊'}
            </button>
          </div>
        </div>

        {/* XP Bar */}
        {state && (
          <div className="flex items-center gap-2 text-[10px] text-[#ffe875]/80">
            <div className="flex-1 h-1.5 rounded-full bg-black/50 overflow-hidden border border-[#d4af37]/25">
              <div
                className="h-full bg-gradient-to-r from-[#d4af37] to-[#fff099] transition-all duration-300"
                style={{ width: `${levelProgressPct}%` }}
              />
            </div>
            <span className="shrink-0 font-semibold">
              {totalXp} / {nextLevelXp} XP
            </span>
          </div>
        )}
      </header>

      {error && (
        <div className="w-full max-w-lg mx-auto text-xs text-red-200 bg-red-950/80 border border-red-500/50 rounded-xl px-3 py-2 text-center">
          {error}
        </div>
      )}

      {/* Main Stage */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-lg mx-auto">
        {phase === 'LOADING' && (
          <div className="tavern-wood-frame w-full rounded-2xl p-6 text-center text-sm text-[#f5ead2]/85">
            Tuning the lute strings...
          </div>
        )}

        {phase === 'ROLL' && (
          <div className="tavern-wood-frame w-full rounded-2xl p-4 sm:p-5 flex flex-col items-center gap-4 text-center">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#ffe875]">
                {isRerollPending ? 'Daily Reroll' : "Roll Today's d20"}
              </h2>
              <p className="text-xs text-[#f5ead2]/80 mt-0.5">
                High roll = easier tune • Nat 20 = 3.0x crit payout • Nat 1 =
                Brutal 3.0x
              </p>
            </div>

            {rollTrigger > 0 ? (
              <Suspense
                fallback={
                  <div className="tavern-felt-bg w-full h-52 sm:h-60 rounded-xl border-2 border-[#754c28] flex items-center justify-center text-xs text-[#ffe875]">
                    Preparing dice tray...
                  </div>
                }
              >
                <DiceTray3D
                  rollTrigger={rollTrigger}
                  onSettled={(v) => void handleDiceSettled(v)}
                />
              </Suspense>
            ) : (
              <div className="tavern-felt-bg w-full h-52 sm:h-60 rounded-xl border-2 border-[#754c28] flex flex-col items-center justify-center gap-2 shadow-inner">
                <span className="font-serif text-5xl font-bold text-[#ffe875] drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                  d20
                </span>
                <span className="text-xs text-[#f5ead2]/80">
                  Tap below to toss the gold die onto the felt
                </span>
              </div>
            )}

            <button
              type="button"
              disabled={isRolling}
              onClick={() => handleTriggerRoll(isRerollPending)}
              className="gold-btn w-full py-3.5 px-5 rounded-xl font-bold text-base cursor-pointer disabled:opacity-60"
            >
              {isRolling ? 'Rolling...' : 'Toss the d20'}
            </button>
          </div>
        )}

        {phase === 'LISTEN' && melody && tier && (
          <div className="tavern-wood-frame w-full rounded-2xl p-4 sm:p-5 flex flex-col gap-3.5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#ffe875] text-[#1c1208] shadow">
                    Rolled {finalRoll}
                  </span>
                  <span className="text-sm font-bold text-[#ffe875]">
                    {tier.name} • {tier.xpMultiplier}x XP
                  </span>
                </div>
                <p className="text-xs text-[#f5ead2]/80 mt-1">
                  {melody.notes.length} notes • Listen to the tune, then tap it
                  back
                </p>
              </div>
              {state && !state.daily.rerollUsed && (
                <button
                  type="button"
                  onClick={() => handleTriggerRoll(true)}
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-black/45 hover:bg-black/65 border border-[#d4af37]/45 text-[#ffe875] cursor-pointer shrink-0"
                >
                  🎲 Reroll (1 left)
                </button>
              )}
            </div>

            {finalRoll === 20 && (
              <div className="animate-gold-pulse rounded-xl bg-amber-500/25 border border-amber-300/70 px-3 py-2 text-center text-xs font-bold text-[#ffe875]">
                ✨ CRITICAL SUCCESS! Easiest tune with 3.0x XP payout!
              </div>
            )}
            {finalRoll === 1 && (
              <div className="rounded-xl bg-red-950/80 border border-red-400/60 px-3 py-2 text-center text-xs font-bold text-red-200">
                💀 BRUTAL! Hardest tune, clearable for 3.0x XP!
              </div>
            )}

            <div className="tavern-felt-bg rounded-xl p-2.5 border border-[#754c28]/80 shadow-inner">
              <Keyboard
                highlightedMidi={highlightedMidi}
                feedbackMidi={null}
                feedbackState={null}
                disabled
                onKeyPress={() => {}}
              />
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                disabled={isPlayingDemo}
                onClick={playMelodyDemo}
                className="flex-1 py-3 px-4 rounded-xl font-semibold text-sm bg-[#103524] hover:bg-[#164731] text-[#ffe875] border border-[#d4af37]/50 cursor-pointer disabled:opacity-60"
              >
                {isPlayingDemo ? 'Playing...' : '🎵 Listen'}
              </button>
              <button
                type="button"
                onClick={startAttempt}
                className="gold-btn flex-1 py-3 px-4 rounded-xl font-bold text-sm cursor-pointer"
              >
                🎹 Play It Back
              </button>
            </div>
          </div>
        )}

        {phase === 'PLAY' && melody && tier && (
          <div className="tavern-wood-frame w-full rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#ffe875]">
                Note {Math.min(playIdx + 1, melody.notes.length)} of{' '}
                {melody.notes.length}
              </span>
              <span className="text-[#f5ead2]/85">
                Hits: {correctCount}/{playIdx}
              </span>
            </div>

            <div className="flex gap-1 w-full">
              {melody.notes.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    idx < playIdx
                      ? 'bg-[#d4af37]'
                      : idx === playIdx
                        ? 'bg-[#ffe875]'
                        : 'bg-black/45'
                  }`}
                />
              ))}
            </div>

            <div className="tavern-felt-bg rounded-xl p-2.5 border border-[#754c28]/80 shadow-inner">
              <Keyboard
                highlightedMidi={null}
                feedbackMidi={feedbackMidi}
                feedbackState={feedbackState}
                onKeyPress={handleKeyPress}
              />
            </div>

            <button
              type="button"
              onClick={() => setPhase('LISTEN')}
              className="text-xs text-[#f5ead2]/75 hover:text-white underline self-center cursor-pointer pt-0.5"
            >
              Listen again before finishing
            </button>
          </div>
        )}

        {phase === 'RESULTS' && lastResult && tier && finalRoll !== null && (
          <div className="tavern-wood-frame w-full rounded-2xl p-4 sm:p-5 flex flex-col items-center text-center gap-3.5">
            {lastResult.passed ? (
              <>
                <div className="text-4xl">
                  {lastResult.accuracy === 1 ? '🏆' : '🎶'}
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#ffe875]">
                    {lastResult.accuracy === 1
                      ? 'Flawless Performance!'
                      : 'The Tavern Cheers!'}
                  </h2>
                  <p className="text-sm text-[#f5ead2]/90 mt-0.5">
                    {Math.round(lastResult.accuracy * 100)}% Accuracy •{' '}
                    <span className="font-bold text-[#ffe875]">
                      +{lastResult.xpEarned} XP
                    </span>
                  </p>
                </div>
                {lastResult.leveledUp && (
                  <div className="animate-gold-pulse w-full rounded-xl bg-amber-500/25 border border-amber-300/70 px-3 py-2 text-xs font-bold text-[#ffe875]">
                    🎉 Level Up! You are now Level {lastResult.profile.level}{' '}
                    {lastResult.profile.title}!
                  </div>
                )}
                {lastResult.unlockedFeat && (
                  <div className="w-full rounded-xl bg-black/45 border border-[#d4af37]/60 px-3 py-2 flex items-center justify-center gap-2 text-xs font-bold text-[#ffe875]">
                    <img
                      src={bountySealUrl}
                      alt=""
                      className="w-5 h-5 object-contain"
                    />
                    Rare Feat Unlocked: {lastResult.unlockedFeat.toUpperCase()}!
                  </div>
                )}
              </>
            ) : (
              <div className="animate-tomato-splat flex flex-col items-center gap-1">
                <div className="text-5xl">🍅🍅🍅</div>
                <h2 className="font-serif text-2xl font-bold text-red-300">
                  Tomatoes Thrown!
                </h2>
                <p className="text-sm text-[#f5ead2]/90 italic">
                  &ldquo;{heckle}&rdquo;
                </p>
                <p className="text-xs text-red-200/85 mt-1">
                  {Math.round(lastResult.accuracy * 100)}% Accuracy (need{' '}
                  {Math.round(FAIL_ACCURACY_THRESHOLD * 100)}% to earn XP) • 0 XP
                </p>
              </div>
            )}

            <ResultCard
              utcDate={lastResult.daily.utcDate}
              roll={finalRoll}
              accuracy={lastResult.accuracy}
              xpEarned={lastResult.xpEarned}
              passed={lastResult.passed}
              profile={lastResult.profile}
            />

            <div className="w-full flex gap-2.5">
              <button
                type="button"
                onClick={() => setPhase('LISTEN')}
                className="gold-btn flex-1 py-3 px-4 rounded-xl font-bold text-sm cursor-pointer"
              >
                Play Again (Grind XP)
              </button>
              <button
                type="button"
                onClick={() => setShowLeaderboard(true)}
                className="py-3 px-4 rounded-xl font-semibold text-sm bg-[#103524] hover:bg-[#164731] text-[#ffe875] border border-[#d4af37]/50 cursor-pointer"
              >
                🏆 Ranks
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="text-center text-[11px] text-[#f5ead2]/55">
        Lute Roll • UTC {state?.daily.utcDate ?? ''} • r/luteroll
      </footer>

      {showLeaderboard && (
        <LeaderboardModal onClose={() => setShowLeaderboard(false)} />
      )}
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Game />
  </StrictMode>
);
