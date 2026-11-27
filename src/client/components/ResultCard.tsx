import { useState } from 'react';
import { BARD_PORTRAIT_URLS } from '../assets/bardPortraits';
import { FAMILIAR_URLS } from '../assets/familiarAssets';
import type {
  NoteResult,
  PlayerProfile,
  ShareCommentResponse,
} from '../../shared/api';
import { FEAT_CATALOG, RELIC_CATALOG } from '../../shared/constants';
import {
  BARD_COSMETICS,
  BARD_EPITHETS,
  DEFAULT_BARD_AVATAR,
  getAuraVfxTier,
} from '../../shared/cosmetics';
import { formatResultCardText } from '../../shared/resultCard';
import { apiFetch } from '../apiClient';

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function resolvePinEmoji(badgeId?: string | null): string | null {
  if (!badgeId) return null;
  if (badgeId.startsWith('relic:')) {
    return RELIC_CATALOG.find((r) => r.id === badgeId.slice(6))?.icon ?? null;
  }
  if (badgeId.startsWith('feat:')) {
    return FEAT_CATALOG.find((f) => f.id === badgeId.slice(5))?.icon ?? null;
  }
  return null;
}

async function buildShareBannerDataUrl(
  profile: PlayerProfile,
  roll: number,
  accuracy: number
): Promise<string | undefined> {
  try {
    const w = 360;
    const h = 132;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    // Warm dark tavern wood backdrop
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, '#2c180b');
    bg.addColorStop(0.55, '#190e07');
    bg.addColorStop(1, '#0d261a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Gold tavern border
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 3;
    ctx.strokeRect(4, 4, w - 8, h - 8);

    const cfg = profile.bardAvatar;
    const frame =
      BARD_COSMETICS.find((c) => c.slot === 'frame' && c.id === cfg.frame) ??
      BARD_COSMETICS.find((c) => c.id === DEFAULT_BARD_AVATAR.frame)!;
    const vfxTier = getAuraVfxTier(frame.id);

    const portraitId = cfg.portrait ?? 'busker';
    const localPortraitUrl =
      BARD_PORTRAIT_URLS[portraitId] ?? BARD_PORTRAIT_URLS.busker;
    const familiarUrl =
      cfg.familiar && cfg.familiar !== 'none' && cfg.familiar in FAMILIAR_URLS
        ? FAMILIAR_URLS[cfg.familiar]
        : null;

    const [portraitImg, familiarImg] = await Promise.all([
      loadImage(localPortraitUrl),
      familiarUrl ? loadImage(familiarUrl) : Promise.resolve(null),
    ]);

    // Draw Bard Avatar with Aura ring
    const bx = 60;
    const by = h / 2;
    const br = 42;
    if (vfxTier !== 'base') {
      ctx.save();
      ctx.beginPath();
      ctx.arc(bx, by, br + 6, 0, Math.PI * 2);
      ctx.strokeStyle = frame.accentColor;
      ctx.lineWidth = vfxTier === 'mythic' ? 3 : 2;
      if (vfxTier === 'mythic') ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.restore();
    }
    if (portraitImg) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(portraitImg, bx - br, by - br, br * 2, br * 2);
      ctx.restore();
    }
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.strokeStyle = frame.accentColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Crest Pin badge
    const pin = resolvePinEmoji(cfg.badgeId);
    if (pin) {
      ctx.beginPath();
      ctx.arc(bx + 30, by + 30, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#1c1208';
      ctx.fill();
      ctx.strokeStyle = frame.accentColor;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.font = '15px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(pin, bx + 30, by + 31);
    }

    // Draw Familiar Companion side-by-side
    let textX = 118;
    if (familiarImg) {
      const fx = 136;
      const fy = h / 2 + 8;
      const fr = 28;
      ctx.save();
      ctx.beginPath();
      ctx.arc(fx, fy, fr, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(familiarImg, fx - fr, fy - fr, fr * 2, fr * 2);
      ctx.restore();
      ctx.beginPath();
      ctx.arc(fx, fy, fr, 0, Math.PI * 2);
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      textX = 176;
    }

    // Bard info text
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#ffe875';
    ctx.font = 'bold 16px Georgia, serif';
    ctx.fillText(`u/${profile.username}`.slice(0, 20), textX, 24);

    ctx.fillStyle = '#f5ead2';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(`Lvl ${profile.level} ${profile.title}`.slice(0, 24), textX, 48);

    const epMeta =
      cfg.epithet && cfg.epithet !== 'none'
        ? BARD_EPITHETS.find((e) => e.id === cfg.epithet)
        : null;
    if (epMeta) {
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'italic 11px Georgia, serif';
      ctx.fillText(`"${epMeta.label}"`, textX, 68);
    }

    ctx.fillStyle = '#6ee7b7';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(
      `d20: ${roll} • ${Math.round(accuracy * 100)}% • 🔥${profile.streak}`,
      textX,
      92
    );

    return canvas.toDataURL('image/png');
  } catch {
    return undefined;
  }
}

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
      const portraitId = profile.bardAvatar.portrait ?? 'busker';
      const portraitPath =
        BARD_PORTRAIT_URLS[portraitId] ?? BARD_PORTRAIT_URLS.busker;
      const cardImageDataUrl = await buildShareBannerDataUrl(
        profile,
        roll,
        accuracy
      );
      const res = await apiFetch('/api/share-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ utcDate, portraitPath, cardImageDataUrl }),
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
