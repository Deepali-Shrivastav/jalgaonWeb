"use client";

export const SNOOZE_KEY = "auth_nudge_snooze_until";
export const NEVER_KEY = "auth_nudge_never";

export function snoozeEngagementPrompt(days = 7) {
  if (typeof window === "undefined") return;
  const until = Date.now() + days * 24 * 60 * 60 * 1000;
  localStorage.setItem(SNOOZE_KEY, String(until));
}

export function neverShowEngagementPrompt() {
  if (typeof window === "undefined") return;
  localStorage.setItem(NEVER_KEY, "true");
}
