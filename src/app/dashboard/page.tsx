'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function DashboardOverview() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const t = useTranslations('Dashboard');
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = Cookies.get('token');
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "/api"}`}` + '/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const activeLicenses = user?.licenses?.filter((l: any) => l.status === 'ACTIVE') || [];

  if (loading) {
    return <div className="text-white p-8">{t('loading', { fallback: 'Loading...' })}</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">{t('welcome')}, {user?.name || user?.email}</h1>
        <p className="text-gray-400">ID: {user?.id}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-6">
          <h3 className="text-gray-400 font-medium mb-4">{t('active_licenses')}</h3>
          <div className="text-4xl font-bold text-white">{activeLicenses.length}</div>
        </div>
        <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-6">
          <h3 className="text-gray-400 font-medium mb-4">{t('mt5_account')}</h3>
          <div className="text-4xl font-bold text-white">
            {new Set(activeLicenses.map((l: any) => l.tradingAccountId).filter(Boolean)).size}
          </div>
        </div>
        <div className="bg-[#0F1115] border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-center items-center">
          <Link 
            href="/dashboard/billing"
            className="px-6 py-3 bg-[#D4AF37] text-black text-sm font-bold rounded-lg hover:bg-[#AA8B2C] transition-colors"
          >
            {t('subscribe')}
          </Link>
        </div>
      </div>

      <div className="mt-12 bg-[#0F1115] border border-white/10 rounded-2xl p-8">
        <h2 className="text-xl font-bold mb-6">{t('active_licenses')}</h2>
        
        {user?.licenses?.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            {t('no_licenses')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="p-4 font-medium text-gray-400">{t('plan')}</th>
                  <th className="p-4 font-medium text-gray-400">{t('max_lot')}</th>
                  <th className="p-4 font-medium text-gray-400">License Key</th>
                  <th className="p-4 font-medium text-gray-400">{t('expires')}</th>
                  <th className="p-4 font-medium text-gray-400">{t('status')}</th>
                  <th className="p-4 font-medium text-gray-400">{t('mt5_account')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {user?.licenses?.map((license: any) => (
                  <tr key={license.id} className="hover:bg-white/5">
                    <td className="p-4">
                      <div className="font-bold text-[#D4AF37]">{license.product?.name || 'JMEgold_scalper EA'}</div>
                      <div className="text-sm text-gray-400">{license.plan?.name}</div>
                    </td>
                    <td className="p-4 font-mono">{license.plan?.lotAllowed || license.lotAllowed}</td>
                    <td className="p-4 font-mono text-sm">{license.key}</td>
                    <td className="p-4 text-sm text-gray-400">
                      {license.expiresAt ? new Date(license.expiresAt).toLocaleDateString() : 'Lifetime'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${license.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {license.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {license.tradingAccount ? license.tradingAccount.accountNumber : 
                        <Link href="/dashboard/accounts" className="text-[#D4AF37] hover:underline text-sm">{t('add_account')}</Link>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="flex justify-end mt-4">
        <Link href="/dashboard/downloads" className="text-[#D4AF37] font-semibold hover:underline">
          {t('download_ea')} →
        </Link>
      </div>
    </div>
  );
}
