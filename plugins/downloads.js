

const axios = require('axios');
const yts = require('yt-search');
const { fetchJson } = require('../lib/dreadfunc');
const { getAudio, getVideo } = require('../lib/ytaudio');
const { collectUrls, KEITH_HOSTS } = require('../lib/ytaudio');

const CAPTION = "𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗗 𝗕𝗬 𝗧𝗘𝗦𝗟𝗔-𝗠𝗗";
const BROWSER = 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36';

async function keithGet(path, link, accept, timeout = 60000) {
  const failures = [];
  for (const host of KEITH_HOSTS) {
    try {
      const response = await axios.get(`${host}${path}?url=${encodeURIComponent(link)}`, { timeout, validateStatus: () => true });
      if (response.status < 200 || response.status >= 300) throw new Error(`HTTP ${response.status}`);
      if (!accept(response.data)) throw new Error('no media in the reply');
      return response.data;
    } catch (error) {
      failures.push(`${host.replace(/^https?:\/\//, '').split('.')[0]}: ${error.message || error}`);
    }
  }
  throw new Error(failures.join('; '));
}

async function sendMedia(client, m, kind, url, extra = {}) {
  const content = (source) => (kind === 'video'
    ? { video: source, mimetype: 'video/mp4', caption: CAPTION, ...extra }
    : { image: source, caption: CAPTION, ...extra });
  try {
    await client.sendMessage(m.chat, content({ url }), { quoted: m });
  } catch (error) {
    const download = await axios.get(url, { responseType: 'arraybuffer', timeout: 90000, headers: { 'User-Agent': BROWSER } });
    await client.sendMessage(m.chat, content(Buffer.from(download.data)), { quoted: m });
  }
}

const looksLikeVideo = (url) => /\.mp4(\?|$)|video/i.test(url) && !/\.(jpe?g|png|webp)(\?|$)/i.test(url);

