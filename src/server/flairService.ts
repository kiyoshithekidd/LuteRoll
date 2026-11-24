import { context, reddit } from '@devvit/web/server';
import type { PlayerProfile } from '../shared/api';

export function formatBardFlairText(profile: PlayerProfile): string {
  const streakPart = profile.streak > 0 ? ` 🔥${profile.streak}` : '';
  let badge = '';
  // Prioritize hardest long-term / skill feats over random 1-in-20 Nat 20 roll
  if (profile.feats.includes('streak30')) badge = ' 🏆';
  else if (profile.feats.includes('nat1_clear')) badge = ' 💀';
  else if (profile.feats.includes('nat20')) badge = ' 🎲';

  // Keep under Reddit's 64-char user flair limit
  const raw = `Lvl ${profile.level} ${profile.title}${streakPart}${badge}`;
  return raw.slice(0, 64);
}

export async function syncBardUserFlair(profile: PlayerProfile): Promise<void> {
  if (profile.isAnonymous || !context.subredditName) return;
  try {
    await reddit.setUserFlair({
      subredditName: context.subredditName,
      username: profile.username,
      text: formatBardFlairText(profile),
      backgroundColor: '#103524',
      textColor: 'light',
    });
  } catch (err) {
    // Non-fatal: flair may be disabled or rate-limited in dev sandboxes
    console.warn('Could not update user flair:', err);
  }
}
