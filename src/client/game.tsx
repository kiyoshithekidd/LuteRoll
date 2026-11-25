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
  EncoreMode,
  GauntletChallenge,
  KeyboardVoiceId,
  NoteResult,
  OpenChestResponse,
  PlayerProfile,
  RelicRarity,
  StateResponse,
  SubmitAttemptResponse,
} from '../shared/api';
import { getPerformanceCommentary } from '../shared/commentary';
import {
  DUPE_PITY_THRESHOLD,
  FAIL_ACCURACY_THRESHOLD,
  FEAT_CATALOG,
  getDailyBounty,
  getTierForRoll,
  getWardOfGraceCharges,
  RELIC_CATALOG,
  xpRequiredForLevel,
} from '../shared/constants';
import { generateMelody } from '../shared/melodyGenerator';
import {
  getCosmeticForRelic,
  type BardAvatarConfig,
} from '../shared/cosmetics';
import { apiFetch } from './apiClient';
import streakFlameUrl from './assets/streak-flame.webp';
import tomatoSplatUrl from './assets/tomato-splat.webp';
import nat20SealUrl from './assets/nat20-seal.webp';
import { soundEngine } from './audio/soundEngine';
import { BardAvatar } from './components/BardAvatar';
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

const RARITY_BORDER: Record<RelicRarity, string> = {
  common: 'border-stone-400',
  uncommon: 'border-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.45)]',
  rare: 'border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.55)]',
  mythic: 'border-[#ffe875] shadow-[0_0_26px_rgba(255,232,117,0.85)]',
};

