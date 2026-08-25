import Fastify from 'fastify';
import pg from 'pg';

const PORT = Number(process.env.PORT) || 3000;
const DATABASE_URL = process.env.DATABASE_URL;

const app = Fastify({ logger: false });
const pool = DATABASE_URL ? new pg.Pool({ connectionString: DATABASE_URL }) : null;

async function ensureSchema() {
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL
    )
  `);
  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM users');
  if (rows[0].count === 0) {
    await pool.query(`INSERT INTO users (name) VALUES ('Alice'), ('Bob'), ('Carol')`);
  }
}

app.get('/health', async () => ({ status: 'ok' }));

app.get('/users', async (req, reply) => {
  if (!pool) return reply.code(503).send({ error: 'DATABASE_URL is not set' });
  const { rows } = await pool.query('SELECT id, name FROM users ORDER BY id');
  return rows;
});

app.get('/', async () => ({
  service: 'l5-docker',
  hostname: process.env.HOSTNAME ?? 'unknown',
  user: process.getuid?.() === 0 ? 'root' : `uid=${process.getuid?.()}`,
  node: process.version,
  db: pool ? 'configured' : 'not configured',
}));

for (const sig of ['SIGTERM', 'SIGINT']) {
  process.on(sig, async () => {
    await app.close();
    await pool?.end();
    process.exit(0);
  });
}

await ensureSchema();
await app.listen({ port: PORT, host: '0.0.0.0' });
console.log(`listening :${PORT} hostname=${process.env.HOSTNAME} uid=${process.getuid?.()}`);
