import { useCallback, useEffect, useState } from 'react';
import type { Song } from '../../types';
import { getSongsByArtist, subscribeSongs } from '../data/songs';

export function useSongs(artistId: string) {
  const [songs, setSongs] = useState<Song[]>([]);

  const refresh = useCallback(() => {
    getSongsByArtist(artistId).then(setSongs);
  }, [artistId]);

  useEffect(() => {
    refresh();
    return subscribeSongs(refresh);
  }, [refresh]);

  return songs;
}
