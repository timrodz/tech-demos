import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotPath = path.join(__dirname, 'screenshot.png');
const PORT = 4175;
const URL = `http://127.0.0.1:${PORT}/demo-5/`;

function waitForOutput(child, test, timeoutMs = 20000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timed out waiting for preview server')), timeoutMs);
    const onData = (buf) => {
      const text = buf.toString();
      process.stdout.write(text);
      if (test(text)) {
        clearTimeout(timer);
        child.stdout.off('data', onData);
        child.stderr.off('data', onData);
        resolve();
      }
    };
    child.stdout.on('data', onData);
    child.stderr.on('data', onData);
  });
}

async function main() {
  const html = readFileSync(path.join(__dirname, '../../docs/demo-5/index.html'), 'utf8');
  if (!html.includes('src="/demo-5/assets/') || !html.includes('href="/demo-5/assets/')) {
    throw new Error(`FAILED: built index.html missing /demo-5/ asset paths\n${html}`);
  }

  const server = spawn('bun', ['run', 'preview', '--', '--port', String(PORT), '--host', '127.0.0.1', '--strictPort'], {
    cwd: __dirname,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  try {
    await waitForOutput(server, (text) => text.includes('http') || text.includes('Local:'));

    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [];
    page.on('pageerror', (err) => errors.push(String(err)));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.waitForSelector('.pass');

    await page.waitForFunction(() => {
      const dest = document.querySelector('.destination')?.textContent ?? '';
      const price = document.querySelector('.price')?.textContent ?? '';
      return dest.includes('Queenstown') && (price.includes('2,486') || price.includes('2486'));
    }, { timeout: 25000 });

    const destination = (await page.locator('.destination').textContent())?.trim();
    const dates = (await page.locator('.dates').textContent()) ?? '';
    const facts = (await page.locator('.facts').textContent()) ?? '';
    const json = (await page.locator('.json-display').textContent()) ?? '';

    await page.screenshot({ path: screenshotPath, fullPage: false });

    await page.waitForFunction(() => {
      const stub = document.querySelector('.stub-code')?.textContent ?? '';
      const meter = document.querySelector('.meter')?.textContent ?? '';
      return stub.includes('NZ-Q4K8M2') && meter.includes('complete');
    }, { timeout: 20000 });

    const confirmation = (await page.locator('.stub-code').textContent())?.trim();

    console.log('destination:', destination);
    console.log('dates:', dates.replace(/\s+/g, ' ').trim());
    console.log('facts:', facts.replace(/\s+/g, ' ').trim());
    console.log('confirmation:', confirmation);
    console.log('json has destination:', json.includes('Queenstown'));
    console.log('console/page errors:', errors.length);
    console.log('screenshot:', screenshotPath);

    const filled =
      destination?.includes('Queenstown') &&
      dates.includes('14') &&
      facts.includes('Premium') &&
      (facts.includes('2,486') || facts.includes('2486')) &&
      json.includes('Queenstown') &&
      confirmation.includes('NZ-Q4K8M2');

    await browser.close();

    if (!filled) {
      throw new Error('FAILED: itinerary card did not fill with visible fields');
    }
    if (errors.length) {
      throw new Error(`FAILED: page errors ${errors.join('\n')}`);
    }
    console.log('✓ Progressive field fill is visible; assets use /demo-5/');
  } finally {
    server.kill('SIGTERM');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
