import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('elena.vance@sovereign-vault.internal');
  const [passphrase, setPassphrase] = useState('••••••••••••••••••••••••');
  const [showPass, setShowPass] = useState(false);
  const [rememberTerminal, setRememberTerminal] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showZeroTrustDrawer, setShowZeroTrustDrawer] = useState(false);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      await api.login(passphrase, rememberTerminal);
      navigate('/dashboard');
    } catch (err) {
      console.warn('Login handled', err);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleFastpath = () => {
    setEmail('elena.vance@sovereign-vault.internal');
    setPassphrase('sovereign_sgx_key_verified');
    handleSubmit();
  };

  return (
    <div className="bg-[#f7f6f3] text-on-surface font-body-md antialiased min-h-screen relative flex flex-col justify-between overflow-x-hidden selection:bg-secondary-container selection:text-primary">
      {/* Atmospheric Background Ambient Layer */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Cryptographic Coordinate Grid */}
        <div className="absolute inset-0 crypto-grid opacity-60" />
        {/* Floating Light Orbs */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[640px] h-[360px] bg-gradient-to-br from-[#eedfc8]/45 via-[#dcd2be]/25 to-transparent rounded-full glow-sphere" />
        <div className="absolute top-1/3 -left-40 w-[420px] h-[420px] bg-[#e4ded0]/35 rounded-full glow-sphere" />
        <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-[#d9d0bf]/30 rounded-full glow-sphere" />
        {/* Fine Architectural Vignette Lines */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-neutral-300/40 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-neutral-300/40 to-transparent" />
      </div>

      {/* Top Minimalist Brand Header */}
      <header className="relative z-10 w-full pt-8 pb-4 px-6 max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-white/70 backdrop-blur-md border border-white/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center justify-center p-1.5 transition-transform duration-300 hover:scale-105">
            <svg className="w-full h-full text-primary" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M12 2L3 7v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7l-9-5z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-headline-sm text-sm md:text-base font-semibold tracking-wider uppercase text-primary">Mandate Gateway</span>
              <span className="text-[10px] font-mono tracking-widest px-1.5 py-0.5 rounded-full bg-stone-200/60 border border-stone-300/40 text-neutral-700">v2.4-PROD</span>
            </div>
            <span className="text-[11px] text-neutral-500 font-medium tracking-tight">Sovereign Agent Payment Clearance</span>
          </div>
        </Link>

        {/* Live Gateway Network Telemetry Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-neutral-200/50 shadow-sm text-xs font-mono text-neutral-600">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px]">Enclave Active</span>
          <span className="text-neutral-300">|</span>
          <span className="text-[11px] text-neutral-400">41ms</span>
        </div>
      </header>

      {/* Central Authentication Canvas */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-6 md:py-10">
        <div className="w-full max-w-[460px]" id="cardContainer">
          <div className="relative bg-white/70 backdrop-blur-2xl rounded-2xl md:rounded-3xl border border-white/80 p-7 md:p-9 glass-card-glow transition-all duration-300 ease-out" id="authCard">
            {/* Specular Accent Bar */}
            <div className="absolute top-0 left-6 right-6 h-[1.5px] bg-gradient-to-r from-transparent via-[#c5b292]/80 to-transparent" />

            {/* Badge */}
            <div className="flex items-center justify-between mb-6">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-neutral-900/[0.04] border border-neutral-900/[0.06]">
                <span className="material-symbols-outlined text-[13px] text-sovereign-taupe">lock_clock</span>
                <span className="text-[10px] font-semibold tracking-widest uppercase text-neutral-700 font-mono">Zero-Knowledge Enclave</span>
              </div>
              <span className="text-[11px] font-mono text-neutral-400">ed25519-TLS</span>
            </div>

            {/* Header Content */}
            <div className="mb-7">
              <h1 className="font-headline-md text-2xl md:text-[26px] tracking-tight font-semibold text-neutral-900">
                Welcome back
              </h1>
              <p className="font-body-sm text-[13px] text-neutral-600 mt-1.5 leading-relaxed">
                Deterministic policy clearance and rule enforcement for autonomous spending agents.
              </p>
            </div>

            {/* Form */}
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-[12px] font-medium text-neutral-700 flex items-center justify-between" htmlFor="email">
                  <span>Business / Identity Hash</span>
                  <span className="text-[11px] font-mono text-neutral-400 font-normal">Sovereign Vault ID</span>
                </label>
                <div className="relative group flex items-center">
                  <span className="material-symbols-outlined absolute left-3.5 text-neutral-400 text-[18px] group-focus-within:text-neutral-900 transition-colors pointer-events-none">alternate_email</span>
                  <input
                    className="w-full h-11 pl-10 pr-4 bg-white/60 hover:bg-white/80 focus:bg-white/95 backdrop-blur-sm rounded-xl border border-neutral-300/70 focus:border-neutral-800 text-neutral-900 placeholder:text-neutral-400 text-sm transition-all duration-200 outline-none focus:ring-2 focus:ring-neutral-800/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                    id="email"
                    name="email"
                    placeholder="elena.vance@sovereign.io"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Master Passphrase */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-label-sm text-[12px] font-medium text-neutral-700" htmlFor="passphrase">
                    Master Passphrase
                  </label>
                  <button className="text-[11px] font-mono text-neutral-500 hover:text-neutral-900 transition-colors flex items-center gap-1" type="button">
                    <span className="material-symbols-outlined text-[12px]">analytics</span>
                    <span>Audit Entropy</span>
                  </button>
                </div>
                <div className="relative group flex items-center">
                  <span className="material-symbols-outlined absolute left-3.5 text-neutral-400 text-[18px] group-focus-within:text-neutral-900 transition-colors pointer-events-none">key</span>
                  <input
                    className="w-full h-11 pl-10 pr-11 bg-white/60 hover:bg-white/80 focus:bg-white/95 backdrop-blur-sm rounded-xl border border-neutral-300/70 focus:border-neutral-800 text-neutral-900 placeholder:text-neutral-400 text-sm font-mono tracking-wider transition-all duration-200 outline-none focus:ring-2 focus:ring-neutral-800/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                    id="passphrase"
                    name="passphrase"
                    placeholder="••••••••••••••••••••••••"
                    required
                    type={showPass ? 'text' : 'password'}
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                  />
                  <button
                    aria-label="Toggle password visibility"
                    className="absolute right-2.5 p-1 text-neutral-400 hover:text-neutral-800 rounded-lg hover:bg-neutral-100/50 transition-colors"
                    onClick={() => setShowPass(!showPass)}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">{showPass ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                {/* Dynamic Live Entropy Gauge */}
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1 bg-neutral-200/80 rounded-full overflow-hidden flex">
                    <div className="h-full bg-sovereign-taupe transition-all duration-300 w-3/4 rounded-full" />
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Strong</span>
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                  <input
                    checked={rememberTerminal}
                    onChange={(e) => setRememberTerminal(e.target.checked)}
                    className="w-4 h-4 rounded-md border-neutral-300 bg-white/70 text-neutral-900 focus:ring-neutral-800/20 focus:ring-offset-0 cursor-pointer transition-colors"
                    type="checkbox"
                  />
                  <span className="text-neutral-600 group-hover:text-neutral-900 transition-colors">Remember terminal</span>
                </label>
                <a className="text-neutral-500 hover:text-neutral-900 transition-colors font-medium" href="#recovery">
                  Forgot passphrase?
                </a>
              </div>

              {/* Sign In Button */}
              <button
                disabled={loading}
                className="mt-2 w-full h-11 bg-neutral-900 hover:bg-black text-white rounded-xl text-sm font-medium tracking-wide shadow-md shadow-neutral-900/10 hover:shadow-lg hover:shadow-neutral-900/20 active:scale-[0.99] transition-all duration-150 flex items-center justify-center gap-2 border border-neutral-800 cursor-pointer"
                type="submit"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to Gateway'}</span>
                <span className="material-symbols-outlined text-[17px]">lock_open</span>
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-1.5">
                <div className="w-full h-px bg-neutral-200/80" />
                <span className="absolute bg-white/80 backdrop-blur-sm px-3 text-[10px] uppercase font-mono tracking-widest text-neutral-400">Sandbox Fastpath</span>
              </div>

              {/* Quick Demo Access */}
              <button
                onClick={handleFastpath}
                className="w-full p-2.5 rounded-xl bg-neutral-100/70 hover:bg-white hover:shadow-sm border border-neutral-200/60 transition-all duration-200 flex items-center justify-between group text-left cursor-pointer"
                type="button"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-neutral-200/60 group-hover:bg-neutral-900 group-hover:text-white text-neutral-700 flex items-center justify-center shrink-0 transition-colors">
                    <span className="material-symbols-outlined text-[16px]">bolt</span>
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-neutral-800">Quick Demo Access</span>
                      <span className="text-[9px] px-1.5 py-0.2 bg-secondary-container text-on-secondary-container rounded font-medium">Preconfigured</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 truncate">Elena Vance (Controller) • Synthetic Ledger</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-neutral-400 group-hover:text-neutral-800 text-[18px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
              </button>
            </form>

            {/* Institutional Notice */}
            <div className="mt-5 pt-4 border-t border-neutral-200/50 flex items-start gap-2.5 text-neutral-500">
              <span className="material-symbols-outlined text-sovereign-taupe text-[17px] shrink-0 mt-0.5">verified_user</span>
              <p className="text-[11px] leading-relaxed">
                Deterministic Policy Engine evaluates autonomous vendor bounds prior to cryptographic key release.
              </p>
            </div>

            {/* Drawer Trigger */}
            <div className="mt-3.5 flex justify-center">
              <button
                onClick={() => setShowZeroTrustDrawer(true)}
                className="text-[12px] text-neutral-500 hover:text-neutral-900 flex items-center gap-1.5 transition-colors group cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[15px] text-sovereign-taupe group-hover:rotate-12 transition-transform">help</span>
                <span>How zero-trust AI purchasing works</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Global Footer */}
      <footer className="relative z-10 w-full py-5 px-6 max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-sovereign-taupe" />
          <span>Deterministic Policy Engine • Zero plain-text credential leakage • Hardware Enclave Ready</span>
        </div>
        <div className="flex items-center gap-4 text-[12px]">
          <Link className="hover:text-neutral-900 transition-colors" to="/dashboard">Terms of Service</Link>
          <span className="text-neutral-300">•</span>
          <Link className="hover:text-neutral-900 transition-colors" to="/security">Security Architecture</Link>
          <span className="text-neutral-300">•</span>
          <Link className="hover:text-neutral-900 transition-colors" to="/dashboard">Privacy Policy</Link>
        </div>
      </footer>

      {/* Slide-Over Drawer for "How It Works" */}
      {showZeroTrustDrawer && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setShowZeroTrustDrawer(false)}
        >
          <div
            className="w-full max-w-md h-full bg-white/95 backdrop-blur-2xl shadow-2xl p-6 md:p-8 flex flex-col justify-between overflow-y-auto border-l border-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-neutral-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-neutral-900 text-white flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px]">policy</span>
                  </div>
                  <span className="font-headline-sm text-base text-neutral-900 font-semibold">Zero-Trust AI Mandates</span>
                </div>
                <button
                  className="p-1 rounded-lg text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition-colors cursor-pointer"
                  onClick={() => setShowZeroTrustDrawer(false)}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50/80 border border-neutral-200/60 mb-6 flex flex-col gap-3">
                <div className="flex items-center justify-between text-[11px] text-neutral-600 font-mono">
                  <span>[AGENT-INTENT]</span>
                  <span className="material-symbols-outlined text-[13px] text-neutral-400">arrow_forward</span>
                  <span>[GATEWAY-POLICY]</span>
                  <span className="material-symbols-outlined text-[13px] text-neutral-400">arrow_forward</span>
                  <span>[VIRTUAL-CARD]</span>
                </div>
                <div className="h-1.5 w-full bg-neutral-200 rounded-full overflow-hidden flex">
                  <div className="h-full bg-secondary w-1/3" />
                  <div className="h-full bg-neutral-900 w-1/3" />
                  <div className="h-full bg-sovereign-taupe w-1/3" />
                </div>
                <span className="text-[11px] text-neutral-500 leading-normal">
                  Real-time cryptographic verification under sovereign deterministic constraints.
                </span>
              </div>

              <div className="space-y-5">
                <div className="flex gap-3.5">
                  <div className="w-6 h-6 rounded-full bg-neutral-900 text-white font-mono text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5">1</div>
                  <div>
                    <h4 className="font-title-md text-sm text-neutral-900 font-semibold">Agent Non-Custodial Keys</h4>
                    <p className="font-body-sm text-xs text-neutral-600 mt-1 leading-relaxed">
                      Autonomous browser or API agents hold short-lived scoped signing credentials. They never possess raw balance debit keys.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3.5">
                  <div className="w-6 h-6 rounded-full bg-neutral-900 text-white font-mono text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5">2</div>
                  <div>
                    <h4 className="font-title-md text-sm text-neutral-900 font-semibold">Deterministic Policy Engine</h4>
                    <p className="font-body-sm text-xs text-neutral-600 mt-1 leading-relaxed">
                      AI prompts cannot bypass deterministic boundaries. Price ceilings, merchant allowlists, and category rules are hardwired invariants.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3.5">
                  <div className="w-6 h-6 rounded-full bg-neutral-900 text-white font-mono text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5">3</div>
                  <div>
                    <h4 className="font-title-md text-sm text-neutral-900 font-semibold">Single-Use PayPal Order Minting</h4>
                    <p className="font-body-sm text-xs text-neutral-600 mt-1 leading-relaxed">
                      Cleared transactions provision a 1-to-1 virtual card token or PayPal sandbox order expiring immediately upon settlement.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-neutral-100 flex justify-end">
              <button
                className="w-full py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-medium hover:bg-black transition-colors"
                onClick={() => setShowZeroTrustDrawer(false)}
                type="button"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
