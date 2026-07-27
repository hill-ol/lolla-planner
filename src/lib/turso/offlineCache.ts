const PREFIX = 'lolla-offline-cache:';

export function saveOfflineCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(data));
  } catch {
    // Storage full or unavailable (e.g. private browsing) — offline fallback
    // just won't be available for this key, nothing else to do about it.
  }
}

export function loadOfflineCache<T>(key: string): T | undefined {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
}
