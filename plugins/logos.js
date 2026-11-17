const CAPTION = '𝗚𝗘𝗡𝗘𝗥𝗔𝗧𝗘𝗗 𝗕𝗬 𝗧𝗘𝗦𝗟𝗔-𝗠𝗗';
const BASE_URL = 'https://en.ephoto360.com/';

const EFFECTS = [
  { command: '1917', slug: '1917-style-text-effect-523' },
  { command: 'arena', slug: 'create-cover-arena-of-valor-by-mastering-360' },
  { command: 'cat', slug: 'handwritten-text-on-foggy-glass-online-680' },
  { command: 'child', slug: 'write-text-on-wet-glass-online-589' },
  { command: 'devil', slug: 'neon-devil-wings-text-effect-online-683' },
  { command: 'dragonball', slug: 'create-dragon-ball-style-text-effects-online-809' },
  { command: 'gold', slug: 'modern-gold-4-213' },
  { command: 'graffiti', slug: 'create-a-cartoon-style-graffiti-text-effect-online-668' },
  { command: 'hacker', slug: 'create-anonymous-hacker-avatars-cyan-neon-677' },
  { command: 'ice', slug: 'ice-text-effect-online-101' },
  { command: 'impressive', slug: 'create-3d-colorful-paint-text-effect-online-801' },
  { command: 'leaves', slug: 'green-brush-text-effect-typography-maker-online-153' },
  { command: 'light', slug: 'light-text-effect-futuristic-technology-style-648' },
  { command: 'matrix', slug: 'matrix-text-effect-154' },
  { command: 'metallic', slug: 'impressive-decorative-3d-metal-text-effect-798' },
  { command: 'naruto', slug: 'naruto-shippuden-logo-style-text-effect-online-808' },
  { command: 'neon', slug: 'create-colorful-neon-light-text-effects-online-797' },
  { command: 'noel', slug: 'noel-text-effect-online-99' },
  { command: 'purple', slug: 'purple-text-effect-online-100' },
  { command: 'sand', slug: 'write-names-and-messages-on-the-sand-online-582' },
  { command: 'silver', slug: 'create-glossy-silver-3d-text-effect-online-802', aliases: ['silva'] },
  { command: 'snow', slug: 'create-a-snow-3d-text-effect-free-online-621' },
  { command: 'thunder', slug: 'thunder-text-effect-online-97' },
  { command: 'typography', slug: 'create-typography-text-effect-on-pavement-online-774' },
  { command: 'water', slug: 'create-water-effect-text-online-295' },
];

const logo = ({ command, slug, aliases = [] }) => ({
  command: [command],
  aliases,
  description: `Generate a ${command} style text logo`,
  category: 'logos',
  handler: async (client, m, { prefix, text }) => {
    const name = String(text || '').trim();
    if (!name) return m.reply(`Example: ${prefix || '.'}${command} Tesla`);

    const react = (emoji) => client.sendMessage(m.chat, { react: { text: emoji, key: m.key } }).catch(() => { });
    try {
      await react('⏳');
      const result = await require('mumaker').ephoto(`${BASE_URL}${slug}.html`, name);
      if (!result || !result.image) throw new Error('the logo service returned no image');
      await client.sendMessage(m.chat, { image: { url: result.image }, caption: CAPTION }, { quoted: m });
      await react('✅');
    } catch (error) {
      await react('❌');
      m.reply(`❌ Could not create the ${command} logo: ${(error && error.message) || error}`);
    }
  },
});

module.exports = EFFECTS.map(logo);
