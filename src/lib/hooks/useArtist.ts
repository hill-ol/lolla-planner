import { useEffect, useState } from 'react';
import type { Artist } from '../../types';
import { getArtistById } from '../data/artists';

export function useArtist(artistId: string | undefined): Artist | undefined | null {
  const [artist, setArtist] = useState<Artist | undefined | null>(null);

  useEffect(() => {
    if (!artistId) {
      setArtist(undefined);
      return;
    }
    let cancelled = false;
    setArtist(null);
    getArtistById(artistId).then((result) => {
      if (!cancelled) setArtist(result);
    });
    return () => {
      cancelled = true;
    };
  }, [artistId]);

  return artist;
}
