'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useTranslations } from 'next-intl';

interface Plan {
  id: string;
  name: string;
  lotAllowed: number;
  prices: string; // JSON
  productId: string;
}

export default function BillingPage() {
  const t = useTranslations('DashboardBilling');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [plans, setPlans] = useState<Plan[]>([]);

  // Mobile Money Modal State
  const [showMomoModal, setShowMomoModal] = useState(false);
  const [selectedPlanForMomo, setSelectedPlanForMomo] = useState<{ plan: Plan; duration: 'monthly' | 'lifetime'; price: number } | null>(null);
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

  const handleSubscribe = async (plan: Plan, duration: 'monthly' | 'lifetime', method: 'CRYPTO' | 'MOBILE_MONEY', phone?: string, prov?: string) => {
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

  const getPlanMeta = (plan: Plan) => {
    let p: any = {};
    try {
      p = typeof plan.prices === 'string' ? JSON.parse(plan.prices) : plan.prices;
    } catch {}

    const isLifetime = plan.name.toLowerCase().includes('vie') || plan.name.toLowerCase().includes('lifetime');

    if (isLifetime) {
      return {
        duration: 'lifetime' as const,
        currentPrice: p.lifetime ?? 200,
        originalPrice: p.original ?? 500,
        discountBadge: t('promo_badge_60'),
        savingsBadge: t('save_300'),
        period: t('one_time'),
        isPopular: true,
      };
    } else {
      return {
        duration: 'monthly' as const,
        currentPrice: p.monthly ?? 25.5,
        originalPrice: p.original ?? 30,
        discountBadge: t('promo_badge_15'),
        savingsBadge: null,
        period: t('billed_monthly'),
        isPopular: false,
      };
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold uppercase tracking-wider mb-2">
            <span>🔥</span> Offre Spéciale Fin d'Année
          </div>
          <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
          <p className="text-gray-400">{t('desc')}</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mt-4">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-8">
          {plans.map((plan) => {
            const meta = getPlanMeta(plan);

            return (
              <div 
                key={plan.id} 
                className={`bg-[#0F1115] border ${meta.isPopular ? 'border-[#D4AF37] shadow-[0_0_35px_rgba(212,175,55,0.15)] relative' : 'border-white/10 hover:border-[#D4AF37]/50'} rounded-3xl p-7 flex flex-col transition-all`}
              >
                {meta.isPopular && (
                  <div className="absolute top-0 right-8 -translate-y-1/2 bg-[#D4AF37] text-black text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider">
                    {t('popular')}
                  </div>
                )}

                <div className="flex justify-between items-start gap-4 mb-4">
                  <h3 className={`text-2xl font-bold ${meta.isPopular ? 'text-[#D4AF37]' : 'text-white'}`}>{plan.name}</h3>
                  <div className="flex flex-col items-end gap-1">
                    <span className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                      {meta.discountBadge}
                    </span>
                    {meta.savingsBadge && (
                      <span className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                        {meta.savingsBadge}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-gray-500 text-lg line-through">${meta.originalPrice}</span>
                    <span className="text-4xl font-extrabold text-white">${meta.currentPrice}</span>
                    <span className="text-gray-400 text-sm">{meta.period}</span>
                  </div>
                  <p className="text-xs text-emerald-400 font-medium mt-1">
                    ✓ Réduction garantie jusqu'à fin d'année
                  </p>
                </div>
                
                <ul className="space-y-3.5 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-white text-sm">
                    <div className="w-2 h-2 rounded-full bg-[#D4AF37]"></div>
                    {t('unlimited_lots')}
                  </li>
                  <li className="flex items-center gap-3 text-gray-300 text-sm">
                    <div className="w-2 h-2 rounded-full bg-[#D4AF37]"></div>
                    {t('auto_trade')}
                  </li>
                  <li className="flex items-center gap-3 text-gray-300 text-sm">
                    <div className="w-2 h-2 rounded-full bg-[#D4AF37]"></div>
                    {t('support')}
                  </li>
                </ul>

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => {
                      setSelectedPlanForMomo({ plan, duration: meta.duration, price: meta.currentPrice });
                      setShowMomoModal(true);
                    }}
                    disabled={loading}
                    className={`w-full py-3.5 rounded-xl font-bold transition-all ${
                      meta.isPopular 
                        ? 'bg-[#D4AF37] text-black hover:bg-[#AA8B2C] shadow-lg shadow-[#D4AF37]/20' 
                        : 'bg-white/10 text-white hover:bg-white/15'
                    } disabled:opacity-50 flex items-center justify-center gap-2`}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    {loading ? t('subscribing') : `Payer en Mobile Money ($${meta.currentPrice})`}
                  </button>

                  <button 
                    onClick={() => handleSubscribe(plan, meta.duration, 'CRYPTO')}
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl font-bold transition-colors border border-white/20 text-white hover:bg-white/5 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5 text-[#D4AF37]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14.65,11.39C15.65,11.13 16.32,10.22 16.32,9.15C16.32,7.4 15.05,6 13.5,6H8.5V18H13.88C15.53,18 16.85,16.5 16.85,14.62C16.85,13.11 15.86,11.83 14.65,11.39M10.5,8H13.5C14.15,8 14.67,8.5 14.67,9.15C14.67,9.8 14.15,10.3 13.5,10.3H10.5V8M13.88,16H10.5V12.3H13.88C14.64,12.3 15.25,12.92 15.25,13.68C15.25,14.44 14.64,15.06 13.88,15.06Z" />
                    </svg>
                    Payer en Crypto (${meta.currentPrice})
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Money Modal */}
      {showMomoModal && selectedPlanForMomo && (
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
            <h2 className="text-2xl font-bold text-white mb-1">Paiement Mobile Money</h2>
            <p className="text-gray-400 text-sm mb-4">
              {selectedPlanForMomo.plan.name} — <strong className="text-[#D4AF37]">${selectedPlanForMomo.price}</strong>
            </p>
            
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
                    className="w-full bg-[#1A1C23] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="MTN_MOMO_CMR">MTN Mobile Money (Cameroun)</option>
                    <option value="ORANGE_MONEY_CMR">Orange Money (Cameroun)</option>
                    <option value="AIRTEL_MONEY_GAB">Airtel Money (Gabon)</option>
                    <option value="AIRTEL_MONEY_COG">Airtel Money (Congo)</option>
                    <option value="MOOV_MONEY_CIV">Moov Money (Côte d'Ivoire)</option>
                    <option value="MTN_MOMO_CIV">MTN MoMo (Côte d'Ivoire)</option>
                    <option value="ORANGE_MONEY_CIV">Orange Money (Côte d'Ivoire)</option>
                    <option value="WAVE_CIV">Wave (Côte d'Ivoire)</option>
                    <option value="ORANGE_MONEY_SEN">Orange Money (Sénégal)</option>
                    <option value="WAVE_SEN">Wave (Sénégal)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Numéro de téléphone</label>
                  <input 
                    type="tel"
                    placeholder="Ex: 6XXXXXXXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-[#1A1C23] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                  <p className="text-xs text-gray-500 mt-1">Entrez le numéro associé à votre compte Mobile Money.</p>
                </div>

                <button
                  onClick={() => handleSubscribe(selectedPlanForMomo.plan, selectedPlanForMomo.duration, 'MOBILE_MONEY', phoneNumber, provider)}
                  disabled={loading || !phoneNumber}
                  className="w-full bg-[#D4AF37] text-black font-bold py-3.5 rounded-xl hover:bg-[#AA8B2C] transition-colors disabled:opacity-50 mt-2"
                >
                  {loading ? 'Initiation...' : `Payer maintenant ($${selectedPlanForMomo.price})`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
