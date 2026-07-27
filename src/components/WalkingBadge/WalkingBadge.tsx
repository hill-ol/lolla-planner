import { Footprints } from 'lucide-react';
import './WalkingBadge.css';

interface WalkingBadgeProps {
  minutes: number;
  label: string;
}

export function WalkingBadge({ minutes, label }: WalkingBadgeProps) {
  return (
    <div className="walking-badge">
      <Footprints size={13} strokeWidth={2.25} />
      <span>
        ~{minutes} min walk {label}
      </span>
    </div>
  );
}
