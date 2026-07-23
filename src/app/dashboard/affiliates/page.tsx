'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useTranslations } from 'next-intl';
import { Share2, TrendingUp, Users, Copy, Wallet, ArrowUpRight } from 'lucide-react';

export default function AffiliatesDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false);
  const router = useRouter();
  const t = useTranslations('Dashboard');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = Cookies.get('token');
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "/api"}`}` + '/affiliates/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
        if (res.data?.affiliate?.walletAddress) {
          setWalletAddress(res.data.affiliate.walletAddress);
        }
        if (res.data?.availableBalance) {
          setWithdrawAmount(res.data.availableBalance.toString());
        }
      } catch (err: any) {
        // Handle error or not joined
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const joinAffiliateProgram = async () => {
    try {
      const token = Cookies.get('token');
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "/api"}`}` + '/affiliates/join', {}, {
         headers: { Authorization: `Bearer ${token}` }
      });
      window.location.reload();
    } catch(e) {
      alert('Error joining program');
    }
  };

  const copyLink = () => {
    if (stats?.affiliate?.code) {
      navigator.clipboard.writeText(`https://goldtradingbot.com/?refcode=${stats.affiliate.code}`);
      alert('Referral link copied!');
    }
  };

  const handleUpdateWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = Cookies.get('token');
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL || "/api"}/affiliates/wallet`, { walletAddress }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Adresse de portefeuille mise à jour avec succès !');
    } catch (err) {
      alert('Erreur lors de la mise à jour du portefeuille.');
    }
  };

  const handleWithdrawRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount < 50) {
      return alert('Le montant minimum de retrait est de 50$.');
    }
    if (amount > stats.availableBalance) {
      return alert('Fonds insuffisants.');
    }
    if (!walletAddress) {
      return alert('Veuillez configurer votre adresse de portefeuille avant de retirer.');
    }

    setSubmittingWithdraw(true);
    try {
      const token = Cookies.get('token');
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "/api"}/affiliates/withdraw`, { amount }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Demande de retrait envoyée !');
      window.location.reload();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la demande de retrait.');
    } finally {
      setSubmittingWithdraw(false);
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">{t('affiliates')}</h1>
      
      {!stats?.affiliate ? (
        <div className="bg-[#0F1115] border border-[#D4AF37]/30 p-8 rounded-2xl text-center">
          <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{t('become_partner')}</h2>
          <button 
            onClick={joinAffiliateProgram}
            className="px-6 py-3 bg-[#D4AF37] text-black font-bold rounded-lg hover:bg-[#AA8B2C] transition-colors mt-4"
          >
            {t('become_partner')}
          </button>
        </div>
      ) : stats.affiliate.status === 'PENDING' ? (
        <div className="bg-[#0F1115] border border-yellow-500/30 p-8 rounded-2xl text-center">
          <h2 className="text-2xl font-bold mb-2 text-yellow-500">Demande en attente</h2>
          <p className="text-gray-400">Votre demande d'affiliation est en cours d'examen par un administrateur.</p>
        </div>
      ) : stats.affiliate.status === 'REJECTED' ? (
        <div className="bg-[#0F1115] border border-red-500/30 p-8 rounded-2xl text-center">
          <h2 className="text-2xl font-bold mb-2 text-red-500">Demande refusée</h2>
          <p className="text-gray-400">Malheureusement, votre demande d'affiliation a été refusée.</p>
        </div>
      ) : (
        <>
          <div className="bg-[#0F1115] border border-white/10 p-6 rounded-2xl flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-wider text-[#D4AF37]">PARTNER</h2>
              <p className="opacity-80">Vous gagnez des commissions sur les achats de vos filleuls (15% sur les abonnements hebdomadaires, 10% sur les autres).</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80 mb-1">{t('your_affiliate_link')}</p>
              <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-lg border border-white/10">
                <span className="font-mono text-[#D4AF37]">goldtradingbot.com/?refcode={stats.affiliate.code}</span>
                <button onClick={copyLink} className="hover:text-white transition-colors"><Copy size={16}/></button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[#0F1115] border border-white/10 p-6 rounded-2xl flex items-center gap-4">
              <div className="p-4 bg-[#D4AF37]/10 text-[#D4AF37] rounded-xl"><Users /></div>
              <div>
                <h3 className="text-gray-400 font-medium">Link Clicks</h3>
                <div className="text-2xl font-bold text-white">{stats.affiliate.clicks}</div>
              </div>
            </div>
            <div className="bg-[#0F1115] border border-white/10 p-6 rounded-2xl flex items-center gap-4">
              <div className="p-4 bg-green-500/10 text-green-500 rounded-xl"><TrendingUp /></div>
              <div>
                <h3 className="text-gray-400 font-medium">{t('sales')}</h3>
                <div className="text-2xl font-bold text-white">{stats.sales?.length || 0}</div>
              </div>
            </div>
            <div className="bg-[#0F1115] border border-white/10 p-6 rounded-2xl flex items-center gap-4">
              <div className="p-4 bg-blue-500/10 text-blue-500 rounded-xl"><Share2 /></div>
              <div>
                <h3 className="text-gray-400 font-medium">Commissions Totales</h3>
                <div className="text-2xl font-bold text-[#D4AF37]">${(stats.totalEarned || 0).toFixed(2)}</div>
              </div>
            </div>
            <div className="bg-[#0F1115] border border-white/10 p-6 rounded-2xl flex items-center gap-4">
              <div className="p-4 bg-purple-500/10 text-purple-500 rounded-xl"><Wallet /></div>
              <div>
                <h3 className="text-gray-400 font-medium">Solde Disponible</h3>
                <div className="text-2xl font-bold text-green-400">${(stats.availableBalance || 0).toFixed(2)}</div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="bg-[#0F1115] border border-white/10 p-6 rounded-2xl">
              <h3 className="text-xl font-bold mb-4 text-[#D4AF37]">Portefeuille de Retrait</h3>
              <form onSubmit={handleUpdateWallet} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Adresse (USDT TRC20, BTC, etc.)</label>
                  <input 
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]"
                    placeholder="Votre adresse crypto..."
                    required
                  />
                </div>
                <button type="submit" className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm">
                  Sauvegarder l'adresse
                </button>
              </form>
            </div>

            <div className="bg-[#0F1115] border border-white/10 p-6 rounded-2xl">
              <h3 className="text-xl font-bold mb-4 text-[#D4AF37]">Demander un Retrait</h3>
              <form onSubmit={handleWithdrawRequest} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Montant ($)</label>
                  <input 
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    min="50"
                    max={stats.availableBalance || 0}
                    step="0.01"
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">Minimum de retrait : 50$</p>
                </div>
                <button 
                  type="submit" 
                  disabled={submittingWithdraw || stats.availableBalance < 50}
                  className="w-full px-4 py-3 bg-[#D4AF37] text-black font-bold rounded-xl hover:bg-[#AA8B2C] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <ArrowUpRight size={18} />
                  {submittingWithdraw ? 'Envoi...' : 'Retirer mes gains'}
                </button>
              </form>
            </div>
          </div>

          <div className="mt-12 bg-[#0F1115] border border-white/10 p-6 rounded-2xl">
            <h3 className="text-xl font-bold mb-6 text-[#D4AF37]">Historique des Retraits</h3>
            {stats.withdrawals && stats.withdrawals.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400">
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Montant</th>
                      <th className="pb-3 font-medium">Statut</th>
                      <th className="pb-3 font-medium">TxHash</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.withdrawals.map((w: any) => (
                      <tr key={w.id} className="border-b border-white/5">
                        <td className="py-4 text-gray-400">{new Date(w.createdAt).toLocaleDateString()}</td>
                        <td className="py-4 font-bold text-white">${w.amount.toFixed(2)}</td>
                        <td className="py-4">
                          <span className={`px-3 py-1 rounded-full text-xs ${
                            w.status === 'COMPLETED' ? 'bg-green-500/20 text-green-500' :
                            w.status === 'REJECTED' ? 'bg-red-500/20 text-red-500' :
                            'bg-yellow-500/20 text-yellow-500'
                          }`}>
                            {w.status}
                          </span>
                        </td>
                        <td className="py-4 text-xs text-gray-500 font-mono">
                          {w.txHash || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">Aucun retrait pour le moment.</p>
            )}
          </div>

          <div className="mt-12 bg-[#0F1115] border border-white/10 p-6 rounded-2xl">
            <h3 className="text-xl font-bold mb-6 text-[#D4AF37]">Utilisateurs parrainés</h3>
            {stats.referredUsers && stats.referredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400">
                      <th className="pb-3 font-medium">Nom</th>
                      <th className="pb-3 font-medium">Email</th>
                      <th className="pb-3 font-medium">Date d'inscription</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.referredUsers.map((u: any, idx: number) => (
                      <tr key={idx} className="border-b border-white/5">
                        <td className="py-4">{u.name || '-'}</td>
                        <td className="py-4 text-gray-400">{u.email}</td>
                        <td className="py-4 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">Vous n'avez parrainé personne pour le moment.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
