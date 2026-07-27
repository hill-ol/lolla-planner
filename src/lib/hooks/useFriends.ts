import { useEffect, useState } from 'react';
import type { Friend } from '../../types';
import { getFriends } from '../data/friends';

export function useFriends(): Friend[] {
  const [friends, setFriends] = useState<Friend[]>([]);

  useEffect(() => {
    let cancelled = false;
    getFriends().then((result) => {
      if (!cancelled) setFriends(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return friends;
}
