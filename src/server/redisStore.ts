import { randomInt } from 'node:crypto';
import { redis } from '@devvit/web/server';
import {
  BASE_XP_PER_RUN,
  COMMUNITY_DAILY_XP_GOAL,
  DUPE_PITY_THRESHOLD,
  ENCORE_XP_BONUS_RATE,
  FAIL_ACCURACY_THRESHOLD,
  getDailyBounty,
  getIsoWeekKey,
  getLevelFromXp,
  getTierForRoll,
  getTitleForLevel,
  KEYBOARD_VOICES,
  RELIC_CATALOG,
} from '../shared/constants';
import { cyrb128 } from '../shared/prng';
import type {
  DailyState,
  KeyboardVoiceId,
  LeaderboardBoard,
  LeaderboardEntry,
  LeaderboardResponse,
  NoteResult,
  OpenChestResponse,
  PlayerProfile,
  RareFeat,
  SubmitAttemptResponse,
  TavernStats,
} from '../shared/api';

const TTL_48H_SECONDS = 48 * 3600;
const TTL_7D_SECONDS = 7 * 24 * 3600;

export function getUtcDateKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function getYesterdayUtcKey(date = new Date()): string {
  const prev = new Date(date.getTime() - 86_400_000);
  return prev.toISOString().slice(0, 10);
}

export function getTwoDaysAgoUtcKey(date = new Date()): string {
  const prev = new Date(date.getTime() - 2 * 86_400_000);
  return prev.toISOString().slice(0, 10);
}

function profileKey(playerKey: string): string {
  return `user:${playerKey}:profile`;
}

function dailyKey(playerKey: string, utcDate: string): string {
  return `user:${playerKey}:day:${utcDate}`;
}

function rollersKey(utcDate: string): string {
  return `tavern:rollers:${utcDate}`;
}

function tavernStatsKey(utcDate: string): string {
  return `tavern:stats:${utcDate}`;
}

function weeklyBoardKey(weekKey: string): string {
  return `lb:xp:weekly:${weekKey}`;
}

function parseFeats(raw?: string): RareFeat[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as RareFeat[]) : [];
  } catch {
    return [];
  }
}

function parseStringArray(raw?: string): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === 'string')
      : [];
  } catch {
    return [];
  }
}

function sanitizeNoteResults(raw?: NoteResult[]): NoteResult[] | undefined {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > 32) {
    return undefined;
  }
  const clean = raw.filter(
    (r): r is NoteResult => r === 'hit' || r === 'grace' || r === 'miss'
  );
  return clean.length > 0 ? clean : undefined;
}

export type StoredLastRun = {
  utcDate: string;
  roll: number;
  accuracy: number;
  xpEarned: number;
  passed: boolean;
  noteResults?: NoteResult[];
};

export async function getTavernStats(
  utcDate = getUtcDateKey()
): Promise<TavernStats> {
  const [rollersToday, statsData] = await Promise.all([
    redis.zCard(rollersKey(utcDate)).catch(() => 0),
    redis.hGetAll(tavernStatsKey(utcDate)).catch(() => ({} as Record<string, string>)),
  ]);

  const tomatoesToday = statsData.tomatoes
    ? parseInt(statsData.tomatoes, 10)
    : 0;
  const communityXpToday = statsData.communityXp
    ? parseInt(statsData.communityXp, 10)
    : 0;

  return {
    utcDate,
    rollersToday,
    tomatoesToday,
    communityXpToday,
    communityGoalXp: COMMUNITY_DAILY_XP_GOAL,
    encoreActive: communityXpToday >= COMMUNITY_DAILY_XP_GOAL,
  };
}

