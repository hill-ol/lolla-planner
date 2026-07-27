export type AmenityType = 'restroom' | 'water' | 'medical' | 'food';

export interface AmenityMarker {
  id: string;
  type: AmenityType;
  mapX: number;
  mapY: number;
}

// A deliberately minimal subset of the official map's amenity icons —
// not a full legend, just enough to be useful.
export const AMENITIES: AmenityMarker[] = [
  { id: 'a1', type: 'restroom', mapX: 34, mapY: 56 },
  { id: 'a2', type: 'water', mapX: 58, mapY: 51 },
  { id: 'a3', type: 'medical', mapX: 32, mapY: 49 },
  { id: 'a4', type: 'food', mapX: 15, mapY: 91 },
  { id: 'a5', type: 'restroom', mapX: 78, mapY: 33 },
  { id: 'a6', type: 'water', mapX: 46, mapY: 68 },
];
