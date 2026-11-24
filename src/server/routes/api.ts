import { Hono, type Context } from 'hono';
import { context, reddit } from '@devvit/web/server';
import type {
  CommitRollRequest,
  CommitRollResponse,
  ErrorResponse,
  KeyboardVoiceId,
  ShareCommentRequest,
  ShareCommentResponse,
  StateResponse,
  SubmitAttemptRequest,
} from '../../shared/api';
import { formatResultCardText } from '../../shared/resultCard';
import {
  claimShareCommentSlot,
  commitRoll,
  getDailyState,
  getLastRunForShare,
  getLeaderboards,
  getPlayerProfile,
  getTavernStats,
  openMysteryChest,
  resetDailyState,
  selectKeyboardVoice,
  submitAttempt,
} from '../redisStore';
import { syncBardUserFlair } from '../flairService';

export const api = new Hono();

const GUEST_ID_PATTERN = /^guest_[a-zA-Z0-9-]{12,48}$/;

async function resolvePlayer(c: Context) {
  const username = await reddit.getCurrentUsername();
  if (username) {
    const snoovatarUrl = await reddit
      .getSnoovatarUrl(username)
      .catch(() => undefined);
    return {
      playerKey: `u:${username}`,
      username,
      isAnonymous: false,
      snoovatarUrl: snoovatarUrl ?? null,
    };
  }

  // B1 fix: isolate logged-out visitors per browser using a validated client guest ID
  const headerGuestId = c.req.header('x-guest-id')?.trim();
  const validatedGuestId =
    headerGuestId && GUEST_ID_PATTERN.test(headerGuestId)
      ? headerGuestId
      : null;

  const fallbackId =
    context.userId ?? validatedGuestId ?? context.postId ?? 'guest';

  return {
    playerKey: `anon:${fallbackId}`,
    username: 'Wandering Bard',
    isAnonymous: true,
    snoovatarUrl: null,
  };
}

