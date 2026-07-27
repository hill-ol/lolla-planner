import { useEffect, useState } from 'react';
import { getPendingCount, subscribePendingCount } from '../turso/mutationQueue';

export function usePendingSyncCount(): number {
  const [count, setCount] = useState(getPendingCount);

  useEffect(() => subscribePendingCount(setCount), []);

  return count;
}
