// Coding commands.
// Commands: carbon, compile-c, compile-c++, compile-js, compile-py, enc, eval
const { c, cpp, node, python } = require('compile-run');

module.exports = [
  // carbon (original Perez.js lines 2008-2040)
  {
    command: ['carbon'],
    aliases: [],
    description: 'Turn code into a styled image',
    category: 'coding',
    handler: async (client, m, { botname }) => {
    {
    		      const fetch = require('node-fetch');

      let cap = `𝗖𝗢𝗡𝗩𝗘𝗥𝗧𝗘𝗗 𝗕𝗬 ${botname}`;

      if (m.quoted && m.quoted.text) {
        const forq = m.quoted.text;

        try {
          let response = await fetch('https://carbonara.solopov.dev/api/cook', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              code: forq,
              backgroundColor: '#1F816D',
            }),
          });

          if (!response.ok) return m.reply('API failed to fetch a valid response.')

          let per = await response.buffer();

          await client.sendMessage(m.chat, { image: per, caption: cap }, { quoted: m });
        } catch (error) {
          m.reply("An error occured\n" + error)
        }
      } else {
        m.reply('Quote a code message');
      }
    }
    },
  },

  // compile-c (original Perez.js lines 2723-2738)
  {
    command: ['compile-c'],
    aliases: [],
    description: 'Compile and run C code',
    category: 'coding',
    handler: async (client, m, { reply, text }) => {
    if (!text && !m.quoted) throw 'Quote/tag a C code to compile';

    const sourcecode3 =m.quoted ? m.quoted.text ? m.quoted.text : text ? text : m.text : m.text
    let resultPromise3 = c.runSource(sourcecode3);
    resultPromise3
        .then(resultt3 => {
            console.log(resultt3);
    reply(resultt3.stdout);
    reply(resultt3.stderr);    })
        .catch(err => {
            console.log((err && err.stderr || String(err)));
    reply((err && err.stderr || String(err)))
        });
    },
  },

  // compile-c++ (original Perez.js lines 2740-2756)
  {
    command: ['compile-c++'],
    aliases: [],
    description: 'Compile and run C++ code',
    category: 'coding',
    handler: async (client, m, { reply, text }) => {
    if (!text && !m.quoted) throw 'Quote/tag a C++ code to compile';

    const sourcecode4 = m.quoted ? m.quoted.text ? m.quoted.text : text ? text : m.text : m.text
    let resultPromise4 = cpp.runSource(sourcecode4);
    resultPromise4
        .then(resultt4 => {
            console.log(resultt4);
    reply(resultt4.stdout);
    reply(resultt4.stderr);
        })
        .catch(err => {
            console.log((err && err.stderr || String(err)));
    reply((err && err.stderr || String(err)))
        });
    },
  },

  // compile-js (original Perez.js lines 2556-2575)
  {
    command: ['compile-js'],
    aliases: [],
    description: 'Run JavaScript code',
    category: 'coding',
    handler: async (client, m, { reply, text }) => {
    if (!text && !m.quoted) throw 'Quote/tag a Js code to compile.';

    const sourcecode1 = m.quoted ? m.quoted.text ? m.quoted.text : text ? text : m.text : m.text;

    let resultPromise1 = node.runSource(sourcecode1);
    resultPromise1
        .then(resultt1 => {
            console.log(resultt1);
    reply(resultt1.stdout);
    reply(resultt1.stderr);
        })
        .catch(err => {
            console.log((err && err.stderr || String(err)));
    reply((err && err.stderr || String(err)));
        });
    },
  },

  // compile-py (original Perez.js lines 2248-2267)
  {
    command: ['compile-py'],
    aliases: [],
    description: 'Run Python code',
    category: 'coding',
    handler: async (client, m, { reply, text }) => {
    if (!text && !m.quoted) throw 'Quote/tag a python code to compile.';

    const sourcecode = m.quoted ? m.quoted.text ? m.quoted.text : text ? text : m.text : m.text

    let resultPromise = python.runSource(sourcecode);
    resultPromise
        .then(resultt => {
            console.log(resultt);

    reply(resultt.stdout);
    reply(resultt.stderr);
        })
        .catch(err => {
            console.log((err && err.stderr || String(err)));
    reply((err && err.stderr || String(err)))
        });
    },
  },

  // enc (original Perez.js lines 4758-4783)
  {
    command: ['enc'],
    aliases: ['encrypte'],
    description: 'Obfuscate JavaScript code',
    category: 'coding',
    handler: async (client, m) => {
    {
    		      const Obf = require("javascript-obfuscator");

        // Check if the quoted message has text
        if (m.quoted && m.quoted.text) {
            const forq = m.quoted.text;

            // Obfuscate the JavaScript code
            const obfuscationResult = Obf.obfuscate(forq, {
                compact: true,
                controlFlowFlattening: true,
                controlFlowFlatteningThreshold: 1,
                numbersToExpressions: true,
                simplify: true,
                stringArrayShuffle: true,
                splitStrings: true,
                stringArrayThreshold: 1
            });

            console.log("Successfully encrypted the code");
            m.reply(obfuscationResult.getObfuscatedCode());
        } else {
            m.reply("Quote/Tag a valid JavaScript code to encrypt!");
        }
    }
    },
  },

  // eval (original Perez.js lines 2757-2769)
  {
    command: ['eval'],
    aliases: [],
    description: 'Evaluate JavaScript with the bot context (owner only)',
    category: 'coding',
    handler: async (client, m, { NotOwner, Owner, budy, reply, text }) => {
    {
       if (!Owner) throw NotOwner;
    if (!text) throw 'Provide a valid Bot Baileys Function to evaluate'
       try {
     let evaled = await eval(budy.slice(2));
     if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);
     await reply(evaled);
       } catch (err) {
     await reply(String(err));
       }
     }
    },
  },
];
