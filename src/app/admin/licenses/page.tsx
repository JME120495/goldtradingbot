'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslations } from 'next-intl';

export default function AdminLicenses() {
  const [licenses, setLicenses] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations('Admin');

  useEffect(() => {
    fetchLicenses();
    fetchPlans();
  }, []);

  const fetchLicenses = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/admin/licenses`);
      setLicenses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/admin/plans`);
      setPlans(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'CANCELLED' : 'ACTIVE';
    if(!confirm(`${newStatus === 'CANCELLED' ? 'Annuler' : 'Activer'} cette licence ?`)) return;
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/admin/licenses/${id}/status`, { status: newStatus });
      fetchLicenses();
    } catch (err) {
      alert("Error updating status");
    }
  };

  const addLicenseManually = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');
    const planId = formData.get('planId');
    const durationDays = formData.get('durationDays');
    if (!email || !planId) return;

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/admin/licenses`, { 
        email, 
        planId, 
        durationDays: parseInt(durationDays as string, 10) 
      });
      fetchLicenses();
      (e.target as HTMLFormElement).reset();
      alert('License added successfully');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error adding license. Ensure user exists.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-3xl font-bold">{t('manage_licenses')}</h1>
        <form onSubmit={addLicenseManually} className="flex gap-2 flex-wrap bg-[#0F1115] p-4 rounded-xl border border-white/10">
          <input 
            type="email" 
            name="email" 
            placeholder="User Email" 
            required 
            className="bg-black border border-white/20 rounded-lg px-4 py-2 text-white outline-none focus:border-[#D4AF37]"
          />
          <select 
            name="planId" 
            required
            className="bg-black border border-white/20 rounded-lg px-4 py-2 text-white outline-none focus:border-[#D4AF37]"
          >
            <option value="">Sélectionner un Plan</option>
            {plans.map(plan => (
              <option key={plan.id} value={plan.id}>{plan.product.name} - {plan.name} (Lot: {plan.lotAllowed})</option>
            ))}
          </select>
          <input 
            type="number" 
            name="durationDays" 
            placeholder="Durée (Jours, 0 = à vie)" 
            defaultValue="30"
            required 
            className="bg-black border border-white/20 rounded-lg px-4 py-2 text-white outline-none focus:border-[#D4AF37] w-48"
          />
          <button type="submit" className="bg-[#D4AF37] text-black font-bold px-4 py-2 rounded-lg hover:bg-[#AA8B2C] transition-colors">
            Ajouter manuellement
          </button>
        </form>
      </div>
      
      <div className="bg-[#0F1115] border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="p-4 text-gray-400">{t('user')}</th>
              <th className="p-4 text-gray-400">{t('plan')}</th>
              <th className="p-4 text-gray-400">{t('lot_allowed')}</th>
              <th className="p-4 text-gray-400">Expire le</th>
              <th className="p-4 text-gray-400">{t('status')}</th>
              <th className="p-4 text-gray-400">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {loading ? (
              <tr><td colSpan={6} className="p-4 text-center">{t('loading')}</td></tr>
            ) : licenses.map((lic) => (
              <tr key={lic.id} className="hover:bg-white/5">
                <td className="p-4">{lic.user?.name || lic.user?.email}</td>
                <td className="p-4">{lic.plan?.name}</td>
                <td className="p-4">{lic.plan?.lotAllowed}</td>
                <td className="p-4">{lic.expiresAt ? new Date(lic.expiresAt).toLocaleDateString() : 'À vie'}</td>
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
