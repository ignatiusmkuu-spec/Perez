'use strict';

const fs = require('fs');
const path = require('path');

function filePath() {
  return path.resolve(process.env.SETTINGS_FILE || path.join(process.env.DATA_DIR || __dirname, 'settings.json'));
}

let data = null;
let writing = Promise.resolve();

async function init(defaults) {
  const file = filePath();
  await fs.promises.mkdir(path.dirname(file), { recursive: true });

  let saved = {};
  try {
    saved = JSON.parse(await fs.promises.readFile(file, 'utf8'));
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) throw new Error('not an object');
  } catch (error) {
    if (error.code !== 'ENOENT') {

      const copy = `${file}.corrupt-${Date.now()}`;
      await fs.promises.rename(file, copy).catch(() => { });
      console.error(`⚠️ Settings file could not be read (${error.message}). Saved it as ${path.basename(copy)}.`);
    }
    saved = {};
  }

  data = { ...defaults, ...saved };
  await persist();
  return file;
}

function persist() {
  const file = filePath();
  const text = JSON.stringify(data, null, 2);
  
  writing = writing.then(async () => {
    const temp = `${file}.tmp`;
    await fs.promises.writeFile(temp, text);
    await fs.promises.rename(temp, file);
  });
  return writing;
}

async function readAll() {
  if (!data) throw new Error('JSON settings store is not initialised');
  return { ...data };
}

async function set(key, value) {
  if (!data) throw new Error('JSON settings store is not initialised');
  data[key] = value;
  await persist();
}

module.exports = { name: 'JSON file', init, readAll, set, filePath };
