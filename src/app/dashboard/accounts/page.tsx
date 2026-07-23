'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

import { useTranslations } from 'next-intl';

export default function AccountsPage() {
  const t = useTranslations('DashboardAccounts');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [accountNumber, setAccountNumber] = useState('');
  const [broker, setBroker] = useState('Fusion Markets');
  const [server, setServer] = useState('');

  const fetchAccounts = async () => {
    try {
      const token = Cookies.get('token');
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "/api"}`}` + '/trading-accounts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAccounts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber || !broker) return;
    
    setSubmitting(true);
    setError('');
    
    try {
      const token = Cookies.get('token');
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "/api"}`}` + '/trading-accounts', {
        accountNumber,
        broker,
        server
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAccountNumber('');
      setBroker('');
      setServer('');
      await fetchAccounts();
    } catch (err: any) {
      setError(err.response?.data?.message || t('err_adding'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirm_delete'))) return;
    
    try {
      const token = Cookies.get('token');
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "/api"}`}/trading-accounts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchAccounts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-gray-400">{t('desc')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-8 h-fit">
          <h2 className="text-xl font-bold mb-6">{t('add_new')}</h2>
          {error && <div className="bg-red-500/10 text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>}
          <form className="space-y-4" onSubmit={handleAddAccount}>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">{t('account_number')}</label>
              <input 
                type="text" 
                required
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]"
                placeholder="e.g. 12345678"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">{t('broker_name')}</label>
              <input 
                type="text" 
                disabled
                value="Fusion Markets"
                className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-[#D4AF37]/70 mt-2">{t('broker_note')}</p>
            </div>
            <button 
              type="submit" 
              disabled={submitting}
              className="bg-[#D4AF37] text-black font-bold py-3 px-6 rounded-xl hover:bg-[#AA8B2C] transition-colors mt-2"
            >
              {submitting ? t('linking') : t('link_btn')}
            </button>
          </form>
        </div>

        <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-6">{t('linked')}</h2>
          {loading ? (
            <p className="text-gray-400">{t('loading')}</p>
          ) : accounts.length === 0 ? (
            <p className="text-gray-400 text-sm">{t('no_accounts')}</p>
          ) : (
            <div className="space-y-4">
              {accounts.map(acc => (
                <div key={acc.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                  <div>
                    <div className="font-bold text-lg">{acc.accountNumber}</div>
                    <div className="text-sm text-gray-400">{acc.broker} {acc.server && `- ${acc.server}`}</div>
                  </div>
                  <button 
                    onClick={() => handleDelete(acc.id)}
                    className="text-red-400 hover:text-red-300 text-sm font-medium px-3 py-1 bg-red-500/10 rounded-lg transition-colors"
                  >
                    {t('delete')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
