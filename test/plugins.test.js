const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const handler = require("../lib/handler");

const pluginDir = path.join(__dirname, "..", "plugins");
const pluginFiles = fs
  .readdirSync(pluginDir, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith(".js") && !entry.name.startsWith("_"))
  .map((entry) => entry.name);

test("plugins directory is not empty", () => {
  assert.ok(pluginFiles.length > 0);
});

test("every plugin is { command, aliases, description, category, handler } with unique names", () => {
  const seen = new Map();
  for (const file of pluginFiles) {
    const list = handler.toArray(require(path.join(pluginDir, file)));
    assert.ok(list.length > 0, `${file}: has no commands`);

    for (const plugin of list) {
      const commands = handler.toArray(plugin.command);
      assert.ok(commands.length > 0 && commands.every((c) => typeof c === "string" && c), `${file}: bad command`);
      const name = commands[0];
      assert.ok(Array.isArray(plugin.aliases), `${file}: ${name}.aliases must be an array`);
      assert.equal(typeof plugin.description, "string", `${file}: ${name}.description must be a string`);
      assert.ok(plugin.description.length > 0, `${file}: ${name}.description is empty`);
      assert.equal(typeof plugin.category, "string", `${file}: ${name}.category must be a string`);
      assert.equal(typeof plugin.handler, "function", `${file}: ${name}.handler must be a function`);

      for (const n of [...commands, ...plugin.aliases]) {
        assert.ok(!seen.has(n), `"${n}" is defined in both ${seen.get(n)} and ${file}`);
        seen.set(n, file);
      }
    }
  }
});

test("the handler registers every command from the plugins directory", () => {
  const { loaded, failed } = handler.loadPlugins();

  assert.deepEqual(failed, []);
  assert.equal(loaded.length, pluginFiles.length);
  assert.ok(handler.listCommands().length > pluginFiles.length);
  assert.equal(handler.getPlugin("this-command-does-not-exist"), undefined);
  assert.equal(typeof handler.getPlugin("menu").handler, "function");
  assert.equal(handler.getPlugin("wiki"), handler.getPlugin("wikipedia"));
  assert.equal(handler.getPlugin("gpt").category, "ai");
});

test("a broken file is skipped instead of stopping the handler", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "plugins-"));
  fs.writeFileSync(path.join(tmp, "good.js"), "module.exports = [{ command: ['good'], aliases: ['ok'], description: 'd', category: 'x', handler: async () => {} }, { command: ['also'], handler: async () => {} }];");
  fs.writeFileSync(path.join(tmp, "single.js"), "module.exports = { command: 'single', handler: async () => {} };");
  fs.writeFileSync(path.join(tmp, "bad.js"), "throw new Error('boom');");
  fs.writeFileSync(path.join(tmp, "shape.js"), "module.exports = [{ command: ['shape'] }];");
  fs.writeFileSync(path.join(tmp, "_ignored.js"), "module.exports = [{ command: ['ignored'], handler: async () => {} }];");

  const { loaded, failed } = handler.loadPlugins(tmp);

  assert.deepEqual(loaded.sort(), ["good.js", "single.js"]);
  assert.deepEqual(failed.map((f) => f.file).sort(), ["bad.js", "shape.js"]);
  assert.ok(handler.getPlugin("good"));
  assert.ok(handler.getPlugin("OK"), "names are matched case-insensitively");
  assert.ok(handler.getPlugin("also"));
  assert.ok(handler.getPlugin("single"));
  assert.equal(handler.getPlugin("shape"), undefined);
  assert.equal(handler.getPlugin("ignored"), undefined);

  fs.rmSync(tmp, { recursive: true, force: true });
  handler.loadPlugins();
});

test("dispatch reports unknown commands, thrown messages and crashes", async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "plugins-"));
  fs.writeFileSync(
    path.join(tmp, "p.js"),
    `module.exports = [
      { command: ['gate'], handler: async () => { throw 'Command meant for the owner!'; } },
      { command: ['crash'], handler: async () => { throw new Error('boom'); } },
      { command: ['fine'], handler: async (client, m, { text }) => { m.reply('got ' + text); } },
    ];`
  );
  handler.loadPlugins(tmp);

  const replies = [];
  const m = { reply: async (message) => replies.push(message) };
  const quiet = console.error;
  console.error = () => {};

  assert.equal(await handler.dispatch("nope", {}, m, {}), false);
  assert.equal(await handler.dispatch("fine", {}, m, { text: "hi" }), true);
  assert.equal(replies.pop(), "got hi");
  assert.equal(await handler.dispatch("gate", {}, m, {}), true);
  assert.equal(replies.pop(), "Command meant for the owner!");
  assert.equal(await handler.dispatch("CRASH", {}, m, {}), true);
  assert.match(replies.pop(), /error occurred while running \*CRASH\*: boom/);

  console.error = quiet;
  fs.rmSync(tmp, { recursive: true, force: true });
  handler.loadPlugins();
});

