const { spawn } = require('child_process');
const http = require('http');
const os = require('os');
const path = require('path');
const fs = require('fs');

const tempDir = path.join(os.tmpdir(), 'chrome_gdrive_all_' + Date.now());
fs.mkdirSync(tempDir, { recursive: true });

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const proc = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9222',
  `--user-data-dir=${tempDir}`,
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-gpu',
  '--window-size=1280,1024',
  'about:blank'
], { detached: false });

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.msgId = 1;
    this.pending = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.pending.has(msg.id)) {
          const { res, rej } = this.pending.get(msg.id);
          this.pending.delete(msg.id);
          if (msg.error) rej(msg.error);
          else res(msg.result);
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((res, rej) => {
      const id = this.msgId++;
      this.pending.set(id, { res, rej });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return res.result?.value;
  }
}

const folders = [
  { key: 'dc_001_100', url: 'https://drive.google.com/drive/folders/1Mn--qMdo7WmK6I57c9KS9EZTDRIX_iS_' },
  { key: 'dc_101_200', url: 'https://drive.google.com/drive/folders/1Iqo0pa1QMNKMdt7DZSuQqcP172P9bfG4' },
  { key: 'dc_201_300', url: 'https://drive.google.com/drive/folders/1Su5JfJ5jreZQEOTCa62bes0AN3gebYPE' },
  { key: 'dc_301_400', url: 'https://drive.google.com/drive/folders/1PAYxqvj8oxkPtmb9K8B9n4ywocc7ycaR' },
  { key: 'dc_401_500', url: 'https://drive.google.com/drive/folders/1CpAHo_PKsIOrXtJcynrZavkGKdJZEoal' },
  { key: 'builty',     url: 'https://drive.google.com/drive/folders/1g7a0-mJH61IAnyvZaTNC8SdMHEYq1GTk' }
];

async function scrapeFolder(client, folder) {
  console.log(`\n========================================`);
  console.log(`Navigating to ${folder.key}: ${folder.url}`);
  await client.send('Page.navigate', { url: folder.url });
  await sleep(7000);

  let lastCount = 0;
  let stagnantTurns = 0;

  for (let scroll = 1; scroll <= 15; scroll++) {
    await client.evaluate(`
      (() => {
        const scrollables = document.querySelectorAll('*');
        for (const s of scrollables) {
          if (s.scrollHeight > s.clientHeight && s.clientHeight > 200) {
            s.scrollTop = s.scrollHeight;
          }
        }
      })()
    `);
    await sleep(2000);

    const currentCount = await client.evaluate(`
      document.querySelectorAll('[aria-label]').length
    `);

    if (currentCount === lastCount) {
      stagnantTurns++;
      if (stagnantTurns >= 3 && scroll >= 5) {
        console.log(`Scroll stabilized at ${currentCount} DOM items.`);
        break;
      }
    } else {
      stagnantTurns = 0;
      lastCount = currentCount;
    }
  }

  const items = await client.evaluate(`
    (() => {
      const results = {};
      const els = document.querySelectorAll('[aria-label]');
      for (const el of els) {
        const label = el.getAttribute('aria-label') || '';
        const idEl = el.querySelector('[data-id]') || el.closest('[data-id]');
        const id = idEl ? idEl.getAttribute('data-id') : null;
        if (id) {
          const cleanName = label.replace(/\\s+(Image|Shared|Microsoft Excel|folder).*$/i, '').trim();
          results[cleanName] = id;
        }
      }
      return results;
    })()
  `);

  console.log(`[${folder.key}] Found ${Object.keys(items).length} files!`);
  return items;
}

async function run() {
  await sleep(2000);
  const tabs = await getJson('http://127.0.0.1:9222/json');
  const pageTab = tabs.find(t => t.type === 'page') || tabs[0];
  const client = new CDPClient(pageTab.webSocketDebuggerUrl);
  await client.connect();
  await client.send('Page.enable');
  await client.send('Runtime.enable');

  const allResults = {};

  for (const f of folders) {
    try {
      allResults[f.key] = await scrapeFolder(client, f);
    } catch (err) {
      console.error(`Error scraping ${f.key}:`, err);
    }
  }

  // Summary counts
  console.log('\n========================================');
  console.log('SUMMARY OF ALL DRIVE FILES SCRAPED:');
  for (const [k, v] of Object.entries(allResults)) {
    console.log(`  ${k}: ${Object.keys(v).length} files`);
  }

  const outputPath = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\86132b2a-b665-4af3-b3e0-d7e39f1226c9\\scratch\\drive_scans_index.json';
  fs.writeFileSync(outputPath, JSON.stringify(allResults, null, 2), 'utf-8');
  console.log(`Successfully saved to ${outputPath}`);

  proc.kill();
  process.exit(0);
}

run().catch(err => {
  console.error('Fatal Scraper Error:', err);
  proc.kill();
  process.exit(1);
});
