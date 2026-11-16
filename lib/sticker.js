const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');
const webp = require('node-webpmux');

const SIZE = 512;
const STATIC_LIMIT = 100 * 1024;
const ANIMATED_LIMIT = 500 * 1024;

function candidates() {
  const list = [];
  if (process.env.FFMPEG_PATH) list.push(process.env.FFMPEG_PATH);
  list.push('ffmpeg');
  try {
    const bundled = require('ffmpeg-static');
    if (bundled) list.push(bundled);
  } catch (error) {
    list.length += 0;
  }
  return list;
}

const probed = new Map();

function probe(binary, filter) {
  const key = `${binary}|${filter || ''}`;
  if (!probed.has(key)) {
    probed.set(key, new Promise((resolve) => {
      const child = spawn(binary, ['-hide_banner', '-filters'], { stdio: ['ignore', 'pipe', 'ignore'] });
      let out = '';
      child.stdout.on('data', (chunk) => {
        out += chunk;
      });
      child.on('error', () => resolve(false));
      child.on('close', (code) => resolve(code === 0 && (!filter || new RegExp(`\\s${filter}\\s`).test(out))));
    }));
  }
  return probed.get(key);
}

async function ffmpegPath(filter) {
  for (const binary of candidates()) {
    if (await probe(binary, filter)) return binary;
  }
  throw new Error(filter ? `no ffmpeg with the ${filter} filter found` : 'ffmpeg is not installed. Run: npm install ffmpeg-static');
}

async function run(args, filter) {
  const binary = await ffmpegPath(filter);
  return new Promise((resolve, reject) => {
    const child = spawn(binary, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let errors = '';
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error('ffmpeg timed out'));
    }, 90000);
    child.stderr.on('data', (chunk) => {
      errors = (errors + chunk).slice(-1500);
    });
    child.on('error', (error) => {
      clearTimeout(timer);
      reject(new Error(error.message));
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) resolve();
      else {
        const lines = errors.split(/[\r\n]+/).map((line) => line.trim()).filter((line) => line && !/^frame=/.test(line));
        reject(new Error(`ffmpeg failed: ${lines.slice(-2).join(' ') || 'code ' + code}`));
      }
    });
  });
}

const tempFile = (extension) => path.join(os.tmpdir(), `stk-${crypto.randomBytes(8).toString('hex')}.${extension}`);

function extensionFor(mime) {
  if (/png/.test(mime)) return 'png';
  if (/gif/.test(mime)) return 'gif';
  if (/webp/.test(mime)) return 'webp';
  if (/video|mp4/.test(mime)) return 'mp4';
  return 'jpg';
}

function isAnimatedWebp(buffer) {
  return Buffer.isBuffer(buffer) && buffer.length > 30 && buffer.slice(0, 4).toString() === 'RIFF' && buffer.includes(Buffer.from('ANIM'));
}

const FULL = `scale=${SIZE}:${SIZE}:force_original_aspect_ratio=decrease:flags=lanczos,format=rgba,pad=${SIZE}:${SIZE}:(ow-iw)/2:(oh-ih)/2:color=0x00000000`;
const CROP = `scale=${SIZE}:${SIZE}:force_original_aspect_ratio=increase:flags=lanczos,crop=${SIZE}:${SIZE},format=rgba`;

async function encode(input, animated, type, quality, seconds) {
  const output = tempFile('webp');
  const filter = (animated ? 'fps=15,' : '') + (type === 'crop' ? CROP : FULL);
  const args = ['-y', '-i', input, '-vf', filter, '-c:v', 'libwebp', '-quality', String(quality), '-compression_level', '6', '-preset', 'default', '-an', '-vsync', '0'];
  if (animated) args.push('-loop', '0', '-t', String(seconds));
  else args.push('-frames:v', '1');
  args.push(output);
  try {
    await run(args);
    return fs.readFileSync(output);
  } finally {
    fs.promises.unlink(output).catch(() => { });
  }
}

