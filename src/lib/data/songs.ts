import { turso } from '../turso/client';
import type { Song } from '../../types';
import { createPolledStore } from '../turso/createPolledStore';

function rowToSong(row: Record<string, unknown>): Song {
  return {
    id: row.id as string,
    artistId: row.artistId as string,
    title: row.title as string,
    addedBy: row.addedBy as string,
    source: row.source as Song['source'],
  };
}

async function fetchAllSongs(): Promise<Song[]> {
  const result = await turso.execute('SELECT * FROM songs');
  return result.rows.map(rowToSong);
}

const store = createPolledStore<Song>({ fetchAll: fetchAllSongs, pollMs: 5000 });

export const subscribeSongs = store.subscribe;

export async function getSongsByArtist(artistId: string): Promise<Song[]> {
  const all = await store.getAll();
  return all.filter((song) => song.artistId === artistId);
}

export async function addSong(input: Omit<Song, 'id'>): Promise<Song> {
  const song: Song = { ...input, id: `sg-${crypto.randomUUID()}` };
  await turso.execute({
    sql: 'INSERT INTO songs (id, artistId, title, addedBy, source) VALUES (?, ?, ?, ?, ?)',
    args: [song.id, song.artistId, song.title, song.addedBy, song.source],
  });
  store.setCache([...store.getCache(), song]);
  return song;
}

export async function removeSong(id: string): Promise<void> {
  await turso.execute({ sql: 'DELETE FROM songs WHERE id = ?', args: [id] });
  store.setCache(store.getCache().filter((song) => song.id !== id));
}
