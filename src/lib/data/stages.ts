import { turso } from '../turso/client';
import type { Stage } from '../../types';
import { createCachedReader } from '../turso/createCachedReader';

function rowToStage(row: Record<string, unknown>): Stage {
  return {
    id: row.id as string,
    name: row.name as string,
    mapX: Number(row.mapX),
    mapY: Number(row.mapY),
  };
}

export const getStages = createCachedReader<Stage>({
  fetchAll: async () => {
    const result = await turso.execute('SELECT * FROM stages');
    return result.rows.map(rowToStage);
  },
  offlineCacheKey: 'stages',
});

export async function getStageById(id: string): Promise<Stage | undefined> {
  const stages = await getStages();
  return stages.find((stage) => stage.id === id);
}
