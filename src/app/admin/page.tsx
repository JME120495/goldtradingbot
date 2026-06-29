'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface Plan {
  id: string;
  name: string;
  lotAllowed: number;
  prices: string; // JSON
  productId: string;
}

export default function AdminDashboard() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}`}` + '/plans');
        setPlans(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-[#0F1115] border border-white/10 p-6 rounded-2xl">
          <h3 className="text-gray-400 mb-2">Total Plans</h3>
          <div className="text-4xl font-bold text-[#D4AF37]">{plans.length}</div>
        </div>
        <div className="bg-[#0F1115] border border-white/10 p-6 rounded-2xl">
          <h3 className="text-gray-400 mb-2">Total Revenue (Mock)</h3>
          <div className="text-4xl font-bold text-white">$12,450</div>
        </div>
        <div className="bg-[#0F1115] border border-white/10 p-6 rounded-2xl">
          <h3 className="text-gray-400 mb-2">Active Clients (Mock)</h3>
          <div className="text-4xl font-bold text-white">142</div>
        </div>
      </div>

      <div className="bg-[#0F1115] border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-xl font-bold">Plan Configurations</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="p-4 font-medium text-gray-400">Plan Name</th>
                <th className="p-4 font-medium text-gray-400">Lot Limit</th>
                <th className="p-4 font-medium text-gray-400">Weekly Price</th>
                <th className="p-4 font-medium text-gray-400">Monthly Price</th>
                <th className="p-4 font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">Loading plans...</td>
                </tr>
              ) : plans.map((plan) => {
                let prices: any = {};
                try { prices = JSON.parse(plan.prices); } catch {}
                
                return (
                  <tr key={plan.id} className="hover:bg-white/5">
                    <td className="p-4 font-medium text-[#D4AF37]">{plan.name}</td>
                    <td className="p-4">{plan.lotAllowed.toFixed(2)}</td>
                    <td className="p-4">${prices.weekly || 0}</td>
                    <td className="p-4">${prices.monthly || 0}</td>
                    <td className="p-4">
                      <button className="text-sm text-blue-400 hover:text-blue-300 mr-4">Edit</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
