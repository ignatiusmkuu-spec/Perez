const axios = require('axios');
const uploadToPone = require('../lib/pone');

const MAX_MB = Number(process.env.PONE_MAX_MB) || 100;
const MAX_BYTES = MAX_MB * 1024 * 1024;

const PRIVATE_HOST = /^(localhost|0\.0\.0\.0|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?$|\[?f[cd][0-9a-f]{2}:)/i;

const size = (bytes) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(2)} MB` : `${(bytes / 1024).toFixed(1)} KB`);

const safeName = (name) => String(name).replace(/[\\/:*?"<>|\r\n]+/g, '_').slice(0, 120);

async function fromUrl(link) {
  let parsed;
  try {
    parsed = new URL(link);
  } catch (error) {
    throw new Error('That is not a valid link.');
  }
  if (!/^https?:$/.test(parsed.protocol)) throw new Error('Only http and https links are supported.');
  if (PRIVATE_HOST.test(parsed.hostname)) throw new Error('That address is not allowed.');

  const response = await axios.get(link, {
    responseType: 'arraybuffer',
    timeout: 45000,
    maxContentLength: MAX_BYTES,
    maxBodyLength: MAX_BYTES,
    maxRedirects: 3,
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });

  let name = null;
  const disposition = response.headers['content-disposition'];
  const match = disposition && disposition.match(/filename\*?=(?:UTF-8'')?"?([^";\n]+)"?/i);
  if (match) name = decodeURIComponent(match[1].trim());
  if (!name) name = decodeURIComponent(parsed.pathname.split('/').pop() || '') || `upload_${Date.now()}`;

  return {
    buffer: Buffer.from(response.data),
    name: safeName(name),
    type: (response.headers['content-type'] || 'application/octet-stream').split(';')[0],
  };
}

async function fromQuoted(quoted) {
  const media = quoted.msg || quoted;
  const type = media.mimetype || 'application/octet-stream';
  if (Number(media.fileLength) > MAX_BYTES) throw new Error(`That file is larger than ${MAX_MB} MB.`);
  const buffer = await quoted.download();
  if (!buffer || !buffer.length) throw new Error('Could not download that media.');
  const extension = (type.split('/')[1] || 'bin').split(';')[0].replace('jpeg', 'jpg');
  return { buffer, name: safeName(media.fileName || `upload_${Date.now()}.${extension}`), type };
}

module.exports = [
  {
    command: ['tourl'],
    aliases: ['pone', 'tolink'],
    description: 'Upload quoted media or a file link to pone.rs and get a permanent link',
    category: 'media',
    handler: async (client, m, { text, prefix, command }) => {
      const react = (emoji) => client.sendMessage(m.chat, { react: { text: emoji, key: m.key } }).catch(() => { });
      const link = String(text || '').trim();

      if (!m.quoted && !link) {
        return m.reply(`❌ Quote a media message or send a file link.\n\nExamples:\n${prefix || '.'}${command || 'tourl'} https://example.com/image.png\n(or reply to an image, video, audio, sticker or document)`);
      }

      try {
        await react('⏳');
        const file = m.quoted && !link ? await fromQuoted(m.quoted) : await fromUrl(link);
        if (file.buffer.length > MAX_BYTES) throw new Error(`That file is larger than ${MAX_MB} MB.`);

        const hosted = await uploadToPone(file.buffer, file.name, file.type);
        await react('✅');

        await m.reply([
          '📦 *𝗙𝗶𝗹𝗲 𝗛𝗼𝘀𝘁𝗲𝗱 𝗼𝗻 𝗽𝗼𝗻𝗲.𝗿𝘀*',
          '',
          `📄 *File:* ${file.name}`,
          `📏 *Size:* ${size(file.buffer.length)}`,
          `🧾 *Type:* ${file.type}`,
          `🔗 *Link:* ${hosted}`,
          '',
          '♾️ _This link is permanent_',
        ].join('\n'));
      } catch (error) {
        await react('❌');
        let reason = error.message || 'Unknown error';
        if (error.code === 'ECONNABORTED') reason = 'The request timed out (the file may be too large).';
        else if (/maxContentLength|ERR_FR_MAX/.test(`${error.code} ${error.message}`)) reason = `That file is larger than ${MAX_MB} MB.`;
        else if (error.response && error.response.status) reason = `The source link returned HTTP ${error.response.status}.`;
        m.reply(`❌ Failed to upload to pone.rs: ${reason}`);
      }
    },
  },
];
