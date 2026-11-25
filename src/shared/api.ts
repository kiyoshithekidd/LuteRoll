import type { BardAvatarConfig } from './cosmetics';

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

export type NoteResult = 'hit' | 'grace' | 'miss';

export type KeyboardVoiceId =
  | 'grand_piano'
  | 'tavern_lute'
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
  streakFreezes: number;
  dupePity: number;
  lastPlayedDate: string | null;
  feats: RareFeat[];
  relics: string[];
  selectedVoice: KeyboardVoiceId;
  bardAvatar: BardAvatarConfig;
  snoovatarUrl?: string | null;
};

export type EncoreMode = 'standard' | 'no_lights' | 'fast_tempo';

export type GauntletChallenge = {
  id: string;
  utcDate: string;
  roll: number;
  seedKey: string;
  challengerUsername: string;
  challengerAccuracy: number;
  challengerBardAvatar?: BardAvatarConfig | null;
  challengerSnoovatarUrl?: string | null;
};

export type GauntletVerdict = {
  gauntletId: string;
  won: boolean;
  tied: boolean;
  challengerUsername: string;
  challengerAccuracy: number;
  bonusXp: number;
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
  bountyClaimed: boolean;
  milestoneChestTier?: 'unowned' | 'mythic' | null;
};

export type TavernStats = {
  utcDate: string;
  rollersToday: number;
  tomatoesToday: number;
  communityXpToday: number;
  communityGoalXp: number;
  encoreActive: boolean;
};

export type OpenChestResponse = {
  type: 'open-chest';
  relicId: string;
  isDuplicate: boolean;
  pityTriggered?: boolean;
  milestoneGuaranteed?: boolean;
  bonusXp: number;
  leveledUp: boolean;
  previousLevel: number;
  unlockedFeat?: RareFeat | null;
  unlockedFeats: RareFeat[];
  profile: PlayerProfile;
  daily: DailyState;
};

export type StateResponse = {
  type: 'state';
  postId: string;
  isDevSubreddit?: boolean;
  profile: PlayerProfile;
  daily: DailyState;
  tavernStats?: TavernStats | undefined;
};

export type CommitRollRequest = {
  isReroll?: boolean;
};

export type CommitRollResponse = {
  type: 'roll';
  roll: number;
  daily: DailyState;
  unlockedFeat: RareFeat | null;
  unlockedFeats: RareFeat[];
  tavernStats?: TavernStats;
};

export type SubmitAttemptRequest = {
  accuracy: number; // 0..1
  graceUsed?: boolean;
  noteResults?: NoteResult[];
  utcDate?: string;
  encoreMode?: EncoreMode;
  gauntletId?: string;
};

export type SubmitAttemptResponse = {
  type: 'attempt';
  passed: boolean;
  accuracy: number;
  xpEarned: number;
  encoreBonusXp?: number;
  encoreChallengeBonusXp?: number;
  bountyCompletedXp?: number;
  milestoneChestAwarded?: 'unowned' | 'mythic' | null;
  gauntletVerdict?: GauntletVerdict | null;
  streakSavedByFreeze?: boolean;
  leveledUp: boolean;
  previousLevel: number;
  unlockedFeat: RareFeat | null;
  unlockedFeats: RareFeat[];
  noteResults?: NoteResult[];
  profile: PlayerProfile;
  daily: DailyState;
  tavernStats?: TavernStats;
};

export type LeaderboardEntry = {
  rank: number;
  username: string;
  score: number;
  snoovatarUrl?: string | null;
  bardAvatar?: BardAvatarConfig | null;
  epithet?: string | null;
};

export type ShareCommentRequest = {
  utcDate?: string;
  portraitPath?: string;
};

export type ShareCommentResponse = {
  type: 'share-comment';
  ok: boolean;
  alreadyShared?: boolean;
};

export type LeaderboardBoard = {
  top: LeaderboardEntry[];
  myRank: number | null;
  myScore: number;
};

export type LeaderboardResponse = {
  type: 'leaderboard';
  utcDate: string;
  weekKey: string;
  daily: LeaderboardBoard;
  weekly: LeaderboardBoard;
  allTime: LeaderboardBoard;
};

export type ErrorResponse = {
  status: 'error';
  message: string;
};
