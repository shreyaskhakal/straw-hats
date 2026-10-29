import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ArbitrationModal from '../components/ArbitrationModal';
import { api } from '../api/client';
import { defaultProductProvider } from '../services/productProvider';

export default function ShoppingAgentPage() {
  const navigate = useNavigate();
  const [guideOpen, setGuideOpen] = useState(false);
  const [mandates, setMandates] = useState([]);
  const [selectedMandateId, setSelectedMandateId] = useState('M-902');
  const [selectedSource, setSelectedSource] = useState('channel3-demo');
  const [prompt, setPrompt] = useState('Find a wired ergonomic gaming mouse with side buttons, silent clicks, and an optical sensor under ₹3,000.');
  const [candidates, setCandidates] = useState([]);
  const [searching, setSearching] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState(null);
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);
  const [selectedCandidateForModal, setSelectedCandidateForModal] = useState(null);
  const [activeScenario, setActiveScenario] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Filter parameter pills state
  const [mustHave, setMustHave] = useState(['Wired USB', 'Side Buttons', 'Optical Sensor']);
  const [niceToHave, setNiceToHave] = useState(['Silent Clicks', 'Braided Cable']);
  const [mustNotHave, setMustNotHave] = useState(['Wireless / Battery', 'Price > ₹3,000']);

  useEffect(() => {
    loadMandates();
    handleSearch();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadMandates = async () => {
    try {
      const res = await api.getMandates();
      if (res?.mandates?.length) {
        setMandates(res.mandates);
        if (!selectedMandateId || !res.mandates.some(m => m.id === selectedMandateId)) {
          setSelectedMandateId(res.mandates[0].id);
        }
      }
    } catch (err) {
      console.warn('Failed to load mandates', err);
    }
  };

  const currentMandate = mandates.find((m) => m.id === selectedMandateId) || {
    id: 'M-902',
    name: 'Office Hardware Q4',
    budgetCeiling: 50000,
    singlePurchaseLimit: 5000,
    requiresCoSignerOver: 3000,
    allowedMerchants: ['Amazon India', 'Croma Retail', 'Lenovo Direct'],
    status: 'ACTIVE'
  };

  const handleSearch = async () => {
    setSearching(true);
    setSubmittedRequest(null);
    try {
      // Use replaceable ProductProvider interface
      const searchResult = await defaultProductProvider.searchCandidates({
        prompt,
        mustHave,
        mustNotHave,
        marketplaces: [selectedSource],
      });
      setCandidates(searchResult.candidates || []);
    } catch (err) {
      console.error('Agent search error:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleIssueRequest = async (candId) => {
    setSubmittedRequest(candId);
    const cand = candidates.find((c) => c.id === candId) || candidates[0];
    
    // Evaluate against selected mandate before submitting
    if (currentMandate.status === 'REVOKED') {
      showToast(`Cannot issue purchase: Mandate #${currentMandate.id} is Revoked.`);
      setSubmittedRequest(null);
      return;
    }

    try {
      await api.createRequest({
        itemTitle: cand.title,
        amount: cand.price,
        merchant: cand.merchant,
        agentName: 'Claude Shopping v3.5',
        agentId: 'pass_claude_shop',
        mandateId: currentMandate.id,
        specs: cand.specs || [],
        quoteEvidence: cand.quoteChecks?.map(qc => ({
          field: qc.spec,
          value: qc.status,
          exactQuote: qc.quote,
          match: qc.status === 'MATCH'
        })) || []
      });
      showToast(`Purchase request issued for ${cand.title}! Navigating to Approval Center...`);
      setTimeout(() => {
        navigate('/requests');
      }, 700);
    } catch (err) {
      console.warn('Request creation error:', err);
      showToast('Error issuing request: ' + err.message);
      setSubmittedRequest(null);
    }
  };

  const removeParam = (listType, item) => {
    if (listType === 'must') setMustHave(mustHave.filter((x) => x !== item));
    if (listType === 'nice') setNiceToHave(niceToHave.filter((x) => x !== item));
    if (listType === 'not') setMustNotHave(mustNotHave.filter((x) => x !== item));
  };

  // Hackathon Scenario Loader for Judges
  const loadScenario = (scenarioNum) => {
    setActiveScenario(scenarioNum);
    if (scenarioNum === 1) {
      // 1. Purchase within limits
      setPrompt('Buy ergonomic wired mouse for office desk under ₹3,000 with silent optical sensor');
      setMustHave(['Wired USB', 'Optical Sensor', 'Silent Clicks']);
      setMustNotHave(['Wireless', 'Price > ₹3,000']);
      handleSearch();
      showToast('Scenario 1 Loaded: Purchase within limits (Auto-Approved).');
    } else if (scenarioNum === 2) {
      // 2. Purchase above spending limit
      setPrompt('Procure top-tier 27-inch 4K IPS development monitor with USB-C hub');
      setMustHave(['4K UHD', 'IPS Panel', 'USB-C']);
      setMustNotHave(['1080p', 'Refurbished']);
      handleSearch();
      showToast('Scenario 2 Loaded: Purchase above limit (Exceeds ₹5k ceiling -> Blocked).');
    } else if (scenarioNum === 3) {
      // 3. Blocked merchant
      setPrompt('Find Logitech MX Master 3S from any available seller with cheapest pricing');
      setMustHave(['Ergonomic Contour', 'Side Wheel']);
      setMustNotHave(['Refurbished']);
      handleSearch();
      showToast('Scenario 3 Loaded: Blocked merchant (TechBazaar.in unauthorized seller -> Blocked).');
    } else if (scenarioNum === 4) {
      // 4. Requires explicit approval
      setPrompt('Order Logitech G502 HERO wired mouse with high precision sensor');
      setMustHave(['Wired USB', 'HERO 25K Sensor', '11 Buttons']);
      setMustNotHave(['Wireless']);
      handleSearch();
      showToast('Scenario 4 Loaded: Requires explicit approval (Exceeds ₹3,000 auto-cap -> Pending).');
    } else if (scenarioNum === 5) {
      // 5. Revoked or expired mandate
      const revoked = mandates.find(m => m.status === 'REVOKED');
      if (revoked) {
        setSelectedMandateId(revoked.id);
      }
      showToast('Scenario 5 Loaded: Revoked Mandate selected (Immediate authorization failure).');
    } else if (scenarioNum === 6) {
      // 6. Payment failure or cancellation
      showToast('Scenario 6: Payment Rail Failure/Cancellation demo ready in Approval Center.');
      navigate('/requests');
    }
  };

  return (
    <div className="bg-background min-h-screen text-on-surface antialiased">
      <Sidebar />
      <Header pageTitle="Autonomous Shopping Agent" onOpenGuide={() => setGuideOpen(true)} />
      <ArbitrationModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />

      {/* Main Workspace */}
      <div className="pl-0 md:pl-64 transition-all duration-200">
        <main className="relative pt-20 bg-background min-h-screen w-full px-4 sm:px-6 lg:px-8 pb-16">
          <div className="max-w-7xl mx-auto flex flex-col w-full space-y-8">
            
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#E7E7E3]">
              <div className="space-y-1.5 max-w-2xl">
                <div className="page-eyebrow flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  <span>Autonomous Shopping Agent</span>
                  <span className="text-outline-variant">/</span>
                  <span>Procurement &amp; Policy Clearance</span>
                </div>
                <h1 className="page-title">
                  Autonomous Shopping Agent
                </h1>
                <p className="page-subtitle">
                  Issue natural-language shopping tasks to AI agents. Candidates are searched via the Channel3 ProductProvider interface and evaluated against active spending mandates.
                </p>
              </div>

              {/* Active Mandate Selector & Assigned Agent */}
              <div className="flex flex-wrap items-center gap-4 self-start md:self-end bg-surface-container-low p-3 rounded-xl border border-[#E7E7E3]">
                <div className="flex flex-col">
                  <span className="font-label-sm text-[10px] text-secondary uppercase tracking-wider font-semibold">
                    Bound Spending Mandate
                  </span>
                  <select
                    value={selectedMandateId}
                    onChange={(e) => setSelectedMandateId(e.target.value)}
                    className="select-standard h-8 text-xs font-semibold bg-surface-container-lowest mt-1"
                  >
                    {mandates.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} (#{m.id}) {m.status === 'REVOKED' ? '[REVOKED]' : `[Cap: ₹${(m.singlePurchaseLimit || 5000).toLocaleString()}]`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="h-8 w-px bg-[#E7E7E3] hidden sm:block"></div>

                <div className="flex flex-col">
                  <span className="font-label-sm text-[10px] text-secondary uppercase tracking-wider font-semibold">
                    Product Provider
                  </span>
                  <select
                    value={selectedSource}
                    onChange={(e) => setSelectedSource(e.target.value)}
                    className="select-standard h-8 text-xs font-medium bg-surface-container-lowest mt-1"
                  >
                    <option value="channel3-demo">Channel3 Adapter (Simulated)</option>
                    <option value="amazon-in">Amazon India (Direct)</option>
                    <option value="croma-in">Croma Verified Catalog</option>
                    <option value="multi-merchant">Aggregated Multi-Merchant</option>
                  </select>
                </div>
              </div>
            </header>

            {/* Hackathon Deterministic Scenarios Bar */}
            <section className="p-4 rounded-2xl bg-surface-container-lowest border border-[#E7E7E3] shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-xs uppercase tracking-wider text-primary font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-secondary text-[16px]">science</span>
                  <span>Deterministic Test Scenarios for Hackathon Evaluation:</span>
                </span>
                <span className="font-mono text-[10px] text-secondary bg-surface-container px-2 py-0.5 rounded">
                  Reproducible Test Fixtures
                </span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => loadScenario(1)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                    activeScenario === 1
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-surface-container-low text-primary border-[#E7E7E3] hover:border-primary'
                  }`}
                >
                  1. Within Limits (Auto-Approved)
                </button>
                <button
                  type="button"
                  onClick={() => loadScenario(2)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                    activeScenario === 2
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-surface-container-low text-primary border-[#E7E7E3] hover:border-primary'
                  }`}
                >
                  2. Above Spending Limit (Blocked)
                </button>
                <button
                  type="button"
                  onClick={() => loadScenario(3)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                    activeScenario === 3
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-surface-container-low text-primary border-[#E7E7E3] hover:border-primary'
                  }`}
                >
                  3. Blocked Merchant (Blocked)
                </button>
                <button
                  type="button"
                  onClick={() => loadScenario(4)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                    activeScenario === 4
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-surface-container-low text-primary border-[#E7E7E3] hover:border-primary'
                  }`}
                >
                  4. Explicit Approval Required
                </button>
                <button
                  type="button"
                  onClick={() => loadScenario(5)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                    activeScenario === 5
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-surface-container-low text-primary border-[#E7E7E3] hover:border-primary'
                  }`}
                >
                  5. Revoked Mandate Test
                </button>
                <button
                  type="button"
                  onClick={() => loadScenario(6)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                    activeScenario === 6
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-surface-container-low text-primary border-[#E7E7E3] hover:border-primary'
                  }`}
                >
                  6. Payment Cancellation
                </button>
              </div>
            </section>

            {/* Shopping Task Brief Card */}
            <section className="space-y-6">
              <div className="relative bg-surface-container-lowest rounded-xl p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.03)] border border-[#E7E7E3] space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-[#E7E7E3]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[20px]">edit_note</span>
                    <span className="font-label-sm uppercase tracking-wider text-on-surface font-semibold">
                      Natural-Language Shopping Task
                    </span>
                  </div>
                  <span className="font-code-sm text-code-sm text-secondary">
                    Channel3 ProductProvider Interface Active
                  </span>
                </div>

                <div className="space-y-2">
                  <textarea
                    aria-label="Shopping agent purchase instructions"
                    rows={2}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full bg-transparent font-headline-sm text-headline-sm text-primary placeholder:text-on-surface-variant/40 outline-none resize-none leading-relaxed border-0 p-0 focus:ring-0"
                  />
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Bound to Mandate #{currentMandate.id}: {currentMandate.name} (Single Cap: ₹{(currentMandate.singlePurchaseLimit || 5000).toLocaleString()}, Auto ≤ ₹{(currentMandate.requiresCoSignerOver || 3000).toLocaleString()})
                  </p>
                </div>

                {/* Filter Parameters */}
                <div className="pt-4 border-t border-[#E7E7E3] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider">
                      Required &amp; Excluded Product Attributes
                    </span>
                    <span className="font-code-sm text-code-sm text-on-surface-variant">
                      Deterministic constraints applied to product attributes
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-y-2.5 gap-x-6 text-body-sm">
                    {/* Must Have */}
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="font-label-sm uppercase tracking-wider text-on-surface font-semibold flex items-center gap-1.5 mr-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-on-background"></span>
                        Required
                      </span>
                      {mustHave.map((item) => (
                        <span key={item} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface font-code-sm text-[12px]">
                          {item}
                          <button
                            type="button"
                            onClick={() => removeParam('must', item)}
                            className="text-on-surface-variant hover:text-error transition-colors"
                            aria-label={`Remove ${item}`}
                          >
                            <span className="material-symbols-outlined text-[13px]">close</span>
                          </button>
                        </span>
                      ))}
                    </div>

                    <span className="text-outline-variant/60 hidden lg:inline">|</span>

                    {/* Excluded / Must Not Have */}
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="font-label-sm uppercase tracking-wider text-error font-semibold flex items-center gap-1.5 mr-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                        Excluded
                      </span>
                      {mustNotHave.map((item) => (
                        <span key={item} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-error-container/40 text-on-error-container font-code-sm text-[12px]">
                          {item}
                          <button
                            type="button"
                            onClick={() => removeParam('not', item)}
                            className="text-on-surface-variant hover:text-error transition-colors"
                            aria-label={`Remove ${item}`}
                          >
                            <span className="material-symbols-outlined text-[13px]">close</span>
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#E7E7E3]">
                  <div className="flex items-center gap-2 text-on-surface-variant font-code-sm text-code-sm">
                    <span className="material-symbols-outlined text-[16px] text-secondary">tune</span>
                    <span>Provider: {selectedSource} • Simulated Deterministic Fixtures</span>
                  </div>
                  <button
                    id="search-btn"
                    type="button"
                    onClick={handleSearch}
                    disabled={searching}
                    className="h-10 px-5 rounded-lg bg-primary-container hover:bg-primary text-on-primary transition-all flex items-center gap-2 font-label-md text-label-md shadow-sm cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">travel_explore</span>
                    <span>{searching ? 'Querying Adapter...' : 'Run Demo Product Search'}</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Candidate Evaluation */}
            <section className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E7E7E3]">
                <div className="flex items-center gap-3">
                  <h2 className="section-title">
                    Candidate Products &amp; Policy Evaluation
                  </h2>
                  <span className="font-label-sm text-label-sm px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface">
                    {candidates.length} Scanned
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setComparisonModalOpen(true)}
                    className="btn-secondary text-xs"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[15px]">compare_arrows</span>
                    <span>Side-by-Side Comparison</span>
                  </button>
                  <span className="font-mono text-xs text-secondary">
                    Gate: Mandate #{currentMandate.id}
                  </span>
                </div>
              </div>

              {/* Candidates List */}
              <div className="divide-y divide-[#E7E7E3]">
                {candidates.map((cand) => {
                  const isMatch = cand.verdict === 'FULL_MATCH_ELIGIBLE' || cand.verdict === 'ELIGIBLE';
                  const isReview = cand.verdict === 'NEEDS_HUMAN_REVIEW' || (cand.price > (currentMandate.requiresCoSignerOver || 3000) && cand.price <= (currentMandate.singlePurchaseLimit || 5000));
                  const isBlocked = cand.verdict === 'BLOCKED_BY_POLICY' || cand.price > (currentMandate.singlePurchaseLimit || 5000) || currentMandate.status === 'REVOKED';

                  return (
                    <article
                      key={cand.id}
                      className={`py-6 transition-colors hover:bg-surface-container-low/40 rounded-xl px-4 -mx-4 ${
                        isBlocked ? 'opacity-90 bg-red-50/10' : ''
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                        
                        {/* Visual & Basic Info */}
                        <div className="flex items-start gap-4 min-w-0 lg:w-4/12">
                          <div className={`w-20 h-20 rounded-lg overflow-hidden bg-surface-container flex-shrink-0 border border-[#E7E7E3] ${
                            isBlocked ? 'grayscale-[20%]' : ''
                          }`}>
                            <img
                              src={cand.image}
                              alt={cand.title}
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {currentMandate.status === 'REVOKED' ? (
                                <span className="inline-flex items-center gap-1 font-label-sm text-[11px] text-error font-semibold uppercase tracking-wider">
                                  <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                                  Mandate Revoked
                                </span>
                              ) : isMatch ? (
                                <span className="inline-flex items-center gap-1 font-label-sm text-[11px] text-emerald-700 font-semibold uppercase tracking-wider">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                  Auto-Purchase Eligible
                                </span>
                              ) : isReview ? (
                                <span className="inline-flex items-center gap-1 font-label-sm text-[11px] text-secondary font-semibold uppercase tracking-wider">
                                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                                  Needs Human Approval
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 font-label-sm text-[11px] text-error font-semibold uppercase tracking-wider">
                                  <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                                  Blocked by Policy
                                </span>
                              )}
                              <span className="text-outline-variant">·</span>
                              <span className={`font-code-sm text-[11px] ${isBlocked ? 'text-error' : 'text-on-surface-variant'}`}>
                                {cand.merchant}
                              </span>
                            </div>

                            <h3 className="font-title-md text-title-md text-on-surface font-semibold truncate leading-tight">
                              {cand.title}
                            </h3>

                            <p className={`font-code-sm text-code-sm font-semibold ${isBlocked ? 'text-error' : 'text-primary'}`}>
                              ₹{cand.price.toLocaleString()}.00{' '}
                              <span className="font-normal text-on-surface-variant text-[11px]">
                                {cand.source}
                              </span>
                            </p>

                            <p className="font-body-sm text-[12px] text-on-surface-variant">
                              Model: {cand.model || 'Standard'} • {cand.stockNote || 'Verified Stock'}
                            </p>
                          </div>
                        </div>

                        {/* Specs & Clearance Reason */}
                        <div className="space-y-2 lg:w-5/12">
                          <div className="flex items-center gap-3 text-body-sm">
                            <span className="font-label-sm text-[11px] uppercase tracking-wider text-secondary font-semibold">
                              Specs:
                            </span>
                            <div className="flex flex-wrap items-center gap-2 font-code-sm text-code-sm">
                              {cand.specs?.map((sp, idx) => (
                                <span
                                  key={idx}
                                  className={`inline-flex items-center gap-1 text-xs ${
                                    sp.pass ? 'text-primary' : 'text-error font-semibold'
                                  }`}
                                >
                                  <span className="material-symbols-outlined text-[14px]">
                                    {sp.pass ? 'check' : 'close'}
                                  </span>
                                  {sp.label}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className={`p-2.5 rounded-lg text-xs leading-relaxed ${
                            isBlocked
                              ? 'bg-red-50 text-error border border-red-200'
                              : isReview
                              ? 'bg-surface-container text-on-surface border border-[#E7E7E3]'
                              : 'bg-emerald-50/60 text-emerald-900 border border-emerald-200/60'
                          }`}>
                            <strong className="block mb-0.5">
                              {isBlocked ? 'Policy Violation Reason:' : isReview ? 'Escalation Reason:' : 'Policy Clearance Decision:'}
                            </strong>
                            <span>{cand.clearanceNote}</span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-secondary font-mono pt-1">
                            <span>{cand.proofToken}</span>
                            <button
                              onClick={() => {
                                setSelectedCandidateForModal(cand);
                                setComparisonModalOpen(true);
                              }}
                              className="hover:underline text-primary cursor-pointer"
                              type="button"
                            >
                              Inspect Details →
                            </button>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col items-start lg:items-end justify-center lg:w-3/12 space-y-2 flex-shrink-0">
                          {isBlocked ? (
                            <button
                              type="button"
                              disabled
                              className="w-full sm:w-auto h-9 px-4 rounded-lg bg-surface-container text-error font-label-md text-label-md flex items-center justify-center gap-1.5 opacity-70 cursor-not-allowed font-medium"
                            >
                              <span className="material-symbols-outlined text-[16px]">block</span>
                              <span>Blocked (No Bypass)</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleIssueRequest(cand.id)}
                              disabled={submittedRequest === cand.id}
                              className="btn-primary w-full sm:w-auto h-9 px-4"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                {isMatch ? 'bolt' : 'verified_user'}
                              </span>
                              <span>
                                {submittedRequest === cand.id
                                  ? 'Routing...'
                                  : isMatch
                                  ? 'Issue Purchase Request'
                                  : 'Open for Human Approval'}
                              </span>
                            </button>
                          )}

                          <span className="text-[11px] font-mono text-secondary">
                            {isMatch
                              ? 'Single-use sandbox voucher ready'
                              : isReview
                              ? 'Routes to Approval Center'
                              : 'Mandate invariant locked'}
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* Side-by-Side Candidate Comparison Modal */}
      {comparisonModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-4xl w-full p-6 sm:p-8 border border-[#E7E7E3] shadow-2xl relative max-h-[90vh] flex flex-col">
            <button
              onClick={() => setComparisonModalOpen(false)}
              className="absolute top-6 right-6 text-secondary hover:text-primary p-1 rounded-full hover:bg-surface-container transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#E7E7E3]">
              <span className="material-symbols-outlined text-secondary text-[22px]">compare_arrows</span>
              <div>
                <h3 className="font-title-md text-lg font-bold text-primary">Product Candidate Comparison Matrix</h3>
                <p className="text-xs text-on-surface-variant">Compare price, merchant legitimacy, specifications, and gateway clearance status</p>
              </div>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-xs border border-[#E7E7E3] rounded-lg">
                <thead className="bg-surface-container-low font-mono uppercase text-[11px] text-secondary">
                  <tr>
                    <th className="p-3 border-b border-[#E7E7E3]">Product Candidate</th>
                    <th className="p-3 border-b border-[#E7E7E3]">Merchant</th>
                    <th className="p-3 border-b border-[#E7E7E3]">Price (INR)</th>
                    <th className="p-3 border-b border-[#E7E7E3]">Source Adapter</th>
                    <th className="p-3 border-b border-[#E7E7E3]">Policy Verdict</th>
                    <th className="p-3 border-b border-[#E7E7E3] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E7E3]">
                  {candidates.map((c) => (
                    <tr key={c.id} className="hover:bg-surface-container-low/40">
                      <td className="p-3 font-semibold text-primary max-w-xs">{c.title}</td>
                      <td className="p-3 font-mono">{c.merchant}</td>
                      <td className="p-3 font-mono font-bold">₹{c.price.toLocaleString()}</td>
                      <td className="p-3 text-secondary font-mono">{c.source}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                          c.verdict.includes('BLOCKED') || c.verdict.includes('REJECTED')
                            ? 'bg-red-50 text-error border border-red-200'
                            : c.verdict.includes('REVIEW')
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}>
                          {c.verdict}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {!c.verdict.includes('BLOCKED') && (
                          <button
                            type="button"
                            onClick={() => {
                              setComparisonModalOpen(false);
                              handleIssueRequest(c.id);
                            }}
                            className="btn-outline text-xs px-2 py-1"
                          >
                            Select
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E7E7E3] flex justify-between items-center text-xs text-secondary font-mono">
              <span>Channel3 ProductProvider Schema v1.0 • Simulated Catalog Fixtures</span>
              <button
                onClick={() => setComparisonModalOpen(false)}
                className="btn-secondary text-xs"
                type="button"
              >
                Close Matrix
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 bg-primary text-white px-4 py-3 rounded-xl shadow-2xl font-mono text-xs flex items-center gap-2 border border-white/10">
          <span className="material-symbols-outlined text-emerald-400 text-[16px]">info</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
