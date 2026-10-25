/**
 * Mandate Gateway — Mock Service Dispatcher
 * Provides zero-dependency, fail-safe mock API responses for frontend-only preview/demo deployment on Vercel.
 */

import { demoStore } from './mockData.js';

export async function dispatchMockRequest(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body) : {};
  const url = endpoint.split('?')[0];

  // Delay simulation: 50-100ms for realistic UI feel without lag
  await new Promise((r) => setTimeout(r, 60));

  const state = demoStore.state;

  // 1. Health
  if (url === '/health') {
    return {
      status: 'UP',
      service: 'Mandate Gateway Demo API',
      version: '2.4.0-vercel-preview',
      mode: 'FRONTEND_DEMO_SANDBOX',
      killSwitchActive: state.killSwitch.active,
      timestamp: new Date().toISOString(),
    };
  }

  // 2. Session & Auth
  if (url === '/session') {
    return { success: true, user: state.user, isDemoData: true };
  }

  if (url === '/login') {
    state.user.isAuthenticated = true;
    demoStore.saveState();
    return { success: true, user: state.user, isDemoData: true };
  }

  if (url === '/logout') {
    state.user.isAuthenticated = false;
    demoStore.saveState();
    return { success: true, isDemoData: true };
  }

  // 3. Dashboard
  if (url === '/dashboard') {
    const activeMandates = state.mandates.filter((m) => m.status === 'ACTIVE');
    const totalCeiling = activeMandates.reduce((acc, m) => acc + (m.budgetCeiling || 0), 0);
    const totalUtilized = activeMandates.reduce((acc, m) => acc + (m.utilized || 0), 0);
    const pendingList = state.requests.filter((r) => r.status === 'PENDING_HITL');

    return {
      success: true,
      isDemoData: true,
      stats: {
        activeMandates: activeMandates.length,
        totalMandates: state.mandates.length,
        totalCeiling,
        totalUtilized,
        utilizationPercentage: totalCeiling ? Math.round((totalUtilized / totalCeiling) * 100) : 0,
        authorizedAgentsCount: state.passports.filter((p) => p.status === 'ACTIVE').length,
        pendingApprovalsCount: pendingList.length,
        haltedAmount: pendingList.reduce((acc, r) => acc + (r.amount || 0), 0),
        policyInvariance: '100% (Simulated Enclave)',
        blockedCallsCount: state.requests.filter((r) => r.status === 'BLOCKED').length,
      },
      pendingApprovals: pendingList,
      activeMandates,
      recentAudit: state.activity.slice(0, 5),
      agentPassports: state.passports,
    };
  }

  // 4. Mandates
  if (url === '/mandates' && method === 'GET') {
    return { success: true, mandates: state.mandates, isDemoData: true };
  }

  if (url === '/mandates' && method === 'POST') {
    const newMandate = {
      id: `M-${Math.floor(100 + Math.random() * 900)}`,
      name: body.name || 'Synthesized Mandate Node',
      category: body.category || 'Hardware & Peripherals',
      agents: body.agents || ['Claude Shopping'],
      allowedMerchants: body.allowedMerchants || ['Amazon India', 'Croma Retail'],
      budgetCeiling: Number(body.budgetCeiling) || 25000,
      utilized: 0,
      currency: 'INR',
      singlePurchaseLimit: Number(body.singlePurchaseLimit) || 5000,
      requiresCoSignerOver: Number(body.autoApproveLimit) || 3000,
      status: 'ACTIVE',
      expiry: '2026-12-31',
      plainTextRule: body.plainTextRule || 'Autonomous clearance rules deployed via demo terminal',
      createdAt: new Date().toISOString(),
      isDemoData: true,
    };
    state.mandates.unshift(newMandate);
    demoStore.saveState();
    return { success: true, mandate: newMandate, isDemoData: true };
  }

  const revokeMandateMatch = url.match(/^\/mandates\/(.+)\/revoke$/);
  if (revokeMandateMatch && method === 'POST') {
    const id = revokeMandateMatch[1];
    const m = state.mandates.find((x) => x.id === id);
    if (m) {
      m.status = m.status === 'REVOKED' ? 'ACTIVE' : 'REVOKED';
      demoStore.saveState();
      return { success: true, mandate: m, isDemoData: true };
    }
  }

  // 5. Shopping Agent
  if (url === '/agent/parse-brief') {
    return {
      success: true,
      structuredBrief: {
        rawPrompt: body.prompt || '',
        category: 'Peripherals & Hardware',
        mustHaves: [
          'Wired connection (Zero wireless delay)',
          'Ergonomic right-handed palm rest contour',
          'At least 2 programmable thumb/side buttons',
          'Brand new condition (No refurbished stock)',
          'Top DPI profile switch button',
          'Under ₹5,000 INR price cap'
        ],
        dealbreakers: [
          'Wireless or Bluetooth only connection',
          'Refurbished or open-box seller condition',
          'Price above ₹5,000 threshold'
        ],
        confidenceScore: 98,
        astCompiledAt: new Date().toISOString(),
      },
      isDemoData: true,
    };
  }

  if (url === '/agent/evaluate-candidates') {
    return {
      success: true,
      totalScanned: 4,
      eligibleCount: 1,
      rejectedCount: 3,
      candidates: [
        {
          id: 'prod_match_01',
          title: 'Razer Basilisk V3 Ergonomic Wired Gaming Mouse (Chroma RGB, 26K DPI)',
          merchant: 'Amazon India',
          price: 3499,
          rating: 4.6,
          reviewsCount: 12450,
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFH1f_GfB-oZ8vLko9Q_b1aK98eX-2m_w1g9k_k98h83',
          complianceScore: 99,
          verdict: 'FULL_MATCH_ELIGIBLE',
          rejectionReason: null,
          specs: [
            { label: 'Wired Connection', pass: true },
            { label: 'Ergonomic Palm Rest', pass: true },
            { label: 'Side Buttons', pass: true },
            { label: 'Brand New Condition', pass: true },
            { label: 'Top DPI Switch', pass: true },
            { label: 'Price <= ₹5,000', pass: true }
          ],
          quoteChecks: [
            { spec: 'Wired Connection', status: 'MATCH', quote: '"Speedflex Cable designed for greater flexibility and minimal drag."' },
            { spec: 'Ergonomic Palm Rest', status: 'MATCH', quote: '"Signature ergonomic design with thumb rest supports long sessions."' },
            { spec: 'Side Buttons', status: 'MATCH', quote: '"10+1 programmable buttons including dedicated thumb trigger."' },
            { spec: 'Top DPI Switch', status: 'MATCH', quote: '"Tactile scroll wheel and top cycle switches for on-the-fly DPI sensitivity."' }
          ]
        },
        {
          id: 'prod_fail_wireless',
          title: 'Logitech G304 Lightspeed Wireless Mouse',
          merchant: 'Amazon India',
          price: 2995,
          rating: 4.5,
          reviewsCount: 3820,
          complianceScore: 40,
          verdict: 'DEALBREAKER_REJECTED',
          rejectionReason: 'Dealbreaker Triggered: Wireless-only device. User brief specifically mandated Wired.',
          specs: [
            { label: 'Wired Connection', pass: false },
            { label: 'Side Buttons', pass: true }
          ]
        },
        {
          id: 'prod_fail_refurb',
          title: 'SteelSeries Rival 5 [Refurbished Grade A]',
          merchant: 'Croma Retail',
          price: 2499,
          rating: 4.2,
          reviewsCount: 310,
          complianceScore: 50,
          verdict: 'DEALBREAKER_REJECTED',
          rejectionReason: 'Dealbreaker Triggered: Item is certified refurbished. Must-have requires brand new stock.',
          specs: [{ label: 'Item Condition', pass: false }]
        },
        {
          id: 'prod_fail_unknown',
          title: 'DragonWar Leviathan Gaming Pointer',
          merchant: 'Croma Retail',
          price: 1899,
          rating: 3.8,
          reviewsCount: 94,
          complianceScore: 65,
          verdict: 'UNKNOWN_SPEC_REQUIRES_REVIEW',
          rejectionReason: 'Spec Unknown: Listing text fails to document DPI button position.',
          specs: [{ label: 'Top DPI Button', pass: false }]
        }
      ],
      isDemoData: true,
    };
  }

  // 6. Policy Engine Evaluation
  if (url === '/policy/evaluate') {
    const req = body.request || {};
    const mandate = state.mandates.find((m) => m.id === req.mandateId) || state.mandates[0];

    if (state.killSwitch.active) {
      return {
        success: true,
        evaluation: {
          verdict: 'BLOCK',
          decisionType: 'KILL_SWITCH_ACTIVE',
          reasons: ['Global Emergency Kill-Switch is ENGAGED. All autonomous checkout is blocked.'],
          violations: ['KILL_SWITCH_ACTIVE'],
          passedChecks: [],
          isDemoData: true,
        }
      };
    }

    if (req.merchant && !mandate.allowedMerchants.some((m) => m.toLowerCase().includes(req.merchant.toLowerCase()) || req.merchant.toLowerCase().includes(m.toLowerCase()))) {
      return {
        success: true,
        evaluation: {
          verdict: 'BLOCK',
          decisionType: 'UNAPPROVED_MERCHANT',
          reasons: [`Merchant "${req.merchant}" is not included in the mandate allowed merchants list.`],
          violations: ['UNAPPROVED_MERCHANT'],
          passedChecks: ['Currency verified (INR)'],
          isDemoData: true,
        }
      };
    }

    if (req.amount > mandate.singlePurchaseLimit) {
      return {
        success: true,
        evaluation: {
          verdict: 'REQUIRES_APPROVAL',
          decisionType: 'SINGLE_ITEM_CAP_EXCEEDED',
          reasons: [`Single-Item Limit Trigger: Amount ₹${req.amount.toLocaleString()} exceeds unattended limit ₹${mandate.singlePurchaseLimit.toLocaleString()}.`],
          violations: ['REQUIRES_APPROVAL'],
          passedChecks: ['Merchant whitelisted', 'Currency verified (INR)'],
          isDemoData: true,
        }
      };
    }

    return {
      success: true,
      evaluation: {
        verdict: 'ALLOW',
        decisionType: 'AUTO_CLEARANCE',
        reasons: ['Compliant with all mandate invariants. Eligible for autonomous token clearance.'],
        violations: [],
        passedChecks: ['Merchant whitelisted', 'Within single-item auto cap', 'Budget balance verified'],
        isDemoData: true,
      }
    };
  }

  // 7. Purchase Requests
  if (url === '/requests' && method === 'GET') {
    return { success: true, requests: state.requests, isDemoData: true };
  }

  if (url === '/requests' && method === 'POST') {
    const newId = `PR-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReq = {
      id: newId,
      itemTitle: body.itemTitle || 'Candidate Hardware Item',
      merchant: body.merchant || 'Amazon India',
      agentName: body.agentName || 'Claude Shopping',
      agentId: body.agentId || 'pass_claude_shop',
      amount: Number(body.amount) || 3499,
      currency: body.currency || 'INR',
      mandateId: body.mandateId || 'M-902',
      mandateName: 'Office Hardware Q4',
      status: Number(body.amount) > 5000 ? 'PENDING_HITL' : 'AUTO_CLEARED',
      triggerReason: Number(body.amount) > 5000 ? 'Single-item ceiling exceeded. Awaiting human approval.' : 'Autonomous Clearance under ₹5,000 ceiling.',
      decisionType: Number(body.amount) > 5000 ? 'HITL_ESCALATION' : 'AUTO_CLEARANCE',
      createdAt: new Date().toISOString(),
      listingUrl: body.listingUrl || 'https://amazon.in',
      isDemoData: true,
      paypalOrder: {
        orderId: `MOCK-PP-ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        status: Number(body.amount) > 5000 ? 'AWAITING_PAYER_APPROVAL' : 'COMPLETED',
        singleUseToken: `tok_sandbox_${Math.random().toString(16).substring(2, 10)}`,
        captureId: `CAP-${Math.floor(10000000 + Math.random() * 90000000)}`
      }
    };
    state.requests.unshift(newReq);
    demoStore.saveState();
    return { success: true, request: newReq, isDemoData: true };
  }

  const approveMatch = url.match(/^\/requests\/(.+)\/approve$/);
  if (approveMatch && method === 'POST') {
    const id = approveMatch[1];
    const item = state.requests.find((r) => r.id === id);
    if (!item) {
      throw new Error(`Request #${id} not located`);
    }
    if (item.status === 'AUTO_CLEARED') {
      const err = new Error(`Request #${id} has already been approved and settled (Capture ID: ${item.paypalOrder?.captureId || 'CAP-SETTLED'}). Duplicate approval blocked.`);
      err.status = 409;
      throw err;
    }
    item.status = 'AUTO_CLEARED';
    item.settledAt = new Date().toISOString();
    if (item.paypalOrder) {
      item.paypalOrder.status = 'COMPLETED';
      item.paypalOrder.captureId = item.paypalOrder.captureId || `CAP-${Math.floor(10000000 + Math.random() * 90000000)}`;
    }
    demoStore.saveState();
    return { success: true, request: item, isDemoData: true };
  }

  const rejectMatch = url.match(/^\/requests\/(.+)\/reject$/);
  if (rejectMatch && method === 'POST') {
    const id = rejectMatch[1];
    const item = state.requests.find((r) => r.id === id);
    if (item) {
      item.status = 'REJECTED';
      if (item.paypalOrder) item.paypalOrder.status = 'CANCELLED';
      demoStore.saveState();
      return { success: true, request: item, isDemoData: true };
    }
  }

  const disputePackMatch = url.match(/^\/requests\/(.+)\/dispute-pack$/);
  if (disputePackMatch) {
    const id = disputePackMatch[1];
    const item = state.requests.find((r) => r.id === id) || state.requests[0];
    return {
      success: true,
      isDemoData: true,
      disputePack: {
        packId: `DSP-PACK-${item.id}`,
        generatedAt: new Date().toISOString(),
        transactionId: item.paypalOrder?.orderId || 'PP-ORD-DEMO',
        captureId: item.paypalOrder?.captureId || 'CAP-DEMO-99182',
        itemTitle: item.itemTitle,
        merchant: item.merchant,
        amount: `₹${(item.amount || 4200).toLocaleString()} INR`,
        agentPassportProof: {
          agent: item.agentName,
          passportId: item.agentId,
          authorizedHuman: 'Elena Vance (WebAuthn Signed)',
          signature: 'ed25519_sig_88f910ab38c41092e01b34_DEMO',
        },
        evidenceRecords: item.quoteEvidence || [
          { field: 'Listing URL', quote: item.listingUrl },
          { field: 'Mandate Envelope', quote: item.mandateName }
        ],
        paypalDisputeReadyJson: {
          dispute_reason: 'MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED',
          evidence_type: 'PROOF_OF_INTENT_LEDGER',
          notes: `[DEMO] Autonomous agent purchased ${item.itemTitle} under strict cryptographic mandate. Non-conforming goods delivered.`
        }
      }
    };
  }

  // 8. Payment Methods
  if (url === '/payment-methods' && method === 'GET') {
    return { success: true, paymentMethods: state.paymentMethods, isDemoData: true };
  }

  const toggleFreezeMatch = url.match(/^\/payment-methods\/(.+)\/toggle-freeze$/);
  if (toggleFreezeMatch && method === 'POST') {
    const id = toggleFreezeMatch[1];
    const pm = state.paymentMethods.find((p) => p.id === id);
    if (pm) {
      pm.frozen = !pm.frozen;
      pm.status = pm.frozen ? 'FROZEN' : 'ACTIVE';
      demoStore.saveState();
      return { success: true, paymentMethod: pm, isDemoData: true };
    }
  }

  if (url === '/payment-methods/connect' && method === 'POST') {
    const newPm = {
      id: `pm_rail_${Date.now()}`,
      type: body.type || 'SANDBOX_RAIL',
      name: body.name || 'Connected Sandbox Rail',
      identifier: body.identifier || 'sb-user-sandbox@business.example.com',
      clientId: `BAAv${Math.random().toString(16).substring(2, 8)}`,
      status: 'ACTIVE',
      balance: '$5,000.00 USD (Sandbox Simulated)',
      autoApproveCap: body.autoApproveCap || '₹5,000 INR',
      mode: 'SANDBOX',
      webhookStatus: 'ACTIVE (Demo Verified)',
      frozen: false,
      isDemoData: true,
    };
    state.paymentMethods.push(newPm);
    demoStore.saveState();
    return { success: true, paymentMethod: newPm, isDemoData: true };
  }

  const limitsMatch = url.match(/^\/payment-methods\/(.+)\/limits$/);
  if (limitsMatch && method === 'POST') {
    const id = limitsMatch[1];
    const pm = state.paymentMethods.find((p) => p.id === id);
    if (pm) {
      if (body.autoApproveCap) pm.autoApproveCap = body.autoApproveCap;
      if (body.spendingLimit) pm.spendingLimit = Number(body.spendingLimit);
      demoStore.saveState();
      return { success: true, paymentMethod: pm, isDemoData: true };
    }
  }

  // 9. Agent Passports
  if (url === '/passports' && method === 'GET') {
    return { success: true, passports: state.passports, isDemoData: true };
  }

  if (url === '/passports' && method === 'POST') {
    const hex = Math.random().toString(16).substring(2, 10).toUpperCase();
    const newPass = {
      id: `pass_${(body.agentName || 'agent').toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString().slice(-4)}`,
      agentName: body.agentName || 'Authorized Shopping Agent',
      agentIdentifier: `agent.sovereign.${(body.agentName || 'agent').toLowerCase().replace(/\s+/g, '-')}-v1`,
      tokenPrefix: `0x${hex.slice(0, 4)}...${hex.slice(-4)}`,
      fullToken: `0x${hex}${Math.random().toString(16).substring(2, 18).toUpperCase()}`,
      publicKey: `ed25519:MC4CAQAwBQYDK2VwBCIEI${Math.random().toString(36).substring(2, 15)}...`,
      authorizedBy: 'Elena Vance (WebAuthn Signed)',
      spendingCeiling: Number(body.spendingCeiling) || 25000,
      expiresInDays: 30,
      status: 'ACTIVE',
      allowedCategories: body.allowedCategories || ['Hardware & Peripherals'],
      ordersCompleted: 0,
      disputes: 0,
      enclaveAttestation: 'Intel SGX Enclave #TDX-DEMO (Hardware Signed)',
      isDemoData: true,
    };
    state.passports.unshift(newPass);
    demoStore.saveState();
    return { success: true, passport: newPass, isDemoData: true };
  }

  const revokePassportMatch = url.match(/^\/passports\/(.+)\/revoke$/);
  if (revokePassportMatch && method === 'POST') {
    const id = revokePassportMatch[1].toLowerCase().replace(/[^a-z0-9]/g, '');
    const p = state.passports.find((x) => x.id.toLowerCase().replace(/[^a-z0-9]/g, '').includes(id) || id.includes(x.id.toLowerCase().replace(/[^a-z0-9]/g, '')));
    if (p) {
      p.status = p.status === 'REVOKED' ? 'ACTIVE' : 'REVOKED';
      demoStore.saveState();
      return { success: true, passport: p, isDemoData: true };
    }
  }

  const verifyTokenMatch = url.match(/^\/passports\/verify\/(.+)$/);
  if (verifyTokenMatch) {
    const token = verifyTokenMatch[1];
    const match = state.passports.find((p) => p.fullToken === token || p.tokenPrefix.includes(token) || p.id === token || (token.length >= 6 && p.fullToken.includes(token)));

    if (!match || match.status !== 'ACTIVE') {
      const err = new Error('Agent Token is invalid, expired, or revoked by the authorizing human.');
      err.status = 403;
      err.data = { verified: false, status: match ? match.status : 'UNKNOWN_TOKEN', isDemoData: true };
      throw err;
    }

    return {
      verified: true,
      status: 'ACTIVE_AUTHORIZED',
      agentName: match.agentName,
      authorizedBy: match.authorizedBy,
      enclaveAttestation: match.enclaveAttestation,
      permittedCategories: match.allowedCategories,
      spendingCeiling: match.spendingCeiling,
      ordersCompleted: match.ordersCompleted,
      disputes: match.disputes,
      merchantAdvice: 'Trusted Autonomous Agent: You may allow this checkout session without anti-bot blocks.',
      isDemoData: true,
    };
  }

  // 10. Activity Log
  if (url === '/activity') {
    return { success: true, activity: state.activity, isDemoData: true };
  }

  // 11. Security Center
  if (url === '/security/attacks' && method === 'GET') {
    return { success: true, attacks: state.attacks, isDemoData: true };
  }

  if (url === '/security/run-attacks' && method === 'POST') {
    const results = state.attacks.map((atk) => ({
      ...atk,
      executedAt: new Date().toISOString(),
      actualVerdict: atk.expectedVerdict,
      pass: true,
      latencyMs: Math.floor(18 + Math.random() * 24),
    }));
    return {
      success: true,
      totalTests: state.attacks.length,
      passedCount: state.attacks.length,
      failedCount: 0,
      defenseRate: '100%',
      results,
      isDemoData: true,
    };
  }

  if (url === '/security/check-message' && method === 'POST') {
    const msg = (body.message || '').toLowerCase();
    const isUrgent = msg.includes('immediately') || msg.includes('urgent') || msg.includes('payment received');
    return {
      success: true,
      risk: isUrgent ? 'CRITICAL' : 'SAFE',
      analysis: isUrgent ? 'Suspicious social engineering cues detected imitating confirmed settlement.' : 'Normal inquiry text.',
      ledgerMatchFound: false,
      advice: 'Never release merchandise without direct cryptographic ledger verification on Mandate Gateway.',
      isDemoData: true,
    };
  }

  if (url === '/security/kill-switch' && method === 'GET') {
    return {
      success: true,
      killSwitch: state.killSwitch,
      isDemoData: true,
    };
  }

  if (url === '/security/kill-switch/toggle' && method === 'POST') {
    state.killSwitch.active = !state.killSwitch.active;
    state.killSwitch.activatedAt = state.killSwitch.active ? new Date().toISOString() : null;
    state.killSwitch.activatedBy = state.killSwitch.active ? 'Elena Vance (Terminal User)' : null;
    state.killSwitch.reason = body.reason || 'User manual emergency trigger';
    demoStore.saveState();
    return {
      success: true,
      killSwitch: state.killSwitch,
      isDemoData: true,
    };
  }

  // 12. Settings
  if (url === '/settings' && method === 'GET') {
    return { success: true, settings: state.settings, isDemoData: true };
  }

  if (url === '/settings' && method === 'POST') {
    Object.assign(state.settings, body);
    demoStore.saveState();
    return { success: true, settings: state.settings, isDemoData: true };
  }

  return { success: true, message: `Mock route ${url} handled`, isDemoData: true };
}
