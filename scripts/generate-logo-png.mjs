// Renders the vector mark (src/components/site/brand-mark.tsx) to
// public/assets/logo-512.png: the logo Google reads from the structured data
// (it needs at least 112×112; the old logo.png is a 32px icon).
// usage: node scripts/generate-logo-png.mjs  (needs Chrome installed)
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const NAVY = '#143a6d'; // sampled from logo.webp
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs><mask id="m">
    <rect width="512" height="512" fill="#fff"/>
    <circle cx="114.4" cy="402.3" r="173.3" fill="#000"/>
    <circle cx="345.8" cy="163.9" r="50" fill="#000"/>
    <line x1="345.8" y1="163.9" x2="114.4" y2="402.3" stroke="#000" stroke-width="25"/>
    <circle cx="84.7" cy="301.7" r="33.9" fill="#fff"/>
    <circle cx="214.4" cy="431.6" r="33.3" fill="#fff"/>
  </mask></defs>
  <circle cx="256" cy="256" r="256" fill="${NAVY}" mask="url(#m)"/>
</svg>`;

const out = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'assets', 'logo-512.png');
const port = 9150 + Math.floor(Math.random() * 400);
const profile = path.join(os.tmpdir(), `sf-logo-${port}`);
rmSync(profile, { recursive: true, force: true }); mkdirSync(profile, { recursive: true });
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let t; for (let i = 0; i < 80 && !t; i++) { try { t = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((x) => x.type === 'page'); } catch { await sleep(200); } }
const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise((r) => ws.addEventListener('open', r));
let id = 0; const pend = new Map(); ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } });
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 512, height: 512, deviceScaleFactor: 1, mobile: false });
await send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
const html = `<html><body style="margin:0;background:transparent">${svg}</body></html>`;
await send('Page.navigate', { url: 'data:text/html;base64,' + Buffer.from(html).toString('base64') });
await sleep(800);
const shot = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 512, height: 512, scale: 1 } });
writeFileSync(out, Buffer.from(shot.result.data, 'base64'));
console.log('wrote', out);
ws.close(); chrome.kill(); process.exit(0);
