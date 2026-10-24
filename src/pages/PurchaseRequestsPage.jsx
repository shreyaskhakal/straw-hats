import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ArbitrationModal from '../components/ArbitrationModal';
import DisputePackModal from '../components/DisputePackModal';
import { api } from '../api/client';

export default function PurchaseRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guideOpen, setGuideOpen] = useState(false);
  const [activeDisputePack, setActiveDisputePack] = useState(null);
  const [selectedId, setSelectedId] = useState('lenovo');
  const [filter, setFilter] = useState('pending'); // pending, cleared, blocked, all
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Canonical mock + live requests pool matching Stitch
  const initialItems = [
    {
      id: 'lenovo',
      code: 'ORD-8821-X',
      title: 'Lenovo ThinkPad X1 Carbon Gen 12',
      specsSummary: 'Intel Core Ultra 7 · 32GB LPDDR5X · 1TB Gen4 NVMe SSD',
      merchant: 'Lenovo Official Store',
      agent: 'Claude Shopping v3.5',
      agentKey: 'Key: 0x981A...3C02',
      amount: 124990,
      amountNote: 'INR (Incl. Tax)',
      status: 'pending',
      badgeType: 'Sign-off',
      badgeBg: 'bg-[#EFECE6] text-secondary',
      dotColor: 'bg-secondary',
      mandate: '#M-902 HW',
      mandateCeiling: '₹1.5L Ceiling',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBe2vjeSGz7iu-ozjl6LKo9UjGT1H_cIVFq6O0XfXX4Npf4UCCjC1UaL8w33MWegBPsYbinZJYmlhy83k1D7gYhEMPfkxLIJTafbFdpo6_BHR8nzDaXT6FII4xHr-J1ULH2h-LGoPK78hiRApE-NBUyhhzeD89d0_WFJm0Gm0FRilDfVMeKggZLYHnxCJxo8a_brdEqykgW_62aYm_gh55QzQYXY_jl0a4ii-FWANGvY7h1lBfOynSb-w',
      checks: [
        { label: 'Memory Specification', value: '32GB (Req ≥ 16GB)', pass: true },
        { label: 'Storage Capacity', value: '1TB NVMe (Req ≥ 512GB)', pass: true },
        { label: 'Vendor Whitelist', value: 'Lenovo Direct (Verified)', pass: true },
        { label: 'Multi-Sig Value Gate', value: 'Requires Sovereign Sign', pass: 'gate', gateSub: 'Exceeds ₹50,000 auto-cap threshold' }
      ],
      reasoning: '“Configured for Elena Vance hardware refresh. Selected direct OEM store to secure enterprise 3-year Premier Support warranty with certified corporate tax invoice deducting full input credit. Evaluated against 5 distributors; direct checkout provided fastest compliant fulfillment.”',
      hash: 'SHA-256: 8efc2299b80fae00318dcbfa16772990aa419f0'
    },
    {
      id: 'logitech',
      code: 'ORD-8824-M',
      title: 'Logitech G502 HERO Gaming Mouse',
      specsSummary: '25K HERO Sensor · 11 Programmable Buttons · Direct USB',
      merchant: 'Croma Electronics',
      agent: 'Claude Shopping v3.5',
      agentKey: 'Office Hardware Q4',
      amount: 3895,
      amountNote: '+₹895 Cap',
      status: 'pending',
      badgeType: 'Discretionary',
      badgeBg: 'bg-[#EFECE6] text-secondary',
      dotColor: 'bg-secondary',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuABIIxUD2vF3ZgYMg4JYOpY6ZSxNK0BSvTXwn-pz2prQE_8Y8QZRyFVW1jXrPsMfI62_M5d4ya3SECAJZ6gb-zPvkzEQdhizZ36PcT-1uBRqtsoSzfiwCUTsqwKN-RbCLpoRIuXnMjxUXDiamU00lfVbAPDD8WIFcyn36nD1rBFbayj8sRI8lEQQ_xGuBFwzhkpiKytIi0GVycIhndS1gPcEKX576M8dDHGQ2zzbMcYxPanu-o1vI9zZQ',
      checks: [
        { label: 'Merchant Protocol', value: 'Croma (Verified)', pass: true },
        { label: 'Monthly Allocation Cap', value: 'Within ₹3L Pool', pass: true }
      ],
      triggerReason: 'Price exceeds unattended threshold (₹3,000) by ₹895, but remains well within the ₹5,000 standard hardware limit. Whitelisted merchant: Croma Electronics.'
    },
    {
      id: 'blocked',
      code: 'ORD-8819-B',
      title: 'Logitech MX Master 3S',
      specsSummary: 'Attempted Agent Dispatch via Unvetted Portal',
      merchant: 'TechBazaar.in (Unverified)',
      agent: 'Perplexity Buy',
      agentKey: 'Unvetted Destination',
      amount: 8995,
      amountNote: 'Cap Breach',
      status: 'blocked',
      badgeType: 'Blocked',
      badgeBg: 'bg-error text-white font-mono',
      dotColor: '',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUxqJb1nlvEMameqzB8hqwH978Ea9Gs5RVPQe54D1kJR3wXzufcgeFAKx_eH6KlHji5p-0PW58LV-0af_5HyzjXfgt3OMczMrLrjlcVWsn_cYKD_UwDTwi5-wK6IM9Rxyd4C-yDiMZpoDd23EhxYbht-4DgKudEkk3F-rN3eUn0P7bILwliirTu_0bkA65gbAjtPqKxGwHiAR9kTMm3KpL31p0E6kqUQ6-9bqLdvWEaGy1jclyvWCiuw',
      checks: [
        { label: 'Merchant Whitelist Check', value: 'FAILED (Unvetted)', pass: false },
        { label: 'Unit Price Cap (<₹5k)', value: 'FAILED (₹8,995)', pass: false }
      ]
    },
    {
      id: 'dock',
      code: 'ORD-8798-D',
      title: 'Dell Thunderbolt 4 Docking Hub',
      specsSummary: 'Settled autonomously via micro-mandate zero touch clearance',
      merchant: 'Dell Direct',
      agent: 'Claude Shopping v3.5',
      agentKey: 'Cleared 14m ago',
      amount: 18400,
      amountNote: 'Within Band',
      status: 'cleared',
      badgeType: 'Cleared',
      badgeBg: 'bg-emerald-50 text-emerald-800 border border-emerald-200/60',
      dotColor: 'bg-emerald-600',
      icon: 'hub',
      hash: '0x4a19...9b1c'
    },
    {
      id: 'charger',
      code: 'ORD-8790-A',
      title: 'Apple 140W USB-C Power Adapter',
      specsSummary: 'Settled autonomously via micro-mandate zero touch clearance',
      merchant: 'Apple India Official',
      agent: 'Claude Shopping v3.5',
      agentKey: 'Cleared 1h ago',
      amount: 8900,
      amountNote: 'Mandate Matched',
      status: 'cleared',
      badgeType: 'Cleared',
      badgeBg: 'bg-emerald-50 text-emerald-800 border border-emerald-200/60',
      dotColor: 'bg-emerald-600',
      icon: 'power',
      hash: '0x3f88...2e09'
    },
    {
      id: 'cables',
      code: 'ORD-8785-B',
      title: 'Belkin Thunderbolt 4 Passive Cable (2m)',
      specsSummary: 'Settled autonomously via micro-mandate zero touch clearance',
      merchant: 'Amazon Business',
      agent: 'Claude Shopping v3.5',
      agentKey: 'Cleared 3h ago',
      amount: 4200,
      amountNote: 'Micro-mandate',
      status: 'cleared',
      badgeType: 'Cleared',
      badgeBg: 'bg-emerald-50 text-emerald-800 border border-emerald-200/60',
      dotColor: 'bg-emerald-600',
      icon: 'cable',
      hash: '0x7c12...4d55'
    }
  ];

  const [items, setItems] = useState(initialItems);

  useEffect(() => {
    loadLiveRequests();
  }, []);

  const loadLiveRequests = async () => {
    try {
      const res = await api.getRequests();
      if (res?.requests?.length) {
        setRequests(res.requests);
      }
    } catch (err) {
      console.warn('Live requests fetch fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (title, msg) => {
    setToast({ title, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = async (item) => {
    setActionLoading(true);
    try {
      await api.approveRequest(item.code || item.id);
      showToast('Order Approved', `Funds released to virtual settlement node for ${item.title}`);
      setItems(items.map((it) => (it.id === item.id ? { ...it, status: 'cleared', badgeType: 'Cleared', badgeBg: 'bg-emerald-50 text-emerald-800', dotColor: 'bg-emerald-600' } : it)));
    } catch (err) {
      showToast('Order Approved', `Single-use PayPal order generated for ${item.title}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (item) => {
    setActionLoading(true);
    try {
      await api.rejectRequest(item.code || item.id);
      showToast('Order Declined', `Sub-agent clearance declined for ${item.title}`);
      setItems(items.map((it) => (it.id === item.id ? { ...it, status: 'blocked', badgeType: 'Declined', badgeBg: 'bg-error text-white' } : it)));
    } catch (err) {
      showToast('Order Declined', `Sub-agent clearance declined for ${item.title}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDismissBlocked = (item) => {
    showToast('Violation Acknowledged', 'Flagged in immutable ledger #M-902');
  };

  const selectedItem = items.find((x) => x.id === selectedId) || items[0];

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
                  <span className="text-[11px] text-[#888B8C] ml-1">(₹1,28,885)</span>
                </div>
                <div className="w-[1px] h-6 bg-[#E7E7E3]"></div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-[#888B8C] font-sans">Auto-Cleared</span>
                  <span className="font-semibold text-charcoal text-[15px]">{clearedCount} items</span>
                  <span className="text-[11px] text-[#888B8C] ml-1">(₹31,500)</span>
                </div>
                <div className="w-[1px] h-6 bg-[#E7E7E3]"></div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-[#888B8C] font-sans">Policy Violations</span>
                  <span className="font-semibold text-error text-[15px]">{blockedCount} stopped</span>
                </div>
              </div>
            </div>

            {/* Filter Sub-nav Strip */}
            <div className="flex items-center justify-between mt-8 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFilter('pending')}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full shadow-sm transition-colors ${
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
                  className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
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
                  className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
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
                  className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
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
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 pt-4 items-start">
            
            {/* Left: Open Editorial List (7 cols) */}
            <div className="xl:col-span-7 flex flex-col">
              {/* Column Headers */}
              <div className="grid grid-cols-12 gap-4 px-4 py-2 text-[11px] font-mono uppercase tracking-wider text-[#888B8C]">
                <div className="col-span-5">Item / Merchant</div>
                <div className="col-span-3">Agent</div>
                <div className="col-span-2 text-right">Amount</div>
                <div className="col-span-2 text-right">Status & Action</div>
              </div>

              {/* List Rows Container separated by #E7E7E3 1px rules */}
              <div className="divide-y divide-[#E7E7E3] border-y border-[#E7E7E3] bg-white rounded-sm shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                {filteredItems.map((item) => {
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
                              {item.icon || 'devices'}
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

                      {/* Status Badge / Action */}
                      <div className="col-span-2 flex flex-col items-end gap-1">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${item.badgeBg}`}>
                          {item.dotColor && <span className={`w-1.5 h-1.5 rounded-full ${item.dotColor}`}></span>}
                          {item.badgeType}
                        </span>
                        {item.status === 'pending' ? (
                          <button
                            type="button"
                            className="text-[11px] text-charcoal hover:underline font-semibold flex items-center gap-0.5 mt-0.5"
                          >
                            <span>Review</span>
                            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                          </button>
                        ) : item.status === 'cleared' ? (
                          <span className="text-[10px] text-[#888B8C] font-mono">Self-settled</span>
                        ) : (
                          <span className="text-[10px] text-[#5A5D5E] font-mono">No Override</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Micro-footer */}
              <div className="flex items-center justify-between py-3 text-[11px] text-[#888B8C] font-mono">
                <span>Showing {items.length} transactions evaluated by Mandate Engine #M-902</span>
                <span>Cryptographic multi-sig lock active</span>
              </div>
            </div>

            {/* Right: Side Review Panel / Detail View (5 cols sticky) */}
            <div className="xl:col-span-5 sticky top-20">
              <div className="bg-white border border-[#E7E7E3] rounded-lg p-6 shadow-sm">
                
                {/* 1. LENOVO / HIGH-VALUE REVIEW VIEW */}
                {selectedItem.id === 'lenovo' && (
                  <div className="flex flex-col gap-6">
                    <div className="flex items-start justify-between border-b border-[#E7E7E3] pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] uppercase tracking-wider text-[#5A5D5E]">
                            Review Clearance Request
                          </span>
                          <span className="text-[#888B8C]">/</span>
                          <span className="font-mono text-[11px] font-semibold text-charcoal">{selectedItem.code}</span>
                        </div>
                        <h2 className="font-headline-sm text-[20px] font-semibold text-charcoal mt-1 tracking-tight">
                          {selectedItem.title}
                        </h2>
                        <p className="text-[12px] text-[#5A5D5E] mt-0.5">{selectedItem.specsSummary}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-headline-md text-[22px] font-semibold text-charcoal tracking-tight">
                          ₹{selectedItem.amount.toLocaleString()}
                        </div>
                        <span className="text-[10px] font-mono text-[#888B8C]">GST Inclusive (18%)</span>
                      </div>
                    </div>

                    {/* Context Specs 3-column strip */}
                    <div className="grid grid-cols-3 gap-3 p-3 bg-[#F9F9F7] rounded border border-[#EDEDEA] text-xs">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#888B8C] block">Requesting Agent</span>
                        <span className="font-medium text-charcoal truncate block mt-0.5">{selectedItem.agent}</span>
                        <span className="font-mono text-[10px] text-[#888B8C]">v3.5 sovereign</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#888B8C] block">Vendor Protocol</span>
                        <span className="font-medium text-charcoal truncate block mt-0.5">{selectedItem.merchant}</span>
                        <span className="font-mono text-[10px] text-[#888B8C]">Whitelisted</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#888B8C] block">Bound Mandate</span>
                        <span className="font-medium text-charcoal truncate block mt-0.5">{selectedItem.mandate}</span>
                        <span className="font-mono text-[10px] text-[#888B8C]">{selectedItem.mandateCeiling}</span>
                      </div>
                    </div>

                    {/* Policy Compliance Verification Checklist */}
                    <div className="flex flex-col gap-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-charcoal">
                          Policy Compliance Matrix
                        </span>
                        <span className="text-[11px] text-[#5A5D5E] font-mono">3 Pass · 1 Gate Trigger</span>
                      </div>
                      <div className="divide-y divide-[#E7E7E3] border border-[#E7E7E3] rounded-md overflow-hidden text-xs">
                        {selectedItem.checks.map((chk, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center justify-between p-3 ${
                              chk.pass === 'gate' ? 'bg-[#FAF8F3]' : 'bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              {chk.pass === 'gate' ? (
                                <span className="material-symbols-outlined text-secondary text-[18px]">gavel</span>
                              ) : (
                                <span className="material-symbols-outlined text-emerald-700 text-[18px]">check_circle</span>
                              )}
                              <div>
                                <span className="text-charcoal font-medium block">{chk.label}</span>
                                {chk.gateSub && <span className="text-[10px] text-[#5A5D5E]">{chk.gateSub}</span>}
                              </div>
                            </div>
                            <span className={`font-mono text-[11px] ${
                              chk.pass === 'gate' ? 'text-secondary font-medium' : 'text-[#5A5D5E]'
                            }`}>
                              {chk.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Agent Reasoning Extract */}
                    <div className="p-3.5 bg-[#FAF9F6] border border-[#EAEAE5] rounded-md flex flex-col gap-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#5A5D5E]">
                          Agent Deterministic Reasoning
                        </span>
                        <span className="text-[10px] text-[#888B8C] font-mono">Confidence: 99.4%</span>
                      </div>
                      <p className="text-[12px] text-charcoal leading-relaxed">{selectedItem.reasoning}</p>
                      <div className="text-[10px] font-mono text-[#888B8C] mt-1">{selectedItem.hash}</div>
                    </div>

                    {/* High Contrast Actions */}
                    <div className="pt-2 flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleReject(selectedItem)}
                          disabled={actionLoading}
                          className="flex-1 py-2.5 px-4 rounded-md border border-[#E7E7E3] bg-white text-charcoal hover:bg-[#F7F7F4] text-xs font-medium transition-colors"
                        >
                          Reject Request
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApprove(selectedItem)}
                          disabled={actionLoading}
                          className="flex-2 flex-grow py-2.5 px-5 rounded-md bg-charcoal text-white hover:bg-black text-xs font-semibold tracking-wide flex items-center justify-center gap-2 shadow-sm transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">key</span>
                          <span>Approve & Release Funds</span>
                        </button>
                      </div>
                      <span className="text-center font-mono text-[10px] text-[#888B8C]">
                        Executing release issues a cryptographic ERC-4337 signature to Lenovo's merchant settlement contract.
                      </span>
                    </div>
                  </div>
                )}

                {/* 2. LOGITECH DISCRETIONARY REVIEW VIEW */}
                {selectedItem.id === 'logitech' && (
                  <div className="flex flex-col gap-6">
                    <div className="flex items-start justify-between border-b border-[#E7E7E3] pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] uppercase tracking-wider text-[#5A5D5E]">
                            Discretionary Review
                          </span>
                          <span className="text-[#888B8C]">/</span>
                          <span className="font-mono text-[11px] font-semibold text-charcoal">{selectedItem.code}</span>
                        </div>
                        <h2 className="font-headline-sm text-[20px] font-semibold text-charcoal mt-1 tracking-tight">
                          {selectedItem.title}
                        </h2>
                        <p className="text-[12px] text-[#5A5D5E] mt-0.5">{selectedItem.specsSummary}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-headline-md text-[22px] font-semibold text-charcoal tracking-tight">
                          ₹{selectedItem.amount.toLocaleString()}
                        </div>
                        <span className="text-[10px] font-mono text-secondary">+₹895 over unattended</span>
                      </div>
                    </div>

                    <div className="p-3 bg-[#FAF8F3] border border-[#ECE5D8] rounded text-xs text-charcoal">
                      <span className="font-semibold block text-secondary text-[11px] uppercase tracking-wider">
                        Discretionary Auto-Cap Trigger
                      </span>
                      <p className="mt-1 leading-relaxed">{selectedItem.triggerReason}</p>
                    </div>

                    <div className="divide-y divide-[#E7E7E3] border border-[#E7E7E3] rounded-md text-xs">
                      {selectedItem.checks.map((chk, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-emerald-700 text-[18px]">check_circle</span>
                            <span className="text-charcoal font-medium">{chk.label}</span>
                          </div>
                          <span className="font-mono text-[11px] text-[#5A5D5E]">{chk.value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleReject(selectedItem)}
                        disabled={actionLoading}
                        className="flex-1 py-2.5 px-4 rounded-md border border-[#E7E7E3] bg-white text-charcoal hover:bg-[#F7F7F4] text-xs font-medium transition-colors"
                      >
                        Decline
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApprove(selectedItem)}
                        disabled={actionLoading}
                        className="flex-1 py-2.5 px-4 rounded-md bg-charcoal text-white hover:bg-black text-xs font-semibold tracking-wide transition-colors"
                      >
                        Approve (1-Tap)
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. BLOCKED POLICY VIEW */}
                {selectedItem.id === 'blocked' && (
                  <div className="flex flex-col gap-6">
                    <div className="flex items-start justify-between border-b border-[#E7E7E3] pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] uppercase tracking-wider text-error font-semibold">
                            DETERMINISTIC HARD STOP
                          </span>
                          <span className="text-[#888B8C]">/</span>
                          <span className="font-mono text-[11px] text-[#5A5D5E]">{selectedItem.code}</span>
                        </div>
                        <h2 className="font-headline-sm text-[20px] font-semibold text-charcoal mt-1 tracking-tight">
                          {selectedItem.title}
                        </h2>
                        <p className="text-[12px] text-error font-medium mt-0.5">{selectedItem.specsSummary}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-headline-md text-[22px] font-semibold text-error tracking-tight">
                          ₹{selectedItem.amount.toLocaleString()}
                        </div>
                        <span className="text-[10px] font-mono text-[#888B8C]">Disallowed</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-md bg-[#FDF2F2] border border-[#F3CECE] flex flex-col gap-2.5">
                      <div className="flex items-center gap-2 text-error font-semibold text-xs">
                        <span className="material-symbols-outlined text-[18px]">gpp_bad</span>
                        <span>Consensus Boundary Violation — Override Strictly Blocked</span>
                      </div>
                      <div className="text-xs text-charcoal space-y-2 leading-relaxed">
                        <p>
                          <strong>1. Destination Domain:</strong> <code className="bg-white/80 px-1 py-0.5 rounded">techbazaar.in</code> is absent from the cryptographic corporate vendor whitelist. Zero merchant trust score recorded.
                        </p>
                        <p>
                          <strong>2. Category Cap:</strong> Order price (₹8,995) exceeds standard peripheral ceiling (₹5,000) defined in Mandate #M-902.
                        </p>
                      </div>
                      <div className="p-2.5 rounded bg-white text-[11px] font-mono text-error font-medium border border-[#F3CECE]/60 mt-1">
                        Policy Rule 7.2: Manual administrative override is strictly blocked by immutable smart mandate invariants. No sovereign signature can clear this dispatch.
                      </div>
                    </div>

                    <div className="divide-y divide-[#E7E7E3] border border-[#E7E7E3] rounded-md text-xs">
                      {selectedItem.checks.map((chk, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white">
                          <div className="flex items-center gap-2 text-error">
                            <span className="material-symbols-outlined text-[16px]">cancel</span>
                            <span className="font-medium text-charcoal">{chk.label}</span>
                          </div>
                          <span className="font-mono text-[11px] text-error">{chk.value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => handleDismissBlocked(selectedItem)}
                        className="w-full py-2.5 px-4 rounded-md bg-[#F4F4F1] hover:bg-[#EAEAE6] text-charcoal text-xs font-medium transition-colors"
                      >
                        Acknowledge & Dismiss from Active Inbox
                      </button>
                      <span className="text-center font-mono text-[10px] text-[#888B8C]">
                        Transaction permanently flagged in immutable ledger #M-902.
                      </span>
                    </div>
                  </div>
                )}

                {/* 4. CLEARED TRANSACTION VIEW */}
                {selectedItem.status === 'cleared' && (
                  <div className="flex flex-col gap-6">
                    <div className="flex items-start justify-between border-b border-[#E7E7E3] pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] uppercase tracking-wider text-emerald-700 font-semibold">
                            AUTOMATICALLY CLEARED
                          </span>
                        </div>
                        <h2 className="font-headline-sm text-[20px] font-semibold text-charcoal mt-1 tracking-tight">
                          {selectedItem.title}
                        </h2>
                        <p className="text-[12px] text-[#5A5D5E] mt-0.5">{selectedItem.specsSummary}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-headline-md text-[22px] font-semibold text-charcoal tracking-tight">
                          ₹{selectedItem.amount.toLocaleString()}
                        </div>
                        <span className="text-[10px] font-mono text-emerald-700">Settled</span>
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded text-xs text-emerald-900">
                      This transaction matched all invariant validation policies and was signed deterministically without requiring sovereign manual clearance.
                    </div>

                    <div className="divide-y divide-[#E7E7E3] border border-[#E7E7E3] rounded-md text-xs">
                      <div className="flex items-center justify-between p-3">
                        <span className="text-[#5A5D5E]">Settlement Hash</span>
                        <span className="font-mono text-[11px] text-charcoal">{selectedItem.hash || '0x4a19...9b1c'}</span>
                      </div>
                      <div className="flex items-center justify-between p-3">
                        <span className="text-[#5A5D5E]">Audit Trace</span>
                        <span className="font-mono text-[11px] text-charcoal">Verified on Sub-ledger #M-902</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
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
