import { useState } from 'react';
import type {
  NoteResult,
  PlayerProfile,
  ShareCommentResponse,
} from '../../shared/api';
import { formatResultCardText } from '../../shared/resultCard';
import { apiFetch } from '../apiClient';

type ResultCardProps = {
  utcDate: string;
  roll: number;
  accuracy: number;
  xpEarned: number;
  passed: boolean;
  noteResults?: NoteResult[];
  profile: PlayerProfile;
};

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
  noteResults,
  profile,
}: ResultCardProps) {
  const [copied, setCopied] = useState(false);
  const [commentState, setCommentState] = useState<
    'idle' | 'posting' | 'posted' | 'already' | 'signin' | 'error'
  >('idle');
  const [subState, setSubState] = useState<'idle' | 'joining' | 'joined'>(
    'idle'
  );

  const displayCardText = formatResultCardText({
    utcDate,
    roll,
    accuracy,
    xpEarned,
    passed,
    noteResults,
    profile,
    forRedditMarkdown: false,
  });

  const redditMarkdownText = formatResultCardText({
    utcDate,
    roll,
    accuracy,
    xpEarned,
    passed,
    noteResults,
    profile,
    forRedditMarkdown: true,
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(redditMarkdownText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      const area = document.createElement('textarea');
      area.value = redditMarkdownText;
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
    if (
      commentState === 'posting' ||
      commentState === 'posted' ||
      commentState === 'already'
    ) {
      return;
    }
    if (profile.isAnonymous) {
      setCommentState('signin');
      return;
    }
    setCommentState('posting');
    try {
      const res = await apiFetch('/api/share-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ utcDate }),
      });
      if (res.status === 401) {
        setCommentState('signin');
        return;
      }
      if (!res.ok) {
        setCommentState('error');
        return;
      }
      const data = (await res.json()) as ShareCommentResponse;
      setCommentState(data.alreadyShared ? 'already' : 'posted');
    } catch {
      setCommentState('error');
    }
  };

  const handleSubscribe = async () => {
    if (subState !== 'idle') return;
    setSubState('joining');
    try {
      const res = await apiFetch('/api/subscribe', { method: 'POST' });
      setSubState(res.ok ? 'joined' : 'idle');
    } catch {
      setSubState('idle');
    }
  };

  return (
    <div className="parchment-card w-full rounded-xl p-2.5 sm:p-3 text-left space-y-2">
      <div className="flex items-center justify-between border-b border-[#9c7538]/35 pb-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6e4726]">
          Tavern Result Card
        </span>
        <span className="text-[10px] text-[#6e4726]/85 font-semibold">
          Next roll in {getUtcResetCountdown()}
        </span>
      </div>

      <pre className="font-mono text-[11px] leading-snug whitespace-pre-wrap text-[#1c1208]">
        {displayCardText}
      </pre>

      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={() => void handlePostComment()}
          disabled={
            commentState === 'posting' ||
            commentState === 'posted' ||
            commentState === 'already'
          }
          className="py-1.5 px-2 rounded-lg font-bold text-[11px] bg-[#103524] hover:bg-[#164731] text-[#ffe875] border border-[#2f6f4e] cursor-pointer transition-colors disabled:opacity-70"
        >
          {commentState === 'posting'
            ? 'Posting...'
            : commentState === 'posted'
              ? '✓ Posted!'
              : commentState === 'already'
                ? '✓ Shared Today'
                : commentState === 'signin'
                  ? 'Sign In to Post'
                  : commentState === 'error'
                    ? 'Retry Post'
                    : '💬 Post to Thread'}
        </button>

        <button
          type="button"
          onClick={() => void handleCopy()}
          className="py-1.5 px-2 rounded-lg font-bold text-[11px] bg-[#2c1b0e] hover:bg-[#3e2614] text-[#ffe875] border border-[#9c7538] cursor-pointer transition-colors"
        >
          {copied ? '✓ Copied!' : '📋 Copy Card'}
        </button>
      </div>

      <button
        type="button"
        onClick={() => void handleSubscribe()}
        disabled={subState !== 'idle'}
        className="w-full py-1 px-2.5 rounded-lg font-semibold text-[10px] bg-[#ead7b4] hover:bg-[#e1c89a] text-[#4a2e16] border border-[#9c7538]/50 cursor-pointer transition-colors disabled:opacity-75"
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
