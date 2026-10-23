// Harness mínimo de QA via Chrome DevTools Protocol para o Edge headless — Node 14+, sem dependências.
// Uso: node cdp.js <plano.js> [porta]
// O plano exporta: module.exports = async function (api) { await api.viewport(1440, 900); await api.go(url); ... }
// API: viewport(w,h,{mobile,dpr}) · go(url) · wait(ms) · shot(arquivo,{full}) · eval(expr) · scroll(y) · mouse(x,y)
//      reducedMotion(bool) · erros() → mensagens de console/exceções coletadas
'use strict';
const http = require('http');
const crypto = require('crypto');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const PORTA = Number(process.argv[3] || 9333);

class WS {
  constructor(socket) {
    this.s = socket; this.buf = Buffer.alloc(0); this.frag = []; this.onmessage = null;
    socket.on('data', (d) => this._data(d));
  }
  _data(d) {
    this.buf = Buffer.concat([this.buf, d]);
    for (;;) {
      if (this.buf.length < 2) return;
      const b0 = this.buf[0], b1 = this.buf[1];
      let len = b1 & 127, off = 2;
      if (len === 126) { if (this.buf.length < 4) return; len = this.buf.readUInt16BE(2); off = 4; }
      else if (len === 127) { if (this.buf.length < 10) return; len = Number(this.buf.readBigUInt64BE(2)); off = 10; }
      if (this.buf.length < off + len) return;
      const payload = this.buf.slice(off, off + len);
      this.buf = this.buf.slice(off + len);
      const op = b0 & 15, fin = b0 & 128;
      if (op === 8) { this.s.end(); return; }
      if (op === 9) { this._send(payload, 10); continue; }
      if (op === 1 || op === 0) {
        this.frag.push(payload);
        if (fin) { const msg = Buffer.concat(this.frag).toString('utf8'); this.frag = []; if (this.onmessage) this.onmessage(msg); }
      }
    }
  }
  _send(data, op) {
    const p = Buffer.isBuffer(data) ? data : Buffer.from(data);
    const mask = crypto.randomBytes(4);
    let hdr;
    if (p.length < 126) { hdr = Buffer.alloc(2); hdr[1] = 0x80 | p.length; }
    else if (p.length < 65536) { hdr = Buffer.alloc(4); hdr[1] = 0x80 | 126; hdr.writeUInt16BE(p.length, 2); }
    else { hdr = Buffer.alloc(10); hdr[1] = 0x80 | 127; hdr.writeBigUInt64BE(BigInt(p.length), 2); }
    hdr[0] = 0x80 | op;
    const m = Buffer.alloc(p.length);
    for (let i = 0; i < p.length; i++) m[i] = p[i] ^ mask[i & 3];
    this.s.write(Buffer.concat([hdr, mask, m]));
  }
  send(s) { this._send(s, 1); }
}

