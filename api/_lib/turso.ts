import {
  createClient,
  type Client,
} from '@libsql/client';

const REMOTE_PROTOCOLS = new Set([
  'libsql:',
  'https:',
  'wss:',
]);

const LOCAL_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  '::1',
]);

let client: Client | undefined;

function requireEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `Missing required server environment variable: ${name}`,
    );
  }

  return value;
}

function validateDatabaseUrl(value: string): string {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(value);
  } catch {
    throw new Error(
      'TURSO_DATABASE_URL must be a valid URL.',
    );
  }

  const isSecureRemoteUrl = REMOTE_PROTOCALS.has(
    parsedUrl.protocol,
  );

  const isLocalDevelopmentUrl = parsedUrl.protocol === 'http' && LOCAL_HOSTS.has(parsedUrl.hostname);

  if (!isSecureRemoteUrl && !isLocalDevelopmentUrl) {
    throw new Error(
      'TURSO_DATABASE_URL must use libsql, HTTPS, or WSS.',
    );
  }

  return value;
}

export function getTursoClient(): Client {
  if (client) {
    return client;
  }

  const url = validateDatabaseUrl(
    requireEnvironmentVariable('TURSO_DATABASE_URL');
  );

  const authToken = requireEnvironmentVariable('TURSO_AUTH_TOKEN');

  client = createClient({
    url,
    authToken,
  });

  return client;
}
