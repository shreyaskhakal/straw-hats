import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-surface-container border border-[#E7E7E3] flex items-center justify-center text-secondary shadow-sm">
        <span className="material-symbols-outlined text-[32px]">shield_question</span>
      </div>

      <div className="space-y-2 max-w-md">
        <span className="font-code-sm text-[11px] text-secondary uppercase tracking-widest font-semibold">
          Error 404 • Invariance Boundary
        </span>
        <h1 className="font-display text-[32px] font-semibold text-primary">
          Page Not Located
        </h1>
        <p className="text-[14px] text-on-surface-variant leading-relaxed">
          The requested route is outside the authorized policy schema of Mandate Gateway.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="btn-outline"
        >
          Return to Landing
        </Link>
        <Link
          to="/dashboard"
          className="btn-primary"
        >
          Open Terminal Dashboard
        </Link>
      </div>
    </div>
  );
}
