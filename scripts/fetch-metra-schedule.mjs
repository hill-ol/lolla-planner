// Rebuilds src/data/trainSchedule.json from Metra's public static GTFS feed
// (no auth required — this is a plain open download, unlike the realtime API).
//
// Usage: node scripts/fetch-metra-schedule.mjs
//
// What this does:
// 1. Downloads https://schedules.metrarail.com/gtfs/schedule.zip
// 2. Finds the BNSF trips serving Union Station (CUS) <-> LaGrange Road (LAGRANGE)
// 3. For each festival day, picks the calendar_dates.txt service_id that's
//    actually in effect that day (Metra publishes single-day override
//    service_ids for specific dates — these REPLACE the regular weekday/
//    weekend pattern, they don't add to it; see exception_type 1 vs 2)
// 4. Writes src/data/trainSchedule.json in the shape TrainTrip expects

import { execSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// Festival dates -> which calendar.txt/calendar_dates.txt service_id is in
// effect. Update these if you re-run this closer to the festival and Metra
// has republished different override service_ids for these dates.
const FESTIVAL_DAY_DATES = {
  thursday: '20260730',
  friday: '20260731',
  saturday: '20260801',
  sunday: '20260802',
};

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(',').map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cols = line.split(',').map((c) => c.trim());
    const obj = {};
    headers.forEach((h, i) => (obj[h] = cols[i]));
    return obj;
  });
}

function toHHMM(gtfsTime) {
  const [h, m] = gtfsTime.split(':').map(Number);
  return `${String(h % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function sortMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const minutes = h * 60 + m;
  return minutes < 180 ? minutes + 1440 : minutes; // post-midnight trips sort last
}

async function main() {
  const workDir = mkdtempSync(join(tmpdir(), 'metra-gtfs-'));
  const zipPath = join(workDir, 'schedule.zip');

  console.log('Downloading Metra static GTFS feed...');
  const response = await fetch('https://schedules.metrarail.com/gtfs/schedule.zip');
  if (!response.ok) throw new Error(`Download failed: HTTP ${response.status}`);
  writeFileSync(zipPath, Buffer.from(await response.arrayBuffer()));

  execSync(`unzip -o "${zipPath}" -d "${workDir}"`, { stdio: 'inherit' });

  const trips = parseCSV(readFileSync(join(workDir, 'trips.txt'), 'utf-8'));
  const stopTimes = parseCSV(readFileSync(join(workDir, 'stop_times.txt'), 'utf-8'));
  const calendarDates = parseCSV(readFileSync(join(workDir, 'calendar_dates.txt'), 'utf-8'));

  const bnsfTrips = trips.filter((t) => t.route_id === 'BNSF');
  const stopTimesByTrip = new Map();
  for (const st of stopTimes) {
    if (!stopTimesByTrip.has(st.trip_id)) stopTimesByTrip.set(st.trip_id, []);
    stopTimesByTrip.get(st.trip_id).push(st);
  }

  const result = {};

  for (const [day, date] of Object.entries(FESTIVAL_DAY_DATES)) {
    // Prefer a single-day override service_id (exception_type 1 = added) if
    // Metra has published one for this exact date; otherwise there's no
    // override and the regular recurring calendar.txt pattern applies (not
    // handled here since our festival dates currently all have overrides).
    const addedServiceIds = calendarDates
      .filter((row) => row.date === date && row.exception_type === '1')
      .map((row) => row.service_id);

    if (addedServiceIds.length === 0) {
      console.warn(`No override service_id found for ${day} (${date}) — schedule may be incomplete.`);
    }

    const dayTrips = bnsfTrips.filter((t) => addedServiceIds.includes(t.service_id));
    const outbound = [];
    const returnTrips = [];

    for (const trip of dayTrips) {
      const stops = (stopTimesByTrip.get(trip.trip_id) || []).sort(
        (a, b) => Number(a.stop_sequence) - Number(b.stop_sequence),
      );
      const laGrangeStop = stops.find((s) => s.stop_id === 'LAGRANGE');
      const cusStop = stops.find((s) => s.stop_id === 'CUS');
      if (!laGrangeStop || !cusStop) continue;

      if (Number(laGrangeStop.stop_sequence) < Number(cusStop.stop_sequence)) {
        outbound.push({
          tripId: trip.trip_id,
          direction: 'outbound',
          departureTime: toHHMM(laGrangeStop.departure_time),
          arrivalTime: toHHMM(cusStop.arrival_time),
        });
      } else {
        returnTrips.push({
          tripId: trip.trip_id,
          direction: 'return',
          departureTime: toHHMM(cusStop.departure_time),
          arrivalTime: toHHMM(laGrangeStop.arrival_time),
        });
      }
    }

    outbound.sort((a, b) => sortMinutes(a.departureTime) - sortMinutes(b.departureTime));
    returnTrips.sort((a, b) => sortMinutes(a.departureTime) - sortMinutes(b.departureTime));

    result[day] = { outbound, return: returnTrips };
    console.log(`${day}: ${outbound.length} outbound, ${returnTrips.length} return`);
  }

  writeFileSync(join(root, 'src/data/trainSchedule.json'), JSON.stringify(result, null, 2) + '\n');
  rmSync(workDir, { recursive: true, force: true });
  console.log('Wrote src/data/trainSchedule.json');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
