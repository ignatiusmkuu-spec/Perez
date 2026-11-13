'use strict';

function bare(jid) {
  if (typeof jid !== 'string' || !jid) return '';
  return jid.replace(/:\d+@/, '@');
}


function participantIds(participant) {
  if (!participant) return [];
  return [participant.id, participant.lid, participant.phoneNumber].filter(Boolean).map(bare);
}


function senderIds(m, mek, participants) {
  const key = (mek && mek.key) || {};
  const ids = new Set([m && m.sender, key.participant, key.participantAlt, key.remoteJidAlt].filter(Boolean).map(bare));
  if (m && !m.isGroup && key.remoteJid) ids.add(bare(key.remoteJid));
  if (Array.isArray(participants)) {
    for (const p of participants) {
      if (participantIds(p).some((id) => ids.has(id))) participantIds(p).forEach((id) => ids.add(id));
    }
  }
  return ids;
}


function botIds(client) {
  const user = (client && client.user) || {};
  return new Set([user.id, user.lid, user.phoneNumber].filter(Boolean).map(bare));
}

function ownerJids(ownerNumbers) {
  return (ownerNumbers || [])
    .map((n) => String(n).replace(/[^0-9]/g, ''))
    .filter(Boolean)
    .map((n) => n + '@s.whatsapp.net');
}

const pairCache = new Map();

async function counterpart(client, id) {
  const store = client && client.signalRepository && client.signalRepository.lidMapping;
  if (!store || !id) return null;
  const hit = pairCache.get(id);
  if (hit) return hit;
  let out = null;
  try {
    if (id.endsWith('@lid')) out = await store.getPNForLID(id);
    else if (id.endsWith('@s.whatsapp.net')) out = await store.getLIDForPN(id);
  } catch (e) {
    out = null;
  }
  out = out ? bare(out) : null;
  if (out) pairCache.set(id, out);
  return out;
}

async function expand(client, ids) {
  const out = new Set([...ids].map(bare));
  const extra = await Promise.all([...out].map((id) => counterpart(client, id)));
  extra.filter(Boolean).forEach((id) => out.add(id));
  return out;
}

function isOwner(ids, ownerNumbers, ownerAltIds) {
  const owners = new Set(ownerJids(ownerNumbers));
  (ownerAltIds || []).forEach((id) => owners.add(bare(id)));
  return [...ids].some((id) => owners.has(id));
}


function adminIdSet(participants) {
  const set = new Set();
  for (const p of participants || []) {
    if (p && (p.admin || p.isAdmin || p.isSuperAdmin)) participantIds(p).forEach((id) => set.add(id));
  }
  return set;
}

const overlaps = (ids, set) => [...ids].some((id) => set.has(id));

module.exports = { bare, participantIds, senderIds, botIds, ownerJids, counterpart, expand, isOwner, adminIdSet, overlaps };
