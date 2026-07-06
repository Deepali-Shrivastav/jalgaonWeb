/**
 * Local search history management.
 * FR-SRCH-05: Recent search history stored per user, max 10 items.
 * Uses localStorage — no server calls, no auth required.
 */

const HISTORY_KEY = 'jalgaon_search_history';
const MAX_ITEMS = 10;

export function addToSearchHistory(query: string): void {
  if (typeof window === 'undefined') return;
  const q = query.trim();
  if (!q || q.length < 2) return;

  try {
    const existing = getSearchHistory();
    const deduped = [q, ...existing.filter((h) => h.toLowerCase() !== q.toLowerCase())];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(deduped.slice(0, MAX_ITEMS)));
  } catch {
    // localStorage might be disabled (private browsing, etc.)
  }
}

export function getSearchHistory(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function removeFromSearchHistory(query: string): void {
  if (typeof window === 'undefined') return;
  try {
    const filtered = getSearchHistory().filter(
      (h) => h.toLowerCase() !== query.toLowerCase()
    );
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  } catch {}
}

export function clearSearchHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {}
}