export async function getPlayerProfile(
  playerKey: string,
  username: string,
  isAnonymous: boolean,
  snoovatarUrl?: string | null
): Promise<PlayerProfile> {
  const data = await redis.hGetAll(profileKey(playerKey));
  const totalXp = data.xp ? parseInt(data.xp, 10) : 0;
  const level = getLevelFromXp(totalXp);
  const title = getTitleForLevel(level);
  const streak = data.streak ? parseInt(data.streak, 10) : 0;
  const streakFreezes = data.streakFreezes
    ? parseInt(data.streakFreezes, 10)
    : 0;
  const dupePity = data.dupePity ? parseInt(data.dupePity, 10) : 0;
  const lastPlayedDate = data.lastPlayedDate || null;
  const feats = parseFeats(data.feats);
  const relics = parseStringArray(data.relics);
  const rawVoice = data.selectedVoice as KeyboardVoiceId | undefined;
  const selectedVoice: KeyboardVoiceId =
    rawVoice && KEYBOARD_VOICES.some((v) => v.id === rawVoice)
      ? rawVoice
      : 'grand_piano';
  const resolvedAvatar = snoovatarUrl ?? (data.snoovatarUrl || null);

  return {
    username,
    isAnonymous,
    totalXp,
    level,
    title,
    streak,
    streakFreezes,
    dupePity,
    lastPlayedDate,
    feats,
    relics,
    selectedVoice,
    snoovatarUrl: resolvedAvatar,
  };
}

export async function getDailyState(
  playerKey: string,
  utcDate = getUtcDateKey()
): Promise<DailyState> {
  const data = await redis.hGetAll(dailyKey(playerKey, utcDate));
  return {
    utcDate,
    initialRoll: data.initialRoll ? parseInt(data.initialRoll, 10) : null,
    reroll: data.reroll ? parseInt(data.reroll, 10) : null,
    finalRoll: data.finalRoll ? parseInt(data.finalRoll, 10) : null,
    rerollUsed: data.rerollUsed === '1',
    attemptsCount: data.attemptsCount ? parseInt(data.attemptsCount, 10) : 0,
    clearsCount: data.clearsCount ? parseInt(data.clearsCount, 10) : 0,
    bestAccuracy: data.bestAccuracy ? parseFloat(data.bestAccuracy) : 0,
    todayXp: data.todayXp ? parseInt(data.todayXp, 10) : 0,
    chestsEarned: data.chestsEarned ? parseInt(data.chestsEarned, 10) : 0,
    chestsOpened: data.chestsOpened ? parseInt(data.chestsOpened, 10) : 0,
    bountyClaimed: data.bountyClaimed === '1',
  };
}

export async function resetDailyState(
  playerKey: string,
  utcDate = getUtcDateKey()
): Promise<void> {
  await redis.del(dailyKey(playerKey, utcDate));
}

export async function unlockFeatIfNew(
  playerKey: string,
  feat: RareFeat
): Promise<boolean> {
  const pKey = profileKey(playerKey);
  const raw = await redis.hGet(pKey, 'feats');
  const feats = parseFeats(raw);
  if (feats.includes(feat)) return false;
  feats.push(feat);
  await redis.hSet(pKey, { feats: JSON.stringify(feats) });
  return true;
}

/**
 * Generates an authoritative 1..20 d20 roll server-side (fixes B3) and records
 * the distinct daily roller in tavern:rollers:<YYYY-MM-DD> without PII (Issue #7).
 */
export async function commitRoll(
  playerKey: string,
  isReroll: boolean
): Promise<{
  roll: number;
  daily: DailyState;
  unlockedFeat: RareFeat | null;
  unlockedFeats: RareFeat[];
  tavernStats: TavernStats;
}> {
  const utcDate = getUtcDateKey();
  const key = dailyKey(playerKey, utcDate);
  const current = await getDailyState(playerKey, utcDate);
  const rolledValue = randomInt(1, 21);
  const nowMs = String(Date.now());

  if (!isReroll) {
    if (current.initialRoll !== null && current.finalRoll !== null) {
      const tavernStats = await getTavernStats(utcDate);
      return {
        roll: current.finalRoll,
        daily: current,
        unlockedFeat: null,
        unlockedFeats: [],
        tavernStats,
      };
    }

    // Hash playerKey so zero usernames/PII are stored in the daily rollers set
    const anonMember = cyrb128(`${utcDate}:${playerKey}`).join(':');
    const rKey = rollersKey(utcDate);

    await Promise.all([
      redis.hSet(key, {
        initialRoll: String(rolledValue),
        finalRoll: String(rolledValue),
        rerollUsed: '0',
        lastRollAt: nowMs,
      }),
      redis.zAdd(rKey, { member: anonMember, score: Date.now() }),
      redis.expire(rKey, TTL_48H_SECONDS),
    ]);
  } else {
    if (current.initialRoll === null) {
      throw new Error('Must make an initial roll before rerolling');
    }
    if (current.rerollUsed) {
      throw new Error('Daily reroll has already been used');
    }
    await redis.hSet(key, {
      reroll: String(rolledValue),
      finalRoll: String(rolledValue),
      rerollUsed: '1',
      lastRollAt: nowMs,
    });
  }

  const unlockedFeats: RareFeat[] = [];
  if (rolledValue === 20) {
    const isNew = await unlockFeatIfNew(playerKey, 'nat20');
    if (isNew) unlockedFeats.push('nat20');
  }

  const [daily, tavernStats] = await Promise.all([
    getDailyState(playerKey, utcDate),
    getTavernStats(utcDate),
  ]);

  return {
    roll: rolledValue,
    daily,
    unlockedFeat: unlockedFeats[0] ?? null,
    unlockedFeats,
    tavernStats,
  };
}

