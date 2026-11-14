import { redis } from '@devvit/web/server';
import {
  BASE_XP_PER_RUN,
  FAIL_ACCURACY_THRESHOLD,
  getLevelFromXp,
  getTierForRoll,
  getTitleForLevel,
  KEYBOARD_VOICES,
  RELIC_CATALOG,
} from '../shared/constants';
import type {
  DailyState,
  KeyboardVoiceId,
  LeaderboardEntry,
  LeaderboardResponse,
  OpenChestResponse,
  PlayerProfile,
  RareFeat,
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

export async function commitRoll(
  playerKey: string,
  roll: number,
  isReroll: boolean
): Promise<{ daily: DailyState; unlockedFeat: RareFeat | null }> {
  const clamped = Math.max(1, Math.min(20, Math.round(roll)));
  const utcDate = getUtcDateKey();
  const key = dailyKey(playerKey, utcDate);
  const current = await getDailyState(playerKey, utcDate);

  if (!isReroll) {
    if (current.initialRoll !== null) {
      return { daily: current, unlockedFeat: null };
    }
    await redis.hSet(key, {
      initialRoll: String(clamped),
      finalRoll: String(clamped),
      rerollUsed: '0',
    });
  } else {
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
  }

  let unlockedFeat: RareFeat | null = null;
  if (clamped === 20) {
    const isNew = await unlockFeatIfNew(playerKey, 'nat20');
    if (isNew) unlockedFeat = 'nat20';
  }

  return {
    daily: await getDailyState(playerKey, utcDate),
    unlockedFeat,
  };
}

export async function submitAttempt(
  playerKey: string,
  username: string,
  isAnonymous: boolean,
  rawAccuracy: number,
  snoovatarUrl?: string | null,
  graceUsed = false
): Promise<SubmitAttemptResponse> {
  const accuracy = Math.max(0, Math.min(1, rawAccuracy));
  const utcDate = getUtcDateKey();
  const yesterdayUtc = getYesterdayUtcKey();
  const dKey = dailyKey(playerKey, utcDate);
  const pKey = profileKey(playerKey);

  const [profile, daily] = await Promise.all([
    getPlayerProfile(playerKey, username, isAnonymous, snoovatarUrl),
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

  const nextFeats = [...profile.feats];
  let unlockedFeat: RareFeat | null = null;
  const grant = (feat: RareFeat) => {
    if (!nextFeats.includes(feat)) {
      nextFeats.push(feat);
      if (!unlockedFeat) unlockedFeat = feat;
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

  const updates: Promise<unknown>[] = [
    redis.hSet(dKey, {
      attemptsCount: String(newAttemptsCount),
      clearsCount: String(newClearsCount),
      bestAccuracy: newBestAccuracy.toFixed(4),
      todayXp: String(newTodayXp),
      chestsEarned: String(newChestsEarned),
    }),
    redis.hSet(pKey, {
      username,
      xp: String(newTotalXp),
      level: String(newLevel),
      title: newTitle,
      streak: String(newStreak),
      lastPlayedDate: newLastPlayedDate ?? '',
      feats: JSON.stringify(nextFeats),
      ...(resolvedAvatar ? { snoovatarUrl: resolvedAvatar } : {}),
    }),
  ];

  if (!isAnonymous && resolvedAvatar) {
    updates.push(redis.hSet('lb:snoovatars', { [username]: resolvedAvatar }));
  }

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
    unlockedFeat,
    profile: {
      username,
      isAnonymous,
      totalXp: newTotalXp,
      level: newLevel,
      title: newTitle,
      streak: newStreak,
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
    },
  };
}

async function fetchSingleBoard(
  zsetKey: string,
  username: string,
  isAnonymous: boolean
): Promise<{
  top: LeaderboardEntry[];
  myRank: number | null;
  myScore: number;
}> {
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
  const utcDate = getUtcDateKey();
  const [daily, allTime] = await Promise.all([
    fetchSingleBoard(`lb:xp:daily:${utcDate}`, username, isAnonymous),
    fetchSingleBoard('lb:xp:alltime', username, isAnonymous),
  ]);

  return {
    type: 'leaderboard',
    utcDate,
    daily,
    allTime,
  };
}

export async function openMysteryChest(
  playerKey: string,
  username: string,
  isAnonymous: boolean,
  snoovatarUrl?: string | null
): Promise<OpenChestResponse> {
  const utcDate = getUtcDateKey();
  const dKey = dailyKey(playerKey, utcDate);
  const pKey = profileKey(playerKey);

  const [profile, daily] = await Promise.all([
    getPlayerProfile(playerKey, username, isAnonymous, snoovatarUrl),
    getDailyState(playerKey, utcDate),
  ]);

  if (daily.chestsOpened >= daily.chestsEarned) {
    throw new Error('No unopened Mystery Chest available right now.');
  }

  // Higher rarity odds on bonus (2nd) chest
  const isBonus = daily.chestsOpened >= 1;
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
  const picked = pool[Math.floor(Math.random() * pool.length)] ?? RELIC_CATALOG[0]!;
  const isDuplicate = profile.relics.includes(picked.id);
  const bonusXp = isDuplicate
    ? rarity === 'mythic' || rarity === 'rare'
      ? 60
      : 30
    : 0;

  const nextRelics = isDuplicate
    ? profile.relics
    : [...profile.relics, picked.id];
  const newTotalXp = profile.totalXp + bonusXp;
  const newLevel = getLevelFromXp(newTotalXp);
  const newTitle = getTitleForLevel(newLevel);
  const newTodayXp = daily.todayXp + bonusXp;
  const newChestsOpened = daily.chestsOpened + 1;

  const nextFeats = [...profile.feats];
  let unlockedFeat: RareFeat | null = null;
  const grant = (feat: RareFeat) => {
    if (!nextFeats.includes(feat)) {
      nextFeats.push(feat);
      if (!unlockedFeat) unlockedFeat = feat;
    }
  };

  if (nextRelics.length >= 5) grant('relic5');
  if (nextRelics.length >= 12) grant('voice6');
  if (nextRelics.length >= 15) grant('relic15');
  if (nextRelics.length >= 30) grant('relic30');
  if (rarity === 'mythic') grant('mythic_relic');
  if (newLevel >= 25) grant('level25');

  const updates: Promise<unknown>[] = [
    redis.hSet(dKey, {
      chestsOpened: String(newChestsOpened),
      todayXp: String(newTodayXp),
    }),
    redis.hSet(pKey, {
      relics: JSON.stringify(nextRelics),
      feats: JSON.stringify(nextFeats),
      xp: String(newTotalXp),
      level: String(newLevel),
      title: newTitle,
    }),
  ];

  if (!isAnonymous && bonusXp > 0) {
    updates.push(
      redis.zAdd('lb:xp:alltime', { member: username, score: newTotalXp }),
      redis.zAdd(`lb:xp:daily:${utcDate}`, { member: username, score: newTodayXp })
    );
  }

  await Promise.all(updates);

  return {
    type: 'open-chest',
    relicId: picked.id,
    isDuplicate,
    bonusXp,
    unlockedFeat,
    profile: {
      ...profile,
      relics: nextRelics,
      feats: nextFeats,
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
