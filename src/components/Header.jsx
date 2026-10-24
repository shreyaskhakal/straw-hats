import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Header({ pageTitle = 'Overview Ledger', onOpenGuide }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifications = [
    { id: 1, title: 'High-Value Escalation', desc: 'Logitech MX Master 3S exceeds ₹5k ceiling', time: '14m ago', unread: true },
    { id: 2, title: 'Merchant Blocked', desc: 'AutoProcure blocked attempting eBay Global', time: '28m ago', unread: true },
    { id: 3, title: 'PayPal Sandbox Order Created', desc: 'Single-use token issued for Amazon India', time: '1h ago', unread: false }
  ];

  const toggleMobileSidebar = () => {
    window.dispatchEvent(new CustomEvent('toggle-mobile-sidebar'));
  };

  return (
    <header className="fixed top-0 left-0 md:left-64 right-0 h-16 bg-surface/90 backdrop-blur-md border-b border-[#E7E7E3] z-40 flex items-center justify-between px-4 sm:px-6 md:px-8 select-none transition-all">
      <div className="flex items-center gap-2 sm:gap-3 text-[13px] min-w-0">
        {/* Mobile Hamburger Toggle */}
        <button
          onClick={toggleMobileSidebar}
          className="md:hidden p-1.5 -ml-1 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors shrink-0"
          aria-label="Open Navigation Menu"
        >
          <span className="material-symbols-outlined text-[20px]">menu</span>
        </button>

        <Link to="/" className="text-secondary hover:text-primary transition-colors shrink-0 hidden xs:inline">
          Gateway
        </Link>
        <span className="text-[#c4c7c7] font-light hidden xs:inline">/</span>
        <span className="text-primary font-medium tracking-tight truncate">
          {pageTitle}
        </span>
        <span className="ml-2 sm:ml-4 px-2 py-0.5 rounded-full text-[10px] font-code-sm bg-secondary-container/60 text-secondary uppercase tracking-wider hidden lg:inline-block shrink-0">
          PayPal Sandbox
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Search Input */}
        <div className="relative hidden sm:flex items-center text-on-surface-variant">
          <span className="material-symbols-outlined text-[16px] absolute left-2.5 pointer-events-none text-secondary">
            search
          </span>
          <input
            className="bg-transparent border border-[#E7E7E3] rounded-md pl-8 pr-10 py-1 text-[12px] text-primary placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary w-44 md:w-56 font-body-sm transition-all"
            placeholder="Search mandates, tokens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            type="text"
          />
          <span className="font-code-sm text-[10px] absolute right-2 text-secondary pointer-events-none">
            ⌘K
          </span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors relative"
          >
            <span className="material-symbols-outlined text-[18px]">
              notifications
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-error absolute top-2 right-2 animate-pulse"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-surface border border-[#E7E7E3] shadow-xl rounded-xl p-3 z-50 space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-[#E7E7E3] text-[12px]">
                <span className="font-semibold text-primary">System Signals</span>
                <span className="text-[10px] text-secondary font-code-sm">2 unread</span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-2 rounded-lg hover:bg-surface-container text-left transition-colors cursor-pointer">
                    <div className="flex items-center justify-between text-[11px] font-medium text-primary">
                      <span>{n.title}</span>
                      <span className="text-[9px] text-secondary">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant mt-0.5 line-clamp-1">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Guide Trigger */}
        <button
          onClick={onOpenGuide}
          className="text-[12px] text-secondary hover:text-primary tracking-wide transition-colors flex items-center gap-1 font-label-md px-2 py-1 rounded-md hover:bg-surface-container"
        >
          <span className="material-symbols-outlined text-[15px]">help</span>
          <span className="hidden xs:inline">Guide</span>
        </button>
      </div>
    </header>
  );
}
