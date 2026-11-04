const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const { createServer } = require("node:net");
const path = require("node:path");
const { setTimeout: wait } = require("node:timers/promises");
const test = require("node:test");

const projectRoot = path.join(__dirname, "..");

test("Baileys v7 exports the APIs used by the bot", async () => {
  const baileys = await import("@whiskeysockets/baileys");

  assert.equal(typeof baileys.default, "function");
  assert.equal(typeof baileys.useMultiFileAuthState, "function");
  assert.equal(typeof baileys.fetchLatestBaileysVersion, "function");
  assert.equal(typeof baileys.proto.WebMessageInfo.create, "function");
  assert.equal(typeof baileys.getBinaryNodeChild, "function");
});

test("profile image helper returns a resized JPEG", async () => {
  const { Jimp } = require("jimp");
  const { generateProfilePicture } = require("../lib/dreadfunc");
  const source = await new Jimp({
    width: 80,
    height: 40,
    color: 0xff0000ff,
  }).getBuffer("image/png");

  const { img, preview } = await generateProfilePicture(source);
  const result = await Jimp.read(img);

  assert.ok(Buffer.isBuffer(img));
  assert.equal(preview, img);
  assert.ok(result.bitmap.width <= 720);
  assert.ok(result.bitmap.height <= 720);
});

test("HTTP dashboard and health endpoint start without WhatsApp credentials", async (t) => {
  const portProbe = createServer();
  await new Promise((resolve) => portProbe.listen(0, "127.0.0.1", resolve));
  const port = portProbe.address().port;
  await new Promise((resolve, reject) =>
    portProbe.close((error) => (error ? reject(error) : resolve())),
  );

  const child = spawn(process.execPath, [path.join(projectRoot, "index.js")], {
    cwd: projectRoot,
    env: {
      ...process.env,
      BOT_ENABLED: "false",
      NODE_ENV: "test",
      PORT: String(port),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let logs = "";
  child.stdout.on("data", (chunk) => (logs += chunk.toString()));
  child.stderr.on("data", (chunk) => (logs += chunk.toString()));
  t.after(async () => {
    if (child.exitCode === null) child.kill("SIGTERM");
    await new Promise((resolve) => {
      if (child.exitCode !== null) return resolve();
      child.once("close", resolve);
    });
  });

  let health;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (child.exitCode !== null) {
      throw new Error(`Server exited before becoming ready:\n${logs}`);
    }
    try {
      health = await fetch(`http://127.0.0.1:${port}/healthz`);
      break;
    } catch {
      await wait(100);
    }
  }

  assert.ok(health, `Server did not become ready:\n${logs}`);
  assert.equal(health.status, 200);
  assert.deepEqual(await health.json(), { status: "disabled", connected: false });

  const page = await fetch(`http://127.0.0.1:${port}/`);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /Tesla MD/i);

  const favicon = await fetch(`http://127.0.0.1:${port}/favicon.ico`);
  assert.equal(favicon.status, 204);
});
