export type CommentaryInput = {
  accuracy: number;
  passed: boolean;
  roll: number;
  graceUsed?: boolean;
  seed?: string;
};

export type PerformanceCommentary = {
  headline: string;
  subline: string;
};

function pickFromPool<T>(pool: readonly T[], seed: string): T {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const idx = Math.abs(hash) % pool.length;
  return pool[idx]!;
}

const FLAWLESS_LINES: readonly PerformanceCommentary[] = [
  {
    headline: 'Flawless Performance!',
    subline: 'Not a single missed note — the tavern erupts in applause!',
  },
  {
    headline: 'Pure Bardic Magic!',
    subline: 'The Tavern Keeper wipes a tear and pours one on the house.',
  },
  {
    headline: 'Golden-Ear Perfection!',
    subline: 'Even the rowdiest table fell dead silent for that cadence.',
  },
  {
    headline: 'Masterwork Encore!',
    subline: 'Coins rain onto the stage — zero sour notes!',
  },
];

const NAT20_CRIT_LINES: readonly PerformanceCommentary[] = [
  {
    headline: 'Critical Success!',
    subline: 'Rolled a Nat 20 and played it like a legend — 3.0x XP!',
  },
  {
    headline: 'Blessed by Fate!',
    subline: 'Nat 20 luck meets golden-fingered execution!',
  },
];

const NAT1_SURVIVE_LINES: readonly PerformanceCommentary[] = [
  {
    headline: 'You Conquered Brutal!',
    subline: 'A Nat 1 tried to end you, and you turned it into a legend!',
  },
  {
    headline: 'Underdog Encore!',
    subline: 'Against all odds, the Brutal melody bows to your lute!',
  },
];

const NEAR_MISS_LINES: readonly PerformanceCommentary[] = [
  {
    headline: 'So Close to Perfection!',
    subline: 'Just a whisker shy of 100% — the crowd barely noticed!',
  },
  {
    headline: 'Crisp & Crowd-Pleasing!',
    subline: 'A tiny slip, a huge cheer — tankards raised high!',
  },
  {
    headline: 'Tavern Favorite!',
    subline: 'Almost spotless! One more run could nail the 100%.',
  },
];

const SOLID_CLEAR_LINES: readonly PerformanceCommentary[] = [
  {
    headline: 'The Tavern Cheers!',
    subline: 'A hearty tune — feet tapping across every wooden bench.',
  },
  {
    headline: 'Well Played, Bard!',
    subline: 'The hearth burns brighter after a warm performance like that.',
  },
  {
    headline: 'Crowd-Pleasing Melody!',
    subline: 'A few rustic edges, plenty of heart. Coins hit the tip jar!',
  },
];

const BARELY_SURVIVED_LINES: readonly PerformanceCommentary[] = [
  {
    headline: 'By the Skin of Your Strings!',
    subline: 'The Tavern Keeper put the tomatoes back down — barely!',
  },
  {
    headline: 'Scraped Through!',
    subline: 'Wobbly start, clutch finish. A clear is a clear!',
  },
  {
    headline: 'Held the Stage!',
    subline: 'Half the crowd cheered, half squinted — you still get paid!',
  },
];

const GRACE_SAVED_LINES: readonly PerformanceCommentary[] = [
  {
    headline: 'Saved by Ward of Grace!',
    subline: 'Your streak magic caught the slip before the crowd noticed!',
  },
  {
    headline: 'Arcane Recovery!',
    subline: 'Ward of Grace turned a stumble into a clean finish.',
  },
];

const CLOSE_FAIL_LINES: readonly PerformanceCommentary[] = [
  {
    headline: 'So Close — Tomatoes Fly!',
    subline: 'Just short of 50%! One more listen and you’ve got this.',
  },
  {
    headline: 'Almost Held the Crowd!',
    subline: 'A single tomato grazed your cap — run it back!',
  },
];

const MID_FAIL_LINES: readonly PerformanceCommentary[] = [
  {
    headline: 'Tomatoes Thrown!',
    subline: 'Boo! Even the tavern cat covered its ears!',
  },
  {
    headline: 'Off-Key Calamity!',
    subline: 'More practice, less ale, bard — hit Replay Tune!',
  },
  {
    headline: 'Cleared the Room!',
    subline: 'The Tavern Keeper reached straight for the tomato crate!',
  },
];

const DISASTER_FAIL_LINES: readonly PerformanceCommentary[] = [
  {
    headline: 'Catastrophic Tomato Barrage!',
    subline: 'Were you playing with your elbows?! Listen again first!',
  },
  {
    headline: 'Lute Strings Snapped!',
    subline: 'The whole tavern ducked for cover — hit Replay Tune!',
  },
];

export function getPerformanceCommentary(
  input: CommentaryInput
): PerformanceCommentary {
  const { accuracy, passed, roll, graceUsed = false, seed = '' } = input;
  const key = `${seed}:${Math.round(accuracy * 100)}:${roll}:${passed}`;

  if (passed) {
    if (roll === 1) return pickFromPool(NAT1_SURVIVE_LINES, key);
    if (accuracy >= 1) {
      if (roll === 20) return pickFromPool(NAT20_CRIT_LINES, key);
      return pickFromPool(FLAWLESS_LINES, key);
    }
    if (graceUsed && accuracy < 0.75) {
      return pickFromPool(GRACE_SAVED_LINES, key);
    }
    if (accuracy >= 0.9) return pickFromPool(NEAR_MISS_LINES, key);
    if (accuracy >= 0.7) return pickFromPool(SOLID_CLEAR_LINES, key);
    return pickFromPool(BARELY_SURVIVED_LINES, key);
  }

  if (accuracy >= 0.35) return pickFromPool(CLOSE_FAIL_LINES, key);
  if (accuracy >= 0.15) return pickFromPool(MID_FAIL_LINES, key);
  return pickFromPool(DISASTER_FAIL_LINES, key);
}
