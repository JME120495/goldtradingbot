'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import backtest from '@/data/backtests/goldai.json';

// Mark colors validated against the card surface #0F1115 (lightness band, CVD, contrast)
const GAIN = '#B3902D';
const LOSS = '#E05A7A';
const LOTS = [0.01, 0.05, 0.1];

export default function GoldAiBacktest() {
  const t = useTranslations('Backtest');
  const locale = useLocale();
  const [lot, setLot] = useState(backtest.testedLot);
  const scale = lot / backtest.testedLot; // fixed-lot tests: money values scale linearly with the lot

  const money = (v: number) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', currencyDisplay: 'narrowSymbol', maximumFractionDigits: Math.abs(v) < 100 ? 2 : 0 }).format(v);
  const signed = (v: number) => `${v > 0 ? '+' : ''}${money(v)}`;
  const day = (d: string) => {
    const s = new Date(`${d}T00:00:00Z`).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
    return locale.startsWith('fr') ? s.replace(/^1 /, '1er ') : s; // "1er janvier"
  };
  const monthName = (m: string) =>
    new Date(`${m}-01T00:00:00Z`).toLocaleDateString(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' });

  // Scenario 1: robot started on the 1st and stopped at month end (one test per month)
  const months = backtest.monthly.map((m) => ({ month: m.month, v: m.netProfit * scale }));
  const maxAbs = Math.max(...months.map((m) => Math.abs(m.v)));
  const monthsTotal = months.reduce((s, m) => s + m.v, 0);
  const positiveMonths = months.filter((m) => m.v > 0).length;
  const monthsTrades = backtest.monthly.reduce((s, m) => s + m.trades, 0);

  // Scenario 2: robot left running without interruption over the whole period
  const continuous = backtest.continuous;

  return (
    <section id="backtest" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/5">
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t('title')}</h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">{t('subtitle')}</p>
      </div>

      {/* Lot size: every amount below follows it */}
      <div className="flex flex-col items-center gap-2 mb-12">
        <span className="text-sm text-gray-400">{t('lot_label')}</span>
        <div className="bg-[#0F1115] border border-white/10 rounded-xl p-1 inline-flex gap-1">
          {LOTS.map((l) => (
            <button
              key={l}
              onClick={() => setLot(l)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                lot === l ? 'bg-[#D4AF37] text-black shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {l.toLocaleString(locale, { minimumFractionDigits: 2 })}
              {l === backtest.testedLot && <span className="ml-1 text-xs opacity-70">({t('tested')})</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Scenario 1: month by month */}
      <h3 className="text-xl sm:text-2xl font-bold mb-2">{t('monthly_heading')}</h3>
      <p className="text-gray-400 mb-6">{t('monthly_intro', { deposit: money(backtest.deposit) })}</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {months.map((m) => (
          <div key={m.month} className="p-5 rounded-2xl bg-[#0F1115] border border-white/5">
            <div className="text-sm text-gray-400 mb-1 capitalize">{monthName(m.month)}</div>
            <div className="text-xl sm:text-2xl font-semibold text-white">{signed(m.v)}</div>
            {/* Magnitude bar: colored mark beside the (sign-carrying) value */}
            <div className="mt-3 h-1.5 rounded-full bg-white/5">
              <div
                className="h-1.5 rounded-full"
                style={{ width: `${Math.max(3, (Math.abs(m.v) / maxAbs) * 100)}%`, backgroundColor: m.v >= 0 ? GAIN : LOSS }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 p-5 rounded-2xl bg-[#0F1115] border border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="text-gray-300">{t('monthly_total_label', { count: months.length })}</div>
        <div className="text-2xl sm:text-3xl font-bold text-white">{signed(monthsTotal)}</div>
        <div className="text-sm text-gray-400">
          {t('total_details', { positive: positiveMonths, count: months.length, trades: monthsTrades })}
        </div>
      </div>

      {/* Scenario 2: without interruption */}
      <h3 className="text-xl sm:text-2xl font-bold mt-14 mb-2">{t('continuous_heading')}</h3>
      <p className="text-gray-400 mb-6">{t('continuous_intro', { from: day(continuous.from), to: day(continuous.to) })}</p>
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#1c1a14] to-[#0F1115] border border-[#D4AF37]/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="text-gray-300">{t('continuous_label')}</div>
        <div className="text-3xl sm:text-4xl font-bold text-white">{signed(continuous.netProfit * scale)}</div>
        <div className="text-sm text-gray-400">{t('continuous_details', { trades: continuous.trades })}</div>
      </div>

      {/* Downloadable MT5 reports (cleaned copies: robot settings hidden) */}
      <h3 className="text-xl sm:text-2xl font-bold mt-14 mb-2">{t('downloads_heading')}</h3>
      <p className="text-gray-400 mb-6">{t('downloads_intro')}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {backtest.monthly.map((m) => (
          <a
            key={m.month}
            href={(backtest.downloads.monthly as Record<string, string>)[m.month]}
            download
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#0F1115] border border-white/10 hover:border-[#D4AF37]/50 text-sm text-gray-200 transition-colors"
          >
            <svg className="w-4 h-4 text-[#D4AF37] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="capitalize">{monthName(m.month)}</span>
          </a>
        ))}
      </div>
      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        <a
          href={backtest.downloads.continuous}
          download
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0F1115] border border-[#D4AF37]/40 hover:border-[#D4AF37] text-sm text-gray-200 transition-colors"
        >
          <svg className="w-4 h-4 text-[#D4AF37] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {t('download_continuous', { from: day(continuous.from), to: day(continuous.to) })}
        </a>
        <a
          href={backtest.downloads.all}
          download
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#D4AF37] text-black font-bold hover:bg-[#AA8B2C] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {t('download_all')}
        </a>
      </div>

      <div className="mt-10 space-y-3 text-sm text-gray-400 max-w-4xl">
        <p>
          {t('conditions', {
            symbol: backtest.symbol,
            timeframe: backtest.timeframe,
            broker: backtest.broker,
            deposit: money(backtest.deposit),
            lot: backtest.testedLot.toLocaleString(locale, { minimumFractionDigits: 2 }),
          })}
        </p>
        <p className="text-gray-500 italic">{t('disclaimer')}</p>
      </div>
    </section>
  );
}
