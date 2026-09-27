// Renders the OG image (scripts/og/og-image.html) with headless Chrome.
//
//   node scripts/generate-og-image.mjs              → public/assets/og-studio-faraj.jpg (+ -en.jpg)
//   node scripts/generate-og-image.mjs --animated   → also og-animated/ (WebP + GIF loops for social posts)
//
// Link previews (WhatsApp, Facebook, LinkedIn, X) show og:image as a still, so
// the site uses the JPEGs; the animated files are for posts and stories.
// Chrome: set CHROME_PATH if it isn't in the usual place.
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';

const root = process.cwd();
const page = pathToFileURL(path.join(root, 'scripts/og/og-image.html')).href;
const animated = process.argv.includes('--animated');
const W = 1200;
const H = 630;
const LOOP_MS = 4000;
const FPS = 20;

const chromePath =
  process.env.CHROME_PATH ??
  [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ].find((p) => existsSync(p));
if (!chromePath) throw new Error('Chrome not found: set CHROME_PATH.');

const port = 9300 + Math.floor(Math.random() * 500);
const profile = path.join(tmpdir(), `og-chrome-${port}`);
rmSync(profile, { recursive: true, force: true });
const chrome = spawn(chromePath, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--hide-scrollbars', `--window-size=${W},${H}`, '--allow-file-access-from-files', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let target;
for (let i = 0; i < 100 && !target; i++) {
  try {
    target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === 'page');
  } catch {
    await sleep(150);
  }
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let id = 0;
const pending = new Map();
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m.result);
    pending.delete(m.id);
  }
});
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = (expression) => send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
const shot = async () => Buffer.from((await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: W, height: H, scale: 1 } })).data, 'base64');

await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });

async function open(query) {
  await send('Page.navigate', { url: `${page}?${query}` });
  await sleep(500);
  await evaluate('document.fonts.ready.then(() => Promise.all([...document.images].map((i) => i.decode())))');
  await sleep(200);
}

// The link-preview stills: small JPEGs (WhatsApp drops previews over ~300 KB).
for (const lang of ['it', 'en']) {
  await open(`lang=${lang}&still`);
  const out = path.join(root, 'public/assets', lang === 'it' ? 'og-studio-faraj.jpg' : 'og-studio-faraj-en.jpg');
  const info = await sharp(await shot()).jpeg({ quality: 86, mozjpeg: true }).toFile(out);
  console.log('Wrote', path.relative(root, out), `${Math.round(info.size / 1024)} KB`);
}

// The moving version: one loop, frame by frame, with the animations paused and stepped.
if (animated) {
  const dir = path.join(root, 'og-animated');
  mkdirSync(dir, { recursive: true });
  for (const lang of ['it', 'en']) {
    await open(`lang=${lang}`);
    const frames = [];
    const count = (LOOP_MS / 1000) * FPS;
    for (let f = 0; f < count; f++) {
      await evaluate(`document.getAnimations().forEach((a) => { a.pause(); a.currentTime = ${(f * LOOP_MS) / count}; })`);
      await sleep(30);
      frames.push(await shot());
    }
    const delay = Array(count).fill(Math.round(1000 / FPS));
    const base = path.join(dir, `og-studio-faraj${lang === 'it' ? '' : '-en'}`);
    const webp = await sharp(frames, { join: { animated: true } }).webp({ quality: 90, smartSubsample: true, loop: 0, delay, effort: 6 }).toFile(`${base}.webp`);
    // GIF at half size: full-size GIFs of a 4 s loop run to several megabytes.
    const small = await Promise.all(frames.map((b) => sharp(b).resize(W / 2, H / 2).png().toBuffer()));
    const gif = await sharp(small, { join: { animated: true } }).gif({ loop: 0, delay, effort: 7 }).toFile(`${base}.gif`);
    console.log('Wrote', path.relative(root, `${base}.webp`), `${Math.round(webp.size / 1024)} KB`, '·', path.relative(root, `${base}.gif`), `${Math.round(gif.size / 1024)} KB`);
  }
}

ws.close();
chrome.kill();