api.get('/state', async (c) => {
  const { postId } = context;

  if (!postId) {
    return c.json<ErrorResponse>(
      { status: 'error', message: 'postId is required but missing from context' },
      400
    );
  }

  try {
    const player = await resolvePlayer(c);
    const [profile, daily, tavernStats] = await Promise.all([
      getPlayerProfile(
        player.playerKey,
        player.username,
        player.isAnonymous,
        player.snoovatarUrl
      ),
      getDailyState(player.playerKey),
      getTavernStats(),
    ]);

    return c.json<StateResponse>({
      type: 'state',
      postId,
      isDevSubreddit: context.subredditName === 'lute_roll_dev',
      profile,
      daily,
      tavernStats,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error loading state';
    return c.json<ErrorResponse>({ status: 'error', message }, 500);
  }
});

api.post('/roll', async (c) => {
  if (!context.postId) {
    return c.json<ErrorResponse>(
      { status: 'error', message: 'postId is required' },
      400
    );
  }

  try {
    const body = (await c.req.json().catch(() => ({}))) as CommitRollRequest;
    const player = await resolvePlayer(c);
    const { roll, daily, unlockedFeat, unlockedFeats, tavernStats } =
      await commitRoll(player.playerKey, Boolean(body.isReroll));

    if (unlockedFeats.length > 0) {
      const profile = await getPlayerProfile(
        player.playerKey,
        player.username,
        player.isAnonymous
      );
      await syncBardUserFlair(profile);
    }

    return c.json<CommitRollResponse>({
      type: 'roll',
      roll,
      daily,
      unlockedFeat,
      unlockedFeats,
      tavernStats,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to commit roll';
    return c.json<ErrorResponse>({ status: 'error', message }, 400);
  }
});

api.post('/attempt', async (c) => {
  if (!context.postId) {
    return c.json<ErrorResponse>(
      { status: 'error', message: 'postId is required' },
      400
    );
  }

  try {
    const body = await c.req.json<SubmitAttemptRequest>();
    if (
      typeof body.accuracy !== 'number' ||
      Number.isNaN(body.accuracy) ||
      body.accuracy < 0 ||
      body.accuracy > 1
    ) {
      return c.json<ErrorResponse>(
        { status: 'error', message: 'Invalid accuracy value (must be 0..1)' },
        400
      );
    }

    const player = await resolvePlayer(c);
    const result = await submitAttempt(
      player.playerKey,
      player.username,
      player.isAnonymous,
      body.accuracy,
      player.snoovatarUrl,
      Boolean(body.graceUsed),
      body.noteResults,
      body.utcDate
    );

    if (result.passed || result.leveledUp || result.unlockedFeats.length > 0) {
      await syncBardUserFlair(result.profile);
    }

    return c.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to record attempt';
    return c.json<ErrorResponse>({ status: 'error', message }, 400);
  }
});

api.post('/share-comment', async (c) => {
  const { postId } = context;
  if (!postId) {
    return c.json<ErrorResponse>(
      { status: 'error', message: 'postId is required' },
      400
    );
  }

  try {
    const body = (await c.req.json().catch(() => ({}))) as ShareCommentRequest;
    const player = await resolvePlayer(c);

    // B2 fix: prevent unauthenticated bot comment spam and format card strictly server-side
    if (player.isAnonymous) {
      return c.json<ErrorResponse>(
        { status: 'error', message: 'Sign in to Reddit to post your result card.' },
        401
      );
    }

    const [profile, lastRun] = await Promise.all([
      getPlayerProfile(
        player.playerKey,
        player.username,
        player.isAnonymous,
        player.snoovatarUrl
      ),
      getLastRunForShare(player.playerKey, body.utcDate),
    ]);

    if (!lastRun) {
      return c.json<ErrorResponse>(
        { status: 'error', message: 'Complete a run before posting to the thread.' },
        400
      );
    }

    const allowed = await claimShareCommentSlot(
      player.playerKey,
      postId,
      lastRun.utcDate
    );
    if (!allowed) {
      return c.json<ShareCommentResponse>({
        type: 'share-comment',
        ok: true,
        alreadyShared: true,
      });
    }

    const formattedCard = formatResultCardText({
      utcDate: lastRun.utcDate,
      roll: lastRun.roll,
      accuracy: lastRun.accuracy,
      xpEarned: lastRun.xpEarned,
      passed: lastRun.passed,
      noteResults: lastRun.noteResults,
      profile,
      forRedditMarkdown: true,
    });

    const commentBody = `**u/${player.username}**\n\n${formattedCard}`;
    await reddit.submitComment({
      id: postId,
      text: commentBody,
    });

    return c.json<ShareCommentResponse>({
      type: 'share-comment',
      ok: true,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Could not post comment';
    return c.json<ErrorResponse>({ status: 'error', message }, 400);
  }
});

api.post('/subscribe', async (c) => {
  try {
    await reddit.subscribeToCurrentSubreddit();
    return c.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Could not subscribe';
    return c.json<ErrorResponse>({ status: 'error', message }, 400);
  }
});

api.get('/leaderboard', async (c) => {
  try {
    const player = await resolvePlayer(c);
    const board = await getLeaderboards(player.username, player.isAnonymous);
    return c.json(board);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to load leaderboards';
    return c.json<ErrorResponse>({ status: 'error', message }, 500);
  }
});

api.post('/dev-reset', async (c) => {
  if (context.subredditName !== 'lute_roll_dev') {
    return c.json<ErrorResponse>(
      { status: 'error', message: 'Dev reset is only allowed on r/lute_roll_dev' },
      403
    );
  }

  const { postId } = context;
  if (!postId) {
    return c.json<ErrorResponse>(
      { status: 'error', message: 'postId is required' },
      400
    );
  }

  const player = await resolvePlayer(c);
  await resetDailyState(player.playerKey);
  const [profile, daily, tavernStats] = await Promise.all([
    getPlayerProfile(player.playerKey, player.username, player.isAnonymous),
    getDailyState(player.playerKey),
    getTavernStats(),
  ]);

  return c.json<StateResponse>({
    type: 'state',
    postId,
    isDevSubreddit: true,
    profile,
    daily,
    tavernStats,
  });
});

api.post('/open-chest', async (c) => {
  try {
    const player = await resolvePlayer(c);
    const result = await openMysteryChest(
      player.playerKey,
      player.username,
      player.isAnonymous,
      player.snoovatarUrl
    );

    // B8 fix: sync flair if chest duplicate XP leveled up the bard or unlocked a feat
    if (result.leveledUp || result.unlockedFeats.length > 0) {
      await syncBardUserFlair(result.profile);
    }

    return c.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Could not open chest';
    return c.json<ErrorResponse>({ status: 'error', message }, 400);
  }
});

api.post('/voice', async (c) => {
  try {
    const body = (await c.req.json()) as { voiceId?: KeyboardVoiceId };
    if (!body.voiceId) {
      return c.json<ErrorResponse>(
        { status: 'error', message: 'Missing voiceId' },
        400
      );
    }
    const player = await resolvePlayer(c);
    const profile = await selectKeyboardVoice(
      player.playerKey,
      player.username,
      player.isAnonymous,
      body.voiceId
    );
    return c.json({ ok: true, profile });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Could not select voice';
    return c.json<ErrorResponse>({ status: 'error', message }, 400);
  }
});
