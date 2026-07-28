const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
};

export default {
  fetch(request: Request): Response {
    if (request.method === 'HEAD') {
      return new Response(null, {
        status: 200,
        headers: JSON_HEADERS,
      });
    }

    if (request.method !== 'GET') {
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
            ...JSON_HEADERS,
            Allow: 'GET, HEAD',
          },
        },
      );
    }

    return Response.json(
      {
        status: 'ok',
        service: 'lolla-planner-api',
      },
      {
        status: 200,
        headers: JSON_HEADERS,
      },
    );
  },
};
