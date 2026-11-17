const identity = require('../lib/Identity');

const FAKE_CODE = process.env.FAKE_CODE || '1';
const CHUNK = 20;

const digits = (jid) => String(jid || '').split('@')[0].split(':')[0].replace(/\D/g, '');
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const say = (client, m, text, mentions = []) => client.sendMessage(m.chat, { text, mentions }, { quoted: m });

async function check(m, ctx, { admin = true, botAdmin = true } = {}) {
  if (!m.isGroup) {
    await m.reply(ctx.group);
    return false;
  }
  if (botAdmin && !ctx.isBotAdmin) {
    await m.reply(ctx.botAdmin);
    return false;
  }
  if (admin && !ctx.isAdmin) {
    await m.reply(ctx.admin);
    return false;
  }
  return true;
}

async function members(client, m, ctx) {
  const cached = ctx.groupMetadata && ctx.groupMetadata.participants;
  if (Array.isArray(cached) && cached.length) return cached;
  const metadata = await client.groupMetadata(m.chat);
  return metadata.participants || [];
}

async function phoneOf(client, participant) {
  if (participant.phoneNumber) return digits(participant.phoneNumber);
  if (String(participant.id).endsWith('@s.whatsapp.net')) return digits(participant.id);
  const pn = await identity.counterpart(client, identity.bare(participant.id));
  return pn ? digits(pn) : null;
}

async function protectedIds(client, ctx) {
  const ids = new Set([...identity.botIds(client), ...identity.ownerJids(ctx.DevDreaded)]);
  return identity.expand(client, ids);
}

async function findTargets(client, m, text, list) {
  const raw = new Set([...(m.mentionedJid || []), m.quoted && m.quoted.sender].filter(Boolean));
  if (!raw.size) {
    for (const number of String(text || '').match(/\d{7,15}/g) || []) raw.add(`${number}@s.whatsapp.net`);
  }
  const found = new Map();
  for (const id of raw) {
    const known = await identity.expand(client, [id]);
    const match = list.find((p) => identity.participantIds(p).some((pid) => known.has(pid)));
    if (match) found.set(match.id, match);
  }
  return [...found.values()];
}

const switchSetting = ({ command, aliases = [], description, setting, done }) => ({
  command: [command],
  aliases,
  description,
  category: 'group',
  handler: async (client, m, ctx) => {
    if (!(await check(m, ctx))) return;
    await client.groupSettingUpdate(m.chat, setting);
    await m.reply(done);
  },
});

const disappearing = (command, seconds, label) => ({
  command: [command],
  aliases: [],
  description: seconds ? `Turn on disappearing messages (${label})` : 'Turn off disappearing messages',
  category: 'group',
  handler: async (client, m, ctx) => {
    if (!(await check(m, ctx))) return;
    await client.groupToggleEphemeral(m.chat, seconds);
    await m.reply(seconds ? `Disappearing messages are now on for ${label}.` : 'Disappearing messages are now off.');
  },
});

const joinRequests = ({ command, aliases, action, past }) => ({
  command: [command],
  aliases,
  description: `${action === 'approve' ? 'Approve' : 'Reject'} all pending join requests`,
  category: 'group',
  handler: async (client, m, ctx) => {
    if (!(await check(m, ctx))) return;
    const pending = await client.groupRequestParticipantsList(m.chat);
    const jids = (pending || []).map((request) => request.jid || request.phone_number).filter(Boolean);
    if (!jids.length) return m.reply('There are no pending join requests.');

    let done = 0;
    for (let i = 0; i < jids.length; i += 50) {
      const results = await client.groupRequestParticipantsUpdate(m.chat, jids.slice(i, i + 50), action);
      done += (results || []).filter((result) => !result.status || String(result.status) === '200').length;
    }
    await m.reply(`${done} of ${jids.length} pending request(s) ${past}.`);
  },
});

