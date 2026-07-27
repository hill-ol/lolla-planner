import { Fragment, useMemo, useState } from 'react';
import { SegmentedControl } from '../../components/SegmentedControl/SegmentedControl';
import { SetCard } from '../../components/SetCard/SetCard';
import { WalkingBadge } from '../../components/WalkingBadge/WalkingBadge';
import { useArtistsByDay } from '../../lib/hooks/useArtistsByDay';
import { useStages } from '../../lib/hooks/useStages';
import { useSchedulePicks } from '../../lib/hooks/useSchedulePicks';
import { useNow } from '../../lib/hooks/useNow';
import { getTodayContext, isArtistLive } from '../../lib/today';
import { dayLabel, formatFestivalDate, timeToMinutes } from '../../lib/format';
import { FESTIVAL_DATES } from '../../lib/festival-dates';
import { getWalkingMinutes } from '../../lib/walking-times';
import './Today.css';

type Filter = 'mine' | 'all';

const FILTER_OPTIONS = [
  { value: 'mine' as Filter, label: 'My Picks' },
  { value: 'all' as Filter, label: 'All Artists' },
];

export function Today() {
  const now = useNow();
  const { phase, day } = useMemo(() => getTodayContext(now), [now]);
  const artists = useArtistsByDay(day);
  const stages = useStages();
  const { picks } = useSchedulePicks();
  const [filter, setFilter] = useState<Filter>('mine');

  const pickByArtistId = useMemo(() => new Map(picks.map((pick) => [pick.artistId, pick])), [picks]);
  const pickedArtistIds = useMemo(() => new Set(pickByArtistId.keys()), [pickByArtistId]);
  const stageById = useMemo(() => new Map(stages.map((stage) => [stage.id, stage])), [stages]);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const relevant = useMemo(() => {
    return artists
      .filter((artist) => filter === 'all' || pickedArtistIds.has(artist.id))
      .filter((artist) => phase !== 'live' || timeToMinutes(artist.endTime) > nowMinutes)
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  }, [artists, filter, pickedArtistIds, phase, nowMinutes]);

  const live = phase === 'live' ? relevant.filter((artist) => isArtistLive(artist, now)) : [];
  const upcoming = phase === 'live' ? relevant.filter((artist) => !isArtistLive(artist, now)) : relevant;

  return (
    <div className="page today-page">
      <header className="today-page__header">
        <h1>Today</h1>
        <p className="today-page__date">
          {dayLabel(day)} · {formatFestivalDate(FESTIVAL_DATES[day])}
        </p>
      </header>

      {phase !== 'live' && (
        <div className="today-page__banner">
          {phase === 'before'
            ? `Gates open ${dayLabel(day)} at noon — here's what's on deck.`
            : "That's a wrap. See you next year."}
        </div>
      )}

      <div className="today-page__toggle">
        <SegmentedControl options={FILTER_OPTIONS} value={filter} onChange={setFilter} aria-label="Filter artists" />
      </div>

      {live.length > 0 && (
        <section className="today-page__section">
          <h2 className="today-page__section-title">Live Now</h2>
          <div className="today-page__list">
            {live.map((artist) => (
              <SetCard
                key={artist.id}
                artist={artist}
                stage={stageById.get(artist.stageId)}
                isLive
                isPicked={pickedArtistIds.has(artist.id)}
                note={pickByArtistId.get(artist.id)?.note}
              />
            ))}
          </div>
        </section>
      )}

      <section className="today-page__section">
        <h2 className="today-page__section-title">{phase === 'live' ? 'Up Next' : 'Schedule'}</h2>
        {upcoming.length === 0 ? (
          <p className="today-page__empty">
            {filter === 'mine' ? 'No picks yet — head to the Lineup to add some.' : 'Nothing left today.'}
          </p>
        ) : (
          <div className="today-page__list">
            {upcoming.map((artist, index) => {
              const previous = upcoming[index - 1];
              const previousStage = previous && stageById.get(previous.stageId);
              const currentStage = stageById.get(artist.stageId);
              const showWalkingBadge =
                filter === 'mine' && previousStage && currentStage && previousStage.id !== currentStage.id;

              return (
                <Fragment key={artist.id}>
                  {showWalkingBadge && (
                    <WalkingBadge
                      minutes={getWalkingMinutes(previousStage!.id, currentStage!.id)}
                      label={`to ${currentStage!.name}`}
                    />
                  )}
                  <SetCard
                    artist={artist}
                    stage={currentStage}
                    isLive={false}
                    isPicked={pickedArtistIds.has(artist.id)}
                    note={pickByArtistId.get(artist.id)?.note}
                  />
                </Fragment>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
