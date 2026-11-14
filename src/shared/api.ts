export type RareFeat = 'nat20' | 'nat1_clear' | 'streak30';

export type PlayerProfile = {
  username: string;
  isAnonymous: boolean;
  totalXp: number;
  level: number;
  title: string;
  streak: number;
  lastPlayedDate: string | null;
  feats: RareFeat[];
};

export type DailyState = {
  utcDate: string;
  initialRoll: number | null;
  reroll: number | null;
  finalRoll: number | null;
  rerollUsed: boolean;
  attemptsCount: number;
  clearsCount: number;
  bestAccuracy: number;
  todayXp: number;
};

export type StateResponse = {
  type: 'state';
  postId: string;
  isDevSubreddit?: boolean;
  profile: PlayerProfile;
  daily: DailyState;
};

export type CommitRollRequest = {
  roll: number;
  isReroll?: boolean;
};

export type CommitRollResponse = {
  type: 'roll';
  daily: DailyState;
  unlockedFeat: RareFeat | null;
};

export type SubmitAttemptRequest = {
  accuracy: number; // 0..1
};

export type SubmitAttemptResponse = {
  type: 'attempt';
  passed: boolean;
  accuracy: number;
  xpEarned: number;
  leveledUp: boolean;
  previousLevel: number;
  unlockedFeat: RareFeat | null;
  profile: PlayerProfile;
  daily: DailyState;
};

export type LeaderboardEntry = {
  rank: number;
  username: string;
  score: number;
};

export type LeaderboardResponse = {
  type: 'leaderboard';
  utcDate: string;
  daily: {
    top: LeaderboardEntry[];
    myRank: number | null;
    myScore: number;
  };
  allTime: {
    top: LeaderboardEntry[];
    myRank: number | null;
    myScore: number;
  };
};

export type ErrorResponse = {
  status: 'error';
  message: string;
};
