// Settings commands.
// Commands: antibot, anticall, antidelete, antilink, antilinkall, antitag, autobio, autolike, autoread, autoview, badword, gptdm, mode, prefix, wapresence, welcome
const { getSettings, updateSetting } = require('../database/config');

module.exports = [
  // antibot (original Perez.js lines 917-927)
  {
    command: ['antibot'],
    aliases: [],
    description: 'Remove other bots that join your group (on/off)',
    category: 'settings',
    handler: async (client, m, { NotOwner, Owner, reply, text }) => {
    {
    	if(!Owner) throw NotOwner;
      const settings = await getSettings();
      const current = settings.antibot;
      if (!text) return reply(`👾 Antibot is currently *${current.toUpperCase()}*`);
      if (!["on", "off"].includes(text)) return reply("Usage: antibot on/off");
      if (text === current) return reply(`✅ Antibot is already *${text.toUpperCase()}*`);
      await updateSetting("antibot", text);
      reply(`✅ Antibot has been turned *${text.toUpperCase()}*`);
    }
    },
  },

  // anticall (original Perez.js lines 905-915)
  {
    command: ['anticall'],
    aliases: [],
    description: 'Reject incoming calls automatically (on/off)',
    category: 'settings',
    handler: async (client, m, { NotOwner, Owner, reply, text }) => {
    {
    	if(!Owner) throw NotOwner;
      const settings = await getSettings();
      const current = settings.anticall;
      if (!text) return reply(`🔰 Anticall is currently *${current.toUpperCase()}*`);
      if (!["on", "off"].includes(text)) return reply("Usage: Anticall on/off");
      if (text === current) return reply(`✅ Anticall is already *${text.toUpperCase()}*`);
      await updateSetting("anticall", text);
      reply(`✅ Anticall has been turned *${text.toUpperCase()}*`);
    }
    },
  },

  // antidelete (original Perez.js lines 771-781)
  {
    command: ['antidelete'],
    aliases: [],
    description: 'Resend messages that get deleted (on/off)',
    category: 'settings',
    handler: async (client, m, { NotOwner, Owner, reply, text }) => {
    {
    	if(!Owner) throw NotOwner;
      const settings = await getSettings();
      const current = settings.antidelete;
      if (!text) return reply(`😊 Antidelete is currently *${current.toUpperCase()}*`);
      if (!["chat", "private", "both", "on",  "off"].includes(text)) return reply("USAGE:\n\n- antidelete on - To initialize antidelete\n- Antidelete chat - To ennable on present chat\n- Antidelete private - Send notification on the bot number only\n- Antidelete off - To put off the system\n- Antidelete both - To enable on both chat and owner bot");
      if (text === current) return reply(`✅ Antidelete is already *${text.toUpperCase()}*`);
      await updateSetting("antidelete", text);
      reply(`✅ Antidelete has been turned *${text.toUpperCase()}*`);
    }
    },
  },

  // antilink (original Perez.js lines 725-735)
  {
    command: ['antilink'],
    aliases: [],
    description: 'Remove members who send group invite links (on/off)',
    category: 'settings',
    handler: async (client, m, { NotOwner, Owner, reply, text }) => {
    {
    	if(!Owner) throw NotOwner;
      const settings = await getSettings();
      const current = settings.antilink;
      if (!text) return reply(`🛡️ Antilink is currently *${current.toUpperCase()}*`);
      if (!["on", "off"].includes(text)) return reply("Usage: antilink on/off");
      if (text === current) return reply(`✅ Antilink is already *${text.toUpperCase()}*`);
      await updateSetting("antilink", text);
      reply(`✅ Antilink has been turned *${text.toUpperCase()}*`);
    }
    },
  },

  // antilinkall (original Perez.js lines 759-769)
  {
    command: ['antilinkall'],
    aliases: [],
    description: 'Remove members who send any link (on/off)',
    category: 'settings',
    handler: async (client, m, { NotOwner, Owner, reply, text }) => {
    {
    	if(!Owner) throw NotOwner;
      const settings = await getSettings();
      const current = settings.antilinkall;
      if (!text) return reply(`🛡️ Antilinkall is currently *${current.toUpperCase()}*`);
      if (!["on", "off"].includes(text)) return reply("Usage: antilinkall on/off");
      if (text === current) return reply(`✅ Antilinkall is already *${text.toUpperCase()}*`);
      await updateSetting("antilinkall", text);
      reply(`✅ Antilinkall has been turned *${text.toUpperCase()}*`);
    }
    },
  },

  // antitag (original Perez.js lines 929-939)
  {
    command: ['antitag'],
    aliases: [],
    description: 'Anti mass-tagging protection (on/off)',
    category: 'settings',
    handler: async (client, m, { NotOwner, Owner, reply, text }) => {
    {
    	if(!Owner) throw NotOwner;
      const settings = await getSettings();
      const current = settings.antitag;
      if (!text) return reply(`🤖 Antitag is currently *${current.toUpperCase()}*`);
      if (!["on", "off"].includes(text)) return reply("Usage: antitag on/off");
      if (text === current) return reply(`✅ Antitag is already *${text.toUpperCase()}*`);
      await updateSetting("antitag", text);
      reply(`✅ Antitag has been turned *${text.toUpperCase()}*`);
    }
    },
  },

  // autobio (original Perez.js lines 855-866)
  {
    command: ['autobio'],
    aliases: [],
    description: 'Update the bot bio automatically (on/off)',
    category: 'settings',
    handler: async (client, m, { NotOwner, Owner, reply, text }) => {
    {
    	if(!Owner) throw NotOwner;
      const settings = await getSettings();
      const current = settings.autobio;
      if (!text) return reply(`😇 Autobio is currently *${current.toUpperCase()}*`);
      if (!["on", "off"].includes(text)) return reply("Usage: autobio on/off");
      if (text === current) return reply(`✅ Autobio is already *${text.toUpperCase()}*`);
      await updateSetting("autobio", text);
      reply(`✅ Autobio has been turned *${text.toUpperCase()}*`);

    }
    },
  },

  // autolike (original Perez.js lines 842-853)
  {
    command: ['autolike'],
    aliases: [],
    description: 'Like statuses automatically (on/off)',
    category: 'settings',
    handler: async (client, m, { NotOwner, Owner, reply, text }) => {
    {
    	if(!Owner) throw NotOwner;
      const settings = await getSettings();
      const current = settings.autolike;
      if (!text) return reply(`🫠 Autolike is currently *${current.toUpperCase()}*`);
      if (!["on", "off"].includes(text)) return reply("Usage: autolike on/off");
      if (text === current) return reply(`✅ Autolike is already *${text.toUpperCase()}*`);
      await updateSetting("autolike", text);
      reply(`✅ Autolike has been turned *${text.toUpperCase()}*`);

    }
    },
  },

  // autoread (original Perez.js lines 795-805)
  {
    command: ['autoread'],
    aliases: [],
    description: 'Read messages automatically (on/off)',
    category: 'settings',
    handler: async (client, m, { NotOwner, Owner, reply, text }) => {
    {
    	if(!Owner) throw NotOwner;
      const settings = await getSettings();
      const current = settings.autoread;
      if (!text) return reply(`📨 Autoread is currently *${current.toUpperCase()}*`);
      if (!["on", "off"].includes(text)) return reply("Usage: autoread on/off");
      if (text === current) return reply(`✅ Autoread is already *${text.toUpperCase()}*`);
      await updateSetting("autoread", text);
      reply(`✅ Autoread has been set to *${text.toUpperCase()}*`);
    }
    },
  },

  // autoview (original Perez.js lines 868-879)
  {
    command: ['autoview'],
    aliases: [],
    description: 'View statuses automatically (on/off)',
    category: 'settings',
    handler: async (client, m, { NotOwner, Owner, reply, text }) => {
    {
    	if(!Owner) throw NotOwner;
      const settings = await getSettings();
      const current = settings.autoview;
      if (!text) return reply(`👀 Auto view status is currently *${current.toUpperCase()}*`);
      if (!["on", "off"].includes(text)) return reply("Usage: autoview on/off");
      if (text === current) return reply(`✅ Auto view status is already *${text.toUpperCase()}*`);
      await updateSetting("autoview", text);
      reply(`✅ Auto view status updated to *${text.toUpperCase()}*`);

    }
    },
  },

  // badword (original Perez.js lines 893-903)
  {
    command: ['badword'],
    aliases: [],
    description: 'Filter bad words in groups (on/off)',
    category: 'settings',
    handler: async (client, m, { NotOwner, Owner, reply, text }) => {
    {
    	if(!Owner) throw NotOwner;
      const settings = await getSettings();
      const current = settings.badword;
      if (!text) return reply(`😈 Badword is currently *${current.toUpperCase()}*`);
      if (!["on", "off"].includes(text)) return reply("Usage: badword on/off");
      if (text === current) return reply(`✅ Badword is already *${text.toUpperCase()}*`);
      await updateSetting("badword", text);
      reply(`✅ Badword has been turned *${text.toUpperCase()}*`);
    }
    },
  },

  // gptdm (original Perez.js lines 783-793)
  {
    command: ['gptdm'],
    aliases: [],
    description: 'AI auto-reply in private chats (on/off)',
    category: 'settings',
    handler: async (client, m, { NotOwner, Owner, reply, text }) => {
    {
    	if(!Owner) throw NotOwner;
      const settings = await getSettings();
      const current = settings.gptdm;
      if (!text) return reply(`🙂‍↕️ gptdm is currently *${current.toUpperCase()}*`);
      if (!["on", "off"].includes(text)) return reply("Usage: gptdm on/off");
      if (text === current) return reply(`✅ Gptdm is already *${text.toUpperCase()}*`);
      await updateSetting("gptdm", text);
      reply(`✅ Gptdm has been turned *${text.toUpperCase()}*`);
    }
    },
  },

  // mode (original Perez.js lines 807-817)
  {
    command: ['mode'],
    aliases: [],
    description: 'Switch the bot between public and private mode',
    category: 'settings',
    handler: async (client, m, { NotOwner, Owner, reply, text }) => {
    {
    	if(!Owner) throw NotOwner;
      const settings = await getSettings();
      const current = settings.mode;
      if (!text) return reply(`👥️ Mode is currently *${current.toUpperCase()}*`);
      if (!["public", "private"].includes(text)) return reply("Usage: mode public/private");
      if (text === current) return reply(`✅ Mode is already *${text.toUpperCase()}*`);
      await updateSetting("mode", text);
      reply(`✅ Mode changed to *${text.toUpperCase()}*`);
    }
    },
  },

  // prefix (original Perez.js lines 819-840)
  {
    command: ['prefix'],
    aliases: [],
    description: 'Change the command prefix',
    category: 'settings',
    handler: async (client, m, { NotOwner, Owner, args }) => {
    {
    if(!Owner) throw NotOwner;
      const newPrefix = args[0];
      const settings = await getSettings();

    if (newPrefix === 'none') {
          if (!settings.prefix) {
            return await m.reply(`✅ The bot was already prefixless.`);
          }
          await updateSetting('prefix', '');
          await m.reply(`✅ The bot is now prefixless.`);
        } else if (newPrefix) {
          if (settings.prefix === newPrefix) {
            return await m.reply(`✅ The prefix was already set to: ${newPrefix}`);
          }
          await updateSetting('prefix', newPrefix);
          await m.reply(`✅ Prefix has been updated to: ${newPrefix}`);
        } else {
          await m.reply(`👤 Prefix is currently: ${settings.prefix || 'No prefix set.'}\n\nUse _${settings.prefix || '.'}prefix none to remove the prefix.`);
        }
      }
    },
  },

  // wapresence (original Perez.js lines 881-891)
  {
    command: ['wapresence'],
    aliases: [],
    description: 'Set the bot presence: typing, recording or online',
    category: 'settings',
    handler: async (client, m, { NotOwner, Owner, reply, text }) => {
    {
           if(!Owner) throw NotOwner;
      const settings = await getSettings();
      const current = settings.wapresence;
      if (!text) return reply(`👤 Presence is currently *${current}*`);
      if (!["typing", "online", "recording"].includes(text)) return reply("Usage: wapresence typing/online/recording");
      if (text === current) return reply(`✅ Presence is already *${text}*`);
      await updateSetting("wapresence", text);
      reply(`✅ Presence updated to *${text}*`);
    }
    },
  },

  // welcome (original Perez.js lines 941-952)
  {
    command: ['welcome'],
    aliases: [],
    description: 'Welcome messages for new group members (on/off)',
    category: 'settings',
    handler: async (client, m, { NotOwner, Owner, reply, text }) => {
    {
    	if(!Owner) throw NotOwner;
      const settings = await getSettings();
      const current = settings.welcome;
      if (!text) return reply(`🕳 Welcome is currently *${current.toUpperCase()}*`);
      if (!["on", "off"].includes(text)) return reply("Usage: welcome on/off");
      if (text === current) return reply(`✅ Welcome is already *${text.toUpperCase()}*`);
      await updateSetting("welcome", text);
      reply(`✅ Welcome has been turned *${text.toUpperCase()}*`);

    }
    },
  },
];