const CONFETTI_SPECS = [
  { left: '12%', delay: '0ms', emoji: '✨' },
  { left: '26%', delay: '90ms', emoji: '🪙' },
  { left: '42%', delay: '40ms', emoji: '✨' },
  { left: '58%', delay: '130ms', emoji: '🎵' },
  { left: '74%', delay: '60ms', emoji: '✨' },
  { left: '88%', delay: '150ms', emoji: '🪙' },
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
  const [targetRoll, setTargetRoll] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [isRerollPending, setIsRerollPending] = useState(false);
  const [settledBannerValue, setSettledBannerValue] = useState<number | null>(
    null
  );

  // Listen & Play state
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [demoNoteIdx, setDemoNoteIdx] = useState<number | null>(null);
  const [highlightedMidi, setHighlightedMidi] = useState<number | null>(null);
  const [playIdx, setPlayIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [comboStreak, setComboStreak] = useState(0);
  const [noteResults, setNoteResults] = useState<NoteResult[]>([]);
  const [graceRemaining, setGraceRemaining] = useState(0);
  const [graceUsedThisRun, setGraceUsedThisRun] = useState(false);
  const [graceBanner, setGraceBanner] = useState(false);
  const [feedbackMidi, setFeedbackMidi] = useState<number | null>(null);
  const [feedbackState, setFeedbackState] = useState<KeyFeedbackState>(null);

  // Results & Pizzazz state
  const [lastResult, setLastResult] = useState<SubmitAttemptResponse | null>(
    null
  );
  const [chestReveal, setChestReveal] = useState<OpenChestResponse | null>(
    null
  );
  const [openingChest, setOpeningChest] = useState(false);
  const [heckle, setHeckle] = useState(HECKLE_LINES[0]!);
  const [showTomatoBurst, setShowTomatoBurst] = useState(false);
  const [showConfettiBurst, setShowConfettiBurst] = useState(false);
  const [shakeStage, setShakeStage] = useState(false);

  // Encore & Bardic Gauntlet state
  const [encoreMode, setEncoreMode] = useState<EncoreMode>('standard');
  const [activeGauntlet, setActiveGauntlet] =
    useState<GauntletChallenge | null>(null);
  const [gauntletNotice, setGauntletNotice] = useState<string | null>(null);
  const [creatingGauntlet, setCreatingGauntlet] = useState(false);

  const demoTimersRef = useRef<number[]>([]);
  const feedbackTimerRef = useRef<number | null>(null);
  const rollPauseTimerRef = useRef<number | null>(null);
  const burstTimerRef = useRef<number | null>(null);
  const shouldAutoPlayNextListenRef = useRef(false);
  const pendingRollDataRef = useRef<CommitRollResponse | null>(null);

  const clearDemoTimers = useCallback(() => {
    for (const id of demoTimersRef.current) {
      window.clearTimeout(id);
    }
    demoTimersRef.current = [];
    setIsPlayingDemo(false);
    setDemoNoteIdx(null);
    setHighlightedMidi(null);
  }, []);

  useEffect(() => {
    trackAppReady();
    let active = true;
    void apiFetch('/api/state')
      .then((res) =>
        res.ok ? res.json() : Promise.reject(new Error('Failed to load state'))
      )
      .then((data: StateResponse) => {
        if (!active) return;
        setState(data);
        soundEngine.setVoice(data.profile.selectedVoice);
        setPhase(data.daily.finalRoll !== null ? 'LISTEN' : 'ROLL');
        try {
          const raw = localStorage.getItem('luteroll_open_modal_at');
          if (raw) {
            localStorage.removeItem('luteroll_open_modal_at');
            const parsed = JSON.parse(raw) as {
              modal?: 'vault' | 'guide';
              at?: number;
            };
            if (parsed.at && Date.now() - parsed.at < 15_000) {
              if (parsed.modal === 'vault') setShowFeats(true);
              if (parsed.modal === 'guide') setShowGuide(true);
            }
          }
        } catch {
          // ignore storage errors
        }
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
      if (burstTimerRef.current !== null) {
        window.clearTimeout(burstTimerRef.current);
      }
    };
  }, [clearDemoTimers]);

  const melody = useMemo(() => {
    const base = activeGauntlet
      ? generateMelody(
          activeGauntlet.utcDate,
          activeGauntlet.seedKey,
          activeGauntlet.roll
        )
      : state && state.daily.finalRoll !== null
        ? generateMelody(
            state.daily.utcDate,
            state.profile.username,
            state.daily.finalRoll
          )
        : null;
    if (!base) return null;
    return encoreMode === 'fast_tempo'
      ? { ...base, tempoMs: Math.round(base.tempoMs * 0.8) }
      : base;
  }, [state, activeGauntlet, encoreMode]);

  const playMelodyDemo = useCallback(() => {
    if (!melody || isPlayingDemo) return;
    soundEngine.unlock();
    clearDemoTimers();
    setIsPlayingDemo(true);
    trackJourneyProgress(0.55, 'listen_melody');

    // Soft root-5th lute pluck cue before note 0 so the ear locks into the key
    const firstNote = melody.notes[0];
    if (firstNote !== undefined) {
      soundEngine.playChordCue(firstNote);
    }

    const leadInMs = 280;
    melody.notes.forEach((midi, idx) => {
      const startAt = leadInMs + idx * melody.tempoMs;
      const t1 = window.setTimeout(() => {
        setDemoNoteIdx(idx);
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
      setDemoNoteIdx(null);
      setHighlightedMidi(null);
    }, leadInMs + melody.notes.length * melody.tempoMs + 90);
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

  const triggerStageEffect = useCallback((kind: 'tomato' | 'confetti') => {
    if (burstTimerRef.current !== null) {
      window.clearTimeout(burstTimerRef.current);
    }
    if (kind === 'tomato') {
      setShowTomatoBurst(true);
      setShakeStage(true);
      burstTimerRef.current = window.setTimeout(() => {
        setShowTomatoBurst(false);
        setShakeStage(false);
      }, 1300);
    } else {
      setShowConfettiBurst(true);
      burstTimerRef.current = window.setTimeout(() => {
        setShowConfettiBurst(false);
      }, 1350);
    }
  }, []);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    soundEngine.setMuted(next);
  };

  const openModal = (modal: 'leaderboard' | 'feats' | 'guide') => {
    clearDemoTimers();
    if (modal === 'leaderboard') setShowLeaderboard(true);
    else if (modal === 'feats') setShowFeats(true);
    else setShowGuide(true);
  };

  const handleDevReset = async () => {
    try {
      clearDemoTimers();
      const res = await apiFetch('/api/dev-reset', { method: 'POST' });
      if (!res.ok) return;
      const fresh = (await res.json()) as StateResponse;
      setState(fresh);
      setRollTrigger(0);
      setTargetRoll(null);
      setIsRolling(false);
      setIsRerollPending(false);
      setSettledBannerValue(null);
      setLastResult(null);
      setNoteResults([]);
      setPlayIdx(0);
      setCorrectCount(0);
      setComboStreak(0);
      setError(null);
      setChestReveal(null);
      setPhase('ROLL');
    } catch {
      // ignore
    }
  };

  const handleDevUnlockAll = async () => {
    try {
      clearDemoTimers();
      const res = await apiFetch('/api/dev-unlock-all', { method: 'POST' });
      if (!res.ok) return;
      const fresh = (await res.json()) as StateResponse;
      setState(fresh);
      soundEngine.playFanfare();
      triggerStageEffect('confetti');
    } catch {
      // ignore
    }
  };

  const handleOpenChest = async () => {
    if (openingChest) return;
    setOpeningChest(true);
    setChestReveal(null);
    try {
      soundEngine.unlock();
      soundEngine.playChestShake();
      const [res] = await Promise.all([
        apiFetch('/api/open-chest', { method: 'POST' }),
        new Promise((resolve) => window.setTimeout(resolve, 560)),
      ]);
      if (!res.ok) return;
      const data = (await res.json()) as OpenChestResponse;
      setChestReveal(data);
      setState((prev) =>
        prev ? { ...prev, profile: data.profile, daily: data.daily } : prev
      );
      const dropped = RELIC_CATALOG.find((r) => r.id === data.relicId);
      soundEngine.playRarityReveal(dropped?.rarity ?? 'common');
      if (
        dropped?.rarity === 'mythic' ||
        dropped?.rarity === 'rare' ||
        data.leveledUp
      ) {
        triggerStageEffect('confetti');
      }
    } finally {
      setOpeningChest(false);
    }
  };

  const handleSelectVoice = async (voiceId: KeyboardVoiceId) => {
    const res = await apiFetch('/api/voice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voiceId }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as { profile: PlayerProfile };
    soundEngine.setVoice(data.profile.selectedVoice);
    setState((prev) => (prev ? { ...prev, profile: data.profile } : prev));
  };

  const handleSaveAvatar = async (bardAvatar: BardAvatarConfig) => {
    const res = await apiFetch('/api/avatar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bardAvatar }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as { profile: PlayerProfile };
    setState((prev) => (prev ? { ...prev, profile: data.profile } : prev));
  };

  // B3 & B4 fix: cancel demo timers first, request authoritative roll from server, then animate 3D d20
  const handleTriggerRoll = async (reroll: boolean) => {
    if (isRolling || settledBannerValue !== null) return;
    clearDemoTimers();
    soundEngine.unlock();
    trackJourneyStart();
    setError(null);
    setSettledBannerValue(null);
    setIsRerollPending(reroll);
    setIsRolling(true);
    setPhase('ROLL');

    try {
      const res = await apiFetch('/api/roll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isReroll: reroll }),
      });
      if (!res.ok) {
        const errData = (await res.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(errData.message ?? 'Roll failed');
      }
      const data = (await res.json()) as CommitRollResponse;
      pendingRollDataRef.current = data;
      setTargetRoll(data.roll);
      setRollTrigger((n) => n + 1);
    } catch (err) {
      setIsRolling(false);
      setError(
        err instanceof Error ? err.message : 'Failed to roll your d20.'
      );
    }
  };

  const handleDiceSettled = useCallback(
    (value: number) => {
      setIsRolling(false);
      setSettledBannerValue(value);
      if (value === 20) {
        soundEngine.playFanfare();
        triggerStageEffect('confetti');
      } else if (value === 1) {
        soundEngine.playLowDrum();
        setShakeStage(true);
        window.setTimeout(() => setShakeStage(false), 450);
      } else {
        soundEngine.playNote(67, 260, 'tavern_lute');
      }

      trackJourneyProgress(0.3, `rolled_${value}`);

      const data = pendingRollDataRef.current;
      if (data) {
        pendingRollDataRef.current = null;
        setState((prev) => {
          if (!prev) return prev;
          const mergedFeats = [...prev.profile.feats];
          for (const f of data.unlockedFeats) {
            if (!mergedFeats.includes(f)) mergedFeats.push(f);
          }
          return {
            ...prev,
            daily: data.daily,
            tavernStats: data.tavernStats ?? prev.tavernStats,
            profile: {
              ...prev.profile,
              feats: mergedFeats,
            },
          };
        });
      }

      if (rollPauseTimerRef.current !== null) {
        window.clearTimeout(rollPauseTimerRef.current);
      }
      rollPauseTimerRef.current = window.setTimeout(() => {
        setSettledBannerValue(null);
        shouldAutoPlayNextListenRef.current = true;
        setPhase('LISTEN');
      }, 650);
    },
    [triggerStageEffect]
  );

  const startAttempt = () => {
    soundEngine.unlock();
    trackJourneyStart();
    clearDemoTimers();
    setPlayIdx(0);
    setCorrectCount(0);
    setComboStreak(0);
    setNoteResults([]);
    setGraceRemaining(getWardOfGraceCharges(state?.profile.streak ?? 0));
    setGraceUsedThisRun(false);
    setGraceBanner(false);
    setFeedbackMidi(null);
    setFeedbackState(null);
    setLastResult(null);
    setChestReveal(null);
    setError(null);
    setPhase('PLAY');
  };

  const finishAttempt = useCallback(
    async (
      finalCorrect: number,
      totalNotes: number,
      graceUsed: boolean,
      finalResults: NoteResult[],
      activeUtcDate?: string
    ) => {
      const accuracy = totalNotes > 0 ? finalCorrect / totalNotes : 0;
      try {
        const res = await apiFetch('/api/attempt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accuracy,
            graceUsed,
            noteResults: finalResults,
            utcDate: activeUtcDate,
            encoreMode,
            gauntletId: activeGauntlet?.id,
          }),
        });
        if (!res.ok) {
          const errData = (await res.json().catch(() => ({}))) as {
            message?: string;
          };
          throw new Error(errData.message ?? 'Failed to save attempt');
        }
        const data = (await res.json()) as SubmitAttemptResponse;
        setLastResult(data);
        setState((prev) =>
          prev
            ? {
                ...prev,
                profile: data.profile,
                daily: data.daily,
                tavernStats: data.tavernStats ?? prev.tavernStats,
              }
            : prev
        );
        trackJourneyEnd(data.passed, data.xpEarned);

        if (!data.passed) {
          setHeckle(
            HECKLE_LINES[Math.floor(Math.random() * HECKLE_LINES.length)]!
          );
          soundEngine.playTomatoSplat();
          triggerStageEffect('tomato');
        } else if (data.leveledUp || accuracy === 1) {
          soundEngine.playFanfare();
          triggerStageEffect('confetti');
        }
        setPhase('RESULTS');
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Could not save your performance to the tavern ledger.'
        );
      }
    },
    [triggerStageEffect, encoreMode, activeGauntlet]
  );

  const handleStartRandomGauntlet = useCallback(async () => {
    setGauntletNotice(null);
    try {
      const res = await apiFetch('/api/gauntlet/random');
      if (!res.ok) throw new Error('Could not find a rival bard');
      const data = (await res.json()) as {
        ok: boolean;
        challenge: GauntletChallenge | null;
      };
      if (!data.challenge) {
        setGauntletNotice(
          'No rival gauntlets in the tavern yet — clear your tune and throw the first one!'
        );
        return;
      }
      clearDemoTimers();
      setActiveGauntlet(data.challenge);
      setEncoreMode('standard');
      setLastResult(null);
      setPhase('LISTEN');
      shouldAutoPlayNextListenRef.current = true;
    } catch {
      setGauntletNotice('Could not summon a rival bard right now.');
    }
  }, [clearDemoTimers]);

  const handleThrowGauntlet = useCallback(async () => {
    if (creatingGauntlet || !lastResult) return;
    setCreatingGauntlet(true);
    setGauntletNotice(null);
    try {
      const res = await apiFetch('/api/gauntlet/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accuracy: lastResult.accuracy,
          utcDate: lastResult.daily.utcDate,
        }),
      });
      if (!res.ok) throw new Error('Failed to throw gauntlet');
      const data = (await res.json()) as {
        ok: boolean;
        challenge: GauntletChallenge;
      };
      setGauntletNotice(
        `⚔️ Gauntlet thrown! (${Math.round(data.challenge.challengerAccuracy * 100)}% on Roll ${data.challenge.roll}) Other bards can now duel your exact melody!`
      );
    } catch {
      setGauntletNotice('Could not post your Bardic Gauntlet.');
    } finally {
      setCreatingGauntlet(false);
    }
  }, [creatingGauntlet, lastResult]);

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
        setComboStreak((c) => c + 1);
      } else if (wardTriggered) {
        soundEngine.playNote(expected, 280);
        setGraceRemaining((prev) => Math.max(0, prev - 1));
        setGraceUsedThisRun(true);
        setGraceBanner(true);
        setComboStreak(0);
      } else {
        soundEngine.playWrongNote();
        setComboStreak(0);
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
      const nextNoteRes: NoteResult = isExactHit
        ? 'hit'
        : wardTriggered
          ? 'grace'
          : 'miss';
      const updatedResults = [...noteResults, nextNoteRes];
      setNoteResults(updatedResults);
      setCorrectCount(nextCorrect);
      setPlayIdx(nextIdx);

      if (nextIdx >= melody.notes.length) {
        void finishAttempt(
          nextCorrect,
          melody.notes.length,
          nextGraceUsed,
          updatedResults,
          state?.daily.utcDate
        );
      }
    },
    [
      phase,
      melody,
      playIdx,
      correctCount,
      graceRemaining,
      graceUsedThisRun,
      noteResults,
      state?.daily.utcDate,
      finishAttempt,
    ]
  );

  const finalRoll = state?.daily.finalRoll ?? null;
  const effectiveRoll = activeGauntlet ? activeGauntlet.roll : finalRoll;
  const tier = effectiveRoll !== null ? getTierForRoll(effectiveRoll) : null;
  const settledTier =
    settledBannerValue !== null ? getTierForRoll(settledBannerValue) : null;
  const anyModalOpen = showLeaderboard || showFeats || showGuide;

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

  const tavernStats = lastResult?.tavernStats ?? state?.tavernStats;
  const tipJarPct = tavernStats
    ? Math.min(
        100,
        Math.round(
          (tavernStats.communityXpToday /
            Math.max(1, tavernStats.communityGoalXp)) *
            100
        )
      )
    : 0;

  return (
    <div
      className={`tavern-stage-bg relative min-h-screen w-full flex flex-col justify-between p-2.5 sm:p-4 gap-2 overflow-x-hidden ${
        shakeStage ? 'animate-stage-shake' : ''
      }`}
    >
      {/* Procedural Flying Tomato Splat Overlay on Fail (<50%) */}
      {showTomatoBurst && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
        >
          <img
            src={tomatoSplatUrl}
            alt=""
            className="animate-tomato-fly absolute top-[18%] left-[12%] w-16 h-16 rounded-full object-cover shadow-xl"
          />
          <img
            src={tomatoSplatUrl}
            alt=""
            style={{ animationDelay: '90ms' }}
            className="animate-tomato-fly absolute top-[26%] right-[14%] w-20 h-20 rounded-full object-cover shadow-xl"
          />
          <img
            src={tomatoSplatUrl}
            alt=""
            style={{ animationDelay: '180ms' }}
            className="animate-tomato-fly absolute top-[44%] left-[38%] w-14 h-14 rounded-full object-cover shadow-xl"
          />
        </div>
      )}

      {/* Procedural Gold Confetti Burst on Nat 20 / Flawless / Rare+ Chest */}
      {showConfettiBurst && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
        >
          {CONFETTI_SPECS.map((c, idx) => (
            <span
              key={idx}
              style={{ left: c.left, animationDelay: c.delay }}
              className="animate-confetti-pop absolute top-[14%] text-xl drop-shadow"
            >
              {c.emoji}
            </span>
          ))}
        </div>
      )}

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
              onClick={() => openModal('leaderboard')}
              className="text-[11px] px-2 py-1 rounded-lg bg-black/45 hover:bg-black/65 border border-[#d4af37]/40 text-[#ffe875] cursor-pointer whitespace-nowrap"
              aria-label="Open leaderboards"
            >
              🏆<span className="hidden sm:inline"> Ranks</span>
            </button>
            <button
              type="button"
              onClick={() => openModal('feats')}
              className="text-[11px] px-2 py-1 rounded-lg bg-black/45 hover:bg-black/65 border border-[#d4af37]/40 text-[#ffe875] cursor-pointer whitespace-nowrap"
              aria-label="Open tavern vault"
            >
              🎖️ {state?.profile.feats.length ?? 0}/{FEAT_CATALOG.length}
            </button>
            <button
              type="button"
              onClick={() => openModal('guide')}
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
              <>
                <button
                  type="button"
                  onClick={() => void handleDevUnlockAll()}
                  className="text-[11px] px-2 py-1 rounded-lg bg-emerald-950/75 hover:bg-emerald-900/80 border border-emerald-400/50 text-emerald-200 font-semibold cursor-pointer whitespace-nowrap"
                  title="Unlock all 48 relics, 15 feats, voices & Bard wearables (dev subreddit only)"
                >
                  🔓<span className="hidden sm:inline"> All</span>
                </button>
                <button
                  type="button"
                  onClick={() => void handleDevReset()}
                  className="text-[11px] px-2 py-1 rounded-lg bg-amber-950/70 hover:bg-amber-900/80 border border-amber-400/50 text-amber-200 font-semibold cursor-pointer whitespace-nowrap"
                  title="Reset today's roll (dev subreddit only)"
                >
                  ↻<span className="hidden sm:inline"> Reset</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Row 2: Player Identity + Streak */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {state && (
              <button
                type="button"
                onClick={() => openModal('feats')}
                className="cursor-pointer rounded-full focus:outline-none focus:ring-2 focus:ring-[#ffe875]"
                title="Customize your Bard in the Tavern Vault"
              >
                <BardAvatar
                  config={state.profile.bardAvatar}
                  snoovatarUrl={state.profile.snoovatarUrl}
                  size="sm"
                />
              </button>
            )}
            <p className="text-xs text-[#f5ead2]/90 truncate">
              {state
                ? `${state.profile.username} • Lvl ${level} ${state.profile.title}`
                : 'Entering the tavern...'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {state && state.profile.streakFreezes > 0 && (
              <span
                title="Tavern Streak Freeze: auto-saves your streak if you miss 1 day"
                className="inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-950/70 border border-sky-400/50 text-sky-200"
              >
                🧊 {state.profile.streakFreezes}
              </span>
            )}
            {state && state.profile.streak > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-black/45 border border-amber-400/40 text-amber-200">
                <img
                  src={streakFlameUrl}
                  alt="Streak"
                  className="w-3.5 h-3.5 object-contain"
                />
                {state.profile.streak}
              </span>
            )}
          </div>
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
          <div className="tavern-wood-frame w-full rounded-2xl p-4 sm:p-5 flex flex-col items-center gap-3 text-center">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#ffe875]">
                {isRerollPending ? 'Daily Reroll' : "Roll Today's d20"}
              </h2>
              <p className="text-xs text-[#f5ead2]/80 mt-0.5">
                High roll = easier tune • Nat 20 = 3.0x crit payout • Nat 1 =
                Brutal 3.0x
              </p>
              {state &&
                (() => {
                  const bounty = getDailyBounty(state.daily.utcDate);
                  return (
                    <div
                      className={`mt-2 inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border ${
                        state.daily.bountyClaimed
                          ? 'bg-emerald-950/60 border-emerald-400/50 text-emerald-200'
                          : 'bg-black/40 border-[#d4af37]/40 text-[#ffe875]'
                      }`}
                    >
                      <span>{bounty.icon}</span>
                      <span className="font-bold">
                        {state.daily.bountyClaimed
                          ? `Bounty Claimed (+${bounty.bonusXp} XP)`
                          : `Bounty: ${bounty.description} (+${bounty.bonusXp} XP)`}
                      </span>
                    </div>
                  );
                })()}
              {state &&
                state.profile.totalXp === 0 &&
                state.daily.attemptsCount === 0 && (
                  <p className="mt-2 text-[11px] text-[#ffe875] bg-black/40 border border-[#d4af37]/40 rounded-lg px-2.5 py-1">
                    First time? Tap the tray or button to roll, listen, then tap
                    it back note for note.
                  </p>
                )}
            </div>

            <div className="relative w-full">
              <Suspense
                fallback={
                  <div className="tavern-felt-bg w-full h-48 sm:h-56 rounded-xl border-2 border-[#754c28] flex items-center justify-center text-xs text-[#ffe875]">
                    Preparing dice tray...
                  </div>
                }
              >
                <DiceTray3D
                  rollTrigger={rollTrigger}
                  targetRoll={targetRoll}
                  diceSkin={state?.profile.bardAvatar.diceSkin ?? 'tavern_gold'}
                  onSettled={handleDiceSettled}
                  onTrayTap={() => void handleTriggerRoll(isRerollPending)}
                />
              </Suspense>

              {rollTrigger === 0 && !isRolling && (
                <span className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-black/60 border border-[#d4af37]/45 text-[10px] font-semibold text-[#ffe875]">
                  Tap the die or button to toss
                </span>
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
              onClick={() => void handleTriggerRoll(isRerollPending)}
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
          <div className="tavern-wood-frame w-full rounded-2xl p-3.5 sm:p-5 flex flex-col gap-3">
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
                <p className="text-xs text-[#f5ead2]/80 mt-0.5">
                  {melody.notes.length} notes • Highlighted keys are in play
                </p>
              </div>
              {state && !state.daily.rerollUsed && (
                <button
                  type="button"
                  onClick={() => void handleTriggerRoll(true)}
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-black/45 hover:bg-black/65 border border-[#d4af37]/45 text-[#ffe875] cursor-pointer shrink-0"
                >
                  🎲 Reroll (1 left)
                </button>
              )}
            </div>

            {effectiveRoll === 20 && (
              <div className="animate-gold-pulse rounded-xl bg-amber-500/25 border border-amber-300/70 px-3 py-1.5 text-center text-xs font-bold text-[#ffe875]">
                ✨ CRITICAL SUCCESS! Easiest tune with 3.0x XP payout!
              </div>
            )}
            {effectiveRoll === 1 && (
              <div className="rounded-xl bg-red-950/80 border border-red-400/60 px-3 py-1.5 text-center text-xs font-bold text-red-200">
                💀 BRUTAL! Hardest tune, clearable for 3.0x XP!
              </div>
            )}

            {activeGauntlet && (
              <div className="rounded-xl bg-purple-950/75 border border-purple-400/60 px-3 py-1.5 flex items-center justify-between gap-2 text-xs text-purple-100">
                <span className="truncate">
                  ⚔️ <span className="font-bold">Bardic Gauntlet:</span>{' '}
                  Beat u/{activeGauntlet.challengerUsername}&apos;s{' '}
                  <span className="font-bold text-[#ffe875]">
                    {Math.round(activeGauntlet.challengerAccuracy * 100)}%
                  </span>{' '}
                  (Roll {activeGauntlet.roll})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    clearDemoTimers();
                    setActiveGauntlet(null);
                  }}
                  className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/45 border border-purple-300/40 text-purple-100 shrink-0 cursor-pointer"
                >
                  Exit Duel
                </button>
              </div>
            )}

            {gauntletNotice && (
              <div className="rounded-xl bg-black/50 border border-[#d4af37]/45 px-3 py-1.5 text-center text-[11px] text-[#ffe875]">
                {gauntletNotice}
              </div>
            )}

            {state && state.daily.clearsCount >= 1 && (
              <div className="flex items-center justify-between gap-1.5 rounded-xl bg-black/40 border border-[#d4af37]/30 p-1">
                {(
                  [
                    { id: 'standard', label: '🎵 Standard' },
                    { id: 'no_lights', label: '🕶️ No-Lights +50%' },
                    { id: 'fast_tempo', label: '⚡ Fast +50%' },
                  ] as const
                ).map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setEncoreMode(mode.id)}
                    className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold transition-colors cursor-pointer ${
                      encoreMode === mode.id
                        ? 'bg-[#d4af37] text-[#1c1208]'
                        : 'text-[#f5ead2]/80 hover:text-white'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            )}

            {/* LISTEN progress pips so players can count notes visually */}
            <div className="flex gap-1 w-full" aria-hidden="true">
              {melody.notes.map((_, idx) => {
                const pipClass =
                  demoNoteIdx === idx
                    ? 'bg-[#ffe875] scale-y-125'
                    : demoNoteIdx !== null && idx < demoNoteIdx
                      ? 'bg-[#d4af37]/80'
                      : 'bg-black/45';
                return (
                  <div
                    key={idx}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-100 ${pipClass}`}
                  />
                );
              })}
            </div>

            <Keyboard
              highlightedMidi={highlightedMidi}
              feedbackMidi={null}
              feedbackState={null}
              activeTier={tier}
              voiceId={state?.profile.selectedVoice ?? 'grand_piano'}
              particleSkin={
                state?.profile.bardAvatar.particleSkin ?? 'emerald_spark'
              }
              disabled
              onKeyPress={() => {}}
            />

            <div className="flex gap-2">
              <button
                type="button"
                disabled={isPlayingDemo}
                onClick={playMelodyDemo}
                className="flex-1 py-3 px-3 rounded-xl font-semibold text-sm bg-[#103524] hover:bg-[#164731] text-[#ffe875] border border-[#d4af37]/50 cursor-pointer disabled:opacity-60"
              >
                {isPlayingDemo ? 'Playing...' : '🎵 Replay Tune'}
              </button>
              <button
                type="button"
                onClick={startAttempt}
                className="gold-btn flex-1 py-3 px-3 rounded-xl font-bold text-sm cursor-pointer"
              >
                🎹 Play It Back
              </button>
            </div>

            {!activeGauntlet && (
              <button
                type="button"
                onClick={() => void handleStartRandomGauntlet()}
                className="w-full py-1.5 px-3 rounded-xl text-xs font-semibold bg-purple-950/60 hover:bg-purple-900/70 text-purple-100 border border-purple-400/45 cursor-pointer"
              >
                ⚔️ Random Gauntlet (Duel a Rival&apos;s Exact Melody)
              </button>
            )}
          </div>
        )}

        {phase === 'PLAY' && melody && tier && (
          <div className="tavern-wood-frame w-full rounded-2xl p-3.5 sm:p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs gap-2">
              <span className="font-bold text-[#ffe875]">
                Note {Math.min(playIdx + 1, melody.notes.length)} of{' '}
                {melody.notes.length}
              </span>
              <div className="flex items-center gap-1.5">
                {comboStreak >= 3 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/25 border border-amber-300/70 text-[#ffe875]">
                    🔥 {comboStreak}x
                  </span>
                )}
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
              </div>
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

            <Keyboard
              highlightedMidi={null}
              feedbackMidi={feedbackMidi}
              feedbackState={feedbackState}
              activeTier={tier}
              voiceId={state?.profile.selectedVoice ?? 'grand_piano'}
              particleSkin={
                state?.profile.bardAvatar.particleSkin ?? 'emerald_spark'
              }
              noLights={phase === 'PLAY' && encoreMode === 'no_lights'}
              disabled={anyModalOpen}
              onKeyPress={handleKeyPress}
            />

            <button
              type="button"
              onClick={() => setPhase('LISTEN')}
              className="text-xs text-[#f5ead2]/75 hover:text-white underline self-center cursor-pointer pt-0.5"
            >
              Listen again before finishing
            </button>
          </div>
        )}

        {phase === 'RESULTS' &&
          lastResult &&
          tier &&
          effectiveRoll !== null &&
          (() => {
            const commentary = getPerformanceCommentary({
              accuracy: lastResult.accuracy,
              passed: lastResult.passed,
              roll: effectiveRoll,
              graceUsed: graceUsedThisRun,
              seed: `${lastResult.daily.utcDate}:${lastResult.daily.attemptsCount}`,
            });
            return (
              <div className="tavern-wood-frame w-full rounded-2xl p-3 sm:p-4 flex flex-col items-center text-center gap-2">
                {lastResult.passed ? (
                  <>
                    <div className="w-full flex items-center justify-center gap-3 text-left">
                      {lastResult.accuracy === 1 || effectiveRoll === 20 ? (
                        <img
                          src={nat20SealUrl}
                          alt="Critical Seal"
                          className="w-11 h-11 rounded-full object-cover border-2 border-[#ffe875] shadow-md shrink-0"
                        />
                      ) : (
                        <div className="text-3xl shrink-0">🎶</div>
                      )}
                      <div className="min-w-0">
                        <h2 className="font-serif text-lg sm:text-xl font-bold text-[#ffe875] leading-tight">
                          {commentary.headline}
                        </h2>
                        <p className="text-[11px] text-[#f5ead2]/80 italic">
                          {commentary.subline}
                        </p>
                        <p className="text-xs sm:text-sm text-[#f5ead2]/90">
                          {Math.round(lastResult.accuracy * 100)}% Accuracy •{' '}
                          <span className="font-bold text-[#ffe875]">
                            +{lastResult.xpEarned} XP
                          </span>
                          {Boolean(lastResult.encoreBonusXp) && (
                            <span className="text-[11px] text-amber-200">
                              {' '}
                              (incl. +{lastResult.encoreBonusXp} Encore)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    {lastResult.gauntletVerdict && (
                      <div
                        className={`w-full rounded-xl px-3 py-1 text-xs font-bold border ${
                          lastResult.gauntletVerdict.won
                            ? 'bg-purple-950/80 border-purple-400/70 text-purple-100'
                            : 'bg-black/50 border-purple-400/40 text-purple-200'
                        }`}
                      >
                        {lastResult.gauntletVerdict.won
                          ? `⚔️ Gauntlet Victory! Beat u/${lastResult.gauntletVerdict.challengerUsername} (${Math.round(lastResult.gauntletVerdict.challengerAccuracy * 100)}%) • +${lastResult.gauntletVerdict.bonusXp} XP!`
                          : lastResult.gauntletVerdict.tied
                            ? `⚔️ Gauntlet Tied with u/${lastResult.gauntletVerdict.challengerUsername} (${Math.round(lastResult.gauntletVerdict.challengerAccuracy * 100)}%)!`
                            : `⚔️ u/${lastResult.gauntletVerdict.challengerUsername} held the stage (${Math.round(lastResult.gauntletVerdict.challengerAccuracy * 100)}%)`}
                      </div>
                    )}
                    {Boolean(lastResult.encoreChallengeBonusXp) && (
                      <div className="w-full rounded-xl bg-amber-950/75 border border-amber-400/60 px-3 py-1 text-xs font-bold text-amber-200">
                        {encoreMode === 'no_lights' ? '🕶️ No-Lights' : '⚡ Fast Tempo'}{' '}
                        Encore Clear! +{lastResult.encoreChallengeBonusXp} Bonus XP!
                      </div>
                    )}
                    {lastResult.milestoneChestAwarded && (
                      <div className="animate-gold-pulse w-full rounded-xl bg-emerald-950/80 border border-emerald-400/70 px-3 py-1 text-xs font-bold text-emerald-200">
                        🔥 {lastResult.profile.streak}-Day Streak Milestone!{' '}
                        {lastResult.milestoneChestAwarded === 'mythic'
                          ? 'Mythic-or-New'
                          : 'Guaranteed New'}{' '}
                        Chest Awarded!
                      </div>
                    )}
                    {lastResult.leveledUp && (
                      <div className="animate-gold-pulse w-full rounded-xl bg-amber-500/25 border border-amber-300/70 px-3 py-1 text-xs font-bold text-[#ffe875]">
                        🎉 Level Up! Level {lastResult.profile.level}{' '}
                        {lastResult.profile.title}!
                      </div>
                    )}
                    {lastResult.streakSavedByFreeze && (
                      <div className="w-full rounded-xl bg-sky-950/70 border border-sky-400/60 px-3 py-1 text-xs font-bold text-sky-200">
                        🧊 Streak Freeze saved your {lastResult.profile.streak}-day
                        streak!
                      </div>
                    )}
                    {Boolean(lastResult.bountyCompletedXp) && (
                      <div className="w-full rounded-xl bg-emerald-950/70 border border-emerald-400/60 px-3 py-1 text-xs font-bold text-emerald-200">
                        🎯 Daily Bounty Complete! +{lastResult.bountyCompletedXp}{' '}
                        Bonus XP!
                      </div>
                    )}
                    {lastResult.unlockedFeats.length > 0 && (
                      <div className="w-full flex flex-col gap-1">
                        {lastResult.unlockedFeats.map((featId) => {
                          const meta = FEAT_CATALOG.find((f) => f.id === featId);
                          return (
                            <div
                              key={featId}
                              className="w-full rounded-xl bg-black/45 border border-[#d4af37]/60 px-3 py-1 flex items-center justify-center gap-2 text-xs font-bold text-[#ffe875]"
                            >
                              <span>{meta?.icon ?? '🎖️'}</span>
                              <span>
                                Feat Unlocked: {meta?.title ?? featId}!
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="animate-tomato-splat w-full flex items-center justify-center gap-3 text-left">
                    <img
                      src={tomatoSplatUrl}
                      alt="Tomatoes Thrown"
                      className="w-11 h-11 rounded-full object-cover border-2 border-red-400/70 shadow-md shrink-0"
                    />
                    <div className="min-w-0">
                      <h2 className="font-serif text-lg sm:text-xl font-bold text-red-300 leading-tight">
                        {commentary.headline}
                      </h2>
                      <p className="text-xs text-[#f5ead2]/90 italic truncate">
                        &ldquo;{commentary.subline || heckle}&rdquo;
                      </p>
                      <p className="text-[11px] text-red-200/85">
                        {Math.round(lastResult.accuracy * 100)}% (need{' '}
                        {Math.round(FAIL_ACCURACY_THRESHOLD * 100)}%) •{' '}
                        {lastResult.bountyCompletedXp
                          ? `+${lastResult.bountyCompletedXp} Bounty XP`
                          : '0 XP'}
                      </p>
                    </div>
                  </div>
                )}

            <div className="w-full flex items-center justify-center gap-2.5 text-[11px] text-[#ffe875]/90 bg-black/35 border border-[#d4af37]/25 rounded-lg px-2.5 py-1">
              <span>Plays: {lastResult.daily.attemptsCount}</span>
              <span>•</span>
              <span>Clears: {lastResult.daily.clearsCount}</span>
              <span>•</span>
              <span>
                Best: {Math.round(lastResult.daily.bestAccuracy * 100)}%
              </span>
            </div>

            {/* Community Co-Op Tavern Tip Jar + Live Tavern Pulse */}
            {tavernStats && (
              <div className="w-full rounded-lg bg-black/35 border border-[#d4af37]/30 px-2.5 py-1.5 text-[10px] space-y-1">
                <div className="flex items-center justify-between gap-2 text-[#ffe875]">
                  <span className="font-bold">
                    {tavernStats.encoreActive
                      ? '✨ Tavern Encore Active (+15% XP!)'
                      : `🍻 Tavern Tip Jar: ${tavernStats.communityXpToday.toLocaleString()} / ${tavernStats.communityGoalXp.toLocaleString()} XP`}
                  </span>
                  <span className="text-[#f5ead2]/75 shrink-0">
                    🎲 {tavernStats.rollersToday} • 🍅{' '}
                    {tavernStats.tomatoesToday}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-black/55 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      tavernStats.encoreActive
                        ? 'bg-gradient-to-r from-emerald-400 to-[#ffe875]'
                        : 'bg-gradient-to-r from-amber-600 to-[#ffe875]'
                    }`}
                    style={{ width: `${tipJarPct}%` }}
                  />
                </div>
              </div>
            )}

            {state && state.daily.chestsEarned > state.daily.chestsOpened && (
              <button
                type="button"
                disabled={openingChest}
                onClick={() => void handleOpenChest()}
                className={`${
                  openingChest ? 'animate-chest-shake' : 'animate-gold-pulse'
                } w-full py-2 px-3 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-[#5a3412] via-[#7c4b1a] to-[#5a3412] text-[#ffe875] border-2 border-[#ffe875] shadow-lg cursor-pointer`}
              >
                {openingChest
                  ? '🗝️ Unlocking Mystery Chest...'
                  : `🎁 Crack Open Mystery Chest! (${state.daily.chestsEarned - state.daily.chestsOpened} ready)`}
              </button>
            )}

            {chestReveal &&
              (() => {
                const dropped = RELIC_CATALOG.find(
                  (r) => r.id === chestReveal.relicId
                );
                if (!dropped) return null;
                const unlockedWearable = !chestReveal.isDuplicate
                  ? getCosmeticForRelic(dropped.id)
                  : undefined;
                return (
                  <div className="w-full space-y-1">
                    <div
                      className={`parchment-card w-full rounded-xl p-2 flex items-center justify-between gap-2 text-left border-2 animate-tomato-splat ${RARITY_BORDER[dropped.rarity]}`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xl shrink-0">{dropped.icon}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#1c1208] truncate">
                            {dropped.name} ({dropped.rarity.toUpperCase()})
                          </p>
                          <p className="text-[11px] text-[#6e4726]">
                            {chestReveal.isDuplicate
                              ? `Duplicate: +${chestReveal.bonusXp} XP • Pity ${chestReveal.profile.dupePity}/${DUPE_PITY_THRESHOLD}`
                              : chestReveal.milestoneGuaranteed
                                ? `🔥 Milestone Guaranteed! (${chestReveal.profile.relics.length}/${RELIC_CATALOG.length})`
                                : chestReveal.pityTriggered
                                  ? `✨ Pity Guaranteed New! (${chestReveal.profile.relics.length}/${RELIC_CATALOG.length})`
                                  : `New Relic! (${chestReveal.profile.relics.length}/${RELIC_CATALOG.length})`}
                          </p>
                          {unlockedWearable && (
                            <p className="text-[10px] font-bold text-[#103524] truncate">
                              🎭 Bard Wearable Unlocked: {unlockedWearable.name}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => openModal('feats')}
                        className="text-[11px] font-bold px-2 py-1 rounded-lg bg-[#2c1b0e] text-[#ffe875] shrink-0 cursor-pointer"
                      >
                        Equip
                      </button>
                    </div>
                    {chestReveal.leveledUp && (
                      <div className="w-full rounded-lg bg-amber-500/25 border border-amber-300/70 px-2.5 py-1 text-[11px] font-bold text-[#ffe875]">
                        🎉 Chest XP Level Up! Level {chestReveal.profile.level}{' '}
                        {chestReveal.profile.title}!
                      </div>
                    )}
                    {chestReveal.unlockedFeats.map((featId) => {
                      const meta = FEAT_CATALOG.find((f) => f.id === featId);
                      return (
                        <div
                          key={featId}
                          className="w-full rounded-lg bg-black/45 border border-[#d4af37]/60 px-2.5 py-1 text-[11px] font-bold text-[#ffe875]"
                        >
                          {meta?.icon ?? '🎖️'} Feat Unlocked:{' '}
                          {meta?.title ?? featId}!
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

            <ResultCard
              utcDate={lastResult.daily.utcDate}
              roll={effectiveRoll}
              accuracy={lastResult.accuracy}
              xpEarned={lastResult.xpEarned}
              passed={lastResult.passed}
              noteResults={lastResult.noteResults ?? noteResults}
              profile={lastResult.profile}
            />

            {gauntletNotice && (
              <div className="w-full rounded-xl bg-purple-950/70 border border-purple-400/50 px-3 py-1.5 text-[11px] text-purple-100">
                {gauntletNotice}
              </div>
            )}

            <div className="w-full flex gap-2">
              <button
                type="button"
                onClick={() => setPhase('LISTEN')}
                className="gold-btn flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm cursor-pointer"
              >
                Play Again (Grind XP)
              </button>
              {lastResult.passed && !activeGauntlet && (
                <button
                  type="button"
                  disabled={creatingGauntlet}
                  onClick={() => void handleThrowGauntlet()}
                  className="py-2.5 px-3 rounded-xl font-semibold text-xs sm:text-sm bg-purple-950/80 hover:bg-purple-900/80 text-purple-100 border border-purple-400/55 cursor-pointer disabled:opacity-60"
                >
                  {creatingGauntlet ? '...' : '⚔️ Throw Gauntlet'}
                </button>
              )}
              <button
                type="button"
                onClick={() => openModal('leaderboard')}
                className="py-2.5 px-3.5 rounded-xl font-semibold text-xs sm:text-sm bg-[#103524] hover:bg-[#164731] text-[#ffe875] border border-[#d4af37]/50 cursor-pointer"
              >
                🏆 Ranks
              </button>
            </div>
          </div>
            );
          })()}
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
          onSaveAvatar={handleSaveAvatar}
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
