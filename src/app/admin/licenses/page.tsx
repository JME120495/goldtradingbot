'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslations } from 'next-intl';

export default function AdminLicenses() {
  const [licenses, setLicenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations('Admin');

  useEffect(() => {
    fetchLicenses();
  }, []);

  const fetchLicenses = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || '/_/backend'}` + '/admin/licenses');
      setLicenses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'CANCELLED' : 'ACTIVE';
    if(!confirm(`${newStatus === 'CANCELLED' ? 'Annuler' : 'Activer'} cette licence ?`)) return;
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL || '/_/backend'}/admin/licenses/${id}/status`, { status: newStatus });
      fetchLicenses();
    } catch (err) {
      alert("Error updating status");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('manage_licenses')}</h1>
      
      <div className="bg-[#0F1115] border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="p-4 text-gray-400">{t('user')}</th>
              <th className="p-4 text-gray-400">{t('plan')}</th>
              <th className="p-4 text-gray-400">{t('lot_allowed')}</th>
              <th className="p-4 text-gray-400">{t('status')}</th>
              <th className="p-4 text-gray-400">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {loading ? (
              <tr><td colSpan={5} className="p-4 text-center">{t('loading')}</td></tr>
            ) : licenses.map((lic) => (
              <tr key={lic.id} className="hover:bg-white/5">
                <td className="p-4">{lic.user?.name || lic.user?.email}</td>
                <td className="p-4">{lic.plan?.name}</td>
                <td className="p-4">{lic.plan?.lotAllowed}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${lic.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {lic.status === 'CANCELLED' ? 'ANNULÉ' : lic.status}
                  </span>
                </td>
                <td className="p-4">
                  <button 
                    onClick={() => toggleStatus(lic.id, lic.status)} 
                    className={`font-semibold ${lic.status === 'ACTIVE' ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'}`}
                  >
                    {lic.status === 'ACTIVE' ? 'Annuler' : 'Activer'}
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
