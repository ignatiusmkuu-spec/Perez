'use strict';

const fs = require('fs');
const path = require('path');

const PLUGIN_DIR = path.join(__dirname, '..', 'plugins');
const plugins = new Map();

const toArray = (value) => (Array.isArray(value) ? value : [value]);

function validate(plugin) {
  const commands = toArray(plugin && plugin.command);
  if (!commands.length || commands.some((c) => typeof c !== 'string' || !c)) {
    throw new Error('every plugin needs a "command" (string or array of strings)');
  }
  if (typeof plugin.handler !== 'function') {
    throw new Error(`"${commands[0]}" needs a handler function`);
  }
}

function loadPlugins(dir = PLUGIN_DIR) {
  plugins.clear();
  const loaded = [];
  const failed = [];

  let entries = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (error) {
    console.error(`[HANDLER] Cannot read ${dir}: ${error.message}`);
    return { loaded, failed };
  }

  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (!entry.isFile() || !entry.name.endsWith('.js') || entry.name.startsWith('_')) continue;
    const fullPath = path.join(dir, entry.name);
    try {
      delete require.cache[require.resolve(fullPath)];
      const list = toArray(require(fullPath));
      list.forEach(validate);

      for (const plugin of list) {
        const names = [...toArray(plugin.command), ...(Array.isArray(plugin.aliases) ? plugin.aliases : [])];
        for (const name of names) {
          const key = name.toLowerCase();
          if (plugins.has(key)) {
            console.warn(`[HANDLER] "${key}" in ${entry.name} is already registered by ${plugins.get(key)._file}; keeping the first`);
            continue;
          }
          plugin._file = entry.name;
          plugins.set(key, plugin);
        }
      }
      loaded.push(entry.name);
    } catch (error) {
      failed.push({ file: entry.name, error: error.message });
      console.error(`[HANDLER] Failed to load ${entry.name}: ${error.message}`);
    }
  }

  console.log(`[HANDLER] Loaded ${loaded.length} plugin files (${plugins.size} commands)` + (failed.length ? `, ${failed.length} failed` : ''));
  return { loaded, failed };
}


async function dispatch(command, client, m, ctx) {
  const plugin = plugins.get(String(command).toLowerCase());
  if (!plugin) return false;

  try {
    await plugin.handler(client, m, ctx);
  } catch (error) {
    console.error(`[HANDLER] Error in plugin for "${command}":`, error);
 
    const message = typeof error === 'string' ? error : `❌ An error occurred while running *${command}*: ${(error && error.message) || error}`;
    try {
      await m.reply(message);
    } catch (replyError) {
      console.error('[HANDLER] Could not send the error reply:', replyError && replyError.message);
    }
  }
  return true;
}

function getPlugin(command) {
  return plugins.get(String(command).toLowerCase());
}

function listCommands() {
  return [...plugins.keys()].sort();
}

function listPlugins() {
  return [...new Set(plugins.values())];
}

module.exports = { loadPlugins, dispatch, getPlugin, listCommands, listPlugins, toArray, PLUGIN_DIR };
