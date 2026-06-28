'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useTranslations } from 'next-intl';
import { Share2, TrendingUp, Users, Copy } from 'lucide-react';

export default function AffiliatesDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const t = useTranslations('Dashboard');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = Cookies.get('token');
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}` + '/affiliates/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (err: any) {
        // Handle error or not joined
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const joinAffiliateProgram = async () => {
    try {
      const token = Cookies.get('token');
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}` + '/affiliates/join', {}, {
         headers: { Authorization: `Bearer ${token}` }
      });
      window.location.reload();
    } catch(e) {
      alert('Error joining program');
    }
  };

  const copyLink = () => {
    if (stats?.affiliate?.code) {
      navigator.clipboard.writeText(`https://goldtradingbot.com/?refcode=${stats.affiliate.code}`);
      alert('Referral link copied!');
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">{t('affiliates')}</h1>
      
      {!stats?.affiliate ? (
        <div className="bg-[#0F1115] border border-[#D4AF37]/30 p-8 rounded-2xl text-center">
          <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{t('become_partner')}</h2>
          <button 
            onClick={joinAffiliateProgram}
            className="px-6 py-3 bg-[#D4AF37] text-black font-bold rounded-lg hover:bg-[#AA8B2C] transition-colors mt-4"
          >
            {t('become_partner')}
          </button>
        </div>
      ) : (
        <>
          <div className="bg-[#0F1115] border border-white/10 p-6 rounded-2xl flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-wider text-[#D4AF37]">PARTNER</h2>
              <p className="opacity-80">You earn {stats.affiliate.commissionRate * 100}% on all sales</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80 mb-1">{t('your_affiliate_link')}</p>
              <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-lg border border-white/10">
                <span className="font-mono text-[#D4AF37]">goldtradingbot.com/?refcode={stats.affiliate.code}</span>
                <button onClick={copyLink} className="hover:text-white transition-colors"><Copy size={16}/></button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[#0F1115] border border-white/10 p-6 rounded-2xl flex items-center gap-4">
              <div className="p-4 bg-[#D4AF37]/10 text-[#D4AF37] rounded-xl"><Users /></div>
              <div>
                <h3 className="text-gray-400 font-medium">Link Clicks</h3>
                <div className="text-2xl font-bold text-white">{stats.affiliate.clicks}</div>
              </div>
            </div>
            <div className="bg-[#0F1115] border border-white/10 p-6 rounded-2xl flex items-center gap-4">
              <div className="p-4 bg-green-500/10 text-green-500 rounded-xl"><TrendingUp /></div>
              <div>
                <h3 className="text-gray-400 font-medium">{t('sales')}</h3>
                <div className="text-2xl font-bold text-white">{stats.sales?.length || 0}</div>
              </div>
            </div>
            <div className="bg-[#0F1115] border border-white/10 p-6 rounded-2xl flex items-center gap-4">
              <div className="p-4 bg-blue-500/10 text-blue-500 rounded-xl"><Share2 /></div>
              <div>
                <h3 className="text-gray-400 font-medium">{t('commission')}</h3>
                <div className="text-2xl font-bold text-[#D4AF37]">${(stats.totalEarned || 0).toFixed(2)}</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
