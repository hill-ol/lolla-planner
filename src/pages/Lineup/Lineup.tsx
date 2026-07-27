import { useMemo } from 'react';
import { SegmentedControl } from '../../components/SegmentedControl/SegmentedControl';
import { ScheduleGrid } from '../../components/ScheduleGrid/ScheduleGrid';
import { useAppStore } from '../../store/useAppStore';
import { useStages } from '../../lib/hooks/useStages';
import { useArtistsByDay } from '../../lib/hooks/useArtistsByDay';
import { useSchedulePicks } from '../../lib/hooks/useSchedulePicks';
import { FESTIVAL_DAYS } from '../../lib/festival-dates';
import type { FestivalDay } from '../../types';
import './Lineup.css';

const DAY_OPTIONS = FESTIVAL_DAYS.map((day) => ({ value: day, label: day.slice(0, 3) }));

export function Lineup() {
  const currentDay = useAppStore((state) => state.currentDay);
  const setCurrentDay = useAppStore((state) => state.setCurrentDay);
  const stages = useStages();
  const artists = useArtistsByDay(currentDay);
  const { picks } = useSchedulePicks();

  const pickedArtistIds = useMemo(() => new Set(picks.map((pick) => pick.artistId)), [picks]);

  return (
    <div className="page lineup-page">
      <h1>Lineup</h1>
      <div className="lineup-page__tabs">
        <SegmentedControl
          options={DAY_OPTIONS}
          value={currentDay}
          onChange={(day: FestivalDay) => setCurrentDay(day)}
          aria-label="Festival day"
        />
      </div>
      <ScheduleGrid stages={stages} artists={artists} pickedArtistIds={pickedArtistIds} />
    </div>
  );
}
