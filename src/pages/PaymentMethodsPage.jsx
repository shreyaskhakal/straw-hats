import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ArbitrationModal from '../components/ArbitrationModal';
import { api } from '../api/client';

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guideOpen, setGuideOpen] = useState(false);
  const [webauthnEnabled, setWebauthnEnabled] = useState(true);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [limitsModalOpen, setLimitsModalOpen] = useState(false);
  const [selectedRailForLimits, setSelectedRailForLimits] = useState(null);
  const [singleCapInput, setSingleCapInput] = useState('₹3,000');
  const [monthlyCapInput, setMonthlyCapInput] = useState('150000');
  const [tokenizerModalOpen, setTokenizerModalOpen] = useState(false);
  const [connectRailModalOpen, setConnectRailModalOpen] = useState(false);
  const [newRailName, setNewRailName] = useState('');
  const [newRailType, setNewRailType] = useState('PAYPAL_SANDBOX');
  const [newRailIdentifier, setNewRailIdentifier] = useState('');
  const [newRailCap, setNewRailCap] = useState('₹5,000 INR');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadMethods();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadMethods = async () => {
    try {
      setLoading(true);
      const res = await api.getPaymentMethods();
      setMethods(res.paymentMethods || []);
    } catch (err) {
      console.warn('Failed to load payment methods', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFreeze = async (id, name) => {
    try {
      const res = await api.toggleFreezePaymentMethod(id);
      showToast(`${name} status updated: ${res.paymentMethod?.status}`);
      loadMethods();
    } catch (err) {
      showToast('Error: ' + err.message);
    }
  };

  const handleOpenLimits = (pm) => {
    setSelectedRailForLimits(pm);
    setSingleCapInput(pm.autoApproveCap || '₹3,000');
    setMonthlyCapInput(String(pm.spendingLimit || 150000));
    setLimitsModalOpen(true);
  };

  const handleSaveLimits = async (e) => {
    e.preventDefault();
    if (!selectedRailForLimits) return;
    try {
      await api.updatePaymentLimits(selectedRailForLimits.id, {
        autoApproveCap: singleCapInput,
        spendingLimit: Number(monthlyCapInput)
      });
      showToast(`Updated limits for ${selectedRailForLimits.name}`);
      setLimitsModalOpen(false);
      loadMethods();
    } catch (err) {
      showToast('Error: ' + err.message);
    }
  };

  const handleConnectRail = async (e) => {
    e.preventDefault();
    if (!newRailName.trim()) return;
    try {
      await api.connectPaymentRail({
        name: newRailName.trim(),
        type: newRailType,
        identifier: newRailIdentifier.trim() || `sb-${Date.now().toString().slice(-4)}@business.example.com`,
        autoApproveCap: newRailCap
      });
      showToast(`Sandbox rail "${newRailName}" connected successfully.`);
      setConnectRailModalOpen(false);
      setNewRailName('');
      setNewRailIdentifier('');
      loadMethods();
    } catch (err) {
      showToast('Connection failed: ' + err.message);
    }
  };

  return (
    <div className="bg-background min-h-screen text-on-surface antialiased">
      <Sidebar />
      <Header pageTitle="Payment Methods" onOpenGuide={() => setGuideOpen(true)} />
      <ArbitrationModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />

      {/* Main View Area */}
      <div className="pl-0 md:pl-64 transition-all duration-200">
        <main className="relative pt-20 bg-background min-h-screen w-full px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex flex-col w-full space-y-10 max-w-7xl mx-auto">
            
            {/* Editorial Header Section */}
            <div className="pb-6 border-b border-outline-variant/30 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <div>
                  <div className="page-eyebrow flex items-center gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    <span>Mandate Gateway</span>
                    <span className="text-outline-variant">/</span>
                    <span>Payment Methods</span>
                  </div>
                  <h1 className="page-title mt-1">
                    Payment Methods &amp; Rails
                  </h1>
                </div>
                <div className="flex items-center gap-2 text-on-surface-variant font-code-sm text-code-sm">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                  <span>SANDBOX READY • {methods.length} RAILS ENROLLED</span>
                </div>
              </div>
              <p className="page-subtitle">
                Manage supported payment connections, virtual tokenizers, and sandbox settlement caps.
              </p>
            </div>

            {/* Section 1: Settlement Connections */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="section-title">
                  Settlement Connections
                </h2>
                <button
                  type="button"
                  id="connectRailBtn"
                  onClick={() => setConnectRailModalOpen(true)}
                  className="inline-flex items-center gap-1.5 font-label-md text-label-md text-primary hover:text-secondary transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>Connect Sandbox Rail</span>
                </button>
              </div>

              {loading ? (
                <div className="p-12 text-center text-on-surface-variant text-sm">
                  Loading payment rails...
                </div>
              ) : (
                <div className="divide-y divide-outline-variant/30 border-y border-outline-variant/30">
                  {methods.map((pm) => (
                    <div key={pm.id} className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="w-9 h-9 rounded bg-surface-container flex items-center justify-center text-primary shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-[20px]">
                            {pm.type.includes('PAYPAL') ? 'account_balance_wallet' : pm.type.includes('CARD') ? 'credit_card' : 'account_balance'}
                          </span>
                        </div>
                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="font-body-lg text-body-lg text-primary font-medium">
                              {pm.name}
                            </span>
                            <span className={`font-label-sm text-[11px] px-2 py-0.5 rounded-full font-medium ${
                              pm.frozen || pm.status === 'FROZEN'
                                ? 'bg-error/15 text-error font-semibold'
                                : 'bg-secondary-container/50 text-on-secondary-container'
                            }`}>
                              {pm.status || 'ACTIVE'}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-on-surface-variant font-code-sm text-code-sm">
                            <span>{pm.identifier}</span>
                            <span className="text-outline-variant">•</span>
                            <span>Cap: {pm.autoApproveCap || (pm.spendingLimit ? `₹${pm.spendingLimit.toLocaleString()}` : 'Default')}</span>
                            {pm.balance && (
                              <>
                                <span className="text-outline-variant">•</span>
                                <span>Balance: {pm.balance}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0 pl-12 md:pl-0">
                        <button
                          type="button"
                          onClick={() => handleOpenLimits(pm)}
                          className="font-label-md text-label-md text-primary hover:underline transition-colors cursor-pointer"
                        >
                          Manage Limits
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleFreeze(pm.id, pm.name)}
                          className={`font-label-md text-label-md transition-colors cursor-pointer ${
                            pm.frozen || pm.status === 'FROZEN' ? 'text-emerald-700 hover:underline' : 'text-on-surface-variant hover:text-error'
                          }`}
                        >
                          {pm.frozen || pm.status === 'FROZEN' ? 'Unfreeze' : 'Freeze Rail'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Section 2: Spending & Settlement Preferences */}
            <section className="space-y-4 pt-2">
              <div>
                <h2 className="section-title">
                  Spending &amp; Settlement Preferences
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  Global constraints and policy thresholds applied across checkout channels.
                </p>
              </div>

              <div className="divide-y divide-outline-variant/30 border-y border-outline-variant/30 text-body-sm">
                {/* Row 1: Settlement Currency */}
                <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="text-primary font-medium">Settlement Currency</div>
                    <div className="text-on-surface-variant text-[13px]">
                      Base denomination for clearing balance conversions.
                    </div>
                  </div>
                  <div className="flex items-center gap-2 font-code-sm text-code-sm text-primary">
                    <span>INR (₹) - Indian Rupee</span>
                    <span className="font-label-sm text-[11px] px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
                      Primary Base
                    </span>
                  </div>
                </div>

                {/* Row 2: Ephemeral Token TTL */}
                <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="text-primary font-medium">Ephemeral Token TTL</div>
                    <div className="text-on-surface-variant text-[13px]">
                      Automatic expiration lifecycle for one-time virtual tokens.
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-code-sm text-code-sm text-primary">15 Minutes Post-Clearance</span>
                    <button
                      type="button"
                      onClick={() => setTokenizerModalOpen(true)}
                      className="font-label-sm text-[12px] text-primary hover:underline cursor-pointer"
                    >
                      Configure
                    </button>
                  </div>
                </div>

                {/* Row 3: Dual-Factor WebAuthn */}
                <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5 pr-4">
                    <div className="text-primary font-medium">Dual-Factor WebAuthn</div>
                    <div className="text-on-surface-variant text-[13px]">
                      Enforce hardware passkey biometric signature for high-value orders.
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-code-sm text-code-sm text-on-surface-variant">
                      Required for orders &gt;= ₹50,000
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={webauthnEnabled}
                        onChange={(e) => setWebauthnEnabled(e.target.checked)}
                        className="sr-only peer"
                        id="webauthn-toggle"
                      />
                      <div className="w-10 h-5 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-surface-container-lowest after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>

                {/* Row 4: Real-Time Webhook Alerts */}
                <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5 pr-4">
                    <div className="text-primary font-medium">Real-Time Webhook Alerts</div>
                    <div className="text-on-surface-variant text-[13px]">
                      Push notification dispatches upon authorization triggers.
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-code-sm text-code-sm text-on-surface-variant">
                      Push Notifications
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={alertsEnabled}
                        onChange={(e) => setAlertsEnabled(e.target.checked)}
                        className="sr-only peer"
                        id="alerts-toggle"
                      />
                      <div className="w-10 h-5 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-surface-container-lowest after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>
            </section>

            {/* Zero-Credential Notice Strip */}
            <div className="pt-6 border-t border-outline-variant/30 flex items-center justify-between gap-4 text-on-surface-variant font-body-sm text-body-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-secondary">shield</span>
                <span>
                  Mandate Gateway operates in isolated Sandbox mode. Raw CVVs or banking credentials are never requested or stored.
                </span>
              </div>
              <span className="hidden md:inline-flex font-code-sm text-[11px] text-secondary tracking-wide uppercase">
                Sandbox Compliant
              </span>
            </div>
          </div>
        </main>
      </div>

      {/* Connect Sandbox Rail Modal */}
      {connectRailModalOpen && (
        <div className="fixed inset-0 z-50 bg-primary/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white border border-[#E7E7E3] max-w-md w-full p-6 shadow-2xl rounded-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E7E3]">
              <h3 className="font-title-md text-[16px] font-semibold text-primary">
                Connect New Sandbox Settlement Rail
              </h3>
              <button
                type="button"
                onClick={() => setConnectRailModalOpen(false)}
                className="text-secondary hover:text-primary cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <form onSubmit={handleConnectRail} className="space-y-3 text-xs">
              <div>
                <label className="block text-secondary font-medium mb-1">Rail Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PayPal Sandbox Merchant Desk"
                  value={newRailName}
                  onChange={(e) => setNewRailName(e.target.value)}
                  className="w-full p-2 border border-[#E7E7E3] rounded text-primary focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-secondary font-medium mb-1">Provider Type</label>
                <select
                  value={newRailType}
                  onChange={(e) => setNewRailType(e.target.value)}
                  className="w-full p-2 border border-[#E7E7E3] rounded text-primary bg-white focus:outline-none focus:border-primary"
                >
                  <option value="PAYPAL_SANDBOX">PayPal Sandbox Rail</option>
                  <option value="VIRTUAL_CARD">Ephemeral Virtual Card Pool</option>
                  <option value="BANK_TREASURY">Corporate Treasury Sandbox</option>
                </select>
              </div>
              <div>
                <label className="block text-secondary font-medium mb-1">Account Identifier / Email</label>
                <input
                  type="text"
                  placeholder="e.g. sb-merchant-fleet@business.example.com"
                  value={newRailIdentifier}
                  onChange={(e) => setNewRailIdentifier(e.target.value)}
                  className="w-full p-2 border border-[#E7E7E3] rounded font-mono text-primary focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-secondary font-medium mb-1">Autonomous Single-Order Cap</label>
                <input
                  type="text"
                  value={newRailCap}
                  onChange={(e) => setNewRailCap(e.target.value)}
                  className="w-full p-2 border border-[#E7E7E3] rounded font-mono text-primary focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#E7E7E3]">
                <button
                  type="button"
                  onClick={() => setConnectRailModalOpen(false)}
                  className="px-3 py-1.5 text-[12px] rounded border border-[#E7E7E3] hover:bg-surface-container cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-[12px] bg-primary text-white font-medium rounded hover:bg-neutral-800 cursor-pointer"
                >
                  Connect Rail
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Limits Modal */}
      {limitsModalOpen && (
        <div className="fixed inset-0 z-50 bg-primary/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white border border-[#E7E7E3] max-w-md w-full p-6 shadow-2xl rounded-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E7E3]">
              <h3 className="font-title-md text-[16px] font-semibold text-primary">
                Limit Configuration: {selectedRailForLimits?.name}
              </h3>
              <button
                type="button"
                onClick={() => setLimitsModalOpen(false)}
                className="text-secondary hover:text-primary cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <form onSubmit={handleSaveLimits} className="space-y-3 text-xs">
              <div>
                <label className="block text-secondary font-medium mb-1">Single-Transaction Autonomous Cap</label>
                <input
                  type="text"
                  value={singleCapInput}
                  onChange={(e) => setSingleCapInput(e.target.value)}
                  className="w-full p-2 border border-[#E7E7E3] rounded font-mono text-primary focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-secondary font-medium mb-1">Maximum Spending Ceiling (INR)</label>
                <input
                  type="number"
                  value={monthlyCapInput}
                  onChange={(e) => setMonthlyCapInput(e.target.value)}
                  className="w-full p-2 border border-[#E7E7E3] rounded font-mono text-primary focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-[#E7E7E3]">
                <button
                  type="button"
                  onClick={() => setLimitsModalOpen(false)}
                  className="px-3 py-1.5 text-[12px] rounded border border-[#E7E7E3] hover:bg-surface-container cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-[12px] bg-primary text-white font-medium rounded hover:bg-neutral-800 cursor-pointer"
                >
                  Save Limits
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Configure Tokenizer Modal */}
      {tokenizerModalOpen && (
        <div className="fixed inset-0 z-50 bg-primary/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white border border-[#E7E7E3] max-w-md w-full p-6 shadow-2xl rounded-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E7E3]">
              <h3 className="font-title-md text-[16px] font-semibold text-primary">
                Gateway Virtual Card Tokenizer
              </h3>
              <button
                type="button"
                onClick={() => setTokenizerModalOpen(false)}
                className="text-secondary hover:text-primary cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <p className="text-xs text-on-surface-variant">
              Configure ephemeral card pool sizing and burn policies for agent checkout orchestration.
            </p>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-2 rounded bg-surface-container">
                <span>Active Ephemeral Pool</span>
                <span className="font-mono font-medium">8 Tokens Ready</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-surface-container">
                <span>Burn on First Settlement</span>
                <span className="font-mono text-emerald-700 font-medium">ENFORCED</span>
              </div>
            </div>
            <div className="flex justify-end pt-2 border-t border-[#E7E7E3]">
              <button
                type="button"
                onClick={() => setTokenizerModalOpen(false)}
                className="px-4 py-2 text-[12px] bg-primary text-white font-medium rounded hover:bg-neutral-800 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Feedback */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-neutral-900 text-white shadow-xl text-xs font-medium">
            <span className="material-symbols-outlined text-[18px] text-emerald-400">check_circle</span>
            <span>{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}
