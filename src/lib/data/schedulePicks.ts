import { turso } from '../turso/client';
import type { SchedulePick } from '../../types';
import { createPolledStore } from '../turso/createPolledStore';

function rowToSchedulePick(row: Record<string, unknown>): SchedulePick {
  return {
    id: row.id as string,
    artistId: row.artistId as string,
    addedBy: row.addedBy as string,
    note: (row.note as string | null) ?? undefined,
  };
}

async function fetchAllSchedulePicks(): Promise<SchedulePick[]> {
  const result = await turso.execute('SELECT * FROM schedule_picks');
  return result.rows.map(rowToSchedulePick);
}

const store = createPolledStore<SchedulePick>({ fetchAll: fetchAllSchedulePicks, pollMs: 5000 });

export const subscribeSchedulePicks = store.subscribe;

export async function getSchedulePicks(): Promise<SchedulePick[]> {
  return store.getAll();
}

export async function getSchedulePickForArtist(artistId: string): Promise<SchedulePick | undefined> {
  const all = await store.getAll();
  return all.find((pick) => pick.artistId === artistId);
}

export async function addSchedulePick(input: Omit<SchedulePick, 'id'>): Promise<SchedulePick> {
  const pick: SchedulePick = { ...input, id: `sp-${crypto.randomUUID()}` };
  await turso.execute({
    sql: 'INSERT INTO schedule_picks (id, artistId, addedBy, note) VALUES (?, ?, ?, ?)',
    args: [pick.id, pick.artistId, pick.addedBy, pick.note ?? null],
  });
  store.setCache([...store.getCache(), pick]);
  return pick;
}

export async function removeSchedulePick(id: string): Promise<void> {
  await turso.execute({ sql: 'DELETE FROM schedule_picks WHERE id = ?', args: [id] });
  store.setCache(store.getCache().filter((pick) => pick.id !== id));
}

export async function removeSchedulePickForArtist(artistId: string): Promise<void> {
  await turso.execute({ sql: 'DELETE FROM schedule_picks WHERE artistId = ?', args: [artistId] });
  store.setCache(store.getCache().filter((pick) => pick.artistId !== artistId));
}

export async function updateSchedulePickNote(id: string, note: string): Promise<SchedulePick | undefined> {
  const trimmed = note.trim() || null;
  await turso.execute({ sql: 'UPDATE schedule_picks SET note = ? WHERE id = ?', args: [trimmed, id] });
  const next = store.getCache().map((pick) => (pick.id === id ? { ...pick, note: trimmed ?? undefined } : pick));
  store.setCache(next);
  return next.find((pick) => pick.id === id);
}
