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
      const res = await axios.get('http://127.0.0.1:3000/admin/affiliates');
      setAffiliates(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateRate = async (id: string, rate: number) => {
    try {
      await axios.patch(`http://127.0.0.1:3000/admin/affiliates/${id}/commission`, { rate });
      fetchAffiliates();
    } catch (err) {
      alert("Error updating rate");
    }
  };

  const deleteAffiliate = async (id: string) => {
    if(!confirm(t('confirm_delete_affiliate'))) return;
    try {
      await axios.delete(`http://127.0.0.1:3000/admin/affiliates/${id}`);
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
                  <button onClick={() => deleteAffiliate(aff.id)} className="text-red-400 hover:text-red-300">
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
