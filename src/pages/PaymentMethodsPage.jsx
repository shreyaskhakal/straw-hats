import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ArbitrationModal from '../components/ArbitrationModal';
import { api } from '../api/client';
import { defaultPaymentService } from '../services/paymentService';

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

  // Webhook and connection simulator
  const [webhookTesting, setWebhookTesting] = useState(false);
  const [sandboxRailState, setSandboxRailState] = useState('CONNECTED'); // CONNECTED, TESTING, DEGRADED

  // Simulated transaction records for judges
  const [transactions, setTransactions] = useState([
    {
      id: 'TXN-99120',
      timestamp: '2026-10-24 18:30:05',
      orderId: 'PP-ORD-662910',
      merchant: 'Amazon India Retail',
      amount: '₹1,299',
      status: 'COMPLETED',
      captureId: 'CAP-990184719',
      token: 'tok_sandbox_e391a84f'
    },
    {
      id: 'TXN-99118',
      timestamp: '2026-10-22 09:15:04',
      orderId: 'PP-ORD-551982',
      merchant: 'Croma Retail Systems',
      amount: '₹4,499',
      status: 'COMPLETED',
      captureId: 'CAP-771829910',
      token: 'tok_sandbox_c8901239'
    },
    {
      id: 'TXN-99115',
      timestamp: '2026-10-24 21:40:00',
      orderId: 'MOCK-PP-ORD-889104',
      merchant: 'Amazon India Seller Fleet',
      amount: '₹8,495',
      status: 'AWAITING_APPROVAL',
      captureId: 'PENDING_HITL',
      token: 'tok_sandbox_hold_889'
    },
    {
      id: 'TXN-99110',
      timestamp: '2026-10-23 11:20:00',
      orderId: 'MOCK-PP-ORD-661209',
      merchant: 'Amazon India',
      amount: '₹9,200',
      status: 'CANCELLED',
      captureId: 'N/A (DECLINED)',
      token: 'tok_sandbox_void_991'
    }
  ]);

  useEffect(() => {
    loadMethods();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
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

  const handleSimulateWebhook = () => {
    setWebhookTesting(true);
    setTimeout(() => {
      setWebhookTesting(false);
      showToast('Webhook event received: PAYMENT.CAPTURE.COMPLETED (Event ID: WH-SIM-8829)');
      // Prepend a new simulated transaction
      setTransactions(prev => [
        {
          id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          orderId: `PP-ORD-${Math.floor(100000 + Math.random() * 900000)}`,
          merchant: 'Logitech Official Direct',
          amount: '₹3,499',
          status: 'COMPLETED',
          captureId: `CAP-${Math.floor(10000000 + Math.random() * 90000000)}`,
          token: `tok_sandbox_${Math.random().toString(16).substring(2, 10)}`
        },
        ...prev
      ]);
    }, 900);
  };

  const toggleRailHealth = () => {
    setSandboxRailState(prev => (prev === 'CONNECTED' ? 'DEGRADED' : 'CONNECTED'));
    showToast(`PayPal Sandbox Rail status toggled: ${sandboxRailState === 'CONNECTED' ? 'Simulated Timeout / Degraded' : 'Operational'}`);
  };

  return (
    <div className="bg-background min-h-screen text-charcoal dark:text-gray-100 antialiased">
      <Sidebar />
      <Header pageTitle="Payment Methods" onOpenGuide={() => setGuideOpen(true)} />
      <ArbitrationModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />

      {/* Main View Area */}
      <div className="pl-0 md:pl-64 transition-all duration-200">
        <main className="relative pt-20 bg-background min-h-screen w-full px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex flex-col w-full space-y-8 max-w-7xl mx-auto">
            
            {/* Editorial Header Section */}
            <div className="pb-6 border-b border-[#E7E7E3] dark:border-[#353535] space-y-2">
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
                <div className="flex items-center gap-2 font-mono text-xs text-[#5A5D5E] dark:text-[#B8B8B8]">
                  <span className={`w-2 h-2 rounded-full ${sandboxRailState === 'CONNECTED' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                  <span>
                    PAYPAL SANDBOX • {sandboxRailState} ({methods.length} RAILS ENROLLED)
                  </span>
                </div>
              </div>
              <p className="page-subtitle">
                Manage payment connections, virtual tokenizers, and simulated settlement caps for autonomous AI shopping agents.
              </p>
            </div>

            {/* Dedicated PayPal Sandbox Connection Card */}
            <div className="bg-white dark:bg-[#1D1D1D] border border-[#E7E7E3] dark:border-[#353535] rounded-xl p-6 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-5 border-b border-[#E7E7E3] dark:border-[#353535]">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#FAF8F3] dark:bg-[#252525] border border-[#ECE5D8] dark:border-[#353535] flex items-center justify-center text-charcoal dark:text-white flex-shrink-0">
                    <span className="material-symbols-outlined text-[24px]">account_balance_wallet</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-headline-sm text-base font-semibold text-charcoal dark:text-white">
                        PayPal Sandbox Dedicated Rail
                      </h3>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                        sandboxRailState === 'CONNECTED'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {sandboxRailState === 'CONNECTED' ? 'ACTIVE SANDBOX' : 'SIMULATED DEGRADED'}
                      </span>
                    </div>
                    <p className="text-xs text-[#5A5D5E] dark:text-[#B8B8B8] mt-1">
                      Endpoint: <code className="font-mono text-charcoal dark:text-gray-200">api-m.sandbox.paypal.com</code> • Protocol: v2/checkout/orders
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={handleSimulateWebhook}
                    disabled={webhookTesting}
                    className="px-3.5 py-2 text-xs font-medium rounded-md border border-[#E7E7E3] dark:border-[#353535] bg-[#FAF9F5] dark:bg-[#252525] text-charcoal dark:text-white hover:bg-[#F4F4F0] dark:hover:bg-[#2A2A2A] transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[15px]">webhook</span>
                    <span>{webhookTesting ? 'Firing Webhook...' : 'Test Webhook Event'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={toggleRailHealth}
                    className="px-3.5 py-2 text-xs font-medium rounded-md border border-[#E7E7E3] dark:border-[#353535] bg-white dark:bg-[#1D1D1D] text-charcoal dark:text-white hover:bg-neutral-50 dark:hover:bg-[#252525] transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[15px]">sensors</span>
                    <span>Toggle Disconnect State</span>
                  </button>
                </div>
              </div>

              {/* Status Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-5 text-xs">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#888B8C] block">Mock Client ID</span>
                  <span className="font-mono text-charcoal dark:text-gray-200 font-medium">BAAv88201...99XJ</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#888B8C] block">Environment</span>
                  <span className="font-mono text-charcoal dark:text-gray-200 font-medium">PayPal Developer Sandbox</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#888B8C] block">Simulated Balance</span>
                  <span className="font-mono text-charcoal dark:text-gray-200 font-medium">$12,450.00 USD</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#888B8C] block">Zero-Secret Policy</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">lock</span>
                    <span>Zero Live Credentials</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Section 1: Settlement Connections */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="section-title text-charcoal dark:text-white">
                  Settlement Connections
                </h2>
                <button
                  type="button"
                  id="connectRailBtn"
                  onClick={() => setConnectRailModalOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal dark:text-white hover:text-secondary transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>Connect Sandbox Rail</span>
                </button>
              </div>

              {loading ? (
                <div className="p-12 text-center text-[#5A5D5E] dark:text-[#B8B8B8] text-sm">
                  Loading payment rails...
                </div>
              ) : (
                <div className="divide-y divide-[#E7E7E3] dark:divide-[#353535] border-y border-[#E7E7E3] dark:border-[#353535]">
                  {methods.map((pm) => (
                    <div key={pm.id} className="py-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="w-9 h-9 rounded bg-[#FAF9F5] dark:bg-[#252525] border border-[#E7E7E3] dark:border-[#353535] flex items-center justify-center text-charcoal dark:text-white shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-[20px]">
                            {pm.type.includes('PAYPAL') ? 'account_balance_wallet' : pm.type.includes('CARD') ? 'credit_card' : 'account_balance'}
                          </span>
                        </div>
                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="text-[14px] text-charcoal dark:text-white font-medium">
                              {pm.name}
                            </span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-medium ${
                              pm.frozen || pm.status === 'FROZEN'
                                ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950 dark:text-red-300'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                            }`}>
                              {pm.frozen || pm.status === 'FROZEN' ? 'FROZEN' : 'ACTIVE'}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[#5A5D5E] dark:text-[#B8B8B8] font-mono text-xs">
                            <span>{pm.identifier}</span>
                            <span className="text-[#888B8C]">•</span>
                            <span>Cap: {pm.autoApproveCap || (pm.spendingLimit ? `₹${pm.spendingLimit.toLocaleString()}` : 'Default')}</span>
                            {pm.balance && (
                              <>
                                <span className="text-[#888B8C]">•</span>
                                <span>Balance: {pm.balance}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0 pl-12 md:pl-0 text-xs">
                        <button
                          type="button"
                          onClick={() => handleOpenLimits(pm)}
                          className="font-medium text-charcoal dark:text-gray-200 hover:underline cursor-pointer"
                        >
                          Manage Limits
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleFreeze(pm.id, pm.name)}
                          className={`font-medium transition-colors cursor-pointer ${
                            pm.frozen || pm.status === 'FROZEN' ? 'text-emerald-700 dark:text-emerald-400 hover:underline' : 'text-[#5A5D5E] dark:text-[#B8B8B8] hover:text-error'
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

            {/* Section 2: Simulated Transaction History */}
            <section className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="section-title text-charcoal dark:text-white">
                    Simulated Transaction History
                  </h2>
                  <p className="text-xs text-[#5A5D5E] dark:text-[#B8B8B8] mt-0.5">
                    Immutable sandbox audit ledger representing one-time token clearances issued to PayPal Sandbox.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-[#888B8C]">
                  {transactions.length} records
                </span>
              </div>

              <div className="border border-[#E7E7E3] dark:border-[#353535] rounded-lg overflow-hidden bg-white dark:bg-[#1D1D1D] shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF9F5] dark:bg-[#252525] border-b border-[#E7E7E3] dark:border-[#353535] font-mono uppercase text-[10px] text-[#888B8C]">
                      <tr>
                        <th className="py-2.5 px-4">Timestamp</th>
                        <th className="py-2.5 px-4">Order ID</th>
                        <th className="py-2.5 px-4">Payee / Merchant</th>
                        <th className="py-2.5 px-4 text-right">Amount</th>
                        <th className="py-2.5 px-4 text-center">Status</th>
                        <th className="py-2.5 px-4">Capture ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E7E7E3] dark:divide-[#353535]">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-[#FAF9F5] dark:hover:bg-[#252525] transition-colors">
                          <td className="py-3 px-4 font-mono text-[#5A5D5E] dark:text-[#B8B8B8] whitespace-nowrap">
                            {tx.timestamp}
                          </td>
                          <td className="py-3 px-4 font-mono font-medium text-charcoal dark:text-white whitespace-nowrap">
                            {tx.orderId}
                          </td>
                          <td className="py-3 px-4 text-charcoal dark:text-gray-200">
                            {tx.merchant}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-semibold text-charcoal dark:text-white">
                            {tx.amount}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                              tx.status === 'COMPLETED'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                                : tx.status === 'AWAITING_APPROVAL'
                                ? 'bg-[#FAF8F3] text-secondary border border-[#ECE5D8] dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-neutral-100 text-neutral-700 border border-neutral-200 dark:bg-[#252525] dark:text-gray-300'
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-[#888B8C] truncate max-w-[140px]">
                            {tx.captureId}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Section 3: Spending & Settlement Preferences */}
            <section className="space-y-4 pt-2">
              <div>
                <h2 className="section-title text-charcoal dark:text-white">
                  Spending &amp; Settlement Preferences
                </h2>
                <p className="text-xs text-[#5A5D5E] dark:text-[#B8B8B8] mt-0.5">
                  Global constraints and policy thresholds applied across autonomous checkout channels.
                </p>
              </div>

              <div className="divide-y divide-[#E7E7E3] dark:divide-[#353535] border-y border-[#E7E7E3] dark:border-[#353535] text-xs">
                {/* Row 1: Settlement Currency */}
                <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="text-charcoal dark:text-white font-medium">Settlement Currency</div>
                    <div className="text-[#5A5D5E] dark:text-[#B8B8B8]">
                      Base denomination for clearing balance conversions.
                    </div>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-charcoal dark:text-white">
                    <span>INR (₹) - Indian Rupee</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#FAF9F5] dark:bg-[#252525] border border-[#E7E7E3] dark:border-[#353535] text-[#5A5D5E] dark:text-[#B8B8B8]">
                      Primary Base
                    </span>
                  </div>
                </div>

                {/* Row 2: Ephemeral Token TTL */}
                <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="text-charcoal dark:text-white font-medium">Ephemeral Token TTL</div>
                    <div className="text-[#5A5D5E] dark:text-[#B8B8B8]">
                      Automatic expiration lifecycle for one-time virtual tokens.
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-charcoal dark:text-white">15 Minutes Post-Clearance</span>
                    <button
                      type="button"
                      onClick={() => setTokenizerModalOpen(true)}
                      className="text-charcoal dark:text-gray-200 hover:underline cursor-pointer font-medium"
                    >
                      Configure
                    </button>
                  </div>
                </div>

                {/* Row 3: Dual-Factor WebAuthn */}
                <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5 pr-4">
                    <div className="text-charcoal dark:text-white font-medium">Dual-Factor WebAuthn Sign-off</div>
                    <div className="text-[#5A5D5E] dark:text-[#B8B8B8]">
                      Enforce hardware passkey biometric signature for high-value orders.
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-[#888B8C]">
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
                      <div className="w-10 h-5 bg-[#E7E7E3] dark:bg-[#353535] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-charcoal dark:peer-checked:bg-white dark:peer-checked:after:bg-black"></div>
                    </label>
                  </div>
                </div>

                {/* Row 4: Real-Time Webhook Alerts */}
                <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5 pr-4">
                    <div className="text-charcoal dark:text-white font-medium">Real-Time Webhook Alerts</div>
                    <div className="text-[#5A5D5E] dark:text-[#B8B8B8]">
                      Push notification dispatches upon authorization triggers.
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-[#888B8C]">
                      Active Listener
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={alertsEnabled}
                        onChange={(e) => setAlertsEnabled(e.target.checked)}
                        className="sr-only peer"
                        id="alerts-toggle"
                      />
                      <div className="w-10 h-5 bg-[#E7E7E3] dark:bg-[#353535] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-charcoal dark:peer-checked:bg-white dark:peer-checked:after:bg-black"></div>
                    </label>
                  </div>
                </div>
              </div>
            </section>

            {/* Zero-Credential Notice Strip */}
            <div className="pt-6 border-t border-[#E7E7E3] dark:border-[#353535] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#5A5D5E] dark:text-[#B8B8B8]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-secondary">shield</span>
                <span>
                  <strong>Zero-Secret Boundary:</strong> Mandate Gateway operates in isolated Sandbox mode. Raw CVVs, primary account numbers, or banking credentials are never requested or stored.
                </span>
              </div>
              <span className="font-mono text-[11px] text-secondary tracking-wide uppercase shrink-0">
                Sandbox Compliant
              </span>
            </div>
          </div>
        </main>
      </div>

      {/* Connect Sandbox Rail Modal */}
      {connectRailModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1D1D1D] border border-[#E7E7E3] dark:border-[#353535] max-w-md w-full p-6 shadow-2xl rounded-xl space-y-4 animate-in zoom-in-95 duration-150 text-charcoal dark:text-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E7E3] dark:border-[#353535]">
              <h3 className="font-headline-sm text-[16px] font-semibold text-charcoal dark:text-white">
                Connect New Sandbox Settlement Rail
              </h3>
              <button
                type="button"
                onClick={() => setConnectRailModalOpen(false)}
                className="text-[#888B8C] hover:text-charcoal dark:hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <form onSubmit={handleConnectRail} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#5A5D5E] dark:text-[#B8B8B8] font-medium mb-1">Rail Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PayPal Sandbox Merchant Desk"
                  value={newRailName}
                  onChange={(e) => setNewRailName(e.target.value)}
                  className="w-full p-2 border border-[#E7E7E3] dark:border-[#353535] rounded bg-white dark:bg-[#141414] text-charcoal dark:text-white focus:outline-none focus:ring-1 focus:ring-charcoal"
                />
              </div>
              <div>
                <label className="block text-[#5A5D5E] dark:text-[#B8B8B8] font-medium mb-1">Provider Type</label>
                <select
                  value={newRailType}
                  onChange={(e) => setNewRailType(e.target.value)}
                  className="w-full p-2 border border-[#E7E7E3] dark:border-[#353535] rounded bg-white dark:bg-[#141414] text-charcoal dark:text-white focus:outline-none focus:ring-1 focus:ring-charcoal"
                >
                  <option value="PAYPAL_SANDBOX">PayPal Sandbox Rail</option>
                  <option value="VIRTUAL_CARD">Ephemeral Virtual Card Pool</option>
                  <option value="BANK_TREASURY">Corporate Treasury Sandbox</option>
                </select>
              </div>
              <div>
                <label className="block text-[#5A5D5E] dark:text-[#B8B8B8] font-medium mb-1">Account Identifier / Email</label>
                <input
                  type="text"
                  placeholder="e.g. sb-merchant-fleet@business.example.com"
                  value={newRailIdentifier}
                  onChange={(e) => setNewRailIdentifier(e.target.value)}
                  className="w-full p-2 border border-[#E7E7E3] dark:border-[#353535] rounded font-mono bg-white dark:bg-[#141414] text-charcoal dark:text-white focus:outline-none focus:ring-1 focus:ring-charcoal"
                />
              </div>
              <div>
                <label className="block text-[#5A5D5E] dark:text-[#B8B8B8] font-medium mb-1">Autonomous Single-Order Cap</label>
                <input
                  type="text"
                  value={newRailCap}
                  onChange={(e) => setNewRailCap(e.target.value)}
                  className="w-full p-2 border border-[#E7E7E3] dark:border-[#353535] rounded font-mono bg-white dark:bg-[#141414] text-charcoal dark:text-white focus:outline-none focus:ring-1 focus:ring-charcoal"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#E7E7E3] dark:border-[#353535]">
                <button
                  type="button"
                  onClick={() => setConnectRailModalOpen(false)}
                  className="px-3 py-1.5 text-xs rounded border border-[#E7E7E3] dark:border-[#353535] hover:bg-[#FAF9F5] dark:hover:bg-[#252525] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-charcoal dark:bg-white text-white dark:text-black font-semibold rounded hover:bg-black dark:hover:bg-neutral-200 cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1D1D1D] border border-[#E7E7E3] dark:border-[#353535] max-w-md w-full p-6 shadow-2xl rounded-xl space-y-4 animate-in zoom-in-95 duration-150 text-charcoal dark:text-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E7E3] dark:border-[#353535]">
              <h3 className="font-headline-sm text-[16px] font-semibold text-charcoal dark:text-white">
                Limit Configuration: {selectedRailForLimits?.name}
              </h3>
              <button
                type="button"
                onClick={() => setLimitsModalOpen(false)}
                className="text-[#888B8C] hover:text-charcoal dark:hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <form onSubmit={handleSaveLimits} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#5A5D5E] dark:text-[#B8B8B8] font-medium mb-1">Single-Transaction Autonomous Cap</label>
                <input
                  type="text"
                  value={singleCapInput}
                  onChange={(e) => setSingleCapInput(e.target.value)}
                  className="w-full p-2 border border-[#E7E7E3] dark:border-[#353535] rounded font-mono bg-white dark:bg-[#141414] text-charcoal dark:text-white focus:outline-none focus:ring-1 focus:ring-charcoal"
                />
              </div>
              <div>
                <label className="block text-[#5A5D5E] dark:text-[#B8B8B8] font-medium mb-1">Maximum Spending Ceiling (INR)</label>
                <input
                  type="number"
                  value={monthlyCapInput}
                  onChange={(e) => setMonthlyCapInput(e.target.value)}
                  className="w-full p-2 border border-[#E7E7E3] dark:border-[#353535] rounded font-mono bg-white dark:bg-[#141414] text-charcoal dark:text-white focus:outline-none focus:ring-1 focus:ring-charcoal"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-[#E7E7E3] dark:border-[#353535]">
                <button
                  type="button"
                  onClick={() => setLimitsModalOpen(false)}
                  className="px-3 py-1.5 text-xs rounded border border-[#E7E7E3] dark:border-[#353535] hover:bg-[#FAF9F5] dark:hover:bg-[#252525] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-charcoal dark:bg-white text-white dark:text-black font-semibold rounded hover:bg-black dark:hover:bg-neutral-200 cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1D1D1D] border border-[#E7E7E3] dark:border-[#353535] max-w-md w-full p-6 shadow-2xl rounded-xl space-y-4 animate-in zoom-in-95 duration-150 text-charcoal dark:text-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E7E3] dark:border-[#353535]">
              <h3 className="font-headline-sm text-[16px] font-semibold text-charcoal dark:text-white">
                Gateway Virtual Card Tokenizer
              </h3>
              <button
                type="button"
                onClick={() => setTokenizerModalOpen(false)}
                className="text-[#888B8C] hover:text-charcoal dark:hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <p className="text-xs text-[#5A5D5E] dark:text-[#B8B8B8]">
              Configure ephemeral token pool sizing and burn policies for agent checkout orchestration.
            </p>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-2 rounded bg-[#FAF9F5] dark:bg-[#252525] border border-[#E7E7E3] dark:border-[#353535]">
                <span>Active Ephemeral Pool</span>
                <span className="font-mono font-medium">8 Tokens Ready</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-[#FAF9F5] dark:bg-[#252525] border border-[#E7E7E3] dark:border-[#353535]">
                <span>Burn on First Settlement</span>
                <span className="font-mono text-emerald-700 dark:text-emerald-400 font-medium">ENFORCED</span>
              </div>
            </div>
            <div className="flex justify-end pt-2 border-t border-[#E7E7E3] dark:border-[#353535]">
              <button
                type="button"
                onClick={() => setTokenizerModalOpen(false)}
                className="px-4 py-2 text-xs bg-charcoal dark:bg-white text-white dark:text-black font-semibold rounded hover:bg-black dark:hover:bg-neutral-200 cursor-pointer"
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
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-charcoal text-white shadow-xl text-xs font-medium">
            <span className="material-symbols-outlined text-[18px] text-emerald-400">check_circle</span>
            <span>{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}
