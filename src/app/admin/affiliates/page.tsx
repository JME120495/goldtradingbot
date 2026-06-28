'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslations } from 'next-intl';

export default function AdminAffiliates() {
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations('Admin');

  useEffect(() => {
    fetchAffiliates();
  }, []);

  const fetchAffiliates = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}` + '/admin/affiliates');
      setAffiliates(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateRate = async (id: string, rate: number) => {
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/admin/affiliates/${id}/commission`, { rate });
      fetchAffiliates();
    } catch (err) {
      alert("Error updating rate");
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/admin/affiliates/${id}/status`, { status });
      fetchAffiliates();
    } catch (err) {
      alert("Error updating status");
    }
  };

  const deleteAffiliate = async (id: string) => {
    if(!confirm(t('confirm_delete_affiliate'))) return;
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/admin/affiliates/${id}`);
      fetchAffiliates();
    } catch (err) {
      alert("Error deleting affiliate");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('manage_affiliates')}</h1>
      
      <div className="bg-[#0F1115] border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="p-4 text-gray-400">{t('affiliate_name')}</th>
              <th className="p-4 text-gray-400">{t('code')}</th>
              <th className="p-4 text-gray-400">{t('total_earned')}</th>
              <th className="p-4 text-gray-400">{t('commission_rate')} (%)</th>
              <th className="p-4 text-gray-400">Statut</th>
              <th className="p-4 text-gray-400">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {loading ? (
              <tr><td colSpan={5} className="p-4 text-center">{t('loading')}</td></tr>
            ) : affiliates.map((aff) => (
              <tr key={aff.id} className="hover:bg-white/5">
                <td className="p-4">{aff.user?.name || aff.user?.email}</td>
                <td className="p-4 font-mono text-[#D4AF37]">{aff.code}</td>
                <td className="p-4">${aff.totalEarned.toFixed(2)}</td>
                <td className="p-4">
                  <input 
                    type="number" 
                    defaultValue={aff.commissionRate}
                    onBlur={(e) => updateRate(aff.id, parseFloat(e.target.value))}
                    className="bg-black border border-white/20 rounded px-2 py-1 w-20 text-white"
                  />
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    aff.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                    aff.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {aff.status || 'PENDING'}
                  </span>
                </td>
                <td className="p-4 flex gap-2">
                  {aff.status !== 'APPROVED' && (
                    <button onClick={() => updateStatus(aff.id, 'APPROVED')} className="text-green-400 hover:text-green-300 font-semibold">
                      Approuver
                    </button>
                  )}
                  {aff.status !== 'REJECTED' && (
                    <button onClick={() => updateStatus(aff.id, 'REJECTED')} className="text-orange-400 hover:text-orange-300 font-semibold">
                      Rejeter
                    </button>
                  )}
                  <button onClick={() => deleteAffiliate(aff.id)} className="text-red-400 hover:text-red-300 font-semibold">
                    {t('delete')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
