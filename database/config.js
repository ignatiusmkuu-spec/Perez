'use strict';

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

const jsonStore = require('./jsonStore');
let store = null;

function wantedStore() {
  const type = String(process.env.DATABASE_TYPE || '').toLowerCase();
  if (['postgres', 'postgresql', 'pg'].includes(type)) return 'postgres';
  if (type === 'json') return 'json';
  return process.env.DATABASE_URL ? 'postgres' : 'json';
}

async function initializeDatabase() {
  if (wantedStore() === 'postgres') {
    if (!process.env.DATABASE_URL) {
      console.error('⚠️ DATABASE_TYPE is postgres but DATABASE_URL is not set. Using the JSON file instead.');
    } else {
      const pgStore = require('./pgStore');
      console.log('📡 Connecting to PostgreSQL...');
      try {
        await pgStore.init(defaultSettings);
        store = pgStore;
        console.log('✅ Database initialized (PostgreSQL).');
        return;
      } catch (error) {
        console.error('❌ PostgreSQL is not available:', error.message || error);
        console.error('⚠️ Using the JSON file instead. Settings saved there are not copied to PostgreSQL.');
        await pgStore.close();
      }
    }
  }
  const file = await jsonStore.init(defaultSettings);
  store = jsonStore;
  console.log(`✅ Database initialized (JSON file: ${file}).`);
}

const SETTINGS_TTL_MS = 30 * 1000;
let settingsCache = null;
let settingsCachedAt = 0;

async function getSettings() {
  if (settingsCache && Date.now() - settingsCachedAt < SETTINGS_TTL_MS) return { ...settingsCache };
  try {
    if (!store) await initializeDatabase();
    
    const fresh = { ...defaultSettings, ...(await store.readAll()) };
    settingsCache = fresh;
    settingsCachedAt = Date.now();
    return { ...fresh };
  } catch (err) {
    console.error('❌ Failed to fetch settings:', err.message || err);
    
    return { ...(settingsCache || defaultSettings) };
  }
}

async function updateSetting(key, value) {
  try {
    if (!Object.keys(defaultSettings).includes(key)) throw new Error(`Invalid setting key: ${key}`);
    if (!store) await initializeDatabase();
    await store.set(key, String(value));
    settingsCache = null; 
    return true;
  } catch (err) {
    console.error('❌ Failed to update setting:', err.message || err);
    return false;
  }
}

module.exports = {
  initializeDatabase,
  getSettings,
  updateSetting,
  defaultSettings
};