const promoteOrDemote = ({ command, action, past, needsAdmin }) => ({
  command: [command],
  aliases: [],
  description: action === 'promote' ? 'Promote a member to admin' : 'Demote an admin to a normal member',
  category: 'group',
  handler: async (client, m, ctx) => {
    if (!(await check(m, ctx))) return;
    const list = await members(client, m, ctx);
    const found = await findTargets(client, m, ctx.text, list);
    const targets = found.filter((p) => Boolean(p.admin) === needsAdmin);
    if (!targets.length) {
      return m.reply(found.length ? `Nothing to do, they are ${needsAdmin ? 'not an admin' : 'already an admin'}.` : `Tag someone, reply to their message or give a number: ${ctx.prefix}${command} @user`);
    }
    const ids = targets.map((p) => p.id);
    await client.groupParticipantsUpdate(m.chat, ids, action);
    await say(client, m, `${ids.map((id) => '@' + digits(id)).join(' ')} ${past}.`, ids);
  },
});

const purge = ({ command, description, intro, matches }) => ({
  command: [command],
  aliases: [],
  description,
  category: 'group',
  handler: async (client, m, ctx) => {
    if (!(await check(m, ctx))) return;
    const list = await members(client, m, ctx);
    const skip = await protectedIds(client, ctx);

    const targets = [];
    for (const p of list) {
      if (p.admin || identity.participantIds(p).some((id) => skip.has(id))) continue;
      const phone = await phoneOf(client, p);
      if (phone && matches(phone, ctx)) targets.push(p.id);
    }
    if (!targets.length) return m.reply('No members found.');

    if (!ctx.args || ctx.args[0] !== '-x') {
      const lines = targets.map((id) => `• @${digits(id)}`).join('\n');
      return say(client, m, `${intro(ctx)}\n\nFound ${targets.length}:\n${lines}\n\nSend *${ctx.prefix}${command} -x* to remove them.`, targets);
    }

    await m.reply(`Removing ${targets.length} member(s)...`);
    for (let i = 0; i < targets.length; i += CHUNK) {
      await client.groupParticipantsUpdate(m.chat, targets.slice(i, i + CHUNK), 'remove');
      await wait(1000);
    }
    await m.reply(`Done. Removed ${targets.length} member(s).`);
  },
});

const ADD_RESULTS = {
  200: 'was added',
  401: 'has blocked the bot',
  403: 'has privacy settings that stop group adds, an invite link was sent to them',
  408: 'left the group recently, an invite link was sent to them',
  409: 'is already in the group',
};

