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
    <aside className="w-60 bg-secondary border-r border-dark-100 min-h-screen p-4 flex flex-col">
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
  );
}
