import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ArbitrationModal from '../components/ArbitrationModal';
import { api } from '../api/client';

export default function ActivityPage() {
  const [guideOpen, setGuideOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [agentFilter, setAgentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, amount_high, amount_low
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [activeProofData, setActiveProofData] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [activeReceiptData, setActiveReceiptData] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);

  const defaultEvents = useMemo(() => [
    {
      id: 'EVT-902-1',
      timestamp: '2026-10-24, 21:40:00 IST',
      relativeTime: '2h ago',
      type: 'DISCRETIONARY_PENDING',
      title: 'Discretionary Purchase Awaiting Approval',
      status: 'AWAITING_SIGNOFF',
      statusLabel: 'Awaiting Sign-off',
      badgeClass: 'bg-[#FAF8F3] dark:bg-amber-950/40 text-secondary dark:text-amber-300 border border-[#ECE5D8] dark:border-amber-900/50',
      dotClass: 'bg-secondary',
      itemTitle: 'Logitech MX Master 3S Wireless Performance Mouse',
      amount: '₹8,495',
      numericAmount: 8495,
      agent: 'Claude Shopping v3.5',
      agentKey: 'claude',
      merchant: 'Amazon India',
      trigger: 'High-Value Ceiling Trigger: Peripheral ceiling is ₹5,000. Exceeds limit by ₹3,495.',
      hash: 'sha256:90fa...41b3',
      fullHash: 'sha256:90fa8120bba47162981041b39812cc9a7102bb4',
      evaluator: 'Mandate Gateway Policy Engine (Simulated)',
      specs: 'Bluetooth & Logi Bolt Wireless (Compliant)',
      attestationNeeded: '1 Sovereign Human Key Sign-off',
      hasEvaluation: true
    },
    {
      id: 'EVT-902-2',
      timestamp: '2026-10-24, 18:30:05 IST',
      relativeTime: '5h ago',
      type: 'AUTO_CLEARED',
      title: 'Autonomous Purchase Cleared & Settled',
      status: 'SETTLED',
      statusLabel: 'Settled via PayPal',
      badgeClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/50',
      dotClass: 'bg-emerald-600',
      itemTitle: 'Dell UltraSharp 4K DisplayPort Cable',
      amount: '₹1,299',
      numericAmount: 1299,
      agent: 'Claude Shopping v3.5',
      agentKey: 'claude',
      merchant: 'Amazon India',
      trigger: 'Deterministic Clearance: Under ₹5,000 ceiling, approved merchant, all quote requirements verified.',
      hash: 'sha256:4a7b...1702',
      fullHash: 'sha256:4a7b11d902cae449170298a0c2834d817109ad2',
      voucherId: 'RCPT-98214-AMZN',
      paymentRail: 'PayPal Sandbox (Simulated Settlement)',
      hasReceipt: true
    },
    {
      id: 'EVT-902-3',
      timestamp: '2026-10-24, 15:10:01 IST',
      relativeTime: '8h ago',
      type: 'BLOCKED',
      title: 'Deterministic Policy Hard Stop (Blocked)',
      status: 'BLOCKED',
      statusLabel: 'Blocked by Policy',
      badgeClass: 'bg-red-50 dark:bg-red-950/40 text-error border border-red-200/60 dark:border-red-900/50',
      dotClass: 'bg-error',
      itemTitle: 'Refurbished Server Rack Mount',
      amount: '₹12,990',
      numericAmount: 12990,
      agent: 'AutoProcure Daemon',
      agentKey: 'autoprocure',
      merchant: 'eBay Global Store (Unapproved)',
      trigger: 'Deterministic Invariance Violation: eBay Global is NOT in allowed merchants list. Category mismatch for Hardware under SaaS mandate.',
      hash: 'sha256:ee71...001a',
      fullHash: 'sha256:ee7189a0c2834d817bca402001a44e918809aa1',
      evidenceId: '#EVD-20261024-0914',
      policyRule: 'RULE-MERCHANT-WHITELIST: UNAPPROVED-VENDOR',
      ecdsaSig: '3045022100e4b85c28ad68910029bca88172ea255e221379b380ef614cb2a78f8cb9d50102202672bf65d836bc6a54fe23c52a0a256956cc5bc13840ffcc4181a1795b5ca817',
      hasProof: true
    },
    {
      id: 'EVT-902-4',
      timestamp: '2026-10-23, 11:20:00 IST',
      relativeTime: '1d ago',
      type: 'REJECTED',
      title: 'Human Reviewer Declined Order',
      status: 'REJECTED',
      statusLabel: 'Declined by Elena Vance',
      badgeClass: 'bg-neutral-100 dark:bg-[#252525] text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-[#353535]',
      dotClass: 'bg-neutral-500',
      itemTitle: 'Anker PowerConf H700 Bluetooth Headset',
      amount: '₹9,200',
      numericAmount: 9200,
      agent: 'Claude Shopping v3.5',
      agentKey: 'claude',
      merchant: 'Amazon India',
      trigger: 'Declined by human reviewer: Over-budget peripheral request. Cheaper wired alternative recommended.',
      hash: 'sha256:bb19...8821',
      fullHash: 'sha256:bb1901a8821094ba76192a001bb907145e12089c',
      hasProof: false
    },
    {
      id: 'EVT-902-5',
      timestamp: '2026-10-22, 09:15:04 IST',
      relativeTime: '2d ago',
      type: 'PAYPAL_SANDBOX_SETTLED',
      title: 'Autonomous Sandbox Clearance & Settlement',
      status: 'SETTLED',
      statusLabel: 'Settled via PayPal',
      badgeClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/50',
      dotClass: 'bg-emerald-600',
      itemTitle: 'Logitech C920 Pro HD Webcam (1080p)',
      amount: '₹4,499',
      numericAmount: 4499,
      agent: 'Claude Shopping v3.5',
      agentKey: 'claude',
      merchant: 'Croma Retail Systems',
      trigger: 'Autonomous Clearance under ₹5,000 threshold. Simulated PayPal Sandbox capture confirmed.',
      hash: 'sha256:8819...3321',
      fullHash: 'sha256:881902bb3321cc0911094ba76192a001',
      voucherId: 'RCPT-77182-CRMA',
      paymentRail: 'PayPal Sandbox (Token Settled)',
      hasReceipt: true
    },
    {
      id: 'EVT-902-6',
      timestamp: '2026-10-20, 14:30:10 IST',
      relativeTime: '4d ago',
      type: 'MANDATE_CHANGED',
      title: 'Spending Mandate Modified',
      status: 'CONFIRMED',
      statusLabel: 'Mandate Updated',
      badgeClass: 'bg-[#FAF9F5] dark:bg-[#252525] text-charcoal dark:text-white border border-[#E7E7E3] dark:border-[#353535]',
      dotClass: 'bg-secondary',
      itemTitle: 'Office Hardware Q4 budget ceiling updated',
      amount: '₹50,000 Cap',
      numericAmount: 50000,
      agent: 'Elena Vance (Account Owner)',
      agentKey: 'elena',
      merchant: 'Mandate Gateway System',
      trigger: 'Owner adjusted single purchase threshold and allowed merchants whitelist.',
      hash: 'sha256:7729...11aa',
      fullHash: 'sha256:772911aa4821cc0911094ba76192a001bb907145',
      diff: {
        removed: '- "spending_limit_inr": 40000,',
        added: '+ "spending_limit_inr": 50000,',
        approver: '  "approver": "elena-vance-vault"'
      },
      hasDiff: true
    },
    {
      id: 'EVT-902-7',
      timestamp: '2026-10-18, 10:15:00 IST',
      relativeTime: '6d ago',
      type: 'PRODUCT_SEARCH',
      title: 'Autonomous Product Search Dispatched',
      status: 'COMPLETED',
      statusLabel: 'Catalog Scanned',
      badgeClass: 'bg-[#FAF9F5] dark:bg-[#252525] text-charcoal dark:text-gray-300 border border-[#E7E7E3] dark:border-[#353535]',
      dotClass: 'bg-secondary',
      itemTitle: 'Ergonomic Gaming Mouse search query',
      amount: '₹0',
      numericAmount: 0,
      agent: 'Claude Shopping v3.5',
      agentKey: 'claude',
      merchant: 'Channel3 Adapter (Simulated)',
      trigger: 'Brief synthesized into 6 hard constraints. Scanned 4 product candidates.',
      hash: 'sha256:3312...99bb',
      fullHash: 'sha256:331299bb7721cc0911094ba76192a001bb907145',
      hasProof: false
    },
    {
      id: 'EVT-902-8',
      timestamp: '2026-10-15, 09:12:44 IST',
      relativeTime: '9d ago',
      type: 'TOKEN_ROTATION',
      title: 'Agent Passport Token Rotated',
      status: 'COMPLETED',
      statusLabel: 'Token Refreshed',
      badgeClass: 'bg-[#FAF9F5] dark:bg-[#252525] text-charcoal dark:text-gray-300 border border-[#E7E7E3] dark:border-[#353535]',
      dotClass: 'bg-secondary',
      itemTitle: 'Claude Shopping v3.5 passport token refreshed',
      amount: 'Active Token',
      numericAmount: 0,
      agent: 'System Daemon',
      agentKey: 'daemon',
      merchant: 'Gateway Security Enclave',
      trigger: '30-day epoch cycle refreshed with fresh SHA-256 digest token.',
      hash: 'sha256:4a89...ef01',
      fullHash: 'sha256:4a89bc213fe091ef0178a9c298b1e4a07109281',
      hasProof: false
    }
  ], []);

  useEffect(() => {
    loadActivityFeed();
  }, [defaultEvents]);

  const loadActivityFeed = async () => {
    setLoading(true);
    try {
      const res = await api.getActivity();
      if (res?.activity && Array.isArray(res.activity) && res.activity.length > 0) {
        const backendItems = res.activity.map((item, idx) => {
          const isBlocked = item.type === 'MERCHANT_BLOCKED' || item.type === 'BLOCKED';
          const isCleared = item.type === 'AUTO_CLEARED' || item.type === 'PAYPAL_SANDBOX_SETTLED';
          return {
            id: item.id || `EVT-B-${idx}`,
            timestamp: item.timestamp || 'Recent',
            relativeTime: item.timestamp || 'Recent',
            type: item.type,
            title: item.summary || item.type,
            status: isBlocked ? 'BLOCKED' : isCleared ? 'SETTLED' : 'COMPLETED',
            statusLabel: isBlocked ? 'Blocked by Policy' : isCleared ? 'Auto-Cleared' : 'System Event',
            badgeClass: isBlocked
              ? 'bg-red-50 dark:bg-red-950/40 text-error border border-red-200/60 dark:border-red-900/50'
              : isCleared
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/50'
              : 'bg-[#FAF9F5] dark:bg-[#252525] text-charcoal dark:text-gray-300 border border-[#E7E7E3] dark:border-[#353535]',
            dotClass: isBlocked ? 'bg-error' : isCleared ? 'bg-emerald-600' : 'bg-secondary',
            itemTitle: item.summary || 'Audit Event Action',
            amount: item.amount || '—',
            numericAmount: parseInt((item.amount || '0').replace(/[^0-9]/g, ''), 10) || 0,
            agent: item.agent || 'Gateway Enclave',
            agentKey: (item.agent || '').toLowerCase().includes('claude')
              ? 'claude'
              : (item.agent || '').toLowerCase().includes('auto')
              ? 'autoprocure'
              : (item.agent || '').toLowerCase().includes('elena')
              ? 'elena'
              : 'daemon',
            merchant: item.details?.merchant || item.details?.merchantAttempted || 'Verified Rail',
            trigger: item.meta || 'Deterministic gateway invariant verified',
            hash: (item.hash || 'sha256:4a89...').substring(0, 16) + '...',
            fullHash: item.hash || 'sha256:4a89bc213fe091ef0178a9c298b1e4a0',
            details: item.details
          };
        });

        const merged = [...backendItems];
        defaultEvents.forEach(def => {
          if (!merged.find(m => m.id === def.id)) {
            merged.push(def);
          }
        });
        setEvents(merged);
      } else {
        setEvents(defaultEvents);
      }
    } catch (err) {
      console.warn('Using local canonical audit feed:', err);
      setEvents(defaultEvents);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const copyText = (text, label) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    showToast(`${label} copied to clipboard!`);
  };

  // Filtered & Sorted dataset
  const filteredEvents = useMemo(() => {
    let result = events.filter((ev) => {
      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matches =
          ev.id.toLowerCase().includes(q) ||
          ev.title.toLowerCase().includes(q) ||
          ev.itemTitle.toLowerCase().includes(q) ||
          ev.agent.toLowerCase().includes(q) ||
          ev.merchant.toLowerCase().includes(q) ||
          ev.hash.toLowerCase().includes(q) ||
          ev.trigger.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Event type filter
      if (eventTypeFilter !== 'all') {
        if (eventTypeFilter === 'approvals' && ev.status !== 'SETTLED' && !ev.type.includes('AUTO_CLEARED')) return false;
        if (eventTypeFilter === 'rejections' && ev.status !== 'BLOCKED' && ev.status !== 'REJECTED' && !ev.type.includes('BLOCKED')) return false;
        if (eventTypeFilter === 'pending' && ev.status !== 'AWAITING_SIGNOFF' && !ev.type.includes('PENDING')) return false;
        if (eventTypeFilter === 'mandates' && !['MANDATE_CHANGED', 'CONFIG_CHANGED', 'MANDATE_REVOKED'].includes(ev.type)) return false;
        if (eventTypeFilter === 'searches' && !['PRODUCT_SEARCH', 'SPEC_EVALUATION'].includes(ev.type)) return false;
        if (eventTypeFilter === 'payments' && !['PAYPAL_SANDBOX_SETTLED', 'SETTLED', 'AUTO_CLEARED'].includes(ev.type)) return false;
      }

      // Agent filter
      if (agentFilter !== 'all') {
        if (ev.agentKey !== agentFilter) return false;
      }

      return true;
    });

    // Sorting
    if (sortBy === 'newest') {
      // default preserves chronological order
    } else if (sortBy === 'oldest') {
      result = [...result].reverse();
    } else if (sortBy === 'amount_high') {
      result = [...result].sort((a, b) => (b.numericAmount || 0) - (a.numericAmount || 0));
    } else if (sortBy === 'amount_low') {
      result = [...result].sort((a, b) => (a.numericAmount || 0) - (b.numericAmount || 0));
    }

    return result;
  }, [events, search, eventTypeFilter, agentFilter, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredEvents.length / pageSize) || 1;
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEvents.slice(start, start + pageSize);
  }, [filteredEvents, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, eventTypeFilter, agentFilter, sortBy]);

  const handleExport = () => {
    const dataToExport = filteredEvents.map(e => ({
      id: e.id,
      timestamp: e.timestamp,
      type: e.title,
      item: e.itemTitle,
      amount: e.amount,
      agent: e.agent,
      merchant: e.merchant,
      status: e.status,
      hash: e.fullHash || e.hash,
      trigger: e.trigger
    }));

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `mandate_gateway_simulated_audit_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(`Exported ${filteredEvents.length} simulated audit records as JSON`);
  };

  const handleExportCsv = async () => {
    const sanitize = (val) => {
      let str = String(val ?? '');
      if (/^[=\+\-@\t\r]/.test(str)) {
        str = "'" + str;
      }
      return `"${str.replace(/"/g, '""')}"`;
    };

    const headers = ['ID', 'Timestamp', 'Type', 'Summary', 'Amount', 'Agent', 'Status', 'Hash'];
    const rows = filteredEvents.map(e => [
      sanitize(e.id),
      sanitize(e.timestamp),
      sanitize(e.title),
      sanitize(e.itemTitle),
      sanitize(e.amount),
      sanitize(e.agent),
      sanitize(e.status),
      sanitize(e.fullHash || e.hash)
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent([headers.join(','), ...rows].join('\n'));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', csvContent);
    downloadAnchor.setAttribute('download', `mandate_gateway_simulated_audit_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(`Exported ${filteredEvents.length} simulated records as CSV`);
  };

  const handleResetFilters = () => {
    setSearch('');
    setEventTypeFilter('all');
    setAgentFilter('all');
    setSortBy('newest');
    setCurrentPage(1);
  };

  return (
    <div className="bg-background min-h-screen text-charcoal dark:text-gray-100 antialiased">
      <Sidebar />
      <Header pageTitle="Activity & Audit" onOpenGuide={() => setGuideOpen(true)} />
      <ArbitrationModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />

      {/* Main View Area */}
      <div className="pl-0 md:pl-64 transition-all duration-200">
        <main className="relative pt-20 bg-background min-h-screen w-full px-4 sm:px-8 pb-16">
          <div className="flex flex-col w-full space-y-6 max-w-7xl mx-auto">
            
            {/* Editorial Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#E7E7E3] dark:border-[#353535]">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono text-[#888B8C]">
                  <span>Mandate Gateway</span>
                  <span>/</span>
                  <span className="text-charcoal dark:text-gray-300 font-medium">Activity &amp; Audit</span>
                </div>
                <h1 className="page-title mt-1">
                  Activity Log
                </h1>
                <p className="page-subtitle max-w-2xl">
                  Cryptographic ledger of all autonomous shopping transactions, invariant checks, policy mutations, and simulated PayPal clearances.
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap self-start md:self-auto">
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="px-3.5 py-2 text-xs font-medium rounded-md border border-[#E7E7E3] dark:border-[#353535] bg-white dark:bg-[#1D1D1D] text-charcoal dark:text-white hover:bg-neutral-50 dark:hover:bg-[#252525] transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                  title="Download sanitized CSV"
                >
                  <span className="material-symbols-outlined text-[16px]">table_view</span>
                  <span>Export CSV</span>
                </button>
                <button
                  type="button"
                  onClick={handleExport}
                  className="px-3.5 py-2 text-xs font-semibold rounded-md bg-charcoal dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-neutral-200 transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">file_download</span>
                  <span>Export JSON ({filteredEvents.length})</span>
                </button>
              </div>
            </div>

            {/* Simulated Event Log Disclosure Banner */}
            <div className="p-3.5 rounded-lg bg-[#FAF8F3] dark:bg-[#252525] border border-[#ECE5D8] dark:border-[#353535] text-xs text-charcoal dark:text-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-secondary text-[18px]">verified</span>
                <span>
                  <strong>Simulated Event Log (Frontend Demo):</strong> All hashes, proof nonces, and transaction identifiers demonstrate end-to-end auditability in the simulated sandbox environment without moving live capital.
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#888B8C] shrink-0">
                Merkle Root: #7829-d890 (Simulated)
              </span>
            </div>

            {/* Metric Strip */}
            <div className="py-2.5 px-1 border-b border-[#E7E7E3] dark:border-[#353535] flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#5A5D5E] dark:text-[#B8B8B8]">
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-semibold text-charcoal dark:text-white font-mono">{events.length}</span>
                <span>Total Ledger Events</span>
              </div>
              <span className="text-[#888B8C] hidden sm:inline">|</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 font-mono">
                  {events.filter(e => e.status === 'SETTLED' || e.type.includes('AUTO_CLEARED')).length}
                </span>
                <span>Auto-Approved</span>
              </div>
              <span className="text-[#888B8C] hidden sm:inline">|</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-semibold text-amber-700 dark:text-amber-400 font-mono">
                  {events.filter(e => e.status === 'AWAITING_SIGNOFF').length}
                </span>
                <span>Human Escalations</span>
              </div>
              <span className="text-[#888B8C] hidden sm:inline">|</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-semibold text-error font-mono">
                  {events.filter(e => e.status === 'BLOCKED' || e.status === 'REJECTED').length}
                </span>
                <span>Blocks &amp; Declines</span>
              </div>
              <span className="text-[#888B8C] hidden sm:inline">|</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-semibold text-charcoal dark:text-white font-mono">₹94,500</span>
                <span>Capital Guarded</span>
              </div>
            </div>

            {/* Toolbar: Search, Filters, Sorting */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-1">
              <div className="relative flex-1 max-w-lg">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#888B8C] text-[18px] pointer-events-none">
                  search
                </span>
                <input
                  type="text"
                  id="audit-search-input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by ID, item, agent, merchant, or rule..."
                  className="w-full pl-9 pr-8 py-2 rounded-lg border border-[#E7E7E3] dark:border-[#353535] bg-white dark:bg-[#1D1D1D] text-charcoal dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-charcoal placeholder:text-[#888B8C] shadow-sm"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-2.5 text-[#888B8C] hover:text-charcoal dark:hover:text-white cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2.5 flex-wrap text-xs">
                {/* Event Category Filter */}
                <div className="relative">
                  <select
                    value={eventTypeFilter}
                    onChange={(e) => setEventTypeFilter(e.target.value)}
                    className="py-2 pl-3 pr-8 rounded-lg border border-[#E7E7E3] dark:border-[#353535] bg-white dark:bg-[#1D1D1D] text-charcoal dark:text-white appearance-none focus:outline-none cursor-pointer shadow-sm text-xs"
                  >
                    <option value="all">All Event Types ({events.length})</option>
                    <option value="approvals">Auto-Cleared Settlements</option>
                    <option value="rejections">Blocks &amp; Declines</option>
                    <option value="pending">Awaiting Sign-off</option>
                    <option value="mandates">Mandate Changes</option>
                    <option value="searches">Product Searches</option>
                    <option value="payments">PayPal Sandbox Payments</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[#888B8C] pointer-events-none text-[16px]">
                    expand_more
                  </span>
                </div>

                {/* Agent Filter */}
                <div className="relative">
                  <select
                    value={agentFilter}
                    onChange={(e) => setAgentFilter(e.target.value)}
                    className="py-2 pl-3 pr-8 rounded-lg border border-[#E7E7E3] dark:border-[#353535] bg-white dark:bg-[#1D1D1D] text-charcoal dark:text-white appearance-none focus:outline-none cursor-pointer shadow-sm text-xs"
                  >
                    <option value="all">All Agents</option>
                    <option value="claude">Claude Shopping v3.5</option>
                    <option value="autoprocure">AutoProcure Daemon</option>
                    <option value="elena">Elena Vance (Signer)</option>
                    <option value="daemon">System Daemon</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[#888B8C] pointer-events-none text-[16px]">
                    expand_more
                  </span>
                </div>

                {/* Sorting Filter */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="py-2 pl-3 pr-8 rounded-lg border border-[#E7E7E3] dark:border-[#353535] bg-white dark:bg-[#1D1D1D] text-charcoal dark:text-white appearance-none focus:outline-none cursor-pointer shadow-sm text-xs"
                  >
                    <option value="newest">Sort: Newest First</option>
                    <option value="oldest">Sort: Oldest First</option>
                    <option value="amount_high">Sort: Amount (High to Low)</option>
                    <option value="amount_low">Sort: Amount (Low to High)</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[#888B8C] pointer-events-none text-[16px]">
                    sort
                  </span>
                </div>

                {(search || eventTypeFilter !== 'all' || agentFilter !== 'all' || sortBy !== 'newest') && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="py-2 px-3 text-xs text-secondary hover:text-charcoal dark:hover:text-white transition-colors flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>

            {/* Audit Ledger Container */}
            <div className="border border-[#E7E7E3] dark:border-[#353535] rounded-xl bg-white dark:bg-[#1D1D1D] shadow-sm overflow-hidden">
              {/* Table Column Header */}
              <div className="hidden lg:grid grid-cols-12 gap-4 px-5 py-3 bg-[#FAF9F5] dark:bg-[#252525] border-b border-[#E7E7E3] dark:border-[#353535] font-mono text-[10px] uppercase tracking-wider text-[#888B8C] font-semibold">
                <div className="col-span-3">Timestamp &amp; Event</div>
                <div className="col-span-4">Operation Target &amp; Agent</div>
                <div className="col-span-2">Amount &amp; Rule</div>
                <div className="col-span-2">Simulated Hash Leaf</div>
                <div className="col-span-1 text-right">Details</div>
              </div>

              {/* Rows */}
              {loading ? (
                <div className="p-12 text-center text-[#5A5D5E] dark:text-[#B8B8B8] space-y-2">
                  <div className="w-8 h-8 border-2 border-charcoal dark:border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-xs">Synchronizing cryptographic audit logs with simulated ledger...</p>
                </div>
              ) : paginatedEvents.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#FAF9F5] dark:bg-[#252525] mx-auto flex items-center justify-center text-[#888B8C]">
                    <span className="material-symbols-outlined text-[24px]">history_toggle_off</span>
                  </div>
                  <h3 className="text-sm font-semibold text-charcoal dark:text-white">No matching audit events</h3>
                  <p className="text-xs text-[#5A5D5E] dark:text-[#B8B8B8] max-w-md mx-auto">
                    No transactions or policy mutations matched your active search or filters.
                  </p>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FAF9F5] dark:bg-[#252525] hover:bg-[#F4F4F0] text-charcoal dark:text-white text-xs font-medium transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                    <span>Reset All Filters</span>
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-[#E7E7E3] dark:divide-[#353535]">
                  {paginatedEvents.map((ev) => {
                    const isExpanded = expandedRowId === ev.id;
                    return (
                      <div key={ev.id} className="hover:bg-[#FAF9F5] dark:hover:bg-[#252525] transition-colors">
                        <div className="p-4 sm:px-5 sm:py-4">
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 items-start lg:items-center">
                            
                            {/* Col 1: Timestamp & Status (3 cols) */}
                            <div className="lg:col-span-3 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-[11px] text-[#5A5D5E] dark:text-[#B8B8B8]">{ev.timestamp}</span>
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium ${ev.badgeClass}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${ev.dotClass}`}></span>
                                  <span>{ev.statusLabel}</span>
                                </span>
                                <span className="font-mono text-[10px] text-[#888B8C]">#{ev.id}</span>
                              </div>
                            </div>

                            {/* Col 2: Target & Agent (4 cols) */}
                            <div className="lg:col-span-4 min-w-0 space-y-0.5">
                              <div className="text-[13.5px] font-semibold text-charcoal dark:text-white truncate">
                                {ev.title}
                              </div>
                              <p className="text-[12px] text-[#5A5D5E] dark:text-[#B8B8B8] truncate">
                                <span className="text-charcoal dark:text-gray-200 font-medium">{ev.itemTitle}</span>
                                <span className="text-[#888B8C] mx-1.5">•</span>
                                <span>Agent: <strong className="text-charcoal dark:text-white font-medium">{ev.agent}</strong></span>
                              </p>
                              <p className="text-[11px] text-[#888B8C] truncate">
                                <span>Merchant: <span className="text-charcoal dark:text-gray-300">{ev.merchant}</span></span>
                              </p>
                            </div>

                            {/* Col 3: Amount & Rule (2 cols) */}
                            <div className="lg:col-span-2 space-y-0.5">
                              <div className="text-[13.5px] font-semibold text-charcoal dark:text-white font-mono">
                                {ev.amount}
                              </div>
                              <div className="text-[11px] text-[#888B8C] truncate" title={ev.trigger}>
                                {ev.trigger}
                              </div>
                            </div>

                            {/* Col 4: Cryptographic Hash / Merkle (2 cols) */}
                            <div className="lg:col-span-2 space-y-0.5">
                              <div className="flex items-center gap-1.5 font-mono text-[11px] text-secondary">
                                <span className="material-symbols-outlined text-[14px] text-secondary">fingerprint</span>
                                <span className="truncate">{ev.hash}</span>
                              </div>
                              <span className="text-[10px] text-[#888B8C] block uppercase tracking-wider font-mono">
                                Simulated Leaf
                              </span>
                            </div>

                            {/* Col 5: Action Button (1 col) */}
                            <div className="lg:col-span-1 flex items-center justify-end gap-1.5 pt-2 lg:pt-0">
                              {ev.hasProof && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveProofData(ev);
                                    setProofModalOpen(true);
                                  }}
                                  className="px-2 py-1 rounded border border-[#E7E7E3] dark:border-[#353535] hover:bg-[#FAF9F5] dark:hover:bg-[#252525] text-charcoal dark:text-white text-[11px] transition-colors inline-flex items-center gap-1 cursor-pointer"
                                  title="Inspect Cryptographic Proof"
                                >
                                  <span className="material-symbols-outlined text-[13px] text-error">verified</span>
                                  <span className="hidden sm:inline">Proof</span>
                                </button>
                              )}

                              {ev.hasReceipt && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveReceiptData(ev);
                                    setReceiptModalOpen(true);
                                  }}
                                  className="px-2 py-1 rounded border border-[#E7E7E3] dark:border-[#353535] hover:bg-[#FAF9F5] dark:hover:bg-[#252525] text-charcoal dark:text-white text-[11px] transition-colors inline-flex items-center gap-1 cursor-pointer"
                                  title="View Settlement Receipt"
                                >
                                  <span className="material-symbols-outlined text-[13px] text-emerald-700">receipt_long</span>
                                  <span className="hidden sm:inline">Receipt</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => setExpandedRowId(isExpanded ? null : ev.id)}
                                className={`w-7 h-7 rounded flex items-center justify-center border transition-colors cursor-pointer ${
                                  isExpanded
                                    ? 'border-charcoal dark:border-white bg-charcoal dark:bg-white text-white dark:text-black'
                                    : 'border-[#E7E7E3] dark:border-[#353535] hover:bg-[#FAF9F5] dark:hover:bg-[#252525] text-charcoal dark:text-white'
                                }`}
                                title={isExpanded ? 'Collapse event details' : 'Expand event details'}
                              >
                                <span className="material-symbols-outlined text-[16px]">
                                  {isExpanded ? 'expand_less' : 'expand_more'}
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Expandable Detail Panel */}
                        {isExpanded && (
                          <div className="px-5 pb-4 pt-1 bg-[#FAF9F5] dark:bg-[#252525] border-t border-[#E7E7E3] dark:border-[#353535] animate-in fade-in duration-150">
                            <div className="p-4 rounded-lg bg-white dark:bg-[#1D1D1D] border border-[#E7E7E3] dark:border-[#353535] space-y-3 text-xs">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                  <span className="font-mono text-[10px] text-[#888B8C] uppercase tracking-wider block font-semibold">
                                    Full Invariant Context
                                  </span>
                                  <p className="text-charcoal dark:text-white font-medium">{ev.trigger}</p>
                                  {ev.evaluator && (
                                    <p className="text-[#5A5D5E] dark:text-[#B8B8B8] text-[11px]">Engine: <span className="text-charcoal dark:text-white font-mono">{ev.evaluator}</span></p>
                                  )}
                                </div>

                                <div className="space-y-1">
                                  <span className="font-mono text-[10px] text-[#888B8C] uppercase tracking-wider block font-semibold">
                                    Identity &amp; Merchant Clearance
                                  </span>
                                  <p className="text-charcoal dark:text-white">Actor: <span className="font-medium">{ev.agent}</span></p>
                                  <p className="text-[#5A5D5E] dark:text-[#B8B8B8] text-[11px]">Clearing Rail: <span className="text-charcoal dark:text-white font-mono">{ev.merchant}</span></p>
                                </div>

                                <div className="space-y-1">
                                  <span className="font-mono text-[10px] text-[#888B8C] uppercase tracking-wider block font-semibold">
                                    Cryptographic Verification Leaf
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-[11px] text-secondary break-all bg-[#FAF9F5] dark:bg-[#252525] px-2 py-1 rounded border border-[#E7E7E3] dark:border-[#353535]">
                                      {ev.fullHash || ev.hash}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => copyText(ev.fullHash || ev.hash, 'Hash')}
                                      className="text-[#888B8C] hover:text-charcoal dark:hover:text-white p-1 cursor-pointer"
                                      title="Copy Hash"
                                    >
                                      <span className="material-symbols-outlined text-[15px]">content_copy</span>
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {ev.diff && (
                                <div className="pt-2 border-t border-[#E7E7E3] dark:border-[#353535] font-mono text-xs space-y-1">
                                  <span className="text-[10px] text-[#888B8C] uppercase tracking-wider font-semibold block">
                                    Configuration Delta
                                  </span>
                                  <div className="p-2.5 rounded bg-[#FAF9F5] dark:bg-[#252525] border border-[#E7E7E3] dark:border-[#353535]">
                                    <span className="text-error block">{ev.diff.removed}</span>
                                    <span className="text-emerald-700 dark:text-emerald-400 block">{ev.diff.added}</span>
                                    <span className="text-[#888B8C] block">{ev.diff.approver}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination Controls */}
              <div className="p-4 border-t border-[#E7E7E3] dark:border-[#353535] bg-[#FAF9F5] dark:bg-[#252525] flex items-center justify-between text-xs text-[#5A5D5E] dark:text-[#B8B8B8]">
                <span>
                  Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({filteredEvents.length} total events)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    className="px-3 py-1.5 rounded border border-[#E7E7E3] dark:border-[#353535] bg-white dark:bg-[#1D1D1D] text-charcoal dark:text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-[#303030] cursor-pointer"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    className="px-3 py-1.5 rounded border border-[#E7E7E3] dark:border-[#353535] bg-white dark:bg-[#1D1D1D] text-charcoal dark:text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-[#303030] cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Integrity Notice */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#888B8C] pt-2 border-t border-[#E7E7E3] dark:border-[#353535] font-mono">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="material-symbols-outlined text-[16px] text-secondary">verified_user</span>
                <span>Cryptographic Merkle Root: 0x892a4f0012bb98c014 (Simulated)</span>
                <span>•</span>
                <span>Block #7829-d890</span>
              </div>
              <span className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                Continuous policy verification active
              </span>
            </div>
          </div>
        </main>
      </div>

      {/* Proof Modal */}
      {proofModalOpen && activeProofData && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1D1D1D] rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-4 border border-[#E7E7E3] dark:border-[#353535] animate-in zoom-in-95 duration-150 text-charcoal dark:text-gray-100">
            <div className="flex items-start justify-between border-b border-[#E7E7E3] dark:border-[#353535] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-red-100 text-error flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">gavel</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-base text-charcoal dark:text-white font-semibold">Cryptographic Proof of Block</h3>
                  <span className="font-mono text-xs text-[#888B8C]">Evidence ID: {activeProofData.evidenceId || '#EVD-20261024-0914'}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setProofModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#888B8C] hover:text-charcoal dark:hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-2.5 text-xs bg-[#FAF9F5] dark:bg-[#252525] p-4 rounded-lg border border-[#E7E7E3] dark:border-[#353535]">
              <div className="flex justify-between"><span className="text-[#888B8C]">Offending Agent:</span><span className="font-medium text-charcoal dark:text-white">{activeProofData.agent}</span></div>
              <div className="flex justify-between"><span className="text-[#888B8C]">Target Merchant:</span><span className="font-medium text-error">{activeProofData.merchant}</span></div>
              <div className="flex justify-between"><span className="text-[#888B8C]">Amount Prevented:</span><span className="font-semibold text-charcoal dark:text-white font-mono">{activeProofData.amount}</span></div>
              <div className="flex justify-between"><span className="text-[#888B8C]">Enforced Invariant:</span><span className="font-mono text-error">{activeProofData.policyRule || 'RULE-MERCHANT-WHITELIST: UNAPPROVED-VENDOR'}</span></div>
            </div>

            <div>
              <span className="text-xs text-[#888B8C] block mb-1.5 font-medium font-mono">Simulated Attestation Signature (SECP256K1)</span>
              <div className="p-3 bg-neutral-900 text-neutral-300 rounded-lg font-mono text-[11px] break-all leading-relaxed">
                {activeProofData.ecdsaSig || '3045022100e4b85c28ad68910029bca88172ea255e221379b380ef614cb2a78f8cb9d50102202672bf65d836bc6a54fe23c52a0a256956cc5bc13840ffcc4181a1795b5ca817'}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => copyText(activeProofData.ecdsaSig || '30450221...', 'Signature')}
                className="text-xs text-secondary hover:text-charcoal dark:hover:text-white flex items-center gap-1 font-medium cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                <span>Copy Raw Signature</span>
              </button>
              <button
                type="button"
                onClick={() => setProofModalOpen(false)}
                className="px-4 py-2 rounded bg-charcoal dark:bg-white text-white dark:text-black font-semibold text-xs hover:bg-black dark:hover:bg-neutral-200 cursor-pointer"
              >
                Close Attestation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {receiptModalOpen && activeReceiptData && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1D1D1D] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#E7E7E3] dark:border-[#353535] animate-in zoom-in-95 duration-150 text-charcoal dark:text-gray-100">
            <div className="flex items-center justify-between border-b pb-3 border-[#E7E7E3] dark:border-[#353535]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">receipt</span>
                </div>
                <h3 className="font-headline-sm text-base text-charcoal dark:text-white font-semibold">Settlement Voucher</h3>
              </div>
              <button
                type="button"
                onClick={() => setReceiptModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#888B8C] hover:text-charcoal dark:hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-2.5 text-xs bg-[#FAF9F5] dark:bg-[#252525] p-4 rounded-lg border border-[#E7E7E3] dark:border-[#353535]">
              <div className="flex justify-between"><span className="text-[#888B8C]">Voucher ID:</span><span className="font-mono">{activeReceiptData.voucherId || 'RCPT-98214-AMZN'}</span></div>
              <div className="flex justify-between"><span className="text-[#888B8C]">Amount Settled:</span><span className="font-bold text-charcoal dark:text-white font-mono">{activeReceiptData.amount}</span></div>
              <div className="flex justify-between"><span className="text-[#888B8C]">Merchant:</span><span className="font-medium text-charcoal dark:text-white">{activeReceiptData.merchant}</span></div>
              <div className="flex justify-between"><span className="text-[#888B8C]">Item:</span><span className="text-charcoal dark:text-white">{activeReceiptData.itemTitle}</span></div>
              <div className="flex justify-between"><span className="text-[#888B8C]">Payment Rail:</span><span className="text-emerald-700 dark:text-emerald-400 font-semibold">{activeReceiptData.paymentRail || 'PayPal Sandbox (Token Settled)'}</span></div>
              <div className="flex justify-between"><span className="text-[#888B8C]">Transaction Hash:</span><span className="font-mono text-secondary">{activeReceiptData.hash}</span></div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setReceiptModalOpen(false)}
                className="px-4 py-2 rounded bg-charcoal dark:bg-white text-white dark:text-black font-semibold text-xs hover:bg-black dark:hover:bg-neutral-200 cursor-pointer"
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
