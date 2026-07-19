'use client';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { setUserLocale } from "@/services/locale";

function LanguageSwitcher() {
  const t = useTranslations('Language');
  const [loading, setLoading] = useState(false);

  const switchLocale = async (locale: string) => {
    setLoading(true);
    await setUserLocale(locale);
    window.location.reload();
  };

  return (
    <div className="flex gap-2">
      {['en', 'fr', 'es', 'pt', 'ar'].map((lang) => (
        <button 
          key={lang}
          onClick={() => switchLocale(lang)}
          disabled={loading}
          className="text-xs text-gray-400 hover:text-[#D4AF37] uppercase font-bold"
        >
          {lang}
        </button>
      ))}
    </div>
  );
}

export default function Home() {
  const t = useTranslations();
  const [duration, setDuration] = useState<'weekly' | 'monthly' | 'semi_annual' | 'yearly'>('monthly');

  const plans = [
    {
      name: "Starter",
      lot: 0.01,
      minCapital: 100,
      prices: { weekly: 25, monthly: 79, semi_annual: 399, yearly: 699 },
      features: ["1 Live Account", "Standard Support"],
      isPopular: false,
    },
    {
      name: "Standard",
      lot: 0.10,
      minCapital: 1000,
      prices: { weekly: 49, monthly: 149, semi_annual: 749, yearly: 1299 },
      features: ["1 Live Account", "Priority Support"],
      isPopular: true,
    },
    {
      name: "Pro",
      lot: 0.50,
      minCapital: 5000,
      prices: { weekly: 99, monthly: 299, semi_annual: 1499, yearly: 2599 },
      features: ["1 Live Account", "Priority Support"],
      isPopular: false,
    },
    {
      name: "VIP",
      lot: 1.00,
      minCapital: 10000,
      prices: { weekly: 199, monthly: 599, semi_annual: 2999, yearly: 4999 },
      features: ["1 Live Account", "1-on-1 Setup & Support"],
      isPopular: false,
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#D4AF37] selection:text-black font-sans">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-[#0F1115]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#AA8B2C] flex items-center justify-center">
                <span className="text-black font-bold text-lg leading-none">G</span>
              </div>
              <span className="font-bold text-xl tracking-tight">Gold Trading Bot</span>
            </div>
            <div className="hidden md:flex gap-8 text-sm font-medium text-gray-300">
              <Link href="#features" className="hover:text-[#D4AF37] transition-colors">{t('Navigation.features')}</Link>
              <Link href="#how-it-works" className="hover:text-[#D4AF37] transition-colors">{t('Navigation.how_it_works')}</Link>
              <Link href="#pricing" className="hover:text-[#D4AF37] transition-colors">{t('Navigation.pricing')}</Link>
              <Link href="/faq" className="hover:text-[#D4AF37] transition-colors">{t('Navigation.faq')}</Link>
            </div>
            <div className="flex gap-4 items-center">
              <LanguageSwitcher />
              <Link href="/login">
                <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/5 border-0">{t('Navigation.login')}</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-[#D4AF37] text-black hover:bg-[#AA8B2C] font-semibold border-0">{t('Navigation.get_started')}</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main>
        <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#D4AF37]/10 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#D4AF37] text-sm font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
              {t('Hero.subtitle')}
            </div>
            <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-8">
              {t('Hero.title1')} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB]">{t('Hero.title2')}</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-400 mb-10">
              {t('Hero.description')}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-[#D4AF37] text-black hover:bg-[#AA8B2C] font-bold h-14 px-8 text-lg border-0">
                  {t('Navigation.get_started')}
                </Button>
              </Link>
              <Link href="#pricing">
                <Button size="lg" variant="outline" className="border border-white/20 bg-white/5 hover:bg-white/10 text-white h-14 px-8 text-lg">
                  {t('Hero.view_pricing')}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/5">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-[#0F1115] border border-white/5">
              <div className="w-12 h-12 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-3">{t('Features.f1_title')}</h3>
              <p className="text-gray-400">{t('Features.f1_desc')}</p>
            </div>
            <div className="p-8 rounded-2xl bg-[#0F1115] border border-white/5">
              <div className="w-12 h-12 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-3">{t('Features.f2_title')}</h3>
              <p className="text-gray-400">{t('Features.f2_desc')}</p>
            </div>
            <div className="p-8 rounded-2xl bg-[#0F1115] border border-white/5">
              <div className="w-12 h-12 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-3">{t('Features.f3_title')}</h3>
              <p className="text-gray-400">{t('Features.f3_desc')}</p>
            </div>
          </div>
        </div>

        {/* Performance Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/5">
          <div className="bg-[#0F1115] border border-[#D4AF37]/20 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-[0_0_40px_rgba(212,175,55,0.05)]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-50" />
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#D4AF37]/20 to-transparent rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
            <h2 className="text-3xl font-bold mb-6 text-white">{t('Performance.title')}</h2>
            <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
              <p>{t('Performance.p1')}</p>
              <p>{t('Performance.p2')}</p>
            </div>
            <div className="mt-8 pt-8 border-t border-white/5">
              <p className="text-sm text-gray-500 italic">
                {t('Performance.disclaimer')}
              </p>
            </div>
          </div>
        </section>

        {/* Recommendations Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/5">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('Recommendations.title')}</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">{t('Recommendations.desc')}</p>
          </div>
          <div className="grid md:grid-cols-2 max-w-4xl mx-auto gap-6">
            <div className="bg-[#1A1C23] border border-[#D4AF37]/20 rounded-2xl p-6 text-center hover:border-[#D4AF37]/50 transition-colors">
              <div className="w-16 h-16 mx-auto bg-[#D4AF37]/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-2">{t('Recommendations.broker_title')}</h3>
              <p className="text-gray-400 text-sm mb-6">{t('Recommendations.broker_desc')}</p>
              <a href="https://fusionmarkets.com/?refcode=113900" target="_blank" rel="noreferrer" className="text-[#D4AF37] font-semibold text-sm hover:underline">
                {t('Recommendations.broker_link')} →
              </a>
            </div>
            
            <div className="bg-[#1A1C23] border border-[#D4AF37]/20 rounded-2xl p-6 text-center hover:border-[#D4AF37]/50 transition-colors">
              <div className="w-16 h-16 mx-auto bg-[#D4AF37]/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-2">{t('Recommendations.vps_title')}</h3>
              <p className="text-gray-400 text-sm">{t('Recommendations.vps_desc')}</p>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/5">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-5xl font-bold mb-4">{t('Pricing.title')}</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">{t('Pricing.subtitle')}</p>
          </div>
          
          <div className="flex justify-center mb-12">
            <div className="bg-[#0F1115] border border-white/10 rounded-xl p-1 inline-flex flex-wrap justify-center gap-1">
              {[
                { id: 'weekly', label: t('Pricing.weekly') },
                { id: 'monthly', label: t('Pricing.monthly') },
                { id: 'semi_annual', label: t('Pricing.semi_annual') },
                { id: 'yearly', label: t('Pricing.yearly') }
              ].map((t_item) => (
                <button
                  key={t_item.id}
                  onClick={() => setDuration(t_item.id as any)}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                    duration === t_item.id 
                      ? 'bg-[#D4AF37] text-black shadow-md' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {t_item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {plans.map((plan) => (
              <div 
                key={plan.name}
                className={`p-6 rounded-2xl border flex flex-col transition-all ${
                  plan.isPopular 
                    ? 'bg-gradient-to-b from-[#1A1C23] to-[#0F1115] border-[#D4AF37] transform md:-translate-y-2 shadow-[0_0_30px_rgba(212,175,55,0.15)] relative'
                    : 'bg-[#0F1115] border-white/10 hover:border-[#D4AF37]/50'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#D4AF37] text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    {t('Pricing.most_popular')}
                  </div>
                )}
                <h3 className={`text-xl font-medium mb-2 ${plan.isPopular ? 'text-[#D4AF37]' : 'text-gray-300'}`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold">${plan.prices[duration]}</span>
                  <span className="text-gray-500 text-sm">/{t(`Pricing.${duration}`)}</span>
                </div>
                
                <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg p-3 mb-6 text-center">
                  <span className="text-xs text-[#D4AF37] uppercase font-bold tracking-wider block mb-1">{t('Pricing.min_capital')}</span>
                  <span className="text-lg font-bold text-white">${plan.minCapital.toLocaleString()}</span>
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-gray-300 text-sm">
                    <svg className="w-5 h-5 text-[#D4AF37] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    {t('Pricing.max_lot')}: <strong className="text-white ml-1">{plan.lot.toFixed(2)}</strong>
                  </li>
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-300 text-sm">
                      <svg className="w-5 h-5 text-[#D4AF37] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button 
                    variant={plan.isPopular ? "default" : "outline"} 
                    className={`w-full h-12 font-bold ${
                      plan.isPopular 
                        ? 'bg-[#D4AF37] text-black hover:bg-[#AA8B2C] border-0' 
                        : 'border-white/20 hover:bg-white/10 text-white'
                    }`}
                  >
                    {t('Pricing.choose')} {plan.name}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
