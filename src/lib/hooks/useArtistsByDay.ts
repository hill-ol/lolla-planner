import { useEffect, useState } from 'react';
import type { Artist, FestivalDay } from '../../types';
import { getArtistsByDay } from '../data/artists';

export function useArtistsByDay(day: FestivalDay): Artist[] {
  const [artists, setArtists] = useState<Artist[]>([]);

  useEffect(() => {
    let cancelled = false;
    getArtistsByDay(day).then((result) => {
      if (!cancelled) setArtists(result);
    });
    return () => {
      cancelled = true;
    };
  }, [day]);

  return artists;
}
