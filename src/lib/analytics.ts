/**
 * GA4 event helpers
 * Usage: trackEvent('game_complete', { score: 100 })
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);
  }
}

// Pre-defined game events
export const GameEvents = {
  gameStart: () => trackEvent("game_start"),
  gameComplete: (score: number) => trackEvent("game_complete", { score }),
  shareClick: (method: string) => trackEvent("share", { method }),
  leaderboardSubmit: (score: number) =>
    trackEvent("leaderboard_submit", { score }),
  commentSubmit: () => trackEvent("comment_submit"),
};
