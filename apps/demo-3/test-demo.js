import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { promisify } from 'util';

const sleep = promisify(setTimeout);

async function testDemo() {
  console.log('Starting preview server...');
  
  // Start vite preview server
  const server = spawn('npx', ['vite', 'preview', '--port', '4173', '--host'], {
    cwd: '/workspace/apps/demo-3',
    stdio: 'pipe'
  });
  
  let serverReady = false;
  server.stdout.on('data', (data) => {
    const output = data.toString();
    console.log('Server:', output.trim());
    if (output.includes('Local:') || output.includes('http://')) {
      serverReady = true;
    }
  });
  
  server.stderr.on('data', (data) => {
    console.error('Server error:', data.toString());
  });
  
  // Wait for server to start
  for (let i = 0; i < 30; i++) {
    if (serverReady) break;
    await sleep(1000);
  }
  
  if (!serverReady) {
    console.error('Server failed to start');
    server.kill();
    process.exit(1);
  }
  
  console.log('Launching browser...');
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });
  
  const page = await context.newPage();
  
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('Browser console error:', msg.text());
      consoleErrors.push(msg.text());
    }
  });
  
  const pageErrors = [];
  page.on('pageerror', error => {
    console.error('Page error:', error);
    pageErrors.push(error);
  });
  
  console.log('Navigating to demo...');
  await page.goto('http://localhost:4173/tech-demos/demo-3/', { waitUntil: 'networkidle' });
  
  // Wait for the React app to render
  await page.waitForSelector('.app', { timeout: 10000 });
  
  console.log('Starting stream...');
  await page.click('.btn-primary');
  
  // Wait for streaming to reach approximately 40% progress
  console.log('Waiting for mid-stream...');
  await sleep(3000);
  
  // Capture screenshot
  console.log('Capturing screenshot...');
  const screenshotPath = '/workspace/apps/demo-3/demo-screenshot.png';
  await page.screenshot({ 
    path: screenshotPath,
    fullPage: false
  });
  
  console.log(`Screenshot saved to: ${screenshotPath}`);
  
  // Verify both panes are visible
  const naivePane = await page.locator('.naive-content').isVisible();
  const streamdownPane = await page.locator('.streamdown-content').isVisible();
  
  console.log('\nVerification:');
  console.log('- Naive pane visible:', naivePane);
  console.log('- Streamdown pane visible:', streamdownPane);
  console.log('- Console errors:', consoleErrors.length);
  console.log('- Page errors:', pageErrors.length);
  
  await browser.close();
  server.kill();
  
  if (naivePane && streamdownPane && consoleErrors.length === 0 && pageErrors.length === 0) {
    console.log('\n✓ Demo verification successful!');
    return 0;
  } else {
    console.log('\n✗ Demo verification failed!');
    return 1;
  }
}

testDemo()
  .then(code => process.exit(code))
  .catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
  });
