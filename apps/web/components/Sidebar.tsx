'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ConfirmDialog } from './ConfirmDialog';
import { AiOutlineHome, AiOutlineTeam } from 'react-icons/ai';
import { MdOutlineSportsTennis } from 'react-icons/md';
import { FiLogOut, FiMessageSquare } from 'react-icons/fi';
import { RiDraftLine } from 'react-icons/ri';
import type { IconType } from 'react-icons';

const allNavItems: { href: string; label: string; icon: IconType }[] = [
  { href: '/home', label: 'Dashboard', icon: AiOutlineHome },
  { href: '/players', label: 'Players', icon: AiOutlineTeam },
  { href: '/courts', label: 'Courts', icon: MdOutlineSportsTennis },
  { href: '/draft', label: 'Draft', icon: RiDraftLine },
  { href: '/feedback', label: 'Feedback', icon: FiMessageSquare },
];

const hiddenMenus = new Set(
  (process.env.NEXT_PUBLIC_HIDDEN_MENUS ?? '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean),
);

const navItems = allNavItems.filter((item) => !hiddenMenus.has(item.label.toLowerCase()));

export function Sidebar() {
  const pathname = usePathname();
  const { logout, profile } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <>
      <ConfirmDialog
        open={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={logout}
        title="Sign Out"
        message="Are you sure you want to sign out?"
        confirmLabel="Sign Out"
        danger
      />
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 bg-secondary border-r border-dark-100 min-h-screen p-4 flex-col shrink-0">
        <div className="mb-8 px-2">
          <h1 className="text-xl font-bold text-accent">
            {profile?.clubName ?? 'My Club'}
          </h1>
          <p className="text-xs text-light-300 mt-1">Court Manager</p>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  isActive
                    ? 'bg-accent/10 text-accent font-semibold'
                    : 'text-light-200 hover:bg-dark-200 hover:text-light-100'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-light-300 hover:bg-dark-200 hover:text-danger transition-colors mt-2"
        >
          <FiLogOut size={18} />
          Sign Out
        </button>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-secondary border-t border-dark-100 z-40">
        <div className="flex justify-around pb-[env(safe-area-inset-bottom)]">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 py-2 px-3 min-w-0 flex-1 transition-colors ${
                  isActive ? 'text-accent' : 'text-light-300'
                }`}
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium truncate">{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex flex-col items-center gap-0.5 py-2 px-3 min-w-0 flex-1 text-light-300 hover:text-danger transition-colors"
          >
            <FiLogOut size={20} />
            <span className="text-[10px] font-medium truncate">Sign Out</span>
          </button>
        </div>
      </nav>
    </>
  );
}
