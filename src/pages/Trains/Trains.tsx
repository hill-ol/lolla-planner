import { useMemo, useState } from 'react';
import { SegmentedControl } from '../../components/SegmentedControl/SegmentedControl';
import { FriendPicker } from '../../components/FriendPicker/FriendPicker';
import { GoalTrainCard } from '../../components/GoalTrainCard/GoalTrainCard';
import { TrainList } from '../../components/TrainList/TrainList';
import { useAppStore } from '../../store/useAppStore';
import { useArtistsByDay } from '../../lib/hooks/useArtistsByDay';
import { useSchedulePicks } from '../../lib/hooks/useSchedulePicks';
import { useFriends } from '../../lib/hooks/useFriends';
import { useTrainTrips } from '../../lib/hooks/useTrainTrips';
import { useGoalTrainOverride } from '../../lib/hooks/useGoalTrainOverride';
import { computeGoalTrain } from '../../lib/goal-train';
import { setOverride, clearOverride } from '../../lib/data/goalTrainOverrides';
import { FESTIVAL_DAYS } from '../../lib/festival-dates';
import type { TrainTrip } from '../../lib/data/trains';
import type { FestivalDay, GoalTrainDirection } from '../../types';
import './Trains.css';

const DAY_OPTIONS = FESTIVAL_DAYS.map((day) => ({ value: day, label: day.slice(0, 3) }));

export function Trains() {
  const currentDay = useAppStore((state) => state.currentDay);
  const setCurrentDay = useAppStore((state) => state.setCurrentDay);
  const activeFriendId = useAppStore((state) => state.activeFriendId);
  const setActiveFriendId = useAppStore((state) => state.setActiveFriendId);
  const friends = useFriends();
  const artists = useArtistsByDay(currentDay);
  const { picks } = useSchedulePicks();

  const [editingDirection, setEditingDirection] = useState<GoalTrainDirection | null>(null);

  const pickedArtistIds = useMemo(() => new Set(picks.map((pick) => pick.artistId)), [picks]);
  const pickedArtists = useMemo(
    () => artists.filter((artist) => pickedArtistIds.has(artist.id)),
    [artists, pickedArtistIds],
  );
  const friendById = useMemo(() => new Map(friends.map((friend) => [friend.id, friend])), [friends]);

  const outboundTrips = useTrainTrips(currentDay, 'outbound');
  const returnTrips = useTrainTrips(currentDay, 'return');
  const outboundOverride = useGoalTrainOverride(currentDay, 'outbound');
  const returnOverride = useGoalTrainOverride(currentDay, 'return');

  const outboundGoal = useMemo(
    () => computeGoalTrain('outbound', pickedArtists, outboundTrips),
    [pickedArtists, outboundTrips],
  );
  const returnGoal = useMemo(
    () => computeGoalTrain('return', pickedArtists, returnTrips),
    [pickedArtists, returnTrips],
  );

  const outboundTrip: TrainTrip | null =
    (outboundOverride && outboundTrips.find((trip) => trip.tripId === outboundOverride.tripId)) ??
    outboundGoal.trip;
  const returnTrip: TrainTrip | null =
    (returnOverride && returnTrips.find((trip) => trip.tripId === returnOverride.tripId)) ?? returnGoal.trip;

  async function selectTrip(direction: GoalTrainDirection, trip: TrainTrip) {
    if (!activeFriendId) return;
    await setOverride({ day: currentDay, direction, tripId: trip.tripId, addedBy: activeFriendId });
    setEditingDirection(null);
  }

  async function resetTrip(direction: GoalTrainDirection) {
    await clearOverride(currentDay, direction);
  }

  return (
    <div className="page trains-page">
      <h1>Trains</h1>

      <div className="trains-page__tabs">
        <SegmentedControl
          options={DAY_OPTIONS}
          value={currentDay}
          onChange={(day: FestivalDay) => setCurrentDay(day)}
          aria-label="Festival day"
        />
      </div>

      <FriendPicker friends={friends} value={activeFriendId} onChange={setActiveFriendId} label="Adding as" />

      <div className="trains-page__cards">
        <GoalTrainCard
          title="Outbound"
          subtitle="LaGrange → Union Station"
          trip={outboundTrip}
          isOverridden={!!outboundOverride}
          overrideFriend={outboundOverride ? friendById.get(outboundOverride.addedBy) : undefined}
          emptyMessage={
            outboundGoal.reason === 'no-picks'
              ? 'Add a schedule pick to see a suggested train.'
              : 'No train found before your first pick.'
          }
          isEditing={editingDirection === 'outbound'}
          onToggleEdit={() => setEditingDirection((current) => (current === 'outbound' ? null : 'outbound'))}
          onResetOverride={() => resetTrip('outbound')}
        />
        {editingDirection === 'outbound' && (
          <TrainList
            trips={outboundTrips}
            selectedTripId={outboundTrip?.tripId}
            disabled={!activeFriendId}
            onSelect={(trip) => selectTrip('outbound', trip)}
          />
        )}

        <GoalTrainCard
          title="Return"
          subtitle="Union Station → LaGrange"
          trip={returnTrip}
          isOverridden={!!returnOverride}
          overrideFriend={returnOverride ? friendById.get(returnOverride.addedBy) : undefined}
          emptyMessage={
            returnGoal.reason === 'no-picks'
              ? 'Add a schedule pick to see a suggested train.'
              : 'No train found after your last pick.'
          }
          isEditing={editingDirection === 'return'}
          onToggleEdit={() => setEditingDirection((current) => (current === 'return' ? null : 'return'))}
          onResetOverride={() => resetTrip('return')}
        />
        {editingDirection === 'return' && (
          <TrainList
            trips={returnTrips}
            selectedTripId={returnTrip?.tripId}
            disabled={!activeFriendId}
            onSelect={(trip) => selectTrip('return', trip)}
          />
        )}
      </div>
    </div>
  );
}
