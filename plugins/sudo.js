const { getSettings, updateSetting } = require('../database/config');
const sudo = require('../lib/sudo');
const identity = require('../lib/Identity');

const show = (entry) => (entry.endsWith('@lid') ? `${sudo.digits(entry)} (LID, number unknown)` : sudo.digits(entry));

const toggle = ({ command, key, label, does }) => ({
  command: [command],
  aliases: [],
  description: `${label} (on/off)`,
  category: 'settings',
  handler: async (client, m, { Owner, NotOwner, reply, text, prefix }) => {
    if (!Owner) throw NotOwner;
    const current = (await getSettings())[key];
    const value = String(text || '').trim().toLowerCase();
    if (!value) return reply(`${label} is currently *${current.toUpperCase()}*\n\n${does}\n\nUsage: ${prefix}${command} on/off`);
    if (!['on', 'off'].includes(value)) return reply(`Usage: ${prefix}${command} on/off`);
    if (value === current) return reply(`${label} is already *${value.toUpperCase()}*`);
    if (!(await updateSetting(key, value))) return reply('I could not save that setting, try again.');
    reply(`${label} has been turned *${value.toUpperCase()}*`);
  },
});

module.exports = [
  {
    command: ['addsudo'],
    aliases: ['setsudo'],
    description: 'Give someone sudo (owner level) access',
    category: 'owner',
    handler: async (client, m, { Owner, NotOwner, reply, text, prefix }) => {
      if (!Owner) throw NotOwner;
      const jid = await sudo.resolveTarget(client, m, text);
      if (!jid) return reply(`Tag someone, reply to their message or give a number: ${prefix}addsudo 2547xxxxxxxx`);

      const known = await identity.expand(client, [jid]);
      const trusted = await identity.expand(client, [...identity.botIds(client), ...identity.ownerJids(sudo.mainOwners())]);
      if (identity.overlaps(known, trusted)) return reply('That is already the owner, no need for sudo.');

      if (!(await sudo.add(client, jid))) return reply(`${show(jid)} already has sudo access.`);
      await client.sendMessage(m.chat, { text: `@${sudo.digits(jid)} now has sudo access.`, mentions: [jid] }, { quoted: m });
    },
  },

  {
    command: ['delsudo'],
    aliases: ['removesudo', 'rmsudo'],
    description: 'Take sudo access away from someone',
    category: 'owner',
    handler: async (client, m, { Owner, NotOwner, reply, text, prefix }) => {
      if (!Owner) throw NotOwner;
      const jid = await sudo.resolveTarget(client, m, text);
      if (!jid) return reply(`Tag someone, reply to their message or give a number: ${prefix}delsudo 2547xxxxxxxx`);
      if (!(await sudo.remove(client, jid))) return reply(`${show(jid)} does not have sudo access.`);
      await client.sendMessage(m.chat, { text: `@${sudo.digits(jid)} no longer has sudo access.`, mentions: [jid] }, { quoted: m });
    },
  },

  {
    command: ['checksudo'],
    aliases: ['getsudo', 'listsudo', 'sudolist'],
    description: 'List everyone who has sudo access',
    category: 'owner',
    handler: async (client, m, { Owner, NotOwner, reply }) => {
      if (!Owner) throw NotOwner;
      const entries = await sudo.list();
      if (!entries.length) return reply('Nobody has sudo access.');
      const lines = entries.map((entry, i) => `${i + 1}. ${show(entry)}`);
      reply(`Sudo users (${entries.length})\n\n${lines.join('\n')}`);
    },
  },

  {
    command: ['clearsudos'],
    aliases: ['clearsudo', 'delallsudo'],
    description: 'Remove every sudo user at once',
    category: 'owner',
    handler: async (client, m, { Owner, NotOwner, reply }) => {
      if (!Owner) throw NotOwner;
      const count = await sudo.clear();
      reply(count ? `Removed ${count} sudo user${count === 1 ? '' : 's'}.` : 'Nobody has sudo access.');
    },
  },

  toggle({
    command: 'antidemote',
    key: 'antidemote',
    label: 'Antidemote',
    does: 'When someone other than the owner or a sudo user demotes an admin, I make that person an admin again. I must be an admin.',
  }),
  toggle({
    command: 'antipromote',
    key: 'antipromote',
    label: 'Antipromote',
    does: 'When someone other than the owner or a sudo user promotes a member, I take the admin role back. I must be an admin.',
  }),
];
