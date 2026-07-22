'use client';

import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, TrendingUp, TrendingDown, Activity, AlertCircle, RefreshCw } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Trade {
  ticket: number;
  symbol: string;
  type: string;
  volume: number;
  openPrice: number;
  closePrice: number;
  openTime: string;
  closeTime: string;
  profit: number;
  commission: number;
  swap: number;
}

interface AccountStat {
  accountNumber: number;
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  updatedAt: string;
}

export default function Mt5AccountDetails() {
  const params = useParams();
  const account = params?.account as string;

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AccountStat[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && account) {
      fetchHistory();
    }
  }, [account, mounted]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? Cookies.get('token') : null;
      const res = await axios.get(`${API_URL}/api/telemetry/admin/${account}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setStats(res.data.stats || []);
      setTrades(res.data.trades || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération des données.');
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const calculatedStats = useMemo(() => {
    const totalTrades = trades.length;
    const winTrades = trades.filter((t) => t.profit > 0).length;
    const lossTrades = totalTrades - winTrades;
    const winRate = totalTrades > 0 ? (winTrades / totalTrades) * 100 : 0;
    const totalProfit = trades.reduce((acc, t) => acc + Number(t.profit || 0), 0);
    const totalCommission = trades.reduce((acc, t) => acc + Number(t.commission || 0), 0);
    const totalSwap = trades.reduce((acc, t) => acc + Number(t.swap || 0), 0);
    const netProfit = totalProfit + totalCommission + totalSwap;

    return { totalTrades, winTrades, lossTrades, winRate, totalProfit, totalCommission, totalSwap, netProfit };
  }, [trades]);

  const chartData = useMemo(() => {
    // Generate an equity curve based on closed trades
    let currentBalance = 0; // We can start at 0 to just show relative growth
    const sortedTrades = [...trades].sort((a, b) => new Date(a.closeTime).getTime() - new Date(b.closeTime).getTime());
    
    return sortedTrades.map((t) => {
      currentBalance += Number(t.profit || 0) + Number(t.commission || 0) + Number(t.swap || 0);
      return {
        date: new Date(t.closeTime).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        profit: currentBalance,
      };
    });
  }, [trades]);

  const latestStat = stats.length > 0 ? stats[0] : null;

  // Check if data is fresh (last 2 hours)
  const isDataStale = useMemo(() => {
    if (!latestStat) return true;
    const updated = new Date(latestStat.updatedAt).getTime();
    const now = new Date().getTime();
    return (now - updated) > 2 * 60 * 60 * 1000;
  }, [latestStat]);

  if (!mounted) {
    return null; // Prevents hydration mismatch with Recharts
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-2 text-[#D4AF37]">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span className="font-semibold">Chargement des données de trading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/mt5-licenses" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-gray-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Compte {account}</h1>
            <p className="text-sm text-gray-400">Historique et télémétrie MT5</p>
          </div>
        </div>
      </div>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      ) : trades.length === 0 && !latestStat ? (
        <div className="bg-[#0F1115] border border-white/10 p-16 rounded-3xl flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-4 bg-white/5 rounded-full mb-2">
            <Activity className="w-12 h-12 text-gray-500" />
          </div>
          <h2 className="text-xl font-semibold text-white">Aucune donnée reçue pour ce compte pour l'instant</h2>
          <p className="text-gray-400 max-w-md">L'Expert Advisor n'a pas encore synchronisé les données ou aucun trade n'a été fermé.</p>
        </div>
      ) : (
        <>
          {/* Bandeau Résumé */}
          <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-400 mb-1">Solde Actuel</p>
              <p className="text-2xl font-bold text-white">{latestStat?.balance ? Number(latestStat.balance).toFixed(2) : '0.00'} $</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Équité (Equity)</p>
              <p className="text-2xl font-bold text-white">{latestStat?.equity ? Number(latestStat.equity).toFixed(2) : '0.00'} $</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Marge Libre</p>
              <p className="text-2xl font-bold text-white">{latestStat?.freeMargin ? Number(latestStat.freeMargin).toFixed(2) : '0.00'} $</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Dernière Synchronisation</p>
              <div className="flex flex-col items-start gap-1">
                <p className="text-sm font-semibold text-white">
                  {latestStat?.updatedAt ? new Date(latestStat.updatedAt).toLocaleString('fr-FR') : 'Inconnue'}
                </p>
                {isDataStale && (
                  <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-0.5 rounded flex items-center gap-1 border border-orange-500/20 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    Pas de nouvelles récentes
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Statistiques Cartes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-5">
              <p className="text-sm text-gray-400 mb-1">Total Trades</p>
              <p className="text-xl font-bold text-white">{calculatedStats.totalTrades}</p>
            </div>
            <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-5">
              <p className="text-sm text-gray-400 mb-1">Win Rate</p>
              <p className="text-xl font-bold text-[#D4AF37]">{calculatedStats.winRate.toFixed(1)} %</p>
            </div>
            <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-5">
              <p className="text-sm text-gray-400 mb-1">Profit Net Total</p>
              <p className={`text-xl font-bold flex items-center gap-2 ${calculatedStats.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {calculatedStats.netProfit >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                {calculatedStats.netProfit > 0 ? '+' : ''}{calculatedStats.netProfit.toFixed(2)} $
              </p>
            </div>
            <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-5">
              <p className="text-sm text-gray-400 mb-1">Commissions & Swap</p>
              <p className="text-xl font-bold text-gray-300">
                {(calculatedStats.totalCommission + calculatedStats.totalSwap).toFixed(2)} $
              </p>
            </div>
          </div>

          {/* Graphique */}
          {chartData.length > 0 && (
            <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-6">Évolution des Gains (Cumulatif)</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} dx={-10} tickFormatter={(value) => `${value}$`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0F1115', borderColor: '#ffffff20', color: '#fff', borderRadius: '8px' }}
                      itemStyle={{ color: '#D4AF37', fontWeight: 'bold' }}
                    />
                    <Line type="monotone" dataKey="profit" stroke="#D4AF37" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#D4AF37', stroke: '#0F1115', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Tableau des trades */}
          <div className="bg-[#0F1115] border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Historique des Trades ({trades.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="p-4 text-gray-400 font-medium whitespace-nowrap">Date Clôture</th>
                    <th className="p-4 text-gray-400 font-medium whitespace-nowrap">Symbole</th>
                    <th className="p-4 text-gray-400 font-medium whitespace-nowrap">Type</th>
                    <th className="p-4 text-gray-400 font-medium whitespace-nowrap">Volume</th>
                    <th className="p-4 text-gray-400 font-medium whitespace-nowrap">Prix Open</th>
                    <th className="p-4 text-gray-400 font-medium whitespace-nowrap">Prix Close</th>
                    <th className="p-4 text-gray-400 font-medium whitespace-nowrap text-right">Profit</th>
                    <th className="p-4 text-gray-400 font-medium whitespace-nowrap text-right">Com & Swap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {trades.map((trade) => (
                    <tr key={trade.ticket} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 text-gray-300 whitespace-nowrap">
                        {new Date(trade.closeTime).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="p-4 font-semibold text-white">{trade.symbol}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wide uppercase ${trade.type.includes('BUY') ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'}`}>
                          {trade.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-gray-300">{Number(trade.volume).toFixed(2)}</td>
                      <td className="p-4 text-gray-400">{Number(trade.openPrice).toFixed(2)}</td>
                      <td className="p-4 text-gray-400">{Number(trade.closePrice).toFixed(2)}</td>
                      <td className={`p-4 font-bold text-right whitespace-nowrap ${trade.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {trade.profit > 0 ? '+' : ''}{Number(trade.profit).toFixed(2)} $
                      </td>
                      <td className="p-4 text-gray-500 text-xs text-right whitespace-nowrap">
                        {Number(trade.commission).toFixed(2)} / {Number(trade.swap).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {trades.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-500">Aucun trade à afficher.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
