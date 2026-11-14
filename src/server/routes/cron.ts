import { Hono } from 'hono';
import { context, reddit } from '@devvit/web/server';

export const cron = new Hono();

cron.post('/daily-post', async (c) => {
  const subredditName = context.subredditName;
  if (!subredditName) {
    return c.json({ status: 'error', message: 'Missing subredditName' }, 400);
  }

  try {
    const today = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    });

    const post = await reddit.submitCustomPost({
      subredditName,
      title: `Lute Roll — Daily Tavern Melody (${today})`,
      entry: 'default',
    });

    return c.json({
      status: 'success',
      postId: post.id,
      date: today,
    });
  } catch (error) {
    console.error('Daily cron post failed:', error);
    return c.json(
      { status: 'error', message: 'Failed to create daily post' },
      500
    );
  }
});
