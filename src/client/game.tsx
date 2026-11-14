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
  KeyboardVoiceId,
  OpenChestResponse,
  PlayerProfile,
  StateResponse,
  SubmitAttemptResponse,
} from '../shared/api';
import {
  FAIL_ACCURACY_THRESHOLD,
  FEAT_CATALOG,
  getTierForRoll,
  getWardOfGraceCharges,
  RELIC_CATALOG,
  xpRequiredForLevel,
} from '../shared/constants';
import { generateMelody } from '../shared/melodyGenerator';
import streakFlameUrl from './assets/streak-flame.webp';
import tomatoSplatUrl from './assets/tomato-splat.webp';
import nat20SealUrl from './assets/nat20-seal.webp';
import { soundEngine } from './audio/soundEngine';
import { FeatsModal } from './components/FeatsModal';
import { Keyboard, type KeyFeedbackState } from './components/Keyboard';
import { LeaderboardModal } from './components/LeaderboardModal';
import { ResultCard } from './components/ResultCard';
import { TavernGuideModal } from './components/TavernGuideModal';
import {
  trackAppReady,
  trackJourneyEnd,
  trackJourneyProgress,
  trackJourneyStart,
} from './telemetry';

const DiceTray3D = lazy(() =>
  import('./components/DiceTray3D').then((m) => ({ default: m.DiceTray3D }))
);

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
  const [showGuide, setShowGuide] = useState(false);
  const [showFeats, setShowFeats] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 3D Dice Tray state
  const [rollTrigger, setRollTrigger] = useState(0);
  const [isRolling, setIsRolling] = useState(false);
  const [isRerollPending, setIsRerollPending] = useState(false);
  const [settledBannerValue, setSettledBannerValue] = useState<number | null>(
    null
  );

  // Listen & Play state
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [highlightedMidi, setHighlightedMidi] = useState<number | null>(null);
  const [playIdx, setPlayIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [noteResults, setNoteResults] = useState<('hit' | 'grace' | 'miss')[]>([]);
  const [graceRemaining, setGraceRemaining] = useState(0);
  const [graceUsedThisRun, setGraceUsedThisRun] = useState(false);
  const [graceBanner, setGraceBanner] = useState(false);
  const [feedbackMidi, setFeedbackMidi] = useState<number | null>(null);
  const [feedbackState, setFeedbackState] = useState<KeyFeedbackState>(null);

  // Results state
  const [lastResult, setLastResult] = useState<SubmitAttemptResponse | null>(
    null
  );
  const [chestReveal, setChestReveal] = useState<OpenChestResponse | null>(
    null
  );
  const [openingChest, setOpeningChest] = useState(false);
  const [heckle, setHeckle] = useState(HECKLE_LINES[0]!);

  const demoTimersRef = useRef<number[]>([]);
  const feedbackTimerRef = useRef<number | null>(null);
  const rollPauseTimerRef = useRef<number | null>(null);
  const shouldAutoPlayNextListenRef = useRef(false);

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
    void fetch('/api/state')
      .then((res) =>
        res.ok ? res.json() : Promise.reject(new Error('Failed to load state'))
      )
      .then((data: StateResponse) => {
        if (!active) return;
        setState(data);
        soundEngine.setVoice(data.profile.selectedVoice);
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
      if (rollPauseTimerRef.current !== null) {
        window.clearTimeout(rollPauseTimerRef.current);
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

  // Auto-play melody once after a fresh d20 roll transitions into LISTEN
  useEffect(() => {
    if (phase === 'LISTEN' && shouldAutoPlayNextListenRef.current && melody) {
      shouldAutoPlayNextListenRef.current = false;
      const t = window.setTimeout(() => {
        playMelodyDemo();
      }, 220);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [phase, melody, playMelodyDemo]);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    soundEngine.setMuted(next);
  };

  const handleDevReset = async () => {
    try {
      clearDemoTimers();
      const res = await fetch('/api/dev-reset', { method: 'POST' });
      if (!res.ok) return;
      const fresh = (await res.json()) as StateResponse;
      setState(fresh);
      setRollTrigger(0);
      setIsRolling(false);
      setIsRerollPending(false);
      setSettledBannerValue(null);
      setLastResult(null);
      setNoteResults([]);
      setPlayIdx(0);
      setCorrectCount(0);
      setError(null);
      setChestReveal(null);
      setPhase('ROLL');
    } catch {
      // ignore
    }
  };

  const handleOpenChest = async () => {
    if (openingChest) return;
    setOpeningChest(true);
    try {
      soundEngine.unlock();
      const res = await fetch('/api/open-chest', { method: 'POST' });
      if (!res.ok) return;
      const data = (await res.json()) as OpenChestResponse;
      setChestReveal(data);
      setState((prev) =>
        prev ? { ...prev, profile: data.profile, daily: data.daily } : prev
      );
      soundEngine.playFanfare();
    } finally {
      setOpeningChest(false);
    }
  };

  const handleSelectVoice = async (voiceId: KeyboardVoiceId) => {
    const res = await fetch('/api/voice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voiceId }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as { profile: PlayerProfile };
    soundEngine.setVoice(data.profile.selectedVoice);
    setState((prev) => (prev ? { ...prev, profile: data.profile } : prev));
  };

  const handleTriggerRoll = (reroll: boolean) => {
    soundEngine.unlock();
    trackJourneyStart();
    setError(null);
    setSettledBannerValue(null);
    setIsRerollPending(reroll);
    setIsRolling(true);
    setRollTrigger((n) => n + 1);
    setPhase('ROLL');
  };

  const handleDiceSettled = useCallback(
    async (value: number) => {
      setIsRolling(false);
      setSettledBannerValue(value);
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

        if (rollPauseTimerRef.current !== null) {
          window.clearTimeout(rollPauseTimerRef.current);
        }
        rollPauseTimerRef.current = window.setTimeout(() => {
          setSettledBannerValue(null);
          shouldAutoPlayNextListenRef.current = true;
          setPhase('LISTEN');
        }, 950);
      } catch (err) {
        setSettledBannerValue(null);
        setError(
          err instanceof Error ? err.message : 'Failed to lock in your roll.'
        );
      }
    },
    [isRerollPending]
  );

  const startAttempt = () => {
    soundEngine.unlock();
    trackJourneyStart();
    clearDemoTimers();
    setPlayIdx(0);
    setCorrectCount(0);
    setNoteResults([]);
    setGraceRemaining(getWardOfGraceCharges(state?.profile.streak ?? 0));
    setGraceUsedThisRun(false);
    setGraceBanner(false);
    setFeedbackMidi(null);
    setFeedbackState(null);
    setLastResult(null);
    setPhase('PLAY');
  };

  const finishAttempt = useCallback(
    async (finalCorrect: number, totalNotes: number, graceUsed: boolean) => {
      const accuracy = totalNotes > 0 ? finalCorrect / totalNotes : 0;
      try {
        const res = await fetch('/api/attempt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accuracy, graceUsed }),
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
    },
    []
  );

  const handleKeyPress = useCallback(
    (midi: number) => {
      if (phase !== 'PLAY' || !melody) return;
      soundEngine.unlock();

      const expected = melody.notes[playIdx];
      if (expected === undefined) return;

      const isExactHit = midi === expected;
      const wardTriggered = !isExactHit && graceRemaining > 0;
      const countedAsHit = isExactHit || wardTriggered;

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(
          wardTriggered ? [12, 30, 12] : isExactHit ? 10 : 28
        );
      }
      if (isExactHit) {
        soundEngine.playNote(midi, 320);
      } else if (wardTriggered) {
        soundEngine.playNote(expected, 280);
        setGraceRemaining((prev) => Math.max(0, prev - 1));
        setGraceUsedThisRun(true);
        setGraceBanner(true);
      } else {
        soundEngine.playWrongNote();
      }

      if (feedbackTimerRef.current !== null) {
        window.clearTimeout(feedbackTimerRef.current);
      }
      setFeedbackMidi(midi);
      setFeedbackState(countedAsHit ? 'correct' : 'wrong');
      feedbackTimerRef.current = window.setTimeout(() => {
        setFeedbackMidi(null);
        setFeedbackState(null);
      }, 260);

      const nextCorrect = correctCount + (countedAsHit ? 1 : 0);
      const nextIdx = playIdx + 1;
      const nextGraceUsed = graceUsedThisRun || wardTriggered;
      setNoteResults((prev) => [
        ...prev,
        isExactHit ? 'hit' : wardTriggered ? 'grace' : 'miss',
      ]);
      setCorrectCount(nextCorrect);
      setPlayIdx(nextIdx);

      if (nextIdx >= melody.notes.length) {
        void finishAttempt(nextCorrect, melody.notes.length, nextGraceUsed);
      }
    },
    [
      phase,
      melody,
      playIdx,
      correctCount,
      graceRemaining,
      graceUsedThisRun,
      finishAttempt,
    ]
  );

  const finalRoll = state?.daily.finalRoll ?? null;
  const tier = finalRoll !== null ? getTierForRoll(finalRoll) : null;
  const settledTier =
    settledBannerValue !== null ? getTierForRoll(settledBannerValue) : null;

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
      <header className="tavern-wood-frame rounded-xl px-3 py-2 flex flex-col gap-1.5">
        {/* Row 1: Title + Action Buttons */}
        <div className="flex items-center justify-between gap-1.5">
          <h1 className="font-serif text-base sm:text-xl font-bold text-[#ffe875] leading-none whitespace-nowrap">
            Lute Roll
          </h1>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setShowLeaderboard(true)}
              className="text-[11px] px-2 py-1 rounded-lg bg-black/45 hover:bg-black/65 border border-[#d4af37]/40 text-[#ffe875] cursor-pointer whitespace-nowrap"
              aria-label="Open leaderboards"
            >
              🏆<span className="hidden sm:inline"> Ranks</span>
            </button>
            <button
              type="button"
              onClick={() => setShowFeats(true)}
              className="text-[11px] px-2 py-1 rounded-lg bg-black/45 hover:bg-black/65 border border-[#d4af37]/40 text-[#ffe875] cursor-pointer whitespace-nowrap"
              aria-label="Open tavern vault"
            >
              🎖️ {state?.profile.feats.length ?? 0}/{FEAT_CATALOG.length}
            </button>
            <button
              type="button"
              onClick={() => setShowGuide(true)}
              className="text-[11px] px-2 py-1 rounded-lg bg-black/45 hover:bg-black/65 border border-[#d4af37]/40 text-[#ffe875] font-bold cursor-pointer"
              aria-label="How to play"
            >
              ?
            </button>
            <button
              type="button"
              onClick={toggleMute}
              className="text-[11px] px-2 py-1 rounded-lg bg-black/45 hover:bg-black/65 border border-[#d4af37]/40 text-[#ffe875] cursor-pointer"
              aria-label={muted ? 'Unmute audio' : 'Mute audio'}
            >
              {muted ? '🔇' : '🔊'}
            </button>
            {state?.isDevSubreddit && (
              <button
                type="button"
                onClick={() => void handleDevReset()}
                className="text-[11px] px-2 py-1 rounded-lg bg-amber-950/70 hover:bg-amber-900/80 border border-amber-400/50 text-amber-200 font-semibold cursor-pointer whitespace-nowrap"
                title="Reset today's roll (dev subreddit only)"
              >
                ↻<span className="hidden sm:inline"> Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Player Identity + Streak */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {state?.profile.snoovatarUrl && (
              <img
                src={state.profile.snoovatarUrl}
                alt=""
                className="w-6 h-6 rounded-full object-cover border border-[#d4af37]/70 bg-black/40 shrink-0"
              />
            )}
            <p className="text-xs text-[#f5ead2]/90 truncate">
              {state
                ? `${state.profile.username} • Lvl ${level} ${state.profile.title}`
                : 'Entering the tavern...'}
            </p>
          </div>
          {state && state.profile.streak > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-black/45 border border-amber-400/40 text-amber-200 shrink-0">
              <img
                src={streakFlameUrl}
                alt="Streak"
                className="w-3.5 h-3.5 object-contain"
              />
              {state.profile.streak}
            </span>
          )}
        </div>

        {/* Row 3: XP Bar */}
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
              {state &&
                state.profile.totalXp === 0 &&
                state.daily.attemptsCount === 0 && (
                  <p className="mt-2 text-[11px] text-[#ffe875] bg-black/40 border border-[#d4af37]/40 rounded-lg px-2.5 py-1">
                    First time? Roll the die, listen to the tune, then tap it
                    back note for note.
                  </p>
                )}
            </div>

            <div className="relative w-full">
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

              {settledBannerValue !== null && settledTier && (
                <div className="absolute inset-0 bg-black/55 rounded-xl flex flex-col items-center justify-center gap-1 p-4 animate-tomato-splat">
                  <span className="font-serif text-4xl font-bold text-[#ffe875] drop-shadow">
                    {settledBannerValue === 20
                      ? '✨ NAT 20! ✨'
                      : settledBannerValue === 1
                        ? '💀 NAT 1! 💀'
                        : `Rolled ${settledBannerValue}`}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-white bg-black/50 px-3 py-1 rounded-full border border-[#d4af37]/50">
                    {settledTier.name} • {settledTier.xpMultiplier}x XP
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={isRolling || settledBannerValue !== null}
              onClick={() => handleTriggerRoll(isRerollPending)}
              className="gold-btn w-full py-3.5 px-5 rounded-xl font-bold text-base cursor-pointer disabled:opacity-60"
            >
              {isRolling
                ? 'Rolling...'
                : settledBannerValue !== null
                  ? 'Setting the Stage...'
                  : 'Toss the d20'}
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
                  {melody.notes.length} notes • Highlighted keys are in play
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
                activeTier={tier}
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
                {isPlayingDemo ? 'Playing...' : '🎵 Replay Tune'}
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
            <div className="flex items-center justify-between text-xs gap-2">
              <span className="font-bold text-[#ffe875]">
                Note {Math.min(playIdx + 1, melody.notes.length)} of{' '}
                {melody.notes.length}
              </span>
              {getWardOfGraceCharges(state?.profile.streak ?? 0) > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    graceRemaining > 0
                      ? 'bg-sky-900/60 border-sky-400/70 text-sky-200'
                      : 'bg-black/40 border-white/15 text-[#f5ead2]/50'
                  }`}
                >
                  🛡️ Ward ×{graceRemaining}
                </span>
              )}
              <span className="text-[#f5ead2]/85">
                Hits: {correctCount}/{playIdx}
              </span>
            </div>

            {graceBanner && (
              <div className="rounded-lg bg-sky-900/50 border border-sky-400/60 px-2.5 py-1 text-[11px] font-bold text-sky-200 text-center">
                🪄 Ward of Grace absorbed a missed note!
              </div>
            )}

            <div className="flex gap-1 w-full">
              {melody.notes.map((_, idx) => {
                const res = noteResults[idx];
                const pipClass =
                  res === 'hit'
                    ? 'bg-emerald-400'
                    : res === 'grace'
                      ? 'bg-sky-400'
                      : res === 'miss'
                        ? 'bg-red-500'
                        : idx === playIdx
                          ? 'bg-[#ffe875]'
                          : 'bg-black/45';
                return (
                  <div
                    key={idx}
                    className={`h-2 flex-1 rounded-full transition-colors ${pipClass}`}
                  />
                );
              })}
            </div>

            <div className="tavern-felt-bg rounded-xl p-2.5 border border-[#754c28]/80 shadow-inner">
              <Keyboard
                highlightedMidi={null}
                feedbackMidi={feedbackMidi}
                feedbackState={feedbackState}
                activeTier={tier}
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
          <div className="tavern-wood-frame w-full rounded-2xl p-3 sm:p-4 flex flex-col items-center text-center gap-2.5">
            {lastResult.passed ? (
              <>
                <div className="w-full flex items-center justify-center gap-3 text-left">
                  {lastResult.accuracy === 1 || finalRoll === 20 ? (
                    <img
                      src={nat20SealUrl}
                      alt="Critical Seal"
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#ffe875] shadow-md shrink-0"
                    />
                  ) : (
                    <div className="text-3xl shrink-0">🎶</div>
                  )}
                  <div className="min-w-0">
                    <h2 className="font-serif text-lg sm:text-xl font-bold text-[#ffe875] leading-tight">
                      {lastResult.accuracy === 1
                        ? 'Flawless Performance!'
                        : 'The Tavern Cheers!'}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#f5ead2]/90">
                      {Math.round(lastResult.accuracy * 100)}% Accuracy •{' '}
                      <span className="font-bold text-[#ffe875]">
                        +{lastResult.xpEarned} XP
                      </span>
                    </p>
                  </div>
                </div>
                {lastResult.leveledUp && (
                  <div className="animate-gold-pulse w-full rounded-xl bg-amber-500/25 border border-amber-300/70 px-3 py-1.5 text-xs font-bold text-[#ffe875]">
                    🎉 Level Up! Level {lastResult.profile.level}{' '}
                    {lastResult.profile.title}!
                  </div>
                )}
                {lastResult.unlockedFeat &&
                  (() => {
                    const meta = FEAT_CATALOG.find(
                      (f) => f.id === lastResult.unlockedFeat
                    );
                    return (
                      <div className="w-full rounded-xl bg-black/45 border border-[#d4af37]/60 px-3 py-1.5 flex items-center justify-center gap-2 text-xs font-bold text-[#ffe875]">
                        <span>{meta?.icon ?? '🎖️'}</span>
                        <span>
                          Feat Unlocked: {meta?.title ?? lastResult.unlockedFeat}!
                        </span>
                      </div>
                    );
                  })()}
              </>
            ) : (
              <div className="animate-tomato-splat w-full flex items-center justify-center gap-3 text-left">
                <img
                  src={tomatoSplatUrl}
                  alt="Tomatoes Thrown"
                  className="w-12 h-12 rounded-full object-cover border-2 border-red-400/70 shadow-md shrink-0"
                />
                <div className="min-w-0">
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-red-300 leading-tight">
                    Tomatoes Thrown!
                  </h2>
                  <p className="text-xs text-[#f5ead2]/90 italic truncate">
                    &ldquo;{heckle}&rdquo;
                  </p>
                  <p className="text-[11px] text-red-200/85">
                    {Math.round(lastResult.accuracy * 100)}% (need{' '}
                    {Math.round(FAIL_ACCURACY_THRESHOLD * 100)}%) • 0 XP
                  </p>
                </div>
              </div>
            )}

            <div className="w-full flex items-center justify-center gap-3 text-[11px] text-[#ffe875]/90 bg-black/35 border border-[#d4af37]/25 rounded-lg px-2.5 py-1">
              <span>Plays: {lastResult.daily.attemptsCount}</span>
              <span>•</span>
              <span>Clears: {lastResult.daily.clearsCount}</span>
              <span>•</span>
              <span>
                Best: {Math.round(lastResult.daily.bestAccuracy * 100)}%
              </span>
            </div>

            {state && state.daily.chestsEarned > state.daily.chestsOpened && (
              <button
                type="button"
                disabled={openingChest}
                onClick={() => void handleOpenChest()}
                className="animate-gold-pulse w-full py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-[#5a3412] via-[#7c4b1a] to-[#5a3412] text-[#ffe875] border-2 border-[#ffe875] shadow-lg cursor-pointer"
              >
                {openingChest
                  ? 'Unlocking Chest...'
                  : `🎁 Crack Open Mystery Chest! (${state.daily.chestsEarned - state.daily.chestsOpened} ready)`}
              </button>
            )}

            {chestReveal &&
              (() => {
                const dropped = RELIC_CATALOG.find(
                  (r) => r.id === chestReveal.relicId
                );
                if (!dropped) return null;
                return (
                  <div className="parchment-card w-full rounded-xl p-2.5 flex items-center justify-between gap-2 text-left border-2 border-[#d4af37]">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xl shrink-0">{dropped.icon}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#1c1208] truncate">
                          {dropped.name} ({dropped.rarity.toUpperCase()})
                        </p>
                        <p className="text-[11px] text-[#6e4726]">
                          {chestReveal.isDuplicate
                            ? `Duplicate: +${chestReveal.bonusXp} Bonus XP!`
                            : `New Relic! (${chestReveal.profile.relics.length}/${RELIC_CATALOG.length})`}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowFeats(true)}
                      className="text-[11px] font-bold px-2 py-1 rounded-lg bg-[#2c1b0e] text-[#ffe875] shrink-0 cursor-pointer"
                    >
                      Vault
                    </button>
                  </div>
                );
              })()}

            <ResultCard
              utcDate={lastResult.daily.utcDate}
              roll={finalRoll}
              accuracy={lastResult.accuracy}
              xpEarned={lastResult.xpEarned}
              passed={lastResult.passed}
              profile={lastResult.profile}
            />

            <div className="w-full flex gap-2">
              <button
                type="button"
                onClick={() => setPhase('LISTEN')}
                className="gold-btn flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm cursor-pointer"
              >
                Play Again (Grind XP)
              </button>
              <button
                type="button"
                onClick={() => setShowLeaderboard(true)}
                className="py-2.5 px-3.5 rounded-xl font-semibold text-xs sm:text-sm bg-[#103524] hover:bg-[#164731] text-[#ffe875] border border-[#d4af37]/50 cursor-pointer"
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
      {showFeats && state && (
        <FeatsModal
          profile={state.profile}
          onSelectVoice={handleSelectVoice}
          onClose={() => setShowFeats(false)}
        />
      )}
      {showGuide && <TavernGuideModal onClose={() => setShowGuide(false)} />}
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Game />
  </StrictMode>
);
