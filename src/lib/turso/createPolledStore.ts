import { loadOfflineCache, saveOfflineCache } from './offlineCache';

type Listener = () => void;

// There's no push-based realtime over plain SQL/HTTP, so cross-device sync is
// polling-based: each store refetches on an interval, and local mutations are
// applied to the cache immediately (before the next poll) for instant feedback.
//
// When offlineCacheKey is set, the last-known-good snapshot is persisted to
// localStorage and used as a fallback whenever a fetch fails (offline, DNS
// hiccup, etc.) instead of leaving the app with nothing to show.
export function createPolledStore<T>(options: {
  fetchAll: () => Promise<T[]>;
  pollMs?: number;
  offlineCacheKey?: string;
}) {
  let cache: T[] = (options.offlineCacheKey && loadOfflineCache<T[]>(options.offlineCacheKey)) || [];
  let loaded = false;
  const listeners = new Set<Listener>();

  function notify() {
    listeners.forEach((listener) => listener());
  }

  async function refresh(): Promise<void> {
    try {
      cache = await options.fetchAll();
      if (options.offlineCacheKey) saveOfflineCache(options.offlineCacheKey, cache);
    } catch (error) {
      // Keep whatever `cache` already holds — seeded from offline storage,
      // a previous successful fetch, or an optimistic local mutation.
      console.warn('[turso] fetch failed, falling back to last known data', error);
    } finally {
      loaded = true;
      notify();
    }
  }

  if (options.pollMs) {
    setInterval(() => {
      refresh();
    }, options.pollMs);
  }

  return {
    async getAll(): Promise<T[]> {
      if (!loaded) await refresh();
      return cache;
    },
    getCache(): T[] {
      return cache;
    },
    setCache(next: T[]): void {
      cache = next;
      if (options.offlineCacheKey) saveOfflineCache(options.offlineCacheKey, next);
      notify();
    },
    refresh,
    subscribe(listener: Listener): () => void {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
