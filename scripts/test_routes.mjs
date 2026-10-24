// scripts/test_routes.mjs
// Verifies HTML5 routing and status for all SPA routes in Mandate Gateway

const routes = [
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
  '/some-unknown-route'
];

async function checkRoutes() {
  console.log('Testing frontend direct URL resolution & client routing fallbacks...\n');
  let passCount = 0;

  for (const route of routes) {
    const url = `http://localhost:5173${route}`;
    try {
      const res = await fetch(url);
      const text = await res.text();
      if (res.status === 200 && text.includes('id="root"')) {
        console.log(`[PASS] ${route} -> 200 OK (Served HTML shell with #root)`);
        passCount++;
      } else {
        console.error(`[FAIL] ${route} -> Status ${res.status}`);
      }
    } catch (err) {
      console.error(`[FAIL] ${route} -> Error: ${err.message}`);
    }
  }

  console.log(`\nRoute Verification Complete: ${passCount} / ${routes.length} routes resolved.`);
  if (passCount !== routes.length) {
    process.exit(1);
  }
}

checkRoutes();
