import React from 'react';

export default function ArbitrationModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-primary/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-150">
      <div 
        className="bg-surface border border-[#E7E7E3] max-w-xl w-full p-8 shadow-2xl relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-6 border-b border-[#E7E7E3]">
          <span className="font-label-sm text-[11px] uppercase tracking-widest text-secondary font-semibold">
            Gateway Arbitration Protocol
          </span>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-primary transition-colors p-1"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="py-6 space-y-6">
          <div>
            <span className="font-code-sm text-[10px] text-secondary uppercase tracking-widest">
              01 / Deterministic Gate
            </span>
            <h4 className="font-title-md text-[15px] text-primary font-semibold mt-0.5">
              Code Enforces; AI Can Only Say No
            </h4>
            <p className="font-body-sm text-[13px] text-on-surface-variant mt-1 leading-relaxed">
              Autonomous agents never hold card or PayPal credentials. Mandate Gateway acts as an unbypassable cryptographic ledger that halts purchases violating merchant allowlists, frequency limits, or budget ceilings.
            </p>
          </div>

          <div>
            <span className="font-code-sm text-[10px] text-secondary uppercase tracking-widest">
              02 / Verbatim Quote Verification
            </span>
            <h4 className="font-title-md text-[15px] text-primary font-semibold mt-0.5">
              Zero-Hallucination Spec Matching
            </h4>
            <p className="font-body-sm text-[13px] text-on-surface-variant mt-1 leading-relaxed">
              Every must-have specification matched by the AI must cite an exact verbatim quote from the seller listing text. Code validates the quote exists in the HTML; if not found, the spec defaults to UNKNOWN.
            </p>
          </div>

          <div>
            <span className="font-code-sm text-[10px] text-secondary uppercase tracking-widest">
              03 / Human Sign-Off (HITL)
            </span>
            <h4 className="font-title-md text-[15px] text-primary font-semibold mt-0.5">
              Single-Use PayPal Sandbox Orders
            </h4>
            <p className="font-body-sm text-[13px] text-on-surface-variant mt-1 leading-relaxed">
              Requests exceeding auto-approve thresholds stay frozen until released with one touch. When approved, Gateway creates a single-use PayPal order for the exact amount.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-[#E7E7E3] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-[12px] bg-primary text-white font-medium hover:bg-neutral-800 transition-colors"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
}
