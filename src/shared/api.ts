export type PlayerProfile = {
  username: string;
  isAnonymous: boolean;
  totalXp: number;
  level: number;
  title: string;
  streak: number;
  lastPlayedDate: string | null;
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
  profile: PlayerProfile;
  daily: DailyState;
};

export type ErrorResponse = {
  status: 'error';
  message: string;
};
