const fs = require('fs');
const axios = require('axios');
const { fetchJson } = require('../lib/dreadfunc');

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const TEXT_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const VISION_MODEL = process.env.GROQ_VISION_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct';

async function groq(messages, model) {
  const key = process.env.GROQ_KEY || process.env.GROQ_API_KEY;
  if (!key) throw new Error('GROQ_KEY is not set');
  const response = await axios.post(
    GROQ_URL,
    { model, messages, temperature: 0.7, max_completion_tokens: 1500 },
    {
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      timeout: 60000,
      validateStatus: () => true,
    }
  );
  if (response.status === 401) throw new Error('Groq rejected the API key');
  if (response.status === 429) throw new Error('Groq rate limit reached, try again in a moment');
  if (response.status < 200 || response.status >= 300) {
    const detail = response.data && response.data.error && response.data.error.message;
    throw new Error(detail || `Groq returned HTTP ${response.status}`);
  }
  const content = response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message && response.data.choices[0].message.content;
  if (!content) throw new Error('Groq returned an empty answer');
  return content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
}

function chatCommand(command, description, greeting, model, persona) {
  return {
    command: [command],
    aliases: [],
    description,
    category: 'ai',
    handler: async (client, m, { text }) => {
      if (!text) return m.reply(greeting);
      try {
        const messages = [];
        if (persona) messages.push({ role: 'system', content: persona });
        messages.push({ role: 'user', content: text });
        await m.reply(await groq(messages, model));
      } catch (error) {
        m.reply('I am unable to generate responses right now\n\n' + (error.message || error));
      }
    },
  };
}

function visionCommand(command, description) {
  return {
    command: [command],
    aliases: [],
    description,
    category: 'ai',
    handler: async (client, m, { mime, text }) => {
      let file;
      try {
        if (!m.quoted) return m.reply('Quote an image with the instructions.');
        if (!text) return m.reply('Provide some instructions for the image.');
        if (!/image/.test(mime)) return m.reply('That is not an image, quote an actual image.');
        m.reply('A moment, I am analysing the image...');
        file = await client.downloadAndSaveMediaMessage(m.quoted);
        const base64 = fs.readFileSync(file).toString('base64');
        const type = /png/.test(mime) ? 'image/png' : /webp/.test(mime) ? 'image/webp' : 'image/jpeg';
        const answer = await groq([{
          role: 'user',
          content: [
            { type: 'text', text },
            { type: 'image_url', image_url: { url: `data:${type};base64,${base64}` } },
          ],
        }], VISION_MODEL);
        await m.reply(answer);
      } catch (error) {
        m.reply('I am unable to analyze images at the moment\n' + (error.message || error));
      } finally {
        if (file) fs.promises.unlink(file).catch(() => { });
      }
    },
  };
}

const NEXUS = 'You are Nexus, a sharp and friendly assistant inside a WhatsApp bot. Keep answers clear and concise.';
const VELMA = 'You are Velma, a warm, witty assistant inside a WhatsApp bot. Keep answers short and helpful.';

module.exports = [
  visionCommand('ai', 'Analyze a quoted image with AI'),
  visionCommand('ai2', 'Analyze a quoted image with AI'),
  visionCommand('ai3', 'Analyze a quoted image with AI'),

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

  chatCommand('gemini', 'Chat with AI', 'Provide your query.', TEXT_MODEL),
  chatCommand('gpt', 'Chat with GPT', "Hello there, what's your question?", TEXT_MODEL),
  chatCommand('gpt2', 'Chat with GPT 2', "Hello there, what's your question?", 'openai/gpt-oss-120b'),
  chatCommand('gpt3', 'Chat with GPT 3', "Hello there, what's your question?", 'openai/gpt-oss-20b'),
  chatCommand('nexus', 'Chat with Nexus AI', "Hello, I'm Nexus. How can I help?", TEXT_MODEL, NEXUS),
  chatCommand('velma', 'Chat with Velma AI', "Hello I'm Velma AI. How can I help you?", 'llama-3.1-8b-instant', VELMA),
];
