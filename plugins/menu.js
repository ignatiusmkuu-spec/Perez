
const fs = require('fs');
const handler = require('../lib/handler');
const { generateWAMessageFromContent, proto } = require('@whiskeysockets/baileys');

const REPO_URL = process.env.REPO_URL || 'https://github.com/ignatiusmkuu-spec/Tesla-bot';
const REPO_BUTTON = process.env.REPO_BUTTON || 'Repository';

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

const CATEGORY_ORDER = ['settings', 'general', 'group', 'downloads', 'ai', 'media', 'logos', 'tools', 'fun', 'sports', 'coding', 'owner', 'prank'];

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

function buildMenu({ botname, greeting, pushname, prefix, uptime, dreadedspeed }) {
  const byCategory = commandsByCategory();
  const total = Object.values(byCategory).reduce((sum, names) => sum + names.length, 0);
  const line = '━━━━━━━━━━━━━━━━━━';

  let menu = `${greeting}\n\n`;
  menu += `╭${line}╮\n`;
  menu += `┃           ${toBold(botname)} \n`;
  menu += `╰${line}╯\n\n`;

  menu += `┏${line}\n`;
  menu += `┃ ▪︎▪︎▪︎ ${toBold('User')}  ■■  ${pushname}\n`;
  menu += `┃ ▪︎▪︎▪︎ ${toBold('Prefix')}  ■■  [ ${prefix} ]\n`;
  menu += `┃ ▪︎▪︎▪︎ ${toBold('Speed')}  ■■  ${(Number(dreadedspeed) || 0).toFixed(4)} 𝗠𝘀\n`;
  menu += `┃ ▪︎▪︎▪︎ ${toBold('Commands')}  ■■  ${total}\n`;
  menu += `┗${line}\n\n`;

  for (const [category, names] of Object.entries(byCategory)) {
    menu += `┌───── 「 ${toBold(category.toUpperCase())} 」 ──┈⊸\n`;
    for (const name of [...names].sort()) menu += `│ │○➛ ${name}\n`;
    menu += `└──────────────┈⊸\n\n`;
  }

  menu += `${line}\n`;
  menu += `${toBoldItalic('✨️A bot beyond the stars✨️')}\n`;
  menu += `╰${line}╯`;
  return { menu, total };
}

async function sendRepoButton(client, chat, quoted, botname) {
  try {
    const button = {
      name: 'cta_url',
      buttonParamsJson: JSON.stringify({ display_text: REPO_BUTTON, url: REPO_URL, merchant_url: REPO_URL }),
    };
    const message = generateWAMessageFromContent(chat, {
      viewOnceMessage: {
        message: {
          messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
          interactiveMessage: proto.Message.InteractiveMessage.create({
            header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: false }),
            body: proto.Message.InteractiveMessage.Body.create({ text: `${botname} source code` }),
            footer: proto.Message.InteractiveMessage.Footer.create({ text: 'A bot beyond the stars' }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({ buttons: [button] }),
          }),
        },
      },
    }, { quoted, userJid: client.user.id });
    await client.relayMessage(chat, message.message, { messageId: message.key.id });
  } catch (error) {
    console.error('[menu] repository button failed:', error.message);
  }
}

module.exports = [
  
  {
    command: ['menu'],
    aliases: ['help'],
    description: 'Show the command list',
    category: 'menu',
    handler: async (client, m, { botname, from, getGreeting, menutype, mp3d, prefix, pushname, runtime, dreadedspeed }) => {
      const type = String(menutype || 'TEXT').toUpperCase();
      const chat = m.chat || from;
      const { menu, total } = buildMenu({
        botname,
        greeting: `Hey There, ${getGreeting()}`,
        pushname,
        prefix,
        dreadedspeed,
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

      await sendRepoButton(client, chat, m, botname);
    },
  },
];