async function toWebp(buffer, options = {}) {
  const mime = options.mime || '';
  if (/webp/.test(mime) && !options.force) return buffer;
  const input = tempFile(extensionFor(mime));
  fs.writeFileSync(input, buffer);
  try {
    const animated = /video|gif/.test(mime);
    const limit = animated ? ANIMATED_LIMIT : STATIC_LIMIT;
    const qualities = animated ? [60, 45, 30, 20, 10] : [80, 60, 40, 25, 10];
    let seconds = options.seconds || 8;
    let result = null;
    for (const quality of qualities) {
      result = await encode(input, animated, options.type, quality, seconds);
      if (result.length <= limit) return result;
      if (animated && quality <= 30) seconds = Math.max(3, seconds - 2);
    }
    return result;
  } finally {
    fs.promises.unlink(input).catch(() => { });
  }
}

async function addExif(buffer, meta = {}) {
  const json = {
    'sticker-pack-id': crypto.randomBytes(16).toString('hex'),
    'sticker-pack-name': String(meta.pack || ''),
    'sticker-pack-publisher': String(meta.author || ''),
    emojis: Array.isArray(meta.emojis) && meta.emojis.length ? meta.emojis : [''],
  };
  const header = Buffer.from([0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
  const body = Buffer.from(JSON.stringify(json), 'utf-8');
  const exif = Buffer.concat([header, body]);
  exif.writeUIntLE(body.length, 14, 4);
  const image = new webp.Image();
  await image.load(buffer);
  image.exif = exif;
  return image.save(null);
}

async function createSticker(buffer, options = {}) {
  const webpBuffer = await toWebp(buffer, options);
  return addExif(webpBuffer, options);
}

const FONTS = [
  process.env.STICKER_FONT,
  '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
  '/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf',
  '/usr/share/fonts/TTF/DejaVuSans-Bold.ttf',
  '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
  '/usr/share/fonts/liberation/LiberationSans-Bold.ttf',
  '/usr/share/fonts/truetype/freefont/FreeSansBold.ttf',
  '/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf',
  '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
  'C:/Windows/Fonts/arialbd.ttf',
];

const COLORS = ['0xff4d4d', '0xffd93d', '0x6bff6b', '0x4dd2ff', '0xb36bff', '0xff6bd6'];

function wrapText(text, width) {
  const lines = [];
  let current = '';
  for (const word of text.split(/\s+/).filter(Boolean)) {
    let piece = word;
    while ([...piece].length > width) {
      if (current) {
        lines.push(current);
        current = '';
      }
      lines.push([...piece].slice(0, width).join(''));
      piece = [...piece].slice(width).join('');
    }
    if (!current) current = piece;
    else if ([...current].length + 1 + [...piece].length <= width) current += ' ' + piece;
    else {
      lines.push(current);
      current = piece;
    }
  }
  if (current) lines.push(current);
  return lines;
}

async function textSticker(text, meta = {}) {
  const font = FONTS.find((file) => file && fs.existsSync(file));
  if (!font) throw new Error('no font found for text stickers, set STICKER_FONT to a .ttf file');
  const lines = wrapText(String(text).replace(/\s+/g, ' ').trim().slice(0, 150), 12).slice(0, 7);
  if (!lines.length) throw new Error('no text provided');
  const longest = Math.max(...lines.map((line) => [...line].length));
  const size = Math.max(36, Math.min(150, Math.floor(480 / Math.max(longest * 0.62, lines.length * 1.3))));
  const textFile = tempFile('txt');
  const output = tempFile('webp');
  const quote = (value) => `'${String(value).replace(/\\/g, '/').replace(/:/g, '\\:').replace(/'/g, '')}'`;
  fs.writeFileSync(textFile, lines.join('\n'));
  const step = 0.2;
  const draws = COLORS.map((color, i) => `drawtext=fontfile=${quote(font)}:textfile=${quote(textFile)}:fontsize=${size}:fontcolor=${color}:borderw=${Math.max(3, Math.round(size / 14))}:bordercolor=black:line_spacing=6:x=(w-text_w)/2:y=(h-text_h)/2:enable='between(t,${(i * step).toFixed(1)},${((i + 1) * step).toFixed(1)})'`);
  try {
    await run(['-y', '-f', 'lavfi', '-i', `color=c=black@0.0:s=${SIZE}x${SIZE}:r=10:d=${(COLORS.length * step).toFixed(1)}`, '-vf', ['format=rgba', ...draws].join(','), '-c:v', 'libwebp', '-lossless', '0', '-quality', '60', '-loop', '0', '-an', output], 'drawtext');
    return addExif(fs.readFileSync(output), meta);
  } finally {
    fs.promises.unlink(textFile).catch(() => { });
    fs.promises.unlink(output).catch(() => { });
  }
}

async function animatedWebpToMp4(buffer) {
  const { Image } = require('node-webpmux');
  await Image.initLib();
  const img = new Image();
  await img.load(buffer);
  if (!img.hasAnim || !img.frames || !img.frames.length) throw new Error('that sticker is not animated');

  const width = img.width;
  const height = img.height;
  const even = (n) => n - (n % 2);
  const outW = even(width) || 2;
  const outH = even(height) || 2;
  const canvas = Buffer.alloc(width * height * 4);
  const rgb = Buffer.alloc(outW * outH * 3);
  const chunks = [];
  const STEP = 40;
  let previous = null;

  for (let i = 0; i < img.frames.length; i++) {
    const frame = img.frames[i];
    if (previous && previous.dispose) {
      for (let row = 0; row < previous.height; row++) {
        const start = ((previous.y + row) * width + previous.x) * 4;
        canvas.fill(0, start, start + previous.width * 4);
      }
    }
    const pixels = await img.getFrameData(i);
    const fx = frame.x || 0;
    const fy = frame.y || 0;
    for (let row = 0; row < frame.height; row++) {
      if (fy + row >= height) break;
      for (let col = 0; col < frame.width; col++) {
        if (fx + col >= width) break;
        const source = (row * frame.width + col) * 4;
        const target = ((fy + row) * width + fx + col) * 4;
        const alpha = pixels[source + 3];
        if (frame.blend === false || alpha === 255 || canvas[target + 3] === 0) {
          canvas[target] = pixels[source];
          canvas[target + 1] = pixels[source + 1];
          canvas[target + 2] = pixels[source + 2];
          canvas[target + 3] = alpha;
        } else if (alpha > 0) {
          const back = canvas[target + 3] / 255;
          const front = alpha / 255;
          const out = front + back * (1 - front);
          for (let c = 0; c < 3; c++) {
            canvas[target + c] = Math.round((pixels[source + c] * front + canvas[target + c] * back * (1 - front)) / out);
          }
          canvas[target + 3] = Math.round(out * 255);
        }
      }
    }
    previous = { x: fx, y: fy, width: frame.width, height: frame.height, dispose: frame.dispose };

    for (let row = 0; row < outH; row++) {
      for (let col = 0; col < outW; col++) {
        const source = (row * width + col) * 4;
        const target = (row * outW + col) * 3;
        const alpha = canvas[source + 3] / 255;
        rgb[target] = Math.round(canvas[source] * alpha);
        rgb[target + 1] = Math.round(canvas[source + 1] * alpha);
        rgb[target + 2] = Math.round(canvas[source + 2] * alpha);
      }
    }
    const repeats = Math.max(1, Math.round((frame.delay || 100) / STEP));
    for (let r = 0; r < repeats; r++) chunks.push(Buffer.from(rgb));
  }

  const raw = tempFile('rgb');
  const output = tempFile('mp4');
  try {
    fs.writeFileSync(raw, Buffer.concat(chunks));
    await run(['-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${outW}x${outH}`, '-r', '25', '-i', raw, '-vf', 'format=yuv420p', '-c:v', 'libx264', '-preset', 'veryfast', '-movflags', '+faststart', output]);
    return fs.readFileSync(output);
  } finally {
    for (const file of [raw, output]) fs.unlink(file, () => { });
  }
}

module.exports = { animatedWebpToMp4, createSticker, textSticker, toWebp, addExif, isAnimatedWebp, runFfmpeg: run, tempFile };
