import { Cross, Droplet, Sandwich, Toilet } from 'lucide-react';
import type { AmenityMarker as AmenityMarkerData } from '../../lib/amenities';
import './AmenityMarker.css';

const ICONS = {
  restroom: Toilet,
  water: Droplet,
  medical: Cross,
  food: Sandwich,
};

export function AmenityMarker({ marker, index = 0 }: { marker: AmenityMarkerData; index?: number }) {
  const Icon = ICONS[marker.type];

  return (
    <div
      className="amenity-marker"
      aria-hidden="true"
      style={{ left: `${marker.mapX}%`, top: `${marker.mapY}%`, animationDelay: `${index * 35}ms` }}
    >
      <Icon size={12} strokeWidth={2.5} />
    </div>
  );
}
