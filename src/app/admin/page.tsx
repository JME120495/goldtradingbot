'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useTranslations } from 'next-intl';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, CreditCard, Activity, DollarSign } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const t = useTranslations('Admin');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = Cookies.get('token');
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/admin/analytics`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || !stats) {
    return <div className="p-8 text-gray-400">Chargement des analytiques...</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <Activity className="text-[#D4AF37]" />
        Tableau de Bord
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#0F1115] border border-white/10 p-6 rounded-2xl flex items-center justify-between">
          <div>
            <h3 className="text-gray-400 mb-1">Revenu Total</h3>
            <div className="text-3xl font-bold text-[#D4AF37]">
              ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center">
            <DollarSign className="text-[#D4AF37]" />
          </div>
        </div>

        <div className="bg-[#0F1115] border border-white/10 p-6 rounded-2xl flex items-center justify-between">
          <div>
            <h3 className="text-gray-400 mb-1">Utilisateurs</h3>
            <div className="text-3xl font-bold text-white">{stats.totalUsers}</div>
          </div>
          <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
            <Users className="text-blue-500" />
          </div>
        </div>

        <div className="bg-[#0F1115] border border-white/10 p-6 rounded-2xl flex items-center justify-between">
          <div>
            <h3 className="text-gray-400 mb-1">Licences Actives</h3>
            <div className="text-3xl font-bold text-white">{stats.activeLicenses}</div>
          </div>
          <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
            <Activity className="text-green-500" />
          </div>
        </div>

        <div className="bg-[#0F1115] border border-white/10 p-6 rounded-2xl flex items-center justify-between">
          <div>
            <h3 className="text-gray-400 mb-1">Total Ventes</h3>
            <div className="text-3xl font-bold text-white">{stats.totalSales}</div>
          </div>
          <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
            <CreditCard className="text-purple-500" />
          </div>
        </div>
      </div>

      <div className="bg-[#0F1115] border border-white/10 p-6 rounded-2xl">
        <h2 className="text-xl font-bold mb-6">Revenus sur les 6 derniers mois</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="name" stroke="#ffffff50" />
              <YAxis stroke="#ffffff50" tickFormatter={(value) => `$${value}`} />
              <Tooltip 
                cursor={{ fill: '#ffffff05' }}
                contentStyle={{ backgroundColor: '#1A1D24', borderColor: '#ffffff20', borderRadius: '8px' }}
                formatter={(value: any) => {
                  const numValue = typeof value === 'number' ? value : Number(value);
                  return [`$${(numValue || 0).toFixed(2)}`, 'Revenu'];
                }}
              />
              <Bar dataKey="revenue" fill="#D4AF37" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
