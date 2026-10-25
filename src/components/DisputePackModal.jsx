import React from 'react';

export default function DisputePackModal({ disputePack, onClose }) {
  if (!disputePack) return null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(disputePack, null, 2));
    alert('Dispute Evidence JSON (Simulated Sandbox Artifact) copied to clipboard');
  };

  return (
    <div className="fixed inset-0 z-50 bg-primary/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-150">
      <div 
        className="bg-surface border border-[#E7E7E3] max-w-2xl w-full p-8 shadow-2xl relative max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#E7E7E3]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">verified</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-title-md text-[16px] font-semibold text-primary">
                  Proof of Intent Dispute Package
                </h3>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-800 border border-amber-500/20">
                  Simulated Demo
                </span>
              </div>
              <span className="font-code-sm text-[11px] text-secondary">
                {disputePack.packId} • PayPal Claims Ready (Sandbox Spec)
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-primary transition-colors p-1"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="py-5 overflow-y-auto space-y-5 flex-1 pr-2">
          {/* Summary Box */}
          <div className="p-4 bg-surface-container border border-[#E7E7E3] rounded space-y-2">
            <div className="grid grid-cols-2 gap-4 text-[12px]">
              <div>
                <span className="text-secondary block font-code-sm text-[10px] uppercase">Purchased Item</span>
                <span className="font-semibold text-primary">{disputePack.itemTitle}</span>
              </div>
              <div>
                <span className="text-secondary block font-code-sm text-[10px] uppercase">Merchant / Seller</span>
                <span className="font-semibold text-primary">{disputePack.merchant}</span>
              </div>
              <div>
                <span className="text-secondary block font-code-sm text-[10px] uppercase">PayPal Order ID</span>
                <span className="font-code-sm text-primary">{disputePack.transactionId}</span>
              </div>
              <div>
                <span className="text-secondary block font-code-sm text-[10px] uppercase">Capture ID</span>
                <span className="font-code-sm text-primary">{disputePack.captureId}</span>
              </div>
            </div>
          </div>

          {/* Cryptographic Agent Passport Stamp */}
          <div className="space-y-1">
            <span className="font-code-sm text-[10px] uppercase tracking-wider text-secondary">
              Authorized Agent Identity Signature
            </span>
            <div className="p-3 bg-surface-container-high/60 border border-[#E7E7E3] rounded font-code-sm text-[11px] space-y-1">
              <div>Agent: <span className="text-primary font-medium">{disputePack.agentPassportProof?.agent}</span></div>
              <div>Authorizing Human: <span className="text-primary">{disputePack.agentPassportProof?.authorizedHuman}</span></div>
              <div className="text-secondary truncate">Signature: {disputePack.agentPassportProof?.signature}</div>
            </div>
          </div>

          {/* Evidence Records */}
          <div className="space-y-2">
            <span className="font-code-sm text-[10px] uppercase tracking-wider text-secondary">
              Verbatim Pre-Purchase Quote Verification Trail
            </span>
            <div className="divide-y divide-[#E7E7E3] border border-[#E7E7E3] rounded bg-white">
              {disputePack.evidenceRecords?.map((ev, i) => (
                <div key={i} className="p-2.5 text-[12px]">
                  <span className="font-medium text-primary block">{ev.field}:</span>
                  <span className="text-secondary italic font-code-sm text-[11px]">
                    {ev.exactQuote || ev.quote}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* PayPal API Payload */}
          <div className="space-y-1">
            <span className="font-code-sm text-[10px] uppercase tracking-wider text-secondary">
              PayPal Dispute Direct Filing Payload
            </span>
            <pre className="p-3 bg-[#141514] text-neutral-300 rounded text-[11px] font-code-sm overflow-x-auto">
              {JSON.stringify(disputePack.paypalDisputeReadyJson, null, 2)}
            </pre>
          </div>
        </div>

        <div className="pt-4 border-t border-[#E7E7E3] flex items-center justify-between">
          <button
            onClick={copyToClipboard}
            className="px-4 py-2 text-[12px] border border-[#E7E7E3] hover:border-primary text-primary transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[15px]">content_copy</span>
            <span>Copy Evidence JSON</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 text-[12px] bg-primary text-white font-medium hover:bg-neutral-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
