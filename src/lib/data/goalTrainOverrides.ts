import { turso } from '../turso/client';
import { executeWrite } from '../turso/mutationQueue';
import type { GoalTrainDirection, GoalTrainOverride } from '../../types';
import { createPolledStore } from '../turso/createPolledStore';

function rowToOverride(row: Record<string, unknown>): GoalTrainOverride {
  return {
    id: row.id as string,
    day: row.day as string,
    direction: row.direction as GoalTrainDirection,
    tripId: row.tripId as string,
    addedBy: row.addedBy as string,
  };
}

async function fetchAllOverrides(): Promise<GoalTrainOverride[]> {
  const result = await turso.execute('SELECT * FROM goal_train_overrides');
  return result.rows.map(rowToOverride);
}

const store = createPolledStore<GoalTrainOverride>({
  fetchAll: fetchAllOverrides,
  pollMs: 5000,
  offlineCacheKey: 'goal-train-overrides',
});

export const subscribeGoalTrainOverrides = store.subscribe;

export async function getOverrides(): Promise<GoalTrainOverride[]> {
  return store.getAll();
}

export async function getOverrideForDay(
  day: string,
  direction: GoalTrainDirection,
): Promise<GoalTrainOverride | undefined> {
  const all = await store.getAll();
  return all.find((override) => override.day === day && override.direction === direction);
}

export async function setOverride(input: Omit<GoalTrainOverride, 'id'>): Promise<GoalTrainOverride> {
  await executeWrite('DELETE FROM goal_train_overrides WHERE day = ? AND direction = ?', [
    input.day,
    input.direction,
  ]);
  const override: GoalTrainOverride = { ...input, id: `gto-${crypto.randomUUID()}` };
  await executeWrite('INSERT INTO goal_train_overrides (id, day, direction, tripId, addedBy) VALUES (?, ?, ?, ?, ?)', [
    override.id,
    override.day,
    override.direction,
    override.tripId,
    override.addedBy,
  ]);
  const next = store
    .getCache()
    .filter((existing) => !(existing.day === input.day && existing.direction === input.direction));
  store.setCache([...next, override]);
  return override;
}

export async function clearOverride(day: string, direction: GoalTrainDirection): Promise<void> {
  await executeWrite('DELETE FROM goal_train_overrides WHERE day = ? AND direction = ?', [day, direction]);
  store.setCache(store.getCache().filter((override) => !(override.day === day && override.direction === direction)));
}
