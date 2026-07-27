import { loadOfflineCache, saveOfflineCache } from './offlineCache';

// For reference data that's fetched once and rarely changes (friends,
// stages, artists) — no polling, just an in-memory cache backed by a
// localStorage fallback for when the initial fetch fails offline.
export function createCachedReader<T>(options: { fetchAll: () => Promise<T[]>; offlineCacheKey: string }) {
  let cache: T[] | null = null;

  return async function getAll(): Promise<T[]> {
    if (cache) return cache;
    try {
      cache = await options.fetchAll();
      saveOfflineCache(options.offlineCacheKey, cache);
      return cache;
    } catch (error) {
      const fallback = loadOfflineCache<T[]>(options.offlineCacheKey);
      if (fallback) {
        console.warn('[turso] fetch failed, using last known data', error);
        cache = fallback;
        return cache;
      }
      throw error;
    }
  };
}
