import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import logoImg from '../assets/mandate-logo.png';
import avatarImg from '../assets/avatar-elena.jpg';

export default function Sidebar({ pendingCount = 2, mandateCount = 4 }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setMobileOpen((prev) => !prev);
    const handleClose = () => setMobileOpen(false);

    window.addEventListener('toggle-mobile-sidebar', handleToggle);
    window.addEventListener('close-mobile-sidebar', handleClose);

    return () => {
      window.removeEventListener('toggle-mobile-sidebar', handleToggle);
      window.removeEventListener('close-mobile-sidebar', handleClose);
    };
  }, []);

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await api.logout();
    } catch (err) {
      console.warn('Logout error', err);
    }
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Overview Dashboard', icon: 'grid_view' },
    { to: '/mandates', label: 'Mandates Builder', icon: 'verified_user', badge: mandateCount },
    { to: '/agent', label: 'Autonomous Shopping Agent', icon: 'smart_toy' },
    { to: '/requests', label: 'Purchase Requests', icon: 'shopping_bag', hasDot: pendingCount > 0 },
    { to: '/payment-methods', label: 'Payment Methods', icon: 'credit_card' },
    { to: '/passport', label: 'Agent Passport', icon: 'badge' },
    { to: '/activity', label: 'Activity & Audit Log', icon: 'history' },
    { to: '/security', label: 'Security Center', icon: 'shield' },
    { to: '/settings', label: 'System & Profile Settings', icon: 'settings' },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between select-none">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-[#E7E7E3]/70">
          <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 min-w-0 group">
            <img
              alt="Mandate Gateway Logo"
              className="h-7 w-auto object-contain shrink-0 opacity-95 group-hover:opacity-100 transition-opacity"
              src={logoImg}
            />
            <div className="flex flex-col min-w-0">
              <span className="font-title-md text-[13px] tracking-[0.12em] uppercase text-primary font-bold truncate leading-tight">
                MANDATE GATEWAY
              </span>
              <span className="font-label-sm text-[9px] text-secondary tracking-widest uppercase">
                AI Payment Security
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-code-sm text-[11px] shrink-0">
            v2.4
          </div>
        </div>

        {/* Live Network Pill */}
        <div className="px-5 py-3">
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-surface-container-high/60 text-on-surface-variant text-[11px] font-code-sm">
            <span className="flex items-center gap-1.5 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse shrink-0"></span>
              <span className="truncate uppercase tracking-wider text-[10px]">Autonomous Clearance</span>
            </span>
            <span className="text-[10px] uppercase font-semibold bg-surface-container-lowest px-1.5 py-0.5 rounded text-on-surface shadow-sm shrink-0">
              Active
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-lg text-[13px] transition-all ${
                  isActive
                    ? 'bg-[#141514] text-white font-medium shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-normal'
                }`
              }
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="material-symbols-outlined text-[17px] shrink-0">
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                {item.badge !== undefined && (
                  <span className="font-code-sm text-[10px] px-1.5 py-0.2 rounded bg-surface-container text-on-surface-variant">
                    {item.badge}
                  </span>
                )}
                {item.hasDot && (
                  <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                )}
              </div>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User Footer */}
      <div className="p-3.5 border-t border-[#E7E7E3]/70 space-y-2.5 bg-surface-container-low/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              alt="Elena Vance"
              className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-outline-variant/30"
              src={avatarImg}
            />
            <div className="flex flex-col min-w-0">
              <span className="font-title-md text-[12px] font-semibold text-primary truncate leading-tight">
                Elena Vance
              </span>
              <span className="font-label-sm text-[10px] text-secondary truncate">
                Sovereign Account
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-surface-container transition-colors shrink-0"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-surface border-r border-[#E7E7E3] z-50 flex-col justify-between">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] h-full bg-surface border-r border-[#E7E7E3] z-50 shadow-2xl flex flex-col justify-between animate-in slide-in-from-left duration-250">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
