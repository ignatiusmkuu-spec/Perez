
const fs = require('fs');
const handler = require('../lib/handler');

function toBold(text) {
  return String(text).split('').map((c) => {
    const code = c.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(0x1d5d4 + code - 65);
    if (code >= 97 && code <= 122) return String.fromCodePoint(0x1d5ee + code - 97);
    if (code >= 48 && code <= 57) return String.fromCodePoint(0x1d7ec + code - 48);
    return c;
  }).join('');
}

function toBoldItalic(text) {
  return String(text).split('').map((c) => {
    const code = c.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(0x1d63c + code - 65);
    if (code >= 97 && code <= 122) return String.fromCodePoint(0x1d656 + code - 97);
    return c;
  }).join('');
}

const formatCmd = (name) => toBold(name.charAt(0).toUpperCase() + name.slice(1));


const CATEGORY_ORDER = ['settings', 'general', 'group', 'downloads', 'ai', 'media', 'logos', 'tools', 'fun', 'sports', 'coding', 'owner', 'prank'];

const CATEGORY_ICONS = {
  settings: '⚙️', general: '🌙', group: '👥', downloads: '📥', ai: '🤖', media: '🎆', logos: '🔥',
  tools: '🔧', fun: '🎉', sports: '⚽️', coding: '🎭', owner: '👑', prank: '☠️', misc: '📦',
};

const CATEGORY_SYMBOLS = {
  settings: '○', general: '✠', group: '✧', downloads: '✦', ai: '✫', media: '◇', logos: '✪',
  tools: '◈', fun: '❅', sports: '☆', coding: '◎', owner: '✥', prank: '✬', misc: '✠',
};

function commandsByCategory() {
  const byCategory = {};
  for (const plugin of handler.listPlugins()) {
    const category = plugin.category || 'misc';
    if (category === 'menu') continue;
    const names = Array.isArray(plugin.command) ? plugin.command : [plugin.command];
    if (!names[0]) continue;
    (byCategory[category] ||= []).push(names[0]);
  }

  const ordered = {};
  const categories = Object.keys(byCategory);
  const rank = (c) => (CATEGORY_ORDER.includes(c) ? CATEGORY_ORDER.indexOf(c) : CATEGORY_ORDER.length);
  categories.sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
  for (const category of categories) ordered[category] = byCategory[category];
  return ordered;
}

function buildMenu({ botname, greeting, pushname, prefix, uptime }) {
  const byCategory = commandsByCategory();
  const total = Object.values(byCategory).reduce((sum, names) => sum + names.length, 0);
  const line = '━━━━━━━━━━━━━━━━━━━━';

  let menu = `${greeting}\n\n`;
  menu += `╭${line}╮\n`;
  menu += `┃  ✨ ${toBold(botname)} ✨\n`;
  menu += `┃  ${toBoldItalic('A bot beyond the stars')}\n`;
  menu += `╰${line}╯\n\n`;

  menu += `┏━━『 🛰 ${toBold('SYSTEM')} 』\n`;
  menu += `┃ 👤 ${toBold('User')}  ⟫  ${pushname}\n`;
  menu += `┃ 🔑 ${toBold('Prefix')}  ⟫  [ ${prefix} ]\n`;
  menu += `┃ ⏱ ${toBold('Uptime')}  ⟫  ${uptime}\n`;
  menu += `┃ 📦 ${toBold('Commands')}  ⟫  ${total}\n`;
  menu += `┗━━━━━━━━━━━━━━━━◈\n\n`;

  for (const [category, names] of Object.entries(byCategory)) {
    const icon = CATEGORY_ICONS[category] || '📌';
    const symbol = CATEGORY_SYMBOLS[category] || '✠';
    menu += `╭─❮ ${icon} ${toBoldItalic(category.toUpperCase())} ❯─⟦ ${names.length} ⟧\n`;
    for (const name of names) menu += `│ ${symbol} ${formatCmd(name)}\n`;
    menu += `╰─────────────────◈\n\n`;
  }

  menu += `${line}\n`;
  menu += `${toBold(botname)}\n`;
  menu += `${line}`;
  return { menu, total };
}

module.exports = [
  
  {
    command: ['menu'],
    aliases: ['help'],
    description: 'Show the command list',
    category: 'menu',
    handler: async (client, m, { botname, from, getGreeting, menutype, mp3d, prefix, pushname, runtime }) => {
      const type = String(menutype || 'TEXT').toUpperCase();
      const chat = m.chat || from;
      const { menu, total } = buildMenu({
        botname,
        greeting: `HI 😁🌄, ${getGreeting()}`,
        pushname,
        prefix,
        uptime: runtime(process.uptime()),
      });
      const shortCaption = `✨ ${toBold(botname)} ✨\n\n👤 ${toBold('User')}  ⟫  ${pushname}\n🔑 ${toBold('Prefix')}  ⟫  [ ${prefix} ]\n📦 ${toBold('Commands')}  ⟫  ${total}`;

      const sendText = () => client.sendMessage(chat, { text: menu }, { quoted: m });


      try {
        if (typeof mp3d === 'function') await mp3d();
      } catch (error) {
        console.error('[menu] could not send the menu song:', error.message);
      }

      const sendMedia = async (content, shortContent) => {
        try {
          await client.sendMessage(chat, content, { quoted: m });
        } catch (error) {
          console.error('[menu] media send failed:', error.message);
          await client.sendMessage(chat, shortContent, { quoted: m });
          await sendText();
        }
      };

      try {
        if (type === 'VIDEO' && fs.existsSync('./menu.mp4')) {
          const video = fs.readFileSync('./menu.mp4');
          await sendMedia(
            { video, caption: menu, gifPlayback: true },
            { video, caption: shortCaption, gifPlayback: true }
          );
        } else if (type === 'IMAGE') {
          const image = { url: 'https://files.catbox.moe/z6k2ho.jpg' };
          await sendMedia({ image, caption: menu }, { image, caption: shortCaption });
        } else if (type === 'LINK') {
          await client.sendMessage(chat, {
            text: menu,
            contextInfo: {
              externalAdReply: {
                showAdAttribution: true,
                title: botname,
                body: runtime(process.uptime()),
                thumbnail: fs.existsSync('./Tesla.jpg') ? fs.readFileSync('./Tesla.jpg') : undefined,
                sourceUrl: 'https://wa.me/254781346242?text=Hello👋+perez+Nihostie+Bot+Mkuu+😔',
                mediaType: 1,
                renderLargerThumbnail: true,
              },
            },
          }, { quoted: m });
        } else {
          await sendText();
        }
      } catch (error) {
        console.error('[menu] send failed:', error);
        await sendText();
      }
    },
  },
];
