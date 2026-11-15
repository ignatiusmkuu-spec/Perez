const axios = require('axios');
const fs = require('fs');
const { sleep } = require('../lib/dreadfunc');

const os = require('os');
const path = require('path');

const bar = (rows, labelWidth = 9, valueWidth = 25) => {
  const clip = (text, width) => {
    const chars = [...String(text).replace(/\s+/g, ' ').trim()];
    return (chars.length > width ? chars.slice(0, width - 1).join('') + '…' : chars.join('')).padEnd(width, ' ');
  };
  const line = (l, mid, r) => l + '─'.repeat(labelWidth + 2) + mid + '─'.repeat(valueWidth + 2) + r;
  const out = [line('┌', '┬', '┐')];
  rows.forEach(([label, value], index) => {
    if (label === '-') {
      out.push(line('├', '┼', '┤'));
      return;
    }
    out.push(`│ ${clip(label, labelWidth)} │ ${clip(value, valueWidth)} │`);
  });
  out.push(line('└', '┴', '┘'));
  return '```\n' + out.join('\n') + '\n```';
};

const megabytes = (bytes) => (bytes >= 1024 ** 3 ? `${(bytes / 1024 ** 3).toFixed(1)} GB` : `${Math.round(bytes / 1024 ** 2)} MB`);

const readNumber = (file) => {
  try {
    const value = fs.readFileSync(file, 'utf8').trim();
    return /^\d+$/.test(value) ? Number(value) : null;
  } catch (e) {
    return null;
  }
};

function memoryInfo() {
  const limit = readNumber('/sys/fs/cgroup/memory.max') || readNumber('/sys/fs/cgroup/memory/memory.limit_in_bytes');
  const used = readNumber('/sys/fs/cgroup/memory.current') || readNumber('/sys/fs/cgroup/memory/memory.usage_in_bytes');
  const total = os.totalmem();
  if (limit && limit < total * 4 && used) return { used, total: limit };
  return { used: total - os.freemem(), total };
}

function hostName() {
  if (process.env.DYNO) return 'Heroku';
  if (process.env.RENDER) return 'Render';
  if (process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID) return 'Railway';
  if (process.env.KOYEB_APP_NAME) return 'Koyeb';
  if (process.env.FLY_APP_NAME) return 'Fly.io';
  if (process.env.REPL_ID) return 'Replit';
  if (process.env.CODESPACES) return 'Codespaces';
  return 'Server / Panel';
}

function osName() {
  const names = { linux: 'Linux', darwin: 'macOS', win32: 'Windows', android: 'Android' };
  return `${names[os.platform()] || os.platform()} ${os.arch()}`;
}

function baileysVersion() {
  try {
    return require('@whiskeysockets/baileys/package.json').version;
  } catch (e) {
    return 'Baileys';
  }
}

function botVersion() {
  try {
    return require(path.join(__dirname, '..', 'package.json')).version;
  } catch (e) {
    return '';
  }
}

const REPO_URL = (process.env.REPO_URL || 'https://github.com/ignatiusmkuu-spec/Perez').replace(/\/+$/, '').replace(/\.git$/, '');

