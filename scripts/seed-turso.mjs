// Seeds reference data (friends, stages, artists) into Turso.
// Collaborative tables (songs, schedule_picks, goal_train_overrides) are left
// empty — the group starts those fresh once the app goes live.
//
// Usage: node --env-file=.env scripts/seed-turso.mjs

import { createClient } from '@libsql/client';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const url = process.env.VITE_TURSO_DATABASE_URL;
const authToken = process.env.VITE_TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error('Missing VITE_TURSO_DATABASE_URL or VITE_TURSO_AUTH_TOKEN.');
  console.error('Run with: node --env-file=.env scripts/seed-turso.mjs');
  process.exit(1);
}

const client = createClient({ url, authToken });

function readJson(relativePath) {
  return JSON.parse(readFileSync(join(root, relativePath), 'utf-8'));
}

async function applySchema() {
  const schema = readFileSync(join(__dirname, '../src/lib/turso/schema.sql'), 'utf-8');
  const statements = schema
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
  for (const statement of statements) {
    await client.execute(statement);
  }
  console.log(`Applied schema (${statements.length} statements).`);
}

async function seedFriends() {
  const friends = readJson('src/data/friends.json');
  for (const friend of friends) {
    await client.execute({
      sql: 'INSERT OR REPLACE INTO friends (id, name, color) VALUES (?, ?, ?)',
      args: [friend.id, friend.name, friend.color ?? null],
    });
  }
  console.log(`Seeded ${friends.length} friends.`);
}

async function seedStages() {
  const stages = readJson('src/data/stages.json');
  for (const stage of stages) {
    await client.execute({
      sql: 'INSERT OR REPLACE INTO stages (id, name, mapX, mapY) VALUES (?, ?, ?, ?)',
      args: [stage.id, stage.name, stage.mapX, stage.mapY],
    });
  }
  console.log(`Seeded ${stages.length} stages.`);
}

async function seedArtists() {
  const artists = readJson('src/data/artists.json');
  for (const artist of artists) {
    await client.execute({
      sql: 'INSERT OR REPLACE INTO artists (id, name, day, stageId, startTime, endTime) VALUES (?, ?, ?, ?, ?, ?)',
      args: [artist.id, artist.name, artist.day, artist.stageId, artist.startTime, artist.endTime],
    });
  }
  console.log(`Seeded ${artists.length} artists.`);
}

async function main() {
  await applySchema();
  await seedFriends();
  await seedStages();
  await seedArtists();
  console.log('Done.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
