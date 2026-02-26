'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ConfirmDialog } from './ConfirmDialog';
import { AiOutlineHome, AiOutlineTeam } from 'react-icons/ai';
import { MdOutlineSportsTennis } from 'react-icons/md';
import { FiBarChart2, FiCalendar, FiClock, FiLogOut, FiMoon, FiMoreHorizontal, FiSettings, FiSun, FiTarget, FiWifiOff } from 'react-icons/fi';
import { RiDraftLine } from 'react-icons/ri';
import type { IconType } from 'react-icons';
import { useOnlineStatus } from '@/hooks/useFirebaseSync';
import { useTheme } from '@/contexts/ThemeContext';

const navItems: { href: string; label: string; icon: IconType; beta?: boolean }[] = [
  { href: '/home', label: 'Dashboard', icon: AiOutlineHome },
  { href: '/players', label: 'Players', icon: AiOutlineTeam },
  { href: '/courts', label: 'Courts', icon: MdOutlineSportsTennis },
  { href: '/draft', label: 'Draft', icon: RiDraftLine },
  { href: '/history', label: 'History', icon: FiClock },
  { href: '/analytics', label: 'Analytics', icon: FiBarChart2, beta: true },
  { href: '/tournament', label: 'Tournament', icon: FiTarget, beta: true },
  { href: '/schedule', label: 'Schedule', icon: FiCalendar, beta: true },
  { href: '/settings', label: 'Settings', icon: FiSettings },
];

const MOBILE_NAV_LIMIT = 5;
const mobileNavItems = navItems.slice(0, MOBILE_NAV_LIMIT);
const mobileOverflowItems = navItems.slice(MOBILE_NAV_LIMIT);

export function Sidebar() {
  const pathname = usePathname();
  const { logout, profile, user } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const isInOverflow = mobileOverflowItems.some((item) => pathname === item.href);
  const isOnline = useOnlineStatus();
  const { resolvedTheme, toggleTheme } = useTheme();

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
      <aside className="hidden md:flex w-60 bg-secondary border-r border-dark-100 h-screen sticky top-0 p-4 flex-col shrink-0">
        <div className="mb-8 px-2">
          <h1 className="text-xl font-bold text-accent">
            {profile?.clubName ?? 'My Club'}
          </h1>
          <p className="text-xs text-light-300 mt-1 truncate">{user?.email ?? 'Court Manager'}</p>
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
                {item.beta && (
                  <span className="ml-auto text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-accent/15 text-accent">
                    Beta
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-light-300 hover:bg-dark-200 hover:text-light-100 transition-colors"
        >
          {resolvedTheme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
          {resolvedTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>

        {!isOnline && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-warning/10 border border-warning/20 text-warning text-xs font-medium mb-2">
            <FiWifiOff size={14} />
            Offline
          </div>
        )}

        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-light-300 hover:bg-dark-200 hover:text-danger transition-colors mt-2"
        >
          <FiLogOut size={18} />
          Sign Out
        </button>
      </aside>

      {/* Mobile Offline Banner */}
      {!isOnline && (
        <div className="md:hidden fixed top-0 left-0 right-0 bg-warning/10 border-b border-warning/20 text-warning text-xs font-medium text-center py-1.5 z-50 flex items-center justify-center gap-1.5">
          <FiWifiOff size={12} />
          You are offline
        </div>
      )}

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-secondary border-t border-dark-100 z-40">
        <div className="flex justify-around pb-[env(safe-area-inset-bottom)]">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 py-2 px-3 min-w-0 flex-1 transition-colors ${
                  isActive ? 'text-accent' : 'text-light-300'
                }`}
                onClick={() => setShowMoreMenu(false)}
              >
                <div className="relative">
                  <Icon size={20} />
                  {item.beta && (
                    <span className="absolute -top-1.5 -right-3 text-[7px] font-bold uppercase text-accent">
                      B
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium truncate">{item.label}</span>
              </Link>
            );
          })}
          <div className="relative flex flex-col items-center min-w-0 flex-1">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className={`flex flex-col items-center gap-0.5 py-2 px-3 transition-colors ${
                isInOverflow || showMoreMenu ? 'text-accent' : 'text-light-300'
              }`}
            >
              <FiMoreHorizontal size={20} />
              <span className="text-[10px] font-medium truncate">More</span>
            </button>
            {showMoreMenu && (
              <div className="absolute bottom-full mb-2 right-0 bg-secondary border border-dark-100 rounded-xl shadow-elevated py-1 min-w-[160px]">
                {mobileOverflowItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                        isActive ? 'text-accent bg-accent/10' : 'text-light-200 hover:bg-dark-200'
                      }`}
                      onClick={() => setShowMoreMenu(false)}
                    >
                      <Icon size={16} />
                      {item.label}
                      {item.beta && (
                        <span className="ml-auto text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-accent/15 text-accent">
                          Beta
                        </span>
                      )}
                    </Link>
                  );
                })}
                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    setShowLogoutConfirm(true);
                  }}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-light-300 hover:text-danger hover:bg-dark-200 w-full transition-colors"
                >
                  <FiLogOut size={16} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
