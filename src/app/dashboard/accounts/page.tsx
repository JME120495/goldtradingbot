'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [accountNumber, setAccountNumber] = useState('');
  const [broker, setBroker] = useState('');
  const [server, setServer] = useState('');

  const fetchAccounts = async () => {
    try {
      const token = Cookies.get('token');
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || '/_/backend'}` + '/trading-accounts', {
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
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || '/_/backend'}` + '/trading-accounts', {
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
      setError(err.response?.data?.message || 'Error adding account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this account? Any associated licenses will be detached.')) return;
    
    try {
      const token = Cookies.get('token');
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || '/_/backend'}/trading-accounts/${id}`, {
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
        <h1 className="text-3xl font-bold mb-2">MT5 Accounts</h1>
        <p className="text-gray-400">Manage your MetaTrader 5 accounts linked to your licenses.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-8 h-fit">
          <h2 className="text-xl font-bold mb-6">Add New Account</h2>
          {error && <div className="bg-red-500/10 text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>}
          <form className="space-y-4" onSubmit={handleAddAccount}>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">MT5 Account Number</label>
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
              <label className="block text-sm font-medium text-gray-400 mb-2">Broker Name</label>
              <select 
                required
                value={broker}
                onChange={e => setBroker(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="">Select your broker</option>
                <option value="Fusion Markets">Fusion Markets</option>
                <option value="Pepperstone">Pepperstone</option>
                <option value="IC Markets">IC Markets</option>
                <option value="Exness">Exness</option>
                <option value="Other">Other</option>
              </select>
            </div>
            {broker === 'Other' && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Server Name</label>
                <input 
                  type="text" 
                  value={server}
                  onChange={e => setServer(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]"
                  placeholder="e.g. Broker-Live01"
                />
              </div>
            )}
            <button 
              type="submit" 
              disabled={submitting}
              className="bg-[#D4AF37] text-black font-bold py-3 px-6 rounded-xl hover:bg-[#AA8B2C] transition-colors mt-2"
            >
              {submitting ? 'Linking...' : 'Link Account'}
            </button>
          </form>
        </div>

        <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-6">Linked Accounts</h2>
          {loading ? (
            <p className="text-gray-400">Loading accounts...</p>
          ) : accounts.length === 0 ? (
            <p className="text-gray-400 text-sm">No MT5 accounts linked yet.</p>
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
                    Delete
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
