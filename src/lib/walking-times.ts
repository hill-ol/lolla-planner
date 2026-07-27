import stagesData from '../data/stages.json';
import type { Stage } from '../types';

const stages = stagesData as Stage[];
const stageById = new Map(stages.map((stage) => [stage.id, stage]));

export interface WalkingRange {
  min: number;
  max: number;
}

// Real-world walking-time estimates between the 7 main stages, measured on
// the ground rather than derived from map coordinates. Kidzapalooza isn't
// covered by these yet, so it falls back to the coordinate-based estimate
// further down.
const KNOWN_WALKING_TIMES: Record<string, Record<string, WalkingRange>> = {
  tmobile: {
    perrys: { min: 3, max: 5 },
    allianz: { min: 4, max: 6 },
    bmi: { min: 6, max: 8 },
    airbnb: { min: 8, max: 10 },
    titos: { min: 10, max: 12 },
    budlight: { min: 15, max: 20 },
  },
  perrys: {
    allianz: { min: 3, max: 5 },
    bmi: { min: 5, max: 7 },
    airbnb: { min: 7, max: 9 },
    titos: { min: 9, max: 11 },
    budlight: { min: 13, max: 17 },
  },
  allianz: {
    bmi: { min: 2, max: 4 },
    airbnb: { min: 4, max: 6 },
    titos: { min: 6, max: 8 },
    budlight: { min: 11, max: 15 },
  },
  bmi: {
    airbnb: { min: 2, max: 4 },
    titos: { min: 4, max: 6 },
    budlight: { min: 8, max: 12 },
  },
  airbnb: {
    titos: { min: 2, max: 4 },
    budlight: { min: 6, max: 9 },
  },
  titos: {
    budlight: { min: 4, max: 6 },
  },
};

function lookupKnown(fromStageId: string, toStageId: string): WalkingRange | undefined {
  return KNOWN_WALKING_TIMES[fromStageId]?.[toStageId] ?? KNOWN_WALKING_TIMES[toStageId]?.[fromStageId];
}

// --- Fallback for any pair not covered above (currently just Kidzapalooza,
// added after the 7-stage measurements above were taken).
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

function estimateMinutes(a: Stage, b: Stage): number {
  const miles = distanceMiles(a, b);
  return Math.max(1, Math.round((miles / FESTIVAL_WALK_SPEED_MPH) * 60));
}

export function getWalkingRange(fromStageId: string, toStageId: string): WalkingRange {
  if (fromStageId === toStageId) return { min: 0, max: 0 };

  const known = lookupKnown(fromStageId, toStageId);
  if (known) return known;

  const from = stageById.get(fromStageId);
  const to = stageById.get(toStageId);
  if (!from || !to) return { min: 0, max: 0 };

  const estimate = estimateMinutes(from, to);
  return { min: estimate, max: estimate };
}

export function getWalkingMinutes(fromStageId: string, toStageId: string): number {
  const { min, max } = getWalkingRange(fromStageId, toStageId);
  return Math.round((min + max) / 2);
}
