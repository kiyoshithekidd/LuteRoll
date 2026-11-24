import { useEffect } from 'react';
import type { DifficultyTier } from '../../shared/constants';
import { midiToNoteName } from '../../shared/melodyGenerator';

export type KeyFeedbackState = 'playback' | 'correct' | 'wrong' | null;

type KeyboardProps = {
  highlightedMidi: number | null;
  feedbackMidi: number | null;
  feedbackState: KeyFeedbackState;
  activeTier?: DifficultyTier | null;
  disabled?: boolean;
  onKeyPress: (midi: number) => void;
};

type KeyDef = {
  midi: number;
  label: string;
  keyHint?: string | undefined;
  isBlack: boolean;
  whiteIdx: number;
};

/**
 * Full 2-octave desktop keybindings (fixes B6):
 * Lower octave (C4–B4): Z X C V B N M (white) + S D G H J (sharps)
 * Upper octave (C5–C6): Q W E R T Y U I (white) + 2 3 5 6 7 (sharps)
 */
const DESKTOP_KEY_MAP: Record<string, number> = {
  // Lower octave C4..B4
  z: 60, // C4
  s: 61, // C#4
  x: 62, // D4
  d: 63, // D#4
  c: 64, // E4
  v: 65, // F4
  g: 66, // F#4
  b: 67, // G4
  h: 68, // G#4
  n: 69, // A4
  j: 70, // A#4
  m: 71, // B4
  // Upper octave C5..C6
  q: 72, // C5
  '2': 73, // C#5
  w: 74, // D5
  '3': 75, // D#5
  e: 76, // E5
  r: 77, // F5
  '5': 78, // F#5
  t: 79, // G5
  '6': 80, // G#5
  y: 81, // A5
  '7': 82, // A#5
  u: 83, // B5
  i: 84, // C6
};

const MIDI_TO_HINT: Record<number, string> = Object.fromEntries(
  Object.entries(DESKTOP_KEY_MAP).map(([k, midi]) => [midi, k.toUpperCase()])
);

function isKeyInTierRange(
  midi: number,
  isBlack: boolean,
  tier?: DifficultyTier | null
): boolean {
  if (!tier) return true;
  if (midi < tier.minMidi || midi > tier.maxMidi) return false;
  if (tier.keyMode === 'white' && isBlack) return false;
  if (tier.keyMode === 'white-plus-1-black' && isBlack && midi % 12 !== 6) {
    return false;
  }
  return true;
}

function buildOctaveKeys(baseMidi: number): {
  whites: KeyDef[];
  blacks: KeyDef[];
} {
  const whiteOffsets = [0, 2, 4, 5, 7, 9, 11];
  const blackSpecs = [
    { offset: 1, afterWhiteIdx: 0 },
    { offset: 3, afterWhiteIdx: 1 },
    { offset: 6, afterWhiteIdx: 3 },
    { offset: 8, afterWhiteIdx: 4 },
    { offset: 10, afterWhiteIdx: 5 },
  ];

  const whites: KeyDef[] = whiteOffsets.map((off, idx) => {
    const midi = baseMidi + off;
    return {
      midi,
      label: midiToNoteName(midi),
      keyHint: MIDI_TO_HINT[midi],
      isBlack: false,
      whiteIdx: idx,
    };
  });

  const blacks: KeyDef[] = blackSpecs.map((spec) => {
    const midi = baseMidi + spec.offset;
    return {
      midi,
      label: midiToNoteName(midi),
      keyHint: MIDI_TO_HINT[midi],
      isBlack: true,
      whiteIdx: spec.afterWhiteIdx,
    };
  });

  return { whites, blacks };
}

