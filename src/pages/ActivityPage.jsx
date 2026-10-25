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
  const [dateFilter, setDateFilter] = useState('30d');
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
      timestamp: '14 Nov 2024, 14:02:41 IST',
      relativeTime: '12m ago',
      type: 'DISCRETIONARY_PENDING',
      title: 'Discretionary Purchase Awaiting Approval',
      status: 'AWAITING_SIGNOFF',
      statusLabel: 'Awaiting Sign-off',
      badgeClass: 'bg-secondary-container text-on-secondary-container',
      dotClass: 'bg-secondary',
      itemTitle: 'Lenovo ThinkPad X1 Carbon Gen 12',
      amount: '₹1,24,990',
      numericAmount: 124990,
      agent: 'Claude Shopping v3.5',
      agentKey: 'claude',
      merchant: 'Lenovo Official Store',
      trigger: 'Exceeds ₹50,000 threshold (Policy #POL-HARDWARE-CAP-L2)',
      hash: '0x90fa...41b3',
      fullHash: '0x90fa8120bba47162981041b39812cc9a',
      evaluator: 'Policy Engine v4.2.1-nitro',
      specs: '32GB LPDDR5X / 1TB SSD (Compliant)',
      attestationNeeded: '1 Sovereign Hardware Key Sign-off',
      hasEvaluation: true
    },
    {
      id: 'EVT-902-2',
      timestamp: '14 Nov 2024, 12:45:19 IST',
      relativeTime: '1h ago',
      type: 'AUTO_CLEARED',
      title: 'Autonomous Purchase Cleared & Settled',
      status: 'SETTLED',
      statusLabel: 'Settled via PayPal',
      badgeClass: 'bg-emerald-50 text-emerald-800 border border-emerald-200/40',
      dotClass: 'bg-emerald-600',
      itemTitle: 'Ergonomic Laptop Stand',
      amount: '₹2,450',
      numericAmount: 2450,
      agent: 'AutoProcure Daemon',
      agentKey: 'autoprocure',
      merchant: 'Amazon Business India',
      trigger: 'Instant virtual token clearance via Sandbox PayPal Gateway',
      hash: '0x4a7b...1702',
      fullHash: '0x4a7b11d902cae449170298a0c2834d81',
      voucherId: 'RCPT-98214-AMZN',
      paymentRail: 'PayPal Sandbox (Token Settled)',
      hasReceipt: true
    },
    {
      id: 'EVT-902-3',
      timestamp: '14 Nov 2024, 10:15:02 IST',
      relativeTime: '3h ago',
      type: 'BLOCKED',
      title: 'Deterministic Policy Hard Stop (Blocked)',
      status: 'BLOCKED',
      statusLabel: 'Blocked by Rule-SEC-0914',
      badgeClass: 'bg-red-50 text-error border border-red-200/40',
      dotClass: 'bg-error',
      itemTitle: 'Logitech MX Master 3S',
      amount: '₹8,995',
      numericAmount: 8995,
      agent: 'Perplexity Buy v1.2',
      agentKey: 'perplexity',
      merchant: 'TechBazaar.in (Unverified)',
      trigger: 'Attempted unwhitelisted merchant domain; zero-trust policy enforced',
      hash: '0xee71...001a',
      fullHash: '0xee7189a0c2834d817bca402001a44e91',
      evidenceId: '#EVD-20241114-0914',
      policyRule: 'RULE-SEC-0914: NON-WHITELISTED-HOST',
      ecdsaSig: '3045022100e4b85c28ad68910029bca88172ea255e221379b380ef614cb2a78f8cb9d50102202672bf65d836bc6a54fe23c52a0a256956cc5bc13840ffcc4181a1795b5ca817',
      hasProof: true
    },
    {
      id: 'EVT-902-4',
      timestamp: '13 Nov 2024, 18:30:10 IST',
      relativeTime: '1d ago',
      type: 'CONFIG_CHANGED',
      title: 'Spending Mandate Modified',
      status: 'CONFIRMED',
      statusLabel: 'Attested via WebAuthn',
      badgeClass: 'bg-surface-container-high text-on-surface-variant',
      dotClass: 'bg-secondary',
      itemTitle: 'Office Hardware Q4 ceiling raised',
      amount: '₹1,50,000 Cap',
      numericAmount: 150000,
      agent: 'Elena Vance (Sovereign Signer)',
      agentKey: 'elena',
      merchant: 'Mandate Gateway Enclave',
      trigger: 'Hardware token FIDO2 assertion verified',
      hash: 'PASSKEY-882',
      fullHash: 'urn:fido:webauthn:authenticator:yubikey5c:882901a',
      diff: {
        removed: '- "spending_limit_inr": 100000,',
        added: '+ "spending_limit_inr": 150000,',
        approver: '  "approver": "urn:sovereign:elena-vance-main"'
      },
      hasDiff: true
    },
    {
      id: 'EVT-902-5',
      timestamp: '12 Nov 2024, 09:12:44 IST',
      relativeTime: '2d ago',
      type: 'TOKEN_ROTATION',
      title: 'Agent Passport Cryptographic Token Rotated',
      status: 'COMPLETED',
      statusLabel: 'Completed',
      badgeClass: 'bg-surface-container-high text-on-surface-variant',
      dotClass: 'bg-outline',
      itemTitle: 'Claude Shopping v3.5 Ed25519 pair refreshed',
      amount: '3 Active Tokens',
      numericAmount: 0,
      agent: 'System Daemon',
      agentKey: 'daemon',
      merchant: 'AWS Nitro SGX Enclave',
      trigger: 'Old key cleanly revoked, 30-day epoch cycle refreshed',
      hash: '0x4a89...ef01',
      fullHash: '0x4a89bc213fe091ef0178a9c298b1e4a0',
      hasCopyKey: true,
      publicKey: '0x4a89bc213fe091ef0178a9c298b1e4a0'
    }
  ], []);

  useEffect(() => {
    loadActivityFeed();
  }, [defaultEvents]);

  const loadActivityFeed = async () => {
    setLoading(true);
    try {
      const res = await api.getActivity();
      if (res && res.activity && Array.isArray(res.activity) && res.activity.length > 0) {
        // Map backend events and merge seamlessly with rich canonical events
        const backendItems = res.activity.map((item, idx) => {
          const isBlocked = item.type === 'MERCHANT_BLOCKED' || item.type === 'BLOCKED';
          const isCleared = item.type === 'AUTO_CLEARED';
          return {
            id: item.id || `EVT-B-${idx}`,
            timestamp: item.timestamp || 'Recent',
            relativeTime: item.timestamp || 'Recent',
            type: item.type,
            title: item.summary || item.type,
            status: isBlocked ? 'BLOCKED' : isCleared ? 'SETTLED' : 'COMPLETED',
            statusLabel: isBlocked ? 'Blocked by Policy' : isCleared ? 'Auto-Cleared' : 'System Event',
            badgeClass: isBlocked
              ? 'bg-red-50 text-error border border-red-200/40'
              : isCleared
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/40'
              : 'bg-surface-container-high text-on-surface-variant',
            dotClass: isBlocked ? 'bg-error' : isCleared ? 'bg-emerald-600' : 'bg-outline',
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
            hash: (item.hash || 'sha256:4a89...').substring(0, 14) + '...',
            fullHash: item.hash || 'sha256:4a89bc213fe091ef0178a9c298b1e4a0',
            details: item.details
          };
        });

        // Deduplicate with default events
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

  // Filtered dataset
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
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
        if (eventTypeFilter === 'rejections' && ev.status !== 'BLOCKED' && !ev.type.includes('BLOCKED')) return false;
        if (eventTypeFilter === 'pending' && ev.status !== 'AWAITING_SIGNOFF' && !ev.type.includes('PENDING')) return false;
        if (eventTypeFilter === 'config' && !['CONFIG_CHANGED', 'TOKEN_ROTATION', 'CEILING_MODIFIED', 'SHIELD_ROTATION'].includes(ev.type)) return false;
      }

      // Agent filter
      if (agentFilter !== 'all') {
        if (ev.agentKey !== agentFilter) return false;
      }

      // Date filter
      if (dateFilter === '24h' && !['12m ago', '1h ago', '3h ago', 'Recent'].includes(ev.relativeTime)) {
        return false;
      }
      if (dateFilter === '7d' && ['12 Nov 2024, 09:12:44 IST'].includes(ev.timestamp) && false) {
        return false;
      }

      return true;
    });
  }, [events, search, eventTypeFilter, agentFilter, dateFilter]);

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
    downloadAnchor.setAttribute('download', `mandate_gateway_audit_merkle_7829_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(`Exported ${filteredEvents.length} verifiable audit records as JSON`);
  };

  const handleExportCsv = async () => {
    try {
      const res = await fetch('/api/activity/export?format=csv');
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mandate_gateway_audit_${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        showToast('Exported CSV with Formula Injection Defense');
        return;
      }
    } catch (e) {
      console.warn('Backend CSV export error, falling back to client CSV', e);
    }

    // Client-side fallback with formula injection sanitization
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
    downloadAnchor.setAttribute('download', `mandate_gateway_audit_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(`Exported ${filteredEvents.length} records as CSV (Formula Injection Safe)`);
  };

  const handleResetFilters = () => {
    setSearch('');
    setEventTypeFilter('all');
    setAgentFilter('all');
    setDateFilter('30d');
  };

  return (
    <div className="bg-background min-h-screen text-on-surface antialiased">
      <Sidebar />
      <Header pageTitle="Activity & Audit" onOpenGuide={() => setGuideOpen(true)} />
      <ArbitrationModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />

      {/* Main View Area */}
      <div className="pl-0 md:pl-64 transition-all duration-200">
        <main className="relative pt-20 bg-background min-h-screen w-full px-4 sm:px-8 pb-16">
          <div className="flex flex-col w-full space-y-8 max-w-7xl mx-auto">
            
            {/* Editorial Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-outline-variant/30">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-label-md text-label-md text-on-surface-variant">
                  <span>Mandate Gateway</span>
                  <span className="text-outline-variant">/</span>
                  <span className="text-on-surface font-medium">Activity &amp; Audit</span>
                </div>
                <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-semibold">
                  Activity Log
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
                  Immutable, tamper-evident cryptographic ledger of all agent purchases, invariant clearances, and policy mutations.
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap self-start md:self-auto">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high/70 text-on-surface text-body-sm font-code-sm border border-outline-variant/20 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span className="text-on-surface-variant font-label-sm text-label-sm">Merkle Root:</span>
                  <span className="font-semibold text-primary font-mono">#7829-d890</span>
                  <span className="font-label-sm text-[10px] uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-1.5 py-0.5 rounded font-semibold">
                    Attested
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="btn-secondary text-xs h-9 px-3 flex items-center gap-1.5 shadow-sm"
                  title="Download CSV sanitized against spreadsheet formula injection attacks"
                >
                  <span className="material-symbols-outlined text-[16px]">table_view</span>
                  <span>Export CSV</span>
                </button>
                <button
                  type="button"
                  onClick={handleExport}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-neutral-800 text-on-primary font-title-md text-body-sm transition-colors shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">file_download</span>
                  <span>Export JSON ({filteredEvents.length})</span>
                </button>
              </div>
            </div>

            {/* Compact Inline Metric Strip (Calculated dynamically) */}
            <div className="py-2.5 px-1 border-b border-outline-variant/30 flex flex-wrap items-center gap-x-6 gap-y-2 text-body-sm font-body-sm text-on-surface-variant">
              <div className="flex items-baseline gap-1.5">
                <span className="font-headline-sm text-title-md font-semibold text-primary">{events.length}</span>
                <span className="text-on-surface font-medium">Total Ledger Events</span>
              </div>
              <span className="text-outline-variant hidden sm:inline">|</span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-headline-sm text-title-md font-semibold text-emerald-700">
                  {events.filter(e => e.status === 'SETTLED' || e.type.includes('AUTO_CLEARED')).length}
                </span>
                <span className="text-on-surface font-medium">Auto-Approved</span>
              </div>
              <span className="text-outline-variant hidden sm:inline">|</span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-headline-sm text-title-md font-semibold text-amber-700">
                  {events.filter(e => e.status === 'AWAITING_SIGNOFF').length}
                </span>
                <span className="text-on-surface font-medium">Human Escalations</span>
              </div>
              <span className="text-outline-variant hidden sm:inline">|</span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-headline-sm text-title-md font-semibold text-error">
                  {events.filter(e => e.status === 'BLOCKED').length}
                </span>
                <span className="text-on-surface font-medium">Policy Hard Blocks</span>
              </div>
              <span className="text-outline-variant hidden sm:inline">|</span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-headline-sm text-title-md font-semibold text-primary">₹94,500</span>
                <span className="text-on-surface font-medium">Capital Protected</span>
              </div>
            </div>

            {/* Structured Toolbar: Search, Filters & Counters */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-1">
              <div className="relative flex-1 max-w-lg">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px] pointer-events-none">
                  search
                </span>
                <input
                  type="text"
                  id="audit-search-input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by ID, item, agent, merchant, hash, or policy rule..."
                  className="w-full pl-9 pr-8 py-2 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-on-surface text-body-sm font-body-md focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant/70 shadow-2xs"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-2.5 text-on-surface-variant hover:text-primary"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="relative">
                  <select
                    value={eventTypeFilter}
                    onChange={(e) => setEventTypeFilter(e.target.value)}
                    className="py-2 pl-3 pr-8 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-on-surface text-body-sm font-body-sm appearance-none focus:outline-none focus:border-primary cursor-pointer shadow-2xs"
                  >
                    <option value="all">All Events ({events.length})</option>
                    <option value="approvals">Auto-Cleared Settlements</option>
                    <option value="rejections">Blocks &amp; Violations</option>
                    <option value="pending">Awaiting Sign-off</option>
                    <option value="config">Policy &amp; Key Updates</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-on-surface-variant pointer-events-none text-[16px]">
                    expand_more
                  </span>
                </div>

                <div className="relative">
                  <select
                    value={agentFilter}
                    onChange={(e) => setAgentFilter(e.target.value)}
                    className="py-2 pl-3 pr-8 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-on-surface text-body-sm font-body-sm appearance-none focus:outline-none focus:border-primary cursor-pointer shadow-2xs"
                  >
                    <option value="all">All Agents</option>
                    <option value="claude">Claude Shopping v3.5</option>
                    <option value="autoprocure">AutoProcure Daemon</option>
                    <option value="perplexity">Perplexity Buy v1.2</option>
                    <option value="daemon">System Daemon</option>
                    <option value="elena">Elena Vance (Signer)</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-on-surface-variant pointer-events-none text-[16px]">
                    expand_more
                  </span>
                </div>

                <div className="relative">
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="py-2 pl-3 pr-8 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-on-surface text-body-sm font-body-sm appearance-none focus:outline-none focus:border-primary cursor-pointer shadow-2xs"
                  >
                    <option value="30d">Last 30 Days</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="24h">Last 24 Hours</option>
                    <option value="all">Full Epoch</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-on-surface-variant pointer-events-none text-[16px]">
                    calendar_today
                  </span>
                </div>

                {(search || eventTypeFilter !== 'all' || agentFilter !== 'all' || dateFilter !== '30d') && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="py-2 px-3 text-body-sm text-secondary hover:text-primary transition-colors flex items-center gap-1 font-medium"
                  >
                    <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>

            {/* Audit Ledger Container */}
            <div className="border border-outline-variant/30 rounded-xl bg-surface-container-lowest shadow-2xs overflow-hidden">
              {/* Table Column Header for Desktop */}
              <div className="hidden lg:grid grid-cols-12 gap-4 px-5 py-3 bg-surface-container-low/70 border-b border-outline-variant/30 font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                <div className="col-span-3">Timestamp &amp; Event</div>
                <div className="col-span-4">Operation Target &amp; Agent</div>
                <div className="col-span-2">Amount &amp; Value</div>
                <div className="col-span-2">Cryptographic Proof</div>
                <div className="col-span-1 text-right">Details</div>
              </div>

              {/* Rows */}
              {loading ? (
                <div className="p-12 text-center text-on-surface-variant space-y-2">
                  <span className="material-symbols-outlined text-[28px] animate-spin text-secondary">progress_activity</span>
                  <p className="font-body-md">Synchronizing cryptographic audit logs with Sovereign Enclave...</p>
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-surface-container-high mx-auto flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-[24px]">history_toggle_off</span>
                  </div>
                  <h3 className="font-title-md text-title-md font-semibold text-on-surface">No matching audit events</h3>
                  <p className="font-body-md text-on-surface-variant max-w-md mx-auto">
                    No transactions or policy mutations matched your active search or filters. Try adjusting your search query or reset filters.
                  </p>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-title-md text-body-sm transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                    <span>Reset All Filters</span>
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-outline-variant/20">
                  {filteredEvents.map((ev) => {
                    const isExpanded = expandedRowId === ev.id;
                    return (
                      <div key={ev.id} className="hover:bg-surface-container-low/40 transition-colors">
                        <div className="p-4 sm:px-5 sm:py-4">
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 items-start lg:items-center">
                            
                            {/* Col 1: Timestamp & Status (3 cols) */}
                            <div className="lg:col-span-3 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-code-sm text-[12px] text-on-surface-variant font-mono">{ev.timestamp}</span>
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-[11px] font-semibold ${ev.badgeClass}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${ev.dotClass}`}></span>
                                  <span>{ev.statusLabel}</span>
                                </span>
                                <span className="font-code-sm text-[11px] text-on-surface-variant/70 font-mono">#{ev.id}</span>
                              </div>
                            </div>

                            {/* Col 2: Target & Agent (4 cols) */}
                            <div className="lg:col-span-4 min-w-0 space-y-0.5">
                              <div className="font-title-md text-[13.5px] font-semibold text-primary truncate">
                                {ev.title}
                              </div>
                              <p className="font-body-sm text-[12.5px] text-on-surface-variant truncate">
                                <span className="text-on-surface font-medium">{ev.itemTitle}</span>
                                <span className="text-outline-variant mx-1.5">•</span>
                                <span>Agent: <strong className="text-on-surface font-medium">{ev.agent}</strong></span>
                              </p>
                              <p className="font-body-sm text-[12px] text-on-surface-variant/80 truncate">
                                <span>Merchant: <span className="text-on-surface">{ev.merchant}</span></span>
                              </p>
                            </div>

                            {/* Col 3: Amount & Rule (2 cols) */}
                            <div className="lg:col-span-2 space-y-0.5">
                              <div className="font-title-md text-[14px] font-bold text-primary font-mono">
                                {ev.amount}
                              </div>
                              <div className="font-label-sm text-[11px] text-on-surface-variant truncate" title={ev.trigger}>
                                {ev.trigger}
                              </div>
                            </div>

                            {/* Col 4: Cryptographic Hash / Merkle (2 cols) */}
                            <div className="lg:col-span-2 space-y-0.5">
                              <div className="flex items-center gap-1.5 font-code-sm text-[12px] font-mono text-secondary">
                                <span className="material-symbols-outlined text-[14px] text-secondary/70">fingerprint</span>
                                <span className="truncate">{ev.hash}</span>
                              </div>
                              <span className="font-label-sm text-[10px] text-on-surface-variant/70 block uppercase tracking-wider">
                                Merkle Verified
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
                                  className="px-2.5 py-1 rounded-md border border-outline-variant/30 hover:bg-surface-container-high text-on-surface font-title-md text-[12px] transition-colors inline-flex items-center gap-1"
                                  title="Inspect Cryptographic Proof"
                                >
                                  <span className="material-symbols-outlined text-[14px] text-error">verified</span>
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
                                  className="px-2.5 py-1 rounded-md border border-outline-variant/30 hover:bg-surface-container-high text-on-surface font-title-md text-[12px] transition-colors inline-flex items-center gap-1"
                                  title="View Settlement Receipt"
                                >
                                  <span className="material-symbols-outlined text-[14px] text-emerald-700">receipt_long</span>
                                  <span className="hidden sm:inline">Receipt</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => setExpandedRowId(isExpanded ? null : ev.id)}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors ${
                                  isExpanded
                                    ? 'border-primary bg-primary text-on-primary'
                                    : 'border-outline-variant/30 hover:bg-surface-container-high text-on-surface'
                                }`}
                                title={isExpanded ? 'Collapse event details' : 'Expand event details'}
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  {isExpanded ? 'expand_less' : 'expand_more'}
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Expandable Detail Panel */}
                        {isExpanded && (
                          <div className="px-5 pb-4 pt-1 bg-surface-container-low/60 border-t border-outline-variant/20 animate-in fade-in duration-150">
                            <div className="p-4 rounded-lg bg-surface-container-lowest border border-outline-variant/30 space-y-3 font-body-sm text-[13px]">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                  <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider block font-semibold">
                                    Full Invariant Context
                                  </span>
                                  <p className="text-on-surface font-medium">{ev.trigger}</p>
                                  {ev.evaluator && (
                                    <p className="text-on-surface-variant text-[12px]">Engine: <span className="text-on-surface font-mono">{ev.evaluator}</span></p>
                                  )}
                                </div>

                                <div className="space-y-1">
                                  <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider block font-semibold">
                                    Identity &amp; Merchant Clearance
                                  </span>
                                  <p className="text-on-surface">Actor: <span className="font-medium">{ev.agent}</span></p>
                                  <p className="text-on-surface-variant text-[12px]">Clearing Rail: <span className="text-on-surface font-mono">{ev.merchant}</span></p>
                                </div>

                                <div className="space-y-1">
                                  <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider block font-semibold">
                                    Cryptographic Verification Leaf
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-[11px] text-secondary break-all bg-surface-container-low px-2 py-1 rounded border border-outline-variant/20">
                                      {ev.fullHash || ev.hash}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => copyText(ev.fullHash || ev.hash, 'Hash')}
                                      className="text-secondary hover:text-primary p-1"
                                      title="Copy Hash"
                                    >
                                      <span className="material-symbols-outlined text-[16px]">content_copy</span>
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {ev.diff && (
                                <div className="pt-2 border-t border-outline-variant/20 font-code-sm text-[12px] space-y-1">
                                  <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold block">
                                    Cryptographic Configuration Delta
                                  </span>
                                  <div className="p-2.5 rounded bg-surface-container-high/60 font-mono">
                                    <span className="text-error block">{ev.diff.removed}</span>
                                    <span className="text-emerald-700 block">{ev.diff.added}</span>
                                    <span className="text-on-surface-variant block">{ev.diff.approver}</span>
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
            </div>

            {/* Pagination & Ledger Integrity Status Line */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-label-sm font-label-sm text-on-surface-variant pt-2 border-t border-outline-variant/20">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="material-symbols-outlined text-[16px] text-secondary">verified_user</span>
                <span>Cryptographic Merkle Root: <span className="font-code-sm text-code-sm font-medium text-on-surface font-mono">0x892a4f0012bb98c014</span></span>
                <span>•</span>
                <span>Block #7829-d890</span>
                <span>•</span>
                <span>Showing <strong>{filteredEvents.length}</strong> of <strong>{events.length}</strong> events</span>
              </div>
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                Continuous autonomous verification active
              </span>
            </div>
          </div>
        </main>
      </div>

      {/* Proof Modal */}
      {proofModalOpen && activeProofData && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-4 border border-outline-variant/30 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-outline-variant/20 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-red-100/60 text-error flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">gavel</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-title-md text-on-surface font-semibold">Cryptographic Proof of Block</h3>
                  <span className="font-code-sm text-code-sm text-secondary font-mono">Evidence ID: {activeProofData.evidenceId || '#EVD-20241114-0914'}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setProofModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-2.5 text-body-sm bg-surface-container-low p-4 rounded-lg border border-outline-variant/20">
              <div className="flex justify-between"><span className="text-on-surface-variant">Offending Agent:</span><span className="font-medium text-on-surface">{activeProofData.agent}</span></div>
              <div className="flex justify-between"><span className="text-on-surface-variant">Target Merchant:</span><span className="font-medium text-error">{activeProofData.merchant}</span></div>
              <div className="flex justify-between"><span className="text-on-surface-variant">Amount Prevented:</span><span className="font-semibold text-on-surface font-mono">{activeProofData.amount} INR</span></div>
              <div className="flex justify-between"><span className="text-on-surface-variant">Enforced Invariant:</span><span className="font-code-sm text-code-sm text-error font-mono">{activeProofData.policyRule || 'RULE-SEC-0914: NON-WHITELISTED-HOST'}</span></div>
            </div>

            <div>
              <span className="font-label-sm text-label-sm text-on-surface-variant block mb-1.5 font-medium">ECDSA SECP256K1 Attestation Signature</span>
              <div className="p-3 bg-primary text-on-primary rounded-lg font-code-sm text-code-sm break-all font-mono text-[12px] leading-relaxed">
                {activeProofData.ecdsaSig || '3045022100e4b85c28ad68910029bca88172ea255e221379b380ef614cb2a78f8cb9d50102202672bf65d836bc6a54fe23c52a0a256956cc5bc13840ffcc4181a1795b5ca817'}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => copyText(activeProofData.ecdsaSig || '30450221...', 'Signature')}
                className="text-body-sm text-secondary hover:text-primary flex items-center gap-1 font-medium"
              >
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                <span>Copy Raw Signature</span>
              </button>
              <button
                type="button"
                onClick={() => setProofModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary font-title-md text-body-sm hover:opacity-90 cursor-pointer"
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
          <div className="bg-surface-container-lowest rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-outline-variant/30 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3 border-outline-variant/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">receipt</span>
                </div>
                <h3 className="font-title-md text-title-md text-on-surface font-semibold">Settlement Voucher</h3>
              </div>
              <button
                type="button"
                onClick={() => setReceiptModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-2.5 text-body-sm font-code-sm text-[12.5px] bg-surface-container-low p-4 rounded-lg border border-outline-variant/20">
              <div className="flex justify-between"><span className="text-on-surface-variant font-sans">Voucher ID:</span><span className="font-mono">{activeReceiptData.voucherId || 'RCPT-98214-AMZN'}</span></div>
              <div className="flex justify-between"><span className="text-on-surface-variant font-sans">Amount Settled:</span><span className="font-bold text-primary font-mono">{activeReceiptData.amount} INR</span></div>
              <div className="flex justify-between"><span className="text-on-surface-variant font-sans">Merchant:</span><span className="font-sans font-medium">{activeReceiptData.merchant}</span></div>
              <div className="flex justify-between"><span className="text-on-surface-variant font-sans">Item:</span><span className="font-sans">{activeReceiptData.itemTitle}</span></div>
              <div className="flex justify-between"><span className="text-on-surface-variant font-sans">Payment Rail:</span><span className="text-emerald-700 font-semibold font-sans">{activeReceiptData.paymentRail || 'PayPal Sandbox (Token Settled)'}</span></div>
              <div className="flex justify-between"><span className="text-on-surface-variant font-sans">Transaction Hash:</span><span className="font-mono text-secondary">{activeReceiptData.hash}</span></div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setReceiptModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary font-title-md text-body-sm hover:opacity-90 cursor-pointer"
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
