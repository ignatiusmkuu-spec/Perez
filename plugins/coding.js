const util = require('util');
const { c, cpp, node, python } = require('compile-run');

const LIMIT = 4000;
const clip = (value) => {
  const out = String(value);
  return out.length > LIMIT ? `${out.slice(0, LIMIT)}\n...output cut` : out;
};

const sourceOf = (m, text) => (m.quoted && m.quoted.text) || text || '';

const compiler = ({ command, label, runner }) => ({
  command: [command],
  aliases: [],
  description: `Run ${label} code`,
  category: 'coding',
  handler: async (client, m, { reply, text, prefix }) => {
    const code = sourceOf(m, text);
    if (!code) return reply(`Quote a message with ${label} code or write it after the command: ${prefix}${command} <code>`);
    try {
      const result = await runner.runSource(code);
      const out = [result.stdout, result.stderr].filter((part) => part && part.trim()).join('\n');
      await reply(out ? clip(out) : 'The code ran and printed nothing.');
    } catch (error) {
      await reply(clip((error && error.stderr) || (error && error.message) || String(error)));
    }
  },
});

module.exports = [
  {
    command: ['carbon'],
    aliases: [],
    description: 'Turn code into a styled image',
    category: 'coding',
    handler: async (client, m, { botname, text }) => {
      const code = sourceOf(m, text);
      if (!code) return m.reply('Quote a message with code or write it after the command.');
      try {
        const response = await fetch('https://carbonara.solopov.dev/api/cook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, backgroundColor: '#1F816D' }),
        });
        if (!response.ok) return m.reply('The image service did not answer, try again later.');
        const image = Buffer.from(await response.arrayBuffer());
        await client.sendMessage(m.chat, { image, caption: `𝗖𝗢𝗡𝗩𝗘𝗥𝗧𝗘𝗗 𝗕𝗬 ${botname}` }, { quoted: m });
      } catch (error) {
        await m.reply(`Could not make the image: ${error.message || error}`);
      }
    },
  },

  compiler({ command: 'compile-c', label: 'C', runner: c }),
  compiler({ command: 'compile-c++', label: 'C++', runner: cpp }),
  compiler({ command: 'compile-js', label: 'JavaScript', runner: node }),
  compiler({ command: 'compile-py', label: 'Python', runner: python }),

  {
    command: ['enc'],
    aliases: ['encrypte'],
    description: 'Obfuscate JavaScript code',
    category: 'coding',
    handler: async (client, m, { text }) => {
      const code = sourceOf(m, text);
      if (!code) return m.reply('Quote a message with JavaScript code or write it after the command.');
      try {
        const Obf = require('javascript-obfuscator');
        const result = Obf.obfuscate(code, {
          compact: true,
          controlFlowFlattening: true,
          controlFlowFlatteningThreshold: 1,
          numbersToExpressions: true,
          simplify: true,
          stringArrayShuffle: true,
          splitStrings: true,
          stringArrayThreshold: 1,
        });
        await m.reply(result.getObfuscatedCode());
      } catch (error) {
        await m.reply(`That is not valid JavaScript: ${error.message || error}`);
      }
    },
  },

  {
    command: ['eval'],
    aliases: [],
    description: 'Run JavaScript with the bot context (main owner only)',
    category: 'coding',
    handler: async (client, m, { NotOwner, MainOwner, reply, text, prefix }) => {
      if (!MainOwner) throw NotOwner;
      if (!text) return reply(`Write the code to run: ${prefix}eval <code>`);
      try {
        let run;
        try {
          run = eval(`(async () => (${text}))()`);
        } catch (syntaxError) {
          run = eval(`(async () => { ${text} })()`);
        }
        const result = await run;
        await reply(clip(typeof result === 'string' ? result : util.inspect(result)));
      } catch (error) {
        await reply(clip(String(error)));
      }
    },
  },
];
