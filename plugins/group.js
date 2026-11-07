// Group (menu: ICONS) commands.
// Commands: add, approve, close, delete, demote, desc, disp-1, disp-7, disp-90, disp-off, faker, foreigners, gcprofile, hidetag, icon, leave, linkgroup, open, promote, reject, remove, revoke, subject, tagall, vcf
const fs = require('fs');

module.exports = [
  // add (original Perez.js lines 2770-2837)
  {
    command: ['add'],
    aliases: [],
    description: 'Add a number to the group',
    category: 'group',
    handler: async (client, m, { admin, botAdmin, botname, group, groupMetadata, isAdmin, isBotAdmin, participants, pushname, text }) => {
    {
    		      const { getBinaryNodeChild, getBinaryNodeChildren } = await import('@whiskeysockets/baileys');
            if (!isBotAdmin) throw botAdmin;
    	if (!isAdmin) throw admin;
    	if (!m.isGroup) throw group;

            if (!text) return m.reply("provide number to be added in this format.\n\nadd 254108098259");

            const _participants = participants.map((user) => user.id);

            const users = (await Promise.all(
                text.split(',')
                    .map((v) => v.replace(/[^0-9]/g, ''))
                    .filter((v) => v.length > 4 && v.length < 20 && !_participants.includes(v + '@s.whatsapp.net'))
                    .map(async (v) => [
                        v,
                        await client.onWhatsApp(v + '@s.whatsapp.net'),
                    ]),
            )).filter((v) => v[1][0]?.exists).map((v) => v[0] + '@s.whatsapp.net');

            const response = await client.query({
                tag: 'iq',
                attrs: {
                    type: 'set',
                    xmlns: 'w:g2',
                    to: m.chat,
                },
                content: users.map((jid) => ({
                    tag: 'add',
                    attrs: {},
                    content: [{ tag: 'participant', attrs: { jid } }],
                })),
            });



            const add = getBinaryNodeChild(response, 'add');
            const participant = getBinaryNodeChildren(add, 'participant');

            let respon = await client.groupInviteCode(m.chat);

    for (const user of participant.filter((item) => item.attrs.error === 401 || item.attrs.error === 403 || item.attrs.error === 408)) {
        const jid = user.attrs.jid;
        const content = getBinaryNodeChild(user, 'add_request');
        const invite_code = content.attrs.code;
        const invite_code_exp = content.attrs.expiration;

        let teza;
        if (user.attrs.error === 401) {
            teza = `@${jid.split('@')[0]} has blocked the bot.`;
        } else if (user.attrs.error === 403) {
            teza = `@${jid.split('@')[0]} has set privacy settings for group adding.`;
        } else if (user.attrs.error === 408) {
            teza = `@${jid.split('@')[0]} recently left the group.`;
        }

        await m.reply(teza);

        let links = `${pushname} is trying to add or request you to join the group ${groupMetadata.subject}:\n\nhttps://chat.whatsapp.com/${respon}\n\n${botname} 💠`;

        await client.sendMessage(jid, { text: links }, { quoted: m });
    }
        }
    },
  },

  // approve (original Perez.js lines 3113-3133)
  {
    command: ['approve'],
    aliases: ['approve-all'],
    description: 'Approve all pending join requests',
    category: 'group',
    handler: async (client, m, { admin, botAdmin, group, isAdmin, isBotAdmin }) => {
    {
    	if (!m.isGroup) throw group;
    if (!isAdmin) throw admin;
    if (!isBotAdmin) throw botAdmin;

    const responseList = await client.groupRequestParticipantsList(m.chat);

    if (responseList.length === 0) return m.reply("𝗛𝘂𝗵, 𝗡𝗼 𝗣𝗲𝗻𝗱𝗶𝗻𝗴 𝗷𝗼𝗶𝗻 𝗿𝗲𝗾𝘂𝗲𝘀𝘁𝘀 𝘁𝗵𝗶𝘀 𝘁𝗶𝗺𝗲!");

    for (const participan of responseList) {
        const response = await client.groupRequestParticipantsUpdate(
            m.chat,
            [participan.jid], // Approve/reject each participant individually
            "approve" // or "reject"
        );
        console.log(response);
    }
    m.reply("𝗣𝗲𝗻𝗱𝗶𝗻𝗴 𝗣𝗮𝗿𝘁𝗶𝗰𝗶𝗽𝗮𝗻𝘁𝘀 𝗵𝗮𝘃𝗲 𝗯𝗲𝗲𝗻 𝗮𝗽𝗽𝗿𝗼𝘃𝗲𝗱 𝘀𝘂𝗰𝗰𝗲𝘀𝗳𝘂𝗹𝗹𝘆✅");

    }
    },
  },

  // close (original Perez.js lines 3744-3753)
  {
    command: ['close'],
    aliases: ['mute'],
    description: 'Lock the group so only admins can send messages',
    category: 'group',
    handler: async (client, m, { admin, botAdmin, group, isAdmin, isBotAdmin }) => {
    {

                     if (!m.isGroup) throw group;
                     if (!isBotAdmin) throw botAdmin;
                     if (!isAdmin) throw admin;

                         await client.groupSettingUpdate(m.chat, 'announcement');
     m.reply('Group successfully locked!');
     }
    },
  },

  // delete (original Perez.js lines 3909-3918)
  {
    command: ['delete'],
    aliases: ['del'],
    description: 'Delete a quoted message',
    category: 'group',
    handler: async (client, m, { admin, botAdmin, group, isAdmin, isBotAdmin }) => {
    {
                      if (!m.isGroup) throw group;
      if (!isBotAdmin) throw botAdmin;
      if (!isAdmin) throw admin;
        if (!m.quoted) throw `No message quoted for deletion`;
        let { chat, fromMe, id, isBaileys } = m.quoted;
       if (isBaileys) throw `I cannot delete. Quoted message is my message or another bot message.`;
        client.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: m.quoted.id, participant: m.quoted.sender } });
      }
    },
  },

  // demote (original Perez.js lines 3842-3852)
  {
    command: ['demote'],
    aliases: [],
    description: 'Demote an admin to a normal member',
    category: 'group',
    handler: async (client, m, { admin, botAdmin, group, isAdmin, isBotAdmin, text }) => {
    {
                     if (!m.isGroup) throw group;
             if (!isBotAdmin) throw botAdmin;
             if (!isAdmin) throw admin;
     if (!m.quoted) throw `Ttag someone with the command!`;
                     let users = m.mentionedJid[0] ? m.mentionedJid : m.quoted ? [m.quoted.sender] : [text.replace(/[^0-9]/g, '')+'@s.whatsapp.net'];

                     await client.groupParticipantsUpdate(m.chat, users, 'demote');
     m.reply('Successfully demoted! 😲');
             }
    },
  },

  // desc (original Perez.js lines 3939-3947)
  {
    command: ['desc'],
    aliases: ['setdesc'],
    description: 'Change the group description',
    category: 'group',
    handler: async (client, m, { admin, botAdmin, group, isAdmin, isBotAdmin, text }) => {
    {
                     if (!m.isGroup) throw group;
                     if (!isBotAdmin) throw botAdmin;
                     if (!isAdmin) throw admin;
                     if (!text) throw 'Provide the text for the group description'
                     await client.groupUpdateDescription(m.chat, text);
     m.reply('Group description successfully updated! 🥶');
                 }
    },
  },

  // disp-1 (original Perez.js lines 3821-3829)
  {
    command: ['disp-1'],
    aliases: [],
    description: 'Turn on disappearing messages (24 hours)',
    category: 'group',
    handler: async (client, m, { admin, botAdmin, group, isAdmin, isBotAdmin }) => {
    {
                     if (!m.isGroup) throw group;
                     if (!isBotAdmin) throw botAdmin;
                     if (!isAdmin) throw admin;

                         await client.groupToggleEphemeral(m.chat, 1*24*3600);
     m.reply('Dissapearing messages successfully turned on for 24hrs!');
     }
    },
  },

  // disp-7 (original Perez.js lines 3853-3862)
  {
    command: ['disp-7'],
    aliases: [],
    description: 'Turn on disappearing messages (7 days)',
    category: 'group',
    handler: async (client, m, { admin, botAdmin, group, isAdmin, isBotAdmin }) => {
    {
                     if (!m.isGroup) throw group;
                     if (!isBotAdmin) throw botAdmin;
                     if (!isAdmin) throw admin;

                         await client.groupToggleEphemeral(m.chat, 7*24*3600);
     m.reply('Dissapearing messages successfully turned on for 7 days!');

     }
    },
  },

  // disp-90 (original Perez.js lines 3863-3871)
  {
    command: ['disp-90'],
    aliases: [],
    description: 'Turn on disappearing messages (90 days)',
    category: 'group',
    handler: async (client, m, { admin, botAdmin, group, isAdmin, isBotAdmin }) => {
    {
                     if (!m.isGroup) throw group;
                     if (!isBotAdmin) throw botAdmin;
                     if (!isAdmin) throw admin;

                         await client.groupToggleEphemeral(m.chat, 90*24*3600);
     m.reply('Dissapearing messages successfully turned on for 90 days!');
     }
    },
  },

  // disp-off (original Perez.js lines 3872-3880)
  {
    command: ['disp-off'],
    aliases: [],
    description: 'Turn off disappearing messages',
    category: 'group',
    handler: async (client, m, { admin, botAdmin, group, isAdmin, isBotAdmin }) => {
    {
                     if (!m.isGroup) throw group;
                     if (!isBotAdmin) throw botAdmin;
                     if (!isAdmin) throw admin;

                         await client.groupToggleEphemeral(m.chat, 0);
     m.reply('Dissapearing messages successfully turned off!');
     }
    },
  },

  // faker (original Perez.js lines 2129-2167)
  {
    command: ['faker'],
    aliases: [],
    description: 'Remove members with fake numbers',
    category: 'group',
    handler: async (client, m, { admin, args, botAdmin, botname, group, isAdmin, isBotAdmin, participants }) => {
    {
    	if (!m.isGroup) throw group;
    	if (!isAdmin) throw admin;
    	if (!isBotAdmin) throw botAdmin;

    		let _0x2f8982 = participants.filter(_0x3c9d8b => !_0x3c9d8b.admin).map(_0x1db3fb => _0x1db3fb.id).filter(_0x475052 => _0x475052.startsWith("1") && _0x475052 != client.decodeJid(client.user.id));
        if (!args || !args[0]) {
          if (_0x2f8982.length == 0) {
            return m.reply("𝙽𝚘 𝚏𝚊𝚔𝚎 𝙰𝚌𝚌𝚘𝚞𝚗𝚝𝚜 𝚍𝚎𝚝𝚎𝚌𝚝𝚎𝚍.");
          }
          let _0x2d7d67 = `${botname} 𝚑𝚊𝚜 𝚍𝚎𝚝𝚎𝚌𝚝𝚎𝚍 𝚝𝚑𝚎 𝚏𝚘𝚕𝚕𝚘𝚠𝚒𝚗𝚐 ${_0x2f8982.length} 𝙵𝚊𝚔𝚎 𝚊𝚌𝚌𝚘𝚞𝚗𝚝𝚜 𝚒𝚗 𝚝𝚑𝚒𝚜 𝚐𝚛𝚘𝚞𝚙:- \n`;
          for (let _0x28761c of _0x2f8982) {
            _0x2d7d67 += `🚮 @${_0x28761c.split("@")[0]}\n`;
          }
          _0x2d7d67 += `\n𝚃𝚘 𝚛𝚎𝚖𝚘𝚟𝚎 𝚝𝚑𝚎𝚖 𝚜𝚎𝚗𝚍 𝚏𝚊𝚔𝚎𝚛 -x`;
          client.sendMessage(m.chat, {
            text: _0x2d7d67,
            mentions: _0x2f8982
          }, {
            quoted: m
          });
        } else if (args[0] == "-x") {
          setTimeout(() => {
            client.sendMessage(m.chat, {
              text: `𝙽𝚘𝚠 𝚁𝚊𝚟𝚎𝚗 𝚠𝚒𝚕𝚕 𝚛𝚎𝚖𝚘𝚟𝚎 ${_0x2f8982.length} 𝙵𝚊𝚔𝚎 𝙰𝚌𝚌𝚘𝚞𝚗𝚝𝚜 𝚏𝚛𝚘𝚖 𝚝𝚑𝚒𝚜 𝚐𝚛𝚘𝚞𝚙.\n\n𝙶𝚘𝚘𝚍𝚋𝚢𝚎👋 𝙵𝚊𝚔𝚎 𝚙𝚎𝚘𝚙𝚕𝚎.`
            }, {
              quoted: m
            });
            setTimeout(() => {
              client.groupParticipantsUpdate(m.chat, _0x2f8982, "remove");
              setTimeout(() => {
                m.reply("𝚂𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢 𝚛𝚎𝚖𝚘𝚟𝚎𝚍 𝚊𝚕𝚕 𝚏𝚊𝚔𝚎 𝚊𝚌𝚌𝚘𝚞𝚗𝚝𝚜✅.");
              }, 1000);
            }, 1000);
          }, 1000);
        }
          }
    	return;
    },
  },

  // foreigners (original Perez.js lines 1745-1782)
  {
    command: ['foreigners'],
    aliases: [],
    description: 'Remove members with foreign country codes',
    category: 'group',
    handler: async (client, m, { admin, args, botAdmin, group, isAdmin, isBotAdmin, mycode, participants }) => {
    {
    	if (!m.isGroup) throw group;
    	if (!isAdmin) throw admin;
    	if (!isBotAdmin) throw botAdmin;

    		let _0x2f8982 = participants.filter(_0x3c9d8b => !_0x3c9d8b.admin).map(_0x1db3fb => _0x1db3fb.id).filter(_0x475052 => !_0x475052.startsWith(mycode) && _0x475052 != client.decodeJid(client.user.id));
        if (!args || !args[0]) {
          if (_0x2f8982.length == 0) {
            return m.reply("No foreigners detected.");
          }
          let _0x2d7d67 = `Foreigners are members whose country code is not ${mycode}. The following  ${_0x2f8982.length} foreigners were found:- \n`;
          for (let _0x28761c of _0x2f8982) {
            _0x2d7d67 += `𓅂 @${_0x28761c.split("@")[0]}\n`;
          }
          _0x2d7d67 += `\nTo remove them send .foreigners -x`;
          client.sendMessage(m.chat, {
            text: _0x2d7d67,
            mentions: _0x2f8982
          }, {
            quoted: m
          });
        } else if (args[0] == "-x") {
          setTimeout(() => {
            client.sendMessage(m.chat, {
              text: `𝑵𝑬𝑿𝑼𝑺 𝑴𝑫 will now remove all ${_0x2f8982.length} foreigners from this group chat in the next second.\n\nGood bye Foreigners. 😔`
            }, {
              quoted: m
            });
            setTimeout(() => {
              client.groupParticipantsUpdate(m.chat, _0x2f8982, "remove");
              setTimeout(() => {
                m.reply("🎭 Done. All foreigners removed successfully.");
              }, 1000);
            }, 1000);
          }, 1000);
        }
      }
    },
  },

  // gcprofile (original Perez.js lines 4799-4829)
  {
    command: ['gcprofile'],
    aliases: [],
    description: 'Show the group info and picture',
    category: 'group',
    handler: async (client, m) => {
    let pp;

    {
    		      function convertTimestamp(timestamp) {
      const d = new Date(timestamp * 1000);
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return {
        date: d.getDate(),
        month: new Intl.DateTimeFormat('en-US', { month: 'long' }).format(d),
        year: d.getFullYear(),
        day: daysOfWeek[d.getUTCDay()],
        time: `${d.getUTCHours()}:${d.getUTCMinutes()}:${d.getUTCSeconds()}`
      }
    }

    if (!m.isGroup) return m.reply("This command is meant for groups");

    let info = await client.groupMetadata(m.chat);

    let ts = await convertTimestamp(info.creation);

    try {
            pp = await client.profilePictureUrl(m.chat, 'image');
          } catch {
            pp = 'https://files.catbox.moe/0uzc42.jpg';
          }

    await client.sendMessage(m.chat, { image: { url: pp },
              caption: `_Name_ : *${info.subject}*\n\n_ID_ : *${info.id}*\n\n_Group owner_ : ${'@'+info.owner.split('@')[0]} || 'No Creator'\n\n_Group created_ : *${ts.day}, ${ts.date} ${ts.month} ${ts.year}, ${ts.time}*\n\n_Participants_ : *${info.size}*\n_Members_ : *${info.participants.filter((p) => p.admin == null).length}*\n\n_Admins_ : *${Number(info.participants.length - info.participants.filter((p) => p.admin == null).length)}*\n\n_Who can send message_ : *${info.announce == true ? 'Admins' : 'Everyone'}*\n\n_Who can edit group info_ : *${info.restrict == true ? 'Admins' : 'Everyone'}*\n\n_Who can add participants_ : *${info.memberAddMode == true ? 'Everyone' : 'Admins'}*`
            }, {quoted: m })

    }
    },
  },

  // hidetag (original Perez.js lines 3948-3954)
  {
    command: ['hidetag'],
    aliases: ['tag'],
    description: 'Mention everyone with a hidden tag',
    category: 'group',
    handler: async (client, m, { admin, botAdmin, group, isAdmin, isBotAdmin, participants, q }) => {
    {
                 if (!m.isGroup) throw group;
                 if (!isBotAdmin) throw botAdmin;
                 if (!isAdmin) throw admin;
                client.sendMessage(m.chat, { text : q ? q : '😅𝗕𝗹𝗶𝗻𝗱 𝗧𝗮𝗴𝘀😅' , mentions: participants.map(a => a.id)}, { quoted: m });
                 }
    },
  },

  // icon (original Perez.js lines 3882-3893)
  {
    command: ['icon'],
    aliases: [],
    description: 'Change the group profile picture',
    category: 'group',
    handler: async (client, m, { admin, botAdmin, command, group, isAdmin, isBotAdmin, mime, prefix, quoted, reply }) => {
    {
        if (!m.isGroup) throw group;
        if (!isAdmin) throw admin;
        if (!isBotAdmin) throw botAdmin;
        if (!quoted) throw `Send or tag an image with the caption ${prefix + command}`;
        if (!/image/.test(mime)) throw `Send or tag an image with the caption ${prefix + command}`;
        if (/webp/.test(mime)) throw `Send or tag an image with the caption ${prefix + command}`;
        let media = await client.downloadAndSaveMediaMessage(quoted);
        await client.updateProfilePicture(m.chat, { url: media }).catch((err) => fs.unlinkSync(media));
        reply('Group icon updated');
        }
    },
  },

  // leave (original Perez.js lines 3919-3926)
  {
    command: ['leave'],
    aliases: [],
    description: 'Make the bot leave the group',
    category: 'group',
    handler: async (client, m, { NotOwner, Owner, botname, group, participants }) => {
    {
                     if (!Owner) throw NotOwner;
    		 if (!m.isGroup) throw group;
     await client.sendMessage(m.chat, { text : `𝗚𝗼𝗼𝗱𝗯𝘆𝗲 𝗲𝘃𝗲𝗿𝘆𝗼𝗻𝗲👋. ${botname} 𝗔𝗶 𝗶𝘀 𝗟𝗲𝗮𝘃𝗶𝗻𝗴 𝘁𝗵𝗲 𝗚𝗿𝗼𝘂𝗽 𝗻𝗼𝘄...` , mentions: participants.map(a => a.id)}, { quoted : m });
                     await client.groupLeave(m.chat);

                 }
    },
  },

  // linkgroup (original Perez.js lines 4590-4596)
  {
    command: ['linkgroup'],
    aliases: ['link'],
    description: 'Get the group invite link',
    category: 'group',
    handler: async (client, m, { botAdmin, group, groupMetadata, isBotAdmin }) => {
    {
                     if (!m.isGroup) throw group;
                     if (!isBotAdmin) throw botAdmin;
                     let response = await client.groupInviteCode(m.chat);
                     client.sendText(m.chat, `https://chat.whatsapp.com/${response}\n\nGroup link for  ${groupMetadata.subject}`, m, { detectLink: true });
                 }
    },
  },

  // open (original Perez.js lines 3754-3763)
  {
    command: ['open'],
    aliases: ['unmute'],
    description: 'Unlock the group so everyone can send messages',
    category: 'group',
    handler: async (client, m, { admin, botAdmin, group, isAdmin, isBotAdmin }) => {
    {
                     if (!m.isGroup) throw group;
                     if (!isBotAdmin) throw botAdmin;
                     if (!isAdmin) throw admin;

                         await client.groupSettingUpdate(m.chat, 'not_announcement');
     m.reply('Group successfully unlocked!');

     }
    },
  },

  // promote (original Perez.js lines 3831-3841)
  {
    command: ['promote'],
    aliases: [],
    description: 'Promote a member to admin',
    category: 'group',
    handler: async (client, m, { admin, botAdmin, group, isAdmin, isBotAdmin, text }) => {
    {
                     if (!m.isGroup) throw group;
             if (!isBotAdmin) throw botAdmin;
             if (!isAdmin) throw admin;
     if (!m.quoted) throw `Ttag someone with the command!`;
                     let users = m.mentionedJid[0] ? m.mentionedJid : m.quoted ? [m.quoted.sender] : [text.replace(/[^0-9]/g, '')+'@s.whatsapp.net'];

                     await client.groupParticipantsUpdate(m.chat, users, 'promote');
     m.reply('Successfully promoted! 🦄');
             }
    },
  },

  // reject (original Perez.js lines 3134-3154)
  {
    command: ['reject'],
    aliases: ['reject-all'],
    description: 'Reject all pending join requests',
    category: 'group',
    handler: async (client, m, { admin, botAdmin, group, isAdmin, isBotAdmin }) => {
    {
    	if (!m.isGroup) throw group;
    if (!isAdmin) throw admin;
    if (!isBotAdmin) throw botAdmin;

    const responseList = await client.groupRequestParticipantsList(m.chat);

    if (responseList.length === 0) return m.reply("𝗛𝘂𝗵, 𝗡𝗼 𝗽𝗲𝗻𝗱𝗶𝗻𝗴 𝗷𝗼𝗶𝗻 𝗿𝗲𝗾𝘂𝗲𝘀𝘁𝘀 𝘁𝗵𝗶𝘀 𝘁𝗶𝗺𝗲");

    for (const participan of responseList) {
        const response = await client.groupRequestParticipantsUpdate(
            m.chat,
            [participan.jid], // Approve/reject each participant individually
            "reject" // or "reject"
        );
        console.log(response);
    }
    m.reply("𝗣𝗲𝗻𝗱𝗶𝗻𝗴 𝗣𝗮𝗿𝘁𝗶𝗰𝗶𝗽𝗮𝗻𝘁𝘀 𝗵𝗮𝘃𝗲 𝗯𝗲𝗲𝗻 𝗿𝗲𝗷𝗲𝗰𝘁𝗲𝗱!");

    }
    },
  },

  // remove (original Perez.js lines 3185-3206)
  {
    command: ['remove'],
    aliases: ['kick'],
    description: 'Remove a member from the group',
    category: 'group',
    handler: async (client, m, { admin, botAdmin, group, isAdmin, isBotAdmin }) => {
    {

           if (!m.isGroup) throw group;
           if (!isBotAdmin) throw botAdmin;
          if (!isAdmin) throw admin;

        if (!m.quoted && (!m.mentionedJid || m.mentionedJid.length === 0)) {
                return m.reply("Who should i remove !?");
            }
            let users = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null;
            const parts = users.split('@')[0];

    if (users == "254781346242@s.whatsapp.net") return m.reply("It's an Owner Number! 😡");

    	  if (users  == client.decodeJid(client.user.id)) throw 'I cannot remove Myself 😡';

                     await client.groupParticipantsUpdate(m.chat, [users], 'remove');

            m.reply(`@${parts} has been removed successfully!`);

    }
    },
  },

  // revoke (original Perez.js lines 3894-3908)
  {
    command: ['revoke'],
    aliases: ['newlink', 'reset'],
    description: 'Reset the group invite link',
    category: 'group',
    handler: async (client, m, { admin, botAdmin, group, groupMetadata, isAdmin, isBotAdmin }) => {
    {
       if (!m.isGroup) throw group; // add "new Error" to create a new Error object
       if (!isAdmin) throw admin; // add "new Error" to create a new Error object
       if (!isBotAdmin) throw botAdmin; // add "new Error" to create a new Error object
       await client.groupRevokeInvite(m.chat);
       await client.sendText(m.chat, 'Group link revoked!', m); // use "client.sendText" instead of "m.reply" to ensure message is sent
       let response = await client.groupInviteCode(m.chat);
     client.sendText(m.sender, `https://chat.whatsapp.com/${response}\n\nHere is the new group link for ${groupMetadata.subject}`, m, { detectLink: true });
     client.sendText(m.chat, `Sent you the new group link in your inbox!`, m);
       // use "client.sendTextWithMentions" instead of "client.sendText" to include group name in message
     }
    },
  },

  // subject (original Perez.js lines 3930-3938)
  {
    command: ['subject'],
    aliases: ['changesubject'],
    description: 'Change the group name',
    category: 'group',
    handler: async (client, m, { admin, botAdmin, group, isAdmin, isBotAdmin, text }) => {
    {
                     if (!m.isGroup) throw group;
                     if (!isBotAdmin) throw botAdmin;
                     if (!isAdmin) throw admin;
                     if (!text) throw 'Provide the text for the group subject.';
                     await client.groupUpdateSubject(m.chat, text);
     m.reply('Group name successfully updated! 💀');
                 }
    },
  },

  // tagall (original Perez.js lines 3955-3967)
  {
    command: ['tagall'],
    aliases: [],
    description: 'Mention every member of the group',
    category: 'group',
    handler: async (client, m, { admin, botAdmin, group, isAdmin, isBotAdmin, participants, q }) => {
    {
                     if (!m.isGroup) throw group;
                     if (!isBotAdmin) throw botAdmin;
                     if (!isAdmin) throw admin;
     let teks = `𝗢𝗻𝗹𝘆 𝗳𝗼𝗼𝗹𝘀 𝗮𝗿𝗲 𝘁𝗮𝗴𝗴𝗲𝗱 𝗵𝗲𝗿𝗲😅:

      Message ${q ? q : ''}*\n\n`;
                     for (let mem of participants) {
                     teks += `📧 @${mem.id.split('@')[0]}\n`;
                     }
                     client.sendMessage(m.chat, { text: teks, mentions: participants.map(a => a.id) }, { quoted: m });
                     }
    },
  },

  // vcf (original Perez.js lines 2847-2874)
  {
    command: ['vcf'],
    aliases: ['group-vcf'],
    description: 'Export all group contacts as a VCF file',
    category: 'group',
    handler: async (client, m, { participants }) => {
    {
    if (!m.isGroup) return m.reply("Command meant for groups");

    const fs = require("fs");
    let gcdata = await client.groupMetadata(m.chat)
    let gcmem = participants.map(a => a.id)

    let vcard = ''
    let noPort = 0

    for (let a of gcdata.participants) {
        vcard += `BEGIN:VCARD\nVERSION:3.0\nFN:[${noPort++}] +${a.id.split("@")[0]}\nTEL;type=CELL;type=VOICE;waid=${a.id.split("@")[0]}:+${a.id.split("@")[0]}\nEND:VCARD\n`
    }

    let cont = './contacts.vcf'

    await m.reply('𝗔 𝗺𝗼𝗺𝗲𝗻𝘁, ℙ𝔼ℝ𝔼ℤ-𝕄𝔻 𝗶𝘀 𝗖𝗼𝗺𝗽𝗶𝗹𝗶𝗻𝗴 '+gcdata.participants.length+' 𝗖𝗼𝗻𝘁𝗮𝗰𝘁𝘀 𝗶𝗻𝘁𝗼 𝗮 𝗩𝗰𝗳...');

    await fs.writeFileSync(cont, vcard.trim())

    await client.sendMessage(m.chat, {
        document: fs.readFileSync(cont), mimetype: 'text/vcard', fileName: 'Group contacts.vcf', caption: 'VCF for '+gcdata.subject+'\n'+gcdata.participants.length+' contacts'
    }, {ephemeralExpiration: 86400, quoted: m})
    fs.unlinkSync(cont)

    }
    },
  },
];
