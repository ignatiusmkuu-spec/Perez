// Media & converters commands.
// Commands: attp, hacker2, quotely, remini, removebg, s, smeme, take, toimage, tovideo, tweet, upload, vv
const fs = require('fs');
const uploadToCatbox = require('../lib/catbox');
const uploadtoimgur = require('../lib/imgur');
const { getRandom } = require('../lib/dreadfunc');
const { UploadFileUgu } = require('../lib/dreadupload');
const { exec } = require('child_process');

module.exports = [
  // attp (original Perez.js lines 2694-2704)
  {
    command: ['attp'],
    aliases: [],
    description: 'Turn text into an animated sticker',
    category: 'media',
    handler: async (client, m, { q, reply }) => {
    if (!q) return reply('I need text;')

                    client.sendMessage(m.chat, {
                        sticker: {
                            url: `https://api.lolhuman.xyz/api/attp?apikey=cde5404984da80591a2692b6&text=${q}`
                        }
                    }, {
                        quoted: m
                    })
    },
  },

  // hacker2 (original Perez.js lines 3006-3025)
  {
    command: ['hacker2'],
    aliases: [],
    description: 'Apply a hacker effect to a quoted image',
    category: 'media',
    handler: async (client, m, { mime, qmsg }) => {
    {
           if (!/image/.test(mime)) return m.reply("Hello hacker 👋, quote an image, probably a clear image of yourself or a person.");

    let fdr = await client.downloadAndSaveMediaMessage(qmsg);

                        const fta = await uploadtoimgur(fdr);

       await  UploadFileUgu()

    const imagelink = `https://aemt.me/hacker2?link=${fta}`;

    await client.sendMessage(m.chat, { image: { url: imagelink}, caption: "Converted by 𝑵𝑬𝑿𝑼𝑺 𝑴𝑫! 🦄"}, { quoted: m});

    }
    },
  },

  // quotely (original Perez.js lines 2577-2594)
  {
    command: ['quotely'],
    aliases: [],
    description: 'Create a quote image from text',
    category: 'media',
    handler: async (client, m, { pushname, text }) => {
    {
    const axios = require("axios");

        if (!text) return m.reply("provide some text for quotely");

        const avatar = 'https://i.imgur.com/OqRfngQ.jpeg'

        const imageUrl = `https://aemt.me/quotely?avatar=${avatar}&name=${pushname}&text=${text}`;

        try {
            const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const imageBuffer = Buffer.from(response.data, 'binary');
            await client.sendImageAsSticker(m.chat, imageBuffer, m, { packname: pushname, author: "Raven" });
        } catch (error) {
            console.error('Error fetching image:', error);
        }
    }
    },
  },

  // remini (original Perez.js lines 1942-1951)
  {
    command: ['remini'],
    aliases: [],
    description: 'Enhance a quoted image',
    category: 'media',
    handler: async (client, m, { command, mime, prefix, quoted, reply }) => {
    {
    			if (!quoted) return reply(`𝗪𝗵𝗲𝗿𝗲 𝗶𝘀 𝘁𝗵𝗲 𝗶𝗺𝗮𝗴𝗲 ?`)
    			if (!/image/.test(mime)) return reply(`𝗤𝘂𝗼𝘁𝗲 𝗮𝗻 𝗶𝗺𝗮𝗴𝗲 𝘄𝗶𝘁𝗵 𝗰𝗮𝗽𝘁𝗶𝗼𝗻𝘀 ${prefix + command}`)

    			const { remini } = require('../lib/remini')
    			let media = await quoted.download()
    			let proses = await remini(media, "enhance")
    			client.sendMessage(m.chat, { image: proses, caption: '𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗲𝗱 𝗯𝘆 𝑵𝑬𝑿𝑼𝑺 𝑴𝑫'}, { quoted: m })
    			}
    },
  },

  // removebg (original Perez.js lines 2422-2449)
  {
    command: ['removebg'],
    aliases: [],
    description: 'Remove the background from an image',
    category: 'media',
    handler: async (client, m, { mime }) => {
    {
    		      try {

    const cap = "𝗘𝗱𝗶𝘁𝗲𝗱 𝗯𝘆 𝗡𝗘𝗫𝗨𝗦-𝗠𝗗";

    if (!m.quoted) return m.reply("Send the image then tag it with the command.");

       if (!/image/.test(mime)) return m.reply("That is not an image, try again while quoting an actual image.");

    let fdr = await client.downloadAndSaveMediaMessage(m.quoted)

                        let fta = await uploadtoimgur(fdr)
                        m.reply("𝗔 𝗺𝗼𝗺𝗲𝗻𝘁, 𝙋𝙀𝙍𝙀𝙕 𝗶𝘀 𝗲𝗿𝗮𝘀𝗶𝗻𝗴 𝘁𝗵𝗲 𝗯𝗮𝗰𝗸𝗴𝗿𝗼𝘂𝗻𝗱. . .");

    const image = `https://api.dreaded.site/api/removebg?imageurl=${fta}`

    await client.sendMessage(m.chat, { image: { url: image }, caption: cap}, {quoted: m });

    } catch (error) {

    m.reply("An error occured...")

    }

          }
    },
  },

  // s (original Perez.js lines 3981-4011)
  {
    command: ['s'],
    aliases: ['sticker'],
    description: 'Create a sticker from an image or short video',
    category: 'media',
    handler: async (client, m, { author, msgDreaded, packname }) => {
    {
    const { Sticker, createSticker, StickerTypes } = require('wa-sticker-formatter');

    if(!msgDreaded) { m.reply('Quote an image or a short video.') ; return } ;
    let media;
    if (msgDreaded.imageMessage) {
         media = msgDreaded.imageMessage
      } else if(msgDreaded.videoMessage) {
    media = msgDreaded.videoMessage
      }
     else {
        m.reply('That is neither an image nor a short video! '); return
      } ;

    var result = await client.downloadAndSaveMediaMessage(media);

    let stickerResult = new Sticker(result, {
                pack: packname,
                author: author,
                type: StickerTypes.FULL,
                categories: ["🤩", "🎉"],
                id: "12345",
                quality: 70,
                background: "transparent",
              });
    const Buffer = await stickerResult.toBuffer();
              client.sendMessage(m.chat, { sticker: Buffer }, { quoted: m });

    }
    },
  },

  // smeme (original Perez.js lines 2705-2722)
  {
    command: ['smeme'],
    aliases: [],
    description: 'Create a meme sticker from top|bottom text',
    category: 'media',
    handler: async (client, m, { mime, packname, qmsg, reply, text }) => {
    let atas, bawah;

    {
                    let responnd = `Quote an image or sticker with the 2 texts separated with |`
                    if (!/image/.test(mime)) return reply(responnd)
                    if (!text) return reply(responnd)

                    atas = text.split('|')[0] ? text.split('|')[0] : '-'
                    bawah = text.split('|')[1] ? text.split('|')[1] : '-'
                    let dwnld = await client.downloadAndSaveMediaMessage(qmsg)
                    let fatGans = await uploadtoimgur(dwnld)
                    let smeme = `https://api.memegen.link/images/custom/${encodeURIComponent(bawah)}/${encodeURIComponent(atas)}.png?background=${fatGans}`
                    let pop = await client.sendImageAsSticker(m.chat, smeme, m, {
                        packname: packname,

                    })
                    fs.unlinkSync(pop)
                }
    },
  },

  // take (original Perez.js lines 4052-4085)
  {
    command: ['take'],
    aliases: [],
    description: 'Change the watermark of a sticker',
    category: 'media',
    handler: async (client, m, { msgDreaded, pushname }) => {
    {
    const { Sticker, createSticker, StickerTypes } = require('wa-sticker-formatter');

    if(!msgDreaded) { m.reply('Quote an image, a short video or a sticker to change watermark.') ; return } ;

    let media;
    if (msgDreaded.imageMessage) {
         media = msgDreaded.imageMessage
      } else if(msgDreaded.videoMessage) {
    media = msgDreaded.videoMessage
      }
      else if (msgDreaded.stickerMessage) {
        media = msgDreaded.stickerMessage ;
      } else {
        m.reply('This is neither a sticker, image nor a video...'); return
      } ;

    var result = await client.downloadAndSaveMediaMessage(media);

    let stickerResult = new Sticker(result, {
                pack: pushname,
                author: pushname,
                type: StickerTypes.FULL,
                categories: ["🤩", "🎉"],
                id: "12345",
                quality: 70,
                background: "transparent",
              });
    const Buffer = await stickerResult.toBuffer();
              client.sendMessage(m.chat, { sticker: Buffer }, { quoted: m });

    }
    },
  },

  // toimage (original Perez.js lines 4538-4553)
  {
    command: ['toimage'],
    aliases: ['photo'],
    description: 'Convert a sticker to an image',
    category: 'media',
    handler: async (client, m, { command, mime, prefix, quoted }) => {
    {
        if (!quoted) throw 'Tag a static video with the command!';
        if (!/webp/.test(mime)) throw `Tag a sticker with ${prefix + command}`;

        let media = await client.downloadAndSaveMediaMessage(quoted);
        let mokaya = await getRandom('.png');
        exec(`ffmpeg -i ${media} ${mokaya}`, (err) => {
       fs.unlinkSync(media);
       if (err) throw err
       let buffer = fs.readFileSync(mokaya);
       client.sendMessage(m.chat, { image: buffer, caption: `𝗖𝗼𝗻𝘃𝗲𝗿𝘁𝗲𝗱 𝗯𝘆 𝕻𝖊𝖗𝖊𝖟-𝖒𝖉`}, { quoted: m })
       fs.unlinkSync(mokaya);
        });
        }
    },
  },

  // tovideo (original Perez.js lines 4830-4841)
  {
    command: ['tovideo'],
    aliases: ['mp4', 'tovid'],
    description: 'Convert a sticker to a video',
    category: 'media',
    handler: async (client, m, { command, mime, prefix, quoted, reply }) => {
    {

                    if (!quoted) return reply('Reply to Sticker')
                    if (!/webp/.test(mime)) return reply(`reply sticker with caption *${prefix + command}*`)

    		        let webp2mp4File = await fetch(`https://bk9.fun/converter/webpToMp4?url=${quoted}`)
                    let media = await client.downloadAndSaveMediaMessage(quoted)
                    let webpToMp4 = await webp2mp4File(media)
                    await client.sendMessage(m.chat, { video: { url: webpToMp4.result, caption: 'Convert Webp To Video' } }, { quoted: m })
                    await fs.unlinkSync(media)
                }
    },
  },

  // tweet (original Perez.js lines 2090-2107)
  {
    command: ['tweet'],
    aliases: [],
    description: 'Create a tweet image from text',
    category: 'media',
    handler: async (client, m, { pushname, text }) => {
    {
    		      if (!text) return m.reply("provide some text for the tweet");

    const displayname = pushname;
    const username = m.sender.split('@')[0];
    const avatar = await client.profilePictureUrl(m.sender, 'image').catch(_ => 'https://i.imgur.com/vuxJCTB.jpeg');
    const replies = "246";
    const retweets = "125";
    const theme = "dark";

    const imageurl = `https://some-random-api.com/canvas/misc/tweet?displayname=${encodeURIComponent(displayname)}&username=${encodeURIComponent(username)}&avatar=${encodeURIComponent(avatar)}&comment=${encodeURIComponent(text)}&replies=${encodeURIComponent(replies)}&retweets=${encodeURIComponent(retweets)}&theme=${encodeURIComponent(theme)}`;

    await client.sendMessage(m.chat, { image: { url: imageurl}, caption: `𝗖𝗼𝗻𝘃𝗲𝗿𝘁𝗲𝗱 𝗯𝘆 𝑵𝑬𝑿𝑼𝑺 𝑴𝑫 `}, { quoted: m})

    	}
    },
  },

  // upload (original Perez.js lines 2653-2693)
  {
    command: ['upload'],
    aliases: ['url'],
    description: 'Upload media and get a link',
    category: 'media',
    handler: async (client, m) => {
    {
     const fs = require("fs");
    const path = require('path');

    const util = require("util");

    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''

    if (!mime) return m.reply('Quote an image or video')

    let mediaBuffer = await q.download()

      if (mediaBuffer.length > 10 * 1024 * 1024) return m.reply('Media is too large.')

    let isTele = /image\/(png|jpe?g|gif)|video\/mp4/.test(mime)

    if (isTele) {

    let fta2 = await client.downloadAndSaveMediaMessage(q)

        let link = await uploadToCatbox(fta2)

        const fileSizeMB = (mediaBuffer.length / (1024 * 1024)).toFixed(2)

        m.reply(`Media Link:-\n\n${link}`)
      } else {
        m.reply(`Error occured...`)
      }



                }
    },
  },

  // vv (original Perez.js lines 4031-4050)
  {
    command: ['vv'],
    aliases: ['retrieve'],
    description: 'Retrieve a view-once message',
    category: 'media',
    handler: async (client, m, { botname }) => {
    {

    if (!m.quoted) return m.reply("quote a viewonce message eh")

      const quotedMessage = m.msg?.contextInfo?.quotedMessage;

        if (quotedMessage.imageMessage) {
          let imageCaption = quotedMessage.imageMessage.caption;
          let imageUrl = await client.downloadAndSaveMediaMessage(quotedMessage.imageMessage);
          client.sendMessage(m.chat, { image: { url: imageUrl }, caption: `Retrieved by ${botname}!\n${imageCaption}`}, { quoted: m });
        }

        if (quotedMessage.videoMessage) {
          let videoCaption = quotedMessage.videoMessage.caption;
          let videoUrl = await client.downloadAndSaveMediaMessage(quotedMessage.videoMessage);
          client.sendMessage(m.chat, { video: { url: videoUrl }, caption: `Retrieved by ${botname}!\n${videoCaption}`}, { quoted: m });
        }

          }
    },
  },
];
