// Tools & info commands.
// Commands: calculate, define, github, google, gpass, img, inspect, lyrics, movie, screenshot, trt, tts, weather, whatsong, wikipedia
const acrcloud = require('acrcloud');
const axios = require('axios');
const cheerio = require('cheerio');
const crypto = require('crypto');
const fs = require('fs');
const ytdl = require('ytdl-core');
const yts = require('yt-search');
const { fetchJson } = require('../lib/dreadfunc');

module.exports = [
  // calculate (original Perez.js lines 736-757)
  {
    command: ['calculate'],
    aliases: ['calc'],
    description: 'Calculate a math expression',
    category: 'tools',
    handler: async (client, m, { text }) => {
    {
    try {
        if (!text) {
          return m.reply("*Example usage:* .calculate 5+72");
        }

        // Validate the input to prevent unsafe operations
        if (!/^[0-9+\-*/().\s]+$/.test(text)) {
          return m.reply("Invalid format. Only numbers and +, -, *, /, ( ) are allowed.");
        }

        // Evaluate the mathematical expression
        let result = eval(text);

        // Reply with the result
        m.reply(`${result}`);
      } catch (e) {
        console.error("Error in .calculate command:", e);
        m.reply("Error in calculation. Please check your expression.");
      }
    }
    },
  },

  // define (original Perez.js lines 2057-2089)
  {
    command: ['define'],
    aliases: [],
    description: 'Look up the meaning of a word',
    category: 'tools',
    handler: async (client, m, { text }) => {
    {
    		      try {
            if (!text) {
                return m.reply('Please provide a word.');
            }

            const word = encodeURIComponent(text);

            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);

            if (!response.ok) {
                return m.reply('Failed to fetch data. Please try again later.');
            }

            const data = await response.json();

            if (!data || !data[0] || !data[0].meanings || data[0].meanings.length === 0) {
                return m.reply('No definitions found for the provided word.');
            }

            const definitionData = data[0];
            const definition = definitionData.meanings[0].definitions[0].definition;

            const message = `${definition}`;

            await client.sendMessage(m.chat, { text: message }, { quoted: m });

        } catch (error) {
            console.error("Error occurred:", error);
            m.reply('An error occurred while fetching the data. Please try again later.\n' + error);
        }
    }
    },
  },

  // github (original Perez.js lines 2342-2378)
  {
    command: ['github'],
    aliases: [],
    description: 'Show a GitHub user profile',
    category: 'tools',
    handler: async (client, m, { text }) => {
    {
     if (!text) return m.reply('Provide a github username to stalk');

    try {
    const response = await fetch(`https://itzpire.com/stalk/github-user?username=${text}`)

    const data = await response.json()

        const username = data.data.username;
        const nickname = data.data.nickname;
        const bio = data.data.bio;
        const profilePic = data.data.profile_pic;
        const url = data.data.url;
        const type = data.data.type;
        const isAdmin = data.data.admin;
        const company = data.data.company;
        const blog = data.data.blog;
        const location = data.data.location;
        const publicRepos = data.data.public_repo;
        const publicGists = data.data.public_gists;
        const followers = data.data.followers;
        const following = data.data.following;
        const createdAt = data.data.ceated_at;
        const updatedAt = data.data.updated_at;

    const message = `Username:- ${username}\n\nNickname:- ${nickname}\n\nBio:- ${bio}\n\nLink:- ${url}\n\nLocation:- ${location}\n\nFollowers:- ${followers}\n\nFollowing:- ${following}\n\nRepos:- ${publicRepos}\n\nCreated:- ${createdAt}`

    await client.sendMessage(m.chat, { image: { url: profilePic}, caption: message}, {quoted: m})

    } catch (error) {

    m.reply("Unable to fetch data\n" + error)

    }
          }
    },
  },

  // google (original Perez.js lines 2185-2206)
  {
    command: ['google'],
    aliases: [],
    description: 'Search Google',
    category: 'tools',
    handler: async (client, m, { text }) => {
    {
    		      const axios = require("axios");
            if (!text) {
                m.reply('Provide a search term!\nEg: .Google What is treason')
                return;
            }
            let {
                data
            } = await axios.get(`https://www.googleapis.com/customsearch/v1?q=${text}&key=AIzaSyDMbI3nvmQUrfjoCJYLS69Lej1hSXQjnWI&cx=baf9bdb0c631236e5`)
            if (data.items.length == 0) {
                m.reply("❌ Unable to find a result")
                return;
            }
            let tex = `GGOOGLE SEARCH\n🔍 Term:- ${text}\n\n`;
            for (let i = 0; i < data.items.length; i++) {
                tex += `🪧 Title:- ${data.items[i].title}\n🖥 Description:- ${data.items[i].snippet}\n🌐 Link:- ${data.items[i].link}\n\n`
            }
            m.reply(tex)

        }
    },
  },

  // gpass (original Perez.js lines 1198-1228)
  {
    command: ['gpass'],
    aliases: ['genpassword'],
    description: 'Generate a strong password',
    category: 'tools',
    handler: async (client, m, { args, from, reply }) => {
    {
    		      try {
            const length = args[0] ? parseInt(args[0]) : 12; // Default length is 12 if not provided
            if (isNaN(length) || length < 8) {
                return reply('Please provide a valid length for the password (Minimum 08 Characters).');
            }

            const generatePassword = (len) => {
                const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+[]{}|;:,.<>?';
                let password = '';
                for (let i = 0; i < len; i++) {
                    const randomIndex = crypto.randomInt(0, charset.length);
                    password += charset[randomIndex];
                }
                return password;
            };

            const password = generatePassword(length);
            const message = `Below is your password 🔥:`;

            // Send initial notification message
            await client.sendMessage(from, { text: message }, { quoted: m });

            // Send the password in a separate message
            await client.sendMessage(from, { text: password }, { quoted: m });
        } catch (e) {
            console.log(e);
            reply(`Error generating password🤕: ${e.message}`);
        }
    }
    },
  },

  // img (original Perez.js lines 1709-1743)
  {
    command: ['img'],
    aliases: ['ai-img', 'image', 'images'],
    description: 'Search for images',
    category: 'tools',
    handler: async (client, m, { botname, text }) => {
    {
    		      var gis = require('g-i-s');
    		      if (!text) return m.reply("Provide a text");

        try {
            // Use the 'text' as the search term for images
            gis(text, async (error, results) => {
                if (error) {
                    return m.reply("An error occurred while searching for images.\n" + error);
                }

                // Check if results are found
                if (results.length === 0) {
                    return m.reply("No images found.");
                }

                // Limit the number of images to send (e.g., 5)
                const numberOfImages = Math.min(results.length, 5);
                const imageUrls = results.slice(0, numberOfImages).map(result => result.url);

                // Send the images
                const messages = imageUrls.map(url => ({
                    image: { url },
                    caption: `Downloaded by ${botname}`
                }));

                for (const message of messages) {
                    await client.sendMessage(m.chat, message, { quoted: m });
                }
            });
        } catch (e) {
            m.reply("An error occurred.\n" + e);
        }
    }
    },
  },

  // inspect (original Perez.js lines 3355-3427)
  {
    command: ['inspect'],
    aliases: [],
    description: 'Fetch a website\'s HTML, CSS and JavaScript',
    category: 'tools',
    handler: async (client, m, { text }) => {
    {
    		      const fetch = require('node-fetch');
    const cheerio = require('cheerio');

        if (!text) return m.reply("Provide a valid web link to fetch! The bot will crawl the website and fetch its HTML, CSS, JavaScript, and any media embedded in it.");

        if (!/^https?:\/\//i.test(text)) {
            return m.reply("Please provide a URL starting with http:// or https://");
        }

        try {
            const response = await fetch(text);
            const html = await response.text();
            const $ = cheerio.load(html);

            const mediaFiles = [];
            $('img[src], video[src], audio[src]').each((i, element) => {
                let src = $(element).attr('src');
                if (src) {
                    mediaFiles.push(src);
                }
            });

            const cssFiles = [];
            $('link[rel="stylesheet"]').each((i, element) => {
                let href = $(element).attr('href');
                if (href) {
                    cssFiles.push(href);
                }
            });

            const jsFiles = [];
            $('script[src]').each((i, element) => {
                let src = $(element).attr('src');
                if (src) {
                    jsFiles.push(src);
                }
            });

            await m.reply(`**Full HTML Content**:\n\n${html}`);

            if (cssFiles.length > 0) {
                for (const cssFile of cssFiles) {
                    const cssResponse = await fetch(new URL(cssFile, text));
                    const cssContent = await cssResponse.text();
                    await m.reply(`**CSS File Content**:\n\n${cssContent}`);
                }
            } else {
                await m.reply("No external CSS files found.");
            }

            if (jsFiles.length > 0) {
                for (const jsFile of jsFiles) {
                    const jsResponse = await fetch(new URL(jsFile, text));
                    const jsContent = await jsResponse.text();
                    await m.reply(`**JavaScript File Content**:\n\n${jsContent}`);
                }
            } else {
                await m.reply("No external JavaScript files found.");
            }

            if (mediaFiles.length > 0) {
                await m.reply(`**Media Files Found**:\n${mediaFiles.join('\n')}`);
            } else {
                await m.reply("No media files (images, videos, audios) found.");
            }

        } catch (error) {
            console.error(error);
            return m.reply("An error occurred while fetching the website content.");
        }
    }
    },
  },

  // lyrics (original Perez.js lines 4457-4500)
  {
    command: ['lyrics'],
    aliases: [],
    description: 'Get song lyrics',
    category: 'tools',
    handler: async (client, m, { text }) => {
    {
    		      const fetch = require('node-fetch');
     const apiUrl = `https://api.dreaded.site/api/lyrics?title=${encodeURIComponent(text)}`;

        try {
            if (!text) return m.reply("Provide a song name!");

            const data = await fetchJson(apiUrl);

            if (!data.success || !data.result || !data.result.lyrics) {
                return m.reply(`Sorry, I couldn't find any lyrics for "${text}".`);
            }

            const { title, artist, link, thumb, lyrics } = data.result;

            const imageUrl = thumb || "https://files.catbox.moe/k2u5ks.jpg";

            const imageBuffer = await fetch(imageUrl)
                .then(res => res.buffer())
                .catch(err => {
                    console.error('Error fetching image:', err);
                    return null;
                });

            if (!imageBuffer) {
                return m.reply("An error occurred while fetching the image.");
            }

            const caption = `**Title**: ${title}\n**Artist**: ${artist}\n\n${lyrics}`;

            await client.sendMessage(
                m.chat,
                {
                    image: imageBuffer,
                    caption: caption
                },
                { quoted: m }
            );
        } catch (error) {
            console.error(error);
            m.reply(`An error occurred while fetching the lyrics for "${text}".`);
        }
          }
    },
  },

  // movie (original Perez.js lines 4554-4586)
  {
    command: ['movie'],
    aliases: [],
    description: 'Get movie or series info',
    category: 'tools',
    handler: async (client, m, { from, reply, text }) => {
    if (!text) return reply(`Provide a series or movie name.`);
                  let fids = await axios.get(`http://www.omdbapi.com/?apikey=742b2d09&t=${text}&plot=full`);
                  let imdbt = "";
                  console.log(fids.data)
                  imdbt += "⚍⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚍\n" + " ``` IMDB MOVIE SEARCH```\n" + "⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎\n";
                  imdbt += "🎬Title      : " + fids.data.Title + "\n";
                  imdbt += "📅Year       : " + fids.data.Year + "\n";
                  imdbt += "⭐Rated      : " + fids.data.Rated + "\n";
                  imdbt += "📆Released   : " + fids.data.Released + "\n";
                  imdbt += "⏳Runtime    : " + fids.data.Runtime + "\n";
                  imdbt += "🌀Genre      : " + fids.data.Genre + "\n";
                  imdbt += "👨🏻‍💻Director   : " + fids.data.Director + "\n";
                  imdbt += "✍Writer     : " + fids.data.Writer + "\n";
                  imdbt += "👨Actors     : " + fids.data.Actors + "\n";
                  imdbt += "📃Plot       : " + fids.data.Plot + "\n";
                  imdbt += "🌐Language   : " + fids.data.Language + "\n";
                  imdbt += "🌍Country    : " + fids.data.Country + "\n";
                  imdbt += "🎖️Awards     : " + fids.data.Awards + "\n";
                  imdbt += "📦BoxOffice  : " + fids.data.BoxOffice + "\n";
                  imdbt += "🏙️Production : " + fids.data.Production + "\n";
                  imdbt += "🌟imdbRating : " + fids.data.imdbRating + "\n";
                  imdbt += "❎imdbVotes  : " + fids.data.imdbVotes + "";
                 client.sendMessage(from, {
                      image: {
                          url: fids.data.Poster,
                      },
                      caption: imdbt,
                  },
                     { quoted: m });
    },
  },

  // screenshot (original Perez.js lines 2379-2397)
  {
    command: ['screenshot'],
    aliases: ['ss'],
    description: 'Take a screenshot of a website',
    category: 'tools',
    handler: async (client, m, { botname, text }) => {
    {
    		      try {
    let cap = `𝗦𝗰𝗿𝗲𝗲𝗻𝘀𝗵𝗼𝘁 𝗯𝘆 ${botname}`

    if (!text) return m.reply("Provide a website link to screenshot.")

    const image = `https://image.thum.io/get/fullpage/${text}`

    await client.sendMessage(m.chat, { image: { url: image }, caption: cap}, {quoted: m });

    } catch (error) {

    m.reply("An error occured.")

    }

    	      }
    },
  },

  // trt (original Perez.js lines 1653-1695)
  {
    command: ['trt'],
    aliases: ['translate'],
    description: 'Translate text',
    category: 'tools',
    handler: async (client, m, { text }) => {
    {
      	try {
            // Ensure that there is a language code and text to translate
            const args = text.split(' ');
            if (args.length < 2) {
                return m.reply(" Please provide a language code and text to translate !");
            }

            // Extract the language code and the text to translate
            const targetLang = args[0];  // First part is the language code
            const textToTranslate = args.slice(1).join(' ');  // Join the rest as the text to translate

            // Fetch data from the translation API
            const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=en|${targetLang}`);

            // Check if the response is ok
            if (!response.ok) {
                return m.reply('Failed to fetch data. Please try again later.');
            }

            // Parse the response JSON
            const data = await response.json();

            // Check if the translation is available in the response
            if (!data.responseData || !data.responseData.translatedText) {
                return m.reply('No translation found for the provided text.');
            }

            // Extract the translated text
            const translatedText = data.responseData.translatedText;

            // Prepare the message to send
            const message = ` ${translatedText}`;

            // Send the translated message back to the user
            await client.sendMessage(m.chat, { text: message }, { quoted: m });

        } catch (error) {
            console.error("Error occurred:", error);
            m.reply('An error occurred while fetching the data. Please try again later.\n' + error);
        }
    }
    },
  },

  // tts (original Perez.js lines 2482-2499)
  {
    command: ['tts'],
    aliases: ['say'],
    description: 'Convert text to speech',
    category: 'tools',
    handler: async (client, m, { text }) => {
    {

    const googleTTS = require('google-tts-api');

    if (!text) return m.reply("Povide a text for conversion !");

    const url = googleTTS.getAudioUrl(text, {
      lang: 'hi-IN',
      slow: false,
      host: 'https://translate.google.com',
    });

                 client.sendMessage(m.chat, { audio: { url:url},mimetype:'audio/mp4', ptt: true }, { quoted: m });

    	}
    },
  },

  // weather (original Perez.js lines 2515-2555)
  {
    command: ['weather'],
    aliases: [],
    description: 'Get the weather for a city',
    category: 'tools',
    handler: async (client, m, { text }) => {
    {
    		      try {

    if (!text) return m.reply("provide a city/town name");

    const response = await fetch(`http://api.openweathermap.org/data/2.5/weather?q=${text}&units=metric&appid=1ad47ec6172f19dfaf89eb3307f74785`);
            const data = await response.json();

    console.log("Weather data:",data);

            const cityName = data.name;
            const temperature = data.main.temp;
            const feelsLike = data.main.feels_like;
            const minTemperature = data.main.temp_min;
            const maxTemperature = data.main.temp_max;
            const description = data.weather[0].description;
            const humidity = data.main.humidity;
            const windSpeed = data.wind.speed;
            const rainVolume = data.rain ? data.rain['1h'] : 0;
            const cloudiness = data.clouds.all;
            const sunrise = new Date(data.sys.sunrise * 1000);
            const sunset = new Date(data.sys.sunset * 1000);

    await m.reply(`❄️ Weather in ${cityName}

    🌡️ Temperature: ${temperature}°C
    📝 Description: ${description}
    ❄️ Humidity: ${humidity}%
    🌀 Wind Speed: ${windSpeed} m/s
    🌧️ Rain Volume (last hour): ${rainVolume} mm
    ☁️ Cloudiness: ${cloudiness}%
    🌄 Sunrise: ${sunrise.toLocaleTimeString()}
    🌅 Sunset: ${sunset.toLocaleTimeString()}`);

    } catch (e) { m.reply("Unable to find that location.") }
      }
    },
  },

  // whatsong (original Perez.js lines 3969-3972)
  {
    command: ['whatsong'],
    aliases: ['shazam'],
    description: 'Identify a song from audio or video',
    category: 'tools',
    handler: async (client, m, { args, from, reply }) => {
    function _0x14eb(){const _0x17ec6c=['Audio\x20downloading\x20->','mediaType','statSync','1919133FdmqGs','quoted','name','\x0a*•\x20Artists:*\x20','Too\x20big!','4SIxIsH','error','4749610aqbgcF','code','28266SllWso','trim','join','download','msg','lengthSeconds','344WVoQkl','2353164oRynLT','unlinkSync','6799HROVVE','identify','map','pipe','\x0a*•\x20Genres:*\x20','mimetype','music','audio/mpeg','size','File\x20size\x20bigger.','audioBitrate','KKbVWlTNCL3JjxjrWnywMdvQGanyhKRN0fpQxyUo','floor','.mp3','finish','identify-eu-west-1.acrcloud.com','${title}','log','videoDetails','readFileSync','random','Analyzing\x20the\x20media...','chat','*!!','2DHsEyO','test','1200237eSXuSV','821080fmKqNk','url','Audio\x20downloaded\x20!\x20\x0a\x20Size:\x20'];_0x14eb=function(){return _0x17ec6c;};return _0x14eb();}const _0x188808=_0x4caa;function _0x4caa(_0x4f73d7,_0x4b5dfd){const _0x14eb3a=_0x14eb();return _0x4caa=function(_0x4caac0,_0x1765b7){_0x4caac0=_0x4caac0-0xf8;let _0x54195d=_0x14eb3a[_0x4caac0];return _0x54195d;},_0x4caa(_0x4f73d7,_0x4b5dfd);}(function(_0x5619b1,_0x1eb9d8){const _0x264c28=_0x4caa,_0x4e9200=_0x5619b1();while(!![]){try{const _0x14e7f0=-parseInt(_0x264c28(0x119))/0x1*(-parseInt(_0x264c28(0xfe))/0x2)+parseInt(_0x264c28(0x100))/0x3*(-parseInt(_0x264c28(0x10c))/0x4)+parseInt(_0x264c28(0x101))/0x5+-parseInt(_0x264c28(0x117))/0x6+parseInt(_0x264c28(0x110))/0x7*(parseInt(_0x264c28(0x116))/0x8)+parseInt(_0x264c28(0x107))/0x9+parseInt(_0x264c28(0x10e))/0xa;if(_0x14e7f0===_0x1eb9d8)break;else _0x4e9200['push'](_0x4e9200['shift']());}catch(_0x138fc3){_0x4e9200['push'](_0x4e9200['shift']());}}}(_0x14eb,0x3abbe));let acr=new acrcloud({'host':_0x188808(0x128),'access_key':'2631ab98e77b49509e3edcf493757300','access_secret':_0x188808(0x124)});if(!m['quoted'])throw'Tag\x20a\x20short\x20video\x20or\x20audio';let d=m['quoted']?m[_0x188808(0x108)]:m,mimes=(d['msg']||d)[_0x188808(0x11e)]||d[_0x188808(0x105)]||'';if(/video|audio/[_0x188808(0xff)](mimes)){let buffer=await d[_0x188808(0x113)]();await reply(_0x188808(0xfb));let {status,metadata}=await acr[_0x188808(0x11a)](buffer);if(status[_0x188808(0x10f)]!==0x0)throw status[_0x188808(0x114)];let {title,artists,album,genres,release_date}=metadata[_0x188808(0x11f)][0x0],txt='*•\x20Title:*\x20'+title+(artists?_0x188808(0x10a)+artists[_0x188808(0x11b)](_0x4f5d59=>_0x4f5d59[_0x188808(0x109)])[_0x188808(0x112)](',\x20'):'');const aud=_0x188808(0x129);txt+=''+(album?'\x0a*•\x20Album:*\x20'+album[_0x188808(0x109)]:'')+(genres?_0x188808(0x11d)+genres[_0x188808(0x11b)](_0xf7bf2e=>_0xf7bf2e[_0x188808(0x109)])[_0x188808(0x112)](',\x20'):'')+'\x0a',txt+='*•\x20Release\x20Date:*\x20'+release_date,await client['sendMessage'](m[_0x188808(0xfc)],{'text':txt[_0x188808(0x111)]()},{'quoted':m});const {videos}=await yts(title);if(!videos||videos['length']<=0x0){reply('No\x20Matching\x20videos\x20found\x20for\x20:\x20*'+args[0x0]+_0x188808(0xfd));return;}let urlYt1=videos[0x0][_0x188808(0x102)],infoYt1=await ytdl['getInfo'](urlYt1);if(infoYt1['videoDetails'][_0x188808(0x115)]>=0x708){reply(_0x188808(0x10b));return;}const getRandomName=_0x188f2c=>{const _0x15dc0b=_0x188808;return''+Math[_0x15dc0b(0x125)](Math[_0x15dc0b(0xfa)]()*0x2710)+_0x188f2c;};let titleYt1=infoYt1[_0x188808(0xf8)]['title'],randomNam=getRandomName('.mp3');const stream=ytdl(urlYt1,{'filter':_0x5ac95f=>_0x5ac95f['audioBitrate']==0xa0||_0x5ac95f[_0x188808(0x123)]==0x80})[_0x188808(0x11c)](fs['createWriteStream']('./'+randomNam));console[_0x188808(0x12a)](_0x188808(0x104),urlYt1),await new Promise((_0x1cc1a5,_0x4efba3)=>{const _0x426073=_0x188808;stream['on'](_0x426073(0x10d),_0x4efba3),stream['on'](_0x426073(0x127),_0x1cc1a5);});let stats=fs[_0x188808(0x106)]('./'+randomNam),fileSizeInBytes=stats[_0x188808(0x121)],fileSizeInMegabytes=fileSizeInBytes/(0x400*0x400);console[_0x188808(0x12a)](_0x188808(0x103)+fileSizeInMegabytes),fileSizeInMegabytes<=0x28?await client['sendMessage'](from,{'document':fs[_0x188808(0xf9)]('./'+randomNam),'mimetype':_0x188808(0x120),'fileName':titleYt1+_0x188808(0x126)},{'quoted':m}):reply(_0x188808(0x122)),fs[_0x188808(0x118)]('./'+randomNam);}
    },
  },

  // wikipedia (original Perez.js lines 1460-1485)
  {
    command: ['wikipedia'],
    aliases: ['wiki'],
    description: 'Search Wikipedia',
    category: 'tools',
    handler: async (client, m, { text }) => {
    {
      if (!text) return await m.reply('❗ Enter what you want to search for on Wikipedia');

      try {
          // Fetch Wikipedia page content
          const link = await axios.get(`https://en.wikipedia.org/wiki/${text}`);
          const $ = cheerio.load(link.data);

          // Extract title and summary
          let wik = $('#firstHeading').text().trim();
          let resulw = $('#mw-content-text > div.mw-parser-output').find('p').text().trim();

          // Create a message body with the title and summary
          let message = `▢ *Wikipedia Search Result* 🧐\n\n`;
          message += `‣ *Title*: ${wik} 📚\n\n`;
          message += `${resulw} 📖\n`;

          // Send the response message
          await m.reply(message);

      } catch (e) {
          console.error(e);
          await m.reply('⚠️ No results found or failed to fetch data. Try again later!');
      }
    }
    },
  },
];