function ago(iso) {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 3600) return `${Math.max(1, Math.round(seconds / 60))} min ago`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours ago`;
  return `${Math.round(seconds / 86400)} days ago`;
}

module.exports = [
  {
    command: ['alive'],
    aliases: ['test'],
    description: 'Check that the bot is online and see how long it has been up',
    category: 'general',
    handler: async (client, m, { botname, pushname, runtime }) => {
      const uptime = runtime(process.uptime()).replace(/,\s*$/, '') || '𝗮 𝗳𝗲𝘄 𝘀𝗲𝗰𝗼𝗻𝗱𝘀';
      const started = new Date(Date.now() - process.uptime() * 1000).toLocaleString('en-GB', {
        timeZone: 'Africa/Nairobi',
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      const text = [
        `𝗛𝗶 ${pushname || 'there'} 👋, ${botname || 'TESLA-MD'} 𝗶𝘀 𝗮𝗹𝗶𝘃𝗲 ✅`,
        '',
        `⏱️ 𝗜'𝘃𝗲 𝗯𝗲𝗲𝗻 𝗮𝗹𝗶𝘃𝗲 𝗳𝗼𝗿: ${uptime}`,
        `🕒 𝗦𝘁𝗮𝗿𝘁𝗲𝗱: ${started} (𝗘𝗔𝗧)`,
      ].join('\n');
      await client.sendMessage(m.chat, { text }, { quoted: m });
    },
  },

  {
    command: ['anime'],
    aliases: ['random-anime'],
    description: 'Get random anime content',
    category: 'general',
    handler: async (client, m) => {
    {
    		const axios = require("axios");

      const link = "https://api.jikan.moe/v4/random/anime";

      try {
        const response = await axios.get(link);
        const data = response.data.data;

        const title = data.title;
        const synopsis = data.synopsis;
        const imageUrl = data.images.jpg.image_url;
        const episodes = data.episodes;
        const status = data.status;

        const message = `📺 Title: ${title}\n🎬 Épisodes: ${episodes}\n📡 Status: ${status}\n📝 Synopsis: ${synopsis}\n🔗 URL: ${data.url}`;

        await client.sendMessage(m.chat, { image: { url: imageUrl }, caption: message }, { quoted: m });
      } catch (error) {

       m.reply('𝗢𝗼𝗽𝘀 𝗘𝗿𝗿𝗼𝗿!');
      }

    	}
    },
  },

  {
    command: ['credits'],
    aliases: [],
    description: 'Show the bot credits',
    category: 'general',
    handler: async (client, m) => {
    client.sendMessage(m.chat, { image: { url: 'https://files.catbox.moe/k2u5ks.jpg' }, caption: `We express sincere gratitude and acknowledgement to the following:\n\n -Dika Ardnt ➪ Indonesia\n - Writing the base code using case method\nhttps://github.com/DikaArdnt\n\n -Adiwajshing ➪ India\n - Writing and Coding the bot's library (baileys)\nhttps://github.com/WhiskeySockets/Baileys\n\n -WAWebSockets Discord Server community\n-Maintaining and reverse engineering the Web Sockets\nhttps://discord.gg/WeJM5FP9GG\n\n - Nick Hunter ➪ Kenya\n - Actively compiling and debugging parts of this bot script\nhttps://github.com/HunterNick2\n\n - Fortunatus Mokaya ➪ Kenya\n - Founder of the bot Base\nhttps://github.com/Fortunatusmokaya\n\nTESLA-MD`});
    },
  },

  {
    command: ['dlt'],
    aliases: ['dil'],
    description: 'Delete a quoted message',
    category: 'general',
    handler: async (client, m) => {
    {
     if (!m.quoted) throw `No message quoted for deletion`;
     let { chat, fromMe, id, isBaileys } = m.quoted;
     if (isBaileys) throw `I cannot delete. Quoted message is my message or another bot message.`;
     client.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: true, id: m.quoted.id, participant: m.quoted.sender } });
     }
    },
  },

  {
    command: ['dp'],
    aliases: [],
    description: 'Show the profile picture of a tagged user',
    category: 'general',
    handler: async (client, m) => {
    let bar, ha, pp2, qd;

    {
     try {
     ha = m.quoted.sender;
     qd = await client.getName(ha);
     pp2 = await client.profilePictureUrl(ha,'image');
     } catch {
     pp2 = 'https://tinyurl.com/yx93l6da';
     }
      if (!m.quoted) throw `Tag a user!`;
     bar = `Profile Picture of ${qd}`;
     client.sendMessage(m.chat, { image: { url: pp2}, caption: bar, fileLength: "999999999999"}, { quoted: m});
     }
    },
  },

  {
    command: ['inbox'],
    aliases: [],
    description: 'Read messages sent to your temporary email',
    category: 'general',
    handler: async (client, m, { text }) => {
    {
    	 if (!text) return m.reply("To fetch messages from your mail, provide the email address which was issued.")

    const mail = encodeURIComponent(text);
            const checkMail = `https://tempmail.apinepdev.workers.dev/api/getmessage?email=${mail}`;

    try {
                const response = await fetch(checkMail);

    if (!response.ok) {

                    return m.reply(`${response.status} error occurred while communicating with API.`);
                }

    const data = await response.json();

                if (!data || !data.messages) {

                    return m.reply('I am unable to fetch messages from your mail, your inbox might be empty or some other error occurred.');
                }

    const messages = data.messages;

                for (const message of messages) {
                    const sender = message.sender;
                    const subject = message.subject;
                    const date = new Date(JSON.parse(message.message).date).toLocaleString();
                    const messageBody = JSON.parse(message.message).body;

                    const mailMessage = `👥 Sender: ${sender}\n📝 Subject: ${subject}\n🕜 Date: ${date}\n📩 Message: ${messageBody}`;

                    await m.reply(mailMessage);
                }
            } catch (error) {
                console.error('𝗢𝗼𝗽𝘀 𝗘𝗿𝗿𝗼𝗿!');

                return m.reply('𝗦𝗼𝗺𝗲𝘁𝗵𝗶𝗻𝗴 𝗶𝘀 𝘄𝗿𝗼𝗻𝗴!');
            }

     }
    },
  },

  {
    command: ['list'],
    aliases: ['vars'],
    description: 'List the bot config variables',
    category: 'general',
    handler: async (client, m, { reply }) => {
    let vaa = `𝟏 ignatius ➣ 𝐆𝐞𝐭 TESLA-MD 𝐜𝐨𝐧𝐭𝐚𝐜𝐭\n\n𝟐 𝐁𝐫𝐨𝐚𝐝𝐜𝐚𝐬𝐭➣ 𝐒𝐞𝐧𝐝𝐬 𝐦𝐞𝐬𝐬𝐚𝐠𝐞 𝐭𝐨 𝐚𝐥𝐥 𝐠𝐫𝐨𝐮𝐩𝐬\n\n𝟑 𝐉𝐨𝐢𝐧➣ 𝐭𝐚𝐠 𝐠𝐫𝐨𝐮𝐩 𝐥𝐢𝐧𝐤 𝐰𝐢𝐭𝐡 𝐣𝐨𝐢𝐧\n\n𝟒 𝐛𝐨𝐭𝐩𝐩➣ 𝐂𝐡𝐚𝐧𝐠𝐞 𝐛𝐨𝐭𝐬 𝐚𝐜𝐜𝐨𝐮𝐧𝐭 𝐝𝐩\n\n𝟓 𝐁𝐥𝐨𝐜𝐤➣ 𝐁𝐥𝐨𝐜𝐤 𝐭𝐡𝐞𝐦 𝐟𝐚𝐤𝐞 𝐟𝐫𝐢𝐞𝐧𝐝𝐬\n\n𝟔 𝐊𝐢𝐥𝐥➣ 𝐊𝐢𝐥𝐥𝐬 𝐠𝐫𝐨𝐮𝐩 𝐢𝐧 𝐬𝐞𝐜𝐨𝐧𝐝𝐬\n\n𝟕 𝐔𝐧𝐛𝐥𝐨𝐜𝐤➣ 𝐆𝐢𝐯𝐞 𝐭𝐡𝐞𝐦 𝐟𝐚𝐤𝐞 𝐟𝐫𝐢𝐞𝐧𝐝𝐬 𝐚 𝐬𝐞𝐜𝐨𝐧𝐝 𝐜𝐡𝐚𝐧𝐜𝐞\n\n𝟖 𝐒𝐞𝐭𝐯𝐚𝐫➣ 𝐒𝐞𝐭 𝐯𝐚𝐫𝐬 𝐢𝐧 𝐡𝐞𝐫𝐨𝐤𝐮\n\n𝟗 𝐒𝐭𝐢𝐜𝐤𝐞𝐫➣ 𝐂𝐨𝐧𝐯𝐞𝐫𝐭𝐬 𝐚 𝐩𝐡𝐨𝐭𝐨 𝐨𝐫 𝐚 𝐬𝐡𝐨𝐫𝐭 𝐯𝐢𝐝𝐞𝐨 𝐭𝐨 𝐚 𝐬𝐭𝐢𝐜𝐤𝐞𝐫\n\n𝟏𝟎 𝐓𝐨𝐢𝐦𝐠➣ 𝐂𝐨𝐧𝐯𝐞𝐫𝐭𝐬 𝐚 𝐬𝐭𝐢𝐜𝐤𝐞𝐫 𝐭𝐨 𝐚 𝐩𝐡𝐨𝐭𝐨\n\n𝟏𝟏 𝐏𝐥𝐚𝐲➣ 𝐆𝐞𝐭 𝐲𝐨𝐮𝐫 𝐟𝐚𝐯𝐨𝐫𝐢𝐭𝐞 𝐬𝐨𝐧𝐠\n\n𝟏𝟐 𝐖𝐡𝐚𝐭𝐬𝐨𝐧𝐠➣ 𝐠𝐞𝐭 𝐭𝐡𝐞 𝐭𝐢𝐭𝐥𝐞 𝐨𝐟 𝐭𝐡𝐞 𝐬𝐨𝐧𝐠\n\n𝟏𝟑 𝐘𝐭𝐬 ➣ 𝐆𝐞𝐭 𝐘𝐨𝐮𝐓𝐮𝐛𝐞 𝐯𝐢𝐝𝐞𝐨𝐬\n\n𝟏𝟒 𝐌𝐨𝐯𝐢𝐞➣ 𝐆𝐞𝐭 𝐲𝐨𝐮𝐫 𝐟𝐚𝐯𝐨𝐫𝐢𝐭𝐞 𝐦𝐨𝐯𝐢𝐞 𝐝𝐞𝐭𝐚𝐢𝐥𝐬\n\n𝟏𝟓 𝐌𝐢𝐱➣ 𝐂𝐨𝐦𝐛𝐢𝐧𝐞𝐬 +𝟐𝐞𝐦𝐨𝐣𝐢𝐬\n\n𝟏𝟔 𝐀𝐢-𝐢𝐦𝐠➣ 𝐆𝐞𝐭 𝐚𝐧 𝐀𝐢 𝐩𝐡𝐨𝐭𝐨\n\n𝟏𝟕 𝐆𝐩𝐭 ➣ 𝐇𝐞𝐫𝐞 𝐭𝐨 𝐚𝐧𝐬𝐰𝐞𝐫 𝐲𝐨𝐮𝐫 𝐪𝐮𝐞𝐬𝐭𝐢𝐨𝐧𝐬\n\n𝟏𝟖 𝐃𝐩➣ 𝐆𝐞𝐭𝐬 𝐚 𝐩𝐞𝐫𝐬𝐨𝐧 𝐝𝐩\n\n𝟏𝟗 𝐒𝐩𝐞𝐞𝐝 ➣ 𝐂𝐡𝐞𝐜𝐤𝐬 𝐛𝐨𝐭𝐬 𝐬𝐩𝐞𝐞𝐝\n\n𝟐𝟎 𝐀𝐥𝐢𝐯𝐞➣ 𝐂𝐡𝐞𝐜𝐤 𝐰𝐡𝐞𝐭𝐡𝐞𝐫 𝐭𝐡𝐞 𝐛𝐨𝐭 𝐢𝐬 𝐬𝐭𝐢𝐥𝐥 𝐤𝐢𝐜𝐤𝐢𝐧𝐠\n\n𝟐𝟏 𝐑𝐮𝐧𝐭𝐢𝐦𝐞➣ 𝐖𝐡𝐞𝐧 𝐝𝐢𝐝 𝐛𝐨𝐭 𝐬𝐭𝐚𝐫𝐭𝐞𝐝 𝐨𝐩𝐞𝐫𝐚𝐭𝐢𝐧𝐠\n\n𝟐𝟐 𝐒𝐜𝐫𝐢𝐩𝐭➣ 𝐆𝐞𝐭 𝐛𝐨𝐭 𝐬𝐜𝐫𝐢𝐩𝐭\n\n𝟐𝟑 𝐎𝐰𝐧𝐞𝐫  ➣ 𝐆𝐞𝐭 𝐨𝐰𝐧𝐞𝐫(𝐬) 𝐜𝐨𝐧𝐭𝐚𝐜𝐭\n\n𝟐𝟒 𝐕𝐚𝐫𝐬 ➣ 𝐒𝐞𝐞 𝐚𝐥𝐥 𝐯𝐚𝐫𝐢𝐚𝐛𝐥𝐞𝐬\n\n𝟐𝟓 𝐏𝐫𝐨𝐦𝐨𝐭𝐞➣ 𝐆𝐢𝐯𝐞𝐬 𝐨𝐧𝐞 𝐚𝐝𝐦𝐢𝐧 𝐫𝐨𝐥𝐞\n\n𝟐𝟔 𝐃𝐞𝐦𝐨𝐭𝐞➣ 𝐃𝐞𝐦𝐨𝐭𝐞𝐬 𝐟𝐫𝐨𝐦 𝐠𝐫𝐨𝐮𝐩 𝐚𝐝𝐦𝐢𝐧 𝐭𝐨 𝐚 𝐦𝐞𝐦𝐛𝐞𝐫\n\n𝟐𝟕 𝐃𝐞𝐥𝐞𝐭𝐞➣ 𝐃𝐞𝐥𝐞𝐭𝐞 𝐚 𝐦𝐞𝐬𝐬𝐚𝐠𝐞\n\n𝟐𝟖 𝐑𝐞𝐦𝐨𝐯𝐞/𝐤𝐢𝐜𝐤➣ 𝐊𝐢𝐜𝐤 𝐭𝐡𝐚𝐭 𝐭𝐞𝐫𝐫𝐨𝐫𝐢𝐬𝐭 𝐟𝐫𝐨𝐦 𝐚 𝐠𝐫𝐨𝐮𝐩\n\n𝟐𝟗 𝐅𝐨𝐫𝐞𝐢𝐠𝐧𝐞𝐫𝐬➣ 𝐆𝐞𝐭 𝐟𝐨𝐫𝐞𝐢𝐠𝐧 𝐧𝐮𝐦𝐛𝐞𝐫𝐬\n\n𝟑𝟎 𝐂𝐥𝐨𝐬𝐞➣ 𝐓𝐢𝐦𝐞 𝐟𝐨𝐫 𝐠𝐫𝐨𝐮𝐩 𝐦𝐞𝐦𝐛𝐞𝐫𝐬 𝐭𝐨 𝐭𝐚𝐤𝐞 𝐚 𝐛𝐫𝐞𝐚𝐤 𝐨𝐧𝐥𝐲 𝐚𝐝𝐦𝐢𝐧𝐬 𝐜𝐚𝐧 𝐜𝐡𝐚𝐭\n\n𝟑𝟏 𝐎𝐩𝐞𝐧 ➣ 𝐄𝐯𝐞𝐫𝐲𝐨𝐧𝐞 𝐜𝐚𝐧 𝐜𝐡𝐚𝐭 𝐢𝐧 𝐚 𝐠𝐫𝐨𝐮𝐩\n\n𝟑𝟐 𝐈𝐜𝐨𝐧➣ 𝐂𝐡𝐚𝐧𝐠𝐞 𝐠𝐫𝐨𝐮𝐩 𝐢𝐜𝐨𝐧\n\n𝟑𝟑 𝐒𝐮𝐛𝐣𝐞𝐜𝐭➣ 𝐂𝐡𝐚𝐧𝐠𝐞 𝐠𝐫𝐨𝐮𝐩 𝐬𝐮𝐛𝐣𝐞𝐜𝐭\n\n𝟑𝟒 𝐃𝐞𝐬𝐜➣ 𝐆𝐞𝐭 𝐠𝐫𝐨𝐮𝐩 𝐝𝐞𝐬𝐜𝐫𝐢𝐩𝐭𝐢𝐨𝐧\n\n𝟑𝟓 𝐋𝐞𝐚𝐯𝐞➣ 𝐓𝐡𝐞 𝐠𝐫𝐨𝐮𝐩 𝐢𝐬 𝐛𝐨𝐫𝐢𝐧𝐠 ,𝐭𝐢𝐦𝐞 𝐟𝐨𝐫 𝐛𝐨𝐭 𝐭𝐨 𝐥𝐞𝐚𝐯𝐞\n\n𝟑𝟔 𝐓𝐚𝐠𝐚𝐥𝐥 ➣ 𝐓𝐚𝐠 𝐞𝐯𝐞𝐫𝐲𝐨𝐧𝐞 𝐢𝐧 𝐚 𝐠𝐫𝐨𝐮𝐩 𝐜𝐡𝐚𝐭\n\n𝟑𝟕 𝐇𝐢𝐝𝐞𝐭𝐚𝐠➣ 𝐀𝐭𝐭𝐞𝐧𝐭𝐢𝐨𝐧! 𝐀𝐭𝐭𝐞𝐧𝐭𝐢𝐨𝐧! 𝐬𝐨𝐦𝐞𝐨𝐧𝐞 𝐡𝐚𝐬 𝐬𝐨𝐦𝐞𝐭𝐡𝐢𝐧𝐠 𝐭𝐨 𝐬𝐚𝐲\n\n𝟑𝟖 𝐑𝐞𝐯𝐨𝐤𝐞 ➣ 𝐑𝐞𝐬𝐞𝐭 𝐠𝐫𝐨𝐮𝐩 𝐥𝐢𝐧𝐤`
    reply(vaa)
    },
  },

  {
    command: ['mail'],
    aliases: [],
    description: 'Create a temporary email address',
    category: 'general',
    handler: async (client, m) => {
    {
    	const  { TempMail } = require("tempmail.lol");

    const tempmail = new TempMail();

          const inbox = await tempmail.createInbox();
          const emailMessage = `${inbox.address}`;

    await m.reply(emailMessage);

    const mas = await client.sendMessage(m.chat, { text: `${inbox.token}` });

    await client.sendMessage(m.chat, { text: `Quoted text is your token. To fetch messages in your email use <.inbox your-token>`}, { quoted: mas});

          }
    },
  },

  {
    command: ['news'],
    aliases: [],
    description: 'Get random tech news',
    category: 'general',
    handler: async (client, m) => {
    {
    		      const response = await fetch('https://fantox001-scrappy-api.vercel.app/technews/random');
        const data = await response.json();

        const { thumbnail, news } = data;

            await client.sendMessage(m.chat, { image: { url: thumbnail }, caption: news }, { quoted: m });

    	      }
    },
  },

  {
    command: ['pair'],
    aliases: ['rent'],
    description: 'Get a WhatsApp pairing code for a number',
    category: 'general',
    handler: async (client, m, { q, reply }) => {
    {
    if (!q) return await reply("Please provide valid Whatsapp number  Example- pair 25411428XXX");

    	try {
    const numbers = q.split(',') .map((v) => v.replace(/[^0-9]/g, ''))
                .filter((v) => v.length > 5 && v.length < 20);

       if (numbers.length === 0) {
                return m.reply("Invalid number❌️ Please use the  correct format!");
            }

    for (const number of numbers) {
                const whatsappID = number + '@s.whatsapp.net';
        const result = await client.onWhatsApp(whatsappID);

                if (!result[0]?.exists) {
                    return m.reply(`That number is not registered on WhatsApp❗️`);
    	    }

    m.reply("Wait a moment for the code")

            let { data } = await axios(`https://pair-tesla-md.onrender.com/code?number=${number}`);
            let code = data.code;

    const Code = ` ${code}`
    await sleep(5000);

     await m.reply(Code);
    	}
        } catch (error) {
            console.error(error);
            await reply("An error occurred. Please try again later.");
        }
    };
    },
  },

  {
    command: ['ping'],
    aliases: ['speed'],
    description: 'Check the bot response speed',
    category: 'general',
    handler: async (client, m, { dreadedspeed, loading }) => {
    {

    	    await loading ()
    	     m.reply (`𝗣𝗼𝗻𝗴\n ${dreadedspeed.toFixed(4)} 𝗠𝘀`);
             }
    },
  },

  {
    command: ['poll'],
    aliases: [],
    description: 'Create a poll in the chat',
    category: 'general',
    handler: async (client, m, { text }) => {
    {
    		  let [poll, opt] = text.split("|")

    if (text.split("|") < 2)
                    return m.reply(`Wrong format::\nExample:- poll who is the best president|Putin, Ruto`);

    let options = []
                for (let i of opt.split(',')) {
                    options.push(i)
                }
                await client.sendMessage(m.chat, {
                    poll: {
                        name: poll,
                        values: options
                    }

       })

    	  }
    },
  },

  {
    command: ['request'],
    aliases: ['reportbug'],
    description: 'Send a bug report or request to the owner',
    category: 'general',
    handler: async (client, m, { DevDreaded, command, prefix, text }) => {
    const owner = DevDreaded.map((v) => v.replace(/[^0-9]/g, ""));

    {

        if (!text) return m.reply(`Example : ${prefix + command} hi dev play command is not working 🐞`);

        const textt = `*| REQUEST/BUG |* 📝`;
        const teks1 = `\n\n*User* : @${m.sender.split("@")[0]} 👤\n*Request/Bug* : ${text} 🛠️`;
        const teks2 = `\n\n*Hii ${m.pushName},* Your request has been forwarded to my Owners 👑.\n*Please wait...* ⏳`;

        for (let i of owner) {
            client.sendMessage(i + "@s.whatsapp.net", {
                text: textt + teks1,
                mentions: [m.sender],
            }, {
                quoted: m,
            });
        }

        client.sendMessage(m.chat, {
            text: textt + teks2 + teks1,
            mentions: [m.sender],
        }, {
            quoted: m,
        });
    }
    },
  },

  {
    command: ['runtime'],
    aliases: [],
    description: 'Show how long the bot has been running',
    category: 'general',
    handler: async (client, m, { runtime }) => {
    let raven = `TESLA-MD 𝗵𝗮𝘀 𝗯𝗲𝗲𝗻 𝗿𝘂𝗻𝗻𝗶𝗻𝗴 𝘀𝗶𝗻𝗰𝗲 ${runtime(process.uptime())}`
                    client.sendMessage(m.chat, {
                        text: raven,
                        contextInfo: {
                            externalAdReply: {
                                showAdAttribution: true,
                                title: 'TESLA-MD',
                                body: 'https://chat.whatsapp.com/DefN96lXQ4i5iO1wDDeu2C',
                                thumbnailUrl: 'https://i.imgur.com/Uf3hdzW.jpeg',
                                sourceUrl: 'https://chat.whatsapp.com/DefN96lXQ4i5iO1wDDeu2C',
                                mediaType: 1,
                                renderLargerThumbnail: true
                            }
                        }
                    }, {
                        quoted: m
                    })
    },
  },

  {
    command: ['sc'],
    aliases: ['script', 'repo', 'source'],
    description: 'Show the bot repository link and live GitHub stats',
    category: 'general',
    handler: async (client, m, { botname }) => {
      const name = botname || 'TESLA-MD';
      const match = REPO_URL.match(/github\.com\/([^/]+)\/([^/]+)/i);
      let info = null;
      if (match) {
        try {
          const response = await axios.get(`https://api.github.com/repos/${match[1]}/${match[2]}`, {
            timeout: 8000,
            headers: { 'User-Agent': 'tesla-md-bot', Accept: 'application/vnd.github+json' },
            validateStatus: () => true,
          });
          if (response.status === 200 && response.data && response.data.full_name) info = response.data;
        } catch (e) {
          info = null;
        }
      }

      let text = `📦 *${name} 𝗦𝗰𝗿𝗶𝗽𝘁*\n`;
      if (info) {
        const rows = [
          ['Repo', info.full_name],
          ['Stars', String(info.stargazers_count)],
          ['Forks', String(info.forks_count)],
          ['Watchers', String(info.subscribers_count !== undefined ? info.subscribers_count : info.watchers_count)],
          ['Language', info.language || 'JavaScript'],
          ['Size', `${(info.size / 1024).toFixed(1)} MB`],
          ['Updated', info.pushed_at ? ago(info.pushed_at) : 'n/a'],
          ['License', (info.license && info.license.spdx_id) || 'None'],
        ];
        text += `\n${bar(rows, 9, 24)}`;
        if (info.description) text += `\n_${info.description}_\n`;
      } else {
        text += '\n_Live GitHub stats are not available right now._\n';
      }
      text += `\n🔗 *Repo:* ${REPO_URL}\n🍴 *Fork it:* ${REPO_URL}/fork\n⭐ _Star the repo if you like the bot!_`;

      await client.sendMessage(m.chat, { text }, { quoted: m });
    },
  },

  {
    command: ['system'],
    aliases: ['status', 'botinfo', 'sysinfo'],
    description: 'Show the bot system status',
    category: 'general',
    handler: async (client, m, { botname, dreadedspeed, prefix, runtime }) => {
      const handler = require('../lib/handler');
      const mem = memoryInfo();
      const heap = process.memoryUsage();
      const cpus = os.cpus() || [];
      const cpu = (cpus[0] && cpus[0].model ? cpus[0].model : 'Unknown')
        .replace(/\((R|TM)\)/gi, '')
        .replace(/\b(CPU|Processor)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
      const load = os.loadavg()[0];
      const sent = Number(m.messageTimestamp && m.messageTimestamp.low !== undefined ? m.messageTimestamp.low : m.messageTimestamp);
      const latency = Number.isFinite(sent) && sent > 0 ? Date.now() - sent * 1000 : null;
      const percent = Math.min(100, Math.round((mem.used / mem.total) * 100));
      const version = botVersion();

      const rows = [
        ['Bot', `${botname || 'TESLA-MD'}${version ? ' v' + version : ''}`],
        ['Prefix', prefix || '.'],
        ['-'],
        ['Uptime', runtime(process.uptime()).replace(/,\s*$/, '') || 'a few seconds'],
        ['Speed', `${Number(dreadedspeed || 0).toFixed(2)} ms`],
        ['Latency', latency !== null && latency >= 0 && latency < 60000 ? `${latency} ms` : 'n/a'],
        ['-'],
        ['Host', hostName()],
        ['OS', osName()],
        ['CPU', `${cpu} x${cpus.length || 1}`],
        ['Load', load.toFixed(2)],
        ['RAM', `${megabytes(mem.used)} / ${megabytes(mem.total)} (${percent}%)`],
        ['Bot RAM', `${megabytes(heap.rss)} (heap ${megabytes(heap.heapUsed)})`],
        ['-'],
        ['Node', process.version],
        ['Baileys', baileysVersion()],
        ['Commands', String(handler.listPlugins().length)],
        ['Database', process.env.DATABASE_URL ? 'PostgreSQL' : 'JSON file'],
      ];

      const eat = new Date().toLocaleString('en-GB', {
        timeZone: 'Africa/Nairobi',
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      await client.sendMessage(m.chat, {
        text: `🖥️ *${botname || 'TESLA-MD'} 𝗦𝘆𝘀𝘁𝗲𝗺 𝗦𝘁𝗮𝘁𝘂𝘀*\n\n${bar(rows)}\n_${eat} (EAT)_`,
      }, { quoted: m });
    },
  },

  {
    command: ['owner'],
    aliases: ['tesla-md', 'creator'],
    description: 'Send the bot owner contact card',
    category: 'general',
    handler: async (client, m, { DevDreaded, botname }) => {
      const numbers = [...new Set((DevDreaded || []).map((n) => String(n).replace(/[^0-9]/g, '')).filter(Boolean))];
      if (!numbers.length) return m.reply('❌ No owner number is set.');

      const label = process.env.OWNER_NAME || `${botname || 'TESLA-MD'} Owner`;
      const contacts = numbers.map((number, index) => ({
        vcard: [
          'BEGIN:VCARD',
          'VERSION:3.0',
          `FN:${numbers.length > 1 ? `${label} ${index + 1}` : label}`,
          `ORG:${botname || 'TESLA-MD'};`,
          `TEL;type=CELL;type=VOICE;waid=${number}:+${number}`,
          'END:VCARD',
        ].join('\n'),
      }));

      await client.sendMessage(m.chat, {
        contacts: { displayName: label, contacts },
      }, { quoted: m });
    },
  },

  {
    command: ['uptime'],
    aliases: ['up'],
    description: 'Show the bot uptime',
    category: 'general',
    handler: async (client, m, { runtime }) => {
    {
                     m.reply (`${runtime(process.uptime())}`)
     }
    },
  },
];
