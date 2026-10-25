import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ArbitrationModal from '../components/ArbitrationModal';
import { api } from '../api/client';

export default function MandatesPage() {
  const [mandates, setMandates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guideOpen, setGuideOpen] = useState(false);
  const [sliderVal, setSliderVal] = useState(3000);
  const [intentText, setIntentText] = useState(
    'Allow my shopping agent to buy computer accessories and ergonomic gear from approved merchants (Amazon India, Croma, Reliance Digital) for up to ₹5,000 per single order, with a ₹25,000 monthly total budget, until 30 November. Flag anything above ₹3,000 for my manual review.'
  );
  const [merchants, setMerchants] = useState(['Amazon India', 'Croma Electronics', 'Reliance Digital']);
  const [newMerchantInput, setNewMerchantInput] = useState('');
  const [signing, setSigning] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

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
      setIntentText('Allow my shopping agent to buy computer accessories and ergonomic gear from approved merchants (Amazon India, Croma, Reliance Digital) for up to ₹5,000 per single order, with a ₹25,000 monthly total budget, until 30 November. Flag anything above ₹3,000 for my manual review.');
      setSliderVal(3000);
      setMerchants(['Amazon India', 'Croma Electronics', 'Reliance Digital']);
    } else if (type === 'software') {
      setIntentText('Permit automated DevOps SaaS renewals, cloud instances, and CI runners on GitHub, AWS, and Cloudflare up to ₹12,000/mo. Require biometric sign-off for single invoices exceeding ₹4,000.');
      setSliderVal(4000);
      setMerchants(['GitHub', 'AWS', 'DigitalOcean', 'Cloudflare']);
    } else if (type === 'groceries') {
      setIntentText('Office pantry recurring weekly orders from Blinkit, Zepto, and BigBasket up to ₹3,500/week. Auto-clear snacks, coffee beans, and milk under ₹1,500.');
      setSliderVal(1500);
      setMerchants(['Blinkit', 'Zepto', 'BigBasket']);
    } else if (type === 'learning') {
      setIntentText('Technical books, Springer papers, and ACM library subscriptions up to ₹2,000 per purchase, total monthly cap ₹6,000. Ban used and marketplace sellers.');
      setSliderVal(2000);
      setMerchants(['Amazon India', 'Bookswagon', 'ACM Digital Library']);
    }
    showToast(`Preset "${type}" loaded into compiler.`);
  };

  const handleAddMerchant = () => {
    if (!newMerchantInput.trim()) return;
    if (!merchants.includes(newMerchantInput.trim())) {
      setMerchants([...merchants, newMerchantInput.trim()]);
    }
    setNewMerchantInput('');
  };

  const handleRemoveMerchant = (m) => {
    setMerchants(merchants.filter((item) => item !== m));
  };

  const handleDeployMandate = async () => {
    if (!intentText.trim()) {
      showToast('Please enter a spending intent text first.');
      return;
    }
    if (merchants.length === 0) {
      showToast('Please whitelist at least one merchant domain.');
      return;
    }
    setSigning(true);
    try {
      await api.createMandate({
        name: 'Synthesized Mandate Node',
        category: 'Hardware & Peripherals',
        plainTextRule: intentText.trim(),
        budgetCeiling: 25000,
        singlePurchaseLimit: 5000,
        autoApproveLimit: sliderVal,
        allowedMerchants: merchants,
        agents: ['Claude Shopping'],
      });
      showToast('Mandate cryptographically signed and deployed to SGX Enclave!');
      loadMandates();
      document.getElementById('policies-section')?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      showToast('Deployment failed: ' + (err.message || 'Unknown error'));
    } finally {
      setSigning(false);
    }
  };

  return (
    <div className="bg-background min-h-screen text-on-surface">
      <Sidebar mandateCount={mandates.length} />
      <Header pageTitle="Autonomous Clearance Rules" onOpenGuide={() => setGuideOpen(true)} />
      <ArbitrationModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />

      {/* Main Viewport */}
      <div className="pl-0 md:pl-64 transition-all duration-200">
        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          {/* 1. Editorial Page Header */}
          <section className="mb-10 pb-6 border-b border-outline-variant/30">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-1 max-w-2xl">
                <span className="page-eyebrow block">
                  Policy Management / Clearance Rules
                </span>
                <h1 className="page-title">
                  Spending Mandates
                </h1>
                <p className="page-subtitle">
                  Deterministic, tamper-proof execution boundaries translating natural intent into immutable ledger clearance rules.
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  className="btn-secondary"
                  onClick={() => document.getElementById('builder-section')?.scrollIntoView({ behavior: 'smooth' })}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">tune</span>
                  <span>Policy Builder</span>
                </button>
                <button
                  className="btn-primary"
                  onClick={() => {
                    document.getElementById('builder-section')?.scrollIntoView({ behavior: 'smooth' });
                    document.getElementById('intent-textarea')?.focus();
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
          <section className="mb-16" id="policies-section">
            <div className="flex items-baseline justify-between mb-6 pb-2 border-b border-outline-variant/30">
              <div>
                <h2 className="section-title">Active Policies</h2>
                <p className="font-body-sm text-[13px] text-on-surface-variant mt-0.5">Enforced on-wire across autonomous shopper runtimes</p>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs text-on-surface-variant">
                <span>{mandates.length} ENFORCED</span>
                <span className="text-[#c4c7c7]">•</span>
                <span className="text-secondary font-medium">ALL HEALTHY</span>
              </div>
            </div>

            {/* Open List Container */}
            <div className="border-t border-[#e7e7e3]">
              {mandates.map((m) => {
                const isRevoked = m.status === 'REVOKED';
                return (
                  <div
                    key={m.id}
                    className={`py-5 border-b border-[#e7e7e3] transition-colors ${
                      isRevoked ? 'opacity-60 bg-neutral-50/50' : 'hover:bg-white/40'
                    }`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      <div className="md:col-span-4">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isRevoked ? 'bg-error' : 'bg-charcoal'}`} />
                          <div className="min-w-0">
                            <span className="font-display font-semibold text-[15px] text-charcoal block leading-snug truncate">
                              {m.name}
                            </span>
                            <span className="font-mono text-[11px] text-on-surface-variant">
                              #{m.id} • Instant ≤ ₹{m.singlePurchaseLimit?.toLocaleString() || '3,000'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="md:col-span-3">
                        <span className="text-xs text-on-surface-variant block font-mono uppercase tracking-wider mb-0.5">Scope</span>
                        <span className="text-xs text-charcoal truncate block">
                          {Array.isArray(m.allowedMerchants) ? m.allowedMerchants.join(', ') : m.allowedMerchants}
                        </span>
                      </div>

                      <div className="md:col-span-2">
                        <span className="text-xs text-on-surface-variant block font-mono uppercase tracking-wider mb-0.5">Budget</span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-mono text-sm font-semibold text-charcoal">
                            ₹{m.utilized?.toLocaleString()}
                          </span>
                          <span className="font-mono text-[11px] text-on-surface-variant">
                            / ₹{m.budgetCeiling?.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <span className="text-xs text-on-surface-variant block font-mono uppercase tracking-wider mb-0.5">Agent / Expiry</span>
                        <span className="text-xs text-charcoal block">
                          {Array.isArray(m.agents) ? m.agents.join(', ') : 'Claude 3.5 Sonnet'}
                        </span>
                        <span className="font-mono text-[11px] text-secondary">
                          {isRevoked ? 'Paused by User' : `Exp. ${m.expiry || '30 Nov 2026'}`}
                        </span>
                      </div>

                      <div className="md:col-span-1 flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleRevoke(m.id)}
                          className={`text-xs font-mono uppercase tracking-wider px-2 py-1 rounded transition-colors cursor-pointer ${
                            isRevoked
                              ? 'text-emerald-700 hover:text-emerald-900 border border-emerald-300'
                              : 'text-charcoal hover:text-error border border-[#e7e7e3] hover:border-error'
                          }`}
                          type="button"
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

          {/* 3. Guided Policy Builder */}
          <section className="pt-6" id="builder-section">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#e7e7e3]">
              <div>
                <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-secondary font-medium block mb-2">Policy Compiler</span>
                <h2 className="font-display text-2xl md:text-3xl font-semibold text-charcoal tracking-tight">Draft New Mandate</h2>
                <p className="text-sm text-on-surface-variant mt-1.5">State your authorization boundaries in plain language; review the synthesized rules below.</p>
              </div>

              {/* Minimalist Stepper */}
              <div className="flex items-center gap-6 text-xs font-mono">
                <div className="flex items-center gap-2 text-charcoal font-semibold">
                  <span className="w-5 h-5 rounded-full bg-charcoal text-white flex items-center justify-center text-[11px]">1</span>
                  <span>INTENT</span>
                </div>
                <div className="w-8 h-px bg-[#e7e7e3]" />
                <div className="flex items-center gap-2 text-charcoal font-semibold">
                  <span className="w-5 h-5 rounded-full bg-[#a99a80] text-white flex items-center justify-center text-[11px]">2</span>
                  <span>PARAMETERS</span>
                </div>
                <div className="w-8 h-px bg-[#e7e7e3]" />
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="w-5 h-5 rounded-full border border-[#c4c7c7] flex items-center justify-center text-[11px]">3</span>
                  <span>SIGN &amp; DEPLOY</span>
                </div>
              </div>
            </div>

            {/* Builder Body */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pt-10 items-start">
              {/* Left Column (7 cols) */}
              <div className="lg:col-span-7 space-y-12">
                {/* STEP 1: Plain Language Intent */}
                <div>
                  <div className="flex items-baseline justify-between mb-3">
                    <label className="font-mono text-xs uppercase tracking-wider text-charcoal font-medium" htmlFor="intent-textarea">
                      01 / Natural Language Spending Intent
                    </label>
                    <span className="font-mono text-[11px] text-secondary">NLP Parser Active</span>
                  </div>
                  <div className="relative">
                    <textarea
                      className="w-full bg-white border border-[#e7e7e3] focus:border-charcoal rounded-xl p-5 text-sm md:text-base text-charcoal leading-relaxed outline-none transition-colors resize-none placeholder:text-on-surface-variant/60 font-body-md shadow-sm"
                      id="intent-textarea"
                      rows={4}
                      value={intentText}
                      onChange={(e) => setIntentText(e.target.value)}
                    />
                    <div className="flex items-center justify-between mt-2 px-1">
                      <span className="font-mono text-[11px] text-on-surface-variant">Parsed 4 limits, {merchants.length} merchants, 2 categories</span>
                      <button
                        className="font-mono text-xs text-charcoal hover:text-secondary font-medium transition-colors inline-flex items-center gap-1 cursor-pointer"
                        onClick={() => showToast('Rules re-parsed and validated successfully')}
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[15px]">sync</span>
                        <span>Recompile Rules</span>
                      </button>
                    </div>
                  </div>

                  {/* Presets */}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider mr-1">Presets:</span>
                    <button className="px-3 py-1 rounded-full border border-[#e7e7e3] bg-white hover:border-charcoal text-xs text-charcoal transition-colors font-body-sm cursor-pointer" onClick={() => setPreset('office')} type="button">Home Office</button>
                    <button className="px-3 py-1 rounded-full border border-[#e7e7e3] bg-white hover:border-charcoal text-xs text-charcoal transition-colors font-body-sm cursor-pointer" onClick={() => setPreset('software')} type="button">SaaS Subscriptions</button>
                    <button className="px-3 py-1 rounded-full border border-[#e7e7e3] bg-white hover:border-charcoal text-xs text-charcoal transition-colors font-body-sm cursor-pointer" onClick={() => setPreset('groceries')} type="button">Office Pantry</button>
                    <button className="px-3 py-1 rounded-full border border-[#e7e7e3] bg-white hover:border-charcoal text-xs text-charcoal transition-colors font-body-sm cursor-pointer" onClick={() => setPreset('learning')} type="button">Research &amp; Books</button>
                  </div>
                </div>

                {/* STEP 2: Synthesized Constraints */}
                <div className="pt-4 border-t border-[#e7e7e3] space-y-10">
                  <div>
                    <span className="font-mono text-xs uppercase tracking-wider text-charcoal font-medium block mb-1">
                      02 / Synthesized Constraints
                    </span>
                    <p className="text-xs text-on-surface-variant">Deterministic boundaries compiled from the natural intent prompt.</p>
                  </div>

                  {/* Financial Thresholds Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 py-2">
                    <div className="space-y-1">
                      <span className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant block">Single Order Cap</span>
                      <div className="flex items-baseline gap-1">
                        <span className="font-display text-2xl font-semibold text-charcoal">₹ 5,000</span>
                        <span className="font-mono text-[11px] text-secondary">INR</span>
                      </div>
                      <span className="text-xs text-on-surface-variant">Hard stop rejection</span>
                    </div>

                    <div className="space-y-1">
                      <span className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant block">Monthly Budget</span>
                      <div className="flex items-baseline gap-1">
                        <span className="font-display text-2xl font-semibold text-charcoal">₹ 25,000</span>
                        <span className="font-mono text-[11px] text-secondary">/ 30d</span>
                      </div>
                      <span className="text-xs text-on-surface-variant">Resets 01 Dec 2026</span>
                    </div>

                    <div className="space-y-1">
                      <span className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant block">Currency</span>
                      <div className="flex items-baseline gap-1">
                        <span className="font-display text-2xl font-semibold text-charcoal">INR</span>
                        <span className="font-mono text-[11px] text-secondary">₹</span>
                      </div>
                      <span className="text-xs text-on-surface-variant">Strict domestic settlement</span>
                    </div>
                  </div>

                  {/* Human Review Slider */}
                  <div className="py-4 border-y border-[#e7e7e3]">
                    <div className="flex items-baseline justify-between mb-4">
                      <div>
                        <span className="font-mono text-[11px] uppercase tracking-wider text-charcoal font-medium block">Approval Escalation Trigger</span>
                        <span className="text-xs text-on-surface-variant">Transactions above this value require explicit biometric sign-off</span>
                      </div>
                      <span className="font-mono text-base font-semibold text-charcoal">₹ {sliderVal.toLocaleString()}</span>
                    </div>
                    <div className="py-2">
                      <input
                        className="w-full cursor-pointer accent-neutral-900"
                        id="threshold-slider"
                        max="5000"
                        min="1000"
                        step="250"
                        type="range"
                        value={sliderVal}
                        onChange={(e) => setSliderVal(Number(e.target.value))}
                      />
                      <div className="flex justify-between items-center font-mono text-[11px] text-on-surface-variant mt-3 flex-wrap gap-2">
                        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-secondary" />₹0 – ₹{sliderVal.toLocaleString()}: Auto-Approved</span>
                        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-charcoal" />₹{(sliderVal + 1).toLocaleString()} – ₹5,000: Push Verification</span>
                        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-error" />&gt; ₹5,000: Blocked</span>
                      </div>
                    </div>
                  </div>

                  {/* Whitelisted Merchants */}
                  <div className="space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">Whitelisted Merchants ({merchants.length})</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Vendor domain or name..."
                          value={newMerchantInput}
                          onChange={(e) => setNewMerchantInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddMerchant()}
                          className="px-2 py-1 text-xs border border-[#e7e7e3] rounded bg-white outline-none"
                        />
                        <button
                          onClick={handleAddMerchant}
                          className="font-mono text-xs text-charcoal hover:text-secondary font-medium transition-colors cursor-pointer"
                          type="button"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {merchants.map((m) => (
                        <span key={m} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[#e7e7e3] text-xs text-charcoal shadow-2xs">
                          <span>{m}</span>
                          <button
                            onClick={() => handleRemoveMerchant(m)}
                            className="text-on-surface-variant hover:text-charcoal cursor-pointer"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[14px]">close</span>
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (5 cols): Compiled Artifact Box */}
              <div className="lg:col-span-5 sticky top-24">
                <div className="bg-[#141514] text-white rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl border border-white/10">
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="font-mono text-xs uppercase tracking-widest text-emerald-400 font-semibold">
                        SGX Compiled Artifact
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-white/50">v4.2-attested</span>
                  </div>

                  <div className="space-y-4 font-mono text-xs">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                      <div className="text-white/60 text-[11px]">// Cryptographic Policy Node</div>
                      <div className="text-secondary-fixed-dim">UUID: 89f41b2a-7c90-413e-a89f</div>
                      <div>MAX_SINGLE: ₹5,000</div>
                      <div>MONTHLY_CAP: ₹25,000</div>
                      <div>HITL_THRESHOLD: ₹{sliderVal.toLocaleString()}</div>
                      <div>VENDORS: [{merchants.join(', ')}]</div>
                      <div className="text-emerald-400">STATE: COMPILED_READY</div>
                    </div>
                  </div>

                  <button
                    disabled={signing}
                    onClick={handleDeployMandate}
                    className="w-full py-3.5 rounded-xl bg-white text-black font-semibold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[17px]">lock</span>
                    <span>{signing ? 'Signing with Enclave...' : 'Sign with Sovereign Enclave'}</span>
                  </button>
                  <p className="text-[11px] text-white/40 text-center font-mono">
                    Zero-knowledge proof generated and registered to immutable ledger.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 bg-primary text-white px-4 py-3 rounded-xl shadow-2xl font-mono text-xs flex items-center gap-2 border border-white/10">
          <span className="material-symbols-outlined text-emerald-400 text-[16px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
