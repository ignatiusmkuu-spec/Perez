
// clone at your own risk
const fs = require("fs");
const path = require("path");
const util = require("util");
global.axios = require('axios').default
const chalk = require("chalk");
const speed = require("performance-now");
const Genius = require("genius-lyrics"); 
const yts = require("yt-search");
const { DateTime } = require('luxon');
const uploadtoimgur = require('./lib/imgur');
const uploadToCatbox = require('./lib/catbox');
const advice = require("badadvice");
const {c, cpp, node, python, java} = require('compile-run');
const acrcloud = require("acrcloud");
const BASE_URL = 'https://noobs-api.top';
const ytdl = require("ytdl-core");
const { getSettings, updateSetting } = require('./database/config');
const fetchSettings = require('./database/fetchSettings');
const groupCache = require('./lib/Groupcache');
const identity = require('./lib/Identity');
const antideleteLib = require('./lib/antidelete');
const Client = new Genius.Client(process.env.GENIUS_API_KEY); // Scrapes if no key is provided
const { fetchUrl, isUrl, processTime } = require("./lib/dreadfunc");
const { TelegraPh, UploadFileUgu, webp2mp4File, floNime } = require('./lib/dreadupload');
const { Configuration, OpenAI } = require("openai");
let setting = process.env.AI;
const { smsg, formatp, tanggal, formatDate, getTime,  sleep, generateProfilePicture, clockString, fetchJson, getBuffer, jsonformat, format, parseMention, getRandom } = require('./lib/dreadfunc');
const { exec, spawn, execSync } = require("child_process");
const handler = require('./lib/handler');
handler.loadPlugins();

