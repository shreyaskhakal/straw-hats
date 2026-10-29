import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ArbitrationModal from '../components/ArbitrationModal';
import { api } from '../api/client';

export default function MandatesPage() {
  const [mandates, setMandates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guideOpen, setGuideOpen] = useState(false);
  const [signing, setSigning] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Multi-step form state
  const [step, setStep] = useState(1); // 1: Identity, 2: Financial Limits, 3: Merchant & Boundaries, 4: Review & Sign
  const [errors, setErrors] = useState({});

  // Step 1: Identity & Purpose
  const [mandateName, setMandateName] = useState('Engineering Hardware & Labs');
  const [mandatePurpose, setMandatePurpose] = useState('Procure authorized test devices, peripherals, and workstation hardware for development teams.');
  const [assignedAgent, setAssignedAgent] = useState('Claude Shopping v3.5');

  // Step 2: Financial Limits & Timing
  const [singlePurchaseLimit, setSinglePurchaseLimit] = useState(5000);
  const [dailyLimit, setDailyLimit] = useState(25000);
  const [autoApproveLimit, setAutoApproveLimit] = useState(3000);
  const [currency, setCurrency] = useState('INR');
  const [validityDate, setValidityDate] = useState('2026-12-31');

  // Step 3: Merchant & Product Boundaries
  const [allowedMerchants, setAllowedMerchants] = useState(['Amazon India', 'Croma Retail', 'Reliance Digital']);
  const [newAllowedInput, setNewAllowedInput] = useState('');
  const [blockedMerchants, setBlockedMerchants] = useState(['TechBazaar.in', 'Unauthorized-Wholesale', 'QuickResell.io']);
  const [newBlockedInput, setNewBlockedInput] = useState('');
  const [allowedCategories, setAllowedCategories] = useState(['Computer Peripherals', 'Keyboards & Mice', 'Monitors & Displays']);
  const [newCatInput, setNewCatInput] = useState('');
  const [prohibitedProducts, setProhibitedProducts] = useState(['Refurbished Stock', 'Gift Cards', 'Crypto Mining Hardware']);
  const [newProhibitInput, setNewProhibitInput] = useState('');

  // Emergency Revocation Mode Toggle for new mandate
  const [allowEmergencyRevocation, setAllowEmergencyRevocation] = useState(true);

  useEffect(() => {
    loadMandates();
  }, []);

  const loadMandates = async () => {
    try {
      const res = await api.getMandates();
      setMandates(res.mandates || []);
    } catch (err) {
      console.warn('Failed to load mandates', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (id) => {
    try {
      await api.revokeMandate(id);
      showToast('Mandate status updated on gateway.');
      loadMandates();
    } catch (err) {
      console.error(err);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const setPreset = (type) => {
    if (type === 'office') {
      setMandateName('Home Office & Ergonomics');
      setMandatePurpose('Equip team with ergonomic peripherals and desk accessories from certified vendors.');
      setAssignedAgent('Claude Shopping v3.5');
      setSinglePurchaseLimit(5000);
      setDailyLimit(25000);
      setAutoApproveLimit(3000);
      setCurrency('INR');
      setAllowedMerchants(['Amazon India', 'Croma Retail', 'Reliance Digital']);
      setBlockedMerchants(['TechBazaar.in', 'RefurbMarket.in']);
      setAllowedCategories(['Computer Peripherals', 'Ergonomic Furniture']);
      setProhibitedProducts(['Refurbished Stock', 'Open Box']);
    } else if (type === 'software') {
      setMandateName('DevOps CI & Cloud SaaS');
      setMandatePurpose('Permit automated renewals of cloud compute nodes and CI runners.');
      setAssignedAgent('AutoProcure Daemon');
      setSinglePurchaseLimit(4000);
      setDailyLimit(15000);
      setAutoApproveLimit(2500);
      setCurrency('INR');
      setAllowedMerchants(['GitHub', 'AWS Cloud', 'DigitalOcean', 'Cloudflare']);
      setBlockedMerchants(['Unverified-Host.ru', 'CryptoProxy']);
      setAllowedCategories(['Developer Tooling', 'Compute Infrastructure']);
      setProhibitedProducts(['Unregistered Registrars']);
    } else if (type === 'learning') {
      setMandateName('Research Publications & Books');
      setMandatePurpose('Subscriptions to academic repositories and technical reference texts.');
      setAssignedAgent('Perplexity Buy v1.2');
      setSinglePurchaseLimit(2000);
      setDailyLimit(6000);
      setAutoApproveLimit(1500);
      setCurrency('INR');
      setAllowedMerchants(['Amazon India', 'Bookswagon', 'ACM Digital Library']);
      setBlockedMerchants(['TorrentSites', 'UnofficialResellers']);
      setAllowedCategories(['Technical Books', 'Journal Subscriptions']);
      setProhibitedProducts(['Course Bundles', 'Physical Merchandise']);
    }
    showToast(`Loaded preset "${type}" into form builder.`);
  };

  // Add / Remove helpers
  const addItem = (list, setList, input, setInput) => {
    if (!input.trim()) return;
    if (!list.includes(input.trim())) {
      setList([...list, input.trim()]);
    }
    setInput('');
  };

  const removeItem = (list, setList, item) => {
    setList(list.filter((x) => x !== item));
  };

  // Validation
  const validateStep = (s) => {
    const newErrors = {};
    if (s === 1) {
      if (!mandateName.trim()) newErrors.mandateName = 'Mandate name is required';
      if (!mandatePurpose.trim()) newErrors.mandatePurpose = 'Mandate purpose is required';
    } else if (s === 2) {
      if (!singlePurchaseLimit || singlePurchaseLimit <= 0) newErrors.singlePurchaseLimit = 'Enter a valid single purchase limit';
      if (!dailyLimit || dailyLimit < singlePurchaseLimit) newErrors.dailyLimit = 'Daily limit must be greater than or equal to single purchase limit';
      if (!autoApproveLimit || autoApproveLimit > singlePurchaseLimit) newErrors.autoApproveLimit = 'Auto-approve threshold cannot exceed single purchase limit';
      if (!validityDate) newErrors.validityDate = 'Select validity expiration date';
    } else if (s === 3) {
      if (allowedMerchants.length === 0) newErrors.allowedMerchants = 'At least one allowed merchant is required';
      if (allowedCategories.length === 0) newErrors.allowedCategories = 'At least one category is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleDeployMandate = async () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      showToast('Please correct form validation errors before saving.');
      return;
    }
    setSigning(true);
    try {
      await api.createMandate({
        name: mandateName.trim(),
        purpose: mandatePurpose.trim(),
        category: allowedCategories[0] || 'Hardware & Peripherals',
        budgetCeiling: Number(dailyLimit),
        singlePurchaseLimit: Number(singlePurchaseLimit),
        autoApproveLimit: Number(autoApproveLimit),
        currency,
        expiry: validityDate,
        allowedMerchants,
        blockedMerchants,
        allowedCategories,
        prohibitedProducts,
        agents: [assignedAgent],
        allowEmergencyRevocation,
        plainTextRule: `${mandateName}: ${mandatePurpose}. Cap per order: ${currency} ${singlePurchaseLimit}. Auto-approved under: ${currency} ${autoApproveLimit}. Allowed: [${allowedMerchants.join(', ')}]. Blocked: [${blockedMerchants.join(', ')}].`
      });
      showToast('Mandate synthesized and registered in gateway session!');
      loadMandates();
      setStep(1);
      document.getElementById('policies-section')?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      showToast('Deployment failed: ' + (err.message || 'Unknown error'));
    } finally {
      setSigning(false);
    }
  };

  const compiledRulesSpec = {
    $schema: 'https://mandate.gw/schemas/policy-v2.json',
    mandate_name: mandateName,
    purpose: mandatePurpose,
    assigned_agent: assignedAgent,
    currency,
    limits: {
      single_purchase_cap: singlePurchaseLimit,
      daily_spending_cap: dailyLimit,
      unattended_approval_threshold: autoApproveLimit,
      escalation_policy: 'HUMAN_APPROVAL_REQUIRED_ABOVE_THRESHOLD'
    },
    temporal: {
      valid_until: validityDate,
      timezone: 'UTC'
    },
    boundaries: {
      allowed_merchants: allowedMerchants,
      blocked_merchants: blockedMerchants,
      allowed_categories: allowedCategories,
      prohibited_products_keywords: prohibitedProducts
    },
    emergency: {
      allow_instant_revocation: allowEmergencyRevocation,
      kill_switch_compliance: 'ENFORCED'
    },
    environment: 'FRONTEND_DEMO_SANDBOX'
  };

  return (
    <div className="bg-background min-h-screen text-on-surface antialiased">
      <Sidebar mandateCount={mandates.length} />
      <Header pageTitle="Mandates Builder" onOpenGuide={() => setGuideOpen(true)} />
      <ArbitrationModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />

      {/* Main Viewport */}
      <div className="pl-0 md:pl-64 transition-all duration-200">
        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 space-y-12">
          
          {/* 1. Page Header */}
          <section className="pb-6 border-b border-outline-variant/30">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-1 max-w-2xl">
                <span className="page-eyebrow block">
                  Policy Management / Clearance Rules
                </span>
                <h1 className="page-title">
                  Spending Mandates
                </h1>
                <p className="page-subtitle">
                  Define user-controlled authorization boundaries for AI shopping agents. Configure limits, approved merchants, and approval triggers.
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  className="btn-secondary"
                  onClick={() => document.getElementById('builder-section')?.scrollIntoView({ behavior: 'smooth' })}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">tune</span>
                  <span>Open Builder</span>
                </button>
                <button
                  className="btn-primary"
                  onClick={() => {
                    document.getElementById('builder-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>Create Mandate</span>
                </button>
              </div>
            </div>
          </section>

          {/* 2. Existing Active Mandates */}
          <section id="policies-section" className="space-y-4">
            <div className="flex items-baseline justify-between pb-2 border-b border-outline-variant/30">
              <div>
                <h2 className="section-title">Active Enforced Mandates</h2>
                <p className="text-[13px] text-on-surface-variant mt-0.5">
                  Currently active policies governing autonomous shopping agent checkouts
                </p>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs text-on-surface-variant">
                <span>{mandates.length} ENROLLED</span>
                <span className="text-[#c4c7c7]">•</span>
                <span className="text-secondary font-medium">SIMULATED SANDBOX</span>
              </div>
            </div>

            {/* Mandates Table / List */}
            <div className="border-t border-[#e7e7e3] divide-y divide-[#e7e7e3]">
              {mandates.map((m) => {
                const isRevoked = m.status === 'REVOKED';
                return (
                  <div
                    key={m.id}
                    className={`py-4 transition-colors ${
                      isRevoked ? 'opacity-60 bg-surface-container-low/50' : 'hover:bg-surface-container-lowest/60'
                    }`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      <div className="md:col-span-4 min-w-0">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isRevoked ? 'bg-error' : 'bg-emerald-600'}`} />
                          <div className="min-w-0">
                            <span className="font-title-md font-semibold text-[14.5px] text-primary block leading-snug truncate">
                              {m.name}
                            </span>
                            <span className="font-mono text-[11px] text-secondary">
                              #{m.id} • Single Max: ₹{m.singlePurchaseLimit?.toLocaleString() || '3,000'} • Auto ≤ ₹{m.requiresCoSignerOver?.toLocaleString() || '3,000'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="md:col-span-3 min-w-0">
                        <span className="text-[10px] text-secondary block font-mono uppercase tracking-wider">Whitelisted Merchants</span>
                        <span className="text-xs text-on-surface truncate block mt-0.5">
                          {Array.isArray(m.allowedMerchants) ? m.allowedMerchants.join(', ') : m.allowedMerchants}
                        </span>
                      </div>

                      <div className="md:col-span-2">
                        <span className="text-[10px] text-secondary block font-mono uppercase tracking-wider">Budget Utilization</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="font-mono text-xs font-semibold text-primary">
                            ₹{m.utilized?.toLocaleString()}
                          </span>
                          <span className="font-mono text-[10px] text-secondary">
                            / ₹{m.budgetCeiling?.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <span className="text-[10px] text-secondary block font-mono uppercase tracking-wider">Assigned Agent</span>
                        <span className="text-xs text-primary font-medium block truncate mt-0.5">
                          {Array.isArray(m.agents) ? m.agents.join(', ') : 'Claude Shopping v3.5'}
                        </span>
                        <span className="font-mono text-[10px] text-secondary">
                          {isRevoked ? 'Emergency Revoked' : `Valid: ${m.expiry || '31 Dec 2026'}`}
                        </span>
                      </div>

                      <div className="md:col-span-1 flex items-center justify-end">
                        <button
                          onClick={() => handleRevoke(m.id)}
                          className={`text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded transition-colors cursor-pointer ${
                            isRevoked
                              ? 'text-emerald-700 hover:text-emerald-900 border border-emerald-300 bg-emerald-50'
                              : 'text-error hover:bg-error hover:text-white border border-error/30'
                          }`}
                          type="button"
                          title={isRevoked ? 'Resume policy' : 'Emergency revoke spending policy'}
                        >
                          {isRevoked ? 'Resume' : 'Revoke'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 3. Multi-Step Functional Mandates Builder */}
          <section className="pt-6" id="builder-section">
            <div className="pb-6 border-b border-[#e7e7e3] flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-secondary font-semibold block mb-1">
                  Interactive Policy Creator
                </span>
                <h2 className="font-headline-lg text-2xl md:text-3xl font-semibold text-primary tracking-tight">
                  Mandate Configuration Wizard
                </h2>
                <p className="text-sm text-on-surface-variant mt-1">
                  Complete each configuration step to synthesize deterministic checkout boundaries.
                </p>
              </div>

              {/* Wizard Steps Header */}
              <div className="flex items-center gap-2 sm:gap-4 text-xs font-mono">
                <button
                  onClick={() => setStep(1)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                    step === 1 ? 'bg-primary text-white font-semibold' : 'bg-surface-container text-on-surface-variant'
                  }`}
                  type="button"
                >
                  <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
                  <span>Identity</span>
                </button>

                <button
                  onClick={() => validateStep(1) && setStep(2)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                    step === 2 ? 'bg-primary text-white font-semibold' : 'bg-surface-container text-on-surface-variant'
                  }`}
                  type="button"
                >
                  <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
                  <span>Limits</span>
                </button>

                <button
                  onClick={() => validateStep(1) && validateStep(2) && setStep(3)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                    step === 3 ? 'bg-primary text-white font-semibold' : 'bg-surface-container text-on-surface-variant'
                  }`}
                  type="button"
                >
                  <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">3</span>
                  <span>Merchants</span>
                </button>

                <button
                  onClick={() => validateStep(1) && validateStep(2) && validateStep(3) && setStep(4)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                    step === 4 ? 'bg-primary text-white font-semibold' : 'bg-surface-container text-on-surface-variant'
                  }`}
                  type="button"
                >
                  <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">4</span>
                  <span>Review</span>
                </button>
              </div>
            </div>

            {/* Presets Row */}
            <div className="pt-4 flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] text-secondary uppercase tracking-wider mr-1">Load Preset:</span>
              <button onClick={() => setPreset('office')} className="px-3 py-1 rounded-full border border-[#e7e7e3] bg-surface-container-lowest hover:border-primary text-xs text-primary transition-colors cursor-pointer" type="button">Office Hardware</button>
              <button onClick={() => setPreset('software')} className="px-3 py-1 rounded-full border border-[#e7e7e3] bg-surface-container-lowest hover:border-primary text-xs text-primary transition-colors cursor-pointer" type="button">DevOps SaaS</button>
              <button onClick={() => setPreset('learning')} className="px-3 py-1 rounded-full border border-[#e7e7e3] bg-surface-container-lowest hover:border-primary text-xs text-primary transition-colors cursor-pointer" type="button">Research Books</button>
            </div>

            {/* Builder Form Body */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 items-start">
              {/* Form Content Column (7 cols) */}
              <div className="lg:col-span-7 bg-surface-container-lowest border border-[#e7e7e3] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
                
                {/* STEP 1: Identity & Assigned Agent */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <span className="font-mono text-xs uppercase tracking-wider text-secondary font-semibold block">Step 1 of 4</span>
                      <h3 className="text-xl font-semibold text-primary mt-0.5">Mandate Identity &amp; Agent Assignment</h3>
                      <p className="text-xs text-on-surface-variant mt-1">Specify who this mandate belongs to and what it allows.</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-primary block" htmlFor="mandate-name">
                        Mandate Name *
                      </label>
                      <input
                        id="mandate-name"
                        type="text"
                        value={mandateName}
                        onChange={(e) => setMandateName(e.target.value)}
                        placeholder="e.g. Ergonomic Office Peripherals Q4"
                        className="input-standard"
                      />
                      {errors.mandateName && <p className="text-error text-[11px]">{errors.mandateName}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-primary block" htmlFor="mandate-purpose">
                        Business Purpose &amp; Procurement Scope *
                      </label>
                      <textarea
                        id="mandate-purpose"
                        rows={3}
                        value={mandatePurpose}
                        onChange={(e) => setMandatePurpose(e.target.value)}
                        placeholder="Describe what purchases this AI agent is allowed to make..."
                        className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface text-[13.5px] font-body-md focus:outline-none focus:border-primary"
                      />
                      {errors.mandatePurpose && <p className="text-error text-[11px]">{errors.mandatePurpose}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-primary block" htmlFor="assigned-agent">
                        Assigned AI Shopping Agent
                      </label>
                      <select
                        id="assigned-agent"
                        value={assignedAgent}
                        onChange={(e) => setAssignedAgent(e.target.value)}
                        className="select-standard w-full"
                      >
                        <option value="Claude Shopping v3.5">Claude Shopping (Anthropic v3.5 Sonnet)</option>
                        <option value="Perplexity Buy v1.2">Perplexity Buy (Sonar / Online Search)</option>
                        <option value="AutoProcure Daemon">AutoProcure Background Daemon</option>
                        <option value="Custom Agent / OpenAPI">Custom Agent (API Token Delegated)</option>
                      </select>
                      <span className="text-[11px] text-secondary font-mono block">
                        Assigned agent will authenticate with its corresponding Agent Passport token.
                      </span>
                    </div>
                  </div>
                )}

                {/* STEP 2: Financial Limits & Timing */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div>
                      <span className="font-mono text-xs uppercase tracking-wider text-secondary font-semibold block">Step 2 of 4</span>
                      <h3 className="text-xl font-semibold text-primary mt-0.5">Financial Boundaries &amp; Validity Window</h3>
                      <p className="text-xs text-on-surface-variant mt-1">Configure ceilings and define the auto-approval threshold.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-primary block" htmlFor="currency">
                          Settlement Currency
                        </label>
                        <select
                          id="currency"
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          className="select-standard w-full font-mono"
                        >
                          <option value="INR">INR (₹) - Indian Rupee</option>
                          <option value="USD">USD ($) - US Dollar</option>
                          <option value="EUR">EUR (€) - Euro</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-primary block" htmlFor="validity-date">
                          Mandate Expiration Date *
                        </label>
                        <input
                          id="validity-date"
                          type="date"
                          value={validityDate}
                          onChange={(e) => setValidityDate(e.target.value)}
                          className="input-standard font-mono"
                        />
                        {errors.validityDate && <p className="text-error text-[11px]">{errors.validityDate}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-primary block" htmlFor="single-cap">
                          Max Amount per Purchase ({currency}) *
                        </label>
                        <input
                          id="single-cap"
                          type="number"
                          value={singlePurchaseLimit}
                          onChange={(e) => setSinglePurchaseLimit(Number(e.target.value))}
                          className="input-standard font-mono"
                        />
                        <span className="text-[10px] text-secondary">Hard stop ceiling for single checkout</span>
                        {errors.singlePurchaseLimit && <p className="text-error text-[11px]">{errors.singlePurchaseLimit}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-primary block" htmlFor="daily-cap">
                          Daily / Monthly Spending Limit ({currency}) *
                        </label>
                        <input
                          id="daily-cap"
                          type="number"
                          value={dailyLimit}
                          onChange={(e) => setDailyLimit(Number(e.target.value))}
                          className="input-standard font-mono"
                        />
                        <span className="text-[10px] text-secondary">Cumulative ceiling across all orders</span>
                        {errors.dailyLimit && <p className="text-error text-[11px]">{errors.dailyLimit}</p>}
                      </div>
                    </div>

                    {/* Auto-Authorization Slider */}
                    <div className="p-4 rounded-xl bg-surface-container-low border border-[#e7e7e3] space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold text-primary block">Automatic Approval Threshold</span>
                          <span className="text-[11px] text-on-surface-variant">Orders below this amount clear instantly; orders above require human approval.</span>
                        </div>
                        <span className="font-mono text-sm font-bold text-primary">
                          {currency} {autoApproveLimit.toLocaleString()}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="500"
                        max={singlePurchaseLimit}
                        step="250"
                        value={autoApproveLimit}
                        onChange={(e) => setAutoApproveLimit(Number(e.target.value))}
                        className="w-full accent-neutral-900 cursor-pointer"
                      />
                      <div className="flex justify-between font-mono text-[10px] text-secondary">
                        <span>≤ {currency} {autoApproveLimit.toLocaleString()}: Auto-Cleared</span>
                        <span>&gt; {currency} {autoApproveLimit.toLocaleString()}: Requires User Sign-Off</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Merchant & Boundaries */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div>
                      <span className="font-mono text-xs uppercase tracking-wider text-secondary font-semibold block">Step 3 of 4</span>
                      <h3 className="text-xl font-semibold text-primary mt-0.5">Merchant &amp; Product Boundaries</h3>
                      <p className="text-xs text-on-surface-variant mt-1">Specify whitelisted vs blocked merchants, plus prohibited keywords.</p>
                    </div>

                    {/* Allowed Merchants */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-primary flex items-center justify-between">
                        <span>Allowed Merchants ({allowedMerchants.length}) *</span>
                        <span className="text-[10px] text-emerald-700 font-mono">Whitelisted</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add merchant (e.g. Amazon India, Croma)..."
                          value={newAllowedInput}
                          onChange={(e) => setNewAllowedInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addItem(allowedMerchants, setAllowedMerchants, newAllowedInput, setNewAllowedInput)}
                          className="input-standard text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => addItem(allowedMerchants, setAllowedMerchants, newAllowedInput, setNewAllowedInput)}
                          className="btn-secondary text-xs shrink-0"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {allowedMerchants.map((m) => (
                          <span key={m} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium">
                            <span>{m}</span>
                            <button onClick={() => removeItem(allowedMerchants, setAllowedMerchants, m)} className="text-emerald-700 hover:text-emerald-900" type="button">
                              <span className="material-symbols-outlined text-[14px]">close</span>
                            </button>
                          </span>
                        ))}
                      </div>
                      {errors.allowedMerchants && <p className="text-error text-[11px]">{errors.allowedMerchants}</p>}
                    </div>

                    {/* Blocked Merchants */}
                    <div className="space-y-2 pt-2 border-t border-[#e7e7e3]">
                      <label className="text-xs font-semibold text-primary flex items-center justify-between">
                        <span>Blocked Merchants ({blockedMerchants.length})</span>
                        <span className="text-[10px] text-error font-mono">Hard Stop</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add blocked seller/domain..."
                          value={newBlockedInput}
                          onChange={(e) => setNewBlockedInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addItem(blockedMerchants, setBlockedMerchants, newBlockedInput, setNewBlockedInput)}
                          className="input-standard text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => addItem(blockedMerchants, setBlockedMerchants, newBlockedInput, setNewBlockedInput)}
                          className="btn-secondary text-xs shrink-0"
                        >
                          Block
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {blockedMerchants.map((b) => (
                          <span key={b} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 text-error border border-red-200 text-xs font-medium">
                            <span>{b}</span>
                            <button onClick={() => removeItem(blockedMerchants, setBlockedMerchants, b)} className="text-error hover:text-red-900" type="button">
                              <span className="material-symbols-outlined text-[14px]">close</span>
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Allowed Categories & Prohibited Products */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#e7e7e3]">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-primary block">Allowed Categories *</label>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            placeholder="e.g. Peripherals..."
                            value={newCatInput}
                            onChange={(e) => setNewCatInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addItem(allowedCategories, setAllowedCategories, newCatInput, setNewCatInput)}
                            className="input-standard text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => addItem(allowedCategories, setAllowedCategories, newCatInput, setNewCatInput)}
                            className="btn-outline text-xs"
                          >
                            +
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {allowedCategories.map((c) => (
                            <span key={c} className="text-[11px] px-2 py-0.5 rounded bg-surface-container text-on-surface flex items-center gap-1">
                              {c}
                              <button onClick={() => removeItem(allowedCategories, setAllowedCategories, c)} className="text-secondary hover:text-error" type="button">×</button>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-primary block">Prohibited Products / Keywords</label>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            placeholder="e.g. Refurbished..."
                            value={newProhibitInput}
                            onChange={(e) => setNewProhibitInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addItem(prohibitedProducts, setProhibitedProducts, newProhibitInput, setNewProhibitInput)}
                            className="input-standard text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => addItem(prohibitedProducts, setProhibitedProducts, newProhibitInput, setNewProhibitInput)}
                            className="btn-outline text-xs"
                          >
                            +
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {prohibitedProducts.map((p) => (
                            <span key={p} className="text-[11px] px-2 py-0.5 rounded bg-error-container/40 text-on-error-container flex items-center gap-1">
                              {p}
                              <button onClick={() => removeItem(prohibitedProducts, setProhibitedProducts, p)} className="text-error hover:text-black" type="button">×</button>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Emergency Revocation Switch */}
                    <div className="pt-3 border-t border-[#e7e7e3] flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-primary block">Instant Emergency Revocation</span>
                        <span className="text-[11px] text-on-surface-variant">Allows 1-click revocation from dashboard or kill-switch</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={allowEmergencyRevocation}
                        onChange={(e) => setAllowEmergencyRevocation(e.target.checked)}
                        className="w-4 h-4 accent-neutral-900 cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 4: Review Screen */}
                {step === 4 && (
                  <div className="space-y-6">
                    <div>
                      <span className="font-mono text-xs uppercase tracking-wider text-secondary font-semibold block">Step 4 of 4</span>
                      <h3 className="text-xl font-semibold text-primary mt-0.5">Review &amp; Verify Policy Contract</h3>
                      <p className="text-xs text-on-surface-variant mt-1">Review the exact synthesized parameters before activating this mandate.</p>
                    </div>

                    <div className="p-4 rounded-xl bg-surface-container-low border border-[#e7e7e3] space-y-3 text-xs">
                      <div className="flex justify-between border-b border-[#e7e7e3] pb-2">
                        <span className="text-secondary font-medium">Mandate Name</span>
                        <span className="font-semibold text-primary">{mandateName}</span>
                      </div>
                      <div className="flex justify-between border-b border-[#e7e7e3] pb-2">
                        <span className="text-secondary font-medium">Assigned Agent</span>
                        <span className="font-mono font-medium text-primary">{assignedAgent}</span>
                      </div>
                      <div className="flex justify-between border-b border-[#e7e7e3] pb-2">
                        <span className="text-secondary font-medium">Max Single Order</span>
                        <span className="font-mono font-bold text-primary">{currency} {singlePurchaseLimit.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-b border-[#e7e7e3] pb-2">
                        <span className="text-secondary font-medium">Daily Budget Cap</span>
                        <span className="font-mono font-bold text-primary">{currency} {dailyLimit.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-b border-[#e7e7e3] pb-2">
                        <span className="text-secondary font-medium">Auto-Approve Threshold</span>
                        <span className="font-mono font-medium text-emerald-700">≤ {currency} {autoApproveLimit.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-b border-[#e7e7e3] pb-2">
                        <span className="text-secondary font-medium">Valid Until</span>
                        <span className="font-mono text-primary">{validityDate}</span>
                      </div>
                      <div className="flex justify-between border-b border-[#e7e7e3] pb-2">
                        <span className="text-secondary font-medium">Whitelisted Merchants</span>
                        <span className="text-right text-primary max-w-xs truncate">{allowedMerchants.join(', ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary font-medium">Blocked Merchants</span>
                        <span className="text-right text-error max-w-xs truncate">{blockedMerchants.join(', ')}</span>
                      </div>
                    </div>

                    {/* Disclaimer Box */}
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs space-y-1">
                      <div className="font-semibold flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">info</span>
                        <span>Frontend Demo Simulation Notice</span>
                      </div>
                      <p className="leading-relaxed text-[11.5px]">
                        This frontend demo validates and stores rules in the local mock layer. These rules cannot be enforced against real-world card payments or live merchant checkouts until the Express backend and PayPal API bridge are connected.
                      </p>
                    </div>
                  </div>
                )}

                {/* Form Stepper Navigation Buttons */}
                <div className="pt-4 border-t border-[#e7e7e3] flex items-center justify-between">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="btn-secondary"
                    >
                      <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                      <span>Back</span>
                    </button>
                  ) : <div />}

                  {step < 4 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="btn-primary"
                    >
                      <span>Continue to Step {step + 1}</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={signing}
                      onClick={handleDeployMandate}
                      className="btn-primary px-6"
                    >
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                      <span>{signing ? 'Signing...' : 'Activate Mandate'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Right Column: Live Compiled Rules Artifact (5 cols) */}
              <div className="lg:col-span-5 sticky top-24 space-y-4">
                <div className="bg-[#141514] text-white rounded-2xl p-6 space-y-4 shadow-xl border border-white/10 font-mono text-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="font-semibold uppercase tracking-wider text-emerald-400 text-[11px]">
                        Exact Synthesized Rules
                      </span>
                    </div>
                    <span className="text-[10px] text-white/50">schema: v2.0-json</span>
                  </div>

                  <p className="text-[11px] text-white/70 font-sans">
                    These are the exact rules that will apply to candidate products evaluated by the policy engine:
                  </p>

                  <pre className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-secondary-fixed-dim text-[11px] overflow-x-auto max-h-[380px] leading-relaxed">
                    {JSON.stringify(compiledRulesSpec, null, 2)}
                  </pre>

                  <div className="pt-2 text-[10.5px] text-white/40 leading-relaxed font-sans">
                    Deterministic gate: In unattended mode, items under {currency} {autoApproveLimit.toLocaleString()} pass immediately. Items above threshold require human confirmation.
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 bg-primary text-white px-4 py-3 rounded-xl shadow-2xl font-mono text-xs flex items-center gap-2 border border-white/10">
          <span className="material-symbols-outlined text-emerald-400 text-[16px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
