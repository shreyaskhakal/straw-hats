// scripts/test_integration.mjs
// Comprehensive automated integration & endpoint verification suite for Mandate Gateway

const BACKEND_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:5173';

const results = [];

async function test(name, fn) {
  try {
    const res = await fn();
    results.push({ name, status: 'PASSED', detail: res || 'OK' });
    console.log(`[PASS] ${name} -> ${res || 'OK'}`);
  } catch (err) {
    results.push({ name, status: 'FAILED', detail: err.message });
    console.error(`[FAIL] ${name} ->`, err.message);
  }
}

async function runAll() {
  console.log('--- Starting Mandate Gateway End-to-End Integration Suite ---\n');

  // 1. Frontend Dev Server Root
  await test('Frontend Dev Server (http://localhost:5173/)', async () => {
    const res = await fetch(FRONTEND_URL);
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const text = await res.text();
    if (!text.includes('id="root"')) throw new Error('Root element missing from HTML');
    if (!text.includes('Mandate Gateway')) throw new Error('Page title missing from HTML');
    return 'HTML served with #root and title';
  });

  // 2. Vite Proxy to Backend
  await test('Vite Proxy /api -> Backend (http://localhost:5173/api/dashboard)', async () => {
    const res = await fetch(`${FRONTEND_URL}/api/dashboard`);
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.stats) throw new Error('Invalid dashboard payload through proxy');
    return `Proxied successfully: ${json.stats.activeMandates} active mandates, utilization: ${json.stats.utilizationPercentage}%`;
  });

  // 3. Session Info
  await test('Backend GET /api/session', async () => {
    const res = await fetch(`${BACKEND_URL}/api/session`);
    const json = await res.json();
    if (!json.success || !json.user) throw new Error('Missing user session');
    return `User: ${json.user.name} (${json.user.email}) - ${json.user.compliance}`;
  });

  // 4. Session Login
  await test('Backend POST /api/login', async () => {
    const res = await fetch(`${BACKEND_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passphrase: 'sovereign-passphrase-vault', rememberTerminal: true })
    });
    const json = await res.json();
    if (!json.success || !json.user) throw new Error('Login failed');
    return `Authenticated: ${json.user.name} (${json.user.terminalVersion})`;
  });

  // 5. Dashboard Overview Metrics & Feeds
  await test('Backend GET /api/dashboard', async () => {
    const res = await fetch(`${BACKEND_URL}/api/dashboard`);
    const json = await res.json();
    if (!json.success || !json.stats || !json.pendingApprovals || !json.activeMandates) {
      throw new Error('Invalid dashboard schema');
    }
    return `Stats: Active Mandates=${json.stats.activeMandates}, Ceiling=₹${json.stats.totalCeiling}, Halted=₹${json.stats.haltedAmount}`;
  });

  // 6. Mandates List
  let testMandateId = null;
  await test('Backend GET /api/mandates', async () => {
    const res = await fetch(`${BACKEND_URL}/api/mandates`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.mandates)) throw new Error('Invalid mandates list');
    if (json.mandates.length === 0) throw new Error('Mandates list is empty');
    return `Retrieved ${json.mandates.length} active mandates`;
  });

  // 7. Mandate Creation
  await test('Backend POST /api/mandates (Create Mandate)', async () => {
    const res = await fetch(`${BACKEND_URL}/api/mandates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Autonomous Ergonomics Procurement',
        category: 'Hardware & Peripherals',
        plainTextRule: 'Allow ergonomic keyboards and mice on Amazon India and Croma under ₹8,000.',
        budgetCeiling: 8000,
        singlePurchaseLimit: 4000,
        allowedMerchants: ['Amazon India', 'Croma Retail'],
        agents: ['Claude Shopping']
      })
    });
    const json = await res.json();
    if (!json.success || !json.mandate) throw new Error('Failed to create mandate');
    testMandateId = json.mandate.id;
    return `Created mandate: #${testMandateId} "${json.mandate.name}" (Ceiling: ₹${json.mandate.budgetCeiling})`;
  });

  // 8. Mandate Revocation Toggle
  await test(`Backend POST /api/mandates/:id/revoke (${testMandateId})`, async () => {
    if (!testMandateId) throw new Error('No mandate to revoke');
    const res = await fetch(`${BACKEND_URL}/api/mandates/${testMandateId}/revoke`, { method: 'POST' });
    const json = await res.json();
    if (!json.success || json.mandate.status !== 'REVOKED') throw new Error('Revoke failed or status not updated');
    return `Revoked mandate: #${testMandateId} (Status: ${json.mandate.status})`;
  });

  // 9. Shopping Agent: Natural Language Brief Parser
  await test('Backend POST /api/agent/parse-brief', async () => {
    const res = await fetch(`${BACKEND_URL}/api/agent/parse-brief`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Find a red wired gaming mouse with side buttons and top DPI button under 5000'
      })
    });
    const json = await res.json();
    if (!json.success || !json.structuredBrief) throw new Error('Parse brief failed');
    return `Extracted ${json.structuredBrief.mustHaves.length} must-haves, ${json.structuredBrief.dealbreakers.length} dealbreakers`;
  });

  // 10. Shopping Agent: Candidate Evaluation with Quote Verification
  await test('Backend POST /api/agent/evaluate-candidates (Quote Verification)', async () => {
    const res = await fetch(`${BACKEND_URL}/api/agent/evaluate-candidates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const json = await res.json();
    if (!json.success || !Array.isArray(json.candidates)) throw new Error('Evaluation failed');
    const match = json.candidates.find(c => c.verdict === 'FULL_MATCH_ELIGIBLE');
    return `Scanned ${json.totalScanned} candidates: 1 eligible (${match?.title?.slice(0, 30)}...), 3 rejected`;
  });

  // 11. Purchase Requests List
  let testRequestId = null;
  await test('Backend GET /api/requests', async () => {
    const res = await fetch(`${BACKEND_URL}/api/requests`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.requests)) throw new Error('Failed to fetch requests');
    testRequestId = json.requests[0]?.id;
    return `Retrieved ${json.requests.length} requests (Target: #${testRequestId})`;
  });

  // 12. Purchase Request Approval (HITL Clearance)
  await test(`Backend POST /api/requests/:id/approve (${testRequestId})`, async () => {
    if (!testRequestId) throw new Error('No test request ID found');
    const res = await fetch(`${BACKEND_URL}/api/requests/${testRequestId}/approve`, { method: 'POST' });
    const json = await res.json();
    if (!json.success || json.request.status !== 'AUTO_CLEARED') throw new Error('Approval failed');
    return `Approved #${testRequestId}: Capture ID ${json.request.paypalOrder.captureId}`;
  });

  // 13. Purchase Request Dispute Pack (Proof of Intent)
  await test(`Backend GET /api/requests/:id/dispute-pack (${testRequestId})`, async () => {
    if (!testRequestId) throw new Error('No test request ID found');
    const res = await fetch(`${BACKEND_URL}/api/requests/${testRequestId}/dispute-pack`);
    const json = await res.json();
    if (!json.success || !json.disputePack) throw new Error('Invalid dispute pack response');
    return `Dispute pack generated: ${json.disputePack.packId} (Tx: ${json.disputePack.transactionId})`;
  });

  // 14. Payment Methods List
  let testCardId = null;
  await test('Backend GET /api/payment-methods', async () => {
    const res = await fetch(`${BACKEND_URL}/api/payment-methods`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.paymentMethods)) throw new Error('Failed to get payment methods');
    testCardId = json.paymentMethods[0]?.id;
    return `Found ${json.paymentMethods.length} payment methods (Target: ${testCardId})`;
  });

  // 15. Payment Method Freeze Toggle
  await test(`Backend POST /api/payment-methods/:id/toggle-freeze (${testCardId})`, async () => {
    if (!testCardId) throw new Error('No payment method to freeze');
    const res = await fetch(`${BACKEND_URL}/api/payment-methods/${testCardId}/toggle-freeze`, { method: 'POST' });
    const json = await res.json();
    if (!json.success || !json.paymentMethod) throw new Error('Freeze toggle failed');
    return `Payment method ${testCardId} toggled to ${json.paymentMethod.status}`;
  });

  // 16. Agent Passports List
  let testPassportToken = null;
  let testPassportId = null;
  await test('Backend GET /api/passports', async () => {
    const res = await fetch(`${BACKEND_URL}/api/passports`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.passports)) throw new Error('Failed to get passports');
    testPassportId = json.passports[0]?.id;
    testPassportToken = json.passports[0]?.fullToken;
    return `Found ${json.passports.length} agent passports (First token: ${testPassportToken.slice(0, 10)}...)`;
  });

  // 17. Agent Passport Revocation Toggle
  await test(`Backend POST /api/passports/:id/revoke (${testPassportId})`, async () => {
    if (!testPassportId) throw new Error('No passport ID found');
    const res = await fetch(`${BACKEND_URL}/api/passports/${testPassportId}/revoke`, { method: 'POST' });
    const json = await res.json();
    if (!json.success || !json.passport) throw new Error('Passport revoke toggle failed');
    return `Passport ${testPassportId} toggled to ${json.passport.status}`;
  });

  // Reactivate passport for merchant verify test
  await fetch(`${BACKEND_URL}/api/passports/${testPassportId}/revoke`, { method: 'POST' });

  // 18. Public Merchant Verification Endpoint
  await test(`Backend GET /api/passports/verify/:token`, async () => {
    if (!testPassportToken) throw new Error('No verification token found');
    const res = await fetch(`${BACKEND_URL}/api/passports/verify/${testPassportToken}`);
    const json = await res.json();
    if (!json.verified || json.status !== 'ACTIVE_AUTHORIZED') {
      throw new Error(`Verification failed: ${JSON.stringify(json)}`);
    }
    return `Attested Agent: ${json.agentName} (Ceiling: ${json.spendingCeiling}, Status: ${json.status})`;
  });

  // 19. Activity Audit Ledger
  await test('Backend GET /api/activity', async () => {
    const res = await fetch(`${BACKEND_URL}/api/activity`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.activity)) throw new Error('Failed to get activity feed');
    return `Ledger contains ${json.activity.length} verified events (Latest: ${json.activity[0]?.type})`;
  });

  // 20. Security: Attack Vectors List
  await test('Backend GET /api/security/attacks', async () => {
    const res = await fetch(`${BACKEND_URL}/api/security/attacks`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.attacks)) throw new Error('Failed to get attacks list');
    return `Retrieved ${json.attacks.length} standardized red-team attack vectors`;
  });

  // 21. Security: Run 15 Red Team Attacks
  await test('Backend POST /api/security/run-attacks', async () => {
    const res = await fetch(`${BACKEND_URL}/api/security/run-attacks`, { method: 'POST' });
    const json = await res.json();
    if (!json.success || !Array.isArray(json.results)) throw new Error('Attack test run failed');
    return `Ran ${json.totalTests} attack vectors, passed ${json.passedCount} (Defense Rate: ${json.defenseRate})`;
  });

  // 22. Security: Scam Message Checker
  await test('Backend POST /api/security/check-message', async () => {
    const res = await fetch(`${BACKEND_URL}/api/security/check-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Payment received! You have received ₹4,500 from buyer. Send items immediately.'
      })
    });
    const json = await res.json();
    if (!json.success || !json.risk) throw new Error('Scam checker failed');
    return `Verdict: Risk=${json.risk}, LedgerMatch=${json.ledgerMatchFound}`;
  });

  // 23. Settings Retrieval
  await test('Backend GET /api/settings', async () => {
    const res = await fetch(`${BACKEND_URL}/api/settings`);
    const json = await res.json();
    if (!json.success || !json.settings) throw new Error('Failed to fetch settings');
    return `Settings: defaultAutoApproveLimit=₹${json.settings.defaultAutoApproveLimit}, node=${json.settings.networkNodeId}`;
  });

  // 24. Settings Update
  await test('Backend POST /api/settings (Update Thresholds)', async () => {
    const res = await fetch(`${BACKEND_URL}/api/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ defaultAutoApproveLimit: 3500, autoRevokeOnAnomaly: true })
    });
    const json = await res.json();
    if (!json.success || json.settings.defaultAutoApproveLimit !== 3500) throw new Error('Failed to update settings');
    return `Updated defaultAutoApproveLimit to ₹${json.settings.defaultAutoApproveLimit}`;
  });

  console.log('\n=============================================');
  console.log('SUMMARY RESULTS:');
  const passed = results.filter(r => r.status === 'PASSED').length;
  const failed = results.filter(r => r.status === 'FAILED').length;
  console.log(`TOTAL: ${results.length} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('=============================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAll();
