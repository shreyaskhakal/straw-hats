import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ArbitrationModal from '../components/ArbitrationModal';
import DisputePackModal from '../components/DisputePackModal';
import { api } from '../api/client';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guideOpen, setGuideOpen] = useState(false);
  const [activeDisputePack, setActiveDisputePack] = useState(null);
  const [actionFeedback, setActionFeedback] = useState({});

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const res = await api.getDashboard();
      setData(res);
    } catch (err) {
      console.warn('Dashboard fetch failed, using fallback', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    setActionFeedback((prev) => ({ ...prev, [requestId]: 'approving' }));
    try {
      await api.approveRequest(requestId);
      setActionFeedback((prev) => ({ ...prev, [requestId]: 'approved' }));
      setTimeout(() => loadDashboardData(), 600);
    } catch (err) {
      console.error(err);
      setActionFeedback((prev) => ({ ...prev, [requestId]: 'error' }));
    }
  };

  const handleReject = async (requestId) => {
    setActionFeedback((prev) => ({ ...prev, [requestId]: 'rejecting' }));
    try {
      await api.rejectRequest(requestId);
      setActionFeedback((prev) => ({ ...prev, [requestId]: 'rejected' }));
      setTimeout(() => loadDashboardData(), 600);
    } catch (err) {
      console.error(err);
      setActionFeedback((prev) => ({ ...prev, [requestId]: 'error' }));
    }
  };

  const handleRevokeAgent = async (passportId, agentName) => {
    if (!window.confirm(`Revoke hardware token passport for ${agentName}?`)) return;
    try {
      await api.revokePassport(passportId);
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleInspectDispute = async (requestId) => {
    try {
      const res = await api.getDisputePack(requestId);
      setActiveDisputePack(res.disputePack);
    } catch (err) {
      console.error(err);
    }
  };

  const stats = data?.stats || {
    activeMandates: 4,
    totalMandates: 14,
    totalCeiling: 42500,
    totalUtilized: 28945,
    utilizationPercentage: 68,
    authorizedAgentsCount: 3,
    pendingApprovalsCount: 2,
    haltedAmount: 12695,
    policyInvariance: '100%',
    blockedCallsCount: 14,
  };

  const pendingList = data?.pendingApprovals || [];
  const mandatesList = data?.activeMandates || [];
  const auditList = data?.recentAudit || [];
  const passportsList = data?.agentPassports || [];

  return (
    <div className="bg-background min-h-screen text-on-surface">
      <Sidebar pendingCount={stats.pendingApprovalsCount} mandateCount={stats.activeMandates} />
      <Header pageTitle="Overview Ledger" onOpenGuide={() => setGuideOpen(true)} />
      <ArbitrationModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />
      <DisputePackModal disputePack={activeDisputePack} onClose={() => setActiveDisputePack(null)} />

      {/* Main Workspace */}
      <div className="pl-0 md:pl-64 transition-all duration-200">
        <main className="pt-20 pb-16 px-4 sm:px-8 max-w-7xl mx-auto space-y-12">
          {/* Title & Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-outline-variant/30">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                <span className="page-eyebrow">
                  Sovereign Control / Overview Ledger
                </span>
              </div>
              <h1 className="page-title">
                Your money. Your rules.
              </h1>
              <p className="page-subtitle">
                Real-time cryptographic oversight across active agent delegates and settlement pipelines.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <Link to="/mandates" className="btn-secondary">
                <span className="material-symbols-outlined text-[16px]">tune</span>
                <span>Policy Rules</span>
              </Link>
              <Link to="/mandates" className="btn-primary">
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>New Mandate</span>
              </Link>
            </div>
          </div>

          {/* Notice & PayPal Sandbox Status Strip */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8 p-4 rounded-xl bg-surface-container-low border border-[#E7E7E3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                <span className="text-on-surface font-medium truncate">
                  <strong className="text-primary font-semibold">PayPal Sandbox Status:</strong> Connected (Client Mock / Orders v2 Ready)
                </span>
              </div>
              <span className="font-mono text-[11px] text-secondary bg-surface-container-lowest px-2.5 py-1 rounded-md border border-[#E7E7E3] shrink-0">
                Env: api-m.sandbox.paypal.com (Simulated)
              </span>
            </div>

            <div className="md:col-span-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">info</span>
                <span className="font-medium">Deterministic Demo Values</span>
              </div>
              <span className="font-mono text-[10px] uppercase font-bold tracking-wider">Demo Mode</span>
            </div>
          </div>

          {/* Quick Action Navigation Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              to="/mandates"
              className="p-3.5 rounded-xl bg-surface-container-lowest border border-[#E7E7E3] hover:border-primary/40 hover:shadow-sm transition-all flex items-center gap-3 group"
            >
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[17px]">add_circle</span>
              </div>
              <div className="min-w-0">
                <span className="text-[12.5px] font-semibold text-primary block truncate">Create Mandate</span>
                <span className="text-[10px] text-secondary block font-mono">Set spending rules</span>
              </div>
            </Link>

            <Link
              to="/agent"
              className="p-3.5 rounded-xl bg-surface-container-lowest border border-[#E7E7E3] hover:border-primary/40 hover:shadow-sm transition-all flex items-center gap-3 group"
            >
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[17px]">smart_toy</span>
              </div>
              <div className="min-w-0">
                <span className="text-[12.5px] font-semibold text-primary block truncate">Shopping Agent</span>
                <span className="text-[10px] text-secondary block font-mono">Run product search</span>
              </div>
            </Link>

            <Link
              to="/requests"
              className="p-3.5 rounded-xl bg-surface-container-lowest border border-[#E7E7E3] hover:border-primary/40 hover:shadow-sm transition-all flex items-center gap-3 group"
            >
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[17px]">gavel</span>
              </div>
              <div className="min-w-0">
                <span className="text-[12.5px] font-semibold text-primary block truncate">Inspect Purchases</span>
                <span className="text-[10px] text-secondary block font-mono">{stats.pendingApprovalsCount} pending gates</span>
              </div>
            </Link>

            <Link
              to="/security"
              className="p-3.5 rounded-xl bg-surface-container-lowest border border-[#E7E7E3] hover:border-primary/40 hover:shadow-sm transition-all flex items-center gap-3 group"
            >
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[17px]">security</span>
              </div>
              <div className="min-w-0">
                <span className="text-[12.5px] font-semibold text-primary block truncate">Security Center</span>
                <span className="text-[10px] text-secondary block font-mono">Kill-switch &amp; checks</span>
              </div>
            </Link>
          </div>

          {/* Hero Typographic Metric Cards */}
          <section aria-label="Gateway Metrics Overview">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-surface-container-lowest border border-[#E7E7E3] rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                <span className="font-label-sm text-[11px] uppercase tracking-wider text-secondary block font-semibold">
                  Active Mandates
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-display text-2xl sm:text-3xl font-bold text-primary tracking-tight">
                    {stats.activeMandates}
                  </span>
                  <span className="text-xs font-code-sm text-secondary">
                    / {stats.totalMandates} enrolled
                  </span>
                </div>
                <p className="text-[12px] text-on-surface-variant font-body-sm pt-1">
                  ₹{stats.totalCeiling.toLocaleString()} ceiling • {stats.utilizationPercentage}% used
                </p>
              </div>

              <div className="bg-surface-container-lowest border border-[#E7E7E3] rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                <span className="font-label-sm text-[11px] uppercase tracking-wider text-secondary block font-semibold">
                  Authorized Agents
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-display text-2xl sm:text-3xl font-bold text-primary tracking-tight">
                    {stats.authorizedAgentsCount}
                  </span>
                  <span className="text-xs font-code-sm text-secondary">
                    tokens valid
                  </span>
                </div>
                <p className="text-[12px] text-on-surface-variant font-body-sm pt-1">
                  Claude, Perplexity, AutoProcure
                </p>
              </div>

              <div className="bg-surface-container-lowest border border-[#E7E7E3] rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                <span className="font-label-sm text-[11px] uppercase tracking-wider text-secondary block font-semibold">
                  Pending Approvals
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-display text-2xl sm:text-3xl font-bold text-primary tracking-tight">
                    {stats.pendingApprovalsCount}
                  </span>
                  <span className="text-xs font-code-sm text-error font-medium">
                    ₹{stats.haltedAmount.toLocaleString()} halted
                  </span>
                </div>
                <p className="text-[12px] text-on-surface-variant font-body-sm pt-1">
                  Threshold triggers (&gt; ₹3k)
                </p>
              </div>

              <div className="bg-surface-container-lowest border border-[#E7E7E3] rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                <span className="font-label-sm text-[11px] uppercase tracking-wider text-secondary block font-semibold">
                  Policy Invariance
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-display text-2xl sm:text-3xl font-bold text-primary tracking-tight">
                    {stats.policyInvariance}
                  </span>
                  <span className="text-xs font-code-sm text-emerald-700 font-semibold">
                    0 overrides
                  </span>
                </div>
                <p className="text-[12px] text-on-surface-variant font-body-sm pt-1">
                  {stats.blockedCallsCount} unapproved calls blocked
                </p>
              </div>
            </div>
          </section>

          {/* Two-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: Pending Purchase Requests & Active Mandates Progress */}
            <div className="lg:col-span-7 space-y-12">
              {/* Pending Purchase Authorizations */}
              <section className="space-y-4">
                <div className="flex items-baseline justify-between border-b border-[#E7E7E3] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    <h2 className="section-title">
                      Pending Purchase Authorizations
                    </h2>
                  </div>
                  <span className="font-code-sm text-[11px] text-secondary">
                    {pendingList.length} awaiting clearance
                  </span>
                </div>

                <div className="divide-y divide-[#E7E7E3]">
                  {pendingList.length === 0 ? (
                    <div className="py-8 text-center text-secondary text-[13px]">
                      No pending requests. All transactions are cleared or settled.
                    </div>
                  ) : (
                    pendingList.map((req) => (
                      <div key={req.id} className="py-5 space-y-3 transition-opacity">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-code-sm text-[10px] uppercase tracking-wider text-secondary">
                                {req.merchant}
                              </span>
                              <span className="text-[#c4c7c7] text-[10px]">•</span>
                              <span className="font-code-sm text-[10px] text-on-surface-variant">
                                via {req.agentName}
                              </span>
                            </div>
                            <h3 className="font-title-md text-[16px] font-semibold text-primary">
                              {req.itemTitle}
                            </h3>
                            <p className="text-[12px] text-on-surface-variant font-body-sm">
                              {req.triggerReason}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="font-display text-[20px] font-medium text-primary tracking-tight">
                              ₹{req.amount.toLocaleString()}
                            </span>
                            <span className="block font-code-sm text-[10px] text-secondary">
                              INR incl. GST
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-1 text-[12px]">
                          <button
                            onClick={() => handleInspectDispute(req.id)}
                            className="text-secondary hover:text-primary font-label-md flex items-center gap-1 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[15px]">visibility</span>
                            <span>Inspect Cart Evidence</span>
                          </button>

                          <div className="flex items-center gap-3">
                            {actionFeedback[req.id] === 'approved' ? (
                              <span className="text-emerald-700 font-label-md flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">done</span>
                                <span>Single-Use PayPal Sandbox Order Issued</span>
                              </span>
                            ) : actionFeedback[req.id] === 'rejected' ? (
                              <span className="text-error font-label-md flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">close</span>
                                <span>Declined</span>
                              </span>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleReject(req.id)}
                                  disabled={actionFeedback[req.id] === 'rejecting'}
                                  className="btn-outline text-xs h-8 px-2.5"
                                >
                                  Reject
                                </button>
                                <button
                                  onClick={() => handleApprove(req.id)}
                                  disabled={actionFeedback[req.id] === 'approving'}
                                  className="btn-primary text-xs h-8 px-3 shadow-sm"
                                >
                                  <span className="material-symbols-outlined text-[14px]">check</span>
                                  <span>Release Funds</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* Active Spending Mandates Progress */}
              <section className="space-y-4 pt-2">
                <div className="flex items-baseline justify-between border-b border-[#E7E7E3] pb-3">
                  <h2 className="section-title">
                    Active Spending Mandates
                  </h2>
                  <Link
                    to="/mandates"
                    className="font-label-md text-[12px] text-secondary hover:text-primary flex items-center gap-1 transition-colors"
                  >
                    <span>View all {mandatesList.length}</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </Link>
                </div>

                <div className="divide-y divide-[#E7E7E3]">
                  {mandatesList.slice(0, 3).map((mandate) => {
                    const pct = Math.round((mandate.utilized / mandate.budgetCeiling) * 100);
                    const left = mandate.budgetCeiling - mandate.utilized;

                    return (
                      <div key={mandate.id} className="py-4 space-y-2">
                        <div className="flex items-baseline justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-title-md text-[14px] font-semibold text-primary">
                              {mandate.name}
                            </span>
                            <span className="font-code-sm text-[11px] text-secondary">
                              #{mandate.id}
                            </span>
                          </div>
                          <div className="text-right font-code-sm text-[13px]">
                            <span className="font-medium text-primary">
                              ₹{mandate.utilized.toLocaleString()}
                            </span>
                            <span className="text-on-surface-variant font-light text-[11px]">
                              {' '}
                              / ₹{mandate.budgetCeiling.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="w-full bg-[#E7E7E3] h-1 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              pct > 75 ? 'bg-primary' : 'bg-secondary'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-code-sm text-secondary">
                          <span>{mandate.agents.join(', ')} ({mandate.allowedMerchants.slice(0, 2).join(', ')})</span>
                          <span>{pct}% used • ₹{left.toLocaleString()} left</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Right Column: Gateway Audit Feed & Agent Passports */}
            <div className="lg:col-span-5 space-y-12">
              {/* Recent Activity & Audit Feed */}
              <section className="space-y-4">
                <div className="flex items-baseline justify-between border-b border-[#E7E7E3] pb-3">
                  <h2 className="section-title">
                    Gateway Audit Feed
                  </h2>
                  <Link to="/activity" className="font-code-sm text-[11px] text-secondary hover:text-primary transition-colors">
                    Live Ledger →
                  </Link>
                </div>

                <div className="divide-y divide-[#E7E7E3]">
                  {auditList.map((evt) => (
                    <div key={evt.id} className="py-3.5 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-code-sm">
                        <span
                          className={`font-medium uppercase tracking-wider flex items-center gap-1.5 ${
                            evt.type.includes('BLOCKED')
                              ? 'text-error'
                              : evt.type.includes('CLEARED') || evt.type.includes('APPROVED')
                              ? 'text-emerald-700'
                              : 'text-primary'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              evt.type.includes('BLOCKED')
                                ? 'bg-error'
                                : evt.type.includes('CLEARED') || evt.type.includes('APPROVED')
                                ? 'bg-emerald-600'
                                : 'bg-primary'
                            }`}
                          />
                          {evt.type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-secondary">{evt.timestamp}</span>
                      </div>
                      <p className="font-body-sm text-[13px] text-primary">
                        {evt.summary}
                      </p>
                      <div className="font-code-sm text-[11px] text-secondary">
                        {evt.meta}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Agent Passports */}
              <section className="space-y-4 pt-2">
                <div className="flex items-baseline justify-between border-b border-[#E7E7E3] pb-3">
                  <h2 className="section-title">
                    Active Agent Passports
                  </h2>
                  <Link to="/passport" className="material-symbols-outlined text-[16px] text-secondary hover:text-primary transition-colors">
                    badge
                  </Link>
                </div>

                <div className="divide-y divide-[#E7E7E3]">
                  {passportsList.map((pass) => (
                    <div key={pass.id} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <div className="font-title-md text-[13px] font-medium text-primary">
                          {pass.agentName}
                        </div>
                        <span className="font-code-sm text-[11px] text-secondary">
                          {pass.tokenPrefix} • Exp: {pass.expiresInDays}d
                        </span>
                      </div>
                      {pass.status === 'REVOKED' ? (
                        <span className="text-[11px] font-code-sm text-error font-medium">REVOKED</span>
                      ) : (
                        <button
                          onClick={() => handleRevokeAgent(pass.id, pass.agentName)}
                          className="btn-danger text-[11px] h-7 px-2.5"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <Link
                    to="/passport"
                    className="btn-secondary w-full text-xs h-9 justify-center"
                  >
                    <span className="material-symbols-outlined text-[15px]">add</span>
                    <span>Issue New Agent Token</span>
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
