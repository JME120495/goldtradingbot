'use client';
import Link from "next/link";

import { useTranslations } from "next-intl";

export default function TermsPage() {
  const t = useTranslations('Terms');
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
              ← {t('back_home')}
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold mb-2">{t('title')}</h1>
        <p className="text-gray-500 text-sm mb-12">{t('last_updated')}</p>

        <div className="space-y-10 text-gray-300 leading-relaxed">
          {/* Article 1 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] text-sm font-bold">1</span>
              {t('art1_title')}
            </h2>
            <p>
              {t('art1_p1')}
            </p>
            <p className="mt-3">
              {t('art1_p2')}
            </p>
          </section>

          {/* Article 2 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] text-sm font-bold">2</span>
              {t('art2_title')}
            </h2>
            <p>
              {t('art2_p1')}
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2 text-gray-400">
              <li>{t('art2_l1')}</li>
              <li>{t('art2_l2')}</li>
              <li>{t('art2_l3')}</li>
            </ul>
          </section>

          {/* Article 3 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] text-sm font-bold">3</span>
              {t('art3_title')}
            </h2>
            <p>
              {t('art3_p1')}
            </p>
            <p className="mt-3">
              {t('art3_p2')}
            </p>
          </section>

          {/* Article 4 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] text-sm font-bold">4</span>
              {t('art4_title')}
            </h2>
            <p>
              {t('art4_p1')}
            </p>
          </section>

          {/* Article 5 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] text-sm font-bold">5</span>
              {t('art5_title')}
            </h2>
            <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-xl p-4">
              <p className="text-[#D4AF37] font-semibold mb-2">⚠️ {t('art5_important')}</p>
              <p>
                {t('art5_p1')}
              </p>
            </div>
            <p className="mt-3">
              {t('art5_p2')}
            </p>
          </section>

          {/* Article 6 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] text-sm font-bold">6</span>
              {t('art6_title')}
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li>{t('art6_l1')}</li>
              <li>{t('art6_l2')}</li>
              <li>{t('art6_l3')}</li>
              <li>{t('art6_l4')}</li>
            </ul>
          </section>

          {/* Article 7 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] text-sm font-bold">7</span>
              {t('art7_title')}
            </h2>
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
              <p className="text-red-400 font-semibold mb-2">🔴 {t('art7_warning')}</p>
              <p>
                {t('art7_p1')}
              </p>
            </div>
            <p className="mt-3">
              {t('art7_p2')}
            </p>
          </section>

          {/* Article 8 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] text-sm font-bold">8</span>
              {t('art8_title')}
            </h2>
            <p>
              {t('art8_p1')}
            </p>
          </section>

          {/* Article 9 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] text-sm font-bold">9</span>
              {t('art9_title')}
            </h2>
            <p>
              {t('art9_p1')}
            </p>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-wrap gap-6 text-sm text-gray-500">
          <Link href="/privacy" className="hover:text-[#D4AF37] transition-colors">{t('footer_privacy')}</Link>
          <Link href="/risk" className="hover:text-[#D4AF37] transition-colors">{t('footer_risk')}</Link>
          <Link href="/" className="hover:text-[#D4AF37] transition-colors">{t('footer_home')}</Link>
        </div>
      </div>
    </div>
  );
}
