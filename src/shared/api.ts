export type StateResponse = {
  type: 'state';
  postId: string;
  username: string;
  utcDate: string;
  lastTestRoll: number | null;
  testRollCount: number;
};

export type TestRollResponse = {
  type: 'test-roll';
  postId: string;
  roll: number;
  tierLabel: string;
  testRollCount: number;
};

export type ErrorResponse = {
  status: 'error';
  message: string;
};
