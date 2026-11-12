'use strict';

const axios = require('axios');
const ytdlp = require('./ytdlp');

const TIMEOUT_MS = Number(process.env.YT_API_TIMEOUT_MS) || 40000;

const KEITH_HOSTS = [
  process.env.KEITH_API,
  'https://keithhostdeploysite-22l75uk5-ff0ccc337078.herokuapp.com',
  'https://keithhostdeploysite-t3pgatgm-21717a2c2837.herokuapp.com',
]
  .filter(Boolean)
  .map((host) => host.replace(/\/+$/, ''))
  .filter((host, index, all) => all.indexOf(host) === index);

const keith = (path) => KEITH_HOSTS.map((host, index) => ({
  name: index === 0 ? 'keith' : `keith${index + 1}`,
  url: (link) => `${host}${path}?url=${encodeURIComponent(link)}`,
}));

const AUDIO_PROVIDERS = keith('/download/audio');
const VIDEO_PROVIDERS = keith('/download/mp4');

const IMAGE = /\.(jpe?g|png|webp|gif|svg)(\?|$)/i;
const YOUTUBE_PAGE = /youtube\.com|youtu\.be|ytimg\.com/i;

function collectUrls(node, found = []) {
  if (!node) return found;
  if (typeof node === 'string') {
    if (/^https?:\/\//i.test(node)) found.push(node);
  } else if (Array.isArray(node)) {
    node.forEach((item) => collectUrls(item, found));
  } else if (typeof node === 'object') {
    Object.values(node).forEach((value) => collectUrls(value, found));
  }
  return found;
}

function readAnswer(body) {
  if (!body || typeof body !== 'object') return null;
  const urls = [...new Set(collectUrls(body))].filter((u) => !YOUTUBE_PAGE.test(u) && !IMAGE.test(u));
  if (urls.length === 0) return null;

  urls.sort((a, b) => (/mp3|mp4|audio|download|dl|\.m4a/i.test(b) ? 1 : 0) - (/mp3|mp4|audio|download|dl|\.m4a/i.test(a) ? 1 : 0));
  const result = body.result && typeof body.result === 'object' ? body.result : {};
  const data = body.data && typeof body.data === 'object' ? body.data : {};
  const title = result.title || (result.metadata && result.metadata.title) || data.title || body.title || null;
  return { url: urls[0], title };
}

async function fromProviders(link, providers, failures) {
  for (const provider of providers) {
    try {
      const response = await axios.get(provider.url(link), { timeout: TIMEOUT_MS, validateStatus: () => true });
      if (response.status < 200 || response.status >= 300) throw new Error(`HTTP ${response.status}`);
      const answer = readAnswer(response.data);
      if (!answer) throw new Error('no download link in the reply');
      return { ...answer, source: provider.name, cleanup: async () => { } };
    } catch (error) {
      failures.push(`${provider.name}: ${error.message || error}`);
    }
  }
  return null;
}

async function getAudio(link, providers = AUDIO_PROVIDERS, local = ytdlp.downloadAudio) {
  const failures = [];
  const answer = await fromProviders(link, providers, failures);
  if (answer) return answer;

  if (local) {
    try {
      const { file, cleanup } = await local(link);
      return { url: file, title: null, source: 'yt-dlp', cleanup };
    } catch (error) {
      failures.push(`yt-dlp: ${error.message || error}`);
    }
  }
  throw new Error(`no audio source worked (${failures.join('; ')})`);
}

async function getVideo(link, providers = VIDEO_PROVIDERS) {
  const failures = [];
  const answer = await fromProviders(link, providers, failures);
  if (answer) return answer;
  throw new Error(`no video source worked (${failures.join('; ')})`);
}

module.exports = { getAudio, getVideo, readAnswer, collectUrls, AUDIO_PROVIDERS, VIDEO_PROVIDERS, KEITH_HOSTS };
