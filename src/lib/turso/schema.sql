-- Lolla Planner — Turso schema
-- Column names match the TypeScript types in src/types/index.ts exactly.

CREATE TABLE IF NOT EXISTS friends (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT
);

CREATE TABLE IF NOT EXISTS stages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  mapX REAL NOT NULL,
  mapY REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS artists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  day TEXT NOT NULL CHECK (day IN ('thursday', 'friday', 'saturday', 'sunday')),
  stageId TEXT NOT NULL REFERENCES stages(id),
  startTime TEXT NOT NULL,
  endTime TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS songs (
  id TEXT PRIMARY KEY,
  artistId TEXT NOT NULL REFERENCES artists(id),
  title TEXT NOT NULL,
  addedBy TEXT NOT NULL REFERENCES friends(id),
  source TEXT NOT NULL CHECK (source IN ('manual', 'setlistfm'))
);

CREATE TABLE IF NOT EXISTS schedule_picks (
  id TEXT PRIMARY KEY,
  artistId TEXT NOT NULL REFERENCES artists(id),
  addedBy TEXT NOT NULL REFERENCES friends(id),
  note TEXT
);

CREATE TABLE IF NOT EXISTS goal_train_overrides (
  id TEXT PRIMARY KEY,
  day TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('outbound', 'return')),
  tripId TEXT NOT NULL,
  addedBy TEXT NOT NULL REFERENCES friends(id)
);

CREATE INDEX IF NOT EXISTS idx_artists_day ON artists(day);
CREATE INDEX IF NOT EXISTS idx_songs_artistId ON songs(artistId);
CREATE INDEX IF NOT EXISTS idx_schedule_picks_artistId ON schedule_picks(artistId);
CREATE INDEX IF NOT EXISTS idx_goal_train_overrides_day_direction ON goal_train_overrides(day, direction);
