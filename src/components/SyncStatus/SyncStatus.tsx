import { CloudOff } from 'lucide-react';
import { usePendingSyncCount } from '../../lib/hooks/usePendingSyncCount';
import './SyncStatus.css';

export function SyncStatus() {
  const count = usePendingSyncCount();

  if (count === 0) return null;

  return (
    <div className="sync-status pop-in" role="status">
      <CloudOff size={13} strokeWidth={2.5} />
      {count} {count === 1 ? 'change' : 'changes'} waiting to sync
    </div>
  );
}
