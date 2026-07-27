import type { CSSProperties } from 'react';
import type { Friend } from '../../types';
import './AttributionTag.css';

interface AttributionTagProps {
  friend?: Friend;
}

export function AttributionTag({ friend }: AttributionTagProps) {
  if (!friend) return null;

  return (
    <span
      className="attribution-tag"
      style={{ '--chip-color': `var(--lolla-${friend.color ?? 'teal'})` } as CSSProperties}
    >
      <span className="attribution-tag__dot" />
      added by {friend.name}
    </span>
  );
}
