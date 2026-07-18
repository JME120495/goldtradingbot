'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const t = useTranslations('Admin');

  const navItems = [
    { name: t('dashboard'), href: '/admin' },
    { name: t('affiliates'), href: '/admin/affiliates' },
    { name: t('licenses'), href: '/admin/licenses' },
    { name: t('mt5_licenses'), href: '/admin/mt5-licenses' },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      <aside className="w-64 border-r border-white/10 bg-[#0F1115] p-6 hidden md:block">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#AA8B2C] flex items-center justify-center">
            <span className="text-black font-bold">G</span>
          </div>
          <span className="font-bold text-xl tracking-tight">Admin</span>
        </div>
        
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`block px-4 py-3 rounded-xl transition-colors ${
                  isActive 
                    ? 'bg-[#D4AF37]/10 text-[#D4AF37] font-medium' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="h-20 border-b border-white/10 flex items-center px-8 justify-between bg-[#0F1115]/80 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-xl font-bold">{t('admin_panel')}</h2>
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white">
            {t('back_to_client')}
          </Link>
        </header>
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
