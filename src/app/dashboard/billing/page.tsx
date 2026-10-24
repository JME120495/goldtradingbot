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
  product?: { name: string; slug: string; description: string | null; createdAt?: string };
}

interface KpayProvider {
  code: string;
  country: string;
  operator: string;
  currency: string;
}

type FixedDuration = 'weekly' | 'monthly' | 'semiAnnual' | 'yearly';
type Duration = FixedDuration | 'lifetime';

const parsePrices = (plan: Plan): Record<string, number> => {
  try {
    return (typeof plan.prices === 'string' ? JSON.parse(plan.prices) : plan.prices) || {};
  } catch {
    return {};
  }
};

const isDurationPlan = (plan: Plan) => {
  const p = parsePrices(plan);
  return 'weekly' in p || 'semiAnnual' in p || 'yearly' in p;
};

export default function BillingPage() {
  const t = useTranslations('DashboardBilling');
  const tProducts = useTranslations('Products');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [duration, setDuration] = useState<FixedDuration>('monthly');
  const [activeProductId, setActiveProductId] = useState<string | null>(null);

  // Mobile Money Modal State
  const [showMomoModal, setShowMomoModal] = useState(false);
  const [selectedPlanForMomo, setSelectedPlanForMomo] = useState<{ plan: Plan; duration: Duration; price: number } | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [provider, setProvider] = useState('MTN_MOMO_CMR');
  const [momoMessage, setMomoMessage] = useState('');
  // Live result of the Mobile Money payment, as reported by KPay to the server
  const [momoReference, setMomoReference] = useState<string | null>(null);
  const [momoResult, setMomoResult] = useState<{ status: string; failureReason: string | null } | null>(null);
  const [momoTimedOut, setMomoTimedOut] = useState(false);

  useEffect(() => {
    if (!momoReference) return;
    let tries = 0;
    const timer = setInterval(async () => {
      tries++;
      try {
        const res = await api.get(`/payments/status/${encodeURIComponent(momoReference)}`);
        if (res.data.status !== 'PENDING') {
          setMomoResult({ status: res.data.status, failureReason: res.data.failureReason });
          clearInterval(timer);
          return;
        }
      } catch (err) {
        console.error(err);
      }
      if (tries >= 60) { // ~3 minutes
        setMomoTimedOut(true);
        clearInterval(timer);
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [momoReference]);

  const resetMomo = () => {
    setMomoMessage('');
    setMomoReference(null);
    setMomoResult(null);
    setMomoTimedOut(false);
    setError('');
  };
  const [kpayProviders, setKpayProviders] = useState<KpayProvider[]>([]);
  const [momoQuote, setMomoQuote] = useState<{ key: string; amount: number; currency: string } | null>(null);

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
    const fetchKpayProviders = async () => {
      try {
        const res = await api.get('/payments/kpay-providers');
        setKpayProviders(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPlans();
    fetchKpayProviders();
  }, []);

  // Amount in the operator's currency (KPay charges locally: XAF, XOF, KES, ...)
  const momoUsd = selectedPlanForMomo?.price;
  const momoQuoteKey = `${provider}:${momoUsd}`;
  useEffect(() => {
    if (!showMomoModal || !momoUsd) return;
    let cancelled = false;
    api.get('/payments/kpay-quote', { params: { provider, usd: momoUsd } })
      .then((res) => { if (!cancelled) setMomoQuote({ key: `${provider}:${momoUsd}`, ...res.data }); })
      .catch((err) => console.error(err));
    return () => { cancelled = true; };
  }, [showMomoModal, provider, momoUsd]);
  // Only show a quote computed for the current operator and price
  const currentQuote = momoQuote?.key === momoQuoteKey ? momoQuote : null;

  // Operators grouped by country for the <select>
  const kpayCountries = kpayProviders.reduce<Record<string, KpayProvider[]>>((acc, p) => {
    (acc[p.country] ||= []).push(p);
    return acc;
  }, {});

  const handleSubscribe = async (plan: Plan, duration: Duration, method: 'CRYPTO' | 'MOBILE_MONEY', phone?: string, prov?: string) => {
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
           setMomoReference(res.data.reference ?? null);
        }
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('err_pay'));
      setLoading(false);
    }
  };

  // Promo products (monthly / lifetime), e.g. Gold AI
  const getPlanMeta = (plan: Plan) => {
    const p = parsePrices(plan);
    const isLifetime = plan.name.toLowerCase().includes('vie') || plan.name.toLowerCase().includes('lifetime');
    const currentPrice: number = isLifetime ? (p.lifetime ?? 200) : (p.monthly ?? 25.5);
    const originalPrice: number | null = p.original ?? null;

    return {
      duration: (isLifetime ? 'lifetime' : 'monthly') as Duration,
      currentPrice,
      originalPrice,
      discountBadge: p.discount ? t('promo_badge', { pct: p.discount }) : null,
      savingsBadge: isLifetime && originalPrice ? t('save_amount', { amount: originalPrice - currentPrice }) : null,
      period: isLifetime ? t('one_time') : t('billed_monthly'),
      isPopular: isLifetime,
    };
  };

  // One section per product, newest product first (Gold AI before GOLD_SCALPER)
  const productGroups = [...plans]
    .sort((a, b) => (b.product?.createdAt ?? '').localeCompare(a.product?.createdAt ?? ''))
    .reduce<{ productId: string; product?: Plan['product']; plans: Plan[] }[]>((groups, plan) => {
    let group = groups.find((g) => g.productId === plan.productId);
    if (!group) {
      group = { productId: plan.productId, product: plan.product, plans: [] };
      groups.push(group);
    }
    group.plans.push(plan);
    return groups;
  }, []);

  const renderPromoPlans = (productPlans: Plan[]) => (
    <>
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold uppercase tracking-wider mb-2">
        <span>🔥</span> Offre Spéciale Fin d'Année
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-4">
        {[...productPlans].sort((a, b) => Number(getPlanMeta(a).isPopular) - Number(getPlanMeta(b).isPopular)).map((plan) => {
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
                  {meta.discountBadge && (
                    <span className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                      {meta.discountBadge}
                    </span>
                  )}
                  {meta.savingsBadge && (
                    <span className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                      {meta.savingsBadge}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 mb-6">
                <div className="flex items-baseline gap-2">
                  {meta.originalPrice && <span className="text-gray-500 text-lg line-through">${meta.originalPrice}</span>}
                  <span className="text-4xl font-extrabold text-white">${meta.currentPrice}</span>
                  <span className="text-gray-400 text-sm">{meta.period}</span>
                </div>
                {meta.originalPrice && (
                  <p className="text-xs text-emerald-400 font-medium mt-1">
                    ✓ Réduction garantie jusqu'à fin d'année
                  </p>
                )}
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
    </>
  );

  // Products sold per fixed duration (weekly / monthly / 6 months / yearly), e.g. GOLD_SCALPER
  const renderDurationPlans = (productPlans: Plan[]) => (
    <>
      <div className="flex justify-center mb-8">
        <div className="bg-[#0F1115] border border-white/10 rounded-xl p-1 inline-flex flex-wrap justify-center gap-1">
          {[
            { id: 'weekly', label: t('weekly') },
            { id: 'monthly', label: t('monthly') },
            { id: 'semiAnnual', label: t('six_months') },
            { id: 'yearly', label: t('yearly') }
          ].map((tItem) => (
            <button
              key={tItem.id}
              onClick={() => setDuration(tItem.id as FixedDuration)}
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
        {[...productPlans].sort((a, b) => a.lotAllowed - b.lotAllowed).map((plan) => {
          const price: number = parsePrices(plan)[duration] ?? 0;
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
                    setSelectedPlanForMomo({ plan, duration, price });
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
                  onClick={() => handleSubscribe(plan, duration, 'CRYPTO')}
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
    </>
  );

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
          <p className="text-gray-400">{t('desc')}</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mt-4">{error}</div>}

        {/* One tab per Expert Advisor: only the selected EA's pricing is shown */}
        {productGroups.length > 1 && (
          <div className="flex justify-center pt-6">
            <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-1.5 inline-flex flex-wrap justify-center gap-1.5">
              {productGroups.map((group) => (
                <button
                  key={group.productId}
                  onClick={() => setActiveProductId(group.productId)}
                  className={`px-8 py-3 rounded-xl text-base font-bold transition-colors ${
                    (activeProductId ?? productGroups[0].productId) === group.productId
                      ? 'bg-[#D4AF37] text-black shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {group.product?.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {productGroups.filter((group) => group.productId === (activeProductId ?? productGroups[0]?.productId)).map((group) => {
          const descKey = `${group.product?.slug}_desc`;
          const description = tProducts.has(descKey) ? tProducts(descKey) : group.product?.description;

          return (
            <section key={group.productId} className="pt-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#D4AF37]">{group.product?.name}</h2>
                {description && <p className="text-gray-400 text-sm mt-1">{description}</p>}
              </div>
              {group.plans.some(isDurationPlan) ? renderDurationPlans(group.plans) : renderPromoPlans(group.plans)}
            </section>
          );
        })}
      </div>

      {/* Mobile Money Modal */}
      {showMomoModal && selectedPlanForMomo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <button 
              onClick={() => { setShowMomoModal(false); resetMomo(); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold text-white mb-1">Paiement Mobile Money</h2>
            <p className="text-gray-400 text-sm mb-1">
              {selectedPlanForMomo.plan.name} — <strong className="text-[#D4AF37]">${selectedPlanForMomo.price}</strong>
            </p>
            <p className="text-gray-500 text-xs mb-4">
              Disponible uniquement au Cameroun (MTN, Orange). Depuis un autre pays, payez en crypto.
            </p>
            
            {momoResult?.status === 'COMPLETED' ? (
              <div className="text-center py-6">
                <div className="text-green-500 mb-4 flex justify-center">
                   <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                </div>
                <p className="text-lg text-white font-medium mb-2">Paiement réussi !</p>
                <p className="text-sm text-gray-400 mb-5">Votre licence est activée. Enregistrez votre compte MT5 dans votre espace pour utiliser le robot.</p>
                <a href="/dashboard" className="inline-block bg-[#D4AF37] text-black font-bold px-6 py-2 rounded-lg hover:bg-[#AA8B2C] transition-colors">
                  Voir mes licences
                </a>
              </div>
            ) : momoResult ? (
              <div className="text-center py-6">
                <div className="text-red-500 mb-4 flex justify-center">
                   <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                </div>
                <p className="text-lg text-white font-medium mb-2">
                  {momoResult.status === 'CANCELLED' ? 'Paiement annulé' : 'Paiement échoué'}
                </p>
                <p className="text-sm text-red-400 bg-red-500/10 rounded-lg p-3 mb-5">
                  {momoResult.failureReason || 'Aucun motif transmis par KPay.'}
                </p>
                <button
                  onClick={resetMomo}
                  className="bg-[#D4AF37] text-black font-bold px-6 py-2 rounded-lg hover:bg-[#AA8B2C] transition-colors"
                >
                  Réessayer
                </button>
              </div>
            ) : momoMessage ? (
              <div className="text-center py-6">
                <div className="mb-4 flex justify-center">
                  <div className="w-14 h-14 rounded-full border-4 border-[#D4AF37]/20 border-t-[#D4AF37] animate-spin" />
                </div>
                <p className="text-lg text-white font-medium mb-2">{momoMessage}</p>
                {momoTimedOut ? (
                  <p className="text-sm text-gray-400 mb-4">
                    Pas encore de réponse de l&apos;opérateur. Si vous avez validé, votre licence apparaîtra automatiquement dans votre espace.
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 mb-4">
                    En attente de la confirmation… Si aucune demande n&apos;apparaît, composez #150*50# (Orange) ou *126# (MTN) pour valider le paiement en attente.
                  </p>
                )}
                <button
                  onClick={() => { setShowMomoModal(false); resetMomo(); }}
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
                    {Object.entries(kpayCountries).map(([country, operators]) => (
                      <optgroup key={country} label={country}>
                        {operators.map((op) => (
                          <option key={op.code} value={op.code}>{op.operator} ({country})</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  {currentQuote && (
                    <p className="text-sm text-[#D4AF37] font-semibold mt-2">
                      Montant à payer : {currentQuote.amount.toLocaleString('fr-FR')} {currentQuote.currency}
                    </p>
                  )}
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
