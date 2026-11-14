import { useEffect, useState } from 'react';
import type { LeaderboardResponse } from '../../shared/api';

type LeaderboardModalProps = {
  onClose: () => void;
};

export function LeaderboardModal({ onClose }: LeaderboardModalProps) {
  const [tab, setTab] = useState<'daily' | 'allTime'>('daily');
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void fetch('/api/leaderboard')
      .then((res) => (res.ok ? res.json() : null))
      .then((board: LeaderboardResponse | null) => {
        if (active && board?.type === 'leaderboard') {
          setData(board);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const board = tab === 'daily' ? data?.daily : data?.allTime;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3"
      role="dialog"
      aria-modal="true"
      aria-label="Tavern Leaderboards"
    >
      <div className="tavern-wood-frame w-full max-w-md rounded-2xl p-4 flex flex-col gap-3 max-h-[85vh]">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-[#ffe875]">
            🏆 Tavern Leaderboards
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xs px-2.5 py-1 rounded-lg bg-black/40 border border-[#d4af37]/40 text-[#f5ead2] cursor-pointer"
          >
            Close
          </button>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTab('daily')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
              tab === 'daily'
                ? 'gold-btn'
                : 'bg-black/35 text-[#f5ead2]/80 border border-[#d4af37]/30'
            }`}
          >
            Today ({data?.utcDate ?? 'UTC'})
          </button>
          <button
            type="button"
            onClick={() => setTab('allTime')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
              tab === 'allTime'
                ? 'gold-btn'
                : 'bg-black/35 text-[#f5ead2]/80 border border-[#d4af37]/30'
            }`}
          >
            All-Time Bards
          </button>
        </div>

        <div className="parchment-card rounded-xl p-3 overflow-y-auto flex-1 min-h-[200px]">
          {loading ? (
            <p className="text-center text-xs py-8 text-[#6e4726]">
              Reading the tavern ledger...
            </p>
          ) : !board || board.top.length === 0 ? (
            <p className="text-center text-xs py-8 text-[#6e4726]">
              No bards on the board yet. Be the first to earn XP!
            </p>
          ) : (
            <ul className="divide-y divide-[#9c7538]/25">
              {board.top.map((entry) => (
                <li
                  key={entry.username}
                  className="py-2 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-6 font-bold text-[#6e4726]">
                      {entry.rank === 1
                        ? '🥇'
                        : entry.rank === 2
                          ? '🥈'
                          : entry.rank === 3
                            ? '🥉'
                            : `#${entry.rank}`}
                    </span>
                    <span className="font-semibold truncate text-[#1c1208]">
                      u/{entry.username}
                    </span>
                  </div>
                  <span className="font-bold text-[#4a2e16] shrink-0">
                    {entry.score.toLocaleString()} XP
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {board && (
          <div className="rounded-xl bg-black/40 border border-[#d4af37]/35 px-3 py-2 flex items-center justify-between text-xs text-[#ffe875]">
            <span>Your Rank</span>
            <span className="font-bold">
              {board.myRank ? `#${board.myRank}` : 'Unranked'} •{' '}
              {board.myScore.toLocaleString()} XP
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