test("plugins only unpack names that Perez.js passes in the context", () => {
  const tesla = fs.readFileSync(path.join(__dirname, "..", "tesla.js"), "utf8");
  const block = tesla.match(/handler\.dispatch\(command, client, m, \{([\s\S]*?)\}\);/);
  assert.ok(block, "handler.dispatch(command, client, m, {...}) call not found in Perez.js");
  const supplied = new Set(block[1].split(/[,\n]/).map((s) => s.trim().split(":")[0].trim()).filter(Boolean));

  for (const file of pluginFiles) {
    const source = fs.readFileSync(path.join(pluginDir, file), "utf8");
    for (const match of source.matchAll(/handler: async \(client, m(?:, \{([^}]*)\})?\)/g)) {
      for (const name of (match[1] || "").split(",").map((s) => s.trim()).filter(Boolean)) {
        assert.ok(supplied.has(name), `${file} reads "${name}" from the context but Perez.js does not provide it`);
      }
    }
  }
});

test("pure commands run end to end with a fake context", async () => {
  const sent = [];
  const m = { chat: "123@s.whatsapp.net", reply: async (message) => sent.push(String(message)) };
  handler.loadPlugins();

  assert.equal(await handler.dispatch("calc", {}, m, { m, text: "2+3*4" }), true);
  assert.equal(sent.pop(), "14");

  await handler.dispatch("calc", {}, m, { text: "process.exit()" });
  assert.match(sent.pop(), /Invalid format/);

  await handler.dispatch("calc", {}, m, { text: "" });
  assert.match(sent.pop(), /Example usage/);
});

test("the menu is generated from the loaded plugins", async () => {
  handler.loadPlugins();
  assert.equal(handler.getPlugin("menu"), handler.getPlugin("help"));

  const sent = [];
  const client = { sendMessage: async (jid, content) => sent.push(content) };
  const m = { chat: "123@s.whatsapp.net", reply: async () => {} };
  await handler.getPlugin("menu").handler(client, m, {
    botname: "Test Bot",
    from: m.chat,
    getGreeting: () => "Good day",
    menutype: "TEXT",
    mp3d: async () => {},
    prefix: ".",
    pushname: "Tester",
    runtime: () => "1 minute",
  });

  assert.equal(sent.length, 1);
  const text = sent[0].text;

  // every command except the menu itself is listed once, under its own category
  const plugins = handler.listPlugins().filter((p) => p.category !== "menu");
  const listed = (text.match(/^│ /gm) || []).length;
  assert.equal(listed, plugins.length);
  assert.match(text, new RegExp(`⟫  ${plugins.length}\\n`));

  for (const category of new Set(plugins.map((p) => p.category))) {
    const count = plugins.filter((p) => p.category === category).length;
    assert.ok(text.includes(`⟦ ${count} ⟧`), `category ${category} should show ${count} commands`);
  }
});

test("a new plugin appears in the menu without editing the menu", async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "plugins-"));
  fs.writeFileSync(path.join(tmp, "extra.js"), "module.exports = [{ command: ['zzzprobe'], aliases: ['zp'], description: 'd', category: 'probe', handler: async () => {} }];");
  fs.writeFileSync(path.join(tmp, "menu.js"), `module.exports = require(${JSON.stringify(path.join(pluginDir, "menu.js"))});`);

  handler.loadPlugins(tmp);
  const sent = [];
  await handler.getPlugin("menu").handler({ sendMessage: async (jid, c) => sent.push(c) }, { chat: "1@s.whatsapp.net" }, {
    botname: "B", getGreeting: () => "hi", menutype: "text", prefix: "!", pushname: "P", runtime: () => "0s",
  });

  assert.match(sent[0].text, /𝗣𝗥𝗢𝗕𝗘|𝙋𝙍𝙊𝘽𝙀/);
  assert.match(sent[0].text, /𝗭𝘇𝘇𝗽𝗿𝗼𝗯𝗲/);
  assert.doesNotMatch(sent[0].text, /𝗠𝗲𝗻𝘂/);

  fs.rmSync(tmp, { recursive: true, force: true });
  handler.loadPlugins();
});
