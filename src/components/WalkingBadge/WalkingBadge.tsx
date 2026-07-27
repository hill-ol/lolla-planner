import { Footprints } from 'lucide-react';
import './WalkingBadge.css';

interface WalkingBadgeProps {
  min: number;
  max: number;
  label: string;
}

export function WalkingBadge({ min, max, label }: WalkingBadgeProps) {
  const time = min === max ? `~${min}` : `${min}–${max}`;

  return (
    <div className="walking-badge">
      <Footprints size={13} strokeWidth={2.25} />
      <span>
        {time} min walk {label}
      </span>
    </div>
  );
}
