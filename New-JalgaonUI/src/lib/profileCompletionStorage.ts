"use client";

export const PC_SNOOZE_KEY = 'jalgaon_pc_snooze_until';
export const PC_DISMISSED_KEY = 'jalgaon_pc_dismissed';
export const PC_SCORE_KEY = 'jalgaon_pc_score';
export const PC_SCORE_TTL = 5 * 60 * 1000; // 5 minutes cache

export function snoozeProfileNudge(days = 7): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PC_SNOOZE_KEY, String(Date.now() + days * 86400000));
}

export function dismissProfileNudge(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(PC_DISMISSED_KEY, 'true');
}

export function isProfileNudgeSnoozed(): boolean {
  if (typeof window === 'undefined') return false;
  const until = localStorage.getItem(PC_SNOOZE_KEY);
  return !!until && Date.now() < parseInt(until, 10);
}

export function isProfileNudgeDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(PC_DISMISSED_KEY) === 'true';
}

export function getCachedScore(): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PC_SCORE_KEY);
    if (!raw) return null;
    const { score, at } = JSON.parse(raw);
    if (Date.now() - at > PC_SCORE_TTL) return null; // stale
    return score;
  } catch { return null; }
}

export function setCachedScore(score: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PC_SCORE_KEY, JSON.stringify({ score, at: Date.now() }));
}
