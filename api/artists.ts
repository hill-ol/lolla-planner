import type { Artist } from '../src/types';
import { getTursoClient } from './_lib/turso';

const FESTIVAL_DAYS = new Set<Artist['day']>([
  'thursday',
  'friday',
  'saturday',
  'sunday',
]);

const SUCCESS_HEADERS = {
  'Cache-Control':
    'public, max-age=60, s-maxage=300, stale-while-revalidate=3600',
  'Content-Type': 'application/json; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
};

const ERROR_HEADERS = {
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
};

function requireString(
  row: Record<string, unknown>,
  column: string,
): string {
  const value = row[column];

  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Invalid database column: ${column}`);
  }
  
  return value;
}

function rowToArtist(
  row: Record<string, unknown>,
): Artist {
  const day = requireString(row, 'day');

  if (!FESTIVAL_DAYS.has(day as Artist['day'])) {
    throw new Error('Invalid database column: day');
  }

  return {
    id: requireString(row, 'id'),
    name: requireString(row, 'name'),
    day: day as Artist['day'],
    stageId: requireString(row, 'stageId'),
    startTime: requireString(row, 'startTime'),
    endTime: requireString(row, 'endTime'),
  };
}

export default { 
  async fetch(request: Request): Promise<Response> {
    if (
      request.method !== 'GET' &&
      request.method !== 'HEAD'
    ) {
      return Response.json(
        {
          error: {
            code: 'method_not_allowed',
            message: 'Only GET and HEAD requests are supported.',
          },
        },
        {
          status: 405,
          headers: {
            ...ERROR_HEADERS,
            Allow: 'GET, HEAD',
          },
        },
      );
    }

    const requestId = crypto.randomUUID();

    try {
      const turso = getTursoClient();

      const result = await turso.execute(`
        SELECT
          id,
          name,
          day,
          stageId,
          startTime,
          endTime
        FROM artists
        ORDER BY
          day,
          startTime,
          stageId,
          name
      `);

      const artists = result.rows.map(rowToArtist);

      if (request.method === 'HEAD') {
        return new Response(null, {
          status: 200,
          headers: SUCCESS_HEADERS,
        });
      }

      return Response.json(
        {
          data: artists,
        },
        {
          status: 200,
          headers: SUCCESS_HEADERS,
        },
      );
    } catch (error: unknown) {
      // Do not log the error message or stack. Database-client errors may
      // contain connection details. The request ID provides safe correlation.
      const errorType =
        error instanceof Error
          ? error.name
          : 'UnknownError';

      console.error(
        `[api/artists] ${requestId} failed with ${errorType}`,
      );

      return Response.json(
        {
          error: {
            code: 'internal_error',
            message: 'Unable to load artists.',
            requestId,
          },
        },
        {
          status: 500,
          headers: ERROR_HEADERS,
        },
      );
    }
  },
};
