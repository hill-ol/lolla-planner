import { turso } from '../turso/client';
import type { Artist, FestivalDay } from '../../types';

let cache: Artist[] | null = null;

function rowToArtist(row: Record<string, unknown>): Artist {
  return {
    id: row.id as string,
    name: row.name as string,
    day: row.day as FestivalDay,
    stageId: row.stageId as string,
    startTime: row.startTime as string,
    endTime: row.endTime as string,
  };
}

export async function getArtists(): Promise<Artist[]> {
  if (cache) return cache;
  const result = await turso.execute('SELECT * FROM artists');
  cache = result.rows.map(rowToArtist);
  return cache;
}

export async function getArtistsByDay(day: FestivalDay): Promise<Artist[]> {
  const artists = await getArtists();
  return artists.filter((artist) => artist.day === day);
}

export async function getArtistById(id: string): Promise<Artist | undefined> {
  const artists = await getArtists();
  return artists.find((artist) => artist.id === id);
}
