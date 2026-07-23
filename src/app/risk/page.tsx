'use client';
import Link from "next/link";

import { useTranslations } from "next-intl";

export default function RiskPage() {
  const t = useTranslations('Risk');
  const tTerms = useTranslations('Terms');
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-[#0F1115]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#AA8B2C] flex items-center justify-center">
                <span className="text-black font-bold text-lg leading-none">G</span>
              </div>
              <span className="font-bold text-xl tracking-tight">Gold Trading Bot</span>
            </Link>
            <Link href="/" className="text-sm text-gray-400 hover:text-[#D4AF37] transition-colors">
              ← {tTerms('back_home')}
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold mb-2">{t('title')}</h1>
        <p className="text-gray-500 text-sm mb-12">{t('last_updated')}</p>

        {/* Main Warning Banner */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 sm:p-8 mb-12">
          <h2 className="text-2xl font-bold text-red-500 mb-4 flex items-center gap-3">
            <span className="text-3xl">⚠️</span>
            {t('important_warning')}
          </h2>
          <p className="text-red-200/80 leading-relaxed font-medium">
            {t('important_warning_desc')}
          </p>
        </div>

        <div className="space-y-10 text-gray-300 leading-relaxed">
          {/* Section 1 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 text-sm font-bold">1</span>
              {t('sec1_title')}
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">●</span>
                <p><strong className="text-white">{t('sec1_l1_title')}</strong> {t('sec1_l1_desc')}</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">●</span>
                <p><strong className="text-white">{t('sec1_l2_title')}</strong> {t('sec1_l2_desc')}</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">●</span>
                <p><strong className="text-white">{t('sec1_l3_title')}</strong> {t('sec1_l3_desc')}</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">●</span>
                <p><strong className="text-white">{t('sec1_l4_title')}</strong> {t('sec1_l4_desc')}</p>
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 text-sm font-bold">2</span>
              {t('sec2_title')}
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">●</span>
                <p><strong className="text-white">{t('sec2_l1_title')}</strong> {t('sec2_l1_desc')}</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">●</span>
                <p><strong className="text-white">{t('sec2_l2_title')}</strong> {t('sec2_l2_desc')}</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">●</span>
                <p><strong className="text-white">{t('sec2_l3_title')}</strong> {t('sec2_l3_desc')}</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">●</span>
                <p><strong className="text-white">{t('sec2_l4_title')}</strong> {t('sec2_l4_desc')}</p>
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] text-sm font-bold">3</span>
              {t('sec3_title')}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-[#0F1115] border border-white/10 rounded-xl p-5">
                <h4 className="text-white font-semibold mb-2">💰 {t('sec3_b1_title')}</h4>
                <p className="text-sm text-gray-400">{t('sec3_b1_desc')}</p>
              </div>
              <div className="bg-[#0F1115] border border-white/10 rounded-xl p-5">
                <h4 className="text-white font-semibold mb-2">📊 {t('sec3_b2_title')}</h4>
                <p className="text-sm text-gray-400">{t('sec3_b2_desc')}</p>
              </div>
              <div className="bg-[#0F1115] border border-white/10 rounded-xl p-5">
                <h4 className="text-white font-semibold mb-2">🧪 {t('sec3_b3_title')}</h4>
                <p className="text-sm text-gray-400">{t('sec3_b3_desc')}</p>
              </div>
              <div className="bg-[#0F1115] border border-white/10 rounded-xl p-5">
                <h4 className="text-white font-semibold mb-2">👨‍💼 {t('sec3_b4_title')}</h4>
                <p className="text-sm text-gray-400">{t('sec3_b4_desc')}</p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] text-sm font-bold">4</span>
              {t('sec4_title')}
            </h2>
            <div className="space-y-4 text-gray-400">
              <p>
                {t('sec4_p1')}
              </p>
              <p>
                {t('sec4_p2')}
              </p>
              <p>
                {t('sec4_p3')}
              </p>
            </div>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-wrap gap-6 text-sm text-gray-500">
          <Link href="/terms" className="hover:text-[#D4AF37] transition-colors">{tTerms('title')}</Link>
          <Link href="/privacy" className="hover:text-[#D4AF37] transition-colors">{tTerms('footer_privacy')}</Link>
          <Link href="/" className="hover:text-[#D4AF37] transition-colors">{tTerms('footer_home')}</Link>
        </div>
      </div>
    </div>
  );
}
