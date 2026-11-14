import { Hono } from 'hono';
import { context, reddit } from '@devvit/web/server';
import type {
  CommitRollRequest,
  CommitRollResponse,
  ErrorResponse,
  StateResponse,
  SubmitAttemptRequest,
} from '../../shared/api';
import {
  commitRoll,
  getDailyState,
  getLeaderboards,
  getPlayerProfile,
  resetDailyState,
  submitAttempt,
} from '../redisStore';
import { syncBardUserFlair } from '../flairService';

export const api = new Hono();

async function resolvePlayer() {
  const username = await reddit.getCurrentUsername();
  if (username) {
    return {
      playerKey: `u:${username}`,
      username,
      isAnonymous: false,
    };
  }
  const fallbackId = context.userId ?? context.postId ?? 'guest';
  return {
    playerKey: `anon:${fallbackId}`,
    username: 'Wandering Bard',
    isAnonymous: true,
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
    const player = await resolvePlayer();
    const [profile, daily] = await Promise.all([
      getPlayerProfile(player.playerKey, player.username, player.isAnonymous),
      getDailyState(player.playerKey),
    ]);

    return c.json<StateResponse>({
      type: 'state',
      postId,
      isDevSubreddit: context.subredditName === 'lute_roll_dev',
      profile,
      daily,
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
    const body = await c.req.json<CommitRollRequest>();
    if (
      typeof body.roll !== 'number' ||
      Number.isNaN(body.roll) ||
      body.roll < 1 ||
      body.roll > 20
    ) {
      return c.json<ErrorResponse>(
        { status: 'error', message: 'Invalid roll value (must be 1..20)' },
        400
      );
    }

    const player = await resolvePlayer();
    const { daily, unlockedFeat } = await commitRoll(
      player.playerKey,
      body.roll,
      Boolean(body.isReroll)
    );

    if (unlockedFeat) {
      const profile = await getPlayerProfile(
        player.playerKey,
        player.username,
        player.isAnonymous
      );
      await syncBardUserFlair(profile);
    }

    return c.json<CommitRollResponse>({
      type: 'roll',
      daily,
      unlockedFeat,
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

    const player = await resolvePlayer();
    const result = await submitAttempt(
      player.playerKey,
      player.username,
      player.isAnonymous,
      body.accuracy
    );

    if (result.passed) {
      await syncBardUserFlair(result.profile);
    }

    return c.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to record attempt';
    return c.json<ErrorResponse>({ status: 'error', message }, 400);
  }
});

api.get('/leaderboard', async (c) => {
  try {
    const player = await resolvePlayer();
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

  const player = await resolvePlayer();
  await resetDailyState(player.playerKey);
  const [profile, daily] = await Promise.all([
    getPlayerProfile(player.playerKey, player.username, player.isAnonymous),
    getDailyState(player.playerKey),
  ]);

  return c.json<StateResponse>({
    type: 'state',
    postId,
    isDevSubreddit: true,
    profile,
    daily,
  });
});
