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
  const [tokenizerModalOpen, setTokenizerModalOpen] = useState(false);
  const [connectRailModalOpen, setConnectRailModalOpen] = useState(false);

  useEffect(() => {
    loadMethods();
  }, []);

  const loadMethods = async () => {
    try {
      const res = await api.getPaymentMethods();
      setMethods(res.paymentMethods || []);
    } catch (err) {
      console.warn('Failed to load payment methods', err);
    } finally {
      setLoading(false);
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
                    Payment Methods
                  </h1>
                </div>
                <div className="flex items-center gap-2 text-on-surface-variant font-code-sm text-code-sm">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                  <span>SANDBOX READY • 3 RAILS ACTIVE</span>
                </div>
              </div>
              <p className="page-subtitle">
                Manage supported payment connections and authorization status.
              </p>
            </div>

            {/* Section 1: Settlement Connections (Open List Rows with 1px dividers) */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="section-title">
                  Settlement Connections
                </h2>
                <button
                  type="button"
                  onClick={() => setConnectRailModalOpen(true)}
                  className="inline-flex items-center gap-1.5 font-label-md text-label-md text-primary hover:text-secondary transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>Connect Sandbox Rail</span>
                </button>
              </div>

              <div className="divide-y divide-outline-variant/30 border-y border-outline-variant/30">
                {/* Row 1: PayPal Sandbox Rail */}
                <div className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-9 h-9 rounded bg-surface-container flex items-center justify-center text-primary shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-body-lg text-body-lg text-primary font-medium">
                          PayPal Sandbox Settlement Rail
                        </span>
                        <span className="font-label-sm text-[11px] px-2 py-0.5 rounded-full bg-secondary-container/50 text-on-secondary-container font-medium">
                          Active / Sandbox
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-on-surface-variant font-code-sm text-code-sm">
                        <span>sb-buyer-8921@business.example.com</span>
                        <span className="text-outline-variant">•</span>
                        <span>Latency: 42ms</span>
                        <span className="text-outline-variant">•</span>
                        <span>Max Single: ₹1,50,000 (INR / USD)</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 pl-12 md:pl-0">
                    <button
                      type="button"
                      onClick={() => setLimitsModalOpen(true)}
                      className="font-label-md text-label-md text-primary hover:underline transition-colors"
                    >
                      Manage Limits
                    </button>
                    <button
                      type="button"
                      onClick={() => alert('PayPal sandbox rail is protected by sovereign policy and cannot be disconnected during active enrollment.')}
                      className="font-label-md text-label-md text-on-surface-variant hover:text-error transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>

                {/* Row 2: Virtual Card Pool */}
                <div className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-9 h-9 rounded bg-surface-container flex items-center justify-center text-primary shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[20px]">credit_card</span>
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-body-lg text-body-lg text-primary font-medium">
                          Virtual Card Pool (Gateway Tokenizer)
                        </span>
                        <span className="font-label-sm text-[11px] px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-medium">
                          Auto-Ephemeral
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-on-surface-variant font-code-sm text-code-sm">
                        <span>Visa Commercial •••• 8412</span>
                        <span className="text-outline-variant">•</span>
                        <span>TTL: 15 mins post-clearance</span>
                        <span className="text-outline-variant">•</span>
                        <span>Dynamic CVV Auto-Burn</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 pl-12 md:pl-0">
                    <button
                      type="button"
                      onClick={() => setTokenizerModalOpen(true)}
                      className="font-label-md text-label-md text-primary hover:underline transition-colors"
                    >
                      Configure Tokenizer
                    </button>
                  </div>
                </div>

                {/* Row 3: HDFC Institutional Treasury */}
                <div className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-9 h-9 rounded bg-surface-container flex items-center justify-center text-primary shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[20px]">account_balance</span>
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-body-lg text-body-lg text-primary font-medium">
                          HDFC Institutional Treasury (Verified Corporate Bank Account)
                        </span>
                        <span className="font-label-sm text-[11px] px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-medium">
                          Attested (Read-Only)
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-on-surface-variant font-code-sm text-code-sm">
                        <span>••••••••5819 (IFSC: HDFC0000060)</span>
                        <span className="text-outline-variant">•</span>
                        <span className="text-secondary font-medium">Penny-Drop Verified</span>
                        <span className="text-outline-variant">•</span>
                        <span>Orders &gt;= ₹1,00,000 require Dual-Sign</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 pl-12 md:pl-0 text-on-surface-variant font-label-sm text-label-sm">
                    <span className="material-symbols-outlined text-[16px] text-secondary">lock</span>
                    <span>Hardware Validated</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Spending & Settlement Preferences (Clean 2-Column Key-Value Rows) */}
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

                {/* Row 2: Pre-Funding Buffer */}
                <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="text-primary font-medium">Pre-Funding Buffer</div>
                    <div className="text-on-surface-variant text-[13px]">
                      Liquid safety reserve retained on ledger before clearances.
                    </div>
                  </div>
                  <div className="flex items-center gap-3 font-code-sm text-code-sm">
                    <span className="text-primary font-medium">₹25,000 Safety Reserve</span>
                    <span className="text-on-surface-variant text-[12px]">(Allocated: ₹15,500)</span>
                  </div>
                </div>

                {/* Row 3: Ephemeral Token TTL */}
                <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="text-primary font-medium">Ephemeral Token TTL</div>
                    <div className="text-on-surface-variant text-[13px]">
                      Automatic expiration lifecycle for one-time virtual tokens.
                    </div>
                  </div>
                  <div className="font-code-sm text-code-sm text-primary">
                    15 minutes post-clearance
                  </div>
                </div>

                {/* Row 4: Dual-Factor WebAuthn */}
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

                {/* Row 5: Real-Time Webhook Alerts */}
                <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5 pr-4">
                    <div className="text-primary font-medium">Real-Time Webhook Alerts</div>
                    <div className="text-on-surface-variant text-[13px]">
                      Push notification dispatches upon authorization triggers.
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-code-sm text-code-sm text-on-surface-variant">
                      SMS &amp; Telegram Push
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

            {/* Understated Zero-Credential Notice Strip */}
            <div className="pt-6 border-t border-outline-variant/30 flex items-center justify-between gap-4 text-on-surface-variant font-body-sm text-body-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-secondary">shield</span>
                <span>
                  Mandate Gateway never requests or stores raw banking passwords, UPI PINs, or CVVs. Ephemeral sandboxed tokens only.
                </span>
              </div>
              <span className="hidden md:inline-flex font-code-sm text-[11px] text-secondary tracking-wide uppercase">
                Zero-Storage Certified
              </span>
            </div>
          </div>
        </main>
      </div>

      {/* Manage Limits Modal */}
      {limitsModalOpen && (
        <div className="fixed inset-0 z-50 bg-primary/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white border border-[#E7E7E3] max-w-md w-full p-6 shadow-2xl rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E7E3]">
              <h3 className="font-title-md text-[16px] font-semibold text-primary">
                PayPal Sandbox Limit Configuration
              </h3>
              <button
                type="button"
                onClick={() => setLimitsModalOpen(false)}
                className="text-secondary hover:text-primary"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-secondary font-medium mb-1">Single-Transaction Autonomous Cap</label>
                <input
                  type="text"
                  defaultValue="₹3,000"
                  className="w-full p-2 border border-[#E7E7E3] rounded font-mono"
                />
              </div>
              <div>
                <label className="block text-secondary font-medium mb-1">Monthly Maximum Ceiling</label>
                <input
                  type="text"
                  defaultValue="₹1,50,000"
                  className="w-full p-2 border border-[#E7E7E3] rounded font-mono"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#E7E7E3]">
              <button
                type="button"
                onClick={() => setLimitsModalOpen(false)}
                className="px-4 py-2 text-[12px] bg-primary text-white font-medium rounded"
              >
                Save Limits
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Configure Tokenizer Modal */}
      {tokenizerModalOpen && (
        <div className="fixed inset-0 z-50 bg-primary/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white border border-[#E7E7E3] max-w-md w-full p-6 shadow-2xl rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E7E3]">
              <h3 className="font-title-md text-[16px] font-semibold text-primary">
                Gateway Virtual Card Tokenizer
              </h3>
              <button
                type="button"
                onClick={() => setTokenizerModalOpen(false)}
                className="text-secondary hover:text-primary"
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
                className="px-4 py-2 text-[12px] bg-primary text-white font-medium rounded"
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
