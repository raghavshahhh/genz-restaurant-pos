'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: '🏠' },
    { href: '/tables', label: 'Tables', icon: '🪑' },
    { href: '/menu', label: 'Menu', icon: '🍽️' },
    { href: '/orders', label: 'Orders', icon: '📋' },
    { href: '/kot', label: 'KOT', icon: '👨‍🍳' },
    { href: '/bills', label: 'Bills', icon: '🧾' },
    { href: '/reports', label: 'Reports', icon: '📊' },
    { href: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <aside className="w-64 bg-gradient-to-b from-violet-600 via-purple-600 to-pink-500 text-white flex flex-col">
      <div className="p-4 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <Image src="/logo.svg" alt="Gen-Z Restaurant" width={180} height={50} priority />
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-white/20 text-white shadow-lg shadow-black/10 translate-x-1'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {item.label}
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/10">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
          <p className="text-xs text-white/70">Powered by</p>
          <p className="text-sm font-bold text-white">RagsPro™</p>
        </div>
      </div>
    </aside>
  );
}

Sidebar.displayName = 'Sidebar';