export async function submitAttempt(
  playerKey: string,
  username: string,
  isAnonymous: boolean,
  rawAccuracy: number,
  snoovatarUrl?: string | null,
  graceUsed = false,
  rawNoteResults?: NoteResult[],
  requestedUtcDate?: string
): Promise<SubmitAttemptResponse> {
  const accuracy = Math.max(0, Math.min(1, rawAccuracy));
  const now = new Date();
  const todayUtc = getUtcDateKey(now);
  const yesterdayUtc = getYesterdayUtcKey(now);
  const twoDaysAgoUtc = getTwoDaysAgoUtcKey(now);
  const pKey = profileKey(playerKey);

  // B7 fix: if a run started right before 00:00 UTC and finished after midnight,
  // allow submitting against yesterday's rolled daily state when today has no roll yet.
  let targetUtcDate = todayUtc;
  let daily = await getDailyState(playerKey, todayUtc);
  if (
    daily.finalRoll === null &&
    requestedUtcDate === yesterdayUtc
  ) {
    const prevDaily = await getDailyState(playerKey, yesterdayUtc);
    if (prevDaily.finalRoll !== null) {
      targetUtcDate = yesterdayUtc;
      daily = prevDaily;
    }
  }

  if (daily.finalRoll === null) {
    throw new Error('Roll the d20 before submitting an attempt');
  }

  const dKey = dailyKey(playerKey, targetUtcDate);
  const [profile, rawDailyHash, currentStats] = await Promise.all([
    getPlayerProfile(playerKey, username, isAnonymous, snoovatarUrl),
    redis.hGetAll(dKey),
    getTavernStats(targetUtcDate),
  ]);

  // B3 fix: enforce a minimum plausible elapsed time between runs to prevent script XP farming
  const tier = getTierForRoll(daily.finalRoll);
  const minRunDurationMs = Math.max(800, tier.minNotes * 110);
  const lastActivityMs = Math.max(
    rawDailyHash.lastAttemptAt ? parseInt(rawDailyHash.lastAttemptAt, 10) : 0,
    rawDailyHash.lastRollAt ? parseInt(rawDailyHash.lastRollAt, 10) : 0
  );
  const nowMs = Date.now();
  if (lastActivityMs > 0 && nowMs - lastActivityMs < minRunDurationMs) {
    throw new Error('Too fast! Finish playing the melody before submitting.');
  }

  const passed = accuracy >= FAIL_ACCURACY_THRESHOLD;
  const baseXpEarned = passed
    ? Math.round(BASE_XP_PER_RUN * tier.xpMultiplier * accuracy)
    : 0;

  // Community Co-Op Tavern Tip Jar Encore Buff (+15% XP when subreddit daily goal is met)
  const encoreBonusXp =
    passed && currentStats.encoreActive
      ? Math.round(baseXpEarned * ENCORE_XP_BONUS_RATE)
      : 0;

  const newAttemptsCount = daily.attemptsCount + 1;
  const newClearsCount = daily.clearsCount + (passed ? 1 : 0);
  const newBestAccuracy = Math.max(daily.bestAccuracy, accuracy);

  let bountyCompletedXp = 0;
  let newBountyClaimed = daily.bountyClaimed;
  if (!daily.bountyClaimed) {
    const bounty = getDailyBounty(targetUtcDate);
    const completed =
      (bounty.id === 'accuracy90' && passed && accuracy >= 0.9) ||
      (bounty.id === 'runs3' && newAttemptsCount >= 3) ||
      (bounty.id === 'flawless' && passed && accuracy >= 1) ||
      (bounty.id === 'clear2' && newClearsCount >= 2) ||
      (bounty.id === 'accuracy85' && passed && accuracy >= 0.85);
    if (completed) {
      bountyCompletedXp = bounty.bonusXp;
      newBountyClaimed = true;
    }
  }

  const xpEarned = baseXpEarned + encoreBonusXp + bountyCompletedXp;
  const previousLevel = profile.level;
  const newTotalXp = profile.totalXp + xpEarned;
  const newLevel = getLevelFromXp(newTotalXp);
  const newTitle = getTitleForLevel(newLevel);
  const leveledUp = newLevel > previousLevel;
  const newTodayXp = daily.todayXp + xpEarned;

  let newStreak = profile.streak;
  let newStreakFreezes = profile.streakFreezes;
  let streakSavedByFreeze = false;
  let newLastPlayedDate = profile.lastPlayedDate;

  if (passed && profile.lastPlayedDate !== targetUtcDate) {
    if (
      profile.lastPlayedDate === yesterdayUtc ||
      (targetUtcDate === yesterdayUtc && profile.lastPlayedDate === twoDaysAgoUtc)
    ) {
      newStreak = profile.streak + 1;
    } else if (
      profile.lastPlayedDate === twoDaysAgoUtc &&
      profile.streakFreezes > 0
    ) {
      newStreak = profile.streak + 1;
      newStreakFreezes = profile.streakFreezes - 1;
      streakSavedByFreeze = true;
    } else {
      newStreak = 1;
    }
    newLastPlayedDate = targetUtcDate;

    // Earn a Streak Freeze at every 5-day streak milestone (max 1 held)
    if (newStreak >= 5 && newStreak % 5 === 0 && newStreakFreezes < 1) {
      newStreakFreezes = 1;
    }
  }

  const nextFeats = [...profile.feats];
  const unlockedFeats: RareFeat[] = [];
  const grant = (feat: RareFeat) => {
    if (!nextFeats.includes(feat)) {
      nextFeats.push(feat);
      unlockedFeats.push(feat);
    }
  };

  if (passed) {
    grant('first_tune');
    if (accuracy >= 1) grant('flawless');
    if (daily.finalRoll === 1) grant('nat1_clear');
    if (graceUsed) grant('grace_note');
    if (newStreak >= 3) grant('streak3');
    if (newStreak >= 7) grant('streak7');
    if (newStreak >= 30) grant('streak30');
  }
  if (newAttemptsCount >= 5) {
    grant('grinder5');
  }
  if (newLevel >= 25) {
    grant('level25');
  }

  const resolvedAvatar = snoovatarUrl ?? profile.snoovatarUrl ?? null;

  let newChestsEarned = daily.chestsEarned;
  if (passed && newChestsEarned < 1) {
    newChestsEarned = 1;
  }
  if (
    passed &&
    (accuracy >= 1 || daily.finalRoll === 20) &&
    newChestsEarned < 2
  ) {
    newChestsEarned = 2;
  }

  const noteResults = sanitizeNoteResults(rawNoteResults);
  const lastRunSnapshot: StoredLastRun = {
    utcDate: targetUtcDate,
    roll: daily.finalRoll,
    accuracy,
    xpEarned,
    passed,
    ...(noteResults ? { noteResults } : {}),
  };

  const tStatsKey = tavernStatsKey(targetUtcDate);
  const weekKey = getIsoWeekKey(now);

  const updates: Promise<unknown>[] = [
    redis.hSet(dKey, {
      attemptsCount: String(newAttemptsCount),
      clearsCount: String(newClearsCount),
      bestAccuracy: newBestAccuracy.toFixed(4),
      todayXp: String(newTodayXp),
      chestsEarned: String(newChestsEarned),
      bountyClaimed: newBountyClaimed ? '1' : '0',
      lastAttemptAt: String(nowMs),
      lastRun: JSON.stringify(lastRunSnapshot),
    }),
    redis.hSet(pKey, {
      username,
      xp: String(newTotalXp),
      level: String(newLevel),
      title: newTitle,
      streak: String(newStreak),
      streakFreezes: String(newStreakFreezes),
      lastPlayedDate: newLastPlayedDate ?? '',
      feats: JSON.stringify(nextFeats),
      ...(resolvedAvatar ? { snoovatarUrl: resolvedAvatar } : {}),
    }),
  ];

  if (!passed) {
    updates.push(
      redis.hIncrBy(tStatsKey, 'tomatoes', 1),
      redis.expire(tStatsKey, TTL_7D_SECONDS)
    );
  }

  if (xpEarned > 0) {
    updates.push(
      redis.hIncrBy(tStatsKey, 'communityXp', xpEarned),
      redis.expire(tStatsKey, TTL_7D_SECONDS)
    );
  }

  if (!isAnonymous && resolvedAvatar) {
    updates.push(redis.hSet('lb:snoovatars', { [username]: resolvedAvatar }));
  }

  if (!isAnonymous && xpEarned > 0) {
    updates.push(
      redis.zAdd('lb:xp:alltime', { member: username, score: newTotalXp }),
      redis.zAdd(`lb:xp:daily:${targetUtcDate}`, {
        member: username,
        score: newTodayXp,
      }),
      redis.zIncrBy(weeklyBoardKey(weekKey), username, xpEarned)
    );
  }

  await Promise.all(updates);

  const updatedStats = await getTavernStats(targetUtcDate);

  return {
    type: 'attempt',
    passed,
    accuracy,
    xpEarned,
    encoreBonusXp,
    bountyCompletedXp,
    streakSavedByFreeze,
    leveledUp,
    previousLevel,
    unlockedFeat: unlockedFeats[0] ?? null,
    unlockedFeats,
    ...(noteResults ? { noteResults } : {}),
    profile: {
      username,
      isAnonymous,
      totalXp: newTotalXp,
      level: newLevel,
      title: newTitle,
      streak: newStreak,
      streakFreezes: newStreakFreezes,
      dupePity: profile.dupePity,
      lastPlayedDate: newLastPlayedDate,
      feats: nextFeats,
      relics: profile.relics,
      selectedVoice: profile.selectedVoice,
      snoovatarUrl: resolvedAvatar,
    },
    daily: {
      ...daily,
      attemptsCount: newAttemptsCount,
      clearsCount: newClearsCount,
      bestAccuracy: newBestAccuracy,
      todayXp: newTodayXp,
      chestsEarned: newChestsEarned,
      bountyClaimed: newBountyClaimed,
    },
    tavernStats: updatedStats,
  };
}

