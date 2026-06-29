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

export default function BillingPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [duration, setDuration] = useState<'weekly' | 'monthly' | 'semiAnnual' | 'yearly'>('monthly');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}`}` + '/plans');
        setPlans(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load plans');
      }
    };
    fetchPlans();
  }, []);

  const handleSubscribe = async (plan: Plan) => {
    setLoading(true);
    setError('');
    try {
      const token = Cookies.get('token');
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}`}` + '/payments/initiate', 
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
      setError(err.response?.data?.message || 'Error initiating payment');
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
        <h1 className="text-3xl font-bold mb-2">Billing & Checkout</h1>
        <p className="text-gray-400">Upgrade your plan to increase your Lot Limit and unlock premium features.</p>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mt-4">{error}</div>}

      <div className="flex justify-center mb-8 mt-8">
        <div className="bg-[#0F1115] border border-white/10 rounded-xl p-1 inline-flex flex-wrap justify-center gap-1">
          {[
            { id: 'weekly', label: 'Weekly' },
            { id: 'monthly', label: 'Monthly' },
            { id: 'semiAnnual', label: '6 Months' },
            { id: 'yearly', label: 'Yearly' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setDuration(t.id as any)}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                duration === t.id 
                  ? 'bg-[#D4AF37] text-black shadow-md' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {t.label}
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
                  Popular
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
                  Lot Limit: {plan.lotAllowed.toFixed(2)}
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
                  Full automated trading
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
                  Premium Support
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
                {loading ? '...' : 'Subscribe'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
