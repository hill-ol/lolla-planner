import { turso } from '../turso/client';
import type { Friend } from '../../types';
import { createCachedReader } from '../turso/createCachedReader';

function rowToFriend(row: Record<string, unknown>): Friend {
  return {
    id: row.id as string,
    name: row.name as string,
    color: (row.color as string | null) ?? undefined,
  };
}

export const getFriends = createCachedReader<Friend>({
  fetchAll: async () => {
    const result = await turso.execute('SELECT * FROM friends');
    return result.rows.map(rowToFriend);
  },
  offlineCacheKey: 'friends',
});

export async function getFriendById(id: string): Promise<Friend | undefined> {
  const friends = await getFriends();
  return friends.find((friend) => friend.id === id);
}
