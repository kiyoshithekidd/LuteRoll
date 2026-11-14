import { context, reddit } from '@devvit/web/server';

export const createPost = async () => {
  const subredditName = context.subredditName;
  if (!subredditName) {
    throw new Error('subredditName is required to create a post');
  }

  return await reddit.submitCustomPost({
    subredditName,
    title: 'Lute Roll — Daily Tavern Melody',
    entry: 'default',
  });
};
