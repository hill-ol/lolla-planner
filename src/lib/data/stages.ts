import { turso } from '../turso/client';
import type { Stage } from '../../types';

let cache: Stage[] | null = null;

function rowToStage(row: Record<string, unknown>): Stage {
  return {
    id: row.id as string,
    name: row.name as string,
    mapX: Number(row.mapX),
    mapY: Number(row.mapY),
  };
}

export async function getStages(): Promise<Stage[]> {
  if (cache) return cache;
  const result = await turso.execute('SELECT * FROM stages');
  cache = result.rows.map(rowToStage);
  return cache;
}

export async function getStageById(id: string): Promise<Stage | undefined> {
  const stages = await getStages();
  return stages.find((stage) => stage.id === id);
}