module.exports = [
  {
    command: ['add'],
    aliases: [],
    description: 'Add a number to the group',
    category: 'group',
    handler: async (client, m, ctx) => {
      if (!(await check(m, ctx))) return;
      const numbers = [...new Set(String(ctx.text || '').split(/[,\s]+/).map(digits).filter((n) => n.length >= 7 && n.length <= 15))];
      if (!numbers.length) return m.reply(`Give the number(s) to add, for example:\n${ctx.prefix}add 254712345678`);

      const list = await members(client, m, ctx);
      const inGroup = new Set(list.flatMap((p) => identity.participantIds(p)));
      const lines = [];
      const toAdd = [];

      for (const number of numbers) {
        const jid = `${number}@s.whatsapp.net`;
        if (inGroup.has(jid)) {
          lines.push(`+${number} is already in the group`);
          continue;
        }
        const [lookup] = (await client.onWhatsApp(jid).catch(() => [])) || [];
        if (!lookup || !lookup.exists) lines.push(`+${number} is not on WhatsApp`);
        else toAdd.push(lookup.jid || jid);
      }

      if (toAdd.length) {
        const results = await client.groupParticipantsUpdate(m.chat, toAdd, 'add');
        const metadata = ctx.groupMetadata && ctx.groupMetadata.subject ? ctx.groupMetadata : await client.groupMetadata(m.chat);
        for (const result of results || []) {
          const status = Number(result.status);
          const who = `+${digits(result.jid || result.content?.attrs?.jid)}`;
          lines.push(`${who} ${ADD_RESULTS[status] || `could not be added (code ${status})`}`);
          if (status === 403 || status === 408) {
            const code = await client.groupInviteCode(m.chat).catch(() => null);
            if (code && result.jid) {
              await client.sendMessage(result.jid, { text: `${ctx.pushname} invited you to join *${metadata.subject}*:\n\nhttps://chat.whatsapp.com/${code}\n\n${ctx.botname}` }).catch(() => { });
            }
          }
        }
      }
      await m.reply(lines.join('\n'));
    },
  },

  joinRequests({ command: 'approve', aliases: ['approve-all'], action: 'approve', past: 'approved' }),
  joinRequests({ command: 'reject', aliases: ['reject-all'], action: 'reject', past: 'rejected' }),

  switchSetting({ command: 'close', aliases: ['mute'], description: 'Lock the group so only admins can send messages', setting: 'announcement', done: 'Group locked. Only admins can send messages.' }),
  switchSetting({ command: 'open', aliases: ['unmute'], description: 'Unlock the group so everyone can send messages', setting: 'not_announcement', done: 'Group unlocked. Everyone can send messages.' }),

  {
    command: ['delete'],
    aliases: ['del'],
    description: 'Delete a quoted message',
    category: 'group',
    handler: async (client, m, ctx) => {
      if (!(await check(m, ctx))) return;
      if (!m.quoted) return m.reply('Reply to the message you want to delete.');
      await client.sendMessage(m.chat, {
        delete: { remoteJid: m.chat, fromMe: Boolean(m.quoted.fromMe), id: m.quoted.id, participant: m.quoted.sender },
      });
    },
  },

  promoteOrDemote({ command: 'promote', action: 'promote', past: 'is now an admin', needsAdmin: false }),
  promoteOrDemote({ command: 'demote', action: 'demote', past: 'is no longer an admin', needsAdmin: true }),

  {
    command: ['desc'],
    aliases: ['setdesc'],
    description: 'Change the group description',
    category: 'group',
    handler: async (client, m, ctx) => {
      if (!(await check(m, ctx))) return;
      if (!ctx.text) return m.reply(`Give the new description: ${ctx.prefix}desc <text>`);
      if (ctx.text.length > 2048) return m.reply('A group description can be at most 2048 characters.');
      await client.groupUpdateDescription(m.chat, ctx.text);
      await m.reply('Group description updated.');
    },
  },

  {
    command: ['subject'],
    aliases: ['changesubject'],
    description: 'Change the group name',
    category: 'group',
    handler: async (client, m, ctx) => {
      if (!(await check(m, ctx))) return;
      if (!ctx.text) return m.reply(`Give the new name: ${ctx.prefix}subject <text>`);
      if (ctx.text.length > 100) return m.reply('A group name can be at most 100 characters.');
      await client.groupUpdateSubject(m.chat, ctx.text);
      await m.reply('Group name updated.');
    },
  },

  disappearing('disp-1', 24 * 3600, '24 hours'),
  disappearing('disp-7', 7 * 24 * 3600, '7 days'),
  disappearing('disp-90', 90 * 24 * 3600, '90 days'),
  disappearing('disp-off', 0, ''),

  purge({
    command: 'faker',
    description: 'Remove members with fake numbers',
    intro: (ctx) => `${ctx.botname} found members whose number starts with +${FAKE_CODE}.`,
    matches: (phone) => phone.startsWith(FAKE_CODE),
  }),
  purge({
    command: 'foreigners',
    description: 'Remove members with foreign country codes',
    intro: (ctx) => `Foreigners are members whose country code is not +${ctx.mycode}.`,
    matches: (phone, ctx) => !phone.startsWith(ctx.mycode),
  }),

  {
    command: ['gcprofile'],
    aliases: [],
    description: 'Show the group info and picture',
    category: 'group',
    handler: async (client, m) => {
      if (!m.isGroup) return m.reply('This command is meant for groups.');
      const info = await client.groupMetadata(m.chat);
      const owner = info.ownerPn || info.owner;
      const admins = (info.participants || []).filter((p) => p.admin).length;
      const created = info.creation
        ? new Date(info.creation * 1000).toLocaleString('en-GB', { timeZone: 'Africa/Nairobi', dateStyle: 'long', timeStyle: 'short' })
        : 'Unknown';

      const caption = [
        `*${info.subject}*`,
        '',
        `ID: ${info.id}`,
        `Owner: ${owner ? '@' + digits(owner) : 'Unknown'}`,
        `Created: ${created}`,
        `Members: ${(info.participants || []).length} (${admins} admins)`,
        `Messages: ${info.announce ? 'admins only' : 'everyone'}`,
        `Edit info: ${info.restrict ? 'admins only' : 'everyone'}`,
        info.desc ? `\nDescription:\n${info.desc}` : '',
      ].filter((line) => line !== '').join('\n');

      const mentions = owner ? [owner] : [];
      let picture = null;
      try {
        picture = await client.profilePictureUrl(m.chat, 'image');
      } catch {
        picture = null;
      }
      await client.sendMessage(m.chat, picture ? { image: { url: picture }, caption, mentions } : { text: caption, mentions }, { quoted: m });
    },
  },

  {
    command: ['hidetag'],
    aliases: ['tag'],
    description: 'Mention everyone with a hidden tag',
    category: 'group',
    handler: async (client, m, ctx) => {
      if (!(await check(m, ctx))) return;
      const list = await members(client, m, ctx);
      const text = ctx.q || (m.quoted && (m.quoted.text || m.quoted.caption)) || '📢';
      await say(client, m, text, list.map((p) => p.id));
    },
  },

  {
    command: ['tagall'],
    aliases: [],
    description: 'Mention every member of the group',
    category: 'group',
    handler: async (client, m, ctx) => {
      if (!(await check(m, ctx))) return;
      const list = await members(client, m, ctx);
      const ids = list.map((p) => p.id);
      const pages = [];
      for (let i = 0; i < ids.length; i += 250) pages.push(ids.slice(i, i + 250));

      for (let i = 0; i < pages.length; i++) {
        const header = `📣 *Tag all* (${ids.length} members)${pages.length > 1 ? ` · ${i + 1}/${pages.length}` : ''}`;
        const note = ctx.q && i === 0 ? `\n\n${ctx.q}` : '';
        const lines = pages[i].map((id) => `• @${digits(id)}`).join('\n');
        await say(client, m, `${header}${note}\n\n${lines}`, pages[i]);
        if (i < pages.length - 1) await wait(1500);
      }
    },
  },

  {
    command: ['icon'],
    aliases: [],
    description: 'Change the group profile picture',
    category: 'group',
    handler: async (client, m, ctx) => {
      if (!(await check(m, ctx))) return;
      const usage = `Reply to an image with ${ctx.prefix}${ctx.command}`;
      if (!m.quoted) return m.reply(usage);
      const mime = (m.quoted.msg || m.quoted).mimetype || m.quoted.mimetype || '';
      if (!/image/.test(mime) || /webp/.test(mime)) return m.reply(usage);
      const picture = await m.quoted.download();
      if (!picture || !picture.length) return m.reply('I could not download that image.');
      await client.updateProfilePicture(m.chat, picture);
      await m.reply('Group icon updated.');
    },
  },

  {
    command: ['leave'],
    aliases: [],
    description: 'Make the bot leave the group',
    category: 'group',
    handler: async (client, m, ctx) => {
      if (!ctx.Owner) return m.reply(ctx.NotOwner);
      if (!m.isGroup) return m.reply(ctx.group);
      await client.sendMessage(m.chat, { text: `Goodbye everyone 👋 ${ctx.botname} is leaving.` });
      await client.groupLeave(m.chat);
    },
  },

  {
    command: ['linkgroup'],
    aliases: ['link'],
    description: 'Get the group invite link',
    category: 'group',
    handler: async (client, m, ctx) => {
      if (!(await check(m, ctx, { admin: false }))) return;
      const code = await client.groupInviteCode(m.chat);
      const subject = ctx.groupMetadata && ctx.groupMetadata.subject ? ctx.groupMetadata.subject : 'this group';
      await say(client, m, `Invite link for *${subject}*:\n\nhttps://chat.whatsapp.com/${code}`);
    },
  },

  {
    command: ['revoke'],
    aliases: ['newlink', 'reset'],
    description: 'Reset the group invite link',
    category: 'group',
    handler: async (client, m, ctx) => {
      if (!(await check(m, ctx))) return;
      await client.groupRevokeInvite(m.chat);
      const code = await client.groupInviteCode(m.chat);
      const subject = ctx.groupMetadata && ctx.groupMetadata.subject ? ctx.groupMetadata.subject : 'the group';
      try {
        await client.sendMessage(m.sender, { text: `New invite link for *${subject}*:\n\nhttps://chat.whatsapp.com/${code}` });
        await m.reply('Group link reset. I sent you the new link in a private message.');
      } catch {
        await m.reply('Group link reset, but I could not message you. Use the link command to see the new one.');
      }
    },
  },

  {
    command: ['remove'],
    aliases: ['kick'],
    description: 'Remove a member from the group',
    category: 'group',
    handler: async (client, m, ctx) => {
      if (!(await check(m, ctx))) return;
      const list = await members(client, m, ctx);
      const targets = await findTargets(client, m, ctx.text, list);
      if (!targets.length) return m.reply(`Tag someone, reply to their message or give a number: ${ctx.prefix}${ctx.command} @user`);

      const skip = await protectedIds(client, ctx);
      const removable = targets.filter((p) => !identity.participantIds(p).some((id) => skip.has(id)));
      if (removable.length !== targets.length) await m.reply('I will not remove myself or the owner.');
      if (!removable.length) return;

      const ids = removable.map((p) => p.id);
      await client.groupParticipantsUpdate(m.chat, ids, 'remove');
      await say(client, m, `${ids.map((id) => '@' + digits(id)).join(' ')} removed.`, ids);
    },
  },

  {
    command: ['vcf'],
    aliases: ['group-vcf'],
    description: 'Export all group contacts as a VCF file',
    category: 'group',
    handler: async (client, m, ctx) => {
      if (!m.isGroup) return m.reply(ctx.group);
      const list = await members(client, m, ctx);
      const metadata = ctx.groupMetadata && ctx.groupMetadata.subject ? ctx.groupMetadata : await client.groupMetadata(m.chat);

      await m.reply(`Compiling ${list.length} contacts...`);

      const cards = [];
      let hidden = 0;
      for (const participant of list) {
        const phone = await phoneOf(client, participant);
        if (!phone) {
          hidden++;
          continue;
        }
        cards.push(`BEGIN:VCARD\nVERSION:3.0\nFN:[${cards.length + 1}] +${phone}\nTEL;type=CELL;type=VOICE;waid=${phone}:+${phone}\nEND:VCARD`);
      }

      if (!cards.length) return m.reply('WhatsApp is hiding the phone numbers of everyone in this group, so there is nothing to export.');

      const fileName = `${String(metadata.subject || 'group').replace(/[\\/:*?"<>|]+/g, '_').slice(0, 60)}.vcf`;
      const note = hidden ? `\n${hidden} member(s) hide their number and were skipped.` : '';
      await client.sendMessage(m.chat, {
        document: Buffer.from(cards.join('\n'), 'utf8'),
        mimetype: 'text/vcard',
        fileName,
        caption: `Contacts of *${metadata.subject}*\n${cards.length} saved.${note}`,
      }, { quoted: m });
    },
  },
];
