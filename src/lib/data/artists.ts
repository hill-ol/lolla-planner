import { turso } from '../turso/client';
import type { Artist, FestivalDay } from '../../types';
import { createCachedReader } from '../turso/createCachedReader';

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

export const getArtists = createCachedReader<Artist>({
  fetchAll: async () => {
    const result = await turso.execute('SELECT * FROM artists');
    return result.rows.map(rowToArtist);
  },
  offlineCacheKey: 'artists',
});

export async function getArtistsByDay(day: FestivalDay): Promise<Artist[]> {
  const artists = await getArtists();
  return artists.filter((artist) => artist.day === day);
}

export async function getArtistById(id: string): Promise<Artist | undefined> {
  const artists = await getArtists();
  return artists.find((artist) => artist.id === id);
}
