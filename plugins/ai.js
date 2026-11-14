const fs = require('fs');
const axios = require('axios');
const { fetchJson } = require('../lib/dreadfunc');

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const TEXT_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const VISION_MODEL = process.env.GROQ_VISION_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct';

const PREFERRED = [
  'llama-3.3-70b-versatile',
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'llama-3.1-8b-instant',
  'qwen/qwen3-32b',
  'moonshotai/kimi-k2-instruct-0905',
];
const NOT_CHAT = /whisper|orpheus|guard|safeguard|compound|tts|embed/i;
let available = null;

function groqKey() {
  const key = process.env.GROQ_KEY || process.env.GROQ_API_KEY;
  if (!key) throw new Error('GROQ_KEY is not set');
  return key.trim();
}

async function listModels() {
  if (available) return available;
  const response = await axios.get(GROQ_URL.replace('/chat/completions', '/models'), {
    headers: { Authorization: `Bearer ${groqKey()}` },
    timeout: 30000,
    validateStatus: () => true,
  });
  const ids = response.status === 200 && response.data && Array.isArray(response.data.data)
    ? response.data.data.map((item) => item.id)
    : [];
  available = ids;
  return ids;
}

async function post(messages, model) {
  return axios.post(
    GROQ_URL,
    { model, messages, temperature: 0.7, max_completion_tokens: 1500 },
    {
      headers: { Authorization: `Bearer ${groqKey()}`, 'Content-Type': 'application/json' },
      timeout: 60000,
      validateStatus: () => true,
    }
  );
}

const modelMissing = (response) => {
  const error = response.data && response.data.error;
  return response.status === 404 || (error && /model_not_found|does not exist|do not have access/i.test(`${error.code} ${error.message}`));
};

async function groq(messages, model, vision) {
  let response = await post(messages, model);
  if (modelMissing(response)) {
    const ids = await listModels();
    const usable = ids.filter((id) => !NOT_CHAT.test(id));
    const pick = vision
      ? usable.find((id) => /llama-4|vision|vl\b|scout|maverick/i.test(id))
      : PREFERRED.find((id) => id !== model && usable.includes(id)) || usable.find((id) => id !== model);
    if (!pick) {
      throw new Error(`Model ${model} is not available to this key. Models on this key: ${ids.join(', ') || 'none found'}`);
    }
    response = await post(messages, pick);
  }
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
        }], VISION_MODEL, true);
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

  chatCommand('gemini', 'Chat with AI', 'Provide your query.', TEXT_MODEL),
  chatCommand('gpt', 'Chat with GPT', "Hello there, what's your question?", TEXT_MODEL),
  chatCommand('gpt2', 'Chat with GPT 2', "Hello there, what's your question?", 'openai/gpt-oss-120b'),
  chatCommand('gpt3', 'Chat with GPT 3', "Hello there, what's your question?", 'openai/gpt-oss-20b'),
  chatCommand('nexus', 'Chat with Nexus AI', "Hello, I'm Nexus. How can I help?", TEXT_MODEL, NEXUS),
  chatCommand('velma', 'Chat with Velma AI', "Hello I'm Velma AI. How can I help you?", 'llama-3.1-8b-instant', VELMA),
];
