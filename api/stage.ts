import type { Stage } from '../src/types';
import { getTursoClient } from './_lib/turso';

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

function requireMapCoordinate(
  row: Record<string, unknown>,
  column: string,
): number {
  const value = row[column];
  const numericValue =
    typeof value === 'number'
      ? value
      : Number(value);

  if (
    !Number.isFinite(numericValue) ||
    numericValue < 0 ||
    numericValue > 100
  ) {
    throw new Error(`Invalid map coordinate: ${column}`);
  }

  return numericValue;
}

function rowToStage(
  row: Record<string, unknown>,
): Stage {
  return {
    id: requireString(row, 'id'),
    name: requireString(row, 'name'),
    mapX: requireMapCoordinate(row, 'mapX'),
    mapY: requireMapCoordinate(row, 'mapY'),
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
          mapX,
          mapY
        FROM stages
        ORDER BY name
      `);

      const stages = result.rows.map(rowToStage);

      if (request.method === 'HEAD') {
        return new Response(null, {
          status: 200,
          headers: SUCCESS_HEADERS,
        });
      }

      return Response.json(
        {
          data: stages,
        },
        {
          status: 200,
          headers: SUCCESS_HEADERS,
        },
      );
    } catch (error: unknown) {
      const errorType =
        error instanceof Error
          ? error.name
          : 'UnknownError';

      console.error(
        `[api/stages] ${requestId} failed with ${errorType}`,
      );

      return Response.json(
        {
          error: {
            code: 'internal_error',
            message: 'Unable to load stages.',
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
