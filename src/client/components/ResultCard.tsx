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

export function ResultCard({
  utcDate,
  roll,
  accuracy,
  xpEarned,
  passed,
  profile,
}: ResultCardProps) {
  const [copied, setCopied] = useState(false);

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
      // Fallback for restricted clipboard contexts
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

  return (
    <div className="parchment-card w-full rounded-xl p-3.5 text-left space-y-2.5">
      <div className="flex items-center justify-between border-b border-[#9c7538]/35 pb-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#6e4726]">
          Tavern Result Card
        </span>
        <span className="text-[11px] text-[#6e4726]/80">
          Paste in daily thread
        </span>
      </div>

      <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap text-[#1c1208]">
        {cardText}
      </pre>

      <button
        type="button"
        onClick={() => void handleCopy()}
        className="w-full py-2 px-3 rounded-lg font-bold text-xs bg-[#2c1b0e] hover:bg-[#3e2614] text-[#ffe875] border border-[#9c7538] cursor-pointer transition-colors"
      >
        {copied ? '✓ Copied to Clipboard!' : '📋 Copy Result Card'}
      </button>
    </div>
  );
}