module.exports = [

  {
    command: ['apk'],
    aliases: ['app'],
    description: 'Download an Android app',
    category: 'downloads',
    handler: async (client, m, { reply, text }) => {
    {
              if (!text) return reply("Where is the app name?");
            let kyuu = await fetchJson (`https://api.bk9.dev/search/apk?q=${text}`);
            let tylor = await fetchJson (`https://api.bk9.dev/download/apk?id=${kyuu.BK9[0].id}`);
             await client.sendMessage(
                  m.chat,
                  {
                    document: { url: tylor.BK9.dllink },
                    fileName: tylor.BK9.name,
                    mimetype: "application/vnd.android.package-archive",
                    contextInfo: {
            externalAdReply: {
              title: `TESLA-𝗠𝗗`,
              body: `${tylor.BK9.name}`,
              thumbnailUrl: `${tylor.BK9.icon}`,
              sourceUrl: `${tylor.BK9.dllink}`,
              mediaType: 2,
              showAdAttribution: true,
              renderLargerThumbnail: false
            }
          }
        }, { quoted: m });
              }
    },
  },

  {
    command: ['facebook'],
    aliases: ['fb', 'fbdl'],
    description: 'Download a Facebook video',
    category: 'downloads',
    handler: async (client, m, { text }) => {
      const link = (text || '').trim();
      if (!/^https?:\/\//i.test(link)) return m.reply('Provide a valid Facebook video link!');
      try {
        let videoUrl = null;
        try {
          const data = await keithGet('/download/fbdown', link, (d) => d && d.result && d.result.media && (d.result.media.hd || d.result.media.sd));
          videoUrl = data.result.media.hd || data.result.media.sd;
        } catch (error) {
          console.error('[FB] Keith API failed:', error.message || error);
        }
        if (!videoUrl) {
          try {
            const response = await axios.get(`https://api.bk9.dev/download/fb?url=${encodeURIComponent(link)}`, { timeout: 40000 });
            const bk9 = response.data && response.data.BK9;
            videoUrl = bk9 && (bk9.hd || bk9.sd || bk9.url || (typeof bk9 === 'string' ? bk9 : null));
          } catch (error) {
            console.error('[FB] bk9 failed:', error.message || error);
          }
        }
        if (!videoUrl) return m.reply('Failed to fetch the Facebook video. Make sure the link is public and valid.');
        await sendMedia(client, m, 'video', videoUrl);
      } catch (error) {
        console.error('[FB] Error:', error.message || error);
        m.reply('Error downloading the Facebook video.');
      }
    }
  },

  {
    command: ['gitclone'],
    aliases: [],
    description: 'Download a GitHub repository as a zip',
    category: 'downloads',
    handler: async (client, m, { text }) => {
    {
    		      if (!text) return m.reply(`Where is the link?`)
    if (!text.includes('github.com')) return m.reply(`Is that a GitHub repo link ?!`)
    let regex1 = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i
        let [, user3, repo] = text.match(regex1) || []
        repo = repo.replace(/.git$/, '')
        let url = `https://api.github.com/repos/${user3}/${repo}/zipball`
        let filename = (await fetch(url, {method: 'HEAD'})).headers.get('content-disposition').match(/attachment; filename=(.*)/)[1]
        await client.sendMessage(m.chat, { document: { url: url }, fileName: filename+'.zip', mimetype: 'application/zip' }, { quoted: m }).catch((err) => m.reply("error"))

    		    }
    },
  },

  {
    command: ['instagram'],
    aliases: ['igdl', 'ig', 'insta'],
    description: 'Download an Instagram photo, video or reel',
    category: 'downloads',
    handler: async (client, m, { text }) => {
      const link = ((text || '').trim().split(/\s+/).find((word) => /instagram\.com/i.test(word)) || '').trim();
      if (!link) return m.reply('Provide an Instagram link.\nExample: .ig https://www.instagram.com/p/xxxxx');
      try {
        let clean = link;
        try {
          const parsed = new URL(link);
          clean = `${parsed.origin}${parsed.pathname}`.replace(/\/?$/, '/');
        } catch (error) { }
        const isReel = /\/(reel|reels|tv)\//i.test(clean);

        const fromKeith = (path) => async () => {
          const data = await keithGet(path, clean, (d) => collectUrls(d).some((u) => !/instagram\.com\//i.test(u)), 100000);
          return collectUrls(data).filter((u) => !/^https?:\/\/(www\.)?instagram\.com\//i.test(u));
        };
        const fromBk9 = (endpoint) => async () => {
          const response = await axios.get(`https://api.bk9.dev/download/${endpoint}?url=${encodeURIComponent(clean)}`, { timeout: 40000 });
          if (!response.data || !response.data.status || !response.data.BK9) throw new Error('unsuccessful reply');
          return collectUrls(response.data.BK9);
        };

        const attempts = [fromKeith('/download/instagramdl'), fromKeith('/download/instadl'), fromBk9('instagram'), fromBk9('instagram2')]
          .map((run) => run().then((urls) => {
            if (urls.length === 0) throw new Error('no media');
            const items = [...new Set(urls)].map((url) => ({ url, isVideo: looksLikeVideo(url) }));
            if (isReel && !items.some((item) => item.isVideo)) throw new Error('only a thumbnail was returned for a reel');
            return items;
          }));

        let items;
        try {
          items = await Promise.any(attempts);
        } catch (error) {
          console.error('[IG] every source failed:', (error.errors || []).map((e) => e.message).join('; '));
          return m.reply('Failed to fetch the Instagram media. Make sure the post is public and the link is correct, then try again in a minute.');
        }

        const seen = new Set();
        items = items.filter((item) => {
          let key = item.url;
          try { key = new URL(item.url).pathname; } catch (error) { }
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        if (isReel) items = [items.find((item) => item.isVideo)];

        for (const item of items.slice(0, 10)) {
          await sendMedia(client, m, item.isVideo ? 'video' : 'image', item.url);
        }
      } catch (error) {
        console.error('[IG] Error:', error.message || error);
        m.reply('Error downloading the Instagram media.');
      }
    }
  },

  {
    command: ['pinterest'],
    aliases: ['pin', 'pindl'],
    description: 'Download Pinterest media',
    category: 'downloads',
    handler: async (client, m, { text }) => {
      const link = (text || '').trim();
      if (!/^https?:\/\//i.test(link)) return m.reply('Provide a valid Pinterest link!');
      try {
        let data;
        try {
          data = await keithGet('/download/pindl2', link, (d) => d && d.result && d.result.success && Array.isArray(d.result.medias) && d.result.medias.length > 0, 100000);
        } catch (error) {
          console.error('[PIN] Keith API failed:', error.message || error);
          return m.reply('Failed to fetch the Pinterest media.');
        }
        for (const media of data.result.medias) {
          if (!media.url) continue;
          const isVideo = media.videoAvailable || media.extension === 'mp4';
          try {
            await sendMedia(client, m, isVideo ? 'video' : 'image', media.url);
          } catch (error) {
            console.error('[PIN] Could not send one file:', error.message || error);
          }
        }
      } catch (error) {
        console.error('[PIN] Error:', error.message || error);
        m.reply('Error downloading the Pinterest media.');
      }
    }
  },

  {
    command: ['play'],
    aliases: [],
    description: 'Download a song as audio',
    category: 'downloads',
    handler: async (client, m, { from, text }) => {
    {
     if (!text) {
          return client.sendMessage(from, { text: 'Please provide a song name.' }, { quoted: m });
        }

    try {
         const search = await yts(text);
         const video = search.videos[0];

            if (!video) {
              return client.sendMessage(from, {
                text: 'No results found for your query.'
              }, { quoted: m });
            }

    m.reply("_Please wait your download is in progress_");

            const safeTitle = video.title.replace(/[\\/:*?"<>|]/g, '');
            const fileName = `${safeTitle}.mp3`;

            const audio = await getAudio(video.url);
            try {
              await client.sendMessage(from, {
                document: { url: audio.url },
                mimetype: audio.source === 'yt-dlp' ? 'audio/mp4' : 'audio/mpeg',
                caption: CAPTION,
                fileName: audio.source === 'yt-dlp' ? `${safeTitle}.m4a` : fileName
              }, { quoted: m });
            } finally {
              await audio.cleanup();
            }

          } catch (err) {
            console.error('[PLAY] Error:', err);
            await client.sendMessage(from, {
              text: 'An error occurred while processing your request.'
            }, { quoted: m });
    }
    }
    },
  },

  {
    command: ['play2'],
    aliases: [],
    description: 'Download a song by name',
    category: 'downloads',
    handler: async (client, m, { text }) => {
    {
    		     const yts = require("yt-search");

        try {
            if (!text) return m.reply("What song do you want to download?");

            const { videos } = await yts(text);
            if (!videos || videos.length === 0) return m.reply("No songs found!");

            const urlYt = videos[0].url;
            let data = await fetchJson(`https://api.dreaded.site/api/ytdl/audio?url=${urlYt}`);

            if (!data || !data.result || !data.result.download || !data.result.download.url) {
                return m.reply("Failed to fetch audio from the API.");
            }

            const {
                metadata: { title, thumbnail, duration, author },
                download: { url: audioUrl, quality, filename },
            } = data.result;

            await client.sendMessage(m.chat, {
     document: {url: audioUrl },
    mimetype: "audio/mpeg",
    caption: CAPTION,
     fileName: filename }, { quoted: m });

            await client.sendMessage(
                m.chat,
                {
                    audio: { url: audioUrl },
                    mimetype: "audio/mpeg",
                    fileName: filename,
                },
                { quoted: m }
            );
        } catch (error) {
            m.reply("Download failed\n" + error.message);
        }
    }
    },
  },

  {
    command: ['song'],
    aliases: ['music'],
    description: 'Download a song as audio',
    category: 'downloads',
    handler: async (client, m, { from, text }) => {
    {
     if (!text) {
          return client.sendMessage(from, { text: 'Please provide a song name.' }, { quoted: m });
        }

    try {
         const search = await yts(text);
         const video = search.videos[0];

            if (!video) {
              return client.sendMessage(from, {
                text: 'No results found for your query.'
              }, { quoted: m });
            }

    m.reply("_Please wait your download is in progress_");

            const safeTitle = video.title.replace(/[\\/:*?"<>|]/g, '');
            const fileName = `${safeTitle}.mp3`;

            const audio = await getAudio(video.url);
            try {
              await client.sendMessage(from, {
                audio: { url: audio.url },
                mimetype: audio.source === 'yt-dlp' ? 'audio/mp4' : 'audio/mpeg',
                fileName: audio.source === 'yt-dlp' ? `${safeTitle}.m4a` : fileName
              }, { quoted: m });
            } finally {
              await audio.cleanup();
            }

          } catch (err) {
            console.error('[PLAY] Error:', err);
            await client.sendMessage(from, {
              text: 'An error occurred while processing your request.'
            }, { quoted: m });
    }
    }
    },
  },

  {
    command: ['song2'],
    aliases: [],
    description: 'Download a song by name',
    category: 'downloads',
    handler: async (client, m, { text }) => {
    {
    		     const ytSearch = require('yt-search');
    const fetch = require('node-fetch');

      const getDownloadData = async (apiUrl) => {
        const response = await fetch(apiUrl);
        return response.json();
      };

      try {

        if (!text || text.trim().length === 0) {
          return m.reply('What song do you want to download ?');
        }

        const searchResults = await ytSearch(text);

        if (!searchResults || !searchResults.videos.length) {
          return m.reply('No video found for the specified query.');
        }

        const firstVideo = searchResults.videos[0];
        const videoUrl = firstVideo.url;
    	  m.reply(`_Please wait your download on progress..._`)

        let downloadData;
        let downloadUrl;
        let videoDetails;

        downloadData = await getDownloadData(`https://api.giftedtech.my.id/api/download/dlmp3?url=${encodeURIComponent(videoUrl)}&apikey=gifted`);
        if (downloadData.success) {
          downloadUrl = downloadData.result.download_url;
          videoDetails = downloadData.result;
        } else {

          downloadData = await getDownloadData(`https://www.dark-yasiya-api.site/download/ytmp3?url=${encodeURIComponent(videoUrl)}`);
          if (downloadData.success) {
            downloadUrl = downloadData.result.download_url;
            videoDetails = downloadData.result;
          } else {

            downloadData = await getDownloadData(`https://api.dreaded.site/api/ytdl/audio?url=${encodeURIComponent(videoUrl)}`);
            if (downloadData.success) {
              downloadUrl = downloadData.result.download_url;
              videoDetails = downloadData.result;
            }
          }
        }

        if (!downloadUrl || !videoDetails) {
          return m.reply('Failed to retrieve download URL from all sources. Please try again later.');
        }

        const messagePayload = {
          audio: { url: downloadUrl },
          mimetype: 'audio/mp4',
          fileName: `${videoDetails.title}.mp3`
            };

        await client.sendMessage(m.chat, messagePayload, { quoted: m });

      } catch (error) {
        console.error('Error during download process:', error);
        return m.reply(`Download failed due to an error: ${error.message || error}`);
      }
          }
    },
  },

  {
    command: ['tiktok'],
    aliases: ['tikdl'],
    description: 'Download a TikTok video',
    category: 'downloads',
    handler: async (client, m, { text }) => {
    {
    const fetch = require("node-fetch");

        const fetchTikTokData = async (url, retries = 3) => {
            for (let attempt = 0; attempt < retries; attempt++) {
                const data = await fetchJson(url);
                if (
                    data &&
                    data.status === 200 &&
                    data.tiktok &&
                    data.tiktok.video &&
                    data.tiktok.description &&
                    data.tiktok.author.nickname &&
                    data.tiktok.statistics.likeCount
                ) {
                    return data;
                }
            }
            throw new Error("Failed to fetch valid TikTok data after multiple attempts.");
        };

        try {
            if (!text) return m.reply("Provide a TikTok link for the video.");
            if (!text.includes("tiktok.com")) return m.reply("That is not a valid TikTok link.");

            const url = `https://api.dreaded.site/api/tiktok?url=${text}`;
            const data = await fetchTikTokData(url);

            const tikVideoUrl = data.tiktok.video;
            const tikDescription = data.tiktok.description || "No description available";
            const tikAuthor = data.tiktok.author.nickname || "Unknown Author";
            const tikLikes = data.tiktok.statistics.likeCount || "0";
            const tikComments = data.tiktok.statistics.commentCount || "0";
            const tikShares = data.tiktok.statistics.shareCount || "0";

            const caption = `🎥 TikTok Video\n\n📌 *Description:* ${tikDescription}\n👤 *Author:* ${tikAuthor}\n❤️ *Likes:* ${tikLikes}\n💬 *Comments:* ${tikComments}\n🔗 *Shares:* ${tikShares}`;

            m.reply(`Data fetched successfully✅ wait a moment. . .`);

            const response = await fetch(tikVideoUrl);

            if (!response.ok) {
                throw new Error(`Failed to download video: HTTP ${response.status}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            const videoBuffer = Buffer.from(arrayBuffer);

            await client.sendMessage(m.chat, {
                video: videoBuffer,
                mimetype: "video/mp4",
                caption: CAPTION,
            }, { quoted: m });

        } catch (error) {
            m.reply(`Error: ${error.message}`);
        }
    }
    },
  },

  {
    command: ['twitter'],
    aliases: ['twtdl', 'xdl'],
    description: 'Download a Twitter/X video or image',
    category: 'downloads',
    handler: async (client, m, { text }) => {
      const link = (text || '').trim();
      const tweetId = (link.match(/(?:twitter\.com|x\.com)\/.+\/status\/(\d+)/) || [])[1];
      if (!tweetId) return m.reply('Provide a valid Twitter/X post link!\nExample: .twitter https://x.com/user/status/123456');
      try {
        const response = await axios.get(`https://api.fxtwitter.com/i/status/${tweetId}`, { timeout: 30000, headers: { 'User-Agent': 'Mozilla/5.0' } });
        const tweet = response.data && response.data.tweet;
        if (!tweet) return m.reply('Tweet not found, or it is from a private account.');
        const media = tweet.media || {};
        if (media.videos && media.videos.length > 0) {
          const video = media.videos[0];
          await sendMedia(client, m, 'video', video.url, { gifPlayback: video.type === 'gif' });
        } else if (media.photos && media.photos.length > 0) {
          for (const photo of media.photos) await sendMedia(client, m, 'image', photo.url);
        } else {
          m.reply('That post has no video or image.');
        }
      } catch (error) {
        console.error('[TWITTER] Error:', error.message || error);
        m.reply(`Failed to download: ${(error.response && error.response.data && error.response.data.message) || error.message || 'Unknown error'}`);
      }
    }
  },

  {
    command: ['video'],
    aliases: [],
    description: 'Download a video by name',
    category: 'downloads',
    handler: async (client, m, { text }) => {
    {
    const axios = require('axios');
    const ytSearch = require('yt-search');

      if (!text) {
        return m.reply("What video do you want to download ?");
      }

      try {

        const searchResults = await ytSearch(text);

        if (!searchResults || !searchResults.videos.length) {
          return m.reply('No video found for the specified query.');
        }

        const firstVideo = searchResults.videos[0];
        const videoUrl = firstVideo.url;

        const getDownloadData = async (url) => {
          try {
            const response = await axios.get(url);
            return response.data;
          } catch (error) {
            console.error('Error fetching data from API:', error);
            return { success: false };
          }
        };

        try {
          const kv = await getVideo(videoUrl);
          await client.sendMessage(m.chat, {
            video: { url: kv.url },
            mimetype: 'video/mp4',
            caption: CAPTION,
            fileName: `${kv.title || firstVideo.title}.mp4`,
          }, { quoted: m });
          return;
        } catch (error) {
          console.error('[VIDEO] Keith API failed:', error.message || error);
        }

        const apis = [
          `https://api-rin-tohsaka.vercel.app/download/ytmp4?url=${encodeURIComponent(videoUrl)}`,
          `https://api.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(videoUrl)}`,
          `https://www.dark-yasiya-api.site/download/ytmp4?url=${encodeURIComponent(videoUrl)}`,
          `https://api.giftedtech.web.id/api/download/dlmp4?url=${encodeURIComponent(videoUrl)}&apikey=gifted-md`,
          `https://api.dreaded.site/api/ytdl/video?url=${encodeURIComponent(videoUrl)}`
        ];

        let downloadData;
        for (const api of apis) {
          downloadData = await getDownloadData(api);
          if (downloadData && downloadData.success) break;
        }

        if (!downloadData || !downloadData.success) {
          return m.reply('Failed to fetch audio from the API');
        }

        const downloadUrl = downloadData.result.download_url;
        const videoDetails = downloadData.result;

        const messagePayload = {
          document: { url: downloadUrl },
          mimetype: 'video/mpeg',
          caption: CAPTION,
          fileName: `${videoDetails.title}.mp3`,
        };

    	const messagePaylod = {
          video: { url: downloadUrl },
          mimetype: 'video/mp4',
          caption: CAPTION,
          fileName: `${videoDetails.title}.mp4`,
        };

        await client.sendMessage(m.chat, messagePayload, { quoted: m });

        await client.sendMessage(m.chat, messagePaylod, { quoted: m });

      } catch (error) {
        console.error('Error during download process:', error);
        return m.reply(`Download failed due to an error: ${error.message || error}`);
      }
    							     }
    },
  },

  {
    command: ['ytmp3'],
    aliases: ['yta'],
    description: 'Download YouTube audio from a link',
    category: 'downloads',
    handler: async (client, m, { text }) => {
    {
    const ytSearch = require("yt-search");
    const fetch = require('node-fetch');
    try {

    if (!text) return m.reply("𝗣𝗿𝗼𝘃𝗶𝗱𝗲 𝗮 𝘃𝗮𝗹𝗶𝗱 𝗬𝗼𝘂𝘁𝘂𝗯𝗲 𝗹𝗶𝗻𝗸!")

    	let urls = text.match(/(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch\?v=|v\/|embed\/|shorts\/|playlist\?list=)?)([a-zA-Z0-9_-]{11})/gi);
    	if (!urls) return m.reply('𝗧𝗵𝗶𝘀 𝗶𝘀 𝗻𝗼𝘁 𝗮 𝗬𝗼𝘂𝘁𝘂𝗯𝗲 𝗟𝗶𝗻𝗸');
    	let urlIndex = parseInt(text) - 1;
    	if (urlIndex < 0 || urlIndex >= urls.length)
    		return m.reply('𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗟𝗶𝗻𝗸.');

            const { videos } = await yts(text);
            if (!videos || videos.length === 0) return m.reply("No songs found!");

            const urlYt = videos[0].url;
            const audio = await getAudio(urlYt);
            try {
                await client.sendMessage(
                    m.chat,
                    {
                        audio: { url: audio.url },
                        mimetype: audio.source === 'yt-dlp' ? "audio/mp4" : "audio/mpeg",
                        fileName: `${audio.title || videos[0].title}.${audio.source === 'yt-dlp' ? 'm4a' : 'mp3'}`,
                    },
                    { quoted: m }
                );
            } finally {
                await audio.cleanup();
            }
        } catch (error) {
            m.reply("Download failed\n" + error.message);
        }
    }
    },
  },

  {
    command: ['ytmp4'],
    aliases: ['ytv'],
    description: 'Download a YouTube video from a link',
    category: 'downloads',
    handler: async (client, m, { text }) => {
    {
    	try {

    if (!text) return m.reply("𝗣𝗿𝗼𝘃𝗶𝗱𝗲 𝗮 𝘃𝗮𝗹𝗶𝗱 𝗬𝗼𝘂𝗧𝘂𝗯𝗲 𝗹𝗶𝗻𝗸!")

            let urls = text.match(/(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch\?v=|v\/|embed\/|shorts\/|playlist\?list=)?)([a-zA-Z0-9_-]{11})/gi);
            if (!urls) return m.reply('𝗧𝗵𝗶𝘀 𝗶𝘀 𝗻𝗼𝘁 𝗮 𝗬𝗼𝘂𝗧𝘂𝗯𝗲 𝗹𝗶𝗻𝗸');
            let urlIndex = parseInt(text) - 1;
            if (urlIndex < 0 || urlIndex >= urls.length)
                    return m.reply('𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗹𝗶𝗻𝗸.');

            const { videos } = await yts(text);
            if (!videos || videos.length === 0) return m.reply("No songs found!");

            const urlYt = videos[0].url;
            const video = await getVideo(urlYt);

            await client.sendMessage(
                m.chat,
                {
                    video: { url: video.url },
                    mimetype: "video/mp4",
                    fileName: `${video.title || videos[0].title}.mp4`,
                },
                { quoted: m }
            );
        } catch (error) {
            m.reply("Download failed\n" + error.message);
        }
    }
    },
  },

  {
    command: ['ytsearch'],
    aliases: ['yts'],
    description: 'Search YouTube',
    category: 'downloads',
    handler: async (client, m, { reply, text }) => {
    {
            if (!text) {
                reply('Provide a search term!\E.g: Alan walker alone')
                return;
            }
            const term = text;
            const {
                videos
            } = await yts(term);
            if (!videos || videos.length <= 0) {
                reply(`No Matching videos found for : *${term}*!!`)
                return;
            }
            const length = videos.length < 10 ? videos.length : 10;
            let tex = `YouTube Search\n🔍 Query ~> ${term}\n\n`;
            for (let i = 0; i < length; i++) {
                tex += `Link ~> ${videos[i].url}\nChannel ~> ${videos[i].author.name}\nTitle ~> ${videos[i].title}\n\n`;
            }
            reply(tex)
            return;
        }
    },
  },
];
