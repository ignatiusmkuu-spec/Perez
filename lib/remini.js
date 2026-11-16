const fs = require('fs');
const { runFfmpeg, tempFile } = require('./sticker');

const MAX_SIDE = 2048;

const FILTERS = {
  enhance: 'hqdn3d=2:1.5:3:3,unsharp=5:5:1.1:5:5:0.0,eq=contrast=1.06:saturation=1.12',
  dehaze: 'hqdn3d=1.5:1:2:2,unsharp=5:5:0.8:5:5:0.0,eq=contrast=1.22:brightness=0.02:saturation=1.1',
  recolor: 'hqdn3d=1.5:1:2:2,unsharp=3:3:0.6:3:3:0.0,eq=contrast=1.08:saturation=1.45',
};

async function remini(buffer, mode = 'enhance') {
  const filter = FILTERS[mode] || FILTERS.enhance;
  const input = tempFile('img');
  const output = tempFile('jpg');
  const scale = `scale='min(${MAX_SIDE},iw*2)':'min(${MAX_SIDE},ih*2)':force_original_aspect_ratio=decrease:flags=lanczos:force_divisible_by=2`;
  try {
    fs.writeFileSync(input, Buffer.from(buffer));
    await runFfmpeg(['-y', '-i', input, '-vf', `${scale},${filter}`, '-frames:v', '1', '-q:v', '2', output]);
    return fs.readFileSync(output);
  } finally {
    for (const file of [input, output]) fs.unlink(file, () => { });
  }
}

module.exports = { remini };
