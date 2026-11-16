const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const uploadToCatbox = require('../lib/catbox');
const REMOVEBG_KEY = process.env.REMOVEBG_KEY || 'qrRRJAy3mMM77UEWtUkqrjC6';
const { createSticker, textSticker, isAnimatedWebp, animatedWebpToMp4, runFfmpeg, tempFile } = require('../lib/sticker');

const CAPTION = '𝗖𝗼𝗻𝘃𝗲𝗿𝘁𝗲𝗱 𝗯𝘆 𝗧𝗘𝗦𝗟𝗔-𝗠𝗗';

const remove = (...files) => files.forEach((file) => file && fs.promises.unlink(file).catch(() => { }));

const failure = (error) => (error && error.message) || String(error);

module.exports = [
  {
    command: ['attp'],
    aliases: [],
    description: 'Turn text into an animated sticker',
    category: 'media',
    handler: async (client, m, { author, packname, q }) => {
      if (!q) return m.reply('I need text;');
      try {
        const sticker = await textSticker(q, { pack: packname, author });
        await client.sendMessage(m.chat, { sticker }, { quoted: m });
      } catch (error) {
        m.reply('Failed to create the text sticker: ' + failure(error));
      }
    },
  },

  {
    command: ['hacker2'],
    aliases: ['hackerr'],
    description: 'Apply a green hacker-terminal effect to a quoted image',
    category: 'media',
    handler: async (client, m, { mime, qmsg }) => {
      if (!/image/.test(mime)) return m.reply('Hello hacker 👋, quote an image, probably a clear image of yourself or a person.');
      let input;
      const output = tempFile('jpg');
      try {
        input = await client.downloadAndSaveMediaMessage(qmsg);
        await runFfmpeg([
          '-y', '-i', input,
          '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2,format=rgb24,colorchannelmixer=rr=0:rg=0:rb=0:gr=0.45:gg=0.9:gb=0.2:br=0:bg=0:bb=0,eq=contrast=1.5:brightness=-0.08,drawgrid=w=iw:h=3:t=1:c=black@0.4,noise=alls=16:allf=t+u',
          '-frames:v', '1', '-q:v', '3', output,
        ]);
        await client.sendMessage(m.chat, { image: fs.readFileSync(output), caption: CAPTION + '! 🦄' }, { quoted: m });
      } catch (error) {
        m.reply('Failed to apply the effect: ' + failure(error));
      } finally {
        remove(input, output);
      }
    },
  },

  {
    command: ['quotely'],
    aliases: [],
    description: 'Create a quote sticker from text',
    category: 'media',
    handler: async (client, m, { author, packname, pushname, text }) => {
      if (!text) return m.reply('provide some text for quotely');
      try {
        const avatar = await client.profilePictureUrl(m.sender, 'image').catch(() => 'https://i.imgur.com/OqRfngQ.jpeg');
        const response = await axios.post('https://bot.lyo.su/quote/generate', {
          type: 'quote',
          format: 'webp',
          backgroundColor: '#1b1429',
          width: 512,
          height: 768,
          scale: 2,
          messages: [{
            entities: [],
            avatar: true,
            from: { id: 1, name: pushname || 'TESLA-MD', photo: { url: avatar } },
            text,
            replyMessage: {},
          }],
        }, { timeout: 30000 });
        const image = response.data && response.data.result && response.data.result.image;
        if (!image) throw new Error('the quote service returned no image');
        const sticker = await createSticker(Buffer.from(image, 'base64'), { mime: 'image/webp', pack: packname || pushname, author });
        await client.sendMessage(m.chat, { sticker }, { quoted: m });
      } catch (error) {
        m.reply('Failed to create the quote: ' + failure(error));
      }
    },
  },

  {
    command: ['remini'],
    aliases: ['hd'],
    description: 'Enhance a quoted image',
    category: 'media',
    handler: async (client, m, { command, mime, prefix, quoted, reply }) => {
      if (!quoted) return reply('𝗪𝗵𝗲𝗿𝗲 𝗶𝘀 𝘁𝗵𝗲 𝗶𝗺𝗮𝗴𝗲 ?');
      if (!/image/.test(mime)) return reply(`𝗤𝘂𝗼𝘁𝗲 𝗮𝗻 𝗶𝗺𝗮𝗴𝗲 𝘄𝗶𝘁𝗵 𝗰𝗮𝗽𝘁𝗶𝗼𝗻𝘀 ${prefix + command}`);
      try {
        const { remini } = require('../lib/remini');
        const media = await quoted.download();
        const enhanced = await remini(media, 'enhance');
        await client.sendMessage(m.chat, { image: enhanced, caption: '𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗲𝗱 𝗯𝘆 𝗧𝗘𝗦𝗟𝗔-𝗠𝗗' }, { quoted: m });
      } catch (error) {
        reply('Failed to enhance the image. The enhancer service may be down, try again later.');
      }
    },
  },

  {
    command: ['removebg'],
    aliases: ['rmbg'],
    description: 'Remove the background from an image',
    category: 'media',
    handler: async (client, m, { mime }) => {
      if (!m.quoted) return m.reply('Send the image then tag it with the command.');
      if (!/image/.test(mime)) return m.reply('That is not an image, try again while quoting an actual image.');
      let file;
      try {
        file = await client.downloadAndSaveMediaMessage(m.quoted);
        m.reply('𝗔 𝗺𝗼𝗺𝗲𝗻𝘁, 𝗧𝗘𝗦𝗟𝗔-𝗠𝗗 𝗶𝘀 𝗲𝗿𝗮𝘀𝗶𝗻𝗴 𝘁𝗵𝗲 𝗯𝗮𝗰𝗸𝗴𝗿𝗼𝘂𝗻𝗱. . .');
        let image;
        if (REMOVEBG_KEY) {
          const form = new FormData();
          form.append('image_file', fs.createReadStream(file));
          form.append('size', 'auto');
          const response = await axios.post('https://api.remove.bg/v1.0/removebg', form, {
            headers: { ...form.getHeaders(), 'X-Api-Key': REMOVEBG_KEY.trim() },
            responseType: 'arraybuffer',
            timeout: 60000,
            validateStatus: () => true,
          });
          if (response.status !== 200) {
            const detail = (() => {
              try {
                return JSON.parse(Buffer.from(response.data).toString()).errors[0].title;
              } catch (e) {
                return `HTTP ${response.status}`;
              }
            })();
            throw new Error(`remove.bg: ${detail}`);
          }
          image = Buffer.from(response.data);
        } else {
          const link = await uploadToCatbox(file);
          image = { url: `https://api.dreaded.site/api/removebg?imageurl=${link}` };
        }
        await client.sendMessage(m.chat, { image, caption: '𝗘𝗱𝗶𝘁𝗲𝗱 𝗯𝘆 𝗧𝗘𝗦𝗟𝗔-𝗠𝗗' }, { quoted: m });
      } catch (error) {
        m.reply('An error occured... ' + failure(error));
      } finally {
        remove(file);
      }
    },
  },

  {
    command: ['sticker'],
    aliases: ['s'],
    description: 'Create a sticker from an image or short video (add "crop" to fill the square)',
    category: 'media',
    handler: async (client, m, { author, msgDreaded, packname, text }) => {
      if (!msgDreaded) return m.reply('Quote an image or a short video.');
      const node = msgDreaded.imageMessage || msgDreaded.videoMessage;
      if (!node) return m.reply('That is neither an image nor a short video!');
      let file;
      try {
        file = await client.downloadAndSaveMediaMessage(node);
        const sticker = await createSticker(fs.readFileSync(file), {
          mime: node.mimetype || (msgDreaded.videoMessage ? 'video/mp4' : 'image/jpeg'),
          pack: packname,
          author,
          type: /crop/i.test(text || '') ? 'crop' : 'full',
          emojis: ['🤩', '🎉'],
        });
        await client.sendMessage(m.chat, { sticker }, { quoted: m });
      } catch (error) {
        m.reply('Failed to create the sticker: ' + failure(error));
      } finally {
        remove(file);
      }
    },
  },

  {
    command: ['smeme'],
    aliases: ['write'],
    description: 'Create a meme sticker from top|bottom text',
    category: 'media',
    handler: async (client, m, { author, mime, packname, qmsg, reply, text }) => {
      const usage = 'Quote an image or sticker with the 2 texts separated with |';
      if (!/image/.test(mime)) return reply(usage);
      if (!text) return reply(usage);
      const [top, bottom] = text.split('|').map((part) => part.trim());
      let file;
      try {
        file = await client.downloadAndSaveMediaMessage(qmsg);
        const link = await uploadToCatbox(file);
        const url = `https://api.memegen.link/images/custom/${encodeURIComponent(top || '_')}/${encodeURIComponent(bottom || '_')}.png?background=${encodeURIComponent(link)}`;
        const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000 });
        const sticker = await createSticker(Buffer.from(response.data), { mime: 'image/png', pack: packname, author });
        await client.sendMessage(m.chat, { sticker }, { quoted: m });
      } catch (error) {
        reply('Failed to create the meme sticker: ' + failure(error));
      } finally {
        remove(file);
      }
    },
  },

  {
    command: ['take'],
    aliases: ['steal'],
    description: 'Change the watermark of a sticker (take pack|author)',
    category: 'media',
    handler: async (client, m, { msgDreaded, pushname, text }) => {
      if (!msgDreaded) return m.reply('Quote an image, a short video or a sticker to change watermark.');
      const node = msgDreaded.imageMessage || msgDreaded.videoMessage || msgDreaded.stickerMessage;
      if (!node) return m.reply('This is neither a sticker, image nor a video...');
      const [pack, author] = String(text || '').split('|').map((part) => part.trim());
      let file;
      try {
        file = await client.downloadAndSaveMediaMessage(node);
        const sticker = await createSticker(fs.readFileSync(file), {
          mime: node.mimetype || (msgDreaded.stickerMessage ? 'image/webp' : msgDreaded.videoMessage ? 'video/mp4' : 'image/jpeg'),
          pack: pack || pushname,
          author: author || pack || pushname,
          emojis: ['🤩', '🎉'],
        });
        await client.sendMessage(m.chat, { sticker }, { quoted: m });
      } catch (error) {
        m.reply('Failed to change the watermark: ' + failure(error));
      } finally {
        remove(file);
      }
    },
  },

  {
    command: ['toimage'],
    aliases: ['photo', 'toimg'],
    description: 'Convert a sticker to an image',
    category: 'media',
    handler: async (client, m, { command, mime, prefix, quoted }) => {
      if (!quoted) return m.reply('Tag a static sticker with the command!');
      if (!/webp/.test(mime)) return m.reply(`Tag a sticker with ${prefix + command}`);
      let input;
      const output = tempFile('png');
      try {
        input = await client.downloadAndSaveMediaMessage(quoted);
        if (isAnimatedWebp(fs.readFileSync(input))) return m.reply('That sticker is animated, use *' + prefix + 'tovideo* instead.');
        await runFfmpeg(['-y', '-i', input, '-frames:v', '1', output]);
        await client.sendMessage(m.chat, { image: fs.readFileSync(output), caption: CAPTION }, { quoted: m });
      } catch (error) {
        m.reply('Failed to convert the sticker: ' + failure(error));
      } finally {
        remove(input, output);
      }
    },
  },

  {
    command: ['tovideo'],
    aliases: ['mp4', 'tovid'],
    description: 'Convert a sticker to a video',
    category: 'media',
    handler: async (client, m, { command, mime, prefix, quoted, reply }) => {
      if (!quoted) return reply('Reply to Sticker');
      if (!/webp/.test(mime)) return reply(`reply sticker with caption *${prefix + command}*`);
      let input;
      const output = tempFile('mp4');
      try {
        input = await client.downloadAndSaveMediaMessage(quoted);
        if (isAnimatedWebp(fs.readFileSync(input))) {
          const video = await animatedWebpToMp4(fs.readFileSync(input));
          await client.sendMessage(m.chat, { video, caption: CAPTION, gifPlayback: true }, { quoted: m });
        } else {
          await runFfmpeg(['-y', '-loop', '1', '-i', input, '-t', '3', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2,format=yuv420p', '-movflags', '+faststart', output]);
          await client.sendMessage(m.chat, { video: fs.readFileSync(output), caption: CAPTION }, { quoted: m });
        }
      } catch (error) {
        reply('Failed to convert the sticker to a video: ' + failure(error));
      } finally {
        remove(input, output);
      }
    },
  },

  {
    command: ['tweet'],
    aliases: [],
    description: 'Create a tweet image from text',
    category: 'media',
    handler: async (client, m, { pushname, text }) => {
      if (!text) return m.reply('provide some text for the tweet');

      const displayname = pushname;
      const username = m.sender.split('@')[0];
      const avatar = await client.profilePictureUrl(m.sender, 'image').catch(() => 'https://i.imgur.com/vuxJCTB.jpeg');
      const replies = '246';
      const retweets = '125';
      const theme = 'dark';

      const imageurl = `https://some-random-api.com/canvas/misc/tweet?displayname=${encodeURIComponent(displayname)}&username=${encodeURIComponent(username)}&avatar=${encodeURIComponent(avatar)}&comment=${encodeURIComponent(text)}&replies=${encodeURIComponent(replies)}&retweets=${encodeURIComponent(retweets)}&theme=${encodeURIComponent(theme)}`;

      await client.sendMessage(m.chat, { image: { url: imageurl }, caption: CAPTION }, { quoted: m });
    },
  },

  {
    command: ['upload'],
    aliases: ['url'],
    description: 'Upload media and get a link',
    category: 'media',
    handler: async (client, m) => {
      const q = m.quoted ? m.quoted : m;
      const mime = (q.msg || q).mimetype || '';
      if (!mime) return m.reply('Quote an image or video');
      if (!/image|video|audio|webp/.test(mime)) return m.reply('That type of media cannot be uploaded.');
      let file;
      try {
        file = await client.downloadAndSaveMediaMessage(q);
        if (fs.statSync(file).size > 10 * 1024 * 1024) return m.reply('Media is too large.');
        const link = await uploadToCatbox(file);
        await m.reply(`Media Link:-\n\n${link}`);
      } catch (error) {
        m.reply('Error occured... ' + failure(error));
      } finally {
        remove(file);
      }
    },
  },

  {
    command: ['vv'],
    aliases: ['retrieve'],
    description: 'Retrieve a view-once message',
    category: 'media',
    handler: async (client, m, { botname }) => {
      if (!m.quoted) return m.reply('quote a viewonce message eh');

      const quotedMessage = m.msg && m.msg.contextInfo && m.msg.contextInfo.quotedMessage;
      if (!quotedMessage) return m.reply('I could not read that message.');

      const kind = quotedMessage.imageMessage ? 'image' : quotedMessage.videoMessage ? 'video' : null;
      if (!kind) return m.reply('That is not a view-once image or video.');
      const node = quotedMessage[kind + 'Message'];
      let file;
      try {
        file = await client.downloadAndSaveMediaMessage(node);
        await client.sendMessage(m.chat, { [kind]: fs.readFileSync(file), caption: `Retrieved by ${botname}!\n${node.caption || ''}` }, { quoted: m });
      } catch (error) {
        m.reply('Failed to retrieve the message: ' + failure(error));
      } finally {
        remove(file);
      }
    },
  },
];
