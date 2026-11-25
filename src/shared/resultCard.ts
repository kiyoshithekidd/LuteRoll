import type { NoteResult, PlayerProfile } from './api';
import { getTierForRoll } from './constants';
import { BARD_EPITHETS } from './cosmetics';

export type ResultCardFormatInput = {
  utcDate: string;
  roll: number;
  accuracy: number;
  xpEarned: number;
  passed: boolean;
  noteResults?: NoteResult[] | undefined;
  profile: Pick<PlayerProfile, 'streak' | 'level' | 'title'> & {
    bardAvatar?: PlayerProfile['bardAvatar'];
  };
  forRedditMarkdown?: boolean;
};

export function formatCardDate(utcDate: string): string {
  const dt = new Date(`${utcDate}T00:00:00Z`);
  if (Number.isNaN(dt.getTime())) return utcDate;
  return dt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatNoteResultsGrid(noteResults?: NoteResult[]): string {
  if (!noteResults || noteResults.length === 0) return '';
  return noteResults
    .map((r) => (r === 'hit' ? '🟩' : r === 'grace' ? '🟦' : '🟥'))
    .join('');
}

export function formatResultCardText(input: ResultCardFormatInput): string {
  const {
    utcDate,
    roll,
    accuracy,
    xpEarned,
    passed,
    noteResults,
    profile,
    forRedditMarkdown = false,
  } = input;

  const pct = Math.round(accuracy * 100);
  const dateLabel = formatCardDate(utcDate);
  const tier = getTierForRoll(roll);
  const rollLabel =
    roll === 20
      ? '✨ Nat 20 (Trivial 3.0x)'
      : roll === 1
        ? '💀 Nat 1 (Brutal 3.0x)'
        : `Rolled ${roll} (${tier.name} ${tier.xpMultiplier}x)`;

  const grid = formatNoteResultsGrid(noteResults);
  const lineBreak = forRedditMarkdown ? '  \n' : '\n';

  const lines: string[] = [`🎲 Lute Roll, ${dateLabel} — ${rollLabel}`];

  if (grid) {
    lines.push(
      passed
        ? `${grid} (${pct}% • +${xpEarned} XP)`
        : `${grid} (${pct}% — 🍅 Tomatoes! +${xpEarned} XP)`
    );
  } else {
    lines.push(
      passed
        ? `${pct}% accuracy • +${xpEarned} XP`
        : `${pct}% accuracy — 🍅 Tomatoes! (+${xpEarned} XP)`
    );
  }

  const epId = profile.bardAvatar?.epithet;
  const epLabel =
    epId && epId !== 'none'
      ? BARD_EPITHETS.find((e) => e.id === epId)?.label
      : undefined;

  lines.push(
    `🔥 Streak ${profile.streak} • Lvl ${profile.level} ${profile.title}${epLabel ? ` "${epLabel}"` : ''}`
  );

  return lines.join(lineBreak);
}
