import type { TrainTrip } from '../../lib/data/trains';
import { formatTime } from '../../lib/format';
import './TrainList.css';

interface TrainListProps {
  trips: TrainTrip[];
  selectedTripId?: string;
  disabled?: boolean;
  onSelect: (trip: TrainTrip) => void;
}

export function TrainList({ trips, selectedTripId, disabled, onSelect }: TrainListProps) {
  return (
    <div className="train-list">
      {trips.map((trip) => (
        <button
          key={trip.tripId}
          type="button"
          disabled={disabled}
          className={`train-list__row${trip.tripId === selectedTripId ? ' train-list__row--selected' : ''}`}
          onClick={() => onSelect(trip)}
        >
          {formatTime(trip.departureTime)}
          <span className="train-list__arrow">→</span>
          {formatTime(trip.arrivalTime)}
        </button>
      ))}
    </div>
  );
}