function wsConnect(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request({
      host: u.hostname, port: u.port, path: u.pathname,
      headers: { Connection: 'Upgrade', Upgrade: 'websocket', 'Sec-WebSocket-Key': crypto.randomBytes(16).toString('base64'), 'Sec-WebSocket-Version': '13' }
    });
    req.on('upgrade', (res, socket) => resolve(new WS(socket)));
    req.on('error', reject);
    req.end();
  });
}
function getJSON(p) {
  return new Promise((resolve, reject) => {
    http.get({ host: '127.0.0.1', port: PORTA, path: p }, (res) => {
      let b = ''; res.on('data', (c) => (b += c)); res.on('end', () => { try { resolve(JSON.parse(b)); } catch (e) { reject(e); } });
    }).on('error', reject);
  });
}
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const plano = require(path.resolve(process.argv[2]));
  const perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'edge-qa-'));
  const edge = spawn(EDGE, ['--headless=new', '--remote-debugging-port=' + PORTA, '--user-data-dir=' + perfil, '--no-first-run',
    '--no-default-browser-check', '--autoplay-policy=no-user-gesture-required', '--hide-scrollbars', '--allow-file-access-from-files', 'about:blank'], { stdio: 'ignore' });
  let alvos = null;
  for (let i = 0; i < 60 && !alvos; i++) { await dormir(250); try { alvos = await getJSON('/json/list'); } catch (e) {} }
  if (!alvos) throw new Error('Edge não abriu a porta de depuração');
  const pagina = alvos.find((t) => t.type === 'page');
  const ws = await wsConnect(pagina.webSocketDebuggerUrl);
  let id = 0; const pend = new Map(); const erros = [];
  ws.onmessage = (m) => {
    const j = JSON.parse(m);
    if (j.id && pend.has(j.id)) { const { res, rej } = pend.get(j.id); pend.delete(j.id); j.error ? rej(new Error(j.error.message)) : res(j.result); }
    else if (j.method === 'Runtime.exceptionThrown') erros.push('exceção: ' + (j.params.exceptionDetails.exception ? j.params.exceptionDetails.exception.description : j.params.exceptionDetails.text));
    else if (j.method === 'Runtime.consoleAPICalled' && (j.params.type === 'error' || j.params.type === 'warning')) erros.push('console.' + j.params.type + ': ' + j.params.args.map((a) => a.value || a.description).join(' '));
    else if (j.method === 'Log.entryAdded' && j.params.entry.level === 'error') erros.push('log: ' + j.params.entry.text + ' ' + (j.params.entry.url || ''));
  };
  const cmd = (method, params) => { const i = ++id; ws.send(JSON.stringify({ id: i, method, params: params || {} })); return new Promise((res, rej) => pend.set(i, { res, rej })); };
  await cmd('Page.enable'); await cmd('Runtime.enable'); await cmd('Log.enable');

  const api = {
    async viewport(w, h, o) {
      o = o || {};
      await cmd('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: o.dpr || 1, mobile: !!o.mobile });
      await cmd('Emulation.setTouchEmulationEnabled', o.mobile ? { enabled: true, maxTouchPoints: 5 } : { enabled: false });
    },
    async reducedMotion(on) { await cmd('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: on ? 'reduce' : 'no-preference' }] }); },
    async go(url) { await cmd('Page.navigate', { url }); await dormir(400); },
    wait: dormir,
    async eval(expr) { const r = await cmd('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) console.log('eval falhou:', (r.exceptionDetails.exception && r.exceptionDetails.exception.description) || r.exceptionDetails.text); return r.result && r.result.value; },
    async scroll(y) { await cmd('Runtime.evaluate', { expression: 'window.scrollTo(0,' + y + ')' }); },
    async mouse(x, y) { await cmd('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y }); },
    async shot(arquivo, o) {
      o = o || {};
      const p = { format: arquivo.endsWith('.jpg') ? 'jpeg' : 'png', quality: 82 };
      if (o.full) {
        const m = await cmd('Page.getLayoutMetrics');
        const cs = m.cssContentSize || m.contentSize;
        p.clip = { x: 0, y: 0, width: cs.width, height: Math.min(cs.height, 16000), scale: o.scale || 1 };
        p.captureBeyondViewport = true;
      } else if (o.seletor) {
        // recorte de um elemento (coordenadas do documento = rect + rolagem)
        const r0 = await api.eval('(function(){var e=document.querySelector(' + JSON.stringify(o.seletor) + ');if(!e)return null;var r=e.getBoundingClientRect();return {x:r.left+scrollX,y:r.top+scrollY,width:r.width,height:r.height}})()');
        if (r0) { p.clip = Object.assign(r0, { scale: o.scale || 1 }); p.captureBeyondViewport = true; }
      }
      const r = await cmd('Page.captureScreenshot', p);
      fs.mkdirSync(path.dirname(arquivo), { recursive: true });
      fs.writeFileSync(arquivo, Buffer.from(r.data, 'base64'));
      console.log('captura:', arquivo);
    },
    erros() { return erros.slice(); }
  };
  try { await plano(api); }
  catch (e) { console.error('ERRO NO PLANO:', e.message); process.exitCode = 1; }
  finally {
    if (erros.length) console.log('Console/erros:\n  ' + erros.join('\n  ')); else console.log('Console sem erros.');
    try { await cmd('Browser.close'); } catch (e) {}
    setTimeout(() => { try { edge.kill(); } catch (e) {} process.exit(); }, 400);
  }
})().catch((e) => { console.error(e); process.exit(1); });
