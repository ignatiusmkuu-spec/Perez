'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const axios = require('axios');

const BIN_DIR = path.join(__dirname, '..', 'bin');
const MAX_MB = Number(process.env.YT_MAX_MB) || 60;
const MAX_SECONDS = (Number(process.env.YT_MAX_MINUTES) || 25) * 60;
const RUN_TIMEOUT_MS = 3 * 60 * 1000;
const MAX_AT_ONCE = 2;

let binaryPath = null;
let installing = null;
let lastUpdate = 0;
let running = 0;
const waiting = [];

function assetName() {
  if (process.platform === 'linux') return process.arch === 'arm64' ? 'yt-dlp_linux_aarch64' : 'yt-dlp_linux';
  if (process.platform === 'darwin') return 'yt-dlp_macos';
  if (process.platform === 'win32') return 'yt-dlp.exe';
  return null;
}

function works(file) {
  try {
    return spawnSync(file, ['--version'], { timeout: 15000 }).status === 0;
  } catch (error) {
    return false;
  }
}

async function install() {
  const asset = assetName();
  if (!asset) throw new Error('yt-dlp cannot be downloaded for this system; install it and set YTDLP_PATH');
  const target = path.join(BIN_DIR, process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');
  await fs.promises.mkdir(BIN_DIR, { recursive: true });
  console.log(`⬇️ Downloading yt-dlp (${asset})...`);
  const response = await axios.get(`https://github.com/yt-dlp/yt-dlp/releases/latest/download/${asset}`, {
    responseType: 'stream', timeout: 120000, maxRedirects: 5,
  });
  const temp = `${target}.download`;
  await new Promise((resolve, reject) => {
    const out = fs.createWriteStream(temp);
    response.data.pipe(out);
    out.on('finish', resolve);
    out.on('error', reject);
    response.data.on('error', reject);
  });
  await fs.promises.chmod(temp, 0o755);
  await fs.promises.rename(temp, target);
  console.log('✅ yt-dlp downloaded.');
  return target;
}

async function getBinary() {
  if (binaryPath) return binaryPath;
  if (process.env.YTDLP_PATH) {
    if (!works(process.env.YTDLP_PATH)) throw new Error(`YTDLP_PATH does not run: ${process.env.YTDLP_PATH}`);
    return (binaryPath = process.env.YTDLP_PATH);
  }
  const downloaded = path.join(BIN_DIR, process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');
  for (const candidate of [downloaded, 'yt-dlp']) {
    if (works(candidate)) return (binaryPath = candidate);
  }
  installing = installing || install().finally(() => { installing = null; });
  const file = await installing;
  if (!works(file)) throw new Error('the downloaded yt-dlp does not run on this system');
  return (binaryPath = file);
}

function update(binary) {
  if (Date.now() - lastUpdate < 60 * 60 * 1000) return Promise.resolve(false);
  lastUpdate = Date.now();
  return new Promise((resolve) => {
    const child = spawn(binary, ['--update'], { timeout: 90000 });
    child.on('error', () => resolve(false));
    child.on('close', (code) => resolve(code === 0));
  });
}

function cookieArgs(dir) {
  if (process.env.YT_COOKIES_FILE) return ['--cookies', process.env.YT_COOKIES_FILE];
  if (process.env.YT_COOKIES) {
    const file = path.join(dir, 'cookies.txt');
    fs.writeFileSync(file, process.env.YT_COOKIES.replace(/\\n/g, '\n'), { mode: 0o600 });
    return ['--cookies', file];
  }
  return [];
}

function run(binary, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(binary, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let errors = '';
    child.stderr.on('data', (chunk) => { errors = (errors + chunk).slice(-4000); });
    const timer = setTimeout(() => { child.kill('SIGKILL'); reject(new Error('timed out')); }, RUN_TIMEOUT_MS);
    child.on('error', (error) => { clearTimeout(timer); reject(error); });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) return resolve();
      const line = errors.split('\n').map((s) => s.trim()).filter((s) => /ERROR/.test(s)).pop() || errors.trim().split('\n').pop();
      reject(new Error(line || `yt-dlp exited with code ${code}`));
    });
  });
}

function limit() {
  if (running < MAX_AT_ONCE) { running++; return Promise.resolve(); }
  return new Promise((resolve) => waiting.push(resolve));
}
function release() {
  const next = waiting.shift();
  if (next) next(); else running--;
}

async function downloadAudio(url) {
  if (!/^https?:\/\/[^\s]+$/i.test(url)) throw new Error('not a valid link');
  const binary = await getBinary();
  await limit();
  const dir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'ytdlp-'));
  const cleanup = () => fs.promises.rm(dir, { recursive: true, force: true }).catch(() => { });
  try {
    const args = [
      '-f', 'bestaudio[ext=m4a]/bestaudio/best',
      '--no-playlist', '--no-warnings', '--no-progress',
      '--max-filesize', `${MAX_MB}M`,
      '--match-filters', `duration<=?${MAX_SECONDS} & !is_live`,
      '--socket-timeout', '20', '--retries', '2',
      '--js-runtimes', 'node',
      ...cookieArgs(dir),
      '-o', path.join(dir, 'audio.%(ext)s'),
      '--', url,
    ];
    try {
      await run(binary, args);
    } catch (error) {

      if (/not a bot|Sign in|cookies/i.test(error.message) || !(await update(binary))) throw error;
      await run(binary, args);
    }
    const files = (await fs.promises.readdir(dir)).filter((name) => name.startsWith('audio.'));
    if (files.length === 0) throw new Error('nothing was downloaded (the video may be too long or too large)');
    return { file: path.join(dir, files[0]), cleanup };
  } catch (error) {
    await cleanup();
    throw error;
  } finally {
    release();
  }
}

module.exports = { downloadAudio, getBinary };
