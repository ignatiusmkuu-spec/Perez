'use strict';

let pool = null;

function sslOption() {
  const v = String(process.env.DATABASE_SSL || '').toLowerCase();
  return ['false', 'off', '0', 'no', 'disable'].includes(v) ? false : { rejectUnauthorized: false };
}

function makePool(ssl) {
  const { Pool } = require('pg');
  const created = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl,
    connectionTimeoutMillis: Number(process.env.DATABASE_TIMEOUT_MS) || 10000, 
  });
  created.on('error', (error) => console.error('❌ PostgreSQL connection error:', error.message || error));
  return created;
}

async function setUp(defaults) {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS bot_settings (
        id SERIAL PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL
      );
    `);
    for (const [key, value] of Object.entries(defaults)) {
      await client.query(
        `INSERT INTO bot_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING;`,
        [key, value]
      );
    }
  } finally {
    client.release();
  }
}

async function init(defaults) {
  pool = makePool(sslOption());
  try {
    await setUp(defaults);
  } catch (error) {
    
    if (!/does not support SSL/i.test(error.message || '')) throw error;
    console.log('ℹ️ This PostgreSQL server does not use SSL, connecting without it.');
    await close();
    pool = makePool(false);
    await setUp(defaults);
  }
}

async function readAll() {
  const client = await pool.connect();
  try {
    const result = await client.query(`SELECT key, value FROM bot_settings`);
    const settings = {};
    for (const row of result.rows) settings[row.key] = row.value;
    return settings;
  } finally {
    client.release();
  }
}

async function set(key, value) {
  const client = await pool.connect();
  try {
    await client.query(
      `INSERT INTO bot_settings (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [key, value]
    );
  } finally {
    client.release();
  }
}

async function close() {
  if (pool) await pool.end().catch(() => { });
  pool = null;
}

module.exports = { name: 'PostgreSQL', init, readAll, set, close };
