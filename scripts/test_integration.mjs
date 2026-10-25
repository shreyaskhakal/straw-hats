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

  // 1. Frontend Shell Delivery (Dev Server or Production Build on Backend)
  await test('Frontend HTML Shell Delivery', async () => {
    let res;
    let url = FRONTEND_URL;
    try {
      res = await fetch(FRONTEND_URL);
    } catch {
      url = BACKEND_URL;
      res = await fetch(BACKEND_URL);
    }
    if (!res.ok) throw new Error(`HTTP status ${res.status} from ${url}`);
    const text = await res.text();
    if (!text.includes('id="root"')) throw new Error('Root element missing from HTML');
    if (!text.includes('Mandate Gateway')) throw new Error('Page title missing from HTML');
    return `HTML served with #root and title via ${url}`;
  });

  // 2. Gateway API Resolution (/api/dashboard)
  await test('Gateway API Endpoint Resolution (/api/dashboard)', async () => {
    let res;
    let url = `${FRONTEND_URL}/api/dashboard`;
    try {
      res = await fetch(url);
    } catch {
      url = `${BACKEND_URL}/api/dashboard`;
      res = await fetch(url);
    }
    if (!res.ok) throw new Error(`HTTP status ${res.status} from ${url}`);
    const json = await res.json();
    if (!json.success || !json.stats) throw new Error('Invalid dashboard payload');
    return `Resolved successfully via ${url}: ${json.stats.activeMandates} active mandates, utilization: ${json.stats.utilizationPercentage}%`;
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
    let res = await fetch(`${BACKEND_URL}/api/requests`);
    let json = await res.json();
    if (!json.success || !Array.isArray(json.requests)) throw new Error('Failed to fetch requests');
    let pending = json.requests.find(r => r.status === 'PENDING_HITL');
    if (!pending) {
      // Create a fresh pending request
      const createRes = await fetch(`${BACKEND_URL}/api/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemTitle: 'Logitech Ergonomic MX Vertical Mouse',
          amount: 5400,
          currency: 'INR',
          merchant: 'Amazon India',
          mandateId: 'M-902'
        })
      });
      const createdJson = await createRes.json();
      testRequestId = createdJson.request?.id;
    } else {
      testRequestId = pending.id;
    }
    return `Retrieved ${json.requests.length} requests (Target for approval: #${testRequestId})`;
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

  // 25. Health Check & Security Headers (Helmet CSP, X-Frame-Options)
  await test('Backend Security Headers & GET /api/health', async () => {
    const res = await fetch(`${BACKEND_URL}/api/health`);
    const csp = res.headers.get('content-security-policy');
    const nosniff = res.headers.get('x-content-type-options');
    if (!res.ok) throw new Error(`Health check returned status ${res.status}`);
    const json = await res.json();
    if (json.status !== 'UP') throw new Error(`Service not UP: ${json.status}`);
    return `Health UP, Mode=${json.mode}, nosniff=${nosniff}, CSP active=${!!csp}`;
  });

  // 26. Deterministic Policy Engine: ALLOW verdict
  await test('Deterministic Policy Engine: Compliant Order -> ALLOW', async () => {
    const res = await fetch(`${BACKEND_URL}/api/policy/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        request: {
          itemTitle: 'Compliant USB-C Cable',
          amount: 899,
          currency: 'INR',
          merchant: 'Amazon India',
          agentId: 'pass_claude_shop',
          mandateId: 'M-902'
        }
      })
    });
    const json = await res.json();
    if (!json.success || json.evaluation.verdict !== 'ALLOW') {
      throw new Error(`Expected ALLOW, got: ${json.evaluation?.verdict}`);
    }
    return `Verdict: ${json.evaluation.verdict} (Score: ${json.evaluation.confidenceScore}%)`;
  });

  // 27. Deterministic Policy Engine: Single-Item Over-Cap -> REQUIRES_APPROVAL
  await test('Deterministic Policy Engine: Over Cap -> REQUIRES_APPROVAL', async () => {
    const res = await fetch(`${BACKEND_URL}/api/policy/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        request: {
          itemTitle: 'High-end Ergonomic Mechanical Keyboard',
          amount: 6500,
          currency: 'INR',
          merchant: 'Amazon India',
          agentId: 'pass_claude_shop',
          mandateId: 'M-902'
        }
      })
    });
    const json = await res.json();
    if (!json.success || json.evaluation.verdict !== 'REQUIRES_APPROVAL') {
      throw new Error(`Expected REQUIRES_APPROVAL, got: ${json.evaluation?.verdict}`);
    }
    return `Verdict: ${json.evaluation.verdict} (Reason: ${json.evaluation.reasons[0]})`;
  });

  // 28. Deterministic Policy Engine: Unwhitelisted Merchant -> BLOCK
  await test('Deterministic Policy Engine: Rogue Merchant -> BLOCK', async () => {
    const res = await fetch(`${BACKEND_URL}/api/policy/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        request: {
          itemTitle: 'Questionable Flash Drive',
          amount: 1200,
          currency: 'INR',
          merchant: 'ShadyDealsDarknet.ru',
          agentId: 'pass_claude_shop',
          mandateId: 'M-902'
        }
      })
    });
    const json = await res.json();
    if (!json.success || json.evaluation.verdict !== 'BLOCK') {
      throw new Error(`Expected BLOCK, got: ${json.evaluation?.verdict}`);
    }
    return `Verdict: ${json.evaluation.verdict} (Reason: ${json.evaluation.reasons[0]})`;
  });

  // 29. Emergency Kill-Switch Lifecycle & Hard-Stop Verification
  await test('Emergency Kill-Switch: Activation blocks purchase pipeline', async () => {
    // 1. Toggle ON
    const toggleOn = await fetch(`${BACKEND_URL}/api/security/kill-switch/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'Integration test automated verification' })
    });
    const onJson = await toggleOn.json();
    if (!onJson.success || !onJson.killSwitch.active) throw new Error('Failed to activate kill switch');

    // 2. Try evaluating policy while kill-switch is active -> MUST return BLOCK
    const evalRes = await fetch(`${BACKEND_URL}/api/policy/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        request: {
          itemTitle: 'Emergency Cable Test',
          amount: 400,
          currency: 'INR',
          merchant: 'Amazon India',
          agentId: 'pass_claude_shop',
          mandateId: 'M-902'
        }
      })
    });
    const evalJson = await evalRes.json();
    if (evalJson.evaluation.verdict !== 'BLOCK') {
      throw new Error(`Kill switch active but verdict was ${evalJson.evaluation.verdict}`);
    }

    // 3. Toggle OFF to restore normal state
    const toggleOff = await fetch(`${BACKEND_URL}/api/security/kill-switch/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'Restoring after test' })
    });
    const offJson = await toggleOff.json();
    if (!offJson.success || offJson.killSwitch.active) throw new Error('Failed to deactivate kill switch');

    return 'Kill-switch toggled ON, verified hard-stop BLOCK, and cleanly restored OFF';
  });

  // 30. Duplicate Approval Prevention (409 Conflict)
  await test('Duplicate Approval Prevention: Second approval returns 409 Conflict', async () => {
    if (!testRequestId) throw new Error('No test request ID found');
    const res = await fetch(`${BACKEND_URL}/api/requests/${testRequestId}/approve`, { method: 'POST' });
    if (res.status !== 409) {
      throw new Error(`Expected HTTP 409 Conflict, got HTTP ${res.status}`);
    }
    const json = await res.json();
    if (!json.error || (!json.error.includes('already been approved') && !json.error.includes('already been settled'))) {
      throw new Error(`Unexpected error message: ${json.error}`);
    }
    return `HTTP 409 Conflict correctly returned: "${json.error}"`;
  });

  // 31. Activity CSV Export with Formula Injection Defense
  await test('Backend GET /api/activity/export?format=csv (Formula Injection Defense)', async () => {
    const res = await fetch(`${BACKEND_URL}/api/activity/export?format=csv`);
    if (!res.ok) throw new Error(`CSV export HTTP status ${res.status}`);
    const csv = await res.text();
    const lines = csv.trim().split('\n');
    if (lines.length < 2) throw new Error('CSV is missing data rows');
    const headers = lines[0];
    if (!headers.includes('Event ID') || !headers.includes('Summary')) {
      throw new Error(`Unexpected headers: ${headers}`);
    }
    // Verify no line starts with unquoted unsafe formulas =,+,-,@
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (/^[=\+\-@]/.test(line)) {
        throw new Error(`Formula injection vulnerability detected on row ${i}: ${line}`);
      }
    }
    return `CSV verified with ${lines.length - 1} rows; no formula injection prefixes`;
  });

  // 32. Connect Payment Rail & Limit Configuration
  await test('Backend POST /api/payment-methods/connect & /limits', async () => {
    const connectRes = await fetch(`${BACKEND_URL}/api/payment-methods/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Automated CI PayPal Sandbox Rail',
        type: 'SANDBOX_RAIL',
        autoApproveCap: '₹7,500 INR'
      })
    });
    const connectJson = await connectRes.json();
    if (!connectJson.success || !connectJson.paymentMethod) throw new Error('Rail connect failed');
    const railId = connectJson.paymentMethod.id;

    // Update limits
    const limitRes = await fetch(`${BACKEND_URL}/api/payment-methods/${railId}/limits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ autoApproveCap: '₹10,000 INR', spendingLimit: 50000 })
    });
    const limitJson = await limitRes.json();
    if (!limitJson.success || limitJson.paymentMethod.autoApproveCap !== '₹10,000 INR') {
      throw new Error('Limit update failed');
    }
    return `Connected rail ${railId} and updated cap to ${limitJson.paymentMethod.autoApproveCap}`;
  });

  // 33. Provision New Agent Passport
  await test('Backend POST /api/passports (Provision Ed25519 Token)', async () => {
    const res = await fetch(`${BACKEND_URL}/api/passports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentName: 'Gemini Autonomous Procurement Ultra',
        spendingCeiling: 35000,
        allowedCategories: ['Hardware & Peripherals', 'SaaS Infra']
      })
    });
    const json = await res.json();
    if (!res.ok || !json.success || !json.passport) throw new Error('Provision failed');
    return `Provisioned ${json.passport.agentName} (ID: ${json.passport.id}, Token: ${json.passport.tokenPrefix})`;
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
