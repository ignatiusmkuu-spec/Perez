'use strict';

const TTL_MS = 5 * 60 * 1000;
const cache = new Map(); // jid -> { data, expires }

function get(jid) {
  const hit = cache.get(jid);
  if (!hit) return undefined;
  if (hit.expires < Date.now()) { cache.delete(jid); return undefined; }
  return hit.data;
}

function set(jid, data) {
  if (jid && data) cache.set(jid, { data, expires: Date.now() + TTL_MS });
}

function drop(jid) {
  cache.delete(jid);
}

// returns cached metadata, or fetches and caches it
async function fetchMetadata(client, jid) {
  const cached = get(jid);
  if (cached) return cached;
  const data = await client.groupMetadata(jid);
  set(jid, data);
  return data;
}

// keeps the cache fresh when a group changes
function bind(client) {
  client.ev.on('groups.update', (updates) => {
    for (const update of updates || []) drop(update.id);
  });
  client.ev.on('group-participants.update', (update) => {
    if (update && update.id) drop(update.id);
  });
}

module.exports = { get, set, drop, fetchMetadata, bind };
