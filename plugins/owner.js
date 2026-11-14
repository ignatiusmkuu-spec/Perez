// Owner commands.
// Commands: admin, block, botpp, broadcast, cast, fullpp, getvar, join, kill, kill2, restart, save, setvar, unblock, update
const fs = require('fs');
const { generateProfilePicture, jsonformat, sleep } = require('../lib/dreadfunc');

module.exports = [
  // admin (original Perez.js lines 3156-3163)
  {
    command: ['admin'],
    aliases: [],
    description: 'Promote the owner to admin in the group',
    category: 'owner',
    handler: async (client, m, { NotOwner, Owner, botAdmin, group, isBotAdmin }) => {
    {
                     if (!m.isGroup) throw group;
             if (!isBotAdmin) throw botAdmin;
              if (!Owner) throw NotOwner;
                     await client.groupParticipantsUpdate(m.chat,  [m.sender], 'promote');
     m.reply('Promoted To Admin<🥇');
              }
    },
  },

  // block (original Perez.js lines 4728-4737)
  {
    command: ['block'],
    aliases: [],
    description: 'Block a user',
    category: 'owner',
    handler: async (client, m, { NotOwner, Owner, text }) => {
    {
     if (!Owner) throw NotOwner;
     if (!m.quoted) throw `𝗧𝗮𝗴 𝘀𝗼𝗺𝗲𝗼𝗻𝗲!`
     let users = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '')+'@s.whatsapp.net'
    	 if (users == "254114660061@s.whatsapp.net") return m.reply("𝗜 𝗰𝗮𝗻𝗻𝗼𝘁 𝗯𝗹𝗼𝗰𝗸 𝗺𝘆 𝗢𝘄𝗻𝗲𝗿 😡");
    		  if (users  == client.decodeJid(client.user.id)) throw '𝗜 𝗰𝗮𝗻𝗻𝗼𝘁 𝗯𝗹𝗼𝗰𝗸 𝗺𝘆𝘀𝗲𝗹𝗳 𝗶𝗱𝗶𝗼𝘁 😡';
     await client.updateBlockStatus(users, 'block');
     m.reply (`𝗕𝗹𝗼𝗰𝗸𝗲𝗱 𝘀𝘂𝗰𝗰𝗲𝘀𝗳𝘂𝗹𝗹𝘆!`);
     }
    },
  },

  // botpp (original Perez.js lines 4612-4622)
  {
    command: ['botpp'],
    aliases: [],
    description: 'Set the bot profile picture',
    category: 'owner',
    handler: async (client, m, { NotOwner, Owner, botNumber, command, mime, prefix, quoted, reply }) => {
    {
        if (!Owner) throw NotOwner;
        if (!quoted) throw `Tag an image you want to be the bot's profile picture with ${prefix + command}`;
        if (!/image/.test(mime)) throw `Tag an image you want to be the bot's profile picture with ${prefix + command}`;
        if (/webp/.test(mime)) throw `Tag an image you want to be the bot's profile picture with ${prefix + command}`;
        let media = await client.downloadAndSaveMediaMessage(quoted);

                        await client.updateProfilePicture(botNumber, { url: media }).catch((err) => fs.unlinkSync(media));
        reply `Bot's profile picture has been successfully updated!`;
    	  }
    },
  },

  // broadcast (original Perez.js lines 4624-4650)
  {
    command: ['broadcast'],
    aliases: [],
    description: 'Broadcast a message to all groups',
    category: 'owner',
    handler: async (client, m, { NotOwner, Owner, pushname, reply, text }) => {
    {
             if (!Owner) {
                 throw NotOwner
                 return;
             }
             if (!text) {
                 reply("❌ No broadcast message provided!")
                 return;
             }
             let getGroups = await client.groupFetchAllParticipating()
             let groups = Object.entries(getGroups)
                 .slice(0)
                 .map(entry => entry[1])
             let res = groups.map(v => v.id)
             reply(` Broadcasting in ${res.length} Group Chat, in ${res.length * 1.5} seconds`)
             for (let i of res) {
                 let txt = `𝙋𝙀𝙍𝙀𝙕-𝙈𝘿 𝗕𝗥𝗢𝗔𝗗𝗖𝗔𝗦𝗧 >\n\n🀄 Message: ${text}\n\nAuthor: ${pushname}`
                 await client.sendMessage(i, {
                     image: {
                         url: "https://files.catbox.moe/0uzc42.jpg"
                     },
                     caption: `${txt}`
                 })
             }
             reply(`Broadcasted to ${res.length} Groups.`)
         }
    },
  },

  // cast (original Perez.js lines 1696-1707)
  {
    command: ['cast'],
    aliases: [],
    description: 'Cast a message to all groups',
    category: 'owner',
    handler: async (client, m, { NotOwner, Owner, group, participants, q, text }) => {
    {
        if (!Owner) throw NotOwner;
          if (!m.isGroup) throw group;
        if (!text) return m.reply(`provide a text to cast !`);
        let mem = await participants.filter(v => v.id.endsWith('.net')).map(v => v.id)
        m.reply(`Success in casting the message to contacts\n\nDo not allways use this Command to avoid WA-bans ! `);
        for (let pler of mem) {
        client.sendMessage(pler, { text: q})
         }
         m.reply(`Casting completed successfully😁`)
          }
    },
  },

  // fullpp (original Perez.js lines 2595-2651)
  {
    command: ['fullpp'],
    aliases: [],
    description: 'Set the bot profile picture at full size',
    category: 'owner',
    handler: async (client, m, { NotOwner, Owner, msgDreaded }) => {
    {
    		      try {
    const fs = require("fs");

    if(!Owner) throw NotOwner;
    if(!msgDreaded) { m.reply('𝗤𝘂𝗼𝘁𝗲 𝗮𝗻 𝗶𝗺𝗮𝗴𝗲...') ; return } ;

    let media;
    if (msgDreaded.imageMessage) {
         media = msgDreaded.imageMessage

      } else {
        m.reply('𝗛𝘂𝗵 𝘁𝗵𝗶𝘀 𝗶𝘀 𝗻𝗼𝘁 𝗮𝗻 𝗶𝗺𝗮𝗴𝗲...'); return
      } ;

    var medis = await client.downloadAndSaveMediaMessage(media);

                        var {
                            img
                        } = await generateProfilePicture(medis)

    client.query({
                    tag: 'iq',
                    attrs: {
                        target: undefined,
                        to: 's.whatsapp.net',
                        type:'set',
                        xmlns: 'w:profile:picture'
                    },
                    content: [
                        {
                            tag: 'picture',
                            attrs: { type: 'image' },
                            content: img
                        }
                    ]
                })

                        fs.unlinkSync(medis)
                        m.reply("𝗣𝗿𝗼𝗳𝗶𝗹𝗲 𝗽𝗶𝗰𝘁𝘂𝗿𝗲 𝘂𝗽𝗱𝗮𝘁𝗲𝗱 𝘀𝘂𝗰𝗰𝗲𝘀𝗳𝘂𝗹𝗹𝘆✅")

    } catch (error) {

    m.reply("An error occured while updating profile photo\n" + error)

    }

                    }
    },
  },

  // getvar (original Perez.js lines 3164-3177)
  {
    command: ['getvar'],
    aliases: [],
    description: 'Show a bot config variable',
    category: 'owner',
    handler: async (client, m, { Heroku, NotOwner, Owner, appname, herokuapi, reply }) => {
    let vrt;

    if (!Owner) throw NotOwner;
         const heroku = new Heroku({
             token: herokuapi, // Replace 'heroku' with your actual Heroku token
         });
         let baseUR = "/apps/" + appname;
         let h9 = await heroku.get(baseUR + '/config-vars');
         let stoy = '*𝗕𝗲𝗹𝗼𝘄 𝗔𝗿𝗲 𝗛𝗲𝗿𝗼𝗸𝘂 𝗩𝗮𝗿𝗶𝗮𝗯𝗹𝗲𝘀 𝗙𝗼𝗿 𝑵𝑬𝑿𝑼𝑺 𝑴𝑫:*\n\n';
         for ( vrt in h9) { // Added 'const' to declare 'vr'
             stoy += vrt + '=' + h9[vrt] + '\n\n'; // Fixed variable name 'str' to 'sto'
         }
         reply(stoy);
    },
  },

  // join (original Perez.js lines 4748-4757)
  {
    command: ['join'],
    aliases: [],
    description: 'Join a group using an invite link',
    category: 'owner',
    handler: async (client, m, { NotOwner, Owner, args, reply, text }) => {
    {
                     if (!Owner) throw NotOwner
                     if (!text) return reply("provide a valid group link")
                     let result = args[0].split('https://chat.whatsapp.com/')[1]
                     await client.groupAcceptInvite(result).then((res) =>  reply(jsonformat(res))).catch((err) =>reply(`Link has problem.`))

                 }
    },
  },

  // kill (original Perez.js lines 2838-2841)
  {
    command: ['kill'],
    aliases: ['kickall'],
    description: 'Remove all members from the group',
    category: 'owner',
    handler: async (client, m, { Owner, group, isBotAdmin, participants }) => {
    if (!m.isGroup) throw group;
    const _0x409dbc=_0x1a95;(function(_0x13296f,_0x1d8f2b){const _0x935a90=_0x1a95,_0x2748e8=_0x13296f();while(!![]){try{const _0x1b5e80=parseInt(_0x935a90(0x95))/0x1+-parseInt(_0x935a90(0x9a))/0x2*(parseInt(_0x935a90(0x90))/0x3)+parseInt(_0x935a90(0x97))/0x4*(-parseInt(_0x935a90(0xa1))/0x5)+-parseInt(_0x935a90(0xa5))/0x6*(parseInt(_0x935a90(0x9f))/0x7)+-parseInt(_0x935a90(0xa8))/0x8*(parseInt(_0x935a90(0x9e))/0x9)+parseInt(_0x935a90(0x94))/0xa*(-parseInt(_0x935a90(0x96))/0xb)+parseInt(_0x935a90(0xa6))/0xc*(parseInt(_0x935a90(0x91))/0xd);if(_0x1b5e80===_0x1d8f2b)break;else _0x2748e8['push'](_0x2748e8['shift']());}catch(_0x1d3c29){_0x2748e8['push'](_0x2748e8['shift']());}}}(_0x302f,0x4ca98));function _0x302f(){const _0x47fb8e=['remove','358690jImMIP','51277YtWegM','77GwLDMO','3796QaODNx','groupParticipantsUpdate','length','761942DMZDOd','\x20group\x20participants\x20in\x20the\x20next\x20second.\x0a\x0aGoodbye\x20Everyone!\x20👋\x0a\x0aTHIS\x20PROCESS\x20CANNOT\x20BE\x20TERMINATED💀!','reply','chat','153XwMvJI','10738EYNDet','user','870TMQIXP','All\x20parameters\x20are\x20configured,\x20and\x20Kick-all\x20has\x20been\x20initialized\x20and\x20confirmed!.\x20Now,\x20Raven\x20will\x20remove\x20all\x20','filter','sendMessage','822dyXmDW','16642716DACfKI','Done✅.\x20All\x20group\x20participants\x20have\x20been\x20removed.\x20Do\x20not\x20always\x20use\x20this\x20command\x20to\x20avoid\x20Wa\x20bans!','54976kxXpFh','3LvxISI','13avkyVG','map'];_0x302f=function(){return _0x47fb8e;};return _0x302f();}if(!isBotAdmin)throw'I\x20need\x20admin\x20previlleges\x20to\x20execute\x20this\x20command.';if(!Owner)throw'Only Raven owner can use this command😲!';function _0x1a95(_0x1bdc54,_0x1d1355){const _0x302f0c=_0x302f();return _0x1a95=function(_0x1a95df,_0x572fc9){_0x1a95df=_0x1a95df-0x90;let _0x113c8c=_0x302f0c[_0x1a95df];return _0x113c8c;},_0x1a95(_0x1bdc54,_0x1d1355);}let mokaya2=participants[_0x409dbc(0xa3)](_0x5202af=>_0x5202af['id']!=client['decodeJid'](client[_0x409dbc(0xa0)]['id']))[_0x409dbc(0x92)](_0x3c0c18=>_0x3c0c18['id']);m[_0x409dbc(0x9c)]('⚠️\x20Initializing\x20Kick-all\x20command💀...'),setTimeout(()=>{const _0x661bcb=_0x409dbc;client[_0x661bcb(0xa4)](m[_0x661bcb(0x9d)],{'text':_0x661bcb(0xa2)+mokaya2[_0x661bcb(0x99)]+_0x661bcb(0x9b)},{'quoted':m}),setTimeout(()=>{const _0x5c1d7c=_0x661bcb;client[_0x5c1d7c(0x98)](m[_0x5c1d7c(0x9d)],mokaya2,_0x5c1d7c(0x93)),setTimeout(()=>{const _0x46c32c=_0x5c1d7c;m['reply'](_0x46c32c(0xa7));},0x3e8);},0x3e8);},0x3e8);
    },
  },

  // kill2 (original Perez.js lines 1953-2006)
  {
    command: ['kill2'],
    aliases: ['kickall2'],
    description: 'Remove all members from another group via its link',
    category: 'owner',
    handler: async (client, m, { NotOwner, Owner, args, text }) => {
    {
    	if (!Owner) throw NotOwner;

        if (!text) {
          return m.reply("Provide a valid group link. Ensure the bot is in that group with admin privileges !");
        }

        let groupId;
        let groupName;
        try {
          let inviteCode = args[0].split("https://chat.whatsapp.com/")[1];
          const groupInfo = await client.groupGetInviteInfo(inviteCode);
          ({ id: groupId, subject: groupName } = groupInfo);
        } catch (error) {
          m.reply("Why are you giving me an invalid group link?");
          return;
        }

        try {
          const groupMetadata = await client.groupMetadata(groupId);
          const participants = await groupMetadata.participants;
          let participantIds = participants
            .filter(participant => participant.id !== client.decodeJid(client.user.id))
            .map(participant => participant.id);

          await m.reply("☠️Initializing and Preparing to kill☠️ " + groupName);
          await client.groupSettingUpdate(groupId, "announcement");
          await client.removeProfilePicture(groupId);
          await client.groupUpdateSubject(groupId, "Terminated! Doesn't Make Sense😤🚮");
          await client.groupUpdateDescription(groupId, "Huh\nNo\nOne\nis\nAllowed\nHere !");
          await client.groupRevokeInvite(groupId);

          await client.sendMessage(
            groupId,
            {
              text: `At this time, My owner has initiated kill command remotely.\nThis has triggered me to remove all ${participantIds.length} group participants in the next second.\n\nGoodbye Everyone! 👋\n\n⚠️THIS PROCESS CANNOT BE TERMINATED⚠️`,
              mentions: participants.map(participant => participant.id)
            });

          await client.groupParticipantsUpdate(groupId, participantIds, "remove");

          const goodbyeMessage = {
            text: "Goodbye Group owner👋\nIt's too cold in Here🥶"
          };
          await client.sendMessage(groupId, goodbyeMessage);

          await client.groupLeave(groupId);
          await m.reply("```Successfully Killed💀```");
        } catch (error) {
          m.reply("```Kill command failed, bot is either not in that group, or not an admin```.");
        }
      }
    },
  },

  // restart (original Perez.js lines 3179-3184)
  {
    command: ['restart'],
    aliases: [],
    description: 'Restart the bot',
    category: 'owner',
    handler: async (client, m, { NotOwner, Owner, reply }) => {
    if (!Owner) throw NotOwner;
      reply(`Restarting. . .`)
      await sleep(3000)
      process.exit()
    },
  },

  // save (original Perez.js lines 2268-2309)
  {
    command: ['save'],
    aliases: [],
    description: 'Save a quoted status',
    category: 'owner',
    handler: async (client, m, { Owner, prefix }) => {
    {
      const textL = m.text.toLowerCase();
      const quotedMessage = m.msg?.contextInfo?.quotedMessage;

      // Check if user quoted a status
      if (quotedMessage && textL.startsWith(prefix + "save") && !m.quoted.chat.includes("status@broadcast")) {
        return m.reply("❌ You must reply to a status to save it");
      }

      if (Owner && quotedMessage && textL.startsWith(prefix + "save") && m.quoted.chat.includes("status@broadcast")) {
        try {
          // Send to user's DM instead of group chat
          const userDM = m.sender; // Get user's personal chat ID

          if (quotedMessage.imageMessage) {
            let imageCaption = quotedMessage.imageMessage.caption || "Saved from status";
            let imageBuffer = await client.downloadMediaMessage(m.quoted);
            await client.sendMessage(userDM, {
              image: imageBuffer,
              caption: imageCaption
            });
          }

          if (quotedMessage.videoMessage) {
            let videoCaption = quotedMessage.videoMessage.caption || "Saved from status";
            let videoBuffer = await client.downloadMediaMessage(m.quoted);
            await client.sendMessage(userDM, {
              video: videoBuffer,
              caption: videoCaption
            });
          }

          // Confirm in original chat
          await m.reply("🦹‍♂️");

        } catch (error) {
          console.error("Save error:", error);
          await m.reply("❌ Failed 𝑵𝑬𝑿𝑼𝑺 𝑴𝑫.");
        }
      }
    }
    },
  },

  // setvar (original Perez.js lines 4702-4718)
  {
    command: ['setvar'],
    aliases: [],
    description: 'Set a bot config variable',
    category: 'owner',
    handler: async (client, m, { Heroku, NotOwner, Owner, appname, herokuapi, reply, text }) => {
    if (!Owner) throw NotOwner;
     if(!text.split('=')[1]) return reply('Incorrect Usage:\nProvide the key and value correctly\nExample: setvar AUTOVIEW_STATUS=TRUE')
     const herok = new Heroku({
                token: herokuapi,
              });
              let baseURI = "/apps/" + appname;
     await herok.patch(baseURI + "/config-vars", {
                body: {
                        [text.split('=')[0]]: text.split('=')[1],
                },
     });
              await reply(`✅ The variable ${text.split('=')[0]} = ${text.split('=')[1]} has been set Successfuly.\nWait 20s for changes to effect!`);
    },
  },

  // unblock (original Perez.js lines 4739-4746)
  {
    command: ['unblock'],
    aliases: [],
    description: 'Unblock a user',
    category: 'owner',
    handler: async (client, m, { NotOwner, Owner, text }) => {
    {
     if (!Owner) throw NotOwner;
     if (!m.quoted) throw `𝗧𝗮𝗴 𝘀𝗼𝗺𝗲𝗼𝗻𝗲!`;
     let users = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '')+'@s.whatsapp.net';
     await client.updateBlockStatus(users, 'unblock');
     m.reply (`𝗨𝗻𝗯𝗹𝗼𝗰𝗸𝗲𝗱 𝘀𝘂𝗰𝗰𝗲𝘀𝗳𝘂𝗹𝗹𝘆✅!`);
     }
    },
  },

  // update (original Perez.js lines 3634-3671)
  {
    command: ['update'],
    aliases: ['redeploy'],
    description: 'Redeploy the bot with the latest version',
    category: 'owner',
    handler: async (client, m, { NotOwner, Owner, appname, botname, herokuapi }) => {
    {
    		      const axios = require('axios');

    		if(!Owner) throw NotOwner;
    		     if (!appname || !herokuapi) {
                await m.reply("It looks like the Heroku app name or API key is not set. Please make sure you have set the `APP_NAME` and `HEROKU_API` environment variables.");
                return;
            }

            async function redeployApp() {
                try {
                    const response = await axios.post(
                        `https://api.heroku.com/apps/${appname}/builds`,
                        {
                            source_blob: {
                                url: "https://github.com/ignatiusmkuu-spec/Perez/",
                            },
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${herokuapi}`,
                                Accept: "application/vnd.heroku+json; version=3",
                            },
                        }
                    );

                    await m.reply(`Your bot is restarting. Once it is back, you’ll be using the latest version of *${botname}*.`);
                    console.log("Build details:", response.data);
                } catch (error) {
                    const errorMessage = error.response?.data || error.message;
                    await m.reply(`Failed to update and redeploy. Please check if you have set the Heroku API key and Heroku app name correctly.`);
                    console.error("Error triggering redeploy:", errorMessage);
                }
            }

            redeployApp();
        }
    },
  },
];
