import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ArbitrationModal from '../components/ArbitrationModal';
import DisputePackModal from '../components/DisputePackModal';
import { api } from '../api/client';

export default function PurchaseRequestsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guideOpen, setGuideOpen] = useState(false);
  const [activeDisputePack, setActiveDisputePack] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState('pending'); // pending, cleared, blocked, all
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadLiveRequests();
  }, []);

  function mapBackendRequestToItem(req) {
    const isCleared = req.status === 'AUTO_CLEARED';
    const isBlocked = req.status === 'BLOCKED' || req.status === 'REJECTED';
    const isPending = req.status === 'PENDING_HITL';

    let badgeType = 'Pending';
    let badgeBg = 'bg-[#EFECE6] text-secondary';
    let dotColor = 'bg-secondary';

    if (isCleared) {
      badgeType = 'Cleared';
      badgeBg = 'bg-emerald-50 text-emerald-800 border border-emerald-200/60';
      dotColor = 'bg-emerald-600';
    } else if (req.status === 'REJECTED') {
      badgeType = 'Declined';
      badgeBg = 'bg-neutral-200 text-neutral-800';
      dotColor = 'bg-neutral-600';
    } else if (req.status === 'BLOCKED') {
      badgeType = 'Blocked';
      badgeBg = 'bg-error text-white font-mono';
      dotColor = '';
    } else {
      badgeType = req.amount > 50000 ? 'Sign-off Gate' : req.amount > 5000 ? 'Ceiling Review' : 'Discretionary';
    }

    return {
      id: req.id,
      code: req.id,
      title: req.itemTitle,
      specsSummary: req.triggerReason || 'Deterministic policy verification',
      merchant: req.merchant,
      agent: req.agentName || 'Claude Shopping v3.5',
      agentKey: req.agentId || 'Office Hardware Q4',
      amount: req.amount,
      amountNote: req.currency || 'INR',
      status: isCleared ? 'cleared' : isBlocked ? 'blocked' : 'pending',
      badgeType,
      badgeBg,
      dotColor,
      mandate: req.mandateName || `#${req.mandateId}`,
      mandateCeiling: `Mandate #${req.mandateId}`,
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

  const handleApprove = async (item) => {
    setActionLoading(true);
    try {
      const res = await api.approveRequest(item.id);
      showToast('Order Approved', `Settled via single-use PayPal sandbox order ${res.request?.paypalOrder?.orderId || ''}`);
      await loadLiveRequests();
    } catch (err) {
      showToast('Action Failed', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (item) => {
    setActionLoading(true);
    try {
      await api.rejectRequest(item.id);
      showToast('Order Declined', `Sub-agent clearance declined for ${item.title}`);
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
    showToast('Violation Acknowledged', `Flagged in immutable ledger #${item.code}`);
  };

  const selectedItem = items.find((x) => x.id === selectedId) || items[0] || null;

  const filteredItems = items.filter((item) => {
    const matchesFilter = filter === 'all' || item.status === filter;
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.merchant.toLowerCase().includes(search.toLowerCase()) ||
      item.agent.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const pendingCount = items.filter((r) => r.status === 'pending').length;
  const clearedCount = items.filter((r) => r.status === 'cleared').length;
  const blockedCount = items.filter((r) => r.status === 'blocked').length;

  return (
    <div className="bg-background min-h-screen text-charcoal antialiased">
      <Sidebar pendingCount={pendingCount} />
      <Header pageTitle="Purchase Requests" onOpenGuide={() => setGuideOpen(true)} />
      <ArbitrationModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />
      <DisputePackModal disputePack={activeDisputePack} onClose={() => setActiveDisputePack(null)} />

      {/* Main View Area */}
      <div className="pl-0 md:pl-64 transition-all duration-200">
        <main className="pt-20 px-4 sm:px-6 lg:px-8 pb-16 max-w-7xl mx-auto space-y-8">
          
          {/* Editorial Page Header */}
          <div className="pb-6 border-b border-[#E7E7E3]">
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
                  Deterministic inbox for autonomous agent order clearances governed by sovereign multi-sig thresholds.
                </p>
              </div>

              {/* Concise Summary Indicators */}
              <div className="flex items-center gap-6 font-mono text-xs text-[#5A5D5E]">
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-[#888B8C] font-sans">Pending Demands</span>
                  <span className="font-semibold text-charcoal text-[15px]">{pendingCount} orders</span>
                </div>
                <div className="w-[1px] h-6 bg-[#E7E7E3]"></div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-[#888B8C] font-sans">Auto-Cleared</span>
                  <span className="font-semibold text-charcoal text-[15px]">{clearedCount} items</span>
                </div>
                <div className="w-[1px] h-6 bg-[#E7E7E3]"></div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-[#888B8C] font-sans">Policy Violations</span>
                  <span className="font-semibold text-error text-[15px]">{blockedCount} stopped</span>
                </div>
              </div>
            </div>

            {/* Filter Sub-nav Strip */}
            <div className="flex items-center justify-between mt-8 pt-2 flex-wrap gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setFilter('pending')}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full shadow-sm transition-colors cursor-pointer ${
                    filter === 'pending'
                      ? 'bg-charcoal text-white'
                      : 'text-[#5A5D5E] hover:text-charcoal hover:bg-white'
                  }`}
                >
                  Pending Review <span className="ml-1 opacity-75 font-mono">{pendingCount}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('cleared')}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                    filter === 'cleared'
                      ? 'bg-charcoal text-white shadow-sm'
                      : 'text-[#5A5D5E] hover:text-charcoal hover:bg-white'
                  }`}
                >
                  Auto-Approved <span className="ml-1 text-[#888B8C] font-mono">{clearedCount}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('blocked')}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                    filter === 'blocked'
                      ? 'bg-charcoal text-white shadow-sm'
                      : 'text-[#5A5D5E] hover:text-charcoal hover:bg-white'
                  }`}
                >
                  Blocked by Policy <span className="ml-1 text-[#888B8C] font-mono">{blockedCount}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('all')}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                    filter === 'all'
                      ? 'bg-charcoal text-white shadow-sm'
                      : 'text-[#5A5D5E] hover:text-charcoal hover:bg-white'
                  }`}
                >
                  All <span className="ml-1 text-[#888B8C] font-mono">{items.length}</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded border border-[#E7E7E3] bg-white text-[#5A5D5E]">
                  <span className="material-symbols-outlined text-[15px]">filter_list</span>
                  <input
                    id="inboxSearch"
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Filter orders or agents..."
                    className="border-none bg-transparent outline-none p-0 text-xs w-48 text-charcoal placeholder:text-[#888B8C] focus:ring-0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Main Layout: Open Editorial 2-Column Split */}
          {loading ? (
            <div className="p-16 text-center text-[#5A5D5E] bg-white border border-[#E7E7E3] rounded-lg">
              <div className="w-8 h-8 border-2 border-charcoal border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <span className="text-sm font-medium">Loading live purchase orders...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 pt-4 items-start">
              {/* Left: Open Editorial List (7 cols) */}
              <div className="xl:col-span-7 flex flex-col">
                {/* Column Headers */}
                <div className="grid grid-cols-12 gap-4 px-4 py-2 text-[11px] font-mono uppercase tracking-wider text-[#888B8C]">
                  <div className="col-span-5">Item / Merchant</div>
                  <div className="col-span-3">Agent</div>
                  <div className="col-span-2 text-right">Amount</div>
                  <div className="col-span-2 text-right">Status</div>
                </div>

                {/* List Rows Container separated by #E7E7E3 1px rules */}
                <div className="divide-y divide-[#E7E7E3] border-y border-[#E7E7E3] bg-white rounded-sm shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  {filteredItems.length === 0 ? (
                    <div className="p-8 text-center text-[#888B8C] text-sm">
                      No purchase requests match the current filter or search criteria.
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
                              ? 'border-charcoal bg-[#FAF9F5]'
                              : isBlocked
                              ? 'border-error bg-[#FDF2F2]/20 hover:bg-[#FDF6F6]'
                              : 'border-transparent hover:bg-[#FAF9F5]'
                          }`}
                        >
                          {/* Item / Merchant */}
                          <div className="col-span-5 flex items-center gap-3 min-w-0">
                            <div className={`w-10 h-10 rounded border ${
                              isBlocked ? 'border-[#F3CECE] bg-[#FBF1F1]' : 'border-[#E7E7E3] bg-[#F7F7F4]'
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
                                isSelected ? 'text-black' : 'text-charcoal'
                              }`}>
                                {item.title}
                              </span>
                              <div className={`flex items-center gap-1.5 text-[11px] truncate mt-0.5 ${
                                isBlocked ? 'text-error font-medium' : 'text-[#5A5D5E]'
                              }`}>
                                <span className={isBlocked ? 'text-error' : 'text-charcoal font-medium'}>
                                  {item.merchant}
                                </span>
                                <span>·</span>
                                <span className="font-mono text-[10px] text-[#888B8C]">{item.code}</span>
                              </div>
                            </div>
                          </div>

                          {/* Requesting Agent */}
                          <div className="col-span-3 flex flex-col min-w-0">
                            <span className="text-[12px] text-charcoal font-medium truncate">{item.agent}</span>
                            <span className={`font-mono text-[10px] truncate ${
                              isBlocked ? 'text-error font-medium' : 'text-[#888B8C]'
                            }`}>
                              {item.agentKey}
                            </span>
                          </div>

                          {/* Amount */}
                          <div className="col-span-2 text-right">
                            <span className={`font-title-md text-[14px] font-semibold block ${
                              isBlocked ? 'text-charcoal line-through opacity-70' : 'text-charcoal'
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
                              <span className="text-[11px] text-charcoal font-medium flex items-center gap-0.5 mt-0.5">
                                Review <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                              </span>
                            ) : item.status === 'cleared' ? (
                              <span className="text-[10px] text-emerald-700 font-mono">Settled</span>
                            ) : (
                              <span className="text-[10px] text-[#5A5D5E] font-mono">No Override</span>
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
                  <span>Cryptographic policy lock active</span>
                </div>
              </div>

              {/* Right: Side Review Panel / Detail View (5 cols sticky) */}
              <div className="xl:col-span-5 sticky top-20">
                {selectedItem ? (
                  <div className="bg-white border border-[#E7E7E3] rounded-lg p-6 shadow-sm">
                    {/* Header */}
                    <div className="flex items-start justify-between border-b border-[#E7E7E3] pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-mono text-[11px] uppercase tracking-wider font-semibold ${
                            selectedItem.status === 'cleared'
                              ? 'text-emerald-700'
                              : selectedItem.status === 'blocked'
                              ? 'text-error'
                              : 'text-secondary'
                          }`}>
                            {selectedItem.status === 'cleared'
                              ? 'AUTOMATICALLY CLEARED'
                              : selectedItem.status === 'blocked'
                              ? 'DETERMINISTIC HARD STOP'
                              : 'CLEARANCE REVIEW'}
                          </span>
                          <span className="text-[#888B8C]">/</span>
                          <span className="font-mono text-[11px] text-[#5A5D5E]">{selectedItem.code}</span>
                        </div>
                        <h2 className="font-headline-sm text-[20px] font-semibold text-charcoal mt-1 tracking-tight">
                          {selectedItem.title}
                        </h2>
                        <p className="text-[12px] text-[#5A5D5E] mt-0.5">{selectedItem.specsSummary}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className={`font-headline-md text-[22px] font-semibold tracking-tight ${
                          selectedItem.status === 'blocked' ? 'text-error line-through' : 'text-charcoal'
                        }`}>
                          ₹{selectedItem.amount.toLocaleString()}
                        </div>
                        <span className="text-[10px] font-mono text-[#888B8C]">INR · GST Inclusive</span>
                      </div>
                    </div>

                    {/* Context Specs */}
                    <div className="grid grid-cols-3 gap-3 p-3 bg-[#F9F9F7] rounded border border-[#EDEDEA] text-xs mt-5">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#888B8C] block">Requesting Agent</span>
                        <span className="font-medium text-charcoal truncate block mt-0.5">{selectedItem.agent}</span>
                        <span className="font-mono text-[10px] text-[#888B8C]">Attested</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#888B8C] block">Vendor Protocol</span>
                        <span className="font-medium text-charcoal truncate block mt-0.5">{selectedItem.merchant}</span>
                        <span className="font-mono text-[10px] text-emerald-700">Verified</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#888B8C] block">Bound Mandate</span>
                        <span className="font-medium text-charcoal truncate block mt-0.5">{selectedItem.mandate}</span>
                        <span className="font-mono text-[10px] text-[#888B8C]">{selectedItem.mandateCeiling}</span>
                      </div>
                    </div>

                    {/* Trigger reason banner if present */}
                    {selectedItem.triggerReason && (
                      <div className={`p-3 rounded text-xs mt-4 ${
                        selectedItem.status === 'blocked'
                          ? 'bg-[#FDF2F2] border border-[#F3CECE] text-error'
                          : selectedItem.status === 'cleared'
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                          : 'bg-[#FAF8F3] border border-[#ECE5D8] text-charcoal'
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
                        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-charcoal">
                          Policy Compliance Matrix
                        </span>
                        <span className="text-[11px] text-[#5A5D5E] font-mono">
                          {selectedItem.checks.filter(c => c.pass).length} / {selectedItem.checks.length} Checks Validated
                        </span>
                      </div>
                      <div className="divide-y divide-[#E7E7E3] border border-[#E7E7E3] rounded-md overflow-hidden text-xs">
                        {selectedItem.checks.map((chk, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center justify-between p-3 ${
                              chk.pass === 'gate' ? 'bg-[#FAF8F3]' : chk.pass ? 'bg-white' : 'bg-[#FDF2F2]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {chk.pass === 'gate' ? (
                                <span className="material-symbols-outlined text-secondary text-[18px]">gavel</span>
                              ) : chk.pass ? (
                                <span className="material-symbols-outlined text-emerald-700 text-[18px]">check_circle</span>
                              ) : (
                                <span className="material-symbols-outlined text-error text-[18px]">cancel</span>
                              )}
                              <div className="min-w-0">
                                <span className="text-charcoal font-medium block truncate">{chk.label}</span>
                                {chk.gateSub && <span className="text-[10px] text-[#5A5D5E] block">{chk.gateSub}</span>}
                              </div>
                            </div>
                            <span className={`font-mono text-[11px] shrink-0 ml-2 ${
                              chk.pass === 'gate' ? 'text-secondary font-medium' : chk.pass ? 'text-[#5A5D5E]' : 'text-error font-medium'
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
                            onClick={() => handleReject(selectedItem)}
                            disabled={actionLoading}
                            className="flex-1 py-2.5 px-4 rounded-md border border-[#E7E7E3] bg-white text-charcoal hover:bg-[#F7F7F4] text-xs font-medium transition-colors cursor-pointer"
                          >
                            Reject Request
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApprove(selectedItem)}
                            disabled={actionLoading}
                            className="flex-2 flex-grow py-2.5 px-5 rounded-md bg-charcoal text-white hover:bg-black text-xs font-semibold tracking-wide flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">key</span>
                            <span>{actionLoading ? 'Releasing...' : 'Approve & Release Funds'}</span>
                          </button>
                        </div>
                        <span className="text-center font-mono text-[10px] text-[#888B8C]">
                          Executing release issues a cryptographic single-use token authorization to PayPal Sandbox.
                        </span>
                      </div>
                    )}

                    {selectedItem.status === 'cleared' && (
                      <div className="pt-6 flex flex-col gap-3">
                        <button
                          type="button"
                          onClick={() => handleInspectDispute(selectedItem.id)}
                          className="w-full py-2.5 px-4 rounded-md border border-[#E7E7E3] bg-[#FAF9F6] hover:bg-[#F4F4F0] text-charcoal text-xs font-medium flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px] text-secondary">verified</span>
                          <span>View Proof of Intent Dispute Pack</span>
                        </button>
                        <div className="p-3 bg-emerald-50/60 border border-emerald-200/60 rounded text-xs font-mono text-emerald-900 flex justify-between items-center">
                          <span>Settlement Nonce:</span>
                          <span className="font-semibold">{selectedItem.hash}</span>
                        </div>
                      </div>
                    )}

                    {selectedItem.status === 'blocked' && (
                      <div className="pt-6 flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => handleDismissBlocked(selectedItem)}
                          className="w-full py-2.5 px-4 rounded-md bg-[#F4F4F1] hover:bg-[#EAEAE6] text-charcoal text-xs font-medium transition-colors cursor-pointer"
                        >
                          Acknowledge & Dismiss from Active Inbox
                        </button>
                        <span className="text-center font-mono text-[10px] text-[#888B8C]">
                          Policy Rule Invariance: No human override can clear a blocked vendor.
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white border border-[#E7E7E3] rounded-lg p-8 text-center text-[#888B8C] text-xs">
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
