'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useTranslations } from 'next-intl';

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [txHashInput, setTxHashInput] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const token = Cookies.get('adminToken') || Cookies.get('token');
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "/api"}/admin/withdrawals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWithdrawals(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const token = Cookies.get('adminToken') || Cookies.get('token');
      const txHash = txHashInput[id] || '';
      
      if (status === 'COMPLETED' && !txHash) {
        if (!confirm('Êtes-vous sûr de marquer comme payé SANS hash de transaction ?')) {
          return;
        }
      }

      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL || "/api"}/admin/withdrawals/${id}/status`, {
        status,
        txHash
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Statut mis à jour');
      fetchWithdrawals();
    } catch (err) {
      alert('Erreur lors de la mise à jour');
    }
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Demandes de Retrait (Affiliation)</h1>
      
      <div className="bg-[#0F1115] border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-black/50">
            <tr>
              <th className="p-4 font-medium text-gray-400">Date</th>
              <th className="p-4 font-medium text-gray-400">Parrain</th>
              <th className="p-4 font-medium text-gray-400">Portefeuille</th>
              <th className="p-4 font-medium text-gray-400">Montant</th>
              <th className="p-4 font-medium text-gray-400">Statut</th>
              <th className="p-4 font-medium text-gray-400">TxHash & Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {withdrawals.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">Aucune demande de retrait</td></tr>
            ) : (
              withdrawals.map((w: any) => (
                <tr key={w.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 text-sm text-gray-400">
                    {new Date(w.createdAt).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <div className="font-bold">{w.affiliate.user.name}</div>
                    <div className="text-sm text-gray-400">{w.affiliate.user.email}</div>
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-xs bg-black px-2 py-1 rounded select-all border border-white/10">
                      {w.affiliate.walletAddress || 'Non défini'}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-[#D4AF37]">
                    ${w.amount.toFixed(2)}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      w.status === 'COMPLETED' ? 'bg-green-500/20 text-green-500' :
                      w.status === 'REJECTED' ? 'bg-red-500/20 text-red-500' :
                      'bg-yellow-500/20 text-yellow-500'
                    }`}>
                      {w.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {w.status === 'PENDING' ? (
                      <div className="flex items-center gap-2">
                        <input 
                          type="text" 
                          placeholder="TxHash..."
                          className="bg-black border border-white/10 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#D4AF37]"
                          value={txHashInput[w.id] || ''}
                          onChange={(e) => setTxHashInput({...txHashInput, [w.id]: e.target.value})}
                        />
                        <button 
                          onClick={() => updateStatus(w.id, 'COMPLETED')}
                          className="px-3 py-1 bg-green-500/20 text-green-500 rounded hover:bg-green-500/30 transition-colors text-xs"
                        >
                          Valider
                        </button>
                        <button 
                          onClick={() => updateStatus(w.id, 'REJECTED')}
                          className="px-3 py-1 bg-red-500/20 text-red-500 rounded hover:bg-red-500/30 transition-colors text-xs"
                        >
                          Rejeter
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs font-mono text-gray-500">
                        {w.txHash || '-'}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
