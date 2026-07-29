import stagesData from '../../data/stages.json';
import type { Stage } from '../../types';
import { createCachedReader } from '../turso/createCachedReader';
import { loadOfflineCache } from '../turso/offlineCache';

const OFFLINE_CACHE_KEY = 'stages';

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
}

function requireString(
  value: Record<string, unknown>,
  property: string,
): string {
  const propertyValue = value[property];

  if (
    typeof propertyValue !== 'string' ||
    propertyValue.length === 0
  ) {
    throw new Error(
      `Invalid stage property: ${property}`,
    );
  }

  return propertyValue;
}

function requireMapCoordinate(
  value: Record<string, unknown>,
  property: string,
): number {
  const coordinate = value[property];

  if (
    typeof coordinate !== 'number' ||
    !Number.isFinite(coordinate) ||
    coordinate < 0 ||
    coordinate > 100
  ) {
    throw new Error(
      `Invalid stage coordinate: ${property}`,
    );
  }

  return coordinate;
}

function parseStage(value: unknown): Stage {
  if (!isRecord(value)) {
    throw new Error('Invalid stage record.');
  }

  return {
    id: requireString(value, 'id'),
    name: requireString(value, 'name'),
    mapX: requireMapCoordinate(value, 'mapX'),
    mapY: requireMapCoordinate(value, 'mapY'),
  };
}

function parseStages(value: unknown): Stage[] {
  if (!Array.isArray(value)) {
    throw new Error('Stages must be an array.');
  }

  return value.map(parseStage);
}

// This baseline is bundled into the PWA, making stage locations available
// on the first offline launch after the application shell is installed.
const bundledStages = parseStages(stagesData);

async function fetchStagesFromApi(): Promise<Stage[]> {
  const response = await fetch('/api/stages', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    credentials: 'same-origin',
  });

  if (!response.ok) {
    throw new Error(
      `Stages request failed with status ${response.status}.`,
    );
  }

  const payload: unknown = await response.json();

  if (!isRecord(payload)) {
    throw new Error('Invalid stages API response.');
  }

  return parseStages(payload.data);
}

async function fetchStagesWithFallback(): Promise<Stage[]> {
  try {
    return await fetchStagesFromApi();
  } catch {
    const offlineStages =
      loadOfflineCache<unknown>(OFFLINE_CACHE_KEY);

    if (offlineStages !== undefined) {
      try {
        const parsedOfflineStages =
          parseStages(offlineStages);

        console.warn(
          '[stages] API unavailable; using cached stages.',
        );

        return parsedOfflineStages;
      } catch {
        console.warn(
          '[stages] Ignoring invalid cached stages.',
        );
      }
    }

    console.warn(
      '[stages] API unavailable; using bundled stages.',
    );

    return bundledStages;
  }
}

export const getStages = createCachedReader<Stage>({
  fetchAll: fetchStagesWithFallback,
  offlineCacheKey: OFFLINE_CACHE_KEY,
});

export async function getStageById(
  id: string,
): Promise<Stage | undefined> {
  const stages = await getStages();

  return stages.find(
    (stage) => stage.id === id,
  );
}
