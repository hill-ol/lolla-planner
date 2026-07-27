import type { CSSProperties } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Star } from 'lucide-react';
import type { Artist, Stage } from '../../types';
import { formatTime, timeToMinutes } from '../../lib/format';
import {
  DAY_START_MINUTES,
  HEADER_HEIGHT,
  PX_PER_MINUTE,
  STAGE_COLUMN_WIDTH,
  TIME_AXIS_WIDTH,
  TOTAL_TIME_HEIGHT,
  minutesToY,
} from './scheduleLayout';
import './ScheduleGrid.css';

interface ScheduleGridProps {
  stages: Stage[];
  artists: Artist[];
  pickedArtistIds: Set<string>;
}

const HOUR_LABELS = Array.from({ length: 11 }, (_, i) => DAY_START_MINUTES + i * 60);

export function ScheduleGrid({ stages, artists, pickedArtistIds }: ScheduleGridProps) {
  const location = useLocation();

  return (
    <div className="schedule-grid">
      <div
        className="schedule-grid__grid"
        style={
          {
            '--axis-w': `${TIME_AXIS_WIDTH}px`,
            '--col-w': `${STAGE_COLUMN_WIDTH}px`,
            '--header-h': `${HEADER_HEIGHT}px`,
            '--stage-count': stages.length,
          } as CSSProperties
        }
      >
        <div className="schedule-grid__corner" />
        {stages.map((stage) => (
          <div key={stage.id} className="schedule-grid__stage-header">
            {stage.name}
          </div>
        ))}

        <div className="schedule-grid__time-axis" style={{ height: TOTAL_TIME_HEIGHT }}>
          {HOUR_LABELS.map((minutes) => (
            <span
              key={minutes}
              className="schedule-grid__hour-label"
              style={{ top: minutesToY(minutes) }}
            >
              {formatTime(`${Math.floor(minutes / 60)}:00`)}
            </span>
          ))}
        </div>

        {stages.map((stage) => {
          const stageArtists = artists
            .filter((artist) => artist.stageId === stage.id)
            .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

          return (
            <div
              key={stage.id}
              className="schedule-grid__column"
              style={{
                height: TOTAL_TIME_HEIGHT,
                backgroundImage: `repeating-linear-gradient(to bottom, rgba(17,17,17,0.12) 0, rgba(17,17,17,0.12) 1px, transparent 1px, transparent ${60 * PX_PER_MINUTE}px)`,
              }}
            >
              {stageArtists.map((artist, index) => {
                const top = minutesToY(timeToMinutes(artist.startTime));
                const height = Math.max(
                  (timeToMinutes(artist.endTime) - timeToMinutes(artist.startTime)) * PX_PER_MINUTE,
                  28,
                );
                const isPicked = pickedArtistIds.has(artist.id);

                return (
                  <Link
                    key={artist.id}
                    to={`/artist/${artist.id}`}
                    state={{ backgroundLocation: location }}
                    className={`schedule-grid__block schedule-grid__block--${index % 2 === 0 ? 'lime' : 'teal'}${isPicked ? ' schedule-grid__block--picked' : ''}`}
                    style={{ top, height }}
                  >
                    {isPicked && (
                      <Star className="schedule-grid__pick-star pop-in" size={13} fill="var(--lolla-coral)" strokeWidth={1.5} />
                    )}
                    <span className="schedule-grid__block-name">{artist.name}</span>
                    <span className="schedule-grid__block-time">
                      {formatTime(artist.startTime)}–{formatTime(artist.endTime)}
                    </span>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
