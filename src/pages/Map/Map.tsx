import { useMemo, useState } from 'react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import { Layers } from 'lucide-react';
import { StageMarker } from '../../components/StageMarker/StageMarker';
import { AmenityMarker } from '../../components/AmenityMarker/AmenityMarker';
import { StageBottomSheet } from '../../components/StageBottomSheet/StageBottomSheet';
import { useStages } from '../../lib/hooks/useStages';
import { useArtistsByDay } from '../../lib/hooks/useArtistsByDay';
import { useSchedulePicks } from '../../lib/hooks/useSchedulePicks';
import { useNow } from '../../lib/hooks/useNow';
import { getTodayContext } from '../../lib/today';
import { AMENITIES } from '../../lib/amenities';
import { timeToMinutes } from '../../lib/format';
import { getWalkingMinutes } from '../../lib/walking-times';
import type { Stage } from '../../types';
import mapImage from '../../assets/map.webp';
import './Map.css';

const MAP_WIDTH = 1080;
const MAP_HEIGHT = 1820;

export function MapPage() {
  const stages = useStages();
  const now = useNow();
  const { day } = useMemo(() => getTodayContext(now), [now]);
  const artists = useArtistsByDay(day);
  const { picks } = useSchedulePicks();
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [showAmenities, setShowAmenities] = useState(false);

  const pickByArtistId = useMemo(() => new Map(picks.map((pick) => [pick.artistId, pick])), [picks]);
  const stageHasPick = (stageId: string) =>
    artists.some((artist) => artist.stageId === stageId && pickByArtistId.has(artist.id));

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const lastPickArtist = artists
    .filter((artist) => pickByArtistId.has(artist.id) && timeToMinutes(artist.startTime) <= nowMinutes)
    .sort((a, b) => timeToMinutes(b.startTime) - timeToMinutes(a.startTime))[0];

  const walkFromLastPick =
    selectedStage && lastPickArtist && lastPickArtist.stageId !== selectedStage.id
      ? {
          minutes: getWalkingMinutes(lastPickArtist.stageId, selectedStage.id),
          label: `from ${lastPickArtist.name}`,
        }
      : undefined;

  return (
    <div className="map-page">
      <div className="map-page__toolbar">
        <h1>Map</h1>
        <button
          type="button"
          className={`map-page__amenities-toggle${showAmenities ? ' map-page__amenities-toggle--active' : ''}`}
          onClick={() => setShowAmenities((visible) => !visible)}
          aria-pressed={showAmenities}
        >
          <Layers size={15} strokeWidth={2.25} />
          Amenities
        </button>
      </div>

      <TransformWrapper minScale={0.3} initialScale={0.36} maxScale={3} centerOnInit centerZoomedOut>
        <TransformComponent wrapperClass="map-page__wrapper" contentClass="map-page__content">
          <div className="map-page__canvas" style={{ width: MAP_WIDTH, height: MAP_HEIGHT }}>
            <img className="map-page__image" src={mapImage} alt="Lollapalooza 2026 festival map" draggable={false} />

            {showAmenities &&
              AMENITIES.map((marker, index) => <AmenityMarker key={marker.id} marker={marker} index={index} />)}

            {stages.map((stage) => (
              <StageMarker
                key={stage.id}
                stage={stage}
                isActive={stageHasPick(stage.id)}
                isSelected={selectedStage?.id === stage.id}
                onClick={() => setSelectedStage(stage)}
              />
            ))}
          </div>
        </TransformComponent>
      </TransformWrapper>

      {selectedStage && (
        <StageBottomSheet
          stage={selectedStage}
          artists={artists.filter((artist) => artist.stageId === selectedStage.id)}
          now={now}
          pickByArtistId={pickByArtistId}
          walkFromLastPick={walkFromLastPick}
          onClose={() => setSelectedStage(null)}
        />
      )}
    </div>
  );
}