export async function getLastRunForShare(
  playerKey: string,
  requestedUtcDate?: string
): Promise<StoredLastRun | null> {
  const datesToCheck = [
    requestedUtcDate,
    getUtcDateKey(),
    getYesterdayUtcKey(),
  ].filter((d): d is string => Boolean(d));

  for (const d of datesToCheck) {
    const raw = await redis.hGet(dailyKey(playerKey, d), 'lastRun');
    if (raw) {
      try {
        return JSON.parse(raw) as StoredLastRun;
      } catch {
        // ignore malformed JSON
      }
    }
  }
  return null;
}

export async function claimShareCommentSlot(
  playerKey: string,
  postId: string,
  utcDate: string
): Promise<boolean> {
  const key = `share:${postId}:${utcDate}`;
  const count = await redis.hIncrBy(key, playerKey, 1);
  if (count === 1) {
    await redis.expire(key, TTL_48H_SECONDS);
    return true;
  }
  return false;
}

async function fetchSingleBoard(
  zsetKey: string,
  username: string,
  isAnonymous: boolean
): Promise<LeaderboardBoard> {
  const [rawTop, totalCount, ascRank, score] = await Promise.all([
    redis.zRange(zsetKey, 0, 9, { by: 'rank', reverse: true }),
    redis.zCard(zsetKey),
    isAnonymous ? Promise.resolve(undefined) : redis.zRank(zsetKey, username),
    isAnonymous ? Promise.resolve(undefined) : redis.zScore(zsetKey, username),
  ]);

  const avatars = await Promise.all(
    rawTop.map((entry) =>
      redis.hGet('lb:snoovatars', entry.member).catch(() => undefined)
    )
  );

  const top: LeaderboardEntry[] = rawTop.map((entry, idx) => ({
    rank: idx + 1,
    username: entry.member,
    score: entry.score,
    snoovatarUrl: avatars[idx] || null,
  }));

  const myRank =
    ascRank !== undefined && ascRank !== null
      ? Math.max(1, totalCount - ascRank)
      : null;

  return {
    top,
    myRank,
    myScore: score ?? 0,
  };
}

