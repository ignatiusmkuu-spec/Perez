// AI commands.
// Commands: ai, ai2, ai3, dalle, darkgpt, gemini, gpt, gpt2, gpt3, nexus, velma
const uploadToCatbox = require('../lib/catbox');
const { fetchJson } = require('../lib/dreadfunc');

module.exports = [
  // ai (original Perez.js lines 1800-1848)
  {
    command: ['ai'],
    aliases: [],
    description: 'Chat with AI',
    category: 'ai',
    handler: async (client, m, { botname, mime, text }) => {
    {
    			      const {
        GoogleGenerativeAI: _0x817910
      } = require("@google/generative-ai");
      const _0xc0423b = require("axios");

      try {
        if (!m.quoted) {
          return m.reply("𝗤𝘂𝗼𝘁𝗲 𝗮𝗻 𝗶𝗺𝗮𝗴𝗲 𝘄𝗶𝘁𝗵 𝘁𝗵𝗲 𝗶𝗻𝘀𝘁𝗿𝘂𝗰𝘁𝗶𝗼𝗻𝘀 𝗲𝗵!");
        }
        if (!text) {
          return m.reply(`𝗣𝗿𝗼𝘃𝗶𝗱𝗲 𝘀𝗼𝗺𝗲 𝗶𝗻𝘀𝘁𝗿𝘂𝗰𝘁𝗶𝗼𝗻𝘀 𝗲𝗵! 𝗧𝗵𝗶𝘀 𝗶𝘀 ${botname} 𝗔𝗶, 𝘂𝘀𝗶𝗻𝗴 𝗴𝗲𝗺𝗶𝗻𝗶-𝗽𝗿𝗼-𝘃𝗶𝘀𝗶𝗼𝗻 𝘁𝗼 𝗮𝗻𝗮𝗹𝘆𝘀𝗲 𝗶𝗺𝗮𝗴𝗲𝘀.`);
        }
        if (!/image/.test(mime)) {
          return m.reply("𝗛𝘂𝗵 𝘁𝗵𝗶𝘀 𝗶𝘀 𝗻𝗼𝘁 𝗮𝗻 𝗶𝗺𝗮𝗴𝗲! 𝗣𝗹𝗲𝗮𝘀𝗲 𝗧𝗮𝗴 𝗮𝗻 𝗶𝗺𝗮𝗴𝗲 𝘄𝗶𝘁𝗵 𝘁𝗵𝗲 𝗶𝗻𝘀𝘁𝗿𝘂𝗰𝘁𝗶𝗼𝗻𝘀 𝗲𝗵 !");
        }
        let _0x3439a2 = await client.downloadAndSaveMediaMessage(m.quoted);
        let _0x3dfb7c = await uploadToCatbox(_0x3439a2);
        m.reply("𝗔 𝗺𝗼𝗺𝗲𝘁, 𝗹𝗲𝗺𝗺𝗲 𝗮𝗻𝗮𝗹𝘆𝘀𝗲 𝘁𝗵𝗲 𝗰𝗼𝗻𝘁𝗲𝗻𝘁𝘀 𝗼𝗳 𝘁𝗵𝗲 𝗜𝗺𝗮𝗴𝗲...");
        const _0x4e9e6a = new _0x817910("AIzaSyDJUtskTG-MvQdlT4tNE319zBqLMFei8nQ");
        async function _0x309a3c(_0x1400ed, _0x1a081e) {
          const _0x53e4b2 = {
            responseType: "arraybuffer"
          };
          const _0x1175d9 = await _0xc0423b.get(_0x1400ed, _0x53e4b2);
          const _0x2a4862 = Buffer.from(_0x1175d9.data).toString("base64");
          const _0x2f6e31 = {
            data: _0x2a4862,
            mimeType: _0x1a081e
          };
          const _0x14b65d = {
            inlineData: _0x2f6e31
          };
          return _0x14b65d;
        }
        const _0x22a6bb = {
          model: "gemini-2.5-flash"
        };
        const _0x42849d = _0x4e9e6a.getGenerativeModel(_0x22a6bb);
        const _0x2c743f = [await _0x309a3c(_0x3dfb7c, "image/jpeg")];
        const _0xcf53e3 = await _0x42849d.generateContent([text, ..._0x2c743f]);
        const _0x195f9c = await _0xcf53e3.response;
        const _0x3db5a3 = _0x195f9c.text();
        await m.reply(_0x3db5a3);
      } catch (_0x4b3921) {
        m.reply("I am unable to analyze images at the moment\n" + _0x4b3921);
      }
    }
    },
  },

  // ai2 (original Perez.js lines 1849-1883)
  {
    command: ['ai2'],
    aliases: [],
    description: 'Analyze a quoted image with AI',
    category: 'ai',
    handler: async (client, m, { mime, text }) => {
    {
    		const axios = require("axios");

    try {

    if (!m.quoted) return m.reply("Send the image then tag it with the instruction.");

    if (!text) return m.reply("𝗣𝗿𝗼𝘃𝗶𝗱𝗲 𝘀𝗼𝗺𝗲 𝗶𝗻𝘀𝘁𝗿𝘂𝗰𝘁𝗶𝗼𝗻𝘀 𝗲𝗵! 𝗧𝗵𝗶𝘀 Raven AI 𝗨𝘀𝗲 𝗚𝗲𝗺𝗶𝗻𝗶-𝗽𝗿𝗼-𝘃𝗶𝘀𝗶𝗼𝗻 𝘁𝗼 𝗮𝗻𝗮𝗹𝘆𝘀𝗲 𝗶𝗺𝗮𝗴𝗲𝘀.");

       if (!/image/.test(mime)) return m.reply("That is not an image, try again while quoting an actual image.");

    let fdr = await client.downloadAndSaveMediaMessage(m.quoted)

                        let fta = await uploadToCatbox(fdr)
                        m.reply("𝗔 𝗠𝗼𝗺𝗲𝗻𝘁, [𝗡𝗘𝗫𝗨𝗦 𝗠𝗗-𝗔𝗜] 𝗶𝘀 𝗮𝗻𝗮𝗹𝘆𝘇𝗶𝗻𝗴 𝘁𝗵𝗲 𝗰𝗼𝗻𝘁𝗲𝗻𝘁𝘀 𝗼𝗳 𝘁𝗵𝗲 𝗶𝗺𝗮𝗴𝗲. . .");

    const data = await fetchJson(`https://api.dreaded.site/api/gemini-vision?url=${fta}&instruction=${text}`);

    let res = data.result

    await m.reply(res);

    } catch (e) {

    m.reply("I am unable to analyze images at the moment\n" + e)

    }
    	      }
    },
  },

  // ai3 (original Perez.js lines 1912-1941)
  {
    command: ['ai3'],
    aliases: [],
    description: 'Chat with AI',
    category: 'ai',
    handler: async (client, m, { msgDreaded, text }) => {
    {
    		      if (!msgDreaded || !text) {
        m.reply("𝗤𝘂𝗼𝘁𝗲 𝗮𝗻 𝗶𝗺𝗮𝗴𝗲 𝗮𝗻𝗱 𝗴𝗶𝘃𝗲 𝘀𝗼𝗺𝗲 𝗶𝗻𝘀𝘁𝗿𝘂𝗰𝘁𝗶𝗼𝗻𝘀 𝗲𝗵. 𝗜'𝗺 𝑵𝑬𝑿𝑼𝑺 𝑴𝑫 𝗔𝗶, 𝗶 𝘂𝘀𝗲 𝗕𝗮𝗿𝗱 𝘁𝗼 𝗮𝗻𝗮𝗹𝘆𝘇𝗲 𝗶𝗺𝗮𝗴𝗲𝘀.");
        return;
      }
      ;
      let _0x44b3e0;
      if (msgDreaded.imageMessage) {
        _0x44b3e0 = msgDreaded.imageMessage;
      } else {
        m.reply("𝗛𝘂𝗵, 𝗧𝗵𝗮𝘁'𝘀 𝗻𝗼𝘁 𝗮𝗻 𝗶𝗺𝗮𝗴𝗲, 𝗦𝗲𝗻𝗱 𝗮𝗻 𝗶𝗺𝗮𝗴𝗲 𝘁𝗵𝗲𝗻 𝘁𝗮𝗴 𝗶𝘁 𝘄𝗶𝘁𝗵 𝘁𝗵𝗲 𝗶𝗻𝘀𝘁𝗿𝘂𝗰𝘁𝗶𝗼𝗻𝘀 !");
        return;
      }
      ;
      try {
        let _0x11f50e = await client.downloadAndSaveMediaMessage(_0x44b3e0);
        let _0x45392d = await uploadToCatbox(_0x11f50e);
        m.reply("𝗔 𝗺𝗼𝗺𝗲𝗻𝘁, 𝗟𝗲𝗺𝗺𝗲 𝗮𝗻𝗮𝗹𝘆𝘇𝗲 𝘁𝗵𝗲 𝗰𝗼𝗻𝘁𝗲𝗻𝘁𝘀 𝗼𝗳 𝘁𝗵𝗲 𝗶𝗺𝗮𝗴𝗲. . .");
        let _0x4f137e = await (await fetch("https://api.bk9.dev/ai/geminiimg?url=" + _0x45392d + "&q=" + text)).json();
        const _0x4bfd63 = {
          text: _0x4f137e.BK9
        };
        await client.sendMessage(m.chat, _0x4bfd63, {
          quoted: m
        });
      } catch (_0x1be711) {
        m.reply("An error occured\n" + _0x1be711);
      }
    }
    },
  },

  // dalle (original Perez.js lines 1783-1799)
  {
    command: ['dalle'],
    aliases: ['createimage'],
    description: 'Generate an image from text',
    category: 'ai',
    handler: async (client, m, { command, prefix, text }) => {
    {
      if (!text) return m.reply(`*This command generates images from text prompts*\n\n*𝙴xample usage*\n*${prefix + command} Beautiful anime girl*\n*${prefix + command} girl in pink dress*`);
      try {
      	m.reply('Please wait, i am generating your image...')
        const endpoint = `https://cute-tan-gorilla-yoke.cyclic.app/imagine?text=${encodeURIComponent(text)}`
        const response = await fetch(endpoint)
        if (response.ok) {
          const imageBuffer = await response.buffer()
          await client.sendMessage(m.chat, { image: imageBuffer }, {quoted: m})
        } else {
          throw '*Aarrhhhg Image generation failed*';
        }
      } catch {
        m.reply('Oops! Something went wrong while generating your image. Please try again later.')
      }
    		      }
    },
  },

  // darkgpt (original Perez.js lines 2323-2340)
  {
    command: ['darkgpt'],
    aliases: [],
    description: 'Chat with DarkGPT',
    category: 'ai',
    handler: async (client, m, { reply, text }) => {
    {

    if (!text) { return m.reply("Hey there Fuckface😈, I'm Darkgpt, I respond to anything be it harmful, I'm a pure Evil👿, What sort of dark and delightful nonsense do you want to dive into Today😈 ?");
    	   }
    	try {
         const data = await fetchJson(`https://api.dreaded.site/api/makgpt?text=${text}`);

        if (data && data.result) {
    	    const res = data.result;
    	    await m.reply(res);
        } else {
    	    m.reply("Huh I'm failing to get response☠️💀.");
        }
    	} catch (error) {
    reply('An error occured while communicating with the APIs\n' + error);
    }
      }
    },
  },

  // gemini (original Perez.js lines 4682-4700)
  {
    command: ['gemini'],
    aliases: [],
    description: 'Chat with Google Gemini',
    category: 'ai',
    handler: async (client, m, { text }) => {
    {

        try {
            if (!text) return m.reply("This is Raven, an AI using Gemini APIs to process text, provide yr query");

            const { default: Gemini } = await import('gemini-ai');

            const gemini = new Gemini("AIzaSyDJUtskTG-MvQdlT4tNE319zBqLMFei8nQ");
            const chat = gemini.createChat();

            const res = await chat.ask(text);

            await m.reply(res);
        } catch (e) {
            m.reply("I am unable to generate responses\n\n" + e);
        }
    }
    },
  },

  // gpt (original Perez.js lines 2041-2055)
  {
    command: ['gpt'],
    aliases: [],
    description: 'Chat with GPT',
    category: 'ai',
    handler: async (client, m, { reply, text }) => {
    {
            if (!text) return reply(`Hello there, what's your question?`);
              let d = await fetchJson(
                `https://api.bk9.dev/ai/jeeves-chat2?q=${text}`
              );
              if (!d.BK9) {
                return reply(
                  "An error occurred while fetching the AI chatbot response. Please try again later."
                );
              } else {
                reply(d.BK9);
              }
    		     }
    },
  },

  // gpt2 (original Perez.js lines 1637-1651)
  {
    command: ['gpt2'],
    aliases: [],
    description: 'Chat with GPT (v2)',
    category: 'ai',
    handler: async (client, m, { reply, text }) => {
    {
            if (!text) return reply(`What's your question ?`);
              let d = await fetchJson(
                `https://api.bk9.dev/ai/jeeves-chat?q=${text}`
              );
              if (!d.BK9) {
                return reply(
                  "An error occurred while fetching the AI chatbot response. Please try again later."
                );
              } else {
                reply(d.BK9);
              }
          }
    },
  },

  // gpt3 (original Perez.js lines 4785-4798)
  {
    command: ['gpt3'],
    aliases: [],
    description: 'Chat with GPT (v3)',
    category: 'ai',
    handler: async (client, m, { reply, text }) => {
    {
            if (!text) return reply(`Hello there, How can i help you?`);
              let d = await fetchJson(
                `https://api.bk9.dev/ai/blackbox?q=${text}`
              );
              if (!d.BK9) {
                return reply(
                  "An error occurred while fetching the AI chatbot response. Please try again later."
                );
              } else {
                reply(d.BK9);
              }
    	}
    },
  },

  // nexus (original Perez.js lines 2500-2514)
  {
    command: ['nexus'],
    aliases: [],
    description: 'Chat with Nexus AI',
    category: 'ai',
    handler: async (client, m, { reply, text }) => {
    {
            if (!text) return reply(`Hello there, what's your question?`);
              let d = await fetchJson(
                `https://api.bk9.dev/ai/jeeves-chat2?q=${text}`
              );
              if (!d.BK9) {
                return reply(
                  "An error occurred while fetching the AI chatbot response. Please try again later."
                );
              } else {
                reply(d.BK9);
              }
    		     }
    },
  },

  // velma (original Perez.js lines 1622-1636)
  {
    command: ['velma'],
    aliases: [],
    description: 'Chat with Velma AI',
    category: 'ai',
    handler: async (client, m, { reply, text }) => {
    {
            if (!text) return reply(`Hello I'm velma AI. How can i help u?`);
              let d = await fetchJson(
                `https://api.bk9.dev/ai/llama?q=${text}`
              );
              if (!d.BK9) {
                return reply(
                  "An error occurred while fetching the AI chatbot response. Please try again later."
                );
              } else {
                reply(d.BK9);
              }
          }
    },
  },
];
