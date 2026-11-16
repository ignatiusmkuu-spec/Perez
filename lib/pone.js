const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

const BASE = (process.env.PONE_BASE || 'https://pone.rs').replace(/\/+$/, '');

const ATTEMPTS = [
  { endpoint: `${BASE}/upload.php`, field: 'files[]' },
  { endpoint: `${BASE}/upload`, field: 'files[]' },
  { endpoint: `${BASE}/upload`, field: 'file' },
];

const TYPES = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp',
  mp4: 'video/mp4', mkv: 'video/x-matroska', webm: 'video/webm', mp3: 'audio/mpeg', ogg: 'audio/ogg',
  opus: 'audio/ogg', m4a: 'audio/mp4', pdf: 'application/pdf', txt: 'text/plain', zip: 'application/zip',
};

function extractUrl(data) {
  if (!data) return null;
  if (typeof data === 'string') {
    const text = data.trim();
    try {
      return extractUrl(JSON.parse(text));
    } catch (error) {
      const match = text.match(/https?:\/\/[^\s"'<>]+/);
      return match ? match[0] : null;
    }
  }
  if (Array.isArray(data)) {
    for (const item of data) {
      const found = extractUrl(item);
      if (found) return found;
    }
    return null;
  }
  if (typeof data === 'object') {
    if (typeof data.url === 'string' && data.url.startsWith('http')) return data.url;
    for (const key of ['files', 'data']) {
      if (data[key]) {
        const found = extractUrl(data[key]);
        if (found) return found;
      }
    }
    if (typeof data.url === 'string') return `${BASE}/${data.url.replace(/^\//, '')}`;
  }
  return null;
}

async function uploadToPone(input, fileName, contentType) {
  let buffer = input;
  let name = fileName;
  if (typeof input === 'string') {
    if (!fs.existsSync(input)) throw new Error('Unable to find the file');
    buffer = fs.readFileSync(input);
    name = name || path.basename(input);
  }
  if (!Buffer.isBuffer(buffer)) throw new Error('Nothing to upload');
  name = name || `upload_${Date.now()}`;
  const type = contentType || TYPES[path.extname(name).slice(1).toLowerCase()] || 'application/octet-stream';

  let lastError;
  for (const { endpoint, field } of ATTEMPTS) {
    try {
      const form = new FormData();
      form.append(field, buffer, { filename: name, contentType: type });
      const { data } = await axios.post(endpoint, form, {
        headers: { ...form.getHeaders(), 'User-Agent': 'Mozilla/5.0' },
        timeout: 60000,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      });
      const url = extractUrl(data);
      if (url) return url;
      lastError = new Error('Unexpected response from pone.rs');
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('Upload failed or was rejected by pone.rs');
}

module.exports = uploadToPone;
module.exports.uploadToPone = uploadToPone;
module.exports.extractUrl = extractUrl;
