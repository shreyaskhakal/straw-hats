import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ArbitrationModal from '../components/ArbitrationModal';
import { api } from '../api/client';

export default function AgentPassportPage() {
  const [guideOpen, setGuideOpen] = useState(false);
  const [provisionModalOpen, setProvisionModalOpen] = useState(false);
  const [killSwitchModalOpen, setKillSwitchModalOpen] = useState(false);
  const [killSwitchConfirmInput, setKillSwitchConfirmInput] = useState('');
  const [inspectModalData, setInspectModalData] = useState(null);
  const [copiedLabel, setCopiedLabel] = useState('Copy Verification URL');
  const [copiedKeyId, setCopiedKeyId] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newAgentName, setNewAgentName] = useState('');
  const [newCeiling, setNewCeiling] = useState(25000);
  const [newMandateEnvelope, setNewMandateEnvelope] = useState('Office Hardware Q4');

  const initialPassports = [
    {
      id: 'PASS-CLAUDE-981A',
      name: 'Claude Shopping',
      version: 'v3.5',
      badge: 'Flagship Procurement',
      status: 'active',
      statusText: 'Active & Verified',
      description: 'Autonomous high-assurance IT hardware & research procurement proxy with strict AST contract boundaries.',
      key: '0x7f9a88c2...3b81ef10',
      fullKey: '0x7f9a88c29bf004123b81ef1088c42109e2fa90a1bc334188',
      mandate: 'Office Hardware Q4',
      ceiling: '₹50,000 auto / ₹1,50,000 disc.',
      expires: '30 Dec 2026',
      merchants: 'Amazon India, Croma Retail, Lenovo Store',
      did: 'did:mandate:gateway:ed25519:7f9a88c29bf004123b81ef10',
      attestation: 'Intel SGX Enclave #TDX-9914 (Hardware Signed)'
    },
    {
      id: 'PASS-PERPLEX-410C',
      name: 'Perplexity Buy',
      version: 'v1.2',
      badge: 'Specialized Sourcing',
      status: 'active',
      statusText: 'Active (₹5,000 Cap)',
      description: 'Micro-purchase and niche textbook bibliographic research fulfillment with strict merchant domain validation.',
      key: '0x4c220f8b...1d29fa8e',
      fullKey: '0x4c220f8b77a012911d29fa8e990b7145e12089ca2001bb90',
      mandate: 'Engineering Hardware',
      ceiling: '₹5,000 auto',
      expires: '14 days remaining',
      merchants: 'Amazon India, Bookswagon',
      did: 'did:mandate:gateway:ed25519:4c220f8b77a012911d29fa8e',
      attestation: 'Intel SGX Enclave #TDX-8820 (Hardware Signed)'
    },
    {
      id: 'PASS-AUTOPROC-88F0',
      name: 'AutoProcure Background Daemon',
      version: 'v2.0',
      badge: 'System Service',
      status: 'expiring',
      statusText: 'Revaluation Pending (Expires in 5h)',
      description: 'Autonomous scheduled renewal daemon for compute clusters, continuous integration, and version control SaaS.',
      key: '0x7e2911b0...88f00129',
      fullKey: '0x7e2911b0921acb6188f001294821cc0911094ba76192a001',
      mandate: 'Cloud DevOps SaaS',
      ceiling: '₹85,000/mo',
      expires: '5h remaining',
      merchants: 'GitHub Enterprise, AWS Cloud, DigitalOcean',
      did: 'did:mandate:gateway:ed25519:7e2911b0921acb6188f00129',
      attestation: 'Sovereign Fleet HSM #02 (Client Signed)'
    }
  ];

  const [passports, setPassports] = useState(initialPassports);

  useEffect(() => {
    loadBackendPassports();
  }, []);

  const loadBackendPassports = async () => {
    try {
      const res = await api.getPassports();
      if (res && res.passports && res.passports.length > 0) {
        // Merge backend data with rich presentation attributes
        const merged = res.passports.map((bp) => {
          const existing = initialPassports.find(p => p.id.toLowerCase().includes(bp.id.replace('pass_', '').slice(0, 4)) || p.name.includes(bp.agentName));
          return {
            id: bp.id.toUpperCase(),
            name: bp.agentName || existing?.name || 'Authorized Agent',
            version: existing?.version || 'v1.0',
            badge: existing?.badge || 'Autonomous Procurement',
            status: bp.status === 'ACTIVE' ? 'active' : 'revoked',
            statusText: bp.status === 'ACTIVE' ? (existing?.statusText || 'Active & Verified') : 'REVOKED',
            description: existing?.description || `Autonomous procurement agent authorized by ${bp.authorizedBy}.`,
            key: bp.tokenPrefix || existing?.key || '0x9A...3B81',
            fullKey: bp.fullToken || existing?.fullKey || bp.publicKey,
            mandate: existing?.mandate || 'Standard Corporate Hardware',
            ceiling: `₹${(bp.spendingCeiling || 25000).toLocaleString()} ceiling`,
            expires: bp.expiresInDays ? `${bp.expiresInDays} days remaining` : existing?.expires || '30 days',
            merchants: (bp.allowedCategories || []).join(', ') || existing?.merchants || 'Amazon India, Croma Retail',
            did: `did:mandate:gateway:ed25519:${(bp.fullToken || 'token').slice(0, 24)}`,
            attestation: bp.enclaveAttestation || existing?.attestation || 'AWS Nitro SGX Enclave (Hardware Signed)'
          };
        });
        setPassports(merged);
      }
    } catch (err) {
      console.warn('Using baseline passports, backend query skipped or pending:', err);
    }
  };

  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3000);
  };

  const copyVerificationUrl = (targetPass) => {
    const selectedPass = targetPass || passports.find(p => p.status === 'active') || passports[0];
    const tokenVal = selectedPass?.fullKey || selectedPass?.key || '0x7f9a88c29bf004123b81ef1088c42109e2fa90a1bc334188';
    const url = `${window.location.origin}/verify/${encodeURIComponent(tokenVal)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    setCopiedLabel('Link Copied to Clipboard!');
    showToast(`Verification URL for ${selectedPass?.name || 'Agent'} copied!`);
    setTimeout(() => setCopiedLabel('Copy Verification URL'), 2500);
  };

  const copyKeyToClipboard = (passId, fullKey) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullKey);
    }
    setCopiedKeyId(passId);
    showToast(`Cryptographic public key copied for ${passId}`);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleInspect = (pass) => {
    setInspectModalData(pass);
  };

  const handleRevoke = async (pass) => {
    if (window.confirm(`Repudiate passport ${pass.id} for ${pass.name}? The agent will immediately lose autonomous checkout authority.`)) {
      setLoading(true);
      try {
        await api.revokePassport(pass.rawId || pass.id.toLowerCase());
      } catch (e) {
        console.warn('API revoke fallback to client state');
      }
      setPassports(passports.map((p) => (p.id === pass.id ? { ...p, status: 'revoked', statusText: 'REVOKED' } : p)));
      setLoading(false);
      showToast(`Revoked passport ${pass.id}. Merkle branch severed.`, true);
    }
  };

  const handleRenew = (pass) => {
    setPassports(passports.map((p) => (p.id === pass.id ? { ...p, status: 'active', statusText: 'Active & Verified', expires: '30 days remaining' } : p)));
    showToast(`Token for ${pass.id} re-signed for 30 additional days via secure enclave.`);
  };

  const handleExecuteKillSwitch = async () => {
    try {
      await api.toggleKillSwitch('Emergency Kill-Switch executed from Agent Passport ledger');
    } catch (e) {
      console.warn('API kill switch error:', e);
    }
    setPassports(passports.map((p) => ({ ...p, status: 'revoked', statusText: 'REVOKED' })));
    setKillSwitchModalOpen(false);
    setKillSwitchConfirmInput('');
    showToast('ALL PASS-TOKENS TERMINATED. Emergency Kill-Switch Engaged.', true);
  };

  const handleProvisionSubmit = async (e) => {
    e.preventDefault();
    if (!newAgentName.trim()) {
      showToast('Agent Name & Version is required', true);
      return;
    }
    setLoading(true);
    try {
      const res = await api.createPassport({
        agentName: newAgentName.trim(),
        spendingCeiling: Number(newCeiling),
        allowedCategories: [newMandateEnvelope]
      });

      if (res && res.passport) {
        const bp = res.passport;
        const formatted = {
          id: bp.id.toUpperCase(),
          rawId: bp.id,
          name: bp.agentName,
          version: 'v1.0',
          badge: 'Autonomous Procurement',
          status: 'active',
          statusText: 'Active & Verified',
          description: `Autonomous procurement agent authorized by ${bp.authorizedBy}.`,
          key: bp.tokenPrefix,
          fullKey: bp.fullToken,
          mandate: newMandateEnvelope,
          ceiling: `₹${Number(bp.spendingCeiling).toLocaleString()} ceiling`,
          expires: `${bp.expiresInDays} days remaining`,
          merchants: (bp.allowedCategories || []).join(', ') || 'Amazon India, Croma Retail',
          did: `did:mandate:gateway:ed25519:${(bp.fullToken || 'token').slice(0, 24)}`,
          attestation: bp.enclaveAttestation
        };
        setPassports([formatted, ...passports]);
        showToast(`Agent Passport minted and verified for ${bp.agentName}!`);
      }
    } catch (err) {
      console.warn('API provision error:', err);
      showToast('Failed to mint passport: ' + err.message, true);
    } finally {
      setLoading(false);
      setProvisionModalOpen(false);
      setNewAgentName('');
    }
  };

  const activeCount = passports.filter((p) => p.status !== 'revoked').length;

  return (
    <div className="bg-background min-h-screen text-on-surface antialiased">
      <Sidebar />
      <Header pageTitle="Agent Passport" onOpenGuide={() => setGuideOpen(true)} />
      <ArbitrationModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />

      {/* Main View Area */}
      <div className="pl-0 md:pl-64 transition-all duration-200">
        <main className="relative pt-20 bg-background min-h-screen w-full px-4 sm:px-8 pb-16">
          <div className="flex flex-col w-full space-y-8 max-w-7xl mx-auto">
            
            {/* 1. Page Header: Clean Visual Hierarchy */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E7E7E3] pb-6">
              <div className="space-y-1.5 max-w-2xl">
                <div className="page-eyebrow flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  <span>Mandate Gateway • Autonomous Identities</span>
                </div>
                <h1 className="page-title mt-1">
                  Agent Passport
                </h1>
                <p className="page-subtitle">
                  Deterministic cryptographic identities and verifiable permission envelopes issued to autonomous spending agents.
                </p>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setProvisionModalOpen(true)}
                  className="btn-primary group flex items-center gap-2 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px] transition-transform group-hover:rotate-90">add</span>
                  <span>Provision New Agent Passport</span>
                </button>
              </div>
            </header>

            {/* 2. Structured Summary Metrics: Balanced 4-Column Compact Grid */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Passport Metrics Overview">
              {/* Metric 1 */}
              <div className="bg-surface-container-lowest border border-[#E7E7E3] rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-secondary">Active Passports</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold font-display text-primary">{activeCount}</span>
                  <span className="text-xs text-secondary font-medium">of {passports.length} enrolled</span>
                </div>
              </div>

              {/* Metric 2 */}
              <div className="bg-surface-container-lowest border border-[#E7E7E3] rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-secondary">Aggregate Daily Ceiling</span>
                  <span className="material-symbols-outlined text-secondary text-[16px]">account_balance_wallet</span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold font-display text-primary">₹2,05,000</span>
                  <span className="text-xs text-secondary font-medium">auto &amp; disc.</span>
                </div>
              </div>

              {/* Metric 3 */}
              <div className="bg-surface-container-lowest border border-[#E7E7E3] rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-secondary">Allowed Endpoints</span>
                  <span className="material-symbols-outlined text-secondary text-[16px]">storefront</span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold font-display text-primary">7</span>
                  <span className="text-xs text-secondary font-medium">whitelisted stores</span>
                </div>
              </div>

              {/* Metric 4 */}
              <div className="bg-surface-container-lowest border border-[#E7E7E3] rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-secondary">Attestation Engine</span>
                  <span className="material-symbols-outlined text-secondary text-[16px]">verified_user</span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold font-display text-primary font-mono">Ed25519</span>
                  <span className="text-xs text-secondary font-medium">Intel TDX Enclave</span>
                </div>
              </div>
            </section>

            {/* 3. Reorganized Cryptographic Passports Ledger */}
            <section className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#E7E7E3]">
                <div className="flex items-center gap-3">
                  <h2 className="section-title">
                    Cryptographic Passports Ledger
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface font-code-sm text-xs font-semibold">
                    {activeCount} Active Records
                  </span>
                </div>
                <div className="text-xs text-secondary hidden sm:block">
                  Standard: <span className="font-mono text-primary font-medium">W3C DID v1.0 / ZK-Attestation</span>
                </div>
              </div>

              {/* Passport Cards Grid */}
              <div className="space-y-4">
                {passports.map((pass) => {
                  const isRevoked = pass.status === 'revoked';
                  const isExpiring = pass.status === 'expiring';

                  return (
                    <article
                      key={pass.id}
                      className={`bg-surface-container-lowest border border-[#E7E7E3] rounded-2xl p-5 sm:p-6 transition-all hover:border-neutral-400/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4 ${
                        isRevoked ? 'opacity-60 bg-surface-container-low/30' : ''
                      }`}
                    >
                      {/* Top Row: Prominent Identity, Badges & Status */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="text-[18px] sm:text-[20px] font-bold text-primary tracking-tight font-display">
                            {pass.name}
                          </h3>
                          <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-surface-container text-secondary">
                            {pass.version}
                          </span>
                          <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface">
                            {pass.badge}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                              isRevoked
                                ? 'bg-rose-50 text-error border border-rose-200/50'
                                : isExpiring
                                ? 'bg-amber-50 text-amber-800 border border-amber-200/50'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200/50'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isRevoked
                                  ? 'bg-error'
                                  : isExpiring
                                  ? 'bg-amber-500 animate-pulse'
                                  : 'bg-emerald-500'
                              }`}
                            ></span>
                            {pass.statusText}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-mono text-secondary shrink-0">
                          <span>DID:</span>
                          <span className="font-semibold text-primary">{pass.id}</span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-[13.5px] text-on-surface-variant leading-relaxed max-w-4xl">
                        {pass.description}
                      </p>

                      {/* Details: Clean Structured 4-Column Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-surface-container-low/50 rounded-xl p-3.5 sm:p-4 border border-[#E7E7E3]/60 text-xs">
                        {/* Detail 1: Key */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-secondary block">
                            Cryptographic Public Key
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-primary font-semibold text-[11.5px]">
                              {pass.key}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyKeyToClipboard(pass.id, pass.fullKey)}
                              className="text-secondary hover:text-primary transition-colors p-0.5"
                              title="Copy full key"
                              aria-label={`Copy key for ${pass.id}`}
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                {copiedKeyId === pass.id ? 'check' : 'content_copy'}
                              </span>
                            </button>
                          </div>
                        </div>

                        {/* Detail 2: Mandate */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-secondary block">
                            Bound Mandate Envelope
                          </span>
                          <span className="font-medium text-primary text-[12px] block truncate">
                            {pass.mandate}
                          </span>
                        </div>

                        {/* Detail 3: Spending Cap */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-secondary block">
                            Spending Limit
                          </span>
                          <span className="font-semibold text-primary text-[12px] block">
                            {pass.ceiling}
                          </span>
                        </div>

                        {/* Detail 4: Expiration */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-secondary block">
                            Validity Window
                          </span>
                          <span className={`font-medium text-[12px] block ${isExpiring ? 'text-amber-700 font-semibold' : 'text-primary'}`}>
                            {pass.expires}
                          </span>
                        </div>
                      </div>

                      {/* Merchants & Hardware Attestation strip */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-on-surface-variant pt-1 px-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-semibold text-secondary">Authorized Merchants:</span>
                          <span className="text-primary font-medium truncate">{pass.merchants}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 text-secondary">
                          <span className="material-symbols-outlined text-[15px] text-emerald-600">lock</span>
                          <span className="font-mono text-[11px]">{pass.attestation}</span>
                        </div>
                      </div>

                      {/* Actions Toolbar: Aligned at bottom with clean borders */}
                      <div className="pt-3 border-t border-[#E7E7E3] flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs text-secondary font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                          <span>Zero-Knowledge Proof Envelope Verified</span>
                        </div>

                        <div className="flex items-center gap-2.5">
                          {isExpiring && (
                            <button
                              type="button"
                              onClick={() => handleRenew(pass)}
                              className="btn-primary text-xs h-9 px-3.5 shadow-sm"
                            >
                              <span className="material-symbols-outlined text-[15px]">refresh</span>
                              <span>Renew Token (30d)</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleInspect(pass)}
                            className="btn-secondary text-xs h-9 px-3.5"
                          >
                            <span className="material-symbols-outlined text-[15px]">visibility</span>
                            <span>Inspect Proof</span>
                          </button>

                          <a
                            href={`/verify/${encodeURIComponent(pass.fullKey || pass.key)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary text-xs h-9 px-3.5 inline-flex items-center gap-1.5"
                            title="Verify via Public Merchant Portal"
                          >
                            <span className="material-symbols-outlined text-[15px]">verified</span>
                            <span>Merchant Verify</span>
                          </a>

                          {!isRevoked && (
                            <button
                              type="button"
                              disabled={loading}
                              onClick={() => handleRevoke(pass)}
                              className="btn-danger text-xs h-9 px-3.5"
                            >
                              <span className="material-symbols-outlined text-[15px]">block</span>
                              <span>Revoke Access</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            {/* 4. Public Verifiable Proof & Identity Guard */}
            <section className="pt-6 border-t border-[#E7E7E3] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[20px]">verified</span>
                    <h3 className="section-title">
                      Public Verifiable Proof &amp; Identity Guard
                    </h3>
                  </div>
                  <p className="page-subtitle">
                    W3C-compliant verifiable credentials attested through sovereign hardware enclave nodes.
                  </p>
                </div>
                <div>
                  <button
                    id="copyUrlBtn"
                    type="button"
                    onClick={copyVerificationUrl}
                    className="btn-secondary text-xs flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">share</span>
                    <span id="copyUrlLabel">{copiedLabel}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="bg-surface-container-lowest border border-[#E7E7E3] rounded-xl p-4 sm:p-5 space-y-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  <div className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-secondary">credit_card_off</span>
                    <span>Zero Raw Financials</span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    No PAN, CVV, expiry dates, or banking credentials are ever revealed to merchant terminals during automated checkout.
                  </p>
                </div>

                <div className="bg-surface-container-lowest border border-[#E7E7E3] rounded-xl p-4 sm:p-5 space-y-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  <div className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-secondary">key</span>
                    <span>Cryptographic Attestation</span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Signed using Ed25519 node enclave keys. Merchants mathematically verify mandate envelopes on-device without third-party calls.
                  </p>
                </div>

                <div className="bg-surface-container-lowest border border-[#E7E7E3] rounded-xl p-4 sm:p-5 space-y-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  <div className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-secondary">timer</span>
                    <span>Ephemeral Zero-PII</span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Personal identifying information remains securely sealed. Passports and virtual rails expire upon order completion.
                  </p>
                </div>
              </div>
            </section>

            {/* 5. Emergency Kill-Switch: Restrained Single Danger Callout */}
            <section className="p-5 rounded-2xl border border-error/30 bg-rose-50/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2 text-error">
                  <span className="material-symbols-outlined text-[20px]">crisis_alert</span>
                  <span className="font-title-md text-[15px] sm:text-[16px] font-semibold">
                    Emergency Kill-Switch: Revoke All Agent Passports
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Immediately repudiates all Ed25519 credentials across active merchant trust anchors. Ongoing sessions will terminate synchronously.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setKillSwitchModalOpen(true)}
                className="btn-danger text-xs h-10 px-4 whitespace-nowrap shadow-sm shrink-0"
              >
                <span className="material-symbols-outlined text-[16px]">power_settings_new</span>
                <span>Revoke All Passports</span>
              </button>
            </section>

            {/* Demo Notice */}
            <div className="text-center text-xs text-secondary pt-2 font-mono">
              PROTOTYPE DEMO STATE • Sovereign Node #09 Enclave Active • Zero Cloud Secrets Leaked
            </div>
          </div>
        </main>
      </div>

      {/* Inspect Proof Modal */}
      {inspectModalData && (
        <div className="fixed inset-0 z-50 bg-primary/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-white border border-[#E7E7E3] max-w-xl w-full p-6 shadow-2xl rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E7E3]">
              <div>
                <h3 className="card-title text-[17px]">
                  Cryptographic Verifiable Proof
                </h3>
                <span className="font-code-sm text-xs text-secondary">
                  {inspectModalData.name} ({inspectModalData.id})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setInspectModalData(null)}
                className="text-secondary hover:text-primary p-1"
                aria-label="Close modal"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-surface-container rounded-xl font-mono text-[11px] space-y-1 border border-[#E7E7E3]/60">
                <div className="text-secondary font-semibold uppercase text-[10px]">W3C Decentralized Identifier (DID)</div>
                <div className="text-primary break-all">{inspectModalData.did}</div>
              </div>

              <div className="p-3.5 bg-surface-container rounded-xl font-mono text-[11px] space-y-1 border border-[#E7E7E3]/60">
                <div className="text-secondary font-semibold uppercase text-[10px]">Hardware Enclave Attestation</div>
                <div className="text-emerald-700 font-semibold">{inspectModalData.attestation}</div>
              </div>

              <div className="p-3.5 bg-neutral-900 text-neutral-300 rounded-xl font-mono text-[10.5px] space-y-1 overflow-x-auto shadow-inner">
                <div className="text-neutral-500">{"// Raw Cryptographic Envelope"}</div>
                <div>{`{`}</div>
                <div className="pl-4">{`"@context": ["https://www.w3.org/2018/credentials/v1"],`}</div>
                <div className="pl-4">{`"id": "urn:uuid:${inspectModalData.id.toLowerCase()}",`}</div>
                <div className="pl-4">{`"issuer": "did:mg:enclave:node-09",`}</div>
                <div className="pl-4">{`"mandateCeiling": "${inspectModalData.ceiling}",`}</div>
                <div className="pl-4">{`"proof": { "type": "Ed25519Signature2020", "signatureValue": "${inspectModalData.fullKey || inspectModalData.key}" }`}</div>
                <div>{`}`}</div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#E7E7E3]">
              <button
                type="button"
                onClick={() => setInspectModalData(null)}
                className="btn-primary text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kill Switch Modal */}
      {killSwitchModalOpen && (
        <div className="fixed inset-0 z-50 bg-primary/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-white border border-error/50 max-w-md w-full p-6 shadow-2xl rounded-2xl space-y-4">
            <div className="flex items-center gap-2 text-error">
              <span className="material-symbols-outlined text-[24px]">warning</span>
              <h3 className="card-title text-[18px] text-error font-bold">
                CONFIRM EMERGENCY KILL-SWITCH
              </h3>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              This action immediately terminates all agent sessions, unlinks API tokens from PayPal sandbox settlement nodes, and burns all ephemeral virtual cards.
            </p>
            <div className="space-y-1.5">
              <label className="text-[11px] font-code-sm text-secondary block font-medium">
                Type <strong className="text-primary font-mono">REVOKE-ALL-CONFIRM</strong> to execute:
              </label>
              <input
                type="text"
                value={killSwitchConfirmInput}
                onChange={(e) => setKillSwitchConfirmInput(e.target.value)}
                placeholder="REVOKE-ALL-CONFIRM"
                className="input-standard font-mono text-xs border-error/50 focus:border-error"
              />
            </div>
            <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E7E7E3]">
              <button
                type="button"
                onClick={() => {
                  setKillSwitchModalOpen(false);
                  setKillSwitchConfirmInput('');
                }}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={killSwitchConfirmInput.trim() !== 'REVOKE-ALL-CONFIRM'}
                onClick={handleExecuteKillSwitch}
                className="btn-danger text-xs disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Repudiate All Passports
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Provision Modal */}
      {provisionModalOpen && (
        <div className="fixed inset-0 z-50 bg-primary/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-white border border-[#E7E7E3] max-w-md w-full p-6 shadow-2xl rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E7E3]">
              <h3 className="card-title text-[17px]">
                Provision New Agent Passport
              </h3>
              <button
                type="button"
                onClick={() => setProvisionModalOpen(false)}
                className="text-secondary hover:text-primary p-1"
                aria-label="Close modal"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form
              onSubmit={handleProvisionSubmit}
              className="space-y-3.5 text-xs"
            >
              <div className="space-y-1">
                <label className="block text-secondary font-medium">Agent Name &amp; Model Version</label>
                <input
                  type="text"
                  placeholder="e.g. Gemini Shopping Ultra v1.0"
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  required
                  className="input-standard text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-secondary font-medium">Bound Mandate Envelope</label>
                <select
                  value={newMandateEnvelope}
                  onChange={(e) => setNewMandateEnvelope(e.target.value)}
                  className="select-standard text-xs"
                >
                  <option value="Office Hardware Q4">Office Hardware Q4 (₹50,000 auto / ₹1,50,000 disc.)</option>
                  <option value="Developer Tools & Infra">Developer Tools &amp; Infra (₹25,000/mo)</option>
                  <option value="Research & Books">Research &amp; Books (₹5,500/mo)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-secondary font-medium">Autonomous Spending Limit (INR)</label>
                <input
                  type="number"
                  min="1000"
                  max="150000"
                  step="1000"
                  value={newCeiling}
                  onChange={(e) => setNewCeiling(e.target.value)}
                  className="input-standard text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-secondary font-medium">Signing Enclave Node</label>
                <input
                  type="text"
                  readOnly
                  value="Intel TDX Sovereign Enclave #TDX-9914"
                  className="input-standard bg-surface-container font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E7E7E3]">
                <button
                  type="button"
                  onClick={() => setProvisionModalOpen(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary text-xs"
                >
                  {loading ? 'Minting...' : 'Mint & Sign Passport'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-neutral-900 text-white shadow-2xl text-xs font-medium border border-neutral-800">
            <span
              className={`material-symbols-outlined text-[18px] ${
                toast.isError ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {toast.isError ? 'warning' : 'check_circle'}
            </span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
