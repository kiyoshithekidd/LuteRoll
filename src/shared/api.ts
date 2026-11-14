export type RareFeat =
  | 'first_tune'
  | 'flawless'
  | 'nat20'
  | 'nat1_clear'
  | 'streak3'
  | 'streak7'
  | 'streak30'
  | 'grinder5'
  | 'grace_note'
  | 'relic5'
  | 'relic15'
  | 'relic30'
  | 'mythic_relic'
  | 'voice6'
  | 'level25';

export type RelicRarity = 'common' | 'uncommon' | 'rare' | 'mythic';

export type KeyboardVoiceId =
  | 'grand_piano'
  | 'honky_tonk'
  | 'harpsichord'
  | 'music_box'
  | 'electric_piano'
  | 'clavinet'
  | 'cathedral_organ'
  | 'accordion'
  | 'arcane_synth'
  | 'bell_organ'
  | 'celesta'
  | 'astral_grand';

export type PlayerProfile = {
  username: string;
  isAnonymous: boolean;
  totalXp: number;
  level: number;
  title: string;
  streak: number;
  lastPlayedDate: string | null;
  feats: RareFeat[];
  relics: string[];
  selectedVoice: KeyboardVoiceId;
  snoovatarUrl?: string | null;
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
  chestsEarned: number;
  chestsOpened: number;
};

export type OpenChestResponse = {
  type: 'open-chest';
  relicId: string;
  isDuplicate: boolean;
  bonusXp: number;
  unlockedFeat?: RareFeat | null;
  profile: PlayerProfile;
  daily: DailyState;
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
  graceUsed?: boolean;
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
  snoovatarUrl?: string | null;
};

export type ShareCommentRequest = {
  text: string;
};

export type ShareCommentResponse = {
  type: 'share-comment';
  ok: boolean;
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
