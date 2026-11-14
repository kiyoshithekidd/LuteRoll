import { useState } from 'react';
import type { PlayerProfile } from '../../shared/api';

type ResultCardProps = {
  utcDate: string;
  roll: number;
  accuracy: number;
  xpEarned: number;
  passed: boolean;
  profile: PlayerProfile;
};

function formatCardDate(utcDate: string): string {
  const dt = new Date(`${utcDate}T00:00:00Z`);
  if (Number.isNaN(dt.getTime())) return utcDate;
  return dt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

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

export function ResultCard({
  utcDate,
  roll,
  accuracy,
  xpEarned,
  passed,
  profile,
}: ResultCardProps) {
  const [copied, setCopied] = useState(false);
  const [commentState, setCommentState] = useState<
    'idle' | 'posting' | 'posted' | 'error'
  >('idle');
  const [subState, setSubState] = useState<'idle' | 'joining' | 'joined'>(
    'idle'
  );

  const pct = Math.round(accuracy * 100);
  const dateLabel = formatCardDate(utcDate);
  const cardText = passed
    ? `Lute Roll, ${dateLabel}\nRolled ${roll}, ${pct}% accuracy, +${xpEarned} XP\nStreak ${profile.streak}, Level ${profile.level} ${profile.title}`
    : `Lute Roll, ${dateLabel}\nRolled ${roll}, ${pct}% accuracy — Tomatoes thrown! (+0 XP)\nStreak ${profile.streak}, Level ${profile.level} ${profile.title}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cardText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      const area = document.createElement('textarea');
      area.value = cardText;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      document.body.removeChild(area);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    }
  };

  const handlePostComment = async () => {
    if (commentState === 'posting' || commentState === 'posted') return;
    setCommentState('posting');
    try {
      const res = await fetch('/api/share-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cardText }),
      });
      setCommentState(res.ok ? 'posted' : 'error');
    } catch {
      setCommentState('error');
    }
  };

  const handleSubscribe = async () => {
    if (subState !== 'idle') return;
    setSubState('joining');
    try {
      const res = await fetch('/api/subscribe', { method: 'POST' });
      setSubState(res.ok ? 'joined' : 'idle');
    } catch {
      setSubState('idle');
    }
  };

  return (
    <div className="parchment-card w-full rounded-xl p-3.5 text-left space-y-2.5">
      <div className="flex items-center justify-between border-b border-[#9c7538]/35 pb-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#6e4726]">
          Tavern Result Card
        </span>
        <span className="text-[11px] text-[#6e4726]/85 font-semibold">
          Next roll in {getUtcResetCountdown()}
        </span>
      </div>

      <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap text-[#1c1208]">
        {cardText}
      </pre>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => void handlePostComment()}
          disabled={commentState === 'posting' || commentState === 'posted'}
          className="py-2 px-2.5 rounded-lg font-bold text-xs bg-[#103524] hover:bg-[#164731] text-[#ffe875] border border-[#2f6f4e] cursor-pointer transition-colors disabled:opacity-70"
        >
          {commentState === 'posting'
            ? 'Posting...'
            : commentState === 'posted'
              ? '✓ Posted!'
              : commentState === 'error'
                ? 'Retry Post'
                : '💬 Post to Thread'}
        </button>

        <button
          type="button"
          onClick={() => void handleCopy()}
          className="py-2 px-2.5 rounded-lg font-bold text-xs bg-[#2c1b0e] hover:bg-[#3e2614] text-[#ffe875] border border-[#9c7538] cursor-pointer transition-colors"
        >
          {copied ? '✓ Copied!' : '📋 Copy Card'}
        </button>
      </div>

      <button
        type="button"
        onClick={() => void handleSubscribe()}
        disabled={subState !== 'idle'}
        className="w-full py-1.5 px-3 rounded-lg font-semibold text-[11px] bg-[#ead7b4] hover:bg-[#e1c89a] text-[#4a2e16] border border-[#9c7538]/50 cursor-pointer transition-colors disabled:opacity-75"
      >
        {subState === 'joined'
          ? '✓ Subscribed to Community!'
          : subState === 'joining'
            ? 'Joining...'
            : '🔔 Join Community for Daily Tunes'}
      </button>
    </div>
  );
}
