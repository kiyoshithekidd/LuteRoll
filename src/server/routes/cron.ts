import { Hono } from 'hono';
import { context, reddit } from '@devvit/web/server';
import { getIsoWeekKey } from '../../shared/constants';
import {
  getDailyPostId,
  getLastWeekHeadliner,
  getUtcDateKey,
  getYesterdayRecap,
  getYesterdayUtcKey,
  setDailyPostId,
} from '../redisStore';

export const cron = new Hono();

cron.post('/daily-post', async (c) => {
  const subredditName = context.subredditName;
  if (!subredditName) {
    return c.json({ status: 'error', message: 'Missing subredditName' }, 400);
  }

  try {
    const now = new Date();
    const todayUtc = getUtcDateKey(now);
    const yesterdayUtc = getYesterdayUtcKey(now);
    const todayLabel = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    });

    // Unsticky yesterday's daily post if we tracked it
    const prevPostId = await getDailyPostId(yesterdayUtc).catch(() => null);
    if (prevPostId) {
      try {
        const prevPost = await reddit.getPostById(prevPostId as `t3_${string}`);
        await prevPost.unsticky();
      } catch {
        // Non-fatal if already unstickied or removed
      }
    }

    const post = await reddit.submitCustomPost({
      subredditName,
      title: `Lute Roll — Daily Tavern Melody (${todayLabel})`,
      entry: 'default',
    });

    await setDailyPostId(todayUtc, post.id).catch(() => {});

    try {
      await post.sticky();
    } catch {
      // Non-fatal if sticky slot or permission is unavailable
    }

    // Post a pinned Yesterday's Headliner Bard recap comment (+ Monday Weekly Spotlight #34)
    try {
      const recap = await getYesterdayRecap(yesterdayUtc);
      const isMondayUtc = now.getUTCDay() === 1;
      const lastWeekKey = getIsoWeekKey(new Date(now.getTime() - 86_400_000));
      const weeklyHeadliner = isMondayUtc
        ? await getLastWeekHeadliner(lastWeekKey).catch(() => null)
        : null;

      if (recap.topBard || recap.rollersCount > 0 || weeklyHeadliner) {
        const lines: string[] = [
          `**📜 Yesterday's Tavern Ledger (${yesterdayUtc})**`,
        ];
        if (weeklyHeadliner) {
          lines.push(
            `🏆 **Last Week's Grand Headliner (${lastWeekKey}):** u/${weeklyHeadliner.username} (${weeklyHeadliner.score.toLocaleString()} Weekly XP)`
          );
        }
        if (recap.topBard) {
          lines.push(
            `👑 **Headliner Bard:** u/${recap.topBard.username} (${recap.topBard.score.toLocaleString()} XP)`
          );
        }
        if (recap.rollersCount > 0) {
          lines.push(
            `🎲 **Bards Rolled:** ${recap.rollersCount} • 🍅 **Tomatoes Thrown:** ${recap.tomatoesCount} • 🍻 **Tavern XP:** ${recap.communityXp.toLocaleString()}`
          );
        }
        lines.push(
          `\nRoll today's d20 above and drop your result card in the tavern below!`
        );

        const comment = await reddit.submitComment({
          id: post.id,
          text: lines.join('  \n'),
        });
        await comment.distinguish(true).catch(() => {});
      }
    } catch {
      // Non-fatal if recap comment fails
    }

    return c.json({
      status: 'success',
      postId: post.id,
      date: todayLabel,
    });
  } catch (error) {
    console.error('Daily cron post failed:', error);
    return c.json(
      { status: 'error', message: 'Failed to create daily post' },
      500
    );
  }
});
