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

function isOwner(ids, ownerNumbers) {
  const owners = ownerNumbers.map((n) => String(n).replace(/[^0-9]/g, '')).filter(Boolean);
  return [...ids].some((id) => owners.includes(id.split('@')[0]) && id.endsWith('@s.whatsapp.net'));
}


function adminIdSet(participants) {
  const set = new Set();
  for (const p of participants || []) {
    if (p && (p.admin || p.isAdmin || p.isSuperAdmin)) participantIds(p).forEach((id) => set.add(id));
  }
  return set;
}

const overlaps = (ids, set) => [...ids].some((id) => set.has(id));

module.exports = { bare, participantIds, senderIds, botIds, isOwner, adminIdSet, overlaps };
