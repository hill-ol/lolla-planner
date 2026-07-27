import { Star } from 'lucide-react';
import type { Stage } from '../../types';
import './StageMarker.css';

interface StageMarkerProps {
  stage: Stage;
  isActive: boolean;
  isSelected: boolean;
  onClick: () => void;
}

export function StageMarker({ stage, isActive, isSelected, onClick }: StageMarkerProps) {
  return (
    <button
      type="button"
      className={`stage-marker${isActive ? ' stage-marker--active' : ''}${isSelected ? ' stage-marker--selected' : ''}`}
      style={{ left: `${stage.mapX}%`, top: `${stage.mapY}%` }}
      onClick={onClick}
    >
      {isActive ? (
        <Star size={16} fill="var(--lolla-white)" strokeWidth={2} />
      ) : (
        <span className="stage-marker__dot" />
      )}
      <span className="stage-marker__label">{stage.name}</span>
    </button>
  );
}
