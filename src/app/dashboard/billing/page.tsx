'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

interface Plan {
  id: string;
  name: string;
  lotAllowed: number;
  prices: string; // JSON
  productId: string;
}

import { useTranslations } from 'next-intl';

export default function BillingPage() {
  const t = useTranslations('DashboardBilling');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [duration, setDuration] = useState<'weekly' | 'monthly' | 'semiAnnual' | 'yearly'>('monthly');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "/api"}`}` + '/plans');
        setPlans(res.data);
      } catch (err) {
        console.error(err);
        setError(t('err_load'));
      }
    };
    fetchPlans();
  }, []);

  const handleSubscribe = async (plan: Plan) => {
    setLoading(true);
    setError('');
    try {
      const token = Cookies.get('token');
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "/api"}`}` + '/payments/initiate', 
        { 
          productId: plan.productId,
          planId: plan.id,
          duration: duration
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Redirect to Flutterwave checkout page
      window.location.href = res.data.paymentLink;
    } catch (err: any) {
      setError(err.response?.data?.message || t('err_pay'));
      setLoading(false);
    }
  };

  const getPrice = (pricesStr: string) => {
    try {
      const p = JSON.parse(pricesStr);
      return p[duration];
    } catch {
      return 0;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-gray-400">{t('desc')}</p>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mt-4">{error}</div>}

      <div className="flex justify-center mb-8 mt-8">
        <div className="bg-[#0F1115] border border-white/10 rounded-xl p-1 inline-flex flex-wrap justify-center gap-1">
          {[
            { id: 'weekly', label: t('weekly') },
            { id: 'monthly', label: t('monthly') },
            { id: 'semiAnnual', label: t('six_months') },
            { id: 'yearly', label: t('yearly') }
          ].map((tItem) => (
            <button
              key={tItem.id}
              onClick={() => setDuration(tItem.id as any)}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                duration === tItem.id 
                  ? 'bg-[#D4AF37] text-black shadow-md' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tItem.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const price = getPrice(plan.prices);
          const isPopular = plan.name === 'Pro' || plan.name === 'Standard';

          return (
            <div key={plan.id} className={`bg-[#0F1115] border ${isPopular ? 'border-[#D4AF37]' : 'border-white/10 hover:border-[#D4AF37]/50'} rounded-3xl p-6 relative overflow-hidden flex flex-col transition-colors`}>
              {isPopular && (
                <div className="absolute top-0 right-0 bg-[#D4AF37] text-black text-xs font-bold px-3 py-1 rounded-bl-lg uppercase">
                  {t('popular')}
                </div>
              )}
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="text-[#D4AF37] mb-6">
                <span className="text-3xl font-bold">${price}</span>
                <span className="text-gray-400 text-sm">/{duration.replace('semiAnnual', '6m').replace('weekly', 'wk').replace('monthly', 'mo').replace('yearly', 'yr')}</span>
              </div>
              
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-white">
                  <div className="w-2 h-2 rounded-full bg-[#D4AF37]"></div>
                  {t('lot_limit')} {plan.lotAllowed.toFixed(2)}
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
                  {t('auto_trade')}
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
                  {t('support')}
                </li>
              </ul>

              <button 
                onClick={() => handleSubscribe(plan)}
                disabled={loading}
                className={`w-full py-3 rounded-xl font-bold transition-colors ${
                  isPopular 
                    ? 'bg-[#D4AF37] text-black hover:bg-[#AA8B2C]' 
                    : 'bg-white/5 text-white hover:bg-white/10'
                } disabled:opacity-50`}
              >
                {loading ? t('subscribing') : t('subscribe')}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
