'use client';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { setUserLocale } from "@/services/locale";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import GoldAiBacktest from "@/components/GoldAiBacktest";


export default function Home() {
  const t = useTranslations();
  const [selectedEa, setSelectedEa] = useState<'goldai' | 'scalper'>('goldai');

  // Open the chosen EA's pricing tab and scroll to it
  const showPricing = (ea: 'goldai' | 'scalper') => {
    setSelectedEa(ea);
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };
  const [duration, setDuration] = useState<'weekly' | 'monthly' | 'semi_annual' | 'yearly'>('monthly');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Gold AI: monthly subscription or lifetime license (year-end promo)
  const goldAiPlans = [
    {
      id: 'monthly',
      name: t('Pricing.monthly_plan'),
      originalPrice: 50,
      discountedPrice: '30',
      discountBadge: t('Pricing.discount_40'),
      savingsBadge: null,
      period: t('Pricing.billed_monthly'),
      description: t('Pricing.monthly_desc'),
      features: [
        t('Pricing.goldai_feat_ea'),
        t('Pricing.goldai_feat_account'),
        t('Pricing.goldai_feat_lot'),
        t('Pricing.feat_auto'),
        t('Pricing.feat_updates'),
        t('Pricing.feat_support'),
        t('Pricing.feat_cancel')
      ],
      isPopular: false,
      ctaText: t('Pricing.choose_monthly')
    },
    {
      id: 'lifetime',
      name: t('Pricing.lifetime_plan'),
      originalPrice: 500,
      discountedPrice: '200',
      discountBadge: t('Pricing.discount_60'),
      savingsBadge: t('Pricing.save_300'),
      period: t('Pricing.one_time'),
      description: t('Pricing.lifetime_desc'),
      features: [
        t('Pricing.goldai_feat_ea'),
        t('Pricing.goldai_feat_account'),
        t('Pricing.goldai_feat_lot'),
        t('Pricing.feat_auto'),
        t('Pricing.feat_lifetime_updates'),
        t('Pricing.feat_vip_support'),
        t('Pricing.feat_no_sub')
      ],
      isPopular: true,
      ctaText: t('Pricing.choose_lifetime')
    }
  ];

  // Gold Scalper: tiered plans per duration
  const scalperPlans = [
    {
      name: "Starter",
      lot: 0.01,
      minCapital: 100,
      prices: { weekly: 25, monthly: 79, semi_annual: 399, yearly: 699 },
      features: [t('Pricing.feat_account'), t('Pricing.scalper_support_standard')],
      isPopular: false,
    },
    {
      name: "Standard",
      lot: 0.10,
      minCapital: 1000,
      prices: { weekly: 49, monthly: 149, semi_annual: 749, yearly: 1299 },
      features: [t('Pricing.feat_account'), t('Pricing.scalper_support_priority')],
      isPopular: true,
    },
    {
      name: "Pro",
      lot: 0.50,
      minCapital: 5000,
      prices: { weekly: 99, monthly: 299, semi_annual: 1499, yearly: 2599 },
      features: [t('Pricing.feat_account'), t('Pricing.scalper_support_priority')],
      isPopular: false,
    },
    {
      name: "VIP",
      lot: 1.00,
      minCapital: 10000,
      prices: { weekly: 199, monthly: 599, semi_annual: 2999, yearly: 4999 },
      features: [t('Pricing.feat_account'), t('Pricing.scalper_support_vip')],
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
            <div className="hidden md:flex gap-4 items-center">
              <LanguageSwitcher />
              <Link href="/login">
                <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/5 border-0">{t('Navigation.login')}</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-[#D4AF37] text-black hover:bg-[#AA8B2C] font-semibold border-0">{t('Navigation.get_started')}</Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <LanguageSwitcher />
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-400 hover:text-white"
              >
                {isMobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#0F1115] border-b border-white/10 px-4 pt-2 pb-4 space-y-1 shadow-xl">
            <Link href="#features" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5">{t('Navigation.features')}</Link>
            <Link href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5">{t('Navigation.how_it_works')}</Link>
            <Link href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5">{t('Navigation.pricing')}</Link>
            <Link href="/faq" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5">{t('Navigation.faq')}</Link>
            <div className="pt-4 pb-2 border-t border-white/10 space-y-2 mt-2">
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-center px-4 py-2 text-gray-300 hover:text-white bg-white/5 rounded-md font-medium">{t('Navigation.login')}</Link>
              <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-center px-4 py-2 bg-[#D4AF37] text-black hover:bg-[#AA8B2C] rounded-md font-bold">{t('Navigation.get_started')}</Link>
            </div>
          </div>
        )}
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

        {/* About Section */}
        <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/5">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-white">{t('About.title')}</h2>
              <div className="space-y-4 text-gray-400 text-lg leading-relaxed">
                <p>{t('About.p1')}</p>
                <p>{t('About.p2')}</p>
                <p>{t('About.p3')}</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex gap-4 p-6 rounded-2xl bg-[#0F1115] border border-white/5">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div className="pt-3 text-gray-300 font-medium">
                  {t('About.bullet1')}
                </div>
              </div>
              <div className="flex gap-4 p-6 rounded-2xl bg-[#0F1115] border border-white/5">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <div className="pt-3 text-gray-300 font-medium">
                  {t('About.bullet2')}
                </div>
              </div>
              <div className="flex gap-4 p-6 rounded-2xl bg-[#0F1115] border border-white/5">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <div className="pt-3 text-gray-300 font-medium">
                  {t('About.bullet3')}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Robots Section: one card per Expert Advisor, each opening its own pricing */}
        <section id="robots" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/5">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t('Robots.title')}</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">{t('Robots.subtitle')}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              {
                id: 'goldai' as const,
                name: 'Gold AI',
                isNew: true,
                description: t('Products.GoldAI_desc'),
                points: [t('Robots.goldai_p1'), t('Robots.goldai_p2'), t('Robots.goldai_p3'), t('Robots.one_account')],
                price: '$30',
                period: t('Pricing.billed_monthly'),
              },
              {
                id: 'scalper' as const,
                name: 'Gold Scalper',
                isNew: false,
                description: t('Robots.scalper_desc'),
                points: [t('Robots.scalper_p1'), t('Robots.scalper_p2'), t('Robots.scalper_p3'), t('Robots.one_account')],
                price: '$25',
                period: `/${t('Pricing.weekly')}`,
              },
            ].map((robot) => (
              <div
                key={robot.id}
                className={`p-8 rounded-3xl border flex flex-col transition-all ${
                  robot.isNew
                    ? 'bg-gradient-to-b from-[#1c1a14] via-[#14151a] to-[#0F1115] border-[#D4AF37] shadow-[0_0_40px_rgba(212,175,55,0.15)] relative'
                    : 'bg-[#0F1115] border-white/10 hover:border-[#D4AF37]/50'
                }`}
              >
                {robot.isNew && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-[#D4AF37] to-[#AA8B2C] text-black text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                    {t('Robots.new_badge')}
                  </div>
                )}
                <h3 className="text-2xl font-bold text-[#D4AF37] mb-3">{robot.name}</h3>
                <p className="text-gray-400 text-sm mb-6">{robot.description}</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {robot.points.map((point, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-300 text-sm">
                      <div className="w-5 h-5 rounded-full bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                        <svg className="w-3.5 h-3.5 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <p className="text-gray-400 text-sm">
                    {t('Robots.from')} <span className="text-2xl font-extrabold text-white">{robot.price}</span>
                    <span className="text-gray-400">{robot.period}</span>
                  </p>
                  <Button
                    onClick={() => showPricing(robot.id)}
                    className={`h-12 px-6 font-bold border-0 ${
                      robot.isNew ? 'bg-[#D4AF37] text-black hover:bg-[#AA8B2C]' : 'bg-white/10 text-white hover:bg-white/15'
                    }`}
                  >
                    {t('Robots.cta')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

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

        {/* How It Works Section (target of the "how it works" menu link) */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/5">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t('HowItWorks.title')}</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">{t('HowItWorks.subtitle')}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="p-6 rounded-2xl bg-[#0F1115] border border-white/5">
                <div className="w-10 h-10 rounded-full bg-[#D4AF37] text-black font-black flex items-center justify-center mb-5">
                  {step}
                </div>
                <h3 className="text-lg font-bold mb-2">{t(`HowItWorks.s${step}_title`)}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{t(`HowItWorks.s${step}_desc`)}</p>
              </div>
            ))}
          </div>
        </section>

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
              <Link href="#backtest" className="inline-block text-[#D4AF37] font-semibold hover:underline">
                {t('Performance.backtest_link')} →
              </Link>
            </div>
            <div className="mt-8 pt-8 border-t border-white/5">
              <p className="text-sm text-gray-500 italic">
                {t('Performance.disclaimer')}
              </p>
            </div>
          </div>
        </section>

        {/* Gold AI backtest results (data: src/data/backtests/goldai.json) */}
        <GoldAiBacktest />

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

        {/* Testimonials Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/5">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('Testimonials.title')}</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">{t('Testimonials.subtitle')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Testimonial 1 */}
            <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-8 hover:border-[#D4AF37]/30 transition-colors relative">
              <div className="text-[#D4AF37] mb-4">
                <svg className="w-8 h-8 opacity-50" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
              </div>
              <p className="text-gray-300 mb-6 italic text-sm leading-relaxed">{t('Testimonials.t1_text')}</p>
              <div>
                <p className="text-white font-bold">{t('Testimonials.t1_author')}</p>
                <p className="text-[#D4AF37] text-xs uppercase tracking-wider">{t('Testimonials.t1_role')}</p>
              </div>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-[#0F1115] border border-[#D4AF37]/30 rounded-2xl p-8 transform md:-translate-y-4 shadow-[0_0_30px_rgba(212,175,55,0.05)] relative">
              <div className="text-[#D4AF37] mb-4">
                <svg className="w-8 h-8 opacity-50" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
              </div>
              <p className="text-gray-300 mb-6 italic text-sm leading-relaxed">{t('Testimonials.t2_text')}</p>
              <div>
                <p className="text-white font-bold">{t('Testimonials.t2_author')}</p>
                <p className="text-[#D4AF37] text-xs uppercase tracking-wider">{t('Testimonials.t2_role')}</p>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-8 hover:border-[#D4AF37]/30 transition-colors relative">
              <div className="text-[#D4AF37] mb-4">
                <svg className="w-8 h-8 opacity-50" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
              </div>
              <p className="text-gray-300 mb-6 italic text-sm leading-relaxed">{t('Testimonials.t3_text')}</p>
              <div>
                <p className="text-white font-bold">{t('Testimonials.t3_author')}</p>
                <p className="text-[#D4AF37] text-xs uppercase tracking-wider">{t('Testimonials.t3_role')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/5">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-5xl font-bold mb-4">{t('Pricing.title')}</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">{t('Pricing.subtitle')}</p>
          </div>

          {/* One tab per Expert Advisor: only the selected EA's pricing is shown */}
          <div className="flex justify-center mb-12">
            <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-1.5 inline-flex gap-1.5">
              {[
                { id: 'goldai', label: 'Gold AI' },
                { id: 'scalper', label: 'Gold Scalper' }
              ].map((ea) => (
                <button
                  key={ea.id}
                  onClick={() => setSelectedEa(ea.id as 'goldai' | 'scalper')}
                  className={`px-8 py-3 rounded-xl text-base font-bold transition-colors ${
                    selectedEa === ea.id
                      ? 'bg-[#D4AF37] text-black shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {ea.label}
                </button>
              ))}
            </div>
          </div>

          {selectedEa === 'goldai' && (
            <>
              {/* Gold AI */}
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold uppercase tracking-wider mb-4 animate-pulse">
                  <span>🔥</span> {t('Pricing.promo_tag')}
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#D4AF37] mb-2">Gold AI</h3>
                <p className="text-gray-400 max-w-2xl mx-auto">{t('Products.GoldAI_desc')}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
                {goldAiPlans.map((plan) => (
                  <div 
                    key={plan.id}
                    className={`p-8 rounded-3xl border flex flex-col transition-all duration-300 ${
                      plan.isPopular 
                        ? 'bg-gradient-to-b from-[#1c1a14] via-[#14151a] to-[#0F1115] border-[#D4AF37] transform md:-translate-y-2 shadow-[0_0_40px_rgba(212,175,55,0.2)] relative'
                        : 'bg-[#0F1115] border-white/10 hover:border-[#D4AF37]/50'
                    }`}
                  >
                    {plan.isPopular && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-[#D4AF37] to-[#AA8B2C] text-black text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1.5 whitespace-nowrap">
                        <span>⭐</span> {t('Pricing.most_popular')}
                      </div>
                    )}

                    <div className="flex justify-between items-start gap-4 mb-3">
                      <div>
                        <h3 className={`text-2xl font-bold ${plan.isPopular ? 'text-[#D4AF37]' : 'text-white'}`}>
                          {plan.name}
                        </h3>
                        <p className="text-gray-400 text-xs mt-1">{plan.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                          {plan.discountBadge}
                        </span>
                        {plan.savingsBadge && (
                          <span className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                            {plan.savingsBadge}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="my-5 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                      <div className="flex items-baseline gap-2">
                        <span className="text-gray-500 text-xl line-through">${plan.originalPrice}</span>
                        <span className="text-4xl sm:text-5xl font-extrabold text-white">${plan.discountedPrice}</span>
                        <span className="text-gray-400 text-sm">{plan.period}</span>
                      </div>
                      <p className="text-xs text-emerald-400 font-medium mt-1.5 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        {t('Pricing.promo_end_year')}
                      </p>
                    </div>

                    <ul className="space-y-3.5 mb-8 flex-1">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3 text-gray-300 text-sm">
                          <div className="w-5 h-5 rounded-full bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                            <svg className="w-3.5 h-3.5 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Link href="/register" className="w-full">
                      <Button 
                        variant={plan.isPopular ? "default" : "outline"} 
                        className={`w-full h-12 font-bold text-base transition-all ${
                          plan.isPopular 
                            ? 'bg-[#D4AF37] text-black hover:bg-[#AA8B2C] shadow-lg shadow-[#D4AF37]/20 border-0' 
                            : 'border-white/20 hover:bg-white/10 text-white'
                        }`}
                      >
                        {plan.ctaText}
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </>
          )}

          {selectedEa === 'scalper' && (
            <>
              {/* Gold Scalper */}
              <div className="text-center mb-10">
                <h3 className="text-2xl sm:text-3xl font-bold text-[#D4AF37]">Gold Scalper</h3>
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
                      onClick={() => setDuration(t_item.id as typeof duration)}
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
                {scalperPlans.map((plan) => (
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
            </>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0F1115]/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            {/* Logo & Copyright */}
            <div className="flex flex-col items-center md:items-start gap-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#AA8B2C] flex items-center justify-center">
                  <span className="text-black font-bold text-xs leading-none">G</span>
                </div>
                <span className="font-bold text-sm tracking-tight text-gray-300">Gold Trading Bot</span>
              </div>
              <p className="text-xs text-gray-600">© {new Date().getFullYear()} Gold Trading Bot. {t('Footer.rights')}</p>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link href="/terms" className="text-gray-500 hover:text-[#D4AF37] transition-colors">
                {t('Footer.terms')}
              </Link>
              <Link href="/privacy" className="text-gray-500 hover:text-[#D4AF37] transition-colors">
                {t('Footer.privacy')}
              </Link>
              <Link href="/risk" className="text-gray-500 hover:text-[#D4AF37] transition-colors">
                {t('Footer.risk')}
              </Link>
            </div>
          </div>

          {/* Risk Disclaimer */}
          <div className="mt-8 pt-6 border-t border-white/5">
            <p className="text-[11px] text-gray-600 text-center max-w-4xl mx-auto leading-relaxed">
              {t('Footer.disclaimer')}
              {' '}<Link href="/risk" className="text-gray-500 hover:text-[#D4AF37] underline">{t('Footer.learn_more')}</Link>.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
