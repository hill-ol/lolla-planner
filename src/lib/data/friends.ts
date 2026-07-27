import { turso } from '../turso/client';
import type { Friend } from '../../types';

let cache: Friend[] | null = null;

function rowToFriend(row: Record<string, unknown>): Friend {
  return {
    id: row.id as string,
    name: row.name as string,
    color: (row.color as string | null) ?? undefined,
  };
}

export async function getFriends(): Promise<Friend[]> {
  if (cache) return cache;
  const result = await turso.execute('SELECT * FROM friends');
  cache = result.rows.map(rowToFriend);
  return cache;
}

export async function getFriendById(id: string): Promise<Friend | undefined> {
  const friends = await getFriends();
  return friends.find((friend) => friend.id === id);
}