module.exports = async function tesla(client, m, chatUpdate, store) {
  try {
	  const {
  wapresence,
  autoread,
  mode,
  prefix,
  antilink,
  antilinkall,
  antidelete,
  gptdm,
  badword,
  antibot,
  antitag	
} = await fetchSettings(); 
	  
	  
    var body =
      m.mtype === "conversation"
        ? m.message.conversation
        : m.mtype == "extendedTextMessage"
        ? m.message.extendedTextMessage.text
        : m.mtype == "buttonsResponseMessage"
        ? m.message.buttonsResponseMessage.selectedButtonId
        : m.mtype == "listResponseMessage"
        ? m.message.listResponseMessage.singleSelectReply.selectedRowId
        : m.mtype == "templateButtonReplyMessage"
        ? m.message.templateButtonReplyMessage.selectedId
        : m.mtype === "messageContextInfo"
        ? m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text
        : "";
var budy = typeof m.text == "string" ? m.text : "";
var msgDreaded = m.message.extendedTextMessage?.contextInfo?.quotedMessage;
	  
// leave the prefix string empty if you don't want the bot to use a prefix
const Heroku = require("heroku-client");  
const appname = process.env.APP_NAME || '';
const herokuapi = process.env.HEROKU_API;
const cmd = body.startsWith(prefix);
const botname = "TESLA-MD";
  
    const command = body.replace(prefix, "").trim().split(/ +/).shift().toLowerCase();
    const args = body.trim().split(/ +/).slice(1);
    const pushname = m.pushName || "No Name";
    const botNumber = await client.decodeJid(client.user.id);
    const itsMe = m.fromMe || identity.botIds(client).has(identity.bare(m.sender));
    let text = (q = args.join(" "));
    const arg = budy.trim().substring(budy.indexOf(" ") + 1);
    const arg1 = arg.trim().substring(arg.indexOf(" ") + 1);
    m.isBaileys = m.id.startsWith("BAE5") && m.id.length === 16;
    const from = m.chat;
    const reply = m.reply;
    const sender = m.sender;
    const mek = chatUpdate.messages[0];
    const getGroupAdmins = (participants) => { 
       let admins = []; 
       for (let i of participants) { 
         i.admin === "superadmin" ? admins.push(i.id) : i.admin === "admin" ? admins.push(i.id) : ""; 
       } 
       return admins || []; 
     };
    const fortu = (m.quoted || m); 
         const quoted = (fortu.mtype == 'buttonsMessage') ? fortu[Object.keys(fortu)[1]] : (fortu.mtype == 'templateMessage') ? fortu.hydratedTemplate[Object.keys(fortu.hydratedTemplate)[1]] : (fortu.mtype == 'product') ? fortu[Object.keys(fortu)[0]] : m.quoted ? m.quoted : m; 
 
    const color = (text, color) => {
      return !color ? chalk.green(text) : chalk.keyword(color)(text);
    };
const mime = (quoted.msg || quoted).mimetype || "";
const qmsg = (quoted.msg || quoted);
const author = process.env.STICKER_AUTHOR ||'𝗕𝗢𝗧';
const packname = process.env.STICKER_PACKNAME || 'TESLA-MD';
const dev = process.env.DEV || '254781346242';
const menu = process.env.MENU_TYPE || 'VIDEO';
const DevDreaded = dev.split(",");
const badwordkick = process.env.BAD_WORD_KICK || 'FALSE';
const bad = process.env.BAD_WORD || 'fuck';
const badwords = bad.split(",")
	  
    // Group
    const groupMetadata = m.isGroup ? await groupCache.fetchMetadata(client, m.chat).catch((e) => { }) : "";
    const groupName = m.isGroup && groupMetadata ? await groupMetadata.subject : "";
    const groupParticipants = m.isGroup && groupMetadata ? groupMetadata.participants : [];
    const participants = groupParticipants
      .filter(p => p.id)
      .map(p => p.id);

    const adminIds = identity.adminIdSet(groupParticipants);
    const groupAdmin = groupParticipants
      .filter(p => (p.admin || p.isAdmin || p.isSuperAdmin) && p.id)
      .map(p => p.id);
    const isBotAdmin = m.isGroup ? identity.overlaps(identity.botIds(client), adminIds) : false;
    const senderAllIds = identity.senderIds(m, mek, groupParticipants);
    const groupSender = m.isGroup
      ? ((groupParticipants.find(p => identity.participantIds(p).some(id => senderAllIds.has(id))) || {}).id || sender)
      : sender;
     const isAdmin = m.isGroup ? identity.overlaps(senderAllIds, adminIds) : false;
     const Owner = identity.isOwner(senderAllIds, DevDreaded);
     const admin = process.env.ADMIN_MSG || '𝗖𝗼𝗺𝗺𝗮𝗻𝗱 𝗿𝗲𝘀𝗲𝗿𝘃𝗲𝗱 𝗳𝗼𝗿 𝗔𝗱𝗺𝗶𝗻𝘀!';
     const group = process.env.GROUP_ONLY_MSG || '𝗖𝗼𝗺𝗺𝗮𝗻𝗱 𝗺𝗲𝗮𝗻𝘁 𝗳𝗼𝗿 𝗚𝗿𝗼𝘂𝗽𝘀!';
     const botAdmin = process.env.BOT_ADMIN_MSG || '𝗜 𝗻𝗲𝗲𝗱 𝗔𝗱𝗺𝗶𝗻 𝗽𝗿𝗲𝘃𝗶𝗹𝗲𝗱𝗴𝗲𝘀!'
     const NotOwner = process.env.NOT_OWNER_MSG || '𝗖𝗼𝗺𝗺𝗮𝗻𝗱 𝗺𝗲𝗮𝗻𝘁 𝗳𝗼𝗿 𝘁𝗵𝗲 𝗼𝘄𝗻𝗲𝗿!';
     const mycode = process.env.CODE || '254';
     
const runtime = function (seconds) { 
 seconds = Number(seconds); 
 var d = Math.floor(seconds / (3600 * 24)); 
 var h = Math.floor((seconds % (3600 * 24)) / 3600); 
 var m = Math.floor((seconds % 3600) / 60); 
 var s = Math.floor(seconds % 60); 
 var dDisplay = d > 0 ? d + (d == 1 ? " 𝗱𝗮𝘆, " : " 𝗗𝗮𝘆𝘀, ") : ""; 
 var hDisplay = h > 0 ? h + (h == 1 ? " 𝗵𝗼𝘂𝗿, " : " 𝗛𝗼𝘂𝗿𝘀, ") : ""; 
 var mDisplay = m > 0 ? m + (m == 1 ? " 𝗺𝗶𝗻𝘂𝘁𝗲, " : " 𝗠𝗶𝗻𝘂𝘁𝗲𝘀, ") : ""; 
 var sDisplay = s > 0 ? s + (s == 1 ? " 𝘀𝗲𝗰𝗼𝗻𝗱" : " 𝗦𝗲𝗰𝗼𝗻𝗱𝘀") : ""; 
 return dDisplay + hDisplay + mDisplay + sDisplay; 
 }   
const timestamp = speed(); 
const dreadedspeed = speed() - timestamp 
	  
    // Push Message To Console
 let argsLog = budy.length > 30 ? `${q.substring(0, 30)}...` : budy;

if (wapresence === 'recording' && !m.isGroup) { 
             client.sendPresenceUpdate('recording', m.chat);
	
} else if (wapresence === 'typing' && !m.isGroup) { 
             client.sendPresenceUpdate('composing', m.chat);
	
      }	else if (wapresence === 'online' && !m.isGroup) { 
             client.sendPresenceUpdate('available', m.chat);
    }
    
if (cmd && mode === 'private' && !itsMe && !Owner && m.sender !== dev) {
return;
}


    if (autoread === 'on' && !m.isGroup) { 
             client.readMessages([m.key])
    }
      if (itsMe && mek.key.id.startsWith("BAE5") && mek.key.id.length === 16 && !m.isGroup) return;

antideleteLib.handle(client, m, mek, antidelete);

function _0x4f1b(_0x44e88, _0x1e223f) {
    var _0x3db626 = _0x11cc();
    return _0x4f1b = function (_0x2e8ed0, _0x5cd594) {
        _0x2e8ed0 = _0x2e8ed0 - (0x13bd + 0xcbb * 0x3 + -0x38ae);
        var _0x1e37b8 = _0x3db626[_0x2e8ed0];
        return _0x1e37b8;
    }, _0x4f1b(_0x44e88, _0x1e223f);
}
var _0x2e16c2 = _0x4f1b;
function _0x11cc() {
    var _0x4506b9 = [
        'length',
        '4NTZryU',
        'BAE5',
        '1565770bnKzAf',
        'sender',
        'groupParti',
        'split',
        '84AXXWgJ',
        '4435424UJQIXb',
        'y\x20RAVEN\x20',
        'on',
        'tibot:\x0a\x0a@',
        '\x20as\x20a\x20bot.',
        '2LGBzpD',
        'sendMessag',
        'ate',
        '\x20Removed\x20b',
        '\x20unnecessa',
        '5880358pnqlFT',
        'cipantsUpd',
        '356958TiEbec',
        '\x20has\x20been\x20',
        'chat',
        'ry\x20spam!',
        'remove',
        'identified',
        '3301765GBoZYn',
        'to\x20prevent',
        'isGroup',
        '184473FwtnYZ',
        '18szWhmE',
        'startsWith',
        '𝗥𝗔𝗩𝗘𝗡-𝗕𝗢𝗧\x20an',
        '376590puyzhN',
        'key'
    ];
    _0x11cc = function () {
        return _0x4506b9;
    };
    return _0x11cc();
}
(function (_0xb3d1a0, _0x4f6370) {
    var _0x132d30 = _0x4f1b, _0x276ffb = _0xb3d1a0();
    while (!![]) {
        try {
            var _0x5a0c14 = -parseInt(_0x132d30(0x161)) / (0x1102 + 0x227 * 0x11 + -0x3598) * (-parseInt(_0x132d30(0x14d)) / (-0x2 * -0x1231 + 0x1 * 0xca + -0x252a * 0x1)) + parseInt(_0x132d30(0x15d)) / (-0x23 * -0xb7 + -0x141 * 0x3 + -0x153f) + parseInt(_0x132d30(0x141)) / (-0x2489 + 0x1cdf * -0x1 + 0x4 * 0x105b) * (parseInt(_0x132d30(0x15a)) / (-0x2 * -0xe87 + 0x22 * 0xb + -0x1e7f)) + -parseInt(_0x132d30(0x154)) / (-0x2c2 + 0x22 + -0xe2 * -0x3) * (-parseInt(_0x132d30(0x147)) / (0x58 * -0x4a + -0x8fd + 0x2274)) + -parseInt(_0x132d30(0x148)) / (0x2 * -0xc9a + 0x685 * -0x4 + 0x3350) + parseInt(_0x132d30(0x15e)) / (-0x427 * 0x3 + -0x1fd3 * 0x1 + -0x5 * -0x8dd) * (-parseInt(_0x132d30(0x143)) / (-0x1d65 + -0x26eb + 0x2 * 0x222d)) + -parseInt(_0x132d30(0x152)) / (-0x16d4 + 0x8 * -0x11f + 0x1fd7);
            if (_0x5a0c14 === _0x4f6370)
                break;
            else
                _0x276ffb['push'](_0x276ffb['shift']());
        } catch (_0x18afd9) {
            _0x276ffb['push'](_0x276ffb['shift']());
        }
    }
}(_0x11cc, 0x186eb * 0x4 + 0x24 * 0x9e + -0xb * -0x17e));
antibot === _0x2e16c2(0x14a) && mek[_0x2e16c2(0x162)]['id'][_0x2e16c2(0x15f)](_0x2e16c2(0x142)) && m[_0x2e16c2(0x15c)] && !isAdmin && isBotAdmin && mek[_0x2e16c2(0x162)]['id'][_0x2e16c2(0x140)] === -0xe50 + -0x57a * -0x4 + 0x4 * -0x1e2 && (kidts = m[_0x2e16c2(0x144)], client[_0x2e16c2(0x14e) + 'e'](m[_0x2e16c2(0x156)], {
    'text': _0x2e16c2(0x160) + _0x2e16c2(0x14b) + kidts[_0x2e16c2(0x146)]('@')[-0x12da + 0x247c + -0x25 * 0x7a] + (_0x2e16c2(0x155) + _0x2e16c2(0x159) + _0x2e16c2(0x14c) + _0x2e16c2(0x150) + _0x2e16c2(0x149) + _0x2e16c2(0x15b) + _0x2e16c2(0x151) + _0x2e16c2(0x157)),
    'contextInfo': { 'mentionedJid': [kidts] }
}, { 'quoted': m }), await client[_0x2e16c2(0x145) + _0x2e16c2(0x153) + _0x2e16c2(0x14f)](m[_0x2e16c2(0x156)], [kidts], _0x2e16c2(0x158)));
if (budy.startsWith('>')) { 
   if (!Owner) return;
   try { 
 let evaled = await eval(budy.slice(2)); 
 if (typeof evaled !== 'string') evaled = require('util').inspect(evaled); 
 await reply(evaled); 
   } catch (err) { 
 await reply(String(err)); 
   } 
 } 
 


async function mp3d () {
	
let { key } = await client.sendMessage(m.chat, {audio: fs.readFileSync('./menu.mp3'), mimetype:'audio/mp4'}, {quoted: m })

}
 
    if (gptdm === 'on' && m.chat.endsWith("@s.whatsapp.net")) {

  let d = await fetchJson(
            `https://bk9.fun/ai/gptt4?q=${text}`
          );
          if (!d.BK9) {
            return reply(
              "An error occurred while fetching the AI chatbot response. Please try again later."
            );
          } else {
            reply(d.BK9);
          }
    }

	  
async function loading () {
var lod = [
"🖤",
"🤬",
"❤",	
	"😡",
   "💙",
	"😂",
	"💛",
"𝗣𝗶𝗻𝗴𝗶𝗻𝗴 𝗖𝗼𝗺𝗽𝗹𝗲𝘁𝗲!"	
]
let { key } = await client.sendMessage(from, {text: '𝗣𝗼𝗻𝗴'})

for (let i = 0; i < lod.length; i++) {
await client.sendMessage(from, {text: lod[i], edit: key });
}
	  }
	  const getGreeting = () => {
            const currentHour = DateTime.now().setZone('Africa/Nairobi').hour;

            if (currentHour >= 5 && currentHour < 12) {
                return '𝗚𝗼𝗼𝗱 𝗠𝗼𝗿𝗻𝗶𝗻𝗴 🌅';
            } else if (currentHour >= 12 && currentHour < 16) {
                return '𝗚𝗼𝗼𝗱 𝗔𝗳𝘁𝗲𝗿𝗻𝗼𝗼𝗻 ☀️';
            } else if (currentHour >= 16 && currentHour < 20) {
                return '𝗚𝗼𝗼𝗱 𝗘𝘃𝗲𝗻𝗶𝗻𝗴 🌇';
            } else {
                return '𝗚𝗼𝗼𝗱 𝗡𝗶𝗴𝗵𝘁 😴';
            }
        };


        const getCurrentTimeInNairobi = () => {
            return DateTime.now().setZone('Africa/Nairobi').toLocaleString(DateTime.TIME_SIMPLE);
        };
	  const date = new Date() 
if (badword === 'on' && isBotAdmin && !isAdmin && body && (new RegExp('\\b' + badwords.join('\\b|\\b') + '\\b')).test(body.toLowerCase())) {
            
     client.groupParticipantsUpdate(from, [sender], 'remove')
            reply("Hey niggah.\n\nMy owner hates usage of bad words in my presence!")
            
        
                                                   }
    if (antilink === 'on' && body.includes('chat.whatsapp.com') && !Owner && isBotAdmin && !isAdmin && m.isGroup) { 
  
 kid = m.sender; 
  
 client.sendMessage(m.chat, { 
  
                delete: { 
                   remoteJid: m.chat, 
                   fromMe: false, 
                   id: m.key.id, 
                   participant: kid 
                } 
             }).then(() => client.groupParticipantsUpdate(m.chat, [kid], 'remove')); 
 client.sendMessage(m.chat, {text:`𝗛𝗲𝘆 @${ki.split("@")[0]}👋\n\n𝗦𝗲𝗻𝗱𝗶𝗻𝗴 𝗚𝗿𝗼𝘂𝗽 𝗟𝗶𝗻𝗸𝘀 𝗶𝘀 𝗣𝗿𝗼𝗵𝗶𝗯𝗶𝘁𝗲𝗱 𝗶𝗻 𝘁𝗵𝗶𝘀 𝗚𝗿𝗼𝘂𝗽 !`, contextInfo:{mentionedJid:[kid]}}, {quoted:m}); 
       }   

if (antilinkall === 'on' && body.includes('https://') && !Owner && isBotAdmin && !isAdmin && m.isGroup) { 
  
 ki = m.sender; 
  
 client.sendMessage(m.chat, { 
  
                delete: { 
                   remoteJid: m.chat, 
                   fromMe: false, 
                   id: m.key.id, 
                   participant: ki
                } 
             }).then(() => client.groupParticipantsUpdate(m.chat, [ki], 'remove')); 
 client.sendMessage(m.chat, {text:`𝗛𝗲𝘆 @${ki.split("@")[0]}👋\n\n𝗦𝗲𝗻𝗱𝗶𝗻𝗴 𝗟𝗶𝗻𝗸𝘀 𝗶𝘀 𝗣𝗿𝗼𝗵𝗶𝗯𝗶𝘁𝗲𝗱 𝗶𝗻 𝘁𝗵𝗶𝘀 𝗚𝗿𝗼𝘂𝗽 !`, contextInfo:{mentionedJid:[ki]}}, {quoted:m}); 
       }   
  
  
  

    if (cmd && !m.isGroup) {
      console.log(chalk.black(chalk.bgWhite("[ RAVEN-AI ]")), color(argsLog, "turquoise"), chalk.magenta("From"), chalk.green(pushname), chalk.yellow(`[ ${m.sender.replace("@s.whatsapp.net", "")} ]`));
    } else if (cmd && m.isGroup) {
      console.log(
        chalk.black(chalk.bgWhite("[ LOGS ]")),
        color(argsLog, "turquoise"),
        chalk.magenta("From"),
        chalk.green(pushname),
        chalk.yellow(`[ ${m.sender.replace("@s.whatsapp.net", "")} ]`),
        chalk.blueBright("IN"),
        chalk.green(groupName)
      );
    }

    if (cmd) {
      const handled = await handler.dispatch(command, client, m, {
          DevDreaded, Heroku, NotOwner, Owner, admin, appname,
          args, author, botAdmin, botNumber, botname, budy,
          chatUpdate, command, dreadedspeed, from, getGreeting, group,
          groupMetadata, herokuapi, isAdmin, isBotAdmin, loading, mek,
          menu, menutype: menu, mime, mp3d, msgDreaded, mycode, packname,
          participants, prefix, pushname, qmsg, quoted, reply,
          runtime, sender, store, text, q: text,
        });
        if (!handled) {
        {
          if (cmd && budy.toLowerCase() != undefined) {
            if (m.chat.endsWith("broadcast")) return;
            if (m.isBaileys) return;
            if (!budy.toLowerCase()) return;
            if (argsLog || (cmd && !m.isGroup)) {
              // client.sendReadReceipt(m.chat, m.sender, [m.key.id])
              console.log(chalk.black(chalk.bgRed("[ ERROR ]")), color("command", "turquoise"), color(`${prefix}${command}`, "turquoise"), color("Raven", "turquoise"));
            } else if (argsLog || (cmd && m.isGroup)) {
              // client.sendReadReceipt(m.chat, m.sender, [m.key.id])
              console.log(chalk.black(chalk.bgRed("[ ERROR ]")), color("command", "turquoise"), color(`${prefix}${command}`, "turquoise"), color("Raven", "turquoise"));
            }
          }
        }
      }
    }
  } catch (err) {
    console.log(util.format(err));
  }
};

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright(`Update ${__filename}`));
  delete require.cache[file];
  require(file);
});
 
  
