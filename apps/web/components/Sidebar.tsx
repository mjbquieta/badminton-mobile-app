'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/activity', label: 'Activity', icon: '🏸' },
  { href: '/players', label: 'Players', icon: '👥' },
  { href: '/courts', label: 'Courts', icon: '🏟️' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 bg-secondary border-r border-dark-100 min-h-screen p-4 flex-col shrink-0">
        <div className="mb-8 px-2">
          <h1 className="text-xl font-bold text-accent">Smash Potato</h1>
          <p className="text-xs text-light-300 mt-1">Court Manager</p>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
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
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-secondary border-t border-dark-100 z-40">
        <div className="flex justify-around pb-[env(safe-area-inset-bottom)]">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 py-2 px-3 min-w-0 flex-1 transition-colors ${
                  isActive ? 'text-accent' : 'text-light-300'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-[10px] font-medium truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
