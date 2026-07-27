import { ArrowLeftRight, Pencil, RotateCcw, Star } from 'lucide-react';
import type { Friend } from '../../types';
import type { TrainTrip } from '../../lib/data/trains';
import { formatTime } from '../../lib/format';
import './GoalTrainCard.css';

interface GoalTrainCardProps {
  title: string;
  subtitle: string;
  trip: TrainTrip | null;
  isOverridden: boolean;
  overrideFriend?: Friend;
  emptyMessage: string;
  isEditing: boolean;
  onToggleEdit: () => void;
  onResetOverride: () => void;
}

export function GoalTrainCard({
  title,
  subtitle,
  trip,
  isOverridden,
  overrideFriend,
  emptyMessage,
  isEditing,
  onToggleEdit,
  onResetOverride,
}: GoalTrainCardProps) {
  return (
    <div className={`goal-train-card${isEditing ? ' goal-train-card--editing' : ''}`}>
      <div className="goal-train-card__top">
        <div className="goal-train-card__heading">
          <ArrowLeftRight size={14} strokeWidth={2.5} />
          <span>{title}</span>
        </div>
        {trip && (
          <button type="button" className="goal-train-card__edit" onClick={onToggleEdit} aria-label={`Edit ${title} train`}>
            <Pencil size={14} strokeWidth={2.25} />
          </button>
        )}
      </div>

      {trip ? (
        <>
          <div className="goal-train-card__trip">
            {!isOverridden && <Star size={16} fill="var(--lolla-coral)" strokeWidth={1.5} />}
            <span className="goal-train-card__time">
              {formatTime(trip.departureTime)} → {formatTime(trip.arrivalTime)}
            </span>
          </div>
          <p className="goal-train-card__subtitle">{subtitle}</p>
          {isOverridden && overrideFriend ? (
            <div className="goal-train-card__override-row">
              <span className="goal-train-card__manual-tag">
                manually set by {overrideFriend.name}
              </span>
              <button type="button" className="goal-train-card__reset" onClick={onResetOverride}>
                <RotateCcw size={12} strokeWidth={2.5} />
                Reset to suggested
              </button>
            </div>
          ) : (
            <span className="goal-train-card__suggested-tag">suggested goal train</span>
          )}
        </>
      ) : (
        <p className="goal-train-card__empty">{emptyMessage}</p>
      )}
    </div>
  );
}
