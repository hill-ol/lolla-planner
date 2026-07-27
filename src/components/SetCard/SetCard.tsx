import { Link, useLocation } from 'react-router-dom';
import { Star } from 'lucide-react';
import type { Artist, Stage } from '../../types';
import { formatTime } from '../../lib/format';
import './SetCard.css';

interface SetCardProps {
  artist: Artist;
  stage?: Stage;
  isLive: boolean;
  isPicked: boolean;
  note?: string;
}

export function SetCard({ artist, stage, isLive, isPicked, note }: SetCardProps) {
  const location = useLocation();

  return (
    <Link
      to={`/artist/${artist.id}`}
      state={{ backgroundLocation: location }}
      className={`set-card${isLive ? ' set-card--live' : ''}`}
    >
      <div className="set-card__main">
        <span className="set-card__name">{artist.name}</span>
        <span className="set-card__meta">
          {stage && <span className="set-card__stage">{stage.name}</span>}
          <span className="set-card__time">
            {formatTime(artist.startTime)}–{formatTime(artist.endTime)}
          </span>
        </span>
        {note && <span className="set-card__note">{note}</span>}
      </div>
      <div className="set-card__badges">
        {isLive && (
          <span className="set-card__live-badge">
            <span className="set-card__live-dot" />
            Live
          </span>
        )}
        {isPicked && <Star className="set-card__star pop-in" size={16} fill="var(--lolla-coral)" strokeWidth={1.5} />}
      </div>
    </Link>
  );
}
