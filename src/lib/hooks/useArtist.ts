import { useEffect, useState } from 'react';
import type { Artist } from '../../types';
import { getArtistById } from '../data/artists';

interface LoadedArtist {
  artistId: string;
  artist: Artist | undefined;
}

export function useArtist(
  artistId: string | undefined
): Artist | undefined | null {
  const [loadedArtist, setLoadedArtist] = useState<LoadedArtist | null>(null);

  useEffect(() => {
    if (!artistId) {
      return;
    }
    
    let cancelled = false;
    
    getArtistById(artistId)
      .then((result) => {
      if (!cancelled) {
        setLoadedArtist({ artistId, artist });
      }
    })
    .catch((error: unknown) => {
      console.error('[artist] failed to load artist', error);

      if (!cancelled) {
        setLoadArtist({ artistId, artist: undefined });
      }
    });
    
    return () => {
      cancelled = true;
    };
  }, [artistId]);

  if (!artistId) return undefined;

  if (loadedArtist?.artistId !== artistId) return null;

  return loadedArtist.artist;
}
