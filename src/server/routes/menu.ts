import { Hono } from 'hono';
import type { UiResponse } from '@devvit/web/shared';
import { context } from '@devvit/web/server';
import { createPost } from '../core/post';
import { resetDailyState } from '../redisStore';

export const menu = new Hono();

menu.post('/post-create', async (c) => {
  try {
    const post = await createPost();

    return c.json<UiResponse>(
      {
        navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`,
      },
      200
    );
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    return c.json<UiResponse>(
      {
        showToast: 'Failed to create Lute Roll post',
      },
      400
    );
  }
});

menu.post('/reset-daily', async (c) => {
  if (context.subredditName !== 'lute_roll_dev') {
    return c.json<UiResponse>(
      {
        showToast: 'Daily reset is only enabled on r/lute_roll_dev.',
      },
      403
    );
  }

  const playerKey = context.userId;
  if (!playerKey) {
    return c.json<UiResponse>(
      {
        showToast: 'Sign in required to reset daily state.',
      },
      401
    );
  }

  await resetDailyState(playerKey);
  return c.json<UiResponse>(
    {
      showToast: 'Daily roll reset! Reopen or refresh the post to roll again.',
    },
    200
  );
});
