import type { InValue } from '@libsql/client/web';
import { turso } from './client';

interface QueuedMutation {
  id: string;
  sql: string;
  args: InValue[];
  queuedAt: number;
}

const QUEUE_KEY = 'lolla-offline-cache:mutation-queue';

function loadQueue(): QueuedMutation[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as QueuedMutation[]) : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: QueuedMutation[]): void {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // Storage full/unavailable — the mutation already applied optimistically
    // in memory, it just won't survive a reload to retry later.
  }
}

type Listener = (pendingCount: number) => void;
const listeners = new Set<Listener>();

function notify(): void {
  const count = loadQueue().length;
  listeners.forEach((listener) => listener(count));
}

export function subscribePendingCount(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getPendingCount(): number {
  return loadQueue().length;
}

// libsql-client surfaces a network failure (offline, DNS, connection reset)
// as a TypeError or a message mentioning fetch/network — anything else (bad
// SQL, constraint violation) is a real error that should surface to the user
// rather than be silently queued forever.
function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) return true;
  const message = error instanceof Error ? error.message : String(error);
  return /network|fetch|offline/i.test(message);
}

export async function executeWrite(sql: string, args: InValue[] = []): Promise<void> {
  try {
    await turso.execute({ sql, args });
  } catch (error) {
    if (!isNetworkError(error)) throw error;
    const queue = loadQueue();
    queue.push({ id: `m-${crypto.randomUUID()}`, sql, args, queuedAt: Date.now() });
    saveQueue(queue);
    notify();
  }
}

export async function flushQueue(): Promise<void> {
  const queue = loadQueue();
  if (queue.length === 0) return;

  for (let i = 0; i < queue.length; i++) {
    const mutation = queue[i];
    try {
      await turso.execute({ sql: mutation.sql, args: mutation.args });
    } catch (error) {
      if (isNetworkError(error)) {
        // Still offline — keep this one and everything after it queued, in order.
        saveQueue(queue.slice(i));
        notify();
        return;
      }
      console.error('[turso] dropping queued mutation that failed for a non-network reason', mutation, error);
      // Not a connectivity issue (e.g. a constraint violation) — drop it and move on.
    }
  }

  saveQueue([]);
  notify();
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    flushQueue();
  });
}
