import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ArbitrationModal from '../components/ArbitrationModal';
import { api } from '../api/client';

export default function ShoppingAgentPage() {
  const navigate = useNavigate();
  const [guideOpen, setGuideOpen] = useState(false);
  const [prompt, setPrompt] = useState('Find a wired ergonomic gaming mouse with side buttons, silent clicks, and an optical sensor under ₹3,000.');
  const [candidates, setCandidates] = useState([]);
  const [searching, setSearching] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState(null);
  const [selectedCandidateQuote, setSelectedCandidateQuote] = useState(null);

  // Filter parameter pills state matching Stitch
  const [mustHave, setMustHave] = useState(['Wired USB', 'Side Buttons', 'Optical Sensor']);
  const [niceToHave, setNiceToHave] = useState(['Silent Clicks', 'Braided Cable']);
  const [mustNotHave, setMustNotHave] = useState(['Wireless / Battery', 'Price > ₹3,000']);

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async () => {
    setSearching(true);
    setSubmittedRequest(null);
    try {
      const briefRes = await api.parseBrief(prompt);
      const candRes = await api.evaluateCandidates(briefRes.structuredBrief);
      setCandidates(candRes.candidates || []);
    } catch (err) {
      console.error('Agent search error:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleIssueRequest = async (candId) => {
    setSubmittedRequest(candId);
    const cand = displayCandidates.find((c) => c.id === candId) || displayCandidates[0];
    try {
      await api.createRequest({
        itemTitle: cand.title,
        amount: cand.price,
        merchant: cand.merchant,
        agentName: 'Claude Shopping',
        agentId: 'pass_claude_shop',
        mandateId: 'M-902',
        specs: cand.specs || [],
        quoteEvidence: cand.quoteChecks?.map(qc => ({
          field: qc.spec,
          value: qc.status,
          exactQuote: qc.quote,
          match: qc.status === 'MATCH'
        })) || []
      });
    } catch (err) {
      console.warn('Request creation error:', err);
    }
    setTimeout(() => {
      navigate('/requests');
    }, 600);
  };

  const removeParam = (listType, item) => {
    if (listType === 'must') setMustHave(mustHave.filter((x) => x !== item));
    if (listType === 'nice') setNiceToHave(niceToHave.filter((x) => x !== item));
    if (listType === 'not') setMustNotHave(mustNotHave.filter((x) => x !== item));
  };

  // Canonical Stitch products data for initial / fallback display
  const displayCandidates = candidates.length > 0 ? candidates : [
    {
      id: 'cand-1',
      title: 'Razer DeathAdder Essential Wired',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9Tatw59VFN2ASbvLR92_AcdfiqlekwVZD8rRR6dispVT0e239t3F8hQ-jAVT1JqhQ2f-bnNlz8hhzMnc_p5j9-rguRyC1_yrjyXfMnLqCsmQ9IpqKWV6GqKyZp4oC0roB2MDEH7BgcDWJVzDWXbR3GclOEpiEmn6E9Kp0mlYD4q4UPL_b4esctDlgReQ0KSP0ot1UdiZ5wfSrM5Sfe3DIkds8y2rgEUGeyWjKfxbUq4bVAhzXqzsbgw',
      merchant: 'Amazon India',
      price: 1499,
      model: 'RZ01-03850100-R3M1',
      stockNote: 'Prime Verified Stock',
      verdict: 'FULL_MATCH_ELIGIBLE',
      specs: [
        { label: 'Wired USB', pass: true },
        { label: '6,400 DPI Optical', pass: true },
        { label: '5 Prog. Buttons', pass: true }
      ],
      clearanceNote: 'Satisfies all 3 mandatory hardware constraints and lands well within the ₹3,000 autonomous ceiling.',
      proofToken: 'HMAC-SHA256:7f9a...c801 generated'
    },
    {
      id: 'cand-2',
      title: 'Logitech G502 HERO High Performance',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_2Z9hj5yEiye0NYjH394ThJZiAJBCOPM9n-QRYXzQi4l0TU_ScGjknzZXTBvOXO5aBPQuiuLPyOkqp_ap18ppmNjAiYmIOfuysb3yqg6v6XW4mWGYgmz2pNTteGo-cFu3bwsUMh1lpGGge8jtgbamw85rw6O5r0njCnGv-2moXImdXdDGILOJMZpAAhllDVBpJ1sMUdToeiKDWRU1FYBWDBiwRNpf5E-7epanMdvG9SbJs435dMz48g',
      merchant: 'Croma Verified',
      price: 3895,
      model: '910-005469',
      stockNote: 'Tier 1 Merchant',
      verdict: 'NEEDS_HUMAN_REVIEW',
      specs: [
        { label: 'Wired USB', pass: true },
        { label: 'HERO 25K Sensor', pass: true },
        { label: '11 Prog. Buttons', pass: true }
      ],
      clearanceNote: 'Clause §4.2 escalation: All hardware specifications match perfectly, but price (₹3,895) surpasses autonomous checkout cap of ₹3,000.',
      proofToken: 'Pending Sovereign Signer approval • Elena Vance queue'
    },
    {
      id: 'cand-3',
      title: 'Logitech MX Master 3S Wireless',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGqwIsKwfPmOuWi7w8Z-ROPHNTVH4U6UHCMLsJc_BDJso3CMDUp6_VQBcGZ-PmVSTj5_xHpQBAqo5lIC386p8psBsLfD_nhXgbB7SE02dotT-AoVkjNojMzNiink_ga2lITFcOlQ00_nZiLZWha3cxjM27UG6G23bcdg5bZyewTFfWXcxCRJZcCwgKgVJU7iXEfoXU1nZm6ZGWehqpIcUs5yuNBQbDyGmfSDdhauM4zfnthtliCFqyvQ',
      merchant: 'TechBazaar (Unlisted)',
      price: 8995,
      model: '910-006561',
      stockNote: 'Unauthorized Seller',
      verdict: 'BLOCKED_BY_POLICY',
      specs: [
        { label: 'Wireless Only', pass: false },
        { label: '8K Optical', pass: true },
        { label: 'Seller Unverified', pass: false }
      ],
      clearanceNote: 'Strict mandate rejection: Violates wired requirement, unapproved marketplace seller, and exceeds absolute ₹5,000 ceiling.',
      proofToken: 'Zero override bypass permitted under mandate rule SEC-0914'
    }
  ];

  return (
    <div className="bg-background min-h-screen text-on-surface antialiased">
      <Sidebar />
      <Header pageTitle="Shopping Agent" onOpenGuide={() => setGuideOpen(true)} />
      <ArbitrationModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />

      {/* Main Workspace */}
      <div className="pl-0 md:pl-64 transition-all duration-200">
        <main className="relative pt-20 bg-background min-h-screen w-full px-4 sm:px-6 lg:px-8 pb-16">
          <div className="max-w-7xl mx-auto flex flex-col w-full space-y-8">
            
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#E7E7E3]">
              <div className="space-y-2 max-w-2xl">
                <div className="page-eyebrow flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  <span>Autonomous Shopping Agent</span>
                  <span className="text-outline-variant">/</span>
                  <span>Procurement Orchestration Engine</span>
                </div>
                <h1 className="page-title">
                  Autonomous Shopping Agent
                </h1>
                <p className="page-subtitle">
                  Issue purchase tasks to AI agents and review candidate products against active spending mandates with deterministic gateway clearance.
                </p>
              </div>

              <div className="flex items-center gap-6 self-start md:self-end">
                <div className="flex flex-col">
                  <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider">
                    Active Mandate
                  </span>
                  <button className="flex items-center gap-2 pt-1 text-on-surface font-title-md hover:text-secondary transition-colors text-left" type="button">
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
                    <span className="font-semibold text-body-sm">Office Hardware Q4</span>
                    <span className="font-code-sm text-code-sm text-secondary font-normal">(Cap: ₹5,000)</span>
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant">expand_more</span>
                  </button>
                </div>
                <div className="h-8 w-px bg-[#E7E7E3] hidden sm:block"></div>
                <div className="hidden sm:flex flex-col">
                  <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider">
                    Assigned Agent
                  </span>
                  <div className="flex items-center gap-1.5 pt-1 font-body-sm text-body-sm text-on-surface font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                    <span>Claude Shopping</span>
                    <span className="font-code-sm text-[11px] text-secondary">v3.5-Sonnet</span>
                  </div>
                </div>
              </div>
            </header>

            {/* Zero-Implicit-Assent Protocol Banner */}
            <section className="py-3 px-4 rounded-lg bg-surface-container-low/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-body-sm text-on-surface-variant border-l-2 border-secondary">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-secondary text-[18px]">verified_user</span>
                <span>
                  <strong className="font-medium text-on-surface">Zero-Implicit-Assent Protocol:</strong> Unknown specifications are never verified matches. Blocked products have no override bypass.
                </span>
              </div>
              <div className="flex items-center gap-3 font-code-sm text-[12px] text-secondary flex-shrink-0">
                <span>RULE-SEC-0914</span>
                <span>•</span>
                <span>Deterministic Policy Enforced</span>
              </div>
            </section>

            {/* Shopping Task Brief Card */}
            <section className="space-y-6">
              <div className="relative bg-surface-container-lowest rounded-xl p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.03)] border border-[#E7E7E3] space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-[#E7E7E3]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[20px]">edit_note</span>
                    <span className="font-label-sm uppercase tracking-wider text-on-surface font-semibold">
                      Shopping Task Brief
                    </span>
                  </div>
                  <span className="font-code-sm text-code-sm text-on-surface-variant">
                    AST Semantic Parser Active
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
                    Targeting 3 authorized e-commerce marketplaces: Amazon India, Croma, Flipkart Business.
                  </p>
                </div>

                {/* Filter Parameters */}
                <div className="pt-4 border-t border-[#E7E7E3] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider">
                      Deterministic Filter Parameters
                    </span>
                    <span className="font-code-sm text-code-sm text-on-surface-variant">
                      Click to reassign parameter status
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-y-2.5 gap-x-6 text-body-sm">
                    {/* Must Have */}
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="font-label-sm uppercase tracking-wider text-on-surface font-semibold flex items-center gap-1.5 mr-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-on-background"></span>
                        Must Have
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

                    {/* Nice to Have */}
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="font-label-sm uppercase tracking-wider text-secondary font-semibold flex items-center gap-1.5 mr-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                        Nice to Have
                      </span>
                      {niceToHave.map((item) => (
                        <span key={item} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface font-code-sm text-[12px]">
                          {item}
                          <button
                            type="button"
                            onClick={() => removeParam('nice', item)}
                            className="text-on-surface-variant hover:text-error transition-colors"
                            aria-label={`Remove ${item}`}
                          >
                            <span className="material-symbols-outlined text-[13px]">close</span>
                          </button>
                        </span>
                      ))}
                    </div>

                    <span className="text-outline-variant/60 hidden lg:inline">|</span>

                    {/* Must Not Have */}
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="font-label-sm uppercase tracking-wider text-error font-semibold flex items-center gap-1.5 mr-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                        Must Not Have
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
                    <span className="material-symbols-outlined text-[16px] text-secondary">memory</span>
                    <span>AST Lexer ready • 7 parameters compiled</span>
                  </div>
                  <button
                    id="search-btn"
                    type="button"
                    onClick={handleSearch}
                    disabled={searching}
                    className="h-10 px-5 rounded-lg bg-primary-container hover:bg-primary text-on-primary transition-all flex items-center gap-2 font-label-md text-label-md shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">travel_explore</span>
                    <span>{searching ? 'Executing Lexer...' : 'Execute Autonomous Search'}</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Candidate Evaluation */}
            <section className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E7E7E3]">
                <div className="flex items-center gap-3">
                  <h2 className="section-title">
                    Candidate Evaluation
                  </h2>
                  <span className="font-label-sm text-label-sm px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface">
                    {displayCandidates.length} Products Evaluated
                  </span>
                </div>
                <div className="flex items-center gap-2 font-code-sm text-code-sm text-on-surface-variant">
                  <span>Clearance Gateway:</span>
                  <span className="text-on-surface font-medium">Deterministic Rule Arbiter (Zero-Assent)</span>
                </div>
              </div>

              <div className="divide-y divide-[#E7E7E3]">
                {displayCandidates.map((cand) => {
                  const isMatch = cand.verdict === 'FULL_MATCH_ELIGIBLE' || cand.verdict === 'ELIGIBLE';
                  const isReview = cand.verdict === 'NEEDS_HUMAN_REVIEW' || cand.price > 3000 && cand.price <= 5000;
                  const isBlocked = cand.verdict === 'BLOCKED_BY_POLICY' || cand.verdict === 'DEALBREAKER_REJECTED' || cand.price > 5000;

                  return (
                    <article
                      key={cand.id}
                      className={`py-6 transition-colors hover:bg-surface-container-low/40 rounded-xl px-4 -mx-4 ${
                        isBlocked ? 'opacity-85' : ''
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                        
                        {/* Product Visual & Basic Info */}
                        <div className="flex items-start gap-4 min-w-0 lg:w-4/12">
                          <div className={`w-20 h-20 rounded-lg overflow-hidden bg-surface-container flex-shrink-0 border border-[#E7E7E3] ${
                            isBlocked ? 'grayscale-[30%]' : ''
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
                              {isMatch ? (
                                <span className="inline-flex items-center gap-1 font-label-sm text-[11px] text-secondary font-semibold uppercase tracking-wider">
                                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                                  Eligible for Auto-Purchase
                                </span>
                              ) : isReview ? (
                                <span className="inline-flex items-center gap-1 font-label-sm text-[11px] text-secondary font-semibold uppercase tracking-wider">
                                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                                  Needs Human Review
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
                                {isMatch
                                  ? `(29.9% of ₹5,000 mandate cap)`
                                  : isReview
                                  ? `(Exceeds ₹3,000 auto-cap)`
                                  : `(Exceeds ceiling ₹5,000)`}
                              </span>
                            </p>

                            <p className="font-body-sm text-[12px] text-on-surface-variant">
                              Model: {cand.model || 'RZ01-0385'} • {cand.stockNote || 'Verified Stock'}
                            </p>
                          </div>
                        </div>

                        {/* Specs & Policy Clearance Notes */}
                        <div className="space-y-2 lg:w-5/12">
                          <div className="flex items-center gap-4 text-body-sm">
                            <span className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                              Specs
                            </span>
                            <div className="flex flex-wrap items-center gap-3 font-code-sm text-code-sm">
                              {cand.specs?.map((sp, idx) => (
                                <span
                                  key={idx}
                                  className={`inline-flex items-center gap-1 ${
                                    sp.pass ? 'text-on-surface' : 'text-error'
                                  }`}
                                >
                                  <span
                                    className={`material-symbols-outlined text-[15px] ${
                                      sp.pass ? 'text-secondary' : 'text-error'
                                    }`}
                                  >
                                    {sp.pass ? 'check' : 'close'}
                                  </span>
                                  {sp.label}
                                </span>
                              ))}
                            </div>
                          </div>

                          <p className="font-body-sm text-body-sm text-on-surface leading-snug">
                            {isMatch ? (
                              <>
                                <span className="font-medium text-secondary">Policy clearance verified:</span>{' '}
                                {cand.clearanceNote}
                              </>
                            ) : isReview ? (
                              <>
                                <span className="font-medium text-secondary">Clause §4.2 escalation:</span>{' '}
                                {cand.clearanceNote}
                              </>
                            ) : (
                              <>
                                <span className="font-medium text-error">Strict mandate rejection:</span>{' '}
                                {cand.clearanceNote}
                              </>
                            )}
                          </p>

                          <span className={`block font-code-sm text-[11px] ${isBlocked ? 'text-error' : 'text-on-surface-variant'}`}>
                            {cand.proofToken}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col items-start lg:items-end justify-center lg:w-3/12 space-y-1.5 flex-shrink-0">
                          {isMatch ? (
                            <button
                              type="button"
                              onClick={() => handleIssueRequest(cand.id)}
                              disabled={submittedRequest === cand.id}
                              className="w-full sm:w-auto h-9 px-4 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md transition-all flex items-center justify-center gap-2 shadow-sm font-medium"
                            >
                              <span className="material-symbols-outlined text-[16px]">bolt</span>
                              <span>{submittedRequest === cand.id ? 'Redirecting...' : 'Issue Purchase Request'}</span>
                            </button>
                          ) : isReview ? (
                            <button
                              type="button"
                              onClick={() => handleIssueRequest(cand.id)}
                              className="w-full sm:w-auto h-9 px-4 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-all flex items-center justify-center gap-2 shadow-sm font-medium"
                            >
                              <span className="material-symbols-outlined text-[16px]">verified_user</span>
                              <span>Submit for Signoff</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled
                              className="w-full sm:w-auto h-9 px-4 rounded-lg bg-surface-container text-on-surface-variant font-label-md text-label-md flex items-center justify-center gap-2 cursor-not-allowed opacity-60 font-medium"
                            >
                              <span className="material-symbols-outlined text-[16px]">block</span>
                              <span>Blocked by Policy</span>
                            </button>
                          )}

                          <span className={`font-code-sm text-[11px] ${isBlocked ? 'text-error' : 'text-on-surface-variant'}`}>
                            {isMatch
                              ? 'Instant gateway clearance'
                              : isReview
                              ? 'Requires manual authorization'
                              : 'No bypass available'}
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            {/* Deterministic Policy Enforcement Stream */}
            <section className="space-y-4 pt-4 border-t border-[#E7E7E3]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <h3 className="section-title">
                    Deterministic Policy Enforcement Stream
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Real-time execution log of AST node comparisons and cryptographic validation proofs.
                  </p>
                </div>
                <div className="flex items-center gap-3 font-code-sm text-code-sm text-on-surface-variant">
                  <span className="font-mono">HASH: 9c41..b2e8</span>
                  <span className="text-outline-variant">·</span>
                  <span>PCI-DSS 4.0 §3.2</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-body-sm text-body-sm">
                  <thead>
                    <tr className="text-on-surface-variant font-label-sm uppercase tracking-wider border-b border-[#E7E7E3]">
                      <th className="py-2.5 pr-4 font-semibold text-[11px]">Timestamp</th>
                      <th className="py-2.5 px-4 font-semibold text-[11px]">Evaluated Entity</th>
                      <th className="py-2.5 px-4 font-semibold text-[11px]">Checked Constraint</th>
                      <th className="py-2.5 px-4 font-semibold text-[11px]">Raw Metric</th>
                      <th className="py-2.5 px-4 font-semibold text-[11px]">Engine Arbiter</th>
                      <th className="py-2.5 pl-4 font-semibold text-[11px] text-right">Verdict</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E7E3] font-code-sm text-[13px]">
                    <tr className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="py-3 pr-4 text-on-surface-variant font-mono">14:02:41.109</td>
                      <td className="py-3 px-4 font-semibold text-on-surface">Razer DeathAdder</td>
                      <td className="py-3 px-4 text-on-surface-variant">Mandate Price Auto-Ceiling</td>
                      <td className="py-3 px-4">₹1,499.00 &lt; ₹3,000.00</td>
                      <td className="py-3 px-4 text-on-surface-variant">Policy-Rule-882 (Numeric)</td>
                      <td className="py-3 pl-4 text-right">
                        <span className="inline-flex items-center gap-1 text-secondary font-medium font-label-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                          <span>CLEAR</span>
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="py-3 pr-4 text-on-surface-variant font-mono">14:02:41.144</td>
                      <td className="py-3 px-4 font-semibold text-on-surface">Logitech G502 HERO</td>
                      <td className="py-3 px-4 text-on-surface-variant">Discretionary Auto-Threshold</td>
                      <td className="py-3 px-4">₹3,895.00 &gt; ₹3,000.00</td>
                      <td className="py-3 px-4 text-on-surface-variant">Escalation-Rule-401</td>
                      <td className="py-3 pl-4 text-right">
                        <span className="inline-flex items-center gap-1 text-secondary font-medium font-label-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                          <span>HOLD_FOR_HUMAN</span>
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="py-3 pr-4 text-on-surface-variant font-mono">14:02:41.198</td>
                      <td className="py-3 px-4 font-semibold text-on-surface">Logitech MX Master 3S</td>
                      <td className="py-3 px-4 text-on-surface-variant">Merchant Verification List</td>
                      <td className="py-3 px-4">techbazaar.in ∉ [Allowlist]</td>
                      <td className="py-3 px-4 text-on-surface-variant">Vendor-Security-Guard</td>
                      <td className="py-3 pl-4 text-right">
                        <span className="inline-flex items-center gap-1 text-error font-medium font-label-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                          <span>VETO_DENIED</span>
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
