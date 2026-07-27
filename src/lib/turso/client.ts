import { createClient } from '@libsql/client/web';

const url = import.meta.env.VITE_TURSO_DATABASE_URL;
const authToken = import.meta.env.VITE_TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  throw new Error(
    'Missing VITE_TURSO_DATABASE_URL or VITE_TURSO_AUTH_TOKEN. Set both in .env — see README for setup.',
  );
}

export const turso = createClient({ url, authToken });
