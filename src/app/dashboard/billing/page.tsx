'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
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

  // Mobile Money Modal State
  const [showMomoModal, setShowMomoModal] = useState(false);
  const [selectedPlanForMomo, setSelectedPlanForMomo] = useState<Plan | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [provider, setProvider] = useState('MTN_MOMO_CMR');
  const [momoMessage, setMomoMessage] = useState('');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await api.get('/plans');
        setPlans(res.data);
      } catch (err) {
        console.error(err);
        setError(t('err_load'));
      }
    };
    fetchPlans();
  }, []);

  const handleSubscribe = async (plan: Plan, method: 'CRYPTO' | 'MOBILE_MONEY', phone?: string, prov?: string) => {
    setLoading(true);
    setError('');
    setMomoMessage('');
    try {
      const res = await api.post('/payments/initiate', 
        { 
          productId: plan.productId,
          planId: plan.id,
          duration: duration,
          method: method,
          ...(method === 'MOBILE_MONEY' ? { phoneNumber: phone, provider: prov } : {})
        }
      );
      
      if (method === 'CRYPTO') {
        window.location.href = res.data.paymentLink;
      } else {
        if (res.data.paymentStatus === 'PENDING') {
           setMomoMessage(res.data.message || 'Veuillez valider le paiement sur votre téléphone.');
        }
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('err_pay'));
      setLoading(false);
    }
  };

  const getPrice = (pricesStr: any) => {
    try {
      const p = typeof pricesStr === 'string' ? JSON.parse(pricesStr) : pricesStr;
      return p ? (p[duration] ?? 0) : 0;
    } catch {
      return 0;
    }
  };

  return (
    <>
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

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    setSelectedPlanForMomo(plan);
                    setShowMomoModal(true);
                  }}
                  disabled={loading}
                  className={`w-full py-3 rounded-xl font-bold transition-colors ${
                    isPopular 
                      ? 'bg-[#D4AF37] text-black hover:bg-[#AA8B2C]' 
                      : 'bg-white/5 text-white hover:bg-white/10'
                  } disabled:opacity-50 flex items-center justify-center gap-2`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  {loading ? t('subscribing') : 'Mobile Money'}
                </button>

                <button 
                  onClick={() => handleSubscribe(plan, 'CRYPTO')}
                  disabled={loading}
                  className={`w-full py-3 rounded-xl font-bold transition-colors border border-white/20 text-white hover:bg-white/5 disabled:opacity-50 flex items-center justify-center gap-2`}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14.65,11.39C15.65,11.13 16.32,10.22 16.32,9.15C16.32,7.4 15.05,6 13.5,6H8.5V18H13.88C15.53,18 16.85,16.5 16.85,14.62C16.85,13.11 15.86,11.83 14.65,11.39M10.5,8H13.5C14.15,8 14.67,8.5 14.67,9.15C14.67,9.8 14.15,10.3 13.5,10.3H10.5V8M13.88,16H10.5V12.3H13.88C14.64,12.3 15.25,12.92 15.25,13.68C15.25,14.44 14.64,15.06 13.88,15.06Z" />
                  </svg>
                  Crypto
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>

      {/* Mobile Money Modal */}
      {showMomoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <button 
              onClick={() => { setShowMomoModal(false); setMomoMessage(''); setError(''); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold text-white mb-4">Paiement Mobile Money</h2>
            
            {momoMessage ? (
              <div className="text-center py-6">
                <div className="text-green-500 mb-4 flex justify-center">
                   <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                </div>
                <p className="text-lg text-white font-medium mb-4">{momoMessage}</p>
                <button 
                  onClick={() => { setShowMomoModal(false); setMomoMessage(''); setError(''); }}
                  className="bg-white/10 text-white px-6 py-2 rounded-lg hover:bg-white/20 transition-colors"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {error && <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded-lg">{error}</div>}
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Opérateur</label>
                  <select 
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full bg-[#1A1D24] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                  >
                    <option value="MTN_MOMO_CMR">Cameroun - MTN</option>
                    <option value="ORANGE_CMR">Cameroun - Orange</option>
                    <option value="MTN_MOMO_CIV">Côte d'Ivoire - MTN</option>
                    <option value="ORANGE_CIV">Côte d'Ivoire - Orange</option>
                    <option value="AIRTEL_GAB">Gabon - Airtel</option>
                    <option value="MTN_MOMO_BEN">Bénin - MTN</option>
                    <option value="MOOV_BEN">Bénin - Moov</option>
                    <option value="VODACOM_MPESA_COD">RD Congo - Vodacom M-Pesa</option>
                    <option value="AIRTEL_COD">RD Congo - Airtel</option>
                    <option value="ORANGE_COD">RD Congo - Orange</option>
                    <option value="MPESA_KEN">Kenya - M-Pesa</option>
                    <option value="AIRTEL_COG">Congo - Airtel</option>
                    <option value="MTN_MOMO_COG">Congo - MTN</option>
                    <option value="AIRTEL_RWA">Rwanda - Airtel</option>
                    <option value="MTN_MOMO_RWA">Rwanda - MTN</option>
                    <option value="FREE_SEN">Sénégal - Free</option>
                    <option value="ORANGE_SEN">Sénégal - Orange</option>
                    <option value="ORANGE_SLE">Sierra Leone - Orange</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Numéro de téléphone</label>
                  <input 
                    type="text" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Ex: 670000000"
                    className="w-full bg-[#1A1D24] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Saisissez le numéro sans l'indicatif du pays.
                  </p>
                </div>

                <button 
                  onClick={() => handleSubscribe(selectedPlanForMomo!, 'MOBILE_MONEY', phoneNumber, provider)}
                  disabled={loading || !phoneNumber}
                  className="w-full bg-[#D4AF37] text-black font-bold rounded-xl py-3 mt-4 hover:bg-[#AA8B2C] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Traitement...' : 'Payer maintenant'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
