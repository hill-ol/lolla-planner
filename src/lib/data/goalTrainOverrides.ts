import { turso } from '../turso/client';
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

const store = createPolledStore<GoalTrainOverride>({ fetchAll: fetchAllOverrides, pollMs: 5000 });

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
  await turso.execute({
    sql: 'DELETE FROM goal_train_overrides WHERE day = ? AND direction = ?',
    args: [input.day, input.direction],
  });
  const override: GoalTrainOverride = { ...input, id: `gto-${crypto.randomUUID()}` };
  await turso.execute({
    sql: 'INSERT INTO goal_train_overrides (id, day, direction, tripId, addedBy) VALUES (?, ?, ?, ?, ?)',
    args: [override.id, override.day, override.direction, override.tripId, override.addedBy],
  });
  const next = store
    .getCache()
    .filter((existing) => !(existing.day === input.day && existing.direction === input.direction));
  store.setCache([...next, override]);
  return override;
}

export async function clearOverride(day: string, direction: GoalTrainDirection): Promise<void> {
  await turso.execute({
    sql: 'DELETE FROM goal_train_overrides WHERE day = ? AND direction = ?',
    args: [day, direction],
  });
  store.setCache(store.getCache().filter((override) => !(override.day === day && override.direction === direction)));
}
