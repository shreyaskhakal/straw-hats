import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import heroSculptureImg from '../assets/hero-sculpture.jpg';
import keychronLaptopImg from '../assets/keychron-laptop.jpg';
import logoImg from '../assets/mandate-logo.png';

export default function LandingPage() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeDecision, setActiveDecision] = useState('clearance');
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showSpecDrawer, setShowSpecDrawer] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [liveClock, setLiveClock] = useState('13:40:04 UTC');
  const [liveHash, setLiveHash] = useState('HASH: 9e88b...bc4aa');
  const [mousePos, setMousePos] = useState({ x: 50, y: 40 });
  const [terminalStep, setTerminalStep] = useState(7);

  const heroRef = useRef(null);

  useEffect(() => {
    // 1. Scroll Progress Bar
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // 2. Real-time UTC clock ticker
    const clockTimer = setInterval(() => {
      const now = new Date();
      setLiveClock(now.toISOString().split('T')[1].slice(0, 8) + ' UTC');
    }, 1000);

    // 3. Telemetry Hash jitter
    const hashTimer = setInterval(() => {
      const chars = '0123456789abcdef';
      let r = '';
      for (let i = 0; i < 5; i++) r += chars[Math.floor(Math.random() * chars.length)];
      setLiveHash(`HASH: 9e88b...${r}`);
    }, 4500);

    // 4. Scroll Reveal Observer with safety fallback
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.1,
    };

    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    revealElements.forEach((el) => {
      el.classList.add('scroll-hidden');
      revealObserver.observe(el);
    });

    // Safe visibility fallback: after 1.2s reveal all elements so nothing is permanently hidden
    const fallbackTimer = setTimeout(() => {
      document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
        el.classList.add('is-revealed');
      });
    }, 1200);

    // 5. 3D Tilt Hover on Bento Cards
    const tiltCards = document.querySelectorAll('.tilt-card');
    const tiltCleanups = [];

    tiltCards.forEach((card) => {
      const handleMouseMove = (e) => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;
        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-3px)`;
      };

      const handleMouseLeave = () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      };

      card.addEventListener('mousemove', handleMouseMove, { passive: true });
      card.addEventListener('mouseleave', handleMouseLeave);
      tiltCleanups.push(() => {
        card.removeEventListener('mousemove', handleMouseMove);
        card.removeEventListener('mouseleave', handleMouseLeave);
      });
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(clockTimer);
      clearInterval(hashTimer);
      clearTimeout(fallbackTimer);
      revealObserver.disconnect();
      tiltCleanups.forEach((fn) => fn());
    };
  }, []);

  const handleHeroMouseMove = (e) => {
    if (!heroRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  const handleCopyKey = () => {
    navigator.clipboard?.writeText('0x48a1f729b7c8942a03cf81b9e');
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopyJson = () => {
    const json = JSON.stringify({
      "$schema": "https://mandate.gw/schemas/policy-v2.json",
      "mandate_id": "89f41b2a-7c90-413e-a89f-2114d693f18e",
      "agent_id": "claude-shopping-v3.5",
      "target_division": "Engineering Hardware",
      "invariants": {
        "max_single_tx_amount": 80000,
        "currency": "INR",
        "monthly_allocation": 200000,
        "current_monthly_burn": 48200,
        "require_human_biometric_above": 50000,
        "merchant_whitelist": ["apple.com", "dell.com/in", "keychron.in", "lenovo.com/in"],
        "category_codes": ["5045", "5732", "5734"],
        "prompt_injection_guard": "STRICT_AST_PARSER",
        "ephemeral_card_ttl_sec": 180
      },
      "attestation": {
        "hardware_enclave": "Intel SGX Enclave v4.2",
        "root_signature": "0x48a1f729b7c8942a03cf81b9e"
      }
    }, null, 2);
    navigator.clipboard?.writeText(json);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const runSimulation = () => {
    setTerminalStep(1);
    let s = 1;
    const interval = setInterval(() => {
      s++;
      setTerminalStep(s);
      if (s >= 7) clearInterval(interval);
    }, 380);
  };

  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen flex flex-col justify-between selection:bg-secondary-container selection:text-on-secondary-fixed">
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-[2.5px] z-[60] bg-transparent pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-secondary via-secondary-fixed-dim to-secondary-fixed transition-[width] duration-75 ease-out shadow-[0_0_8px_rgba(213,196,169,0.8)]"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.03)] transition-all" id="main-header">
        <div className="h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between gap-4">
          <Link className="flex items-center gap-2.5 sm:gap-3 group shrink-0" to="/">
            <div className="w-9 h-9 rounded-lg bg-primary-container text-on-primary flex items-center justify-center transition-transform group-hover:scale-95 shadow-sm shrink-0">
              <span className="material-symbols-outlined text-[20px]">shield</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-title-md text-title-md font-semibold tracking-tight text-primary leading-tight truncate">
                Mandate Gateway
              </span>
              <span className="font-label-sm text-[10px] uppercase tracking-wider text-on-surface-variant truncate">
                Sovereign Intelligence
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 lg:gap-8 shrink-0">
            <a className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors" href="#product-preview">Product</a>
            <a className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors" href="#how-it-works">How It Works</a>
            <a className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors" href="#security">Security</a>
            <a className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors" href="#policy-decisions">Policy Engine</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link className="hidden sm:inline-flex font-body-md text-body-md text-on-surface-variant hover:text-on-surface px-3 py-2 transition-colors shrink-0" to="/login">
              Sign In
            </Link>
            <Link className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container text-primary font-label-md text-label-md hover:bg-surface-container-high transition-colors shrink-0" to="/dashboard">
              <span>Open Specs</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
            <Link className="btn-ripple font-label-md text-label-md bg-primary-container text-on-primary px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-all hover:bg-primary shadow-[0_1px_4px_rgba(0,0,0,0.12)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.2)] flex items-center gap-1.5 cursor-pointer shrink-0" to="/mandates">
              <span>Get Started</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
            <Link className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 hover:bg-primary-container transition-colors shadow-sm" title="Go to Decision Matrix" to="/agent">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full pt-20 bg-background flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex flex-col w-full">
          {/* Hero Stage with Restored Cinematic Architectural Glass Sculpture Atmosphere */}
          <section
            ref={heroRef}
            onMouseMove={handleHeroMouseMove}
            className="relative w-full bg-primary text-on-primary pb-16 sm:pb-20 pt-10 sm:pt-14 selection:bg-secondary-container selection:text-on-secondary-fixed rounded-3xl overflow-hidden shadow-2xl"
            id="hero-stage"
            style={{
              '--mouse-x': `${mousePos.x}%`,
              '--mouse-y': `${mousePos.y}%`
            }}
          >
            {/* Cinematic Architectural Glass Sculpture Background Layer */}
            <div className="absolute inset-0 z-0 overflow-hidden rounded-3xl pointer-events-none select-none">
              <img
                src={heroSculptureImg}
                alt="Architectural Glass Sculpture Hero Atmosphere"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                className="w-full h-full object-cover object-center opacity-55 mix-blend-luminosity filter contrast-115 brightness-105 scale-105 transition-transform duration-1000 ease-out"
                style={{
                  maskImage: 'radial-gradient(ellipse 85% 68% at 50% 36%, black 25%, transparent 88%)',
                  WebkitMaskImage: 'radial-gradient(ellipse 85% 68% at 50% 36%, black 25%, transparent 88%)'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-primary/20 pointer-events-none" />
            </div>

            {/* Interactive Spotlight Layer */}
            <div className="hero-spotlight absolute inset-0 z-0 pointer-events-none"></div>

            {/* Volumetric Light Shafts */}
            <div className="pointer-events-none absolute -top-40 -left-20 w-[680px] h-[780px] bg-gradient-to-br from-white/15 via-white/[0.04] to-transparent blur-3xl animate-godray"></div>
            <div className="pointer-events-none absolute top-0 left-1/4 w-[420px] h-[550px] bg-gradient-to-br from-white/10 via-secondary-fixed-dim/[0.04] to-transparent blur-2xl animate-godray-subtle"></div>
            <div className="pointer-events-none absolute -right-24 top-1/3 w-[500px] h-[600px] bg-gradient-to-bl from-white/[0.06] via-transparent to-transparent blur-3xl"></div>

            {/* Architectural Grid Backdrop */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,#000_60%,transparent_100%)] pointer-events-none"></div>

            {/* Vertical Floating Accent Label */}
            <aside className="hidden xl:flex absolute right-6 top-52 flex-col items-center gap-6 text-on-primary-container z-20 pointer-events-none opacity-80">
              <span className="font-code-sm text-code-sm tracking-[0.3em] uppercase text-on-surface-variant/70 [writing-mode:vertical-rl] select-none">
                Invariant · Enclave v4.2
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed-dim animate-pulse-subtle"></span>
              <span className="font-title-md text-title-md font-bold text-on-primary/90 tracking-tighter">W.</span>
            </aside>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Floating Glass Nav Pill */}
              <div className="flex items-center justify-between mx-auto max-w-4xl px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-primary-container/85 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] mb-8 sm:mb-14 lg:mb-16">
                <div className="flex items-center gap-2.5 pl-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-surface-container-lowest/15 flex items-center justify-center text-on-primary shadow-inner shrink-0">
                    <span className="material-symbols-outlined text-[15px]">token</span>
                  </div>
                  <span className="font-title-md text-title-md font-semibold tracking-tight text-on-primary truncate">
                    Mandate<span className="text-secondary-fixed-dim">.gw</span>
                  </span>
                </div>
                <nav className="hidden md:flex items-center gap-5 lg:gap-7 shrink-0">
                  <a className="font-label-md text-label-md text-on-primary-container hover:text-on-primary transition-colors" href="#how-it-works">How It Works</a>
                  <a className="font-label-md text-label-md text-on-primary-container hover:text-on-primary transition-colors" href="#policy-decisions">Policy Engine</a>
                  <a className="font-label-md text-label-md text-on-primary-container hover:text-on-primary transition-colors" href="#specification">Specification</a>
                  <a className="font-label-md text-label-md text-on-primary-container hover:text-on-primary transition-colors" href="#security">Security Enclave</a>
                </nav>
                <button
                  onClick={() => setShowSpecDrawer(true)}
                  className="inline-flex items-center gap-2 pl-3 sm:pl-3.5 pr-2 py-1.5 rounded-full bg-surface-container-lowest/10 hover:bg-surface-container-lowest/20 border border-white/15 transition-all text-on-primary font-label-md text-label-md group cursor-pointer shrink-0"
                  type="button"
                >
                  <span className="text-xs sm:text-label-md">Inspect Protocol</span>
                  <span className="w-5 h-5 rounded-full bg-on-primary text-primary flex items-center justify-center transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0">
                    <span className="material-symbols-outlined text-[13px] font-bold">north_east</span>
                  </span>
                </button>
              </div>

              {/* Monumental Centered Headline Group with Staged Animations */}
              <div className="text-center max-w-4xl mx-auto flex flex-col items-center">
                {/* Eyebrow Pill */}
                <div className="animate-hero-eyebrow inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-lowest/10 border border-white/10 backdrop-blur-md mb-5 sm:mb-6 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-subtle"></span>
                  <span className="font-label-sm text-[11px] sm:text-label-sm uppercase tracking-[0.14em] text-on-primary/90 font-medium">
                    Sovereign AI Payment Arbitration Engine
                  </span>
                </div>

                {/* Monumental Headline */}
                <h1 className="animate-hero-headline font-display text-[32px] xs:text-[38px] sm:text-[50px] md:text-[60px] lg:text-[68px] leading-[1.1] sm:leading-[1.08] font-bold text-on-primary tracking-[-0.035em] mb-5 sm:mb-6 max-w-4xl break-words">
                  Give Your AI the Power to Buy. Keep the Power to Decide.
                </h1>

                {/* Subtitle */}
                <p className="animate-hero-subtitle font-body-lg text-body-md sm:text-body-lg text-on-primary-container max-w-3xl mx-auto mb-8 sm:mb-10 leading-relaxed font-normal">
                  Mandate Gateway allows users to set spending boundaries and require human approval before an AI shopping agent proceeds with a purchase. Deterministic policy enforcement, real-time cart auditing, and intended PayPal sandbox payment integration.
                </p>

                {/* Dual Pill CTA Buttons */}
                <div className="animate-hero-ctas flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full sm:w-auto">
                  <Link
                    to="/agent"
                    className="btn-ripple w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-4 pl-2 pr-6 py-2 rounded-full bg-surface-container-lowest text-primary hover:bg-surface-container-lowest/90 font-label-md text-label-md transition-all shadow-[0_12px_32px_rgba(255,255,255,0.18)] hover:scale-[1.02] cursor-pointer"
                  >
                    <span className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md shrink-0">
                      <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                    </span>
                    <span className="font-semibold tracking-tight text-sm whitespace-nowrap">Try Autonomous Shopping Agent</span>
                  </Link>
                  <Link
                    to="/mandates"
                    className="btn-ripple w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-surface-container-lowest/10 hover:bg-surface-container-lowest/20 border border-white/20 text-on-primary font-label-md text-label-md transition-all whitespace-nowrap"
                  >
                    <span>Configure Mandates</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>
              </div>

              {/* Bento Showcase Section with 3D Tilt & Staged Entrance */}
              <div className="animate-hero-bento mt-12 sm:mt-16 lg:mt-20 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch" id="product-preview">
                {/* Card 1: Hardware Agent Procurement Enclave */}
                <div className="tilt-card lg:col-span-3 flex flex-col justify-between rounded-3xl bg-surface-container-lowest/[0.04] border border-white/10 backdrop-blur-md p-5 sm:p-6 overflow-hidden relative group hover:border-white/20 transition-all shadow-[0_16px_40px_rgba(0,0,0,0.4)]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-primary-container">Sub-Agent Alpha-04</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-code-sm text-[11px] shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      Cleared ₹4,200
                    </span>
                  </div>
                  <div className="relative my-4 rounded-2xl overflow-hidden bg-primary-container/80 p-3 sm:p-4 border border-white/5">
                    <div
                      className="h-44 w-full rounded-xl bg-cover bg-center flex flex-col justify-end p-3.5 relative overflow-hidden transition-transform duration-500 group-hover:scale-[1.03]"
                      style={{ backgroundImage: `url(${keychronLaptopImg})` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent opacity-80"></div>
                      <div className="relative z-10 flex items-center justify-between">
                        <span className="font-title-md text-title-md font-semibold text-on-primary">Keychron Q1 Max</span>
                        <span className="font-code-sm text-code-sm text-on-primary-container font-mono">#HW-8902</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="material-symbols-outlined text-secondary-fixed-dim text-[18px]">verified</span>
                      <p className="font-title-md text-title-md text-on-primary">Hardware Procurement</p>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-primary-container leading-relaxed">
                      Autonomous engineer desk refresh. Pre-approved merchant whitelist active with strict invoice cryptographic hashing.
                    </p>
                  </div>
                </div>

                {/* Card 2: Real-Time Agent Clearance Matrix Centerpiece */}
                <div className="tilt-card lg:col-span-6 flex flex-col justify-between rounded-3xl bg-surface-container-lowest/[0.04] border border-white/10 backdrop-blur-md p-5 sm:p-6 lg:p-7 relative overflow-hidden group hover:border-white/20 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                  <div className="flex items-center justify-between mb-4 z-10 relative">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse-subtle"></div>
                      <span className="font-label-md text-label-md tracking-wider uppercase text-on-primary font-medium">Live Secure Enclave Stream</span>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-lowest/10 border border-white/10 font-code-sm text-code-sm text-on-primary shrink-0">
                      <span className="material-symbols-outlined text-[14px]">lock</span>
                      <span>SGX Isolated</span>
                    </div>
                  </div>

                  {/* Sculpture Visual Centerpiece with Shimmer Sweep & Floating Telemetry Overlay */}
                  <div className="relative my-2 rounded-2xl overflow-hidden aspect-[16/10] min-h-[280px] sm:min-h-[310px] bg-surface-container/10 border border-white/5 group">
                    <img
                      className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                      src={heroSculptureImg}
                      alt="Monumental abstract architectural glass sculpture with smoked graphite and brushed titanium"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/30 to-transparent pointer-events-none"></div>
                    {/* Specular Light Sweep Shimmer Animation */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full animate-shimmer-sweep pointer-events-none" />

                    {/* Overlaid Enclave Telemetry Feed with Gentle Floating Motion */}
                    <div className="absolute inset-x-3 sm:inset-x-4 bottom-3 sm:bottom-4 p-3.5 sm:p-4 rounded-xl bg-primary-container/90 backdrop-blur-xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xl animate-float-subtle">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-secondary-fixed/20 text-secondary-fixed flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[18px]">psychology</span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-label-md text-label-md text-on-primary font-medium">Claude-Shopping-v3.5</span>
                            <span className="font-code-sm text-[10px] text-secondary-fixed-dim bg-white/5 px-1.5 py-0.5 rounded font-mono">PID #8491</span>
                          </div>
                          <p className="font-code-sm text-code-sm text-on-primary-container truncate">Cart: 1x Dell 4K Ultrasharp • $649.00 USD</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:self-center shrink-0">
                        <div className="flex flex-col items-start sm:items-end mr-1">
                          <span className="font-code-sm text-[10px] text-emerald-400 font-semibold tracking-wide">RULE-04 PASS</span>
                          <span className="font-label-sm text-[11px] text-on-primary">Ephemeral Token Minted</span>
                        </div>
                        <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[16px]">check</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 text-on-primary-container">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="material-symbols-outlined text-secondary-fixed-dim text-[18px] shrink-0">format_image_left</span>
                      <span className="font-body-sm text-body-sm truncate">Zero exposure of master institutional credit lines</span>
                    </div>
                    <span className="font-code-sm text-code-sm text-on-surface-variant font-mono transition-colors shrink-0">{liveHash}</span>
                  </div>
                </div>

                {/* Card 3: Dialedweb Stacked Metric Units */}
                <div className="lg:col-span-3 flex flex-col gap-5">
                  {/* Top Card: Reliability Metric */}
                  <div className="tilt-card flex-1 rounded-3xl bg-surface-container-lowest/[0.04] border border-white/10 backdrop-blur-md p-5 sm:p-6 flex flex-col justify-between hover:border-white/20 transition-all shadow-[0_16px_40px_rgba(0,0,0,0.4)]">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-primary-container">Arbitration Reliability</span>
                      <button onClick={() => setShowSpecDrawer(true)} className="w-8 h-8 rounded-full bg-surface-container-lowest/10 hover:bg-surface-container-lowest/20 flex items-center justify-center text-on-primary transition-all cursor-pointer shrink-0" title="View Invariant Logs" type="button">
                        <span className="material-symbols-outlined text-[16px]">north_east</span>
                      </button>
                    </div>
                    <div className="my-5 sm:my-6">
                      <div className="font-display text-[38px] sm:text-[42px] leading-tight font-bold text-on-primary tracking-tight">
                        99.98%
                      </div>
                      <p className="font-body-sm text-body-sm text-on-primary-container mt-1">Cryptographic policy invariant execution rate over 1.2M transactions.</p>
                    </div>
                    <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                      <span className="font-label-sm text-label-sm text-on-primary">14ms Average Arbitration Latency</span>
                    </div>
                  </div>

                  {/* Bottom Card: Hardware Attestation Seal */}
                  <div className="tilt-card flex-1 rounded-3xl bg-surface-container-lowest/[0.04] border border-white/10 backdrop-blur-md p-5 sm:p-6 flex flex-col justify-between hover:border-white/20 transition-all shadow-[0_16px_40px_rgba(0,0,0,0.4)]">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-primary-container">Hardware Security</span>
                        <span className="material-symbols-outlined text-secondary-fixed-dim text-[20px] shrink-0">encrypted</span>
                      </div>
                      <p className="font-title-md text-title-md font-semibold text-on-primary mb-1.5">Zero Master-Card Exposure</p>
                      <p className="font-body-sm text-body-sm text-on-primary-container">Single-use synthetic cards dissolve 180 seconds after settlement.</p>
                    </div>
                    <div className="mt-4 p-3 rounded-xl bg-primary-container/60 border border-white/5 flex items-center justify-between gap-2">
                      <span className="font-code-sm text-[11px] text-on-primary font-mono tracking-tight truncate">
                        ENCLAVE_PUB_KEY: 0x48...9B7
                      </span>
                      <button onClick={handleCopyKey} className="text-on-surface-variant hover:text-on-primary text-xs flex items-center gap-1 cursor-pointer transition-colors shrink-0" title="Copy Key" type="button">
                        <span className="material-symbols-outlined text-[14px]">content_copy</span>
                        <span className={`text-[10px] text-emerald-400 font-mono ${copiedKey ? 'inline' : 'hidden'}`}>COPIED</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Interactive Sandbox Live Ticker */}
          <div className="w-full bg-primary-container border-y border-white/10 text-on-primary py-3 overflow-hidden select-none rounded-2xl my-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-label-sm text-[11px] uppercase tracking-wider font-semibold flex items-center gap-1 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-subtle"></span>
                  Active Pipeline
                </span>
                <span className="font-body-sm text-body-sm text-on-primary-container">
                  Autonomous Checkout Enclave #SGX-7719
                </span>
                <span className="hidden md:inline font-mono text-[11px] text-secondary-fixed-dim">
                  {liveClock}
                </span>
              </div>
              <div className="flex items-center gap-4 sm:gap-6 font-code-sm text-code-sm text-on-primary-container flex-wrap">
                <span className="hidden sm:inline">Active Agents: <strong className="text-on-primary">14,892</strong></span>
                <span>Blocked Intercepts (24h): <strong className="text-rose-400">319</strong></span>
                <span>Allocated Capital: <strong className="text-on-primary">$4,882,100</strong></span>
              </div>
            </div>
          </div>

          {/* Section 1: Architecture — Execution Pipeline */}
          <section className="w-full py-20 sm:py-28 bg-background relative reveal-on-scroll" id="how-it-works">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
                <div>
                  <span className="font-label-sm text-label-sm uppercase tracking-[0.2em] text-secondary font-semibold">Execution Pipeline</span>
                  <h2 className="font-headline-lg text-headline-lg sm:text-[40px] sm:leading-tight font-bold text-on-surface mt-2 tracking-tight">
                    Structured execution from intent to settlement
                  </h2>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                  Autonomous agents navigate product listings freely, while your cryptographic rules determine if, when, and how funds move.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                {/* Step 1 */}
                <div className="reveal-on-scroll reveal-delay-100 rounded-3xl bg-surface-container-lowest p-6 sm:p-8 border border-surface-container-high shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-6 sm:mb-8">
                      <span className="font-display text-display text-secondary/30 font-bold">01</span>
                      <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[20px]">policy</span>
                      </div>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-3">Natural Language Policy Compiler</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                      Define spending envelopes in human terms ("Cap peripherals under ₹5,000 on Amazon India"). The gateway compiles this intent into an immutable AST rule set.
                    </p>
                  </div>
                  <div className="mt-8 pt-4 border-t border-surface-container flex items-center gap-2 text-secondary font-label-sm text-label-sm">
                    <span className="material-symbols-outlined text-[16px]">lock_clock</span>
                    <span>Immutable Attestation Hash</span>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="reveal-on-scroll reveal-delay-200 rounded-3xl bg-surface-container-lowest p-6 sm:p-8 border border-surface-container-high shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-6 sm:mb-8">
                      <span className="font-display text-display text-secondary/30 font-bold">02</span>
                      <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[20px]">rule_folder</span>
                      </div>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-3">Zero-Knowledge Cart Audit</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                      When an autonomous agent selects items, the gateway evaluates the cart against merchant whitelists, budget thresholds, and prompt injection signatures inside an isolated enclave.
                    </p>
                  </div>
                  <div className="mt-8 pt-4 border-t border-surface-container flex items-center gap-2 text-secondary font-label-sm text-label-sm">
                    <span className="material-symbols-outlined text-[16px]">visibility_off</span>
                    <span>Zero Data Leakage to Merchants</span>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="reveal-on-scroll reveal-delay-300 rounded-3xl bg-surface-container-lowest p-6 sm:p-8 border border-surface-container-high shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-6 sm:mb-8">
                      <span className="font-display text-display text-secondary/30 font-bold">03</span>
                      <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[20px]">credit_card</span>
                      </div>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-3">Ephemeral Settlement Dispatch</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                      Only upon policy clearance does the gateway mint a single-use virtual card token locked to the exact cart amount. The synthetic card dissolves within 180 seconds.
                    </p>
                  </div>
                  <div className="mt-8 pt-4 border-t border-surface-container flex items-center gap-2 text-secondary font-label-sm text-label-sm">
                    <span className="material-symbols-outlined text-[16px]">timer</span>
                    <span>180s Automatic Token Evaporation</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Dedicated Section: Mandate-to-Purchase Workflow & PayPal Sandbox Integration */}
          <section className="w-full py-16 sm:py-24 bg-surface-container-lowest border-y border-[#E7E7E3] relative" id="paypal-workflow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E7E7E3] pb-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
                    <span className="font-label-sm text-label-sm uppercase tracking-[0.2em] text-secondary font-semibold">
                      Payment Architecture
                    </span>
                  </div>
                  <h2 className="font-headline-lg text-2xl sm:text-3xl lg:text-4xl font-bold text-primary tracking-tight">
                    Mandate-to-Purchase Workflow with PayPal Sandbox
                  </h2>
                </div>
                <p className="font-body-md text-sm text-on-surface-variant max-w-lg leading-relaxed">
                  How autonomous agent product discovery maps to verified PayPal sandbox settlement through deterministic policy arbitration.
                </p>
              </div>

              {/* 5-Step Visual Flow */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="p-5 rounded-2xl bg-surface-container-low/50 border border-[#E7E7E3] flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="font-mono text-[11px] font-bold text-secondary uppercase tracking-wider">Step 01</span>
                    <h3 className="font-title-md text-[15px] font-semibold text-primary">User Mandate</h3>
                    <p className="text-[12px] text-on-surface-variant leading-relaxed">
                      User configures spending ceiling, allowed merchants, and auto-approval limits.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#E7E7E3]/60 font-mono text-[10px] text-secondary">
                    Input: Plain English Rules
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-surface-container-low/50 border border-[#E7E7E3] flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="font-mono text-[11px] font-bold text-secondary uppercase tracking-wider">Step 02</span>
                    <h3 className="font-title-md text-[15px] font-semibold text-primary">AI Discovery</h3>
                    <p className="text-[12px] text-on-surface-variant leading-relaxed">
                      Shopping agent searches authorized marketplaces (via Channel3 adapter) for candidates.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#E7E7E3]/60 font-mono text-[10px] text-secondary">
                    Filter: Whitelisted Sellers
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-surface-container-low/50 border border-[#E7E7E3] flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="font-mono text-[11px] font-bold text-secondary uppercase tracking-wider">Step 03</span>
                    <h3 className="font-title-md text-[15px] font-semibold text-primary">Policy Decision</h3>
                    <p className="text-[12px] text-on-surface-variant leading-relaxed">
                      Gateway deterministically evaluates candidate. Items over threshold require approval.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#E7E7E3]/60 font-mono text-[10px] text-secondary">
                    Engine: Zero-Implicit-Assent
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-surface-container-low/50 border border-[#E7E7E3] flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="font-mono text-[11px] font-bold text-secondary uppercase tracking-wider">Step 04</span>
                    <h3 className="font-title-md text-[15px] font-semibold text-primary">User Approval</h3>
                    <p className="text-[12px] text-on-surface-variant leading-relaxed">
                      User inspects cart evidence in Approval Center and confirms high-value orders.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#E7E7E3]/60 font-mono text-[10px] text-secondary">
                    Guard: 1-Click Biometric
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-surface-container-low/50 border border-[#E7E7E3] flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="font-mono text-[11px] font-bold text-secondary uppercase tracking-wider">Step 05</span>
                    <h3 className="font-title-md text-[15px] font-semibold text-primary">PayPal Sandbox</h3>
                    <p className="text-[12px] text-on-surface-variant leading-relaxed">
                      Single-use sandbox order token released. Capture verified and logged to audit trail.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#E7E7E3]/60 font-mono text-[10px] text-emerald-700 font-semibold">
                    Settlement: Sandbox Verified
                  </div>
                </div>
              </div>

              {/* PayPal Sandbox Disclosure Box */}
              <div className="p-6 rounded-2xl bg-surface-container border border-outline-variant/40 space-y-3">
                <div className="flex items-center gap-2 text-primary font-semibold text-[14px]">
                  <span className="material-symbols-outlined text-[20px] text-secondary">handshake</span>
                  <span>PayPal Sandbox Integration Intent &amp; Project Disclaimer</span>
                </div>
                <p className="text-[13px] text-on-surface-variant leading-relaxed">
                  Mandate Gateway is an independent hackathon prototype designed to bridge AI shopping autonomy with institutional payment safety.
                  Official PayPal APIs (Orders v2 and Payments v2) in the Sandbox environment provide the intended payment settlement layer.
                  This demo is strictly an independent product architecture and does not claim official PayPal affiliation or corporate ownership.
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-1 font-mono text-[11px] text-secondary">
                  <span>• Target Environment: api-m.sandbox.paypal.com</span>
                  <span>• Re-authorization: Server-Side Before Capture</span>
                  <span>• Zero Raw Card Exposure</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Specimen Matrix #M-408 */}
          <section className="w-full py-20 sm:py-28 bg-surface-container-low/60 relative overflow-hidden rounded-3xl" id="specification">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
                <div className="lg:col-span-5 space-y-6">
                  <span className="font-label-sm text-label-sm uppercase tracking-[0.2em] text-secondary font-semibold">Living Policy Protocol</span>
                  <h2 className="font-headline-lg text-headline-lg sm:text-[38px] font-bold text-on-surface tracking-tight leading-tight">
                    Machine-readable policies that agents cannot bypass
                  </h2>
                  <p className="font-body-lg text-body-md sm:text-body-lg text-on-surface-variant leading-relaxed">
                    Policies compile directly into cryptographic ASTs evaluated by the gateway's isolated execution enclave. No LLM hallucination or prompt injection can alter these hard mathematical boundaries.
                  </p>
                  <div className="space-y-4 pt-2">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-[14px]">check</span>
                      </div>
                      <div>
                        <span className="font-title-md text-title-md text-on-surface font-semibold">Multi-Sig Biometric Escalation</span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Baskets crossing ₹50,000 automatically route to designated partner Telegram or Slack for 1-click biometrics.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-[14px]">check</span>
                      </div>
                      <div>
                        <span className="font-title-md text-title-md text-on-surface font-semibold">Merchant Whitelist Locking</span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Restricted strictly to validated OEM vendors, barring unknown third-party marketplace dropshippers.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-[14px]">check</span>
                      </div>
                      <div>
                        <span className="font-title-md text-title-md text-on-surface font-semibold">Tamper-Evident Audit Trails</span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Exportable cryptographic proofs ready for SOC 2 Type II, ISO 27001, and banking reserve compliance.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Specimen Card */}
                <div className="lg:col-span-7">
                  <div className="rounded-3xl bg-surface-container-lowest p-5 sm:p-8 border border-surface-container-high shadow-lg relative overflow-hidden transition-all duration-300 hover:shadow-xl">
                    <div className="flex items-center justify-between pb-5 sm:pb-6 border-b border-surface-container mb-6 gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold font-title-md shadow shrink-0">
                          M
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-title-md text-title-md font-bold text-on-surface truncate">Mandate Specification: Engineering Hardware</h4>
                          <p className="font-code-sm text-code-sm text-on-surface-variant font-mono truncate">UUID: 89f41b2a-7c90-413e-a89f-2114d693f18e</p>
                        </div>
                      </div>
                      <span className="px-2.5 sm:px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-label-sm text-[11px] font-semibold uppercase flex items-center gap-1.5 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Active Policy
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      <div className="p-4 rounded-2xl bg-surface-container-low transition-colors hover:bg-surface-container">
                        <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">Max Single Transaction</span>
                        <div className="font-display text-[26px] font-bold text-primary mt-1 font-mono">₹80,000</div>
                        <span className="font-code-sm text-[11px] text-on-surface-variant">Hard ceiling per merchant order</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-surface-container-low transition-colors hover:bg-surface-container">
                        <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">Monthly Allocation Burn</span>
                        <div className="font-display text-[26px] font-bold text-secondary mt-1 font-mono">₹48,200 <span className="font-body-sm text-[13px] text-on-surface-variant font-normal">/ ₹200,000</span></div>
                        <div className="w-full h-1.5 rounded-full bg-surface-container-highest mt-2 overflow-hidden">
                          <div className="h-full bg-secondary rounded-full transition-all duration-1000 ease-out" style={{ width: '24.1%' }}></div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2.5 sm:space-y-3 font-code-sm text-code-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-surface-container-low gap-1">
                        <span className="text-on-surface-variant">Approved Merchant Class:</span>
                        <span className="text-on-surface font-semibold">IT Hardware, Electronics, Ergonomics</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-surface-container-low gap-1">
                        <span className="text-on-surface-variant">Allowed Vendors:</span>
                        <span className="text-on-surface font-semibold">Apple, Dell, Keychron, Lenovo Official</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-surface-container-low gap-1">
                        <span className="text-on-surface-variant">HITL (Human Approval):</span>
                        <span className="text-secondary font-semibold">Required for baskets &gt; ₹50,000</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-5 border-t border-surface-container flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                        <span className="font-label-md text-label-md text-on-surface font-medium">Agent Enclave Ready</span>
                      </div>
                      <button
                        onClick={() => setShowSpecDrawer(true)}
                        className="inline-flex items-center gap-1.5 font-label-md text-label-md text-primary hover:text-secondary font-semibold transition-colors cursor-pointer group shrink-0"
                        type="button"
                      >
                        <span className="group-hover:underline">Edit in Console</span>
                        <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-1">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Three Decisions. Zero Ambiguity. */}
          <section className="w-full py-20 sm:py-28 bg-background relative" id="policy-decisions">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
                <span className="font-label-sm text-label-sm uppercase tracking-[0.2em] text-secondary font-semibold">Arbitration Outputs</span>
                <h2 className="font-headline-lg text-headline-lg sm:text-[40px] font-bold text-on-surface mt-2 tracking-tight">
                  Three clear decisions. Zero ambiguity.
                </h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant mt-4 leading-relaxed">
                  Every autonomous shopping checkout attempt resolves into exactly one deterministic policy state. Select a card below to inspect simulation telemetry.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Decision 1: Clearance */}
                <div
                  onClick={() => setActiveDecision('clearance')}
                  className={`cursor-pointer rounded-3xl bg-surface-container-lowest p-6 sm:p-8 border-2 transition-all duration-300 flex flex-col justify-between ${
                    activeDecision === 'clearance'
                      ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                      : 'border-surface-container-high hover:border-emerald-500/50 shadow-sm'
                  }`}
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center mb-6">
                      <span className="material-symbols-outlined text-[24px]">verified</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Instant Clearance</h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold uppercase">Auto</span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant mb-6 leading-relaxed">
                      Every basket item, merchant identity, warranty add-on, and tax line strictly satisfies the preset mandate rules.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-surface-container">
                    <ul className="space-y-2 font-body-sm text-body-sm text-on-surface-variant">
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-600 text-[16px] shrink-0">check_circle</span>
                        <span>Ephemeral card minted instantly</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-600 text-[16px] shrink-0">check_circle</span>
                        <span>0.02s arbitration turnaround</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-600 text-[16px] shrink-0">check_circle</span>
                        <span>Immutable audit ledger written</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Decision 2: HITL */}
                <div
                  onClick={() => setActiveDecision('hitl')}
                  className={`cursor-pointer rounded-3xl bg-surface-container-lowest p-6 sm:p-8 border-2 transition-all duration-300 flex flex-col justify-between ${
                    activeDecision === 'hitl'
                      ? 'border-amber-500 shadow-md ring-2 ring-amber-500/20'
                      : 'border-surface-container-high hover:border-amber-500/50 shadow-sm'
                  }`}
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center mb-6">
                      <span className="material-symbols-outlined text-[24px]">contact_support</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">HITL Escalation</h3>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold uppercase">Approval</span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant mb-6 leading-relaxed">
                      The transaction falls inside tolerance windows but crosses high-value thresholds or flags alternate shipping destinations.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-surface-container">
                    <ul className="space-y-2 font-body-sm text-body-sm text-on-surface-variant">
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-600 text-[16px] shrink-0">check_circle</span>
                        <span>Push notification to controller</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-600 text-[16px] shrink-0">check_circle</span>
                        <span>1-tap biometric confirmation</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-600 text-[16px] shrink-0">check_circle</span>
                        <span>Agent paused safely in enclave</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Decision 3: Deterministic Block */}
                <div
                  onClick={() => setActiveDecision('block')}
                  className={`cursor-pointer rounded-3xl bg-surface-container-lowest p-6 sm:p-8 border-2 transition-all duration-300 flex flex-col justify-between ${
                    activeDecision === 'block'
                      ? 'border-rose-500 shadow-md ring-2 ring-rose-500/20'
                      : 'border-surface-container-high hover:border-rose-500/50 shadow-sm'
                  }`}
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-700 flex items-center justify-center mb-6">
                      <span className="material-symbols-outlined text-[24px]">gpp_bad</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Deterministic Block</h3>
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-semibold uppercase">Rejection</span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant mb-6 leading-relaxed">
                      Unrecognized merchant, unexpected currency conversion, price surges, or prompt injection payloads detected in item metadata.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-surface-container">
                    <ul className="space-y-2 font-body-sm text-body-sm text-on-surface-variant">
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-rose-600 text-[16px] shrink-0">check_circle</span>
                        <span>Zero financial exposure</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-rose-600 text-[16px] shrink-0">check_circle</span>
                        <span>Immediate agent runtime quarantine</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-rose-600 text-[16px] shrink-0">check_circle</span>
                        <span>Security alert broadcast to SecOps</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Dynamic Live Specimen Preview Panel */}
              <div className="mt-8 rounded-3xl bg-primary text-on-primary p-5 sm:p-8 border border-white/10 shadow-xl transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px]">
                        {activeDecision === 'clearance' ? 'verified' : activeDecision === 'hitl' ? 'contact_support' : 'gpp_bad'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-title-md text-title-md font-bold text-on-primary truncate">
                        {activeDecision === 'clearance' && 'Current Simulation: Instant Clearance Policy Flow'}
                        {activeDecision === 'hitl' && 'Current Simulation: HITL Threshold Escalation Flow'}
                        {activeDecision === 'block' && 'Current Simulation: Deterministic Policy Block & Quarantine'}
                      </h4>
                      <p className="font-code-sm text-code-sm text-on-primary-container truncate font-mono">
                        Runtime ID: #ENCLAVE-SESSION-4892 • Verdict: {activeDecision === 'clearance' ? 'APPROVED' : activeDecision === 'hitl' ? 'PENDING_APPROVAL' : 'VETO_REJECTED'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSpecDrawer(true)}
                    className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-on-primary font-code-sm text-xs border border-white/10 cursor-pointer transition-colors shrink-0"
                    type="button"
                  >
                    View JSON Rule Engine
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-[12px]">
                  <div className="p-3.5 rounded-xl bg-primary-container/70 border border-white/5">
                    <div className="text-on-primary-container mb-1">Incoming Intercept</div>
                    <div className="text-on-primary font-semibold">
                      {activeDecision === 'clearance' && 'Keychron Q1 Max (₹16,499)'}
                      {activeDecision === 'hitl' && 'Lenovo ThinkPad X1 (₹1,24,990)'}
                      {activeDecision === 'block' && 'Untrusted Dropper (₹8,995)'}
                    </div>
                    <div className="text-secondary-fixed-dim text-[11px] mt-0.5">
                      {activeDecision === 'clearance' && 'Dell Official / Keychron India'}
                      {activeDecision === 'hitl' && 'Lenovo Direct Store OEM'}
                      {activeDecision === 'block' && 'techbazaar.in (Unverified)'}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-primary-container/70 border border-white/5">
                    <div className="text-on-primary-container mb-1">Invariant Check</div>
                    <div className="text-emerald-400 font-semibold">
                      {activeDecision === 'clearance' && 'Under ₹80,000 threshold'}
                      {activeDecision === 'hitl' && 'Crosses ₹50,000 HITL cap'}
                      {activeDecision === 'block' && 'Domain not on Whitelist'}
                    </div>
                    <div className="text-on-primary-container text-[11px] mt-0.5">
                      {activeDecision === 'clearance' && 'Whitelist Validated & Clean DOM'}
                      {activeDecision === 'hitl' && 'Route to Controller Biometrics'}
                      {activeDecision === 'block' && 'AST Injection Flag Raised'}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-primary-container/70 border border-white/5">
                    <div className="text-on-primary-container mb-1">Gateway Output</div>
                    <div className="text-emerald-400 font-semibold">
                      {activeDecision === 'clearance' && 'Single-use token issued'}
                      {activeDecision === 'hitl' && 'Push challenge dispatched'}
                      {activeDecision === 'block' && 'Execution halted (0.001s)'}
                    </div>
                    <div className="text-on-primary-container text-[11px] mt-0.5">
                      {activeDecision === 'clearance' && 'Dissolves in 180 seconds'}
                      {activeDecision === 'hitl' && 'Holding basket in SGX state'}
                      {activeDecision === 'block' && 'Zero credential release'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Security Architecture */}
          <section className="w-full py-20 sm:py-24 bg-primary text-on-primary relative overflow-hidden rounded-3xl" id="security">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl mb-12 sm:mb-16">
                <span className="font-label-sm text-label-sm uppercase tracking-[0.2em] text-secondary-fixed-dim font-semibold">Institutional Grade</span>
                <h2 className="font-headline-lg text-headline-lg sm:text-[40px] font-bold text-on-primary mt-2 tracking-tight">
                  Cryptographically isolated payment execution
                </h2>
                <p className="font-body-lg text-body-lg text-on-primary-container mt-4 leading-relaxed">
                  Built on hardware-grade Confidential Computing and zero-knowledge policy verification.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="tilt-card rounded-3xl bg-surface-container-lowest/[0.04] p-6 border border-white/10 backdrop-blur-md hover:border-white/25 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-on-primary mb-5 shadow-inner">
                    <span className="material-symbols-outlined text-[20px]">memory</span>
                  </div>
                  <h4 className="font-title-md text-title-md font-semibold text-on-primary mb-2">Intel SGX &amp; SEV Enclaves</h4>
                  <p className="font-body-sm text-body-sm text-on-primary-container leading-relaxed">
                    Code and sensitive card payloads run inside encrypted hardware enclaves unreachable even by host operating systems.
                  </p>
                </div>
                <div className="tilt-card rounded-3xl bg-surface-container-lowest/[0.04] p-6 border border-white/10 backdrop-blur-md hover:border-white/25 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-on-primary mb-5 shadow-inner">
                    <span className="material-symbols-outlined text-[20px]">credit_card_heart</span>
                  </div>
                  <h4 className="font-title-md text-title-md font-semibold text-on-primary mb-2">1-to-1 Ephemeral Cards</h4>
                  <p className="font-body-sm text-body-sm text-on-primary-container leading-relaxed">
                    Virtual card tokens are provisioned strictly for the authorized amount and immediately dissolved post-confirmation.
                  </p>
                </div>
                <div className="tilt-card rounded-3xl bg-surface-container-lowest/[0.04] p-6 border border-white/10 backdrop-blur-md hover:border-white/25 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-on-primary mb-5 shadow-inner">
                    <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                  </div>
                  <h4 className="font-title-md text-title-md font-semibold text-on-primary mb-2">Immutable Attestation</h4>
                  <p className="font-body-sm text-body-sm text-on-primary-container leading-relaxed">
                    Every policy evaluation writes a cryptographic state proof into an append-only ledger for enterprise compliance.
                  </p>
                </div>
                <div className="tilt-card rounded-3xl bg-surface-container-lowest/[0.04] p-6 border border-white/10 backdrop-blur-md hover:border-white/25 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-on-primary mb-5 shadow-inner">
                    <span className="material-symbols-outlined text-[20px]">enhanced_encryption</span>
                  </div>
                  <h4 className="font-title-md text-title-md font-semibold text-on-primary mb-2">Prompt-Injection Defense</h4>
                  <p className="font-body-sm text-body-sm text-on-primary-container leading-relaxed">
                    Automated scanning of all checkout DOM structures to neutralize adversarial hidden prompt injections attempting agent hijacking.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Conversion Monument */}
          <section className="w-full py-20 sm:py-28 bg-background relative overflow-hidden">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
              <div className="rounded-3xl bg-primary text-on-primary p-8 sm:p-14 lg:p-16 relative overflow-hidden shadow-2xl border border-white/10">
                <div className="pointer-events-none absolute -top-32 -left-20 w-[450px] h-[450px] bg-gradient-to-br from-white/15 to-transparent blur-3xl transform -rotate-12"></div>
                <div className="pointer-events-none absolute bottom-0 right-0 w-[400px] h-[350px] bg-secondary-fixed/5 blur-2xl"></div>
                <div className="relative z-10 flex flex-col items-center">
                  <span className="font-label-sm text-label-sm uppercase tracking-[0.2em] text-secondary-fixed-dim mb-4 font-semibold">Immediate Integration</span>
                  <h2 className="font-headline-lg text-headline-lg sm:text-[44px] sm:leading-[1.1] font-bold text-on-primary tracking-tight max-w-2xl mb-6">
                    Your agent. Your rules. Protect your capital.
                  </h2>
                  <p className="font-body-lg text-body-lg text-on-primary-container max-w-xl mb-10 leading-relaxed font-normal">
                    Plug Mandate Gateway directly into LangChain, AutoGPT, CrewAI, or proprietary procurement agents in under 15 minutes.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                    <button
                      onClick={() => setShowDemoModal(true)}
                      className="btn-ripple w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-4 pl-2 pr-6 py-2 rounded-full bg-surface-container-lowest text-primary hover:bg-surface-container-lowest/90 font-label-md text-label-md transition-all shadow-lg hover:scale-[1.02] cursor-pointer"
                      type="button"
                    >
                      <span className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[18px]">key</span>
                      </span>
                      <span className="font-semibold tracking-tight text-sm whitespace-nowrap">Provision API Keys</span>
                    </button>
                    <button
                      onClick={() => setShowSpecDrawer(true)}
                      className="btn-ripple w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-surface-container-lowest/10 hover:bg-surface-container-lowest/20 border border-white/15 text-on-primary font-label-md text-label-md transition-all cursor-pointer whitespace-nowrap"
                      type="button"
                    >
                      <span>Read Documentation</span>
                      <span className="material-symbols-outlined text-[16px]">north_east</span>
                    </button>
                  </div>
                  <div className="mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6 font-code-sm text-code-sm text-on-primary-container">
                    <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> SOC 2 Type II Certified</span>
                    <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> PCI-DSS Level 1 Merchant Vault</span>
                    <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Zero Raw PAN Storage</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Modal 1: Live Enclave Verification Simulator */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 bg-primary/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-surface-container shadow-2xl relative">
            <button
              onClick={() => setShowDemoModal(false)}
              className="absolute top-6 right-6 text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center shadow shrink-0">
                <span className="material-symbols-outlined text-[18px]">terminal</span>
              </div>
              <h3 className="font-title-md text-title-md font-bold text-on-surface">Live Enclave Verification</h3>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
              Simulating real-time incoming shopping basket from Claude Agent v3.5 against Policy #M-408:
            </p>
            <div className="p-4 rounded-xl bg-primary text-on-primary font-mono text-[12px] space-y-2 mb-6 overflow-x-auto shadow-inner border border-white/10">
              <div className="text-secondary-fixed-dim">// Staged Cart Intercept</div>
              {terminalStep >= 1 && <div>[0.001s] Ingesting cart payload: 1x Keychron Q1 Max (₹16,499)</div>}
              {terminalStep >= 2 && <div>[0.005s] Verifying merchant domain: keychron.in -&gt; OK</div>}
              {terminalStep >= 3 && <div>[0.009s] Checking cumulative monthly threshold -&gt; 24.1% burn -&gt; OK</div>}
              {terminalStep >= 4 && <div>[0.012s] Inspecting DOM injection markers -&gt; Clean</div>}
              {terminalStep >= 5 && <div className="text-emerald-400 font-semibold">[0.014s] VERDICT: INSTANT_CLEARANCE</div>}
              {terminalStep >= 6 && <div className="text-on-primary-container">[0.015s] Minting Ephemeral Virtual Card: **** **** **** 4892</div>}
            </div>
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={runSimulation}
                className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-label-md text-label-md transition-colors cursor-pointer"
                type="button"
              >
                Re-run Trace
              </button>
              <button
                onClick={() => setShowDemoModal(false)}
                className="px-5 py-2.5 rounded-full bg-primary text-on-primary font-label-md text-label-md hover:bg-primary/90 transition-all cursor-pointer shadow"
                type="button"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Raw JSON Specification Drawer */}
      {showSpecDrawer && (
        <div className="fixed inset-0 z-50 bg-primary/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-surface-container shadow-2xl relative max-h-[90vh] flex flex-col">
            <button
              onClick={() => setShowSpecDrawer(false)}
              className="absolute top-6 right-6 text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-secondary text-on-primary flex items-center justify-center shadow shrink-0">
                <span className="material-symbols-outlined text-[18px]">data_object</span>
              </div>
              <div className="min-w-0">
                <h3 className="font-title-md text-title-md font-bold text-on-surface truncate">Mandate Policy Specification: #M-408</h3>
                <p className="font-code-sm text-code-sm text-on-surface-variant truncate">Cryptographically signed schema for autonomous agents</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between py-2 px-3 rounded-lg bg-surface-container font-code-sm text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="text-on-surface font-mono">Format: SGX_POLICY_V2</span>
              </div>
              <button
                onClick={handleCopyJson}
                className="flex items-center gap-1 text-primary hover:text-secondary font-medium cursor-pointer shrink-0"
                type="button"
              >
                <span className="material-symbols-outlined text-[14px]">content_copy</span>
                <span>{copiedJson ? 'COPIED!' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className="mt-3 p-4 rounded-xl bg-primary text-secondary-fixed-dim font-mono text-[12px] leading-relaxed overflow-y-auto flex-1 max-h-[360px] border border-white/10 select-all">{`{
  "$schema": "https://mandate.gw/schemas/policy-v2.json",
  "mandate_id": "89f41b2a-7c90-413e-a89f-2114d693f18e",
  "agent_id": "claude-shopping-v3.5",
  "target_division": "Engineering Hardware",
  "invariants": {
    "max_single_tx_amount": 80000,
    "currency": "INR",
    "monthly_allocation": 200000,
    "current_monthly_burn": 48200,
    "require_human_biometric_above": 50000,
    "merchant_whitelist": [
      "apple.com",
      "dell.com/in",
      "keychron.in",
      "lenovo.com/in"
    ],
    "category_codes": ["5045", "5732", "5734"],
    "prompt_injection_guard": "STRICT_AST_PARSER",
    "ephemeral_card_ttl_sec": 180
  },
  "attestation": {
    "hardware_enclave": "Intel SGX Enclave v4.2",
    "root_signature": "0x48a1f729b7c8942a03cf81b9e"
  }
}`}</pre>
            <div className="mt-5 pt-4 border-t border-surface-container flex items-center justify-between gap-3">
              <div className="text-xs text-on-surface-variant flex items-center gap-1.5 min-w-0">
                <span className="material-symbols-outlined text-emerald-600 text-[16px] shrink-0">lock</span>
                <span className="truncate">Zero knowledge attestation verified</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowSpecDrawer(false)}
                  className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-label-md text-label-md cursor-pointer"
                  type="button"
                >
                  Done
                </button>
                <Link
                  to="/mandates"
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container cursor-pointer transition-colors"
                >
                  Apply To Agent
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full bg-surface-container-low shadow-[0_-1px_0_rgba(0,0,0,0.02)] mt-space-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 sm:gap-12 pb-12">
            <div className="md:col-span-5 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded bg-primary-container text-on-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[16px]">shield</span>
                </div>
                <span className="font-title-md text-title-md font-semibold text-primary tracking-tight">Mandate Gateway</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-sm leading-relaxed">
                Institutional private banking protocols synthesized for sovereign machine intelligence and high-assurance automated purchasing mandates.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-2 h-2 rounded-full bg-secondary shrink-0"></span>
                <span className="font-code-sm text-code-sm text-on-surface-variant tracking-wide font-mono">Runtime Cluster: Alpha-09 // Isolated</span>
              </div>
            </div>
            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div className="flex flex-col gap-3">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Platform</span>
                <nav className="flex flex-col gap-2.5">
                  <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" to="/dashboard">Mandate Dashboard</Link>
                  <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" to="/login">Sign In / Access</Link>
                  <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#product-preview">Product Preview</a>
                  <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#how-it-works">How It Works</a>
                  <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#policy-decisions">Policy Engine</a>
                </nav>
              </div>
              <div className="flex flex-col gap-3">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Governance</span>
                <nav className="flex flex-col gap-2.5">
                  <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#security">Security Architecture</a>
                  <button onClick={() => setShowSpecDrawer(true)} className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer text-left">Documentation</button>
                  <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" to="/dashboard">Privacy Policy</Link>
                </nav>
              </div>
              <div className="flex flex-col gap-3">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Legal</span>
                <nav className="flex flex-col gap-2.5">
                  <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" to="/dashboard">Terms of Service</Link>
                  <button onClick={() => setShowDemoModal(true)} className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer text-left">Attestation Logs</button>
                </nav>
              </div>
            </div>
          </div>
          <div className="pt-8 mt-4 border-t border-surface-container flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-body-sm text-body-sm text-on-surface-variant">© 2025 Mandate Gateway Systems AG. All rights reserved.</p>
            <div className="flex items-center gap-3 bg-surface-container px-3 py-1.5 rounded-lg">
              <span className="material-symbols-outlined text-secondary text-[16px] shrink-0">info</span>
              <p className="font-code-sm text-code-sm text-on-surface-variant">Notice: Sandbox preview environment for autonomous agent verification protocols.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
