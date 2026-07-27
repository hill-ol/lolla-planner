import { X } from 'lucide-react';
import type { Artist, SchedulePick, Stage } from '../../types';
import { Sheet } from '../Sheet/Sheet';
import { SetCard } from '../SetCard/SetCard';
import { WalkingBadge } from '../WalkingBadge/WalkingBadge';
import { isArtistLive } from '../../lib/today';
import { timeToMinutes } from '../../lib/format';
import './StageBottomSheet.css';

interface StageBottomSheetProps {
  stage: Stage;
  artists: Artist[];
  now: Date;
  pickByArtistId: Map<string, SchedulePick>;
  walkFromLastPick?: { minutes: number; label: string };
  onClose: () => void;
}

export function StageBottomSheet({
  stage,
  artists,
  now,
  pickByArtistId,
  walkFromLastPick,
  onClose,
}: StageBottomSheetProps) {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const relevant = artists
    .filter((artist) => timeToMinutes(artist.endTime) > nowMinutes)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  return (
    <Sheet onClose={onClose} className="stage-sheet">
      {(requestClose) => (
        <>
          <button type="button" className="stage-sheet__close" onClick={requestClose} aria-label="Close">
            <X size={18} strokeWidth={2.5} />
          </button>
          <h2 className="stage-sheet__title">{stage.name}</h2>
          {walkFromLastPick && <WalkingBadge minutes={walkFromLastPick.minutes} label={walkFromLastPick.label} />}

          {relevant.length === 0 ? (
            <p className="stage-sheet__empty">Nothing left on this stage today.</p>
          ) : (
            <div className="stage-sheet__list">
              {relevant.slice(0, 4).map((artist) => (
                <SetCard
                  key={artist.id}
                  artist={artist}
                  isLive={isArtistLive(artist, now)}
                  isPicked={pickByArtistId.has(artist.id)}
                  note={pickByArtistId.get(artist.id)?.note}
                />
              ))}
            </div>
          )}
        </>
      )}
    </Sheet>
  );
}
