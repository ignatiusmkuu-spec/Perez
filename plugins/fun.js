// Fun commands.
// Commands: advice, catfact, fact, mix, pickupline, quotes
const advice = require('badadvice');
const { fetchJson } = require('../lib/dreadfunc');

module.exports = [
  // advice (original Perez.js lines 954-958)
  {
    command: ['advice'],
    aliases: [],
    description: 'Get a random piece of advice',
    category: 'fun',
    handler: async (client, m, { reply }) => {
    reply(advice());
    console.log(advice());
    },
  },

  // catfact (original Perez.js lines 2466-2481)
  {
    command: ['catfact'],
    aliases: [],
    description: 'Get a random cat fact',
    category: 'fun',
    handler: async (client, m) => {
    {
    	try {
    const data = await fetchJson('https://api.dreaded.site/api/catfact');

    const fact = data.fact;

    await m.reply(fact);

    } catch (error) {

    m.reply('Something is wrong.')

    }

        }
    },
  },

  // fact (original Perez.js lines 2451-2465)
  {
    command: ['fact'],
    aliases: [],
    description: 'Get a random fact',
    category: 'fun',
    handler: async (client, m) => {
    {
    	try {
    const data = await fetchJson('https://api.dreaded.site/api/fact');

    const fact = data.fact;

    await m.reply(fact);

    } catch (error) {

    m.reply('Something is wrong.')

    }
    	      }
    },
  },

  // mix (original Perez.js lines 4412-4456)
  {
    command: ['mix'],
    aliases: [],
    description: 'Combine two emojis',
    category: 'fun',
    handler: async (client, m, { botname, text }) => {
    {
    const { Sticker, createSticker, StickerTypes } = require('wa-sticker-formatter');

    const axios = require("axios");
    if (!text) return m.reply("No emojis provided ? ")

      const emojis = text.split('+');

      if (emojis.length !== 2) {
        m.reply("Specify the emojis and separate with '+'");
        return;
      }

      const emoji1 = emojis[0].trim();
      const emoji2 = emojis[1].trim();

      try {
        const axios = require('axios');
        const response = await axios.get(`https://levanter.onrender.com/emix?q=${emoji1}${emoji2}`);

        if (response.data.status === true) {

          let stickerMess = new Sticker(response.data.result, {
            pack: botname,
            type: StickerTypes.CROPPED,
            categories: ["🤩", "🎉"],
            id: "12345",
            quality: 70,
            background: "transparent",
          });
          const stickerBuffer2 = await stickerMess.toBuffer();
          client.sendMessage(m.chat, { sticker: stickerBuffer2 }, { quoted: m });

        } else {
          m.reply("Unable to create emoji mix.");
        }
      } catch (error) {
        m.reply("An error occurred while creating the emoji mix." + error );
      }

    	  }
    },
  },

  // pickupline (original Perez.js lines 2108-2123)
  {
    command: ['pickupline'],
    aliases: [],
    description: 'Get a random pickup line',
    category: 'fun',
    handler: async (client, m) => {
    {
    		      const API_URL = 'https://api.popcat.xyz/pickuplines';

        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Failed to fetch data');

            const { pickupline } = await response.json();
            const lineMessage = `${pickupline}`;

            await client.sendMessage(m.chat, { text: lineMessage }, { quoted: m });
        } catch (error) {
            console.error('Error fetching data:', error);
            await client.sendMessage(m.chat, { text: 'An error occurred while fetching the fact.' }, { quoted: m });
        }
    }
    },
  },

  // quotes (original Perez.js lines 2168-2184)
  {
    command: ['quotes'],
    aliases: [],
    description: 'Get a random quote',
    category: 'fun',
    handler: async (client, m) => {
    {
    		      const API_URL = 'https://favqs.com/api/qotd';

        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Failed to fetch data');

            const { quote } = await response.json();
            const quoteMessage = `${quote.body} \n\n𝗤𝘂𝗼𝘁𝗲 𝗕𝘆 ${quote.author}`;

            await client.sendMessage(m.chat, { text: quoteMessage }, { quoted: m });
        } catch (error) {
            console.error('Error fetching data:', error);
            await client.sendMessage(m.chat, { text: 'An error occurred while fetching the fact.' }, { quoted: m });
        }
    }
    },
  },
];
