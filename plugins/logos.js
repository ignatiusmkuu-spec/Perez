
module.exports = [
  {
    command: ['1917'],
    aliases: [],
    description: 'Generate a 1917 style text logo',
    category: 'logos',
    handler: async (client, m, { prefix, text }) => {
    {
    		     var mumaker = require("mumaker");
    		      if (!text || text == "") {
          m.reply("Example Usage : " + prefix + "1917 perez");
          return;
        }
    	try {
        var _0x14192 = await mumaker.ephoto("https://en.ephoto360.com/1917-style-text-effect-523.html", text);
        m.reply("Wait a moment...");
        await client.sendMessage(m.chat, {
          image: {
            url: _0x14192.image
          },
          caption: `ᘜᗴᑎᗴᖇᗩTᗴᗪ ᗷY ᑎᗴ᙭ᑌՏ ᗰᗪ`
        }, {
          quoted: m
        });
      } catch (_0x24de3dl) {
        m.reply(_0x24de3dl);
      }
    }
    },
  },

  {
    command: ['arena'],
    aliases: [],
    description: 'Generate a arena style text logo',
    category: 'logos',
    handler: async (client, m, { prefix, text }) => {
    {
    		     var mumaker = require("mumaker");
    		      if (!text || text == "") {
          m.reply("Example Usage : " + prefix + "arena  ᑎᗴ᙭ᑌՏ ᗰᗪ");
          return;
        }
    	try {
        var _0x14192d = await mumaker.ephoto("https://en.ephoto360.com/create-cover-arena-of-valor-by-mastering-360.html", text);
        m.reply("Wait a moment...");
        await client.sendMessage(m.chat, {
          image: {
            url: _0x14192d.image
          },
          caption: `ᘜᗴᑎᗴᖇᗩTᗴᗪ ᗷY ᑎᗴ᙭ᑌՏ ᗰᗪ`
        }, {
          quoted: m
        });
      } catch (_0x24de3d) {
        m.reply(_0x24de3d);
      }
    }
    },
  },

  {
    command: ['cat'],
    aliases: [],
    description: 'Generate a cat style text logo',
    category: 'logos',
    handler: async (client, m, { prefix, text }) => {
    {
    		   var mumaker = require("mumaker");
    		  if (!text || text == "") { m.reply("Example usage : * " + prefix + "cat Nick");
        return;
      }
      try {
        let nick = await mumaker.ephoto("https://en.ephoto360.com/handwritten-text-on-foggy-glass-online-680.html", text);
        m.reply("*Wait a moment...*");
        await client.sendMessage(m.chat, {
          image: {
            url: nick.image
          },
          caption: `ᘜᗴᑎᗴᖇᗩTᗴᗪ ᗷY ᑎᗴ᙭ᑌՏ ᗰᗪ`
        }, {
          quoted: m
        });
      } catch (_0x27e2e5) {
        m.reply("🥵🥵 " + _0x27e2e5);
      }
        }
    },
  },

  {
    command: ['child'],
    aliases: [],
    description: 'Generate a child style text logo',
    category: 'logos',
    handler: async (client, m, { prefix, text }) => {
    {
    	    var mumaker = require("mumaker");

    		      if (!text || text == "") {
        m.reply("Example usage: " + prefix + "Child Raven");
        return;
      }
      try {

      var tumba = await mumaker.ephoto("https://en.ephoto360.com/write-text-on-wet-glass-online-589.html", text);
    m.reply("*Wait a moment...*");
        await client.sendMessage(m.chat, {
          image: {
            url: tumba.image
          },
          caption: `ᘜᗴᑎᗴᖇᗩTᗴᗪ ᗷY ᑎᗴ᙭ᑌՏ ᗰᗪ`
        }, {
          quoted: m
        });
      } catch(_0x29ddf) {
        m.reply("💀💀" + _0x29ddf);
      }
    	    }
    },
  },

  {
    command: ['devil'],
    aliases: [],
    description: 'Generate a devil style text logo',
    category: 'logos',
    handler: async (client, m, { prefix, text }) => {
    {
    		      var mumaker = require("mumaker");
    		          if (!text || text == "") {
          m.reply("Example Usage : " + prefix + "Devil Nick");
          return;
        }
         try {
        var _0x9a96e = await mumaker.ephoto("https://en.ephoto360.com/neon-devil-wings-text-effect-online-683.html", text);
        m.reply("*Wait a moment...*");
        await client.sendMessage(m.chat, {
          image: {
            url: _0x9a96e.image
          },
          caption: `ᘜᗴᑎᗴᖇᗩTᗴᗪ ᗷY ᑎᗴ᙭ᑌՏ ᗰᗪ`
        });
      } catch (_0x80d03) {
        m.reply(_0x80d03);
      }
    }
    },
  },

  {
    command: ['dragonball'],
    aliases: [],
    description: 'Generate a dragonball style text logo',
    category: 'logos',
    handler: async (client, m, { prefix, text }) => {
    {
    	var mumaker = require("mumaker");
        if (!text || text == "") {
          m.reply("Example usage :  " + prefix + "dragonball perez");
          return;
        }
          try {
        const _0x26f3ed = await mumaker.ephoto("https://en.ephoto360.com/create-dragon-ball-style-text-effects-online-809.html", text);
         m.reply("*Wait a moment...*")
        await client.sendMessage(m.chat, {
          image: {
            url: _0x26f3ed.image
          },
          caption: `ᘜᗴᑎᗴᖇᗩTᗴᗪ ᗷY ᑎᗴ᙭ᑌՏ ᗰᗪ`
        }, {
          quoted: m
        });
      } catch (_0x553773) {
        m.reply("🥵🥵 " + _0x553773);
      }
    }
    },
  },

  {
    command: ['gold'],
    aliases: [],
    description: 'Generate a gold style text logo',
    category: 'logos',
    handler: async (client, m, { prefix, text }) => {
    {
    	    var mumaker = require("mumaker");

    		      if (!text || text == "") {
        m.reply("Example usage: " + prefix + "Gold myself");
        return;
      }
      try {

      var hunter = await mumaker.ephoto("https://en.ephoto360.com/modern-gold-4-213.html", text);
    m.reply("*Wait a moment...*");
        await client.sendMessage(m.chat, {
          image: {
            url: hunter.image
          },
          caption: `ᘜᗴᑎᗴᖇᗩTᗴᗪ ᗷY ᑎᗴ᙭ᑌՏ ᗰᗪ`
        }, {
          quoted: m
        });
      } catch(_0x29ddf9) {
        m.reply("💀💀" + _0x29ddf9);
      }
    }
    },
  },

  {
    command: ['graffiti'],
    aliases: [],
    description: 'Generate a graffiti style text logo',
    category: 'logos',
    handler: async (client, m, { prefix, text }) => {
    {
    		    var mumaker = require("mumaker");
    		      if (!text || text == "") {
        m.reply("Example usage : " + prefix + "graffiti Nick");
        return;
      }
      try {
        let _0x57ef84 = await mumaker.ephoto("https://en.ephoto360.com/create-a-cartoon-style-graffiti-text-effect-online-668.html", text);
        m.reply("*Wait a moment...*");
        await client.sendMessage(m.chat, {
          image: {
            url: _0x57ef84.image
          },
          caption: `ᘜᗴᑎᗴᖇᗩTᗴᗪ ᗷY ᑎᗴ᙭ᑌՏ ᗰᗪ`
        }, {
          quoted: m
        });
      } catch (_0x27e2e5) {
        m.reply("🥵🥵 " + _0x27e2e5);
      }
    }
    },
  },

  {
    command: ['hacker'],
    aliases: [],
    description: 'Generate a hacker style text logo',
    category: 'logos',
    handler: async (client, m, { prefix, text }) => {
    {
    		      var mumaker = require("mumaker");
    		      if (!text || text == "") {
        m.reply("Example usage :  " + prefix + "hacker Perez");
        return;
      }
      try {
        let _0x4086bb = await mumaker.ephoto("https://en.ephoto360.com/create-anonymous-hacker-avatars-cyan-neon-677.html", text);
        m.reply("*Wait a moment...*");
        await client.sendMessage(m.chat, {
          image: {
            url: _0x4086bb.image
          },
          caption: `ᘜᗴᑎᗴᖇᗩTᗴᗪ ᗷY ᑎᗴ᙭ᑌՏ ᗰᗪ`
        }, {
          quoted: m
        });
      } catch (_0x503c5f) {
        m.reply("🥵🥵 " + _0x503c5f);
      }
    }
    },
  },

  {
    command: ['ice'],
    aliases: [],
    description: 'Generate a ice style text logo',
    category: 'logos',
    handler: async (client, m, { prefix, text }) => {
    {
    		      var mumaker = require("mumaker");
    		     if (!text || text == "") {
          m.reply("Example Usage : " + prefix + "Ice Nick");
          return;
        }
         try {
        var _0x295 = await mumaker.ephoto("https://en.ephoto360.com/ice-text-effect-online-101.html", text);
        m.reply("*Wait a moment...*");
        await client.sendMessage(m.chat, {
          image: {
            url: _0x295.image
          },
          caption: `ᘜᗴᑎᗴᖇᗩTᗴᗪ ᗷY ᑎᗴ᙭ᑌՏ ᗰᗪ`
        });
      } catch (_0x180d) {
        m.reply(_0x180d);
      }
    }
    },
  },

  {
    command: ['impressive'],
    aliases: [],
    description: 'Generate a impressive style text logo',
    category: 'logos',
    handler: async (client, m, { prefix, text }) => {
    {
    		      var mumaker = require("mumaker");
    		     if (!text || text == "") {
          m.reply("Example Usage : " + prefix + "impressive Nick");
          return;
        }
         try {
        var _0x29a96em5 = await mumaker.ephoto("https://en.ephoto360.com/create-3d-colorful-paint-text-effect-online-801.html", text);
        m.reply("*Wait a moment...*");
        await client.sendMessage(m.chat, {
          image: {
            url: _0x29a96em5.image
          },
          caption: `ᘜᗴᑎᗴᖇᗩTᗴᗪ ᗷY ᑎᗴ᙭ᑌՏ ᗰᗪ`
        });
      } catch (_0x18d034) {
        m.reply(_0x18d034);
      }
    }
    },
  },

  {
    command: ['leaves'],
    aliases: [],
    description: 'Generate a leaves style text logo',
    category: 'logos',
    handler: async (client, m, { prefix, text }) => {
    {
    		     var mumaker = require("mumaker");
    		      if (!text || text == "") {
          m.reply("Example Usage : " + prefix + "Leaves 𝗡𝗘𝗫𝗨𝗦-𝗠𝗗");
          return;
        }
    	try {
        var _0x14192dl = await mumaker.ephoto("https://en.ephoto360.com/green-brush-text-effect-typography-maker-online-153.html", text);
        m.reply("Wait a moment...");
        await client.sendMessage(m.chat, {
          image: {
            url: _0x14192dl.image
          },
          caption: `ᘜᗴᑎᗴᖇᗩTᗴᗪ ᗷY ᑎᗴ᙭ᑌՏ ᗰᗪ `
        }, {
          quoted: m
        });
      } catch (_0x24de3) {
        m.reply(_0x24de3);
      }
    }
    },
  },

  {
    command: ['light'],
    aliases: [],
    description: 'Generate a light style text logo',
    category: 'logos',
    handler: async (client, m, { prefix, text }) => {
    {
    		      var mumaker = require("mumaker");

    		      if (!text || text == "") {
        m.reply("Example usage: " + prefix + "Light myself");
        return;
      }
      try {

      var hunteqr = await mumaker.ephoto("https://en.ephoto360.com/light-text-effect-futuristic-technology-style-648.html", text);
    m.reply("*Wait a moment...*");
        await client.sendMessage(m.chat, {
          image: {
            url: hunteqr.image
          },
          caption: `GENERATED BY 𝑵𝑬𝑿𝑼𝑺 𝑴𝑫`
        }, {
          quoted: m
        });
      } catch(_0x29ddf4) {
        m.reply("💀💀" + _0x29ddf4);
      }
    }
    },
  },

  {
    command: ['matrix'],
    aliases: [],
    description: 'Generate a matrix style text logo',
    category: 'logos',
    handler: async (client, m, { prefix, text }) => {
    {
    		      var mumaker = require("mumaker");

    		      if (!text || text == "") {
        m.reply("Example usage: " + prefix + "Matrix myself");
        return;
      }
      try {

      var hunteer = await mumaker.ephoto("https://en.ephoto360.com/matrix-text-effect-154.html", text);
    m.reply("*Wait a moment...*");
        await client.sendMessage(m.chat, {
          image: {
            url: hunteer.image
          },
          caption: `ᘜᗴᑎᗴᖇᗩTᗴᗪ ᗷY ᑎᗴ᙭ᑌՏ ᗰᗪ`
        }, {
          quoted: m
        });
      } catch(_0x29ddf8) {
        m.reply("💀💀" + _0x29ddf8);
      }
    }
    },
  },

  {
    command: ['metallic'],
    aliases: [],
    description: 'Generate a metallic style text logo',
    category: 'logos',
    handler: async (client, m, { prefix, text }) => {
    {
    		      var mumaker = require("mumaker");
    		     if (!text || text == "") {
          m.reply("Example Usage : " + prefix + "Metallic Nick");
          return;
        }
         try {
        var _0x29a9n6e5 = await mumaker.ephoto("https://en.ephoto360.com/impressive-decorative-3d-metal-text-effect-798.html", text);
        m.reply("*Wait a moment...*");
        await client.sendMessage(m.chat, {
          image: {
            url: _0x29a9n6e5.image
          },
          caption: `ᘜᗴᑎᗴᖇᗩTᗴᗪ ᗷY ᑎᗴ᙭ᑌՏ ᗰᗪ`
        });
      } catch (_0x180d0734) {
        m.reply(_0x180d0734);
      }
    }
    },
  },

  {
    command: ['naruto'],
    aliases: [],
    description: 'Generate a naruto style text logo',
    category: 'logos',
    handler: async (client, m, { prefix, text }) => {
    {
    		var mumaker = require("mumaker");
    		      if (!text || text == "") {
          m.reply("Example usage : " + prefix + "naruto Hunter");
          return;
        }
        try {
        var _0x357389 = await mumaker.ephoto("https://en.ephoto360.com/naruto-shippuden-logo-style-text-effect-online-808.html", text);
     m.reply("*Wait a moment...*");
        await client.sendMessage(m.chat, {
          image: {
            url: _0x357389.image
          },
          caption: `ᘜᗴᑎᗴᖇᗩTᗴᗪ ᗷY ᑎᗴ᙭ᑌՏ ᗰᗪ`
        }, {
          quoted: m
        });
      } catch (_0x564fe1) {
        m.reply("🥵🥵 " + _0x564fe1);
      }
    }
    },
  },

  {
    command: ['neon'],
    aliases: [],
    description: 'Generate a neon style text logo',
    category: 'logos',
    handler: async (client, m, { prefix, text }) => {
    {
    		var mumaker = require("mumaker");
    		     if (!text || text == "") {
          m.reply("Example Usage : " + prefix + "Neon Nick");
          return;
        }
         try {
        var _0x29a96e5 = await mumaker.ephoto("https://en.ephoto360.com/create-colorful-neon-light-text-effects-online-797.html", text);
        m.reply("*Wait a moment...*");
        await client.sendMessage(m.chat, {
          image: {
            url: _0x29a96e5.image
          },
          caption: `ᘜᗴᑎᗴᖇᗩTᗴᗪ ᗷY ᑎᗴ᙭ᑌՏ ᗰᗪ`
        });
      } catch (_0x180d034) {
        m.reply(_0x180d034);
      }
    }
    },
  },

  {
    command: ['noel'],
    aliases: [],
    description: 'Generate a noel style text logo',
    category: 'logos',
    handler: async (client, m, { prefix, text }) => {
    {
    		      var mumaker = require("mumaker");

    		      if (!text || text == "") {
        m.reply("Example usage: " + prefix + "Noel myself");
        return;
      }
      try {

      var hunte = await mumaker.ephoto("https://en.ephoto360.com/noel-text-effect-online-99.html", text);
    m.reply("*Wait a moment...*");
        await client.sendMessage(m.chat, {
          image: {
            url: hunte.image
          },
          caption: `ᘜᗴᑎᗴᖇᗩTᗴᗪ ᗷY ᑎᗴ᙭ᑌՏ ᗰᗪ`
        }, {
          quoted: m
        });
      } catch(_0x29df9) {
        m.reply("💀💀" + _0x29df9);
      }
    }
    },
  },

  {
    command: ['purple'],
    aliases: [],
    description: 'Generate a purple style text logo',
    category: 'logos',
    handler: async (client, m, { prefix, text }) => {
    {
    		 var mumaker = require("mumaker");
    		      if (!text || text == "") {
          m.reply("Example Usage : " + prefix + "purple Perez");
          return;
        }
         try {
        var _0x29a96e = await mumaker.ephoto("https://en.ephoto360.com/purple-text-effect-online-100.html", text);
        m.reply("*Wait a moment...*");
        await client.sendMessage(m.chat, {
          image: {
            url: _0x29a96e.image
          },
          caption: `ᘜᗴᑎᗴᖇᗩTᗴᗪ ᗷY ᑎᗴ᙭ᑌՏ ᗰᗪ`
        });
      } catch (_0x180d03) {
        m.reply(_0x180d03);
      }
    }
    },
  },

  {
    command: ['sand'],
    aliases: [],
    description: 'Generate a sand style text logo',
    category: 'logos',
    handler: async (client, m, { prefix, text }) => {
    {
    	 var mumaker = require("mumaker");
    		      if (!text || text == "") {
        m.reply("Example Usage : " + prefix + "sand Raven");
        return;
      }
      try {
        let _0x4959e5 = await mumaker.ephoto("https://en.ephoto360.com/write-names-and-messages-on-the-sand-online-582.html", text);
        m.reply("*Wait a moment...*");
        await client.sendMessage(m.chat, {
          image: {
            url: _0x4959e5.image
          },
          caption: `ᘜᗴᑎᗴᖇᗩTᗴᗪ ᗷY ᑎᗴ᙭ᑌՏ ᗰᗪ`
        }, {
          quoted: m
        });
      } catch (_0x593c10) {
        m.reply("🚫🚫 " + _0x593c10);
      }
    }
    },
  },

  {
    command: ['silver'],
    aliases: ['silva'],
    description: 'Generate a silver style text logo',
    category: 'logos',
    handler: async (client, m, { prefix, text }) => {
    {
    		      var mumaker = require("mumaker");
    		          if (!text || text == " ") {
          m.reply("Example Usage : " + prefix + "Silva Nick");
          return;
        }
         try {
        var _0x2996e = await mumaker.ephoto("https://en.ephoto360.com/create-glossy-silver-3d-text-effect-online-802.html", text);
        m.reply("*Wait a moment...*");
        await client.sendMessage(m.chat, {
          image: {
            url: _0x2996e.image
          },
          caption: `ᘜᗴᑎᗴᖇᗩTᗴᗪ ᗷY ᑎᗴ᙭ᑌՏ ᗰᗪ`
        });
      } catch (_0x180d3) {
        m.reply(_0x180d3);
      }
    }
    },
  },

  {
    command: ['snow'],
    aliases: [],
    description: 'Generate a snow style text logo',
    category: 'logos',
    handler: async (client, m, { prefix, text }) => {
    {
    		      var mumaker = require("mumaker");
    		     if (!text || text == "") {
          m.reply("Example Usage : " + prefix + "Snow perez");
          return;
        }
         try {
        var _029a96e5 = await mumaker.ephoto("https://en.ephoto360.com/create-a-snow-3d-text-effect-free-online-621.html", text);
        m.reply("*Wait a moment...*");
        await client.sendMessage(m.chat, {
          image: {
            url: _029a96e5.image
          },
          caption: `GENERATED BY 𝑵𝑬𝑿𝑼𝑺 𝑴𝑫`
        });
      } catch (_0180d034) {
        m.reply(_0180d034);
      }
    }
    },
  },

  {
    command: ['thunder'],
    aliases: [],
    description: 'Generate a thunder style text logo',
    category: 'logos',
    handler: async (client, m, { prefix, text }) => {
    {
    		      var mumaker = require("mumaker");
    		      if (!text || text == "") {
          m.reply("Example Usage : " + prefix + "Thunder Nick");
          return;
        }
    	try {
        var _0x29a96 = await mumaker.ephoto("https://en.ephoto360.com/thunder-text-effect-online-97.html", text);
        m.reply("*Wait a moment...*");
        await client.sendMessage(m.chat, {
          image: {
            url: _0x29a96.image
          },
          caption: `ᘜᗴᑎᗴᖇᗩTᗴᗪ ᗷY ᑎᗴ᙭ᑌՏ ᗰᗪ`
        });
      } catch (_0x180d0) {
        m.reply(_0x180d0);
      }
    }
    },
  },

  {
    command: ['typography'],
    aliases: [],
    description: 'Generate a typography style text logo',
    category: 'logos',
    handler: async (client, m, { prefix, text }) => {
    {
    		      var mumaker = require("mumaker");
    		          if (!text || text == "") {
          m.reply("Example Usage : " + prefix + "Typography Nick");
          return;
        }
         try {
        var _0x29a996e = await mumaker.ephoto("https://en.ephoto360.com/create-typography-text-effect-on-pavement-online-774.html", text);
        m.reply("*Wait a moment...*");
        await client.sendMessage(m.chat, {
          image: {
            url: _0x29a996e.image
          },
          caption: `ᘜᗴᑎᗴᖇᗩTᗴᗪ ᗷY ᑎᗴ᙭ᑌՏ ᗰᗪ`
        });
      } catch (_0x180d063) {
        m.reply(_0x180d063);
      }
    }
    },
  },

  {
    command: ['water'],
    aliases: [],
    description: 'Generate a water style text logo',
    category: 'logos',
    handler: async (client, m, { prefix, text }) => {
    {
    		      var mumaker = require("mumaker");

    		      if (!text || text == "") {
        m.reply("Example usage: " + prefix + "Water myself");
        return;
      }
      try {

      var hunterr = await mumaker.ephoto("https://en.ephoto360.com/create-water-effect-text-online-295.html", text);
    m.reply("*Wait a moment...*");
        await client.sendMessage(m.chat, {
          image: {
            url: hunterr.image
          },
          caption: `ᘜᗴᑎᗴᖇᗩTᗴᗪ ᗷY ᑎᗴ᙭ᑌՏ ᗰᗪ`
        }, {
          quoted: m
        });
      } catch(_0x9ddf9) {
        m.reply("💀💀" + _0x9ddf9);
      }
    }
    },
  },
];
