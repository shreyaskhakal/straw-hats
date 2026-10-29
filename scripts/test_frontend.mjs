// scripts/test_frontend.mjs
// Mandate Gateway — Automated Frontend Verification Suite
// Verifies production build assets, Vercel SPA rewrites, client mock service layer, and direct route navigation.

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.resolve(ROOT_DIR, 'dist');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`  ❌ [FAIL] ${message}`);
    throw new Error(message);
  }
  console.log(`  ✓ [PASS] ${message}`);
  passedTests++;
}

async function testSection(title, fn) {
  console.log(`\n=== ${title} ===`);
  try {
    await fn();
  } catch (err) {
    console.error(`Section error: ${err.message}`);
  }
}

async function run() {
  console.log('🚀 Starting Mandate Gateway Frontend Verification Suite\n');

  // 1. Build Artifacts Verification
  await testSection('1. Production Build Distribution Check', () => {
    assert(fs.existsSync(DIST_DIR), 'dist/ directory exists');
    const indexHtmlPath = path.join(DIST_DIR, 'index.html');
    assert(fs.existsSync(indexHtmlPath), 'dist/index.html exists');

    const htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
    assert(htmlContent.includes('id="root"'), 'dist/index.html contains #root mounting node');
    assert(htmlContent.includes('<script type="module"'), 'dist/index.html includes Vite module script tag');
    assert(htmlContent.includes('Mandate Gateway'), 'dist/index.html contains application brand title');
    assert(htmlContent.includes('viewport'), 'dist/index.html contains viewport meta tag for mobile responsiveness');

    const assetsDir = path.join(DIST_DIR, 'assets');
    assert(fs.existsSync(assetsDir), 'dist/assets directory exists');
    const assetFiles = fs.readdirSync(assetsDir);
    assert(assetFiles.some((f) => f.startsWith('vendor-') && f.endsWith('.js')), 'vendor bundle chunk generated');
    assert(assetFiles.some((f) => f.startsWith('index-') && f.endsWith('.js')), 'application bundle chunk generated');
    assert(assetFiles.some((f) => f.startsWith('index-') && f.endsWith('.css')), 'compiled stylesheet generated');
    assert(assetFiles.some((f) => f.endsWith('.jpg') || f.endsWith('.png')), 'static images bundled in assets');
  });

  // 2. Vercel Configuration Verification
  await testSection('2. Vercel Configuration Check', () => {
    const vercelConfigPath = path.join(ROOT_DIR, 'vercel.json');
    assert(fs.existsSync(vercelConfigPath), 'vercel.json exists in root directory');

    const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
    assert(vercelConfig.buildCommand === 'npm run build', 'vercel.json buildCommand is "npm run build"');
    assert(vercelConfig.outputDirectory === 'dist', 'vercel.json outputDirectory is "dist"');
    assert(Array.isArray(vercelConfig.rewrites) && vercelConfig.rewrites.length > 0, 'vercel.json rewrites array defined');
    const spaRewrite = vercelConfig.rewrites.find((r) => r.destination === '/index.html');
    assert(Boolean(spaRewrite), 'vercel.json contains SPA rewrite destination to /index.html');
  });

  // 3. Client Mock Service Layer
  await testSection('3. Frontend Demo Mock Service Layer', async () => {
    const { dispatchMockRequest } = await import('../src/api/mockService.js');

    // Health
    const health = await dispatchMockRequest('/health');
    assert(health.status === 'UP' && health.mode === 'FRONTEND_DEMO_SANDBOX', 'GET /health returns demo sandbox UP');

    // Dashboard
    const dashboard = await dispatchMockRequest('/dashboard');
    assert(dashboard.success && dashboard.stats.activeMandates > 0, 'GET /dashboard returns active mandates stats');
    assert(dashboard.pendingApprovals.length > 0, 'GET /dashboard returns pending human approvals list');

    // Mandates
    const mandates = await dispatchMockRequest('/mandates');
    assert(mandates.success && Array.isArray(mandates.mandates), 'GET /mandates returns mandates list');

    // Agent Brief Parser
    const brief = await dispatchMockRequest('/agent/parse-brief', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Ergonomic gaming mouse under 3000' }),
    });
    assert(brief.success && brief.structuredBrief.mustHaves.length > 0, 'POST /agent/parse-brief parses specifications');

    // Policy Evaluate
    const policyEval = await dispatchMockRequest('/policy/evaluate', {
      method: 'POST',
      body: JSON.stringify({
        request: { merchant: 'Amazon India', amount: 2499, mandateId: 'M-902' },
      }),
    });
    assert(policyEval.success && policyEval.evaluation.verdict === 'ALLOW', 'POST /policy/evaluate auto-clears compliant item');

    // Purchase Requests
    const requests = await dispatchMockRequest('/requests');
    assert(requests.success && requests.requests.length > 0, 'GET /requests returns purchase requests queue');

    // Payment Methods
    const paymentMethods = await dispatchMockRequest('/payment-methods');
    assert(paymentMethods.success && paymentMethods.paymentMethods.length > 0, 'GET /payment-methods returns rails');

    // Passports
    const passports = await dispatchMockRequest('/passports');
    assert(passports.success && passports.passports.length > 0, 'GET /passports returns agent keys');

    // Merchant Token Verification
    const verify = await dispatchMockRequest('/passports/verify/0x9A48F9E03B812C44D87102E9B310FCA1');
    assert(verify.verified && verify.status === 'ACTIVE_AUTHORIZED', 'GET /passports/verify/:token verifies token');

    // Security Attacks Suite
    const attacks = await dispatchMockRequest('/security/attacks');
    assert(attacks.success && attacks.attacks.length >= 5, 'GET /security/attacks returns resilience test vectors');
  });

  // 4. Direct Navigation & SPA Fallback Route Resolution
  await testSection('4. Direct Navigation & SPA Rewrite Resolution', async () => {
    const routesToTest = [
      '/',
      '/login',
      '/dashboard',
      '/mandates',
      '/agent',
      '/requests',
      '/payment-methods',
      '/passport',
      '/activity',
      '/security',
      '/settings',
      '/verify',
      '/verify/0x9A48F9E03B812C44D87102E9B310FCA1',
      '/unrecognized-deep-route-slug',
    ];

    const indexHtml = fs.readFileSync(path.join(DIST_DIR, 'index.html'));

    // Start a lightweight local HTTP server simulating Vercel's SPA rewrites on dist
    const server = http.createServer((req, res) => {
      const cleanUrl = req.url.split('?')[0];
      const filePath = path.join(DIST_DIR, cleanUrl.replace(/^\//, ''));

      // If static file exists in dist, serve it
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        res.writeHead(200);
        res.end(fs.readFileSync(filePath));
        return;
      }

      // Otherwise, SPA fallback rewrite to index.html (like Vercel does)
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(indexHtml);
    });

    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const port = server.address().port;

    for (const route of routesToTest) {
      const res = await fetch(`http://127.0.0.1:${port}${route}`);
      const text = await res.text();
      assert(res.status === 200 && text.includes('id="root"'), `Direct navigation to ${route} yields 200 OK with #root shell`);
    }

    await new Promise((resolve) => server.close(resolve));
  });

  // 5. API Contracts, Postman & Modular Service Specifications
  await testSection('5. API Contracts, Postman & Modular Services Check', async () => {
    // OpenAPI Specification
    const openApiPath = path.join(ROOT_DIR, 'openapi.yaml');
    assert(fs.existsSync(openApiPath), 'openapi.yaml exists in root');
    const openApiContent = fs.readFileSync(openApiPath, 'utf8');
    assert(openApiContent.includes('openapi: 3.0.3'), 'openapi.yaml specifies OpenAPI 3.0.3 format');
    assert(openApiContent.includes('/health:'), 'openapi.yaml contains /health route');
    assert(openApiContent.includes('/agent/evaluate-candidates:'), 'openapi.yaml contains /agent/evaluate-candidates route');
    assert(openApiContent.includes('/policy/evaluate:'), 'openapi.yaml contains /policy/evaluate route');
    assert(openApiContent.includes('/requests/{id}/approve:'), 'openapi.yaml contains /requests/{id}/approve route');

    // Postman Collection
    const postmanPath = path.join(ROOT_DIR, 'postman_collection.json');
    assert(fs.existsSync(postmanPath), 'postman_collection.json exists in root');
    const postmanJson = JSON.parse(fs.readFileSync(postmanPath, 'utf8'));
    assert(postmanJson.info && postmanJson.info.schema.includes('collection.json'), 'postman_collection.json has valid collection schema');
    assert(Array.isArray(postmanJson.item) && postmanJson.item.length === 12, 'postman_collection.json contains 12 lifecycle folders');
    assert(postmanJson.variable.some((v) => v.key === 'baseUrl'), 'postman_collection.json defines {{baseUrl}} environment variable');

    // Product Provider (Channel3 adapter)
    const { ProductProvider, DemoChannel3ProductProvider, defaultProductProvider } = await import('../src/services/productProvider.js');
    assert(Boolean(ProductProvider && DemoChannel3ProductProvider), 'productProvider.js exports Provider classes');
    const searchResult = await defaultProductProvider.searchCandidates({ prompt: 'mouse', maxPrice: 5000 });
    assert(searchResult && Array.isArray(searchResult.candidates) && searchResult.candidates.length > 0, 'defaultProductProvider searches candidate products');
    const sampleProduct = searchResult.candidates[0];
    const details = await defaultProductProvider.getProductDetails(sampleProduct.id);
    assert(details && details.id === sampleProduct.id, 'defaultProductProvider retrieves verified details');

    // Payment Service (PayPal Sandbox adapter)
    const { PaymentService, DemoPayPalPaymentService, PAYMENT_LIFECYCLE_STATES, defaultPaymentService } = await import('../src/services/paymentService.js');
    assert(Boolean(PaymentService && DemoPayPalPaymentService), 'paymentService.js exports Payment classes');
    assert(Object.keys(PAYMENT_LIFECYCLE_STATES).length === 7, 'paymentService.js defines 7 explicit payment lifecycle states');
    assert(PAYMENT_LIFECYCLE_STATES.SANDBOX_CONFIGURED === 'SANDBOX_CONFIGURED', 'paymentService.js contains SANDBOX_CONFIGURED');
    assert(PAYMENT_LIFECYCLE_STATES.AWAITING_APPROVAL === 'AWAITING_APPROVAL', 'paymentService.js contains AWAITING_APPROVAL');
    const configStatus = await defaultPaymentService.getConfigurationStatus();
    assert(configStatus.clientIdConfigured && configStatus.environment.includes('sandbox.paypal.com'), 'defaultPaymentService returns sandbox.paypal.com configuration status');

    // API Contracts & Constants
    const { API_ROUTES, REQUEST_LIFECYCLE_STATUS, POLICY_VERDICTS, DECISION_REASONS } = await import('../src/services/apiContract.js');
    assert(Boolean(API_ROUTES && API_ROUTES.HEALTH), 'apiContract.js exports API_ROUTES with HEALTH');
    assert(Boolean(REQUEST_LIFECYCLE_STATUS && REQUEST_LIFECYCLE_STATUS.APPROVED), 'apiContract.js exports REQUEST_LIFECYCLE_STATUS');
    assert(Boolean(POLICY_VERDICTS && POLICY_VERDICTS.ALLOW && POLICY_VERDICTS.FLAG_HUMAN && POLICY_VERDICTS.BLOCK), 'apiContract.js exports POLICY_VERDICTS');
  });

  console.log(`\n🏁 Frontend Verification Results: ${passedTests} / ${totalTests} tests passed.\n`);
  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
