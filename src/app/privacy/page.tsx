'use client';
import Link from "next/link";

import { useTranslations } from "next-intl";

export default function PrivacyPage() {
  const t = useTranslations('Privacy');
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

        <div className="space-y-10 text-gray-300 leading-relaxed">
          {/* Section 1 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] text-sm font-bold">1</span>
              {t('sec1_title')}
            </h2>
            <p>
              {t('sec1_p1')}
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2 text-gray-400">
              <li><strong className="text-white">{t('sec1_l1_title')}</strong>{t('sec1_l1_desc')}</li>
              <li><strong className="text-white">{t('sec1_l2_title')}</strong>{t('sec1_l2_desc')}</li>
              <li><strong className="text-white">{t('sec1_l3_title')}</strong>{t('sec1_l3_desc')}</li>
              <li><strong className="text-white">{t('sec1_l4_title')}</strong>{t('sec1_l4_desc')}</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] text-sm font-bold">2</span>
              {t('sec2_title')}
            </h2>
            <p>{t('sec2_p1')}</p>
            <ul className="list-disc list-inside mt-3 space-y-2 text-gray-400">
              <li>{t('sec2_l1')}</li>
              <li>{t('sec2_l2')}</li>
              <li>{t('sec2_l3')}</li>
              <li>{t('sec2_l4')}</li>
              <li>{t('sec2_l5')}</li>
            </ul>
            <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-xl p-4 mt-4">
              <p className="text-[#D4AF37] font-semibold mb-1">🔒 {t('sec2_commitment')}</p>
              <p className="text-sm">
                {t('sec2_commitment_desc')}
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] text-sm font-bold">3</span>
              {t('sec3_title')}
            </h2>
            <p>
              {t('sec3_p1')}
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2 text-gray-400">
              <li>{t('sec3_l1')}</li>
              <li>{t('sec3_l2')}</li>
              <li>{t('sec3_l3')}</li>
              <li>{t('sec3_l4')}</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] text-sm font-bold">4</span>
              {t('sec4_title')}
            </h2>
            <p>
              {t('sec4_p1')}
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] text-sm font-bold">5</span>
              {t('sec5_title')}
            </h2>
            <p>{t('sec5_p1')}</p>
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="bg-[#0F1115] border border-white/10 rounded-xl p-4">
                <h4 className="text-white font-semibold mb-1">📋 {t('sec5_b1_title')}</h4>
                <p className="text-sm text-gray-400">{t('sec5_b1_desc')}</p>
              </div>
              <div className="bg-[#0F1115] border border-white/10 rounded-xl p-4">
                <h4 className="text-white font-semibold mb-1">✏️ {t('sec5_b2_title')}</h4>
                <p className="text-sm text-gray-400">{t('sec5_b2_desc')}</p>
              </div>
              <div className="bg-[#0F1115] border border-white/10 rounded-xl p-4">
                <h4 className="text-white font-semibold mb-1">🗑️ {t('sec5_b3_title')}</h4>
                <p className="text-sm text-gray-400">{t('sec5_b3_desc')}</p>
              </div>
              <div className="bg-[#0F1115] border border-white/10 rounded-xl p-4">
                <h4 className="text-white font-semibold mb-1">📦 {t('sec5_b4_title')}</h4>
                <p className="text-sm text-gray-400">{t('sec5_b4_desc')}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-400">
              {t('sec5_p2')}
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] text-sm font-bold">6</span>
              {t('sec6_title')}
            </h2>
            <p>
              {t('sec6_p1')}
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] text-sm font-bold">7</span>
              {t('sec7_title')}
            </h2>
            <p>
              {t('sec7_p1')}
            </p>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-wrap gap-6 text-sm text-gray-500">
          <Link href="/terms" className="hover:text-[#D4AF37] transition-colors">{tTerms('title')}</Link>
          <Link href="/risk" className="hover:text-[#D4AF37] transition-colors">{tTerms('footer_risk')}</Link>
          <Link href="/" className="hover:text-[#D4AF37] transition-colors">{tTerms('footer_home')}</Link>
        </div>
      </div>
    </div>
  );
}
