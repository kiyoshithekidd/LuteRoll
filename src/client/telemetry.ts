import { telemetry } from '@devvit/analytics/client/reddit';

export function trackAppReady(): void {
  try {
    void telemetry.appReady();
  } catch {
    // Non-fatal outside allowlisted Reddit environment
  }
}

export function trackJourneyStart(): void {
  try {
    void telemetry.startJourney();
  } catch {
    // Non-fatal
  }
}

export function trackJourneyProgress(progress: number, action: string): void {
  try {
    void telemetry.progress({ progress, action });
  } catch {
    // Non-fatal
  }
}

export function trackJourneyEnd(win: boolean, score: number): void {
  try {
    void telemetry.endJourney({
      complete: true,
      game: { win, score },
    });
  } catch {
    // Non-fatal
  }
}
