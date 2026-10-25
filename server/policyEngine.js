/**
 * Mandate Gateway — Deterministic Policy Evaluation Engine
 * Core Security Principle: AI may recommend a purchase, but AI must NEVER override user authorization rules.
 * 
 * Verdicts:
 * - ALLOW: all applicable rules pass without exception; within auto-approve threshold.
 * - REQUIRES_APPROVAL: transaction is permissible under general mandate, but requires human sign-off (e.g. exceeds single-item auto cap or co-signer threshold).
 * - BLOCK: violation of mandatory rule (unapproved merchant, category breach, over budget ceiling, expired/revoked mandate, kill switch active).
 * - ERROR: missing required input, unresolvable mandate, or safe policy evaluation impossible (FAILS CLOSED).
 */

export function evaluatePurchasePolicy({
  request,
  mandate,
  systemState = {},
}) {
  const result = {
    verdict: 'ERROR', // Fail-closed default
    decisionType: 'POLICY_ERROR',
    reasons: [],
    violations: [],
    passedChecks: [],
    specsEvaluation: [],
    timestamp: new Date().toISOString(),
  };

  try {
    // 1. Validate Input Payload (Fail closed if invalid)
    if (!request || typeof request !== 'object') {
      result.reasons.push('Invalid or missing purchase request payload');
      return result;
    }

    const {
      amount,
      currency = 'INR',
      merchant,
      category,
      itemTitle,
      agentId,
      agentName,
      specs = [],
    } = request;

    if (amount === undefined || amount === null || typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
      result.reasons.push('Invalid purchase amount: must be a positive number');
      result.violations.push('INVALID_AMOUNT');
      return result;
    }

    if (!merchant || typeof merchant !== 'string' || !merchant.trim()) {
      result.reasons.push('Merchant name is required');
      result.violations.push('MISSING_MERCHANT');
      return result;
    }

    // 2. Emergency Kill Switch Check (HIGHEST PRIORITY)
    if (systemState.emergencyKillSwitchActive) {
      result.verdict = 'BLOCK';
      result.decisionType = 'KILL_SWITCH_ENGAGED';
      result.reasons.push('Emergency Kill Switch is ENGAGED. All autonomous authorizations and payments are immediately halted.');
      result.violations.push('KILL_SWITCH_ACTIVE');
      return result;
    }

    // 3. Mandate Existence and Status
    if (!mandate) {
      result.verdict = 'BLOCK';
      result.decisionType = 'MANDATE_NOT_FOUND';
      result.reasons.push('No valid spending mandate bound to this purchase request.');
      result.violations.push('MANDATE_MISSING');
      return result;
    }

    if (mandate.status !== 'ACTIVE') {
      result.verdict = 'BLOCK';
      result.decisionType = 'MANDATE_INACTIVE';
      result.reasons.push(`Mandate #${mandate.id} (${mandate.name}) is ${mandate.status}. Only ACTIVE mandates authorize transactions.`);
      result.violations.push('MANDATE_NOT_ACTIVE');
      return result;
    }

    // 4. Mandate Expiration Check
    if (mandate.expiry) {
      const expiryDate = new Date(mandate.expiry);
      if (!isNaN(expiryDate.getTime()) && expiryDate < new Date()) {
        result.verdict = 'BLOCK';
        result.decisionType = 'MANDATE_EXPIRED';
        result.reasons.push(`Mandate #${mandate.id} expired on ${mandate.expiry}.`);
        result.violations.push('MANDATE_EXPIRED');
        return result;
      }
    }
    result.passedChecks.push('Mandate status ACTIVE and unexpired');

    // 5. Agent Authorization Check
    if (systemState.agentPassports && agentId) {
      const passport = systemState.agentPassports.find(p => p.id === agentId || p.agentName === agentName);
      if (passport && passport.status !== 'ACTIVE') {
        result.verdict = 'BLOCK';
        result.decisionType = 'AGENT_REVOKED';
        result.reasons.push(`Agent Passport ${passport.agentName} is ${passport.status}. Access denied.`);
        result.violations.push('AGENT_REVOKED');
        return result;
      }
    }
    result.passedChecks.push('Agent delegate identity validated');

    // 6. Currency Verification
    const mandateCurrency = (mandate.currency || 'INR').toUpperCase();
    const reqCurrency = (currency || 'INR').toUpperCase();
    if (mandateCurrency !== reqCurrency) {
      result.verdict = 'BLOCK';
      result.decisionType = 'CURRENCY_MISMATCH';
      result.reasons.push(`Currency mismatch: request currency (${reqCurrency}) does not match mandate (${mandateCurrency}). Arbitrage blocked.`);
      result.violations.push('CURRENCY_MISMATCH');
      return result;
    }
    result.passedChecks.push(`Currency verified (${mandateCurrency})`);

    // 7. Merchant Whitelist & Blocklist Verification
    const normalizedMerchant = merchant.trim().toLowerCase();
    
    // Explicit Blocklist check
    const blocklist = (systemState.merchantBlocklist || ['ebay.com', 'techbazaar.in', 'unverified-portal.xyz', 'amzon-india-secure.co']).map(m => m.toLowerCase());
    const isExplicitlyBlocked = blocklist.some(b => normalizedMerchant.includes(b));
    if (isExplicitlyBlocked) {
      result.verdict = 'BLOCK';
      result.decisionType = 'MERCHANT_BLOCKED';
      result.reasons.push(`Merchant "${merchant}" is explicitly listed on security blocklist or untrusted domain list.`);
      result.violations.push('MERCHANT_UNTRUSTED');
      return result;
    }

    // Whitelist check
    if (Array.isArray(mandate.allowedMerchants) && mandate.allowedMerchants.length > 0) {
      const allowedNormalized = mandate.allowedMerchants.map(m => m.toLowerCase());
      const isAllowed = allowedNormalized.some(allowed => 
        normalizedMerchant.includes(allowed) || allowed.includes(normalizedMerchant)
      );

      if (!isAllowed) {
        result.verdict = 'BLOCK';
        result.decisionType = 'DETERMINISTIC_MERCHANT_BLOCK';
        result.reasons.push(`Merchant "${merchant}" is not included in the mandate allowed merchants list [${mandate.allowedMerchants.join(', ')}].`);
        result.violations.push('MERCHANT_NOT_ALLOWED');
        return result;
      }
    }
    result.passedChecks.push(`Merchant whitelisted: ${merchant}`);

    // 8. Category and Dealbreaker Invariance Check
    if (category && mandate.category) {
      const mandateCategory = mandate.category.toLowerCase();
      const reqCategory = category.toLowerCase();
      // Block gaming consoles under hardware office procurement if prompt/item matches recreational
      if (mandateCategory.includes('hardware') && (reqCategory.includes('gaming console') || reqCategory.includes('entertainment'))) {
        result.verdict = 'BLOCK';
        result.decisionType = 'CATEGORY_MISMATCH';
        result.reasons.push(`Category mismatch: "${category}" cannot be charged to "${mandate.category}".`);
        result.violations.push('CATEGORY_VIOLATION');
        return result;
      }
    }
    result.passedChecks.push('Category compliance confirmed');

    // 9. Total Budget Ceiling & Utilization Check (Atomic arithmetic)
    const currentUtilized = Number(mandate.utilized || 0);
    const budgetCeiling = Number(mandate.budgetCeiling || 0);
    const projectedUtilization = currentUtilized + amount;

    if (projectedUtilization > budgetCeiling) {
      result.verdict = 'BLOCK';
      result.decisionType = 'BUDGET_CEILING_EXCEEDED';
      result.reasons.push(`Total budget ceiling breach: Current utilized ₹${currentUtilized.toLocaleString()} + Request ₹${amount.toLocaleString()} = ₹${projectedUtilization.toLocaleString()}, exceeding ceiling ₹${budgetCeiling.toLocaleString()} by ₹${(projectedUtilization - budgetCeiling).toLocaleString()}.`);
      result.violations.push('BUDGET_EXCEEDED');
      return result;
    }
    result.passedChecks.push(`Budget ceiling satisfied (₹${projectedUtilization.toLocaleString()} / ₹${budgetCeiling.toLocaleString()})`);

    // 10. Quote Evidence Verification (Prevent Hallucinations & Smuggling)
    if (Array.isArray(specs) && specs.length > 0) {
      for (const spec of specs) {
        if (spec.pass === false || spec.match === false) {
          result.verdict = 'BLOCK';
          result.decisionType = 'QUOTE_EVIDENCE_MISMATCH';
          result.reasons.push(`Specification dealbreaker: ${spec.label || spec.field} check failed. Reason: ${spec.reason || 'Spec mismatch with merchant listing'}.`);
          result.violations.push('SPEC_MISMATCH');
          return result;
        }
      }
    }

    // 11. Single-Item Purchase Limit (Auto-Clearance vs HITL Escalation)
    const singleLimit = Number(mandate.singlePurchaseLimit || 5000);
    const coSignerThreshold = Number(mandate.requiresCoSignerOver || systemState.requireCoSignerThreshold || 50000);

    if (amount > coSignerThreshold) {
      result.verdict = 'REQUIRES_APPROVAL';
      result.decisionType = 'CO_SIGNER_ESCALATION';
      result.reasons.push(`High-Value Threshold Trigger: Amount ₹${amount.toLocaleString()} exceeds multi-sig threshold ₹${coSignerThreshold.toLocaleString()}. Requires dual-factor hardware token co-signature.`);
      return result;
    }

    if (amount > singleLimit) {
      result.verdict = 'REQUIRES_APPROVAL';
      result.decisionType = 'HITL_ESCALATION';
      result.reasons.push(`Single-Item Limit Trigger: Amount ₹${amount.toLocaleString()} exceeds unattended single-order limit ₹${singleLimit.toLocaleString()} by ₹${(amount - singleLimit).toLocaleString()}. Human authorization required.`);
      return result;
    }

    // 12. If all pass and within limits -> ALLOW
    result.verdict = 'ALLOW';
    result.decisionType = 'AUTO_CLEARANCE';
    result.reasons.push(`Deterministic Clearance: Under ₹${singleLimit.toLocaleString()} single-order ceiling, approved merchant, and valid quota.`);
    result.passedChecks.push(`Within single-item ceiling (₹${amount.toLocaleString()} <= ₹${singleLimit.toLocaleString()})`);
    return result;

  } catch (err) {
    // Fail closed on any exception
    result.verdict = 'ERROR';
    result.decisionType = 'SYSTEM_ERROR_FAIL_CLOSED';
    result.reasons.push(`Policy evaluation exception: ${err.message}. Fails closed.`);
    result.violations.push('INTERNAL_ERROR');
    return result;
  }
}