export async function getLeaderboards(
  username: string,
  isAnonymous: boolean
): Promise<LeaderboardResponse> {
  const now = new Date();
  const utcDate = getUtcDateKey(now);
  const weekKey = getIsoWeekKey(now);
  const [daily, weekly, allTime] = await Promise.all([
    fetchSingleBoard(`lb:xp:daily:${utcDate}`, username, isAnonymous),
    fetchSingleBoard(weeklyBoardKey(weekKey), username, isAnonymous),
    fetchSingleBoard('lb:xp:alltime', username, isAnonymous),
  ]);

  return {
    type: 'leaderboard',
    utcDate,
    weekKey,
    daily,
    weekly,
    allTime,
  };
}

export async function openMysteryChest(
  playerKey: string,
  username: string,
  isAnonymous: boolean,
  snoovatarUrl?: string | null
): Promise<OpenChestResponse> {
  const now = new Date();
  const utcDate = getUtcDateKey(now);
  const weekKey = getIsoWeekKey(now);
  const dKey = dailyKey(playerKey, utcDate);
  const pKey = profileKey(playerKey);

  const [profile, daily] = await Promise.all([
    getPlayerProfile(playerKey, username, isAnonymous, snoovatarUrl),
    getDailyState(playerKey, utcDate),
  ]);

  if (daily.chestsOpened >= daily.chestsEarned) {
    throw new Error('No unopened Mystery Chest available right now.');
  }

  // B8 fix: atomically claim a chest slot to prevent double-open race conditions
  const newChestsOpened = await redis.hIncrBy(dKey, 'chestsOpened', 1);
  if (newChestsOpened > daily.chestsEarned) {
    await redis.hIncrBy(dKey, 'chestsOpened', -1);
    throw new Error('No unopened Mystery Chest available right now.');
  }

  // Higher rarity odds on bonus (2nd) chest
  const isBonus = newChestsOpened >= 2;
  const r = Math.random();
  const rarity = isBonus
    ? r < 0.15
      ? 'mythic'
      : r < 0.45
        ? 'rare'
        : r < 0.8
          ? 'uncommon'
          : 'common'
    : r < 0.05
      ? 'mythic'
      : r < 0.2
        ? 'rare'
        : r < 0.5
          ? 'uncommon'
          : 'common';

  const pool = RELIC_CATALOG.filter((item) => item.rarity === rarity);
  let picked =
    pool[Math.floor(Math.random() * pool.length)] ?? RELIC_CATALOG[0]!;
  let isDuplicate = profile.relics.includes(picked.id);
  let pityTriggered = false;
  let nextDupePity = isDuplicate ? profile.dupePity + 1 : 0;

  if (isDuplicate && nextDupePity >= DUPE_PITY_THRESHOLD) {
    const unowned = RELIC_CATALOG.filter(
      (item) => !profile.relics.includes(item.id)
    );
    if (unowned.length > 0) {
      picked = unowned[Math.floor(Math.random() * unowned.length)]!;
      isDuplicate = false;
      pityTriggered = true;
      nextDupePity = 0;
    }
  }

  const effectiveRarity = picked.rarity;
  const bonusXp = isDuplicate
    ? effectiveRarity === 'mythic' || effectiveRarity === 'rare'
      ? 60
      : 30
    : 0;

  const nextRelics = isDuplicate
    ? profile.relics
    : [...profile.relics, picked.id];
  const previousLevel = profile.level;
  const newTotalXp = profile.totalXp + bonusXp;
  const newLevel = getLevelFromXp(newTotalXp);
  const newTitle = getTitleForLevel(newLevel);
  const leveledUp = newLevel > previousLevel;
  const newTodayXp = daily.todayXp + bonusXp;

  const nextFeats = [...profile.feats];
  const unlockedFeats: RareFeat[] = [];
  const grant = (feat: RareFeat) => {
    if (!nextFeats.includes(feat)) {
      nextFeats.push(feat);
      unlockedFeats.push(feat);
    }
  };

  if (nextRelics.length >= 5) grant('relic5');
  if (nextRelics.length >= 12) grant('voice6');
  if (nextRelics.length >= 15) grant('relic15');
  if (nextRelics.length >= 30) grant('relic30');
  if (effectiveRarity === 'mythic') grant('mythic_relic');
  if (newLevel >= 25) grant('level25');

  const updates: Promise<unknown>[] = [
    redis.hSet(dKey, {
      todayXp: String(newTodayXp),
    }),
    redis.hSet(pKey, {
      relics: JSON.stringify(nextRelics),
      feats: JSON.stringify(nextFeats),
      dupePity: String(nextDupePity),
      xp: String(newTotalXp),
      level: String(newLevel),
      title: newTitle,
    }),
  ];

  if (bonusXp > 0) {
    const tStatsKey = tavernStatsKey(utcDate);
    updates.push(
      redis.hIncrBy(tStatsKey, 'communityXp', bonusXp),
      redis.expire(tStatsKey, TTL_7D_SECONDS)
    );
  }

  if (!isAnonymous && bonusXp > 0) {
    updates.push(
      redis.zAdd('lb:xp:alltime', { member: username, score: newTotalXp }),
      redis.zAdd(`lb:xp:daily:${utcDate}`, {
        member: username,
        score: newTodayXp,
      }),
      redis.zIncrBy(weeklyBoardKey(weekKey), username, bonusXp)
    );
  }

  await Promise.all(updates);

  return {
    type: 'open-chest',
    relicId: picked.id,
    isDuplicate,
    pityTriggered,
    bonusXp,
    leveledUp,
    previousLevel,
    unlockedFeat: unlockedFeats[0] ?? null,
    unlockedFeats,
    profile: {
      ...profile,
      relics: nextRelics,
      feats: nextFeats,
      dupePity: nextDupePity,
      totalXp: newTotalXp,
      level: newLevel,
      title: newTitle,
    },
    daily: {
      ...daily,
      chestsOpened: newChestsOpened,
      todayXp: newTodayXp,
    },
  };
}

