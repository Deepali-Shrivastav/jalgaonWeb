"use client";

export const PC_SNOOZE_KEY = 'jalgaon_pc_snooze_until';
export const PC_DISMISSED_KEY = 'jalgaon_pc_dismissed';
export const PC_SCORE_KEY = 'jalgaon_pc_score';
export const PC_SCORE_TTL = 5 * 60 * 1000; // 5 minutes cache

export function snoozeProfileNudge(userId: string | number | undefined, days = 7): void {
  if (typeof window === 'undefined' || !userId) return;
  localStorage.setItem(`jalgaon_pc_snooze_until_${userId}`, String(Date.now() + days * 86400000));
}

export function dismissProfileNudge(userId: string | number | undefined): void {
  if (typeof window === 'undefined' || !userId) return;
  sessionStorage.setItem(`jalgaon_pc_dismissed_${userId}`, 'true');
}

export function isProfileNudgeSnoozed(userId: string | number | undefined): boolean {
  if (typeof window === 'undefined' || !userId) return false;
  const until = localStorage.getItem(`jalgaon_pc_snooze_until_${userId}`);
  return !!until && Date.now() < parseInt(until, 10);
}

export function isProfileNudgeDismissed(userId: string | number | undefined): boolean {
  if (typeof window === 'undefined' || !userId) return false;
  return sessionStorage.getItem(`jalgaon_pc_dismissed_${userId}`) === 'true';
}

export function getCachedScore(userId: string | number | undefined): number | null {
  if (typeof window === 'undefined' || !userId) return null;
  try {
    const raw = localStorage.getItem(`jalgaon_pc_score_${userId}`);
    if (!raw) return null;
    const { score, at } = JSON.parse(raw);
    const PC_SCORE_TTL = 5 * 60 * 1000;
    if (Date.now() - at > PC_SCORE_TTL) return null; // stale
    return score;
  } catch { return null; }
}

export function setCachedScore(userId: string | number | undefined, score: number): void {
  if (typeof window === 'undefined' || !userId) return;
  localStorage.setItem(`jalgaon_pc_score_${userId}`, JSON.stringify({ score, at: Date.now() }));
}
