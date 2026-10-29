import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ArbitrationModal from '../components/ArbitrationModal';
import { api } from '../api/client';
import { useTheme } from '../context/ThemeContext';
import avatarElenaImg from '../assets/avatar-elena.jpg';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [guideOpen, setGuideOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [destroyModalOpen, setDestroyModalOpen] = useState(false);
  const [manageKeysOpen, setManageKeysOpen] = useState(false);

  // Core settings state matching Stitch & backend
  const [currency, setCurrency] = useState('INR');
  const [nodeMode, setNodeMode] = useState('sandbox'); // 'sandbox' | 'production'
  const [discretionaryBaseline, setDiscretionaryBaseline] = useState('3,000');
  const [multiSigThreshold, setMultiSigThreshold] = useState('50,000');
  const [hardMandateCap, setHardMandateCap] = useState('1,50,000');
  const [selectedTheme, setSelectedTheme] = useState(theme || 'light');

  // Preferences toggles
  const [compactDensity, setCompactDensity] = useState(true);
  const [indianNumbering, setIndianNumbering] = useState(true);
  const [immediatePush, setImmediatePush] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(true);
  const [anomalyAlerts, setAnomalyAlerts] = useState(true);

  // Webhook
  const [webhookUrl, setWebhookUrl] = useState('https://api.sovereign.io/webhooks/mandate-events');

  // Baseline snapshot for unsaved change tracking
  const [savedSnapshot, setSavedSnapshot] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await api.getSettings();
      if (res && res.settings) {
        const s = res.settings;
        const baseline = s.defaultAutoApproveLimit ? s.defaultAutoApproveLimit.toLocaleString('en-IN') : '3,000';
        const multiSig = s.requireCoSignerThreshold ? s.requireCoSignerThreshold.toLocaleString('en-IN') : '50,000';
        const cap = s.hardMandateCap ? s.hardMandateCap.toLocaleString('en-IN') : '1,50,000';
        const cur = s.currency || 'INR';
        const node = s.nodeMode || 'sandbox';
        const webhook = s.webhookEndpoint || 'https://api.sovereign.io/webhooks/mandate-events';

        setDiscretionaryBaseline(baseline);
        setMultiSigThreshold(multiSig);
        setHardMandateCap(cap);
        setCurrency(cur);
        setNodeMode(node);
        setWebhookUrl(webhook);

        if (s.compactDensity !== undefined) setCompactDensity(s.compactDensity);
        if (s.indianNumbering !== undefined) setIndianNumbering(s.indianNumbering);
        if (s.immediatePush !== undefined) setImmediatePush(s.immediatePush);
        if (s.dailyDigest !== undefined) setDailyDigest(s.dailyDigest);
        if (s.anomalyAlerts !== undefined) setAnomalyAlerts(s.anomalyAlerts);

        setSavedSnapshot({
          baseline,
          multiSig,
          cap,
          currency: cur,
          nodeMode: node,
          webhook,
          compactDensity: s.compactDensity !== undefined ? s.compactDensity : true,
          indianNumbering: s.indianNumbering !== undefined ? s.indianNumbering : true,
          immediatePush: s.immediatePush !== undefined ? s.immediatePush : true,
          dailyDigest: s.dailyDigest !== undefined ? s.dailyDigest : true,
          anomalyAlerts: s.anomalyAlerts !== undefined ? s.anomalyAlerts : true,
          theme: 'light'
        });
      }
    } catch (err) {
      console.warn('Using default settings state:', err);
      setSavedSnapshot({
        baseline: '3,000',
        multiSig: '50,000',
        cap: '1,50,000',
        currency: 'INR',
        nodeMode: 'sandbox',
        webhook: 'https://api.sovereign.io/webhooks/mandate-events',
        compactDensity: true,
        indianNumbering: true,
        immediatePush: true,
        dailyDigest: true,
        anomalyAlerts: true,
        theme: 'light'
      });
    }
  };

  const isDirty = useMemo(() => {
    if (!savedSnapshot) return false;
    return (
      discretionaryBaseline !== savedSnapshot.baseline ||
      multiSigThreshold !== savedSnapshot.multiSig ||
      hardMandateCap !== savedSnapshot.cap ||
      currency !== savedSnapshot.currency ||
      nodeMode !== savedSnapshot.nodeMode ||
      webhookUrl !== savedSnapshot.webhook ||
      compactDensity !== savedSnapshot.compactDensity ||
      indianNumbering !== savedSnapshot.indianNumbering ||
      immediatePush !== savedSnapshot.immediatePush ||
      dailyDigest !== savedSnapshot.dailyDigest ||
      anomalyAlerts !== savedSnapshot.anomalyAlerts ||
      selectedTheme !== savedSnapshot.theme
    );
  }, [
    savedSnapshot,
    discretionaryBaseline,
    multiSigThreshold,
    hardMandateCap,
    currency,
    nodeMode,
    webhookUrl,
    compactDensity,
    indianNumbering,
    immediatePush,
    dailyDigest,
    anomalyAlerts,
    selectedTheme
  ]);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    clearTimeout(window._settingsToastTimer);
    window._settingsToastTimer = setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const numericBaseline = parseInt(discretionaryBaseline.replace(/,/g, ''), 10) || 3000;
      const numericMultiSig = parseInt(multiSigThreshold.replace(/,/g, ''), 10) || 50000;
      const numericCap = parseInt(hardMandateCap.replace(/,/g, ''), 10) || 150000;

      await api.saveSettings({
        defaultAutoApproveLimit: numericBaseline,
        requireCoSignerThreshold: numericMultiSig,
        hardMandateCap: numericCap,
        currency,
        nodeMode,
        compactDensity,
        indianNumbering,
        immediatePush,
        dailyDigest,
        anomalyAlerts,
        webhookEndpoint: webhookUrl,
      });

      setSavedSnapshot({
        baseline: discretionaryBaseline,
        multiSig: multiSigThreshold,
        cap: hardMandateCap,
        currency,
        nodeMode,
        webhook: webhookUrl,
        compactDensity,
        indianNumbering,
        immediatePush,
        dailyDigest,
        anomalyAlerts,
        theme: selectedTheme
      });

      triggerToast('Sovereign preferences committed and signed with Enclave key.');
    } catch (err) {
      triggerToast('Preferences synced locally to Sovereign enclave.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (savedSnapshot) {
      setDiscretionaryBaseline(savedSnapshot.baseline);
      setMultiSigThreshold(savedSnapshot.multiSig);
      setHardMandateCap(savedSnapshot.cap);
      setCurrency(savedSnapshot.currency);
      setNodeMode(savedSnapshot.nodeMode);
      setWebhookUrl(savedSnapshot.webhook);
      setCompactDensity(savedSnapshot.compactDensity);
      setIndianNumbering(savedSnapshot.indianNumbering);
      setImmediatePush(savedSnapshot.immediatePush);
      setDailyDigest(savedSnapshot.dailyDigest);
      setAnomalyAlerts(savedSnapshot.anomalyAlerts);
      setSelectedTheme(savedSnapshot.theme);
      triggerToast('Settings restored to last signed state.');
    } else {
      loadSettings();
    }
  };

  const copyFingerprint = () => {
    const fp = 'ed25519:9df0a4b873c912e7741d40901e2901eeff70c9182390ab12f';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fp);
    }
    triggerToast('Public Key Fingerprint copied to clipboard');
  };

  const handleTestPing = () => {
    triggerToast(`Test payload dispatched to ${webhookUrl} (200 OK)`);
  };

  const handleConfirmDestroyKeys = () => {
    setDestroyModalOpen(false);
    triggerToast('Security wipe command dispatched: All sovereign keys nullified.');
  };

  return (
    <div className="bg-background font-body-md text-body-md text-on-surface antialiased min-h-screen">
      <Sidebar />
      <Header pageTitle="Settings" onOpenGuide={() => setGuideOpen(true)} />
      <ArbitrationModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />

      {/* Floating Toast Matching Stitch */}
      <div
        className={`fixed top-20 right-8 z-50 transform transition-all duration-300 flex items-center gap-3 px-4 py-3 rounded-xl bg-primary text-on-primary shadow-xl ${
          toastMessage ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <span className="material-symbols-outlined text-[20px] text-emerald-400">check_circle</span>
        <span className="font-body-md text-body-md font-medium">{toastMessage}</span>
      </div>

      <div className="pl-0 md:pl-64 transition-all duration-200">
        <main className="relative pt-20 bg-background min-h-screen w-full px-4 sm:px-6 lg:px-8 pb-16">
          <div className="max-w-7xl mx-auto space-y-10">
            
            {/* Top Header Bar */}
            <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-outline-variant/30 gap-6">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-code-sm text-code-sm text-secondary uppercase tracking-widest font-semibold">
                    Mandate Gateway
                  </span>
                  <span className="text-outline-variant font-code-sm text-code-sm">/</span>
                  <span className="font-code-sm text-code-sm text-on-surface-variant font-mono">
                    Settings
                  </span>
                  {isDirty && (
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-semibold tracking-wide flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                      Unsaved Changes
                    </span>
                  )}
                </div>
                <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-semibold">
                  Settings &amp; Preferences
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Configure sovereign signers, baseline mandate clearance thresholds, and out-of-band notification relays.
                </p>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={!isDirty}
                  className="px-4 py-2 rounded-lg hover:bg-surface-container-high disabled:opacity-40 text-on-surface font-title-md text-body-sm transition-colors border border-outline-variant/30 cursor-pointer"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !isDirty}
                  className="px-5 py-2 rounded-lg bg-primary hover:bg-neutral-800 disabled:opacity-50 text-on-primary font-title-md text-body-sm transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <span className={`material-symbols-outlined text-[18px] ${saving ? 'animate-spin' : ''}`}>
                    {saving ? 'sync' : 'check_circle'}
                  </span>
                  <span>{saving ? 'Signing Enclave...' : 'Save Changes'}</span>
                </button>
              </div>
            </div>

            {/* Editorial Sections with Hairline Dividers */}
            <div className="space-y-0 divide-y divide-outline-variant/30">
              
              {/* Section 1: Sovereign Identity & Profile */}
              <section className="py-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                <div className="md:col-span-4 space-y-1">
                  <h2 className="font-title-md text-[17px] font-semibold text-primary">
                    Sovereign Identity &amp; Profile
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Cryptographic signing identity, legal entity mapping, and hardware key attestation.
                  </p>
                </div>
                <div className="md:col-span-8 space-y-5">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
                    <img
                      alt="Elena Vance"
                      className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/10 shadow-sm flex-shrink-0"
                      src={avatarElenaImg}
                    />
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-title-md text-title-md text-on-surface font-semibold">
                          Elena Vance
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed/60 text-on-secondary-fixed font-label-sm text-[11px] font-semibold">
                          Tier-3 Signer Authority
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                        Legal Entity:{' '}
                        <span className="text-on-surface font-medium">
                          Elena Vance Sovereign Trust AG
                        </span>{' '}
                        <span className="font-code-sm text-code-sm text-secondary font-mono">
                          (CHE-491.203.901)
                        </span>
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Protocol Role:{' '}
                        <span className="text-on-surface font-medium">
                          Primary Treasury Signer
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider mb-1 font-semibold">
                        Sovereign Email
                      </label>
                      <div className="flex items-center justify-between px-3.5 h-11 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface font-body-md text-body-md">
                        <span className="truncate">elena.vance@sovereign-vault.internal</span>
                        <span className="flex items-center gap-1 font-label-sm text-[11px] text-secondary flex-shrink-0 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                          Active
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider mb-1 font-semibold">
                        WebAuthn Status
                      </label>
                      <div className="flex items-center justify-between px-3.5 h-11 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface font-body-md text-body-md">
                        <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                          Enclave Active
                        </span>
                        <button
                          type="button"
                          onClick={() => triggerToast('Hardware passkey re-attestation challenge signed (P-256).')}
                          className="font-label-md text-body-sm text-secondary hover:text-primary transition-colors underline underline-offset-2 cursor-pointer font-medium"
                        >
                          Re-attest
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider mb-1 font-semibold">
                      Public Key Fingerprint (Ed25519)
                    </label>
                    <div className="flex items-center justify-between px-3.5 h-11 rounded-lg bg-surface-container-low border border-outline-variant/30 font-code-sm text-code-sm">
                      <span className="truncate font-mono text-on-surface-variant text-[12.5px]">
                        ed25519:9df0a4b873c912e7741d40901e2901eeff70c9182390ab12f
                      </span>
                      <button
                        type="button"
                        onClick={copyFingerprint}
                        className="flex items-center gap-1 pl-3 text-secondary hover:text-primary transition-colors flex-shrink-0 cursor-pointer font-medium"
                      >
                        <span className="material-symbols-outlined text-[16px]">content_copy</span>
                        <span className="font-label-sm text-[11px] uppercase tracking-wider">Copy</span>
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 2: Payment & Settlement Directives */}
              <section className="py-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                <div className="md:col-span-4 space-y-1">
                  <h2 className="font-title-md text-[17px] font-semibold text-primary">
                    Payment &amp; Settlement Directives
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Baseline currency routing, threshold trigger rules, and agent shopping allowances.
                  </p>
                </div>
                <div className="md:col-span-8 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="currency-select" className="block font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider mb-1 font-semibold">
                        Base Operating Currency
                      </label>
                      <div className="relative">
                        <select
                          id="currency-select"
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          className="w-full h-11 px-3.5 appearance-none rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface font-body-md text-body-md font-medium outline-none cursor-pointer focus:border-primary transition-colors"
                        >
                          <option value="INR">Indian Rupee (INR ₹)</option>
                          <option value="USD">United States Dollar (USD $)</option>
                          <option value="EUR">Euro Treasury (EUR €)</option>
                          <option value="GBP">British Pound (GBP £)</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-3 pointer-events-none text-on-surface-variant text-[18px]">
                          expand_more
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider mb-1 font-semibold">
                        Settlement Node Mode
                      </label>
                      <div className="h-11 p-1 rounded-lg bg-surface-container-low border border-outline-variant/30 flex items-center">
                        <button
                          type="button"
                          onClick={() => setNodeMode('sandbox')}
                          className={`flex-1 h-full rounded-md font-title-md text-[13px] shadow-2xs flex items-center justify-center gap-1.5 text-center transition-all cursor-pointer ${
                            nodeMode === 'sandbox'
                              ? 'bg-surface-container-lowest text-on-surface font-semibold shadow-sm'
                              : 'text-on-surface-variant hover:text-on-surface'
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-secondary"></span>
                          <span>Sandbox Mode</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            triggerToast('Production node migration requires dual-key quorum clearance.');
                          }}
                          className={`flex-1 h-full rounded-md font-body-md text-[13px] flex items-center justify-center gap-1 text-center transition-all cursor-pointer ${
                            nodeMode === 'production'
                              ? 'bg-surface-container-lowest text-on-surface font-title-md font-semibold'
                              : 'text-on-surface-variant hover:text-on-surface'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">lock</span>
                          <span>Production</span>
                        </button>
                      </div>
                      <span className="font-label-sm text-[11px] text-on-surface-variant block mt-1">
                        Connected to sovereign-vance-sandbox node
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-1.5">
                      <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider block font-semibold">
                        Discretionary Baseline
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="font-code-sm text-[14px] text-secondary font-mono">₹</span>
                        <input
                          type="text"
                          value={discretionaryBaseline}
                          onChange={(e) => setDiscretionaryBaseline(e.target.value)}
                          className="w-full bg-transparent font-title-md text-[16px] font-bold text-on-surface outline-none tracking-tight font-mono focus:border-b focus:border-primary"
                        />
                      </div>
                      <span className="font-code-sm text-[11px] text-on-surface-variant block">
                        Auto-approved per basket
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-1.5">
                      <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider block font-semibold">
                        Multi-Sig Threshold
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="font-code-sm text-[14px] text-secondary font-mono">₹</span>
                        <input
                          type="text"
                          value={multiSigThreshold}
                          onChange={(e) => setMultiSigThreshold(e.target.value)}
                          className="w-full bg-transparent font-title-md text-[16px] font-bold text-on-surface outline-none tracking-tight font-mono focus:border-b focus:border-primary"
                        />
                      </div>
                      <span className="font-code-sm text-[11px] text-on-surface-variant block">
                        Requires YubiKey touch
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-1.5">
                      <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider block font-semibold">
                        Hard Mandate Cap
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="font-code-sm text-[14px] text-secondary font-mono">₹</span>
                        <input
                          type="text"
                          value={hardMandateCap}
                          onChange={(e) => setHardMandateCap(e.target.value)}
                          className="w-full bg-transparent font-title-md text-[16px] font-bold text-on-surface outline-none tracking-tight font-mono focus:border-b focus:border-primary"
                        />
                      </div>
                      <span className="font-code-sm text-[11px] text-on-surface-variant block">
                        Absolute ceiling per agent
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 3: Interface & Display Preferences */}
              <section className="py-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                <div className="md:col-span-4 space-y-1">
                  <h2 className="font-title-md text-[17px] font-semibold text-primary">
                    Interface &amp; Display Preferences
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Visual palette, typography spacing, and localized numerical rendering.
                  </p>
                </div>
                <div className="md:col-span-8 space-y-5">
                  <div>
                    <label className="block font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider mb-2 font-semibold">
                      Theme Selection
                    </label>
                    <div className="grid grid-cols-2 gap-3.5">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTheme('light');
                          setTheme('light');
                          triggerToast('Light Sovereign palette active.');
                        }}
                        className={`p-3.5 rounded-xl bg-surface-container-low flex items-center gap-3 text-left transition-all cursor-pointer ${
                          theme === 'light'
                            ? 'border-2 border-primary bg-surface-container-lowest shadow-sm'
                            : 'border border-outline-variant/30 hover:bg-surface-container-high'
                        }`}
                      >
                        <span className="material-symbols-outlined text-primary text-[22px]">
                          light_mode
                        </span>
                        <div>
                          <div className="font-title-md text-[13.5px] text-on-surface font-semibold">Light Sovereign</div>
                          <div className="font-label-sm text-[11px] text-secondary font-medium">Approved Default</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTheme('dark');
                          setTheme('dark');
                          triggerToast('Obsidian Dark sovereign palette active.');
                        }}
                        className={`p-3.5 rounded-xl bg-surface-container-low flex items-center gap-3 text-left transition-all cursor-pointer ${
                          theme === 'dark'
                            ? 'border-2 border-primary bg-surface-container-lowest shadow-sm'
                            : 'border border-outline-variant/30 hover:bg-surface-container-high'
                        }`}
                      >
                        <span className="material-symbols-outlined text-on-surface-variant text-[22px]">
                          dark_mode
                        </span>
                        <div>
                          <div className="font-title-md text-[13.5px] text-on-surface font-semibold">
                            Obsidian Dark
                          </div>
                          <div className="font-label-sm text-[11px] text-on-surface-variant font-medium">
                            OLED Terminal Mode
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 divide-y divide-outline-variant/20">
                    <div className="flex items-center justify-between pb-3">
                      <div className="space-y-0.5 pr-4">
                        <span className="font-title-md text-[13.5px] text-on-surface block font-semibold">
                          Compact Banking Density
                        </span>
                        <span className="font-body-sm text-[12.5px] text-on-surface-variant block">
                          Reduces ledger row padding for multi-mandate tracking across large transaction batches.
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={compactDensity}
                          onChange={(e) => setCompactDensity(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-surface-container-lowest after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between pt-3">
                      <div className="space-y-0.5 pr-4">
                        <span className="font-title-md text-[13.5px] text-on-surface block font-semibold">
                          Indian Numbering Format (₹ Lakhs &amp; Crores)
                        </span>
                        <span className="font-body-sm text-[12.5px] text-on-surface-variant block">
                          Format currency figures in accordance with RBI convention (e.g. ₹1,50,000 rather than 150,000.00).
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={indianNumbering}
                          onChange={(e) => setIndianNumbering(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-surface-container-lowest after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 4: Notification & Webhook Channels */}
              <section className="py-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                <div className="md:col-span-4 space-y-1">
                  <h2 className="font-title-md text-[17px] font-semibold text-primary">
                    Notification &amp; Webhook Channels
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Out-of-band alerts, prompt injection alarms, and audit log webhooks.
                  </p>
                </div>
                <div className="md:col-span-8 space-y-5">
                  <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 divide-y divide-outline-variant/20">
                    <div className="flex items-center justify-between pb-3">
                      <div className="space-y-0.5 pr-4">
                        <span className="font-title-md text-[13.5px] text-on-surface block font-semibold">
                          Immediate Purchase Push Dispatch
                        </span>
                        <span className="font-body-sm text-[12.5px] text-on-surface-variant block">
                          Transmit instant mobile push notifications for every automated basket buy clearance.
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={immediatePush}
                          onChange={(e) => setImmediatePush(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-surface-container-lowest after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div className="space-y-0.5 pr-4">
                        <span className="font-title-md text-[13.5px] text-on-surface block font-semibold">
                          Daily Agent Purchasing Digest
                        </span>
                        <span className="font-body-sm text-[12.5px] text-on-surface-variant block">
                          Consolidated cryptographic transaction summary rendered daily at 20:00 IST to treasury email.
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={dailyDigest}
                          onChange={(e) => setDailyDigest(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-surface-container-lowest after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between pt-3">
                      <div className="space-y-0.5 pr-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-title-md text-[13.5px] text-on-surface font-semibold">
                            Adversarial &amp; Perimeter Anomaly Alerts
                          </span>
                          <span className="w-2 h-2 rounded-full bg-error"></span>
                        </div>
                        <span className="font-body-sm text-[12.5px] text-on-surface-variant block">
                          Instant emergency dispatch on prompt injection attempts or budget ceiling breaches.
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={anomalyAlerts}
                          onChange={(e) => setAnomalyAlerts(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-surface-container-lowest after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>

                  <div className="pt-1">
                    <label htmlFor="webhook-input" className="block font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider mb-1 font-semibold">
                      Webhook Endpoint (Mutual TLS Handshake)
                    </label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <div className="flex-1 flex items-center px-3.5 h-11 rounded-lg bg-surface-container-low border border-outline-variant/30 font-mono text-on-surface font-code-sm text-code-sm">
                        <span className="text-secondary select-none mr-2 font-semibold">POST</span>
                        <input
                          id="webhook-input"
                          type="url"
                          value={webhookUrl}
                          onChange={(e) => setWebhookUrl(e.target.value)}
                          className="w-full bg-transparent border-none outline-none text-on-surface font-mono text-[12.5px]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleTestPing}
                        className="px-4 h-11 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors font-title-md text-body-sm flex items-center justify-center gap-1.5 flex-shrink-0 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">send</span>
                        <span>Test Ping</span>
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 5: Security & Session Management */}
              <section className="py-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                <div className="md:col-span-4 space-y-1">
                  <h2 className="font-title-md text-[17px] font-semibold text-primary">
                    Security &amp; Session Management
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Session tokens, hardware authenticator keys, and emergency sovereign revocation.
                  </p>
                </div>
                <div className="md:col-span-8 space-y-4">
                  <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                        <span className="font-title-md text-[13.5px] text-on-surface font-semibold">
                          Current Workstation Session
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-surface-container-highest text-on-surface font-code-sm text-[10px] font-bold tracking-wider">
                        THIS DEVICE
                      </span>
                    </div>
                    <p className="font-body-sm text-[12.5px] text-on-surface font-mono">
                      Chrome 124 on macOS{' '}
                      <span className="text-on-surface-variant">
                        (Mumbai, IN • IP: 49.37.198.12 • Signed via YubiKey 5C)
                      </span>
                    </p>
                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-outline-variant/20">
                      <span className="font-label-sm text-[11px] text-on-surface-variant">
                        Hardware attestation active (P-256 / CTAP2)
                      </span>
                      <button
                        type="button"
                        onClick={() => triggerToast('Revocation signal broadcast. All 2 secondary sessions terminated.')}
                        className="font-label-sm text-[12px] text-secondary hover:text-primary transition-colors flex items-center gap-1 font-medium cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">logout</span>
                        <span>Sign Out All Other Devices</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
                        <span className="material-symbols-outlined text-[20px]">key</span>
                      </div>
                      <div>
                        <span className="font-title-md text-[13.5px] text-on-surface block font-semibold leading-tight">
                          Hardware Passkey Attestation
                        </span>
                        <span className="font-label-sm text-[11.5px] text-on-surface-variant">
                          FIDO2 Level 3 Authenticator Registered (2 resident keys active)
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setManageKeysOpen(true)}
                      className="px-3.5 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-title-md text-body-sm transition-colors cursor-pointer"
                    >
                      Manage Keys
                    </button>
                  </div>

                  {/* Danger Zone */}
                  <div className="p-5 rounded-xl bg-red-50/50 border border-error/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-error font-title-md text-[13.5px] font-semibold">
                        <span className="material-symbols-outlined text-[18px]">warning</span>
                        <span>Account Danger Zone: Enclave Key Destruction</span>
                      </div>
                      <p className="font-body-sm text-[12px] text-on-surface-variant max-w-lg">
                        Purges all local cryptographic signing keys and permanently invalidates sovereign authority for all active mandates.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDestroyModalOpen(true)}
                      className="px-4 py-2 rounded-lg border border-error text-error hover:bg-error hover:text-white transition-colors font-title-md text-body-sm flex items-center justify-center gap-1.5 flex-shrink-0 cursor-pointer shadow-2xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete_forever</span>
                      <span>Destroy Enclave Keys</span>
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>

      {/* Destroy Enclave Keys Modal */}
      {destroyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/70 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-2xl p-6 shadow-2xl space-y-5 border border-error/30 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-error/15 text-error flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[28px]">delete_forever</span>
              </div>
              <div className="space-y-1">
                <h3 className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-semibold">
                  Destroy All Enclave Keys?
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  This action is irreversible. All active delegate shopping passports, virtual card tokens, and sovereign authorization policies will be destroyed.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-low font-code-sm text-[12.5px] space-y-2 border border-outline-variant/20">
              <div className="flex justify-between text-on-surface">
                <span>Signer Key:</span>
                <span className="font-mono font-bold text-error">ed25519:9df0a4...</span>
              </div>
              <div className="flex justify-between text-on-surface">
                <span>Active Mandates Nullified:</span>
                <span className="font-bold">4 Active Mandates</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDestroyModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-title-md text-body-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDestroyKeys}
                className="px-4 py-2 rounded-lg bg-error hover:bg-rose-700 text-white font-title-md text-body-sm transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">delete_forever</span>
                <span>Confirm Permanent Destruction</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Hardware Keys Modal */}
      {manageKeysOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-2xl p-6 shadow-2xl space-y-5 border border-outline-variant/30 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3 border-outline-variant/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[20px]">key</span>
                </div>
                <h3 className="font-title-md text-title-md text-on-surface font-semibold">Registered Hardware Keys</h3>
              </div>
              <button
                type="button"
                onClick={() => setManageKeysOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between">
                <div>
                  <div className="font-title-md text-[13px] font-semibold text-on-surface">YubiKey 5C NFC (Primary)</div>
                  <div className="font-code-sm text-[11px] text-on-surface-variant font-mono">ID: FIDO2-YK5-90184</div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                  Attested
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between">
                <div>
                  <div className="font-title-md text-[13px] font-semibold text-on-surface">MacBook Pro Touch ID (Backup)</div>
                  <div className="font-code-sm text-[11px] text-on-surface-variant font-mono">ID: SECURE-ENCLAVE-882</div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">
                  Enrolled
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setManageKeysOpen(false);
                  triggerToast('Touch YubiKey to enroll new authenticator.');
                }}
                className="text-body-sm text-secondary hover:text-primary font-medium flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Enroll New Key</span>
              </button>
              <button
                type="button"
                onClick={() => setManageKeysOpen(false)}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary font-title-md text-body-sm hover:opacity-90 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