export async function selectKeyboardVoice(
  playerKey: string,
  username: string,
  isAnonymous: boolean,
  voiceId: KeyboardVoiceId
): Promise<PlayerProfile> {
  const voice = KEYBOARD_VOICES.find((v) => v.id === voiceId);
  if (!voice) {
    throw new Error('Unknown keyboard voice');
  }
  const profile = await getPlayerProfile(playerKey, username, isAnonymous);
  if (profile.relics.length < voice.unlockRelics) {
    throw new Error(
      `Requires ${voice.unlockRelics} relics to unlock ${voice.name}`
    );
  }

  await redis.hSet(profileKey(playerKey), { selectedVoice: voiceId });
  return {
    ...profile,
    selectedVoice: voiceId,
  };
}

export async function getDailyPostId(utcDate: string): Promise<string | null> {
  const id = await redis.get(`tavern:dailyPost:${utcDate}`);
  return id || null;
}

export async function setDailyPostId(
  utcDate: string,
  postId: string
): Promise<void> {
  await redis.set(`tavern:dailyPost:${utcDate}`, postId, {
    expiration: new Date(Date.now() + TTL_7D_SECONDS * 1000),
  });
}

export async function getYesterdayRecap(yesterdayUtc: string): Promise<{
  topBard: { username: string; score: number } | null;
  rollersCount: number;
  tomatoesCount: number;
  communityXp: number;
}> {
  const [rawTop, stats] = await Promise.all([
    redis
      .zRange(`lb:xp:daily:${yesterdayUtc}`, 0, 0, { by: 'rank', reverse: true })
      .catch(() => []),
    getTavernStats(yesterdayUtc),
  ]);

  const first = rawTop[0];
  return {
    topBard: first ? { username: first.member, score: first.score } : null,
    rollersCount: stats.rollersToday,
    tomatoesCount: stats.tomatoesToday,
    communityXp: stats.communityXpToday,
  };
}