function OctaveRow({
  baseMidi,
  includeTopC = false,
  highlightedMidi,
  feedbackMidi,
  feedbackState,
  activeTier = null,
  disabled = false,
  onKeyPress,
}: {
  baseMidi: number;
  includeTopC?: boolean;
  highlightedMidi: number | null;
  feedbackMidi: number | null;
  feedbackState: KeyFeedbackState;
  activeTier?: DifficultyTier | null;
  disabled?: boolean;
  onKeyPress: (midi: number) => void;
}) {
  const { whites, blacks } = buildOctaveKeys(baseMidi);
  if (includeTopC) {
    const topMidi = baseMidi + 12;
    whites.push({
      midi: topMidi,
      label: midiToNoteName(topMidi),
      keyHint: MIDI_TO_HINT[topMidi],
      isBlack: false,
      whiteIdx: 7,
    });
  }

  const totalWhites = whites.length;

  const getKeyClasses = (midi: number, isBlack: boolean) => {
    const isPlayback = highlightedMidi === midi;
    const isFeedback = feedbackMidi === midi;
    const inRange = isKeyInTierRange(midi, isBlack, activeTier);

    if (isFeedback && feedbackState === 'wrong') {
      return isBlack
        ? 'bg-red-600 border-red-300 text-white shadow-[0_0_14px_rgba(239,68,68,0.9)] scale-[0.97]'
        : 'bg-red-400 border-red-600 text-white shadow-[0_0_14px_rgba(239,68,68,0.9)] scale-[0.98]';
    }
    if (isFeedback && feedbackState === 'correct') {
      return isBlack
        ? 'bg-emerald-500 border-emerald-200 text-white shadow-[0_0_16px_rgba(16,185,129,0.95)] scale-[0.97]'
        : 'bg-emerald-300 border-emerald-600 text-[#0a2317] shadow-[0_0_16px_rgba(16,185,129,0.95)] scale-[0.98]';
    }
    if (isPlayback) {
      return isBlack
        ? 'bg-[#ffe875] border-white text-[#1c1208] shadow-[0_0_18px_rgba(255,232,117,1)] scale-[0.97]'
        : 'bg-[#ffe875] border-[#d4af37] text-[#1c1208] shadow-[0_0_18px_rgba(255,232,117,1)] scale-[0.98]';
    }

    const dimClass = inRange ? '' : 'opacity-40';

    return isBlack
      ? `bg-gradient-to-b from-[#2b211a] to-[#120c07] border-[#4a3525] text-[#f5ead2]/75 active:bg-[#4a3525] ${dimClass}`
      : `bg-gradient-to-b from-[#fffdf7] to-[#ede2ca] border-[#bfa87e] text-[#3a2312] active:bg-[#d4af37]/30 ${dimClass}`;
  };

  return (
    <div className="relative w-full h-24 sm:h-28 select-none touch-manipulation">
      <div className="flex w-full h-full gap-0.5">
        {whites.map((k) => {
          const isSpark =
            feedbackMidi === k.midi && feedbackState === 'correct';
          return (
            <button
              key={k.midi}
              type="button"
              disabled={disabled}
              onPointerDown={(e) => {
                e.preventDefault();
                if (!disabled) onKeyPress(k.midi);
              }}
              className={`relative flex-1 h-full rounded-b-lg border transition-all duration-75 flex flex-col justify-end items-center pb-1.5 font-semibold text-[10px] sm:text-xs cursor-pointer ${getKeyClasses(
                k.midi,
                false
              )}`}
            >
              {isSpark && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-2 text-xs text-emerald-300 animate-note-spark"
                >
                  ✦
                </span>
              )}
              {k.keyHint && (
                <span className="hidden sm:inline text-[9px] opacity-45 font-mono leading-none mb-0.5">
                  {k.keyHint}
                </span>
              )}
              <span>{k.label}</span>
            </button>
          );
        })}
      </div>

      {blacks.map((k) => {
        const leftPct = ((k.whiteIdx + 0.68) / totalWhites) * 100;
        const widthPct = (0.62 / totalWhites) * 100;
        const isSpark = feedbackMidi === k.midi && feedbackState === 'correct';
        return (
          <button
            key={k.midi}
            type="button"
            disabled={disabled}
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!disabled) onKeyPress(k.midi);
            }}
            style={{
              left: `${leftPct}%`,
              width: `${widthPct}%`,
            }}
            className={`absolute top-0 h-[58%] z-10 rounded-b-md border transition-all duration-75 flex flex-col justify-end items-center pb-1 text-[9px] font-medium cursor-pointer shadow-md ${getKeyClasses(
              k.midi,
              true
            )}`}
            aria-label={k.label}
          >
            {isSpark && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-2 text-xs text-emerald-300 animate-note-spark"
              >
                ✦
              </span>
            )}
            {k.keyHint && (
              <span className="hidden sm:inline text-[8px] opacity-55 font-mono leading-none">
                {k.keyHint}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function Keyboard({
  highlightedMidi,
  feedbackMidi,
  feedbackState,
  activeTier = null,
  disabled = false,
  onKeyPress,
}: KeyboardProps) {
  useEffect(() => {
    if (disabled) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      const midi = DESKTOP_KEY_MAP[e.key.toLowerCase()];
      if (midi !== undefined) {
        e.preventDefault();
        onKeyPress(midi);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, onKeyPress]);

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        <div className="space-y-0.5">
          <div className="flex justify-between text-[10px] uppercase tracking-wider text-[#d4af37]/75 px-1">
            <span>Upper Octave (C5–C6)</span>
            <span className="hidden sm:inline opacity-70">Q–I / 2–7</span>
          </div>
          <OctaveRow
            baseMidi={72}
            includeTopC
            highlightedMidi={highlightedMidi}
            feedbackMidi={feedbackMidi}
            feedbackState={feedbackState}
            activeTier={activeTier}
            disabled={disabled}
            onKeyPress={onKeyPress}
          />
        </div>
        <div className="space-y-0.5">
          <div className="flex justify-between text-[10px] uppercase tracking-wider text-[#d4af37]/75 px-1">
            <span>Lower Octave (C4–B4)</span>
            <span className="hidden sm:inline opacity-70">Z–M / S D G H J</span>
          </div>
          <OctaveRow
            baseMidi={60}
            highlightedMidi={highlightedMidi}
            feedbackMidi={feedbackMidi}
            feedbackState={feedbackState}
            activeTier={activeTier}
            disabled={disabled}
            onKeyPress={onKeyPress}
          />
        </div>
      </div>
    </div>
  );
}
