import stagesData from '../data/stages.json';
import type { Stage } from '../types';

const stages = stagesData as Stage[];

// Matches the actual map artwork's pixel dimensions (src/assets/map.webp) —
// kept in sync with Map.tsx's canvas size.
const MAP_WIDTH = 1080;
const MAP_HEIGHT = 1820;

// Michigan Ave to Lake Shore Dr spans roughly 70% of the map's width — the
// grounds don't run edge to edge (there's a black margin/logo strip on the
// west side, plus road shoulder on both sides).
const REFERENCE_MILES = 0.6;
const REFERENCE_WIDTH_FRACTION = 0.7;
const MILES_PER_PIXEL = REFERENCE_MILES / (MAP_WIDTH * REFERENCE_WIDTH_FRACTION);

// Festival-crowd pace is slower than a normal walking pace (~3 mph).
const FESTIVAL_WALK_SPEED_MPH = 2.3;

function distanceMiles(a: Stage, b: Stage): number {
  const dxPx = ((a.mapX - b.mapX) / 100) * MAP_WIDTH;
  const dyPx = ((a.mapY - b.mapY) / 100) * MAP_HEIGHT;
  return Math.sqrt(dxPx ** 2 + dyPx ** 2) * MILES_PER_PIXEL;
}

function minutesForDistance(miles: number): number {
  return Math.max(1, Math.round((miles / FESTIVAL_WALK_SPEED_MPH) * 60));
}

const WALKING_MINUTES: Record<string, Record<string, number>> = {};

for (const from of stages) {
  WALKING_MINUTES[from.id] = {};
  for (const to of stages) {
    WALKING_MINUTES[from.id][to.id] = from.id === to.id ? 0 : minutesForDistance(distanceMiles(from, to));
  }
}

export function getWalkingMinutes(fromStageId: string, toStageId: string): number {
  return WALKING_MINUTES[fromStageId]?.[toStageId] ?? 0;
}
