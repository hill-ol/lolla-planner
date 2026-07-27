type Listener = () => void;

// There's no push-based realtime over plain SQL/HTTP, so cross-device sync is
// polling-based: each store refetches on an interval, and local mutations are
// applied to the cache immediately (before the next poll) for instant feedback.
export function createPolledStore<T>(options: { fetchAll: () => Promise<T[]>; pollMs?: number }) {
  let cache: T[] = [];
  let loaded = false;
  const listeners = new Set<Listener>();

  function notify() {
    listeners.forEach((listener) => listener());
  }

  async function refresh(): Promise<void> {
    const next = await options.fetchAll();
    cache = next;
    loaded = true;
    notify();
  }

  if (options.pollMs) {
    setInterval(() => {
      refresh().catch((error) => console.error('[turso] poll refresh failed', error));
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
      notify();
    },
    refresh,
    subscribe(listener: Listener): () => void {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
