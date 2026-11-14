import { redis } from '@devvit/web/server';
import {
  BASE_XP_PER_RUN,
  FAIL_ACCURACY_THRESHOLD,
  getLevelFromXp,
  getTierForRoll,
  getTitleForLevel,
} from '../shared/constants';
import type {
  DailyState,
  PlayerProfile,
  SubmitAttemptResponse,
} from '../shared/api';

export function getUtcDateKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function getYesterdayUtcKey(date = new Date()): string {
  const prev = new Date(date.getTime() - 86_400_000);
  return prev.toISOString().slice(0, 10);
}

function profileKey(playerKey: string): string {
  return `user:${playerKey}:profile`;
}

function dailyKey(playerKey: string, utcDate: string): string {
  return `user:${playerKey}:day:${utcDate}`;
}

export async function getPlayerProfile(
  playerKey: string,
  username: string,
  isAnonymous: boolean
): Promise<PlayerProfile> {
  const data = await redis.hGetAll(profileKey(playerKey));
  const totalXp = data.xp ? parseInt(data.xp, 10) : 0;
  const level = getLevelFromXp(totalXp);
  const title = getTitleForLevel(level);
  const streak = data.streak ? parseInt(data.streak, 10) : 0;
  const lastPlayedDate = data.lastPlayedDate || null;

  return {
    username,
    isAnonymous,
    totalXp,
    level,
    title,
    streak,
    lastPlayedDate,
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
  };
}

export async function commitRoll(
  playerKey: string,
  roll: number,
  isReroll: boolean
): Promise<DailyState> {
  const clamped = Math.max(1, Math.min(20, Math.round(roll)));
  const utcDate = getUtcDateKey();
  const key = dailyKey(playerKey, utcDate);
  const current = await getDailyState(playerKey, utcDate);

  if (!isReroll) {
    if (current.initialRoll !== null) {
      return current;
    }
    await redis.hSet(key, {
      initialRoll: String(clamped),
      finalRoll: String(clamped),
      rerollUsed: '0',
    });
    return await getDailyState(playerKey, utcDate);
  }

  if (current.initialRoll === null) {
    throw new Error('Must make an initial roll before rerolling');
  }
  if (current.rerollUsed) {
    throw new Error('Daily reroll has already been used');
  }

  await redis.hSet(key, {
    reroll: String(clamped),
    finalRoll: String(clamped),
    rerollUsed: '1',
  });
  return await getDailyState(playerKey, utcDate);
}

export async function submitAttempt(
  playerKey: string,
  username: string,
  isAnonymous: boolean,
  rawAccuracy: number
): Promise<SubmitAttemptResponse> {
  const accuracy = Math.max(0, Math.min(1, rawAccuracy));
  const utcDate = getUtcDateKey();
  const yesterdayUtc = getYesterdayUtcKey();
  const dKey = dailyKey(playerKey, utcDate);
  const pKey = profileKey(playerKey);

  const [profile, daily] = await Promise.all([
    getPlayerProfile(playerKey, username, isAnonymous),
    getDailyState(playerKey, utcDate),
  ]);

  if (daily.finalRoll === null) {
    throw new Error('Roll the d20 before submitting an attempt');
  }

  const tier = getTierForRoll(daily.finalRoll);
  const passed = accuracy >= FAIL_ACCURACY_THRESHOLD;
  const xpEarned = passed
    ? Math.round(BASE_XP_PER_RUN * tier.xpMultiplier * accuracy)
    : 0;

  const previousLevel = profile.level;
  const newTotalXp = profile.totalXp + xpEarned;
  const newLevel = getLevelFromXp(newTotalXp);
  const newTitle = getTitleForLevel(newLevel);
  const leveledUp = newLevel > previousLevel;

  const newAttemptsCount = daily.attemptsCount + 1;
  const newClearsCount = daily.clearsCount + (passed ? 1 : 0);
  const newBestAccuracy = Math.max(daily.bestAccuracy, accuracy);
  const newTodayXp = daily.todayXp + xpEarned;

  let newStreak = profile.streak;
  let newLastPlayedDate = profile.lastPlayedDate;

  if (passed && profile.lastPlayedDate !== utcDate) {
    newStreak =
      profile.lastPlayedDate === yesterdayUtc ? profile.streak + 1 : 1;
    newLastPlayedDate = utcDate;
  }

  const updates: Promise<unknown>[] = [
    redis.hSet(dKey, {
      attemptsCount: String(newAttemptsCount),
      clearsCount: String(newClearsCount),
      bestAccuracy: newBestAccuracy.toFixed(4),
      todayXp: String(newTodayXp),
    }),
    redis.hSet(pKey, {
      username,
      xp: String(newTotalXp),
      level: String(newLevel),
      title: newTitle,
      streak: String(newStreak),
      lastPlayedDate: newLastPlayedDate ?? '',
    }),
  ];

  if (!isAnonymous && xpEarned > 0) {
    updates.push(
      redis.zAdd('lb:xp:alltime', { member: username, score: newTotalXp }),
      redis.zAdd(`lb:xp:daily:${utcDate}`, { member: username, score: newTodayXp })
    );
  }

  await Promise.all(updates);

  return {
    type: 'attempt',
    passed,
    accuracy,
    xpEarned,
    leveledUp,
    previousLevel,
    profile: {
      username,
      isAnonymous,
      totalXp: newTotalXp,
      level: newLevel,
      title: newTitle,
      streak: newStreak,
      lastPlayedDate: newLastPlayedDate,
    },
    daily: {
      ...daily,
      attemptsCount: newAttemptsCount,
      clearsCount: newClearsCount,
      bestAccuracy: newBestAccuracy,
      todayXp: newTodayXp,
    },
  };
}
