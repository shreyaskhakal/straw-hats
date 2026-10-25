import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import mandateLogoImg from '../assets/mandate-logo.png';

export default function MerchantVerifyPage() {
  const { token: routeToken } = useParams();
  const [activeToken, setActiveToken] = useState(
    routeToken || '0x9A48F9E03B812C44D87102E9B310FCA1'
  );
  const [inputToken, setInputToken] = useState(
    routeToken || '0x9A48F9E03B812C44D87102E9B310FCA1'
  );
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (activeToken) {
      verifyToken(activeToken);
    }
  }, [activeToken]);

  const verifyToken = async (tok) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.verifyMerchantToken(tok);
      setData(res);
    } catch (err) {
      setError(err.message || 'Token verification failed or revoked');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputToken.trim()) {
      setActiveToken(inputToken.trim());
    }
  };

  return (
    <div className="min-h-screen bg-background font-body-md text-body-md text-on-surface antialiased flex flex-col justify-between p-6 md:p-12">
      {/* Top Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-outline-variant/30">
        <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <img
            src={mandateLogoImg}
            alt="Mandate Gateway"
            className="h-8 w-auto object-contain flex-shrink-0"
          />
          <div className="flex flex-col">
            <span className="font-title-md text-title-md text-primary tracking-tight leading-none">
              MANDATE GATEWAY
            </span>
            <span className="font-label-sm text-label-sm text-secondary tracking-widest uppercase mt-0.5">
              Public Merchant Verification Network
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-800 border border-amber-500/20 font-code-sm text-[11px] flex items-center gap-1.5" title="Demo sandbox mode for frontend preview">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Simulated Verification Demo
          </span>
          <Link
            to="/dashboard"
            className="text-on-surface-variant hover:text-on-surface text-body-sm font-medium pl-3 hidden sm:inline-block"
          >
            Enter Dashboard →
          </Link>
        </div>
      </header>

      {/* Main Verification Card */}
      <main className="max-w-2xl mx-auto w-full py-10 space-y-6">
        {/* Token Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-3 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              type="text"
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
              placeholder="Paste Agent Token Prefix or Full Hash..."
              className="input-standard pl-10 font-mono text-code-sm"
            />
          </div>
          <button
            type="submit"
            className="btn-primary flex items-center gap-1.5 flex-shrink-0 shadow-sm"
          >
            <span>Verify</span>
          </button>
        </form>

        {loading ? (
          <div className="p-12 text-center text-secondary text-body-md bg-surface-container-low rounded-2xl border border-outline-variant/30 space-y-3">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div>Verifying cryptographic agent passport via Intel SGX Enclave...</div>
          </div>
        ) : error ? (
          <div className="bg-surface-container-lowest rounded-2xl border border-error/40 p-8 shadow-sm text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-error-container/40 text-error flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[28px]">gpp_bad</span>
            </div>
            <div className="space-y-1">
              <h2 className="font-title-md text-[20px] font-semibold text-error">
                Agent Token Revoked or Invalid
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md mx-auto">
                {error}. This agent token has been revoked, expired, or does not exist in the Gateway registry. You should decline autonomous checkout without physical card credentials.
              </p>
            </div>
            <div className="pt-2">
              <span className="font-code-sm text-code-sm text-error bg-error-container/30 px-3 py-1 rounded font-mono">
                FLAG_CHECKOUT_REJECTED • CODE: 403_FORBIDDEN
              </span>
            </div>
          </div>
        ) : data ? (
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary-fixed/50 text-on-secondary-fixed flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[22px]">verified</span>
                </div>
                <div>
                  <h2 className="font-title-md text-[18px] font-semibold text-primary">
                    Trusted Autonomous Agent (Simulated)
                  </h2>
                  <span className="font-code-sm text-code-sm text-secondary font-semibold font-mono">
                    {data.status} • Simulated Signature Verified (Sandbox Demo)
                  </span>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-secondary text-on-secondary text-label-sm font-semibold tracking-wider uppercase">
                SAFE TO CLEAR (DEMO)
              </span>
            </div>

            <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/30 text-body-md text-on-surface font-medium">
              Merchant Recommendation: {data.merchantAdvice}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-body-sm font-code-sm">
              <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/30">
                <span className="text-secondary block text-label-sm uppercase tracking-wider">
                  Agent Identity
                </span>
                <span className="font-semibold text-primary">{data.agentName}</span>
              </div>
              <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/30">
                <span className="text-secondary block text-label-sm uppercase tracking-wider">
                  Authorizing Human
                </span>
                <span className="font-semibold text-primary">{data.authorizedBy}</span>
              </div>
              <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/30">
                <span className="text-secondary block text-label-sm uppercase tracking-wider">
                  Enclave Attestation
                </span>
                <span className="font-semibold text-primary">{data.enclaveAttestation}</span>
              </div>
              <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/30">
                <span className="text-secondary block text-label-sm uppercase tracking-wider">
                  Merchant Track Record
                </span>
                <span className="font-semibold text-on-surface">
                  {data.ordersCompleted} Orders • {data.disputes} Disputes
                </span>
              </div>
            </div>

            <div className="pt-2 text-label-sm text-secondary text-center font-code-sm border-t border-outline-variant/30">
              Simulated verification preview via Mandate Gateway Demo Enclave • Token Hash #{activeToken?.substring(0, 16)}...
            </div>
          </div>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="text-center font-code-sm text-code-sm text-secondary py-4 border-t border-outline-variant/30 max-w-4xl mx-auto w-full">
        Mandate Gateway • Autonomous Commerce Trust Layer & Enclave Verifier (Frontend Preview Demo)
      </footer>
    </div>
  );
}
