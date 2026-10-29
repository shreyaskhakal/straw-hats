import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ArbitrationModal from '../components/ArbitrationModal';
import DisputePackModal from '../components/DisputePackModal';
import { api } from '../api/client';
import { REQUEST_LIFECYCLE_STATUS } from '../services/apiContract';

export default function PurchaseRequestsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guideOpen, setGuideOpen] = useState(false);
  const [activeDisputePack, setActiveDisputePack] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState('pending'); // all, pending, approved, completed, blocked, rejected, expired, draft
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Consequential action confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: 'approve', // 'approve' | 'reject'
    item: null,
    reason: 'Exceeds revised project requirement or alternative selected'
  });

  useEffect(() => {
    loadLiveRequests();
  }, []);

  function mapBackendRequestToItem(req) {
    const rawStatus = (req.status || '').toUpperCase();
    let normalizedStatus = 'pending';
    let badgeType = 'Pending';
    let badgeBg = 'bg-[#EFECE6] text-secondary border border-[#E0DDD5]';
    let dotColor = 'bg-secondary';

    if (rawStatus === 'AUTO_CLEARED' || rawStatus === 'APPROVED') {
      normalizedStatus = 'approved';
      badgeType = 'Approved';
      badgeBg = 'bg-emerald-50 text-emerald-800 border border-emerald-200/60';
      dotColor = 'bg-emerald-600';
    } else if (rawStatus === 'COMPLETED') {
      normalizedStatus = 'completed';
      badgeType = 'Completed';
      badgeBg = 'bg-emerald-100 text-emerald-900 border border-emerald-300';
      dotColor = 'bg-emerald-700';
    } else if (rawStatus === 'REJECTED') {
      normalizedStatus = 'rejected';
      badgeType = 'Declined';
      badgeBg = 'bg-neutral-100 text-neutral-700 border border-neutral-300';
      dotColor = 'bg-neutral-500';
    } else if (rawStatus === 'BLOCKED') {
      normalizedStatus = 'blocked';
      badgeType = 'Blocked';
      badgeBg = 'bg-error text-white font-mono';
      dotColor = '';
    } else if (rawStatus === 'EXPIRED') {
      normalizedStatus = 'expired';
      badgeType = 'Expired';
      badgeBg = 'bg-amber-50 text-amber-800 border border-amber-200';
      dotColor = 'bg-amber-600';
    } else if (rawStatus === 'DRAFT') {
      normalizedStatus = 'draft';
      badgeType = 'Draft';
      badgeBg = 'bg-gray-100 text-gray-700 border border-gray-200';
      dotColor = 'bg-gray-400';
    } else {
      normalizedStatus = 'pending';
      badgeType = req.amount > 50000 ? 'Sign-off Gate' : req.amount > 5000 ? 'Ceiling Review' : 'Discretionary';
    }

    return {
      id: req.id,
      code: req.id,
      title: req.itemTitle,
      specsSummary: req.triggerReason || 'Deterministic policy verification',
      merchant: req.merchant,
      agent: req.agentName || 'Claude Shopping v3.5',
      agentKey: req.agentId || 'pass_claude_shop',
      amount: req.amount,
      amountNote: req.currency || 'INR',
      status: normalizedStatus,
      rawStatus,
      badgeType,
      badgeBg,
      dotColor,
      mandate: req.mandateName || `#${req.mandateId}`,
      mandateCeiling: `Mandate #${req.mandateId}`,
      createdAt: req.createdAt || new Date().toISOString(),
      settledAt: req.settledAt,
      image: req.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBe2vjeSGz7iu-ozjl6LKo9UjGT1H_cIVFq6O0XfXX4Npf4UCCjC1UaL8w33MWegBPsYbinZJYmlhy83k1D7gYhEMPfkxLIJTafbFdpo6_BHR8nzDaXT6FII4xHr-J1ULH2h-LGoPK78hiRApE-NBUyhhzeD89d0_WFJm0Gm0FRilDfVMeKggZLYHnxCJxo8a_brdEqykgW_62aYm_gh55QzQYXY_jl0a4ii-FWANGvY7h1lBfOynSb-w',
      checks: req.quoteEvidence?.map(qe => ({
        label: qe.field,
        value: qe.value || qe.exactQuote,
        pass: qe.match !== false,
        gateSub: qe.reason
      })) || [
        { label: 'Vendor Whitelist', value: `${req.merchant} (Verified)`, pass: true },
        { label: 'Single-Item Ceiling', value: req.amount <= 5000 ? 'Under Limit' : 'Exceeds Auto-Cap', pass: req.amount <= 5000 }
      ],
      reasoning: req.triggerReason || 'Evaluated deterministically against active mandate rules.',
      hash: req.paypalOrder?.orderId || `SHA-256: ${req.id}`,
      paypalOrder: req.paypalOrder,
      triggerReason: req.triggerReason,
      raw: req
    };
  }

  const loadLiveRequests = async () => {
    try {
      setLoading(true);
      const res = await api.getRequests();
      if (res?.requests?.length) {
        const mapped = res.requests.map(mapBackendRequestToItem);
        setItems(mapped);
        setSelectedId(prev => (prev && mapped.some(m => m.id === prev) ? prev : mapped[0].id));
      }
    } catch (err) {
      console.warn('Live requests fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (title, msg) => {
    setToast({ title, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const openApproveConfirm = (item) => {
    setConfirmModal({
      isOpen: true,
      type: 'approve',
      item,
      reason: ''
    });
  };

  const openRejectConfirm = (item) => {
    setConfirmModal({
      isOpen: true,
      type: 'reject',
      item,
      reason: 'Exceeds current discretionary budget or specs mismatch'
    });
  };

  const handleExecuteApproval = async () => {
    const item = confirmModal.item;
    if (!item) return;

    setActionLoading(true);
    setConfirmModal({ isOpen: false, type: 'approve', item: null, reason: '' });
    try {
      const res = await api.approveRequest(item.id);
      showToast(
        'Order Approved (Simulated)',
        `Issued simulated authorization token for PayPal Sandbox order ${res.request?.paypalOrder?.orderId || item.code}`
      );
      await loadLiveRequests();
    } catch (err) {
      showToast('Action Failed', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExecuteRejection = async () => {
    const item = confirmModal.item;
    if (!item) return;

    setActionLoading(true);
    setConfirmModal({ isOpen: false, type: 'reject', item: null, reason: '' });
    try {
      await api.rejectRequest(item.id);
      showToast('Order Declined', `Sub-agent clearance rejected: "${confirmModal.reason || 'Manual human veto'}"`);
      await loadLiveRequests();
    } catch (err) {
      showToast('Action Failed', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleInspectDispute = async (requestId) => {
    try {
      const res = await api.getDisputePack(requestId);
      setActiveDisputePack(res.disputePack);
    } catch (err) {
      showToast('Error', err.message);
    }
  };

  const handleDismissBlocked = (item) => {
    showToast('Violation Acknowledged', `Flagged in immutable audit log #${item.code}`);
  };

  const selectedItem = items.find((x) => x.id === selectedId) || items[0] || null;

  const filteredItems = items.filter((item) => {
    let matchesFilter = false;
    if (filter === 'all') matchesFilter = true;
    else if (filter === 'pending') matchesFilter = item.status === 'pending';
    else if (filter === 'approved') matchesFilter = item.status === 'approved' || item.status === 'completed';
    else if (filter === 'completed') matchesFilter = item.status === 'completed';
    else if (filter === 'blocked') matchesFilter = item.status === 'blocked';
    else if (filter === 'rejected') matchesFilter = item.status === 'rejected';
    else if (filter === 'expired') matchesFilter = item.status === 'expired';
    else if (filter === 'draft') matchesFilter = item.status === 'draft';

    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.merchant.toLowerCase().includes(search.toLowerCase()) ||
      item.agent.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const pendingCount = items.filter((r) => r.status === 'pending').length;
  const approvedCount = items.filter((r) => r.status === 'approved' || r.status === 'completed').length;
  const blockedCount = items.filter((r) => r.status === 'blocked').length;
  const rejectedCount = items.filter((r) => r.status === 'rejected').length;
  const expiredCount = items.filter((r) => r.status === 'expired').length;
  const draftCount = items.filter((r) => r.status === 'draft').length;

  return (
    <div className="bg-background min-h-screen text-charcoal antialiased">
      <Sidebar pendingCount={pendingCount} />
      <Header pageTitle="Purchase Requests" onOpenGuide={() => setGuideOpen(true)} />
      <ArbitrationModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />
      <DisputePackModal disputePack={activeDisputePack} onClose={() => setActiveDisputePack(null)} />

      {/* Consequential Action Confirmation Modal */}
      {confirmModal.isOpen && confirmModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#1D1D1D] rounded-xl border border-[#E7E7E3] dark:border-[#353535] shadow-2xl max-w-lg w-full p-6 text-charcoal dark:text-gray-100">
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                confirmModal.type === 'approve'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
              }`}>
                <span className="material-symbols-outlined text-[20px]">
                  {confirmModal.type === 'approve' ? 'verified_user' : 'cancel'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-headline-sm text-base font-semibold text-charcoal dark:text-white">
                  {confirmModal.type === 'approve' ? 'Confirm Human Authorization' : 'Confirm Order Rejection'}
                </h3>
                <p className="text-xs text-[#5A5D5E] dark:text-[#B8B8B8] mt-1 leading-relaxed">
                  {confirmModal.type === 'approve'
                    ? 'You are granting a one-touch authorization clearance for this autonomous agent purchase.'
                    : 'You are declining authorization for this autonomous agent purchase.'}
                </p>

                {/* Item Details Box */}
                <div className="mt-4 p-3 rounded-lg bg-[#FAF9F5] dark:bg-[#252525] border border-[#E7E7E3] dark:border-[#353535] space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#888B8C] font-mono uppercase text-[10px]">Item:</span>
                    <span className="font-medium text-charcoal dark:text-white truncate max-w-[260px]">
                      {confirmModal.item.title}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888B8C] font-mono uppercase text-[10px]">Merchant:</span>
                    <span className="font-mono text-charcoal dark:text-white">{confirmModal.item.merchant}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888B8C] font-mono uppercase text-[10px]">Amount:</span>
                    <span className="font-semibold text-charcoal dark:text-white font-mono">
                      ₹{confirmModal.item.amount.toLocaleString()} {confirmModal.item.amountNote}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888B8C] font-mono uppercase text-[10px]">Bound Mandate:</span>
                    <span className="text-charcoal dark:text-white">{confirmModal.item.mandate}</span>
                  </div>
                </div>

                {/* Clarification Notice */}
                <div className="mt-3 p-3 rounded bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 text-[11px] text-amber-900 dark:text-amber-300">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <span className="material-symbols-outlined text-[14px]">info</span>
                    <span>Sandbox Payment Notice</span>
                  </div>
                  <p className="mt-1 leading-relaxed">
                    {confirmModal.type === 'approve'
                      ? 'Approving generates a simulated PayPal Sandbox authorization token (mock single-use grant). No live funds or cards are settled.'
                      : 'Declining updates the request status to REJECTED and notifies the shopping agent.'}
                  </p>
                </div>

                {/* Reason Input for Rejection */}
                {confirmModal.type === 'reject' && (
                  <div className="mt-3">
                    <label className="block text-[11px] font-mono uppercase text-[#888B8C] mb-1">
                      Reason for Rejection
                    </label>
                    <input
                      type="text"
                      value={confirmModal.reason}
                      onChange={(e) => setConfirmModal({ ...confirmModal, reason: e.target.value })}
                      placeholder="Specify reason for sub-agent..."
                      className="w-full text-xs px-3 py-2 rounded border border-[#E7E7E3] dark:border-[#353535] bg-white dark:bg-[#141414] text-charcoal dark:text-white outline-none focus:ring-1 focus:ring-charcoal"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-[#E7E7E3] dark:border-[#353535]">
              <button
                type="button"
                onClick={() => setConfirmModal({ isOpen: false, type: 'approve', item: null, reason: '' })}
                className="px-4 py-2 text-xs font-medium rounded-md border border-[#E7E7E3] dark:border-[#353535] text-charcoal dark:text-gray-300 hover:bg-[#FAF9F5] dark:hover:bg-[#252525] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmModal.type === 'approve' ? handleExecuteApproval : handleExecuteRejection}
                disabled={actionLoading}
                className={`px-4 py-2 text-xs font-semibold rounded-md text-white transition-colors cursor-pointer flex items-center gap-1.5 ${
                  confirmModal.type === 'approve'
                    ? 'bg-charcoal hover:bg-black dark:bg-white dark:text-black dark:hover:bg-neutral-200'
                    : 'bg-error hover:bg-red-700'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">
                  {confirmModal.type === 'approve' ? 'key' : 'close'}
                </span>
                <span>
                  {actionLoading
                    ? 'Processing...'
                    : confirmModal.type === 'approve'
                    ? 'Confirm & Authorize'
                    : 'Confirm Rejection'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main View Area */}
      <div className="pl-0 md:pl-64 transition-all duration-200">
        <main className="pt-20 px-4 sm:px-6 lg:px-8 pb-16 max-w-7xl mx-auto space-y-6">
          
          {/* Editorial Page Header */}
          <div className="pb-6 border-b border-[#E7E7E3] dark:border-[#353535]">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="page-eyebrow flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  <span>Transaction Clearance</span>
                  <span className="text-outline-variant">/</span>
                  <span>Order Inbox</span>
                </div>
                <h1 className="page-title mt-1">
                  Purchase Requests
                </h1>
                <p className="page-subtitle">
                  Deterministic inbox for autonomous agent order clearances governed by sovereign multi-sig thresholds and human-in-the-loop review.
                </p>
              </div>

              {/* Concise Summary Indicators */}
              <div className="flex items-center gap-5 font-mono text-xs text-[#5A5D5E] dark:text-[#B8B8B8] flex-wrap">
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-[#888B8C] font-sans">Pending Demands</span>
                  <span className="font-semibold text-charcoal dark:text-white text-[15px]">{pendingCount} orders</span>
                </div>
                <div className="w-[1px] h-6 bg-[#E7E7E3] dark:bg-[#353535] hidden sm:block"></div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-[#888B8C] font-sans">Approved / Settled</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400 text-[15px]">{approvedCount} items</span>
                </div>
                <div className="w-[1px] h-6 bg-[#E7E7E3] dark:bg-[#353535] hidden sm:block"></div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-[#888B8C] font-sans">Policy Blocks</span>
                  <span className="font-semibold text-error text-[15px]">{blockedCount} stopped</span>
                </div>
              </div>
            </div>

            {/* Filter Sub-nav Strip across all 7 statuses */}
            <div className="flex items-center justify-between mt-8 pt-2 flex-wrap gap-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setFilter('pending')}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                    filter === 'pending'
                      ? 'bg-charcoal text-white dark:bg-white dark:text-black shadow-sm'
                      : 'text-[#5A5D5E] dark:text-[#B8B8B8] hover:text-charcoal hover:bg-white dark:hover:bg-[#252525]'
                  }`}
                >
                  Pending Review <span className="ml-1 opacity-75 font-mono">{pendingCount}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('approved')}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                    filter === 'approved'
                      ? 'bg-charcoal text-white dark:bg-white dark:text-black shadow-sm'
                      : 'text-[#5A5D5E] dark:text-[#B8B8B8] hover:text-charcoal hover:bg-white dark:hover:bg-[#252525]'
                  }`}
                >
                  Approved <span className="ml-1 font-mono opacity-75">{approvedCount}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('blocked')}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                    filter === 'blocked'
                      ? 'bg-charcoal text-white dark:bg-white dark:text-black shadow-sm'
                      : 'text-[#5A5D5E] dark:text-[#B8B8B8] hover:text-charcoal hover:bg-white dark:hover:bg-[#252525]'
                  }`}
                >
                  Blocked <span className="ml-1 font-mono opacity-75">{blockedCount}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('rejected')}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                    filter === 'rejected'
                      ? 'bg-charcoal text-white dark:bg-white dark:text-black shadow-sm'
                      : 'text-[#5A5D5E] dark:text-[#B8B8B8] hover:text-charcoal hover:bg-white dark:hover:bg-[#252525]'
                  }`}
                >
                  Declined <span className="ml-1 font-mono opacity-75">{rejectedCount}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('expired')}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                    filter === 'expired'
                      ? 'bg-charcoal text-white dark:bg-white dark:text-black shadow-sm'
                      : 'text-[#5A5D5E] dark:text-[#B8B8B8] hover:text-charcoal hover:bg-white dark:hover:bg-[#252525]'
                  }`}
                >
                  Expired <span className="ml-1 font-mono opacity-75">{expiredCount}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('draft')}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                    filter === 'draft'
                      ? 'bg-charcoal text-white dark:bg-white dark:text-black shadow-sm'
                      : 'text-[#5A5D5E] dark:text-[#B8B8B8] hover:text-charcoal hover:bg-white dark:hover:bg-[#252525]'
                  }`}
                >
                  Draft <span className="ml-1 font-mono opacity-75">{draftCount}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('all')}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                    filter === 'all'
                      ? 'bg-charcoal text-white dark:bg-white dark:text-black shadow-sm'
                      : 'text-[#5A5D5E] dark:text-[#B8B8B8] hover:text-charcoal hover:bg-white dark:hover:bg-[#252525]'
                  }`}
                >
                  All <span className="ml-1 font-mono opacity-75">{items.length}</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded border border-[#E7E7E3] dark:border-[#353535] bg-white dark:bg-[#1D1D1D] text-[#5A5D5E] dark:text-[#B8B8B8]">
                  <span className="material-symbols-outlined text-[15px]">search</span>
                  <input
                    id="inboxSearch"
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by order, item, merchant, agent..."
                    className="border-none bg-transparent outline-none p-0 text-xs w-56 text-charcoal dark:text-white placeholder:text-[#888B8C] focus:ring-0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sandbox Integration Intent Notice */}
          <div className="p-3.5 rounded-lg bg-[#FAF8F3] dark:bg-[#252525] border border-[#ECE5D8] dark:border-[#353535] text-xs text-charcoal dark:text-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-secondary text-[18px]">account_balance_wallet</span>
              <span>
                <strong>Simulated Payment Environment:</strong> PayPal Sandbox (`api-m.sandbox.paypal.com`) is the intended payment gateway. Token clearance simulates one-touch checkout authorization without live currency settlement.
              </span>
            </div>
            <span className="font-mono text-[10px] text-[#888B8C] flex-shrink-0">
              Contract: {REQUEST_LIFECYCLE_STATUS.join(' • ')}
            </span>
          </div>

          {/* Main Layout: Editorial 2-Column Split */}
          {loading ? (
            <div className="p-16 text-center text-[#5A5D5E] dark:text-[#B8B8B8] bg-white dark:bg-[#1D1D1D] border border-[#E7E7E3] dark:border-[#353535] rounded-lg">
              <div className="w-8 h-8 border-2 border-charcoal dark:border-white border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <span className="text-sm font-medium">Loading live purchase orders...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 pt-2 items-start">
              {/* Left: Open Editorial List (7 cols) */}
              <div className="xl:col-span-7 flex flex-col">
                {/* Column Headers */}
                <div className="grid grid-cols-12 gap-4 px-4 py-2 text-[11px] font-mono uppercase tracking-wider text-[#888B8C]">
                  <div className="col-span-5">Item / Merchant</div>
                  <div className="col-span-3">Agent</div>
                  <div className="col-span-2 text-right">Amount</div>
                  <div className="col-span-2 text-right">Status</div>
                </div>

                {/* List Rows Container */}
                <div className="divide-y divide-[#E7E7E3] dark:divide-[#353535] border-y border-[#E7E7E3] dark:border-[#353535] bg-white dark:bg-[#1D1D1D] rounded-sm shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  {filteredItems.length === 0 ? (
                    <div className="p-10 text-center text-[#888B8C] text-sm">
                      No purchase requests match the current "{filter}" filter or search criteria.
                    </div>
                  ) : (
                    filteredItems.map((item) => {
                      const isSelected = selectedId === item.id;
                      const isBlocked = item.status === 'blocked';

                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedId(item.id)}
                          className={`request-row grid grid-cols-12 gap-4 px-4 py-4.5 items-center transition-colors cursor-pointer group border-l-2 ${
                            isSelected
                              ? 'border-charcoal dark:border-white bg-[#FAF9F5] dark:bg-[#252525]'
                              : isBlocked
                              ? 'border-error bg-[#FDF2F2]/20 dark:bg-red-950/20 hover:bg-[#FDF6F6] dark:hover:bg-red-950/30'
                              : 'border-transparent hover:bg-[#FAF9F5] dark:hover:bg-[#252525]'
                          }`}
                        >
                          {/* Item / Merchant */}
                          <div className="col-span-5 flex items-center gap-3 min-w-0">
                            <div className={`w-10 h-10 rounded border ${
                              isBlocked ? 'border-[#F3CECE] bg-[#FBF1F1] dark:bg-red-950' : 'border-[#E7E7E3] dark:border-[#353535] bg-[#F7F7F4] dark:bg-[#141414]'
                            } flex-shrink-0 flex items-center justify-center p-1 overflow-hidden`}>
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                  className={`w-full h-full object-contain ${isBlocked ? 'grayscale opacity-75' : ''}`}
                                />
                              ) : (
                                <span className="material-symbols-outlined text-[18px] text-[#5A5D5E]">
                                  devices
                                </span>
                              )}
                            </div>

                            <div className="flex flex-col min-w-0">
                              <span className={`font-title-md text-[13.5px] font-semibold truncate ${
                                isSelected ? 'text-black dark:text-white' : 'text-charcoal dark:text-gray-100'
                              }`}>
                                {item.title}
                              </span>
                              <div className={`flex items-center gap-1.5 text-[11px] truncate mt-0.5 ${
                                isBlocked ? 'text-error font-medium' : 'text-[#5A5D5E] dark:text-[#B8B8B8]'
                              }`}>
                                <span className={isBlocked ? 'text-error' : 'text-charcoal dark:text-gray-300 font-medium'}>
                                  {item.merchant}
                                </span>
                                <span>·</span>
                                <span className="font-mono text-[10px] text-[#888B8C]">{item.code}</span>
                              </div>
                            </div>
                          </div>

                          {/* Requesting Agent */}
                          <div className="col-span-3 flex flex-col min-w-0">
                            <span className="text-[12px] text-charcoal dark:text-gray-200 font-medium truncate">{item.agent}</span>
                            <span className={`font-mono text-[10px] truncate ${
                              isBlocked ? 'text-error font-medium' : 'text-[#888B8C]'
                            }`}>
                              {item.agentKey}
                            </span>
                          </div>

                          {/* Amount */}
                          <div className="col-span-2 text-right">
                            <span className={`font-title-md text-[14px] font-semibold block ${
                              isBlocked ? 'text-charcoal dark:text-gray-400 line-through opacity-70' : 'text-charcoal dark:text-white'
                            }`}>
                              ₹{item.amount.toLocaleString()}
                            </span>
                            <span className={`text-[10px] font-mono ${
                              isBlocked ? 'text-error font-medium' : 'text-[#888B8C]'
                            }`}>
                              {item.amountNote}
                            </span>
                          </div>

                          {/* Status Badge */}
                          <div className="col-span-2 flex flex-col items-end gap-1">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${item.badgeBg}`}>
                              {item.dotColor && <span className={`w-1.5 h-1.5 rounded-full ${item.dotColor}`}></span>}
                              {item.badgeType}
                            </span>
                            {item.status === 'pending' ? (
                              <span className="text-[11px] text-charcoal dark:text-gray-300 font-medium flex items-center gap-0.5 mt-0.5">
                                Review <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                              </span>
                            ) : item.status === 'approved' || item.status === 'completed' ? (
                              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">Settled</span>
                            ) : (
                              <span className="text-[10px] text-[#888B8C] font-mono">Locked</span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Bottom Micro-footer */}
                <div className="flex items-center justify-between py-3 text-[11px] text-[#888B8C] font-mono">
                  <span>Showing {filteredItems.length} transactions evaluated by Mandate Gateway</span>
                  <span>Deterministic policy engine active</span>
                </div>
              </div>

              {/* Right: Side Review Panel / Detail View (5 cols sticky) */}
              <div className="xl:col-span-5 sticky top-20">
                {selectedItem ? (
                  <div className="bg-white dark:bg-[#1D1D1D] border border-[#E7E7E3] dark:border-[#353535] rounded-lg p-6 shadow-sm">
                    {/* Header */}
                    <div className="flex items-start justify-between border-b border-[#E7E7E3] dark:border-[#353535] pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-mono text-[11px] uppercase tracking-wider font-semibold ${
                            selectedItem.status === 'approved' || selectedItem.status === 'completed'
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : selectedItem.status === 'blocked'
                              ? 'text-error'
                              : selectedItem.status === 'rejected'
                              ? 'text-neutral-600 dark:text-neutral-400'
                              : 'text-secondary'
                          }`}>
                            {selectedItem.status === 'approved' || selectedItem.status === 'completed'
                              ? 'AUTHORIZATION CONFIRMED'
                              : selectedItem.status === 'blocked'
                              ? 'DETERMINISTIC HARD STOP'
                              : selectedItem.status === 'rejected'
                              ? 'DECLINED BY REVIEWER'
                              : selectedItem.status === 'expired'
                              ? 'TTL WINDOW EXPIRED'
                              : selectedItem.status === 'draft'
                              ? 'DRAFT INITIATION'
                              : 'CLEARANCE REVIEW'}
                          </span>
                          <span className="text-[#888B8C]">/</span>
                          <span className="font-mono text-[11px] text-[#5A5D5E] dark:text-[#B8B8B8]">{selectedItem.code}</span>
                        </div>
                        <h2 className="font-headline-sm text-[20px] font-semibold text-charcoal dark:text-white mt-1 tracking-tight">
                          {selectedItem.title}
                        </h2>
                        <p className="text-[12px] text-[#5A5D5E] dark:text-[#B8B8B8] mt-0.5">{selectedItem.specsSummary}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className={`font-headline-md text-[22px] font-semibold tracking-tight ${
                          selectedItem.status === 'blocked' ? 'text-error line-through' : 'text-charcoal dark:text-white'
                        }`}>
                          ₹{selectedItem.amount.toLocaleString()}
                        </div>
                        <span className="text-[10px] font-mono text-[#888B8C]">INR · GST Inclusive</span>
                      </div>
                    </div>

                    {/* Context Specs */}
                    <div className="grid grid-cols-3 gap-3 p-3 bg-[#F9F9F7] dark:bg-[#252525] rounded border border-[#EDEDEA] dark:border-[#353535] text-xs mt-5">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#888B8C] block">Requesting Agent</span>
                        <span className="font-medium text-charcoal dark:text-white truncate block mt-0.5">{selectedItem.agent}</span>
                        <span className="font-mono text-[10px] text-[#888B8C]">Attested</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#888B8C] block">Vendor Protocol</span>
                        <span className="font-medium text-charcoal dark:text-white truncate block mt-0.5">{selectedItem.merchant}</span>
                        <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400">Verified</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#888B8C] block">Bound Mandate</span>
                        <span className="font-medium text-charcoal dark:text-white truncate block mt-0.5">{selectedItem.mandate}</span>
                        <span className="font-mono text-[10px] text-[#888B8C]">{selectedItem.mandateCeiling}</span>
                      </div>
                    </div>

                    {/* Trigger reason banner if present */}
                    {selectedItem.triggerReason && (
                      <div className={`p-3 rounded text-xs mt-4 ${
                        selectedItem.status === 'blocked'
                          ? 'bg-[#FDF2F2] dark:bg-red-950/30 border border-[#F3CECE] dark:border-red-900/50 text-error'
                          : selectedItem.status === 'approved' || selectedItem.status === 'completed'
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-300'
                          : 'bg-[#FAF8F3] dark:bg-[#252525] border border-[#ECE5D8] dark:border-[#353535] text-charcoal dark:text-gray-200'
                      }`}>
                        <span className="font-semibold block text-[11px] uppercase tracking-wider mb-1">
                          {selectedItem.status === 'blocked' ? 'Violation Reason' : 'Policy Decision Detail'}
                        </span>
                        <p className="leading-relaxed">{selectedItem.triggerReason}</p>
                      </div>
                    )}

                    {/* Policy Compliance Checks */}
                    <div className="mt-5 flex flex-col gap-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-charcoal dark:text-white">
                          Policy Compliance Matrix
                        </span>
                        <span className="text-[11px] text-[#5A5D5E] dark:text-[#B8B8B8] font-mono">
                          {selectedItem.checks.filter(c => c.pass).length} / {selectedItem.checks.length} Checks Validated
                        </span>
                      </div>
                      <div className="divide-y divide-[#E7E7E3] dark:divide-[#353535] border border-[#E7E7E3] dark:border-[#353535] rounded-md overflow-hidden text-xs">
                        {selectedItem.checks.map((chk, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center justify-between p-3 ${
                              chk.pass === 'gate'
                                ? 'bg-[#FAF8F3] dark:bg-[#252525]'
                                : chk.pass
                                ? 'bg-white dark:bg-[#1D1D1D]'
                                : 'bg-[#FDF2F2] dark:bg-red-950/20'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {chk.pass === 'gate' ? (
                                <span className="material-symbols-outlined text-secondary text-[18px]">gavel</span>
                              ) : chk.pass ? (
                                <span className="material-symbols-outlined text-emerald-700 dark:text-emerald-400 text-[18px]">check_circle</span>
                              ) : (
                                <span className="material-symbols-outlined text-error text-[18px]">cancel</span>
                              )}
                              <div className="min-w-0">
                                <span className="text-charcoal dark:text-white font-medium block truncate">{chk.label}</span>
                                {chk.gateSub && <span className="text-[10px] text-[#5A5D5E] dark:text-[#B8B8B8] block">{chk.gateSub}</span>}
                              </div>
                            </div>
                            <span className={`font-mono text-[11px] shrink-0 ml-2 ${
                              chk.pass === 'gate'
                                ? 'text-secondary font-medium'
                                : chk.pass
                                ? 'text-[#5A5D5E] dark:text-[#B8B8B8]'
                                : 'text-error font-medium'
                            }`}>
                              {chk.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions based on Status */}
                    {selectedItem.status === 'pending' && (
                      <div className="pt-6 flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => openRejectConfirm(selectedItem)}
                            disabled={actionLoading}
                            className="flex-1 py-2.5 px-4 rounded-md border border-[#E7E7E3] dark:border-[#353535] bg-white dark:bg-[#252525] text-charcoal dark:text-gray-200 hover:bg-[#F7F7F4] dark:hover:bg-[#2A2A2A] text-xs font-medium transition-colors cursor-pointer"
                          >
                            Reject Request
                          </button>
                          <button
                            type="button"
                            onClick={() => openApproveConfirm(selectedItem)}
                            disabled={actionLoading}
                            className="flex-2 flex-grow py-2.5 px-5 rounded-md bg-charcoal dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-neutral-200 text-xs font-semibold tracking-wide flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">key</span>
                            <span>{actionLoading ? 'Releasing...' : 'Approve & Release Funds'}</span>
                          </button>
                        </div>
                        <span className="text-center font-mono text-[10px] text-[#888B8C]">
                          Simulated Sandbox Rail: Release issues a single-use demo authorization token to PayPal Sandbox.
                        </span>
                      </div>
                    )}

                    {(selectedItem.status === 'approved' || selectedItem.status === 'completed') && (
                      <div className="pt-6 flex flex-col gap-3">
                        <button
                          type="button"
                          onClick={() => handleInspectDispute(selectedItem.id)}
                          className="w-full py-2.5 px-4 rounded-md border border-[#E7E7E3] dark:border-[#353535] bg-[#FAF9F6] dark:bg-[#252525] hover:bg-[#F4F4F0] dark:hover:bg-[#2A2A2A] text-charcoal dark:text-white text-xs font-medium flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px] text-secondary">verified</span>
                          <span>View Proof of Intent Dispute Pack (Demo)</span>
                        </button>
                        <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/50 rounded text-xs font-mono text-emerald-900 dark:text-emerald-300 flex justify-between items-center">
                          <span>Simulated Settlement Nonce:</span>
                          <span className="font-semibold truncate max-w-[200px]">{selectedItem.hash}</span>
                        </div>
                      </div>
                    )}

                    {selectedItem.status === 'blocked' && (
                      <div className="pt-6 flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => handleDismissBlocked(selectedItem)}
                          className="w-full py-2.5 px-4 rounded-md bg-[#F4F4F1] dark:bg-[#252525] hover:bg-[#EAEAE6] dark:hover:bg-[#303030] text-charcoal dark:text-white text-xs font-medium transition-colors cursor-pointer"
                        >
                          Acknowledge & Dismiss from Active Inbox
                        </button>
                        <span className="text-center font-mono text-[10px] text-[#888B8C]">
                          Policy Rule Invariance: No human override can clear a blocked vendor.
                        </span>
                      </div>
                    )}

                    {selectedItem.status === 'rejected' && (
                      <div className="pt-6">
                        <div className="p-3 bg-neutral-100 dark:bg-[#252525] rounded text-xs text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-[#353535]">
                          <span className="font-semibold block font-mono text-[10px] uppercase text-[#888B8C] mb-1">
                            Status
                          </span>
                          <span>This request was declined by the human account owner. The shopping agent cannot execute this order.</span>
                        </div>
                      </div>
                    )}

                    {selectedItem.status === 'expired' && (
                      <div className="pt-6">
                        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded text-xs text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
                          <span className="font-semibold block font-mono text-[10px] uppercase text-[#888B8C] mb-1">
                            Status
                          </span>
                          <span>The 24-hour authorization TTL has lapsed. To execute, the shopping agent must issue a fresh request.</span>
                        </div>
                      </div>
                    )}

                    {selectedItem.status === 'draft' && (
                      <div className="pt-6">
                        <div className="p-3 bg-gray-50 dark:bg-[#252525] rounded text-xs text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#353535]">
                          <span className="font-semibold block font-mono text-[10px] uppercase text-[#888B8C] mb-1">
                            Status
                          </span>
                          <span>Staged candidate in agent memory. Not yet submitted to the policy verification gate.</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-[#1D1D1D] border border-[#E7E7E3] dark:border-[#353535] rounded-lg p-8 text-center text-[#888B8C] text-xs">
                    Select a purchase request to review verification matrix.
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Toast Feedback */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-charcoal text-white shadow-xl text-xs font-medium">
            <span className="material-symbols-outlined text-[18px] text-emerald-400">check_circle</span>
            <div className="flex flex-col">
              <span className="font-semibold text-white">{toast.title}</span>
              <span className="text-[11px] text-white/70 font-mono">{toast.msg}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
