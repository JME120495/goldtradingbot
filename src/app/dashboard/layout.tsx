'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { Home, Key, Download, CreditCard, LogOut, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations('Dashboard');

  useEffect(() => {
    setMounted(true);
    const token = Cookies.get('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  if (!mounted) return null;

  const handleLogout = () => {
    Cookies.remove('token');
    router.push('/login');
  };

  const navItems = [
    { name: t('overview'), href: '/dashboard', icon: Home },
    { name: t('accounts'), href: '/dashboard/accounts', icon: Key },
    { name: t('downloads'), href: '/dashboard/downloads', icon: Download },
    { name: t('billing'), href: '/dashboard/billing', icon: CreditCard },
    { name: t('affiliates'), href: '/dashboard/affiliates', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#0F1115] flex flex-col hidden md:flex">
        <div className="h-20 flex items-center px-8 border-b border-white/5">
          <span className="text-xl font-bold tracking-wider text-[#D4AF37]">GOLD SCALPER</span>
        </div>
        <nav className="flex-1 px-4 py-8 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen relative">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#D4AF37]/5 to-transparent pointer-events-none" />
        
        {/* Mobile Header */}
        <header className="md:hidden h-20 border-b border-white/5 bg-[#0F1115] flex items-center justify-between px-4">
          <span className="font-bold text-[#D4AF37]">GOLD SCALPER</span>
          <button onClick={handleLogout} className="text-sm text-gray-400">Logout</button>
        </header>

        <div className="flex-1 p-4 md:p-8 overflow-auto z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
