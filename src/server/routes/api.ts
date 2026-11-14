import { Hono } from 'hono';
import { context, reddit, redis } from '@devvit/web/server';
import type {
  ErrorResponse,
  StateResponse,
  TestRollResponse,
} from '../../shared/api';

export const api = new Hono();

function getUtcDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getTierLabel(roll: number): string {
  if (roll === 20) return 'Trivial (Nat 20 • Critical Success!)';
  if (roll >= 17) return 'Easy';
  if (roll >= 13) return 'Medium';
  if (roll >= 8) return 'Hard';
  if (roll >= 2) return 'Very Hard';
  return 'Brutal (Nat 1!)';
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
    const [username, countStr, lastRollStr] = await Promise.all([
      reddit.getCurrentUsername(),
      redis.get(`m1:post:${postId}:roll_count`),
      redis.get(`m1:post:${postId}:last_roll`),
    ]);

    return c.json<StateResponse>({
      type: 'state',
      postId,
      username: username ?? 'Wandering Bard',
      utcDate: getUtcDateKey(),
      lastTestRoll: lastRollStr ? parseInt(lastRollStr, 10) : null,
      testRollCount: countStr ? parseInt(countStr, 10) : 0,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error loading state';
    return c.json<ErrorResponse>({ status: 'error', message }, 500);
  }
});

api.post('/test-roll', async (c) => {
  const { postId } = context;

  if (!postId) {
    return c.json<ErrorResponse>(
      { status: 'error', message: 'postId is required' },
      400
    );
  }

  try {
    const roll = Math.floor(Math.random() * 20) + 1;
    const [testRollCount] = await Promise.all([
      redis.incrBy(`m1:post:${postId}:roll_count`, 1),
      redis.set(`m1:post:${postId}:last_roll`, String(roll)),
    ]);

    return c.json<TestRollResponse>({
      type: 'test-roll',
      postId,
      roll,
      tierLabel: getTierLabel(roll),
      testRollCount,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to roll test d20';
    return c.json<ErrorResponse>({ status: 'error', message }, 500);
  }
});
