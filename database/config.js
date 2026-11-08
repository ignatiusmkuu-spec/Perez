const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const defaultSettings = {
  antilink: 'on',
  antilinkall: 'off',
  autobio: 'off',
  antidelete: 'on',
  antitag: 'on',
  antibot: 'off',
  anticall: 'off',
  badword: 'on',
  gptdm: 'off',
  welcome: 'off',
  autoread: 'off',
  mode: 'public',
  prefix: '.',
  autolike: 'on',
  autoview: 'on',
  wapresence: 'online'
};

async function initializeDatabase() {
  const client = await pool.connect();
  console.log("📡 Connecting to PostgreSQL...");

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS bot_settings (
        id SERIAL PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL
      );
    `);

    for (const [key, value] of Object.entries(defaultSettings)) {
      await client.query(
        `INSERT INTO bot_settings (key, value)
         VALUES ($1, $2)
         ON CONFLICT (key) DO NOTHING;`,
        [key, value]
      );
    }

    console.log("✅ Database initialized.");
  } catch (err) {
    console.error("❌ Database initialization failed:", err.message || err);
    throw err;
  } finally {
    client.release();
  }
}

// Settings are read on every incoming message, so they are cached for a short time. updateSetting()
// clears the cache, so a change made with a command applies immediately.
const SETTINGS_TTL_MS = 30 * 1000;
let settingsCache = null;
let settingsCachedAt = 0;

async function getSettings() {
  if (settingsCache && Date.now() - settingsCachedAt < SETTINGS_TTL_MS) return { ...settingsCache };
  const fresh = await readSettings();
  settingsCache = fresh;
  settingsCachedAt = Date.now();
  return { ...fresh };
}

async function readSettings() {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `SELECT key, value FROM bot_settings WHERE key = ANY($1::text[])`,
      [Object.keys(defaultSettings)]
    );

    const settings = {};
    for (const row of result.rows) {
      settings[row.key] = row.value;
    }

    return settings;

  } catch (err) {
    console.error("❌ Failed to fetch settings:", err.message || err);
    throw err;

  } finally {
    client.release();
  }
}

async function updateSetting(key, value) {
  const client = await pool.connect();
  try {
    const validKeys = Object.keys(defaultSettings);
    if (!validKeys.includes(key)) {
      throw new Error(`Invalid setting key: ${key}`);
    }

    await client.query(
      `UPDATE bot_settings SET value = $1 WHERE key = $2`,
      [value, key]
    );

    settingsCache = null; // next read fetches the new value
    return true;
  } catch (err) {
    console.error("❌ Failed to update setting:", err.message || err);
    return false;
  } finally {
    client.release();
  }
}

module.exports = {
  initializeDatabase,
  getSettings,
  updateSetting
};
