'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function DashboardOverview() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const t = useTranslations('Dashboard');
  
  const fetchUser = async () => {
    try {
      const res = await api.get('/users/me');
      setUser(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const activeLicenses = user?.licenses?.filter((l: any) => l.status === 'ACTIVE') || [];

  if (loading) {
    return <div className="text-white p-8">{t('loading', { fallback: 'Loading...' })}</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">{t('welcome')}, {user?.name || user?.email}</h1>
        <div className="flex items-center gap-4">
          <p className="text-gray-400">ID: {user?.id}</p>
          {process.env.NODE_ENV === 'development' && (
            <button 
              onClick={() => {
                import('@/lib/api').then(({ default: api }) => {
                  console.log("Sending 3 concurrent requests to force 401 queue test...");
                  Promise.all([
                    api.get('/users/me'),
                    api.get('/users/me'),
                    api.get('/users/me')
                  ]).then(() => alert("Succès : Les 3 requêtes ont été traitées !"))
                  .catch(err => console.error(err));
                });
              }}
              className="px-3 py-1 bg-red-500/20 text-red-500 text-xs font-bold rounded"
            >
              TEST 401 QUEUE
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-6">
          <h3 className="text-gray-400 font-medium mb-4">{t('active_licenses')}</h3>
          <div className="text-4xl font-bold text-white">{activeLicenses.length}</div>
        </div>
        <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-6">
          <h3 className="text-gray-400 font-medium mb-4">{t('mt5_account')}</h3>
          <div className="text-4xl font-bold text-white">
            {new Set(activeLicenses.map((l: any) => l.tradingAccountId).filter(Boolean)).size}
          </div>
        </div>
        <div className="bg-[#0F1115] border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-center items-center">
          <Link 
            href="/dashboard/billing"
            className="px-6 py-3 bg-[#D4AF37] text-black text-sm font-bold rounded-lg hover:bg-[#AA8B2C] transition-colors"
          >
            {t('subscribe')}
          </Link>
        </div>
      </div>

      <div className="mt-12 bg-[#0F1115] border border-white/10 rounded-2xl p-8">
        <h2 className="text-xl font-bold mb-6">{t('active_licenses')}</h2>
        
        {user?.licenses?.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            {t('no_licenses')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="p-4 font-medium text-gray-400">{t('plan')}</th>
                  <th className="p-4 font-medium text-gray-400">{t('max_lot')}</th>
                  <th className="p-4 font-medium text-gray-400">License Key</th>
                  <th className="p-4 font-medium text-gray-400">{t('expires')}</th>
                  <th className="p-4 font-medium text-gray-400">{t('status')}</th>
                  <th className="p-4 font-medium text-gray-400">{t('mt5_account')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {user?.licenses?.map((license: any) => (
                  <tr key={license.id} className="hover:bg-white/5">
                    <td className="p-4">
                      <div className="font-bold text-[#D4AF37]">{license.product?.name || 'GOLD_SCALPER'}</div>
                      <div className="text-sm text-gray-400">{license.plan?.name}</div>
                    </td>
                    <td className="p-4 font-mono">{license.plan?.lotAllowed || license.lotAllowed}</td>
                    <td className="p-4 font-mono text-sm">{license.key}</td>
                    <td className="p-4 text-sm text-gray-400">
                      {license.expiresAt ? new Date(license.expiresAt).toLocaleDateString() : 'Lifetime'}
                    </td>
                    <td className="p-4">
                      <LicenseStatusBadge license={license} />
                    </td>
                    <td className="p-4">
                      <LicenseAccountCell license={license} onUpdated={fetchUser} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="flex justify-end mt-4">
        <Link href="/dashboard/downloads" className="text-[#D4AF37] font-semibold hover:underline">
          {t('download_ea')} →
        </Link>
      </div>
    </div>
  );
}

const ACCOUNT_CHANGE_DAYS = 30;

function LicenseStatusBadge({ license }: { license: any }) {
  const t = useTranslations('Dashboard');
  const isExpired = license.expiresAt && new Date(license.expiresAt) < new Date();

  if (license.status !== 'ACTIVE') {
    return <span className="px-2 py-1 rounded text-xs font-bold bg-red-500/20 text-red-400">{license.status}</span>;
  }
  if (isExpired) {
    return <span className="px-2 py-1 rounded text-xs font-bold bg-red-500/20 text-red-400">{t('acc_expired')}</span>;
  }
  if (!license.tradingAccount) {
    return <span className="px-2 py-1 rounded text-xs font-bold bg-amber-500/20 text-amber-400">{t('acc_pending')}</span>;
  }
  return <span className="px-2 py-1 rounded text-xs font-bold bg-green-500/20 text-green-400">{t('acc_active')}</span>;
}

// 1 licence = 1 compte MT5: first registration, then one change per 30 days
function LicenseAccountCell({ license, onUpdated }: { license: any; onUpdated: () => void }) {
  const t = useTranslations('Dashboard');
  const [editing, setEditing] = useState(false);
  const [accountNumber, setAccountNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const boundAccount = license.tradingAccount?.accountNumber;
  const nextChangeAt = license.accountChangedAt
    ? new Date(new Date(license.accountChangedAt).getTime() + ACCOUNT_CHANGE_DAYS * 24 * 60 * 60 * 1000)
    : null;
  const canChange = !nextChangeAt || nextChangeAt <= new Date();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[1-9]\d*$/.test(accountNumber.trim())) {
      setError(t('acc_invalid'));
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.post('/license/account/register', {
        license_id: license.id,
        account_number: accountNumber.trim(),
      });
      setEditing(false);
      setAccountNumber('');
      onUpdated();
    } catch (err: any) {
      setError(err.response?.data?.message || t('acc_error'));
    } finally {
      setSaving(false);
    }
  };

  if (boundAccount && !editing) {
    return (
      <div className="space-y-1">
        <div className="font-mono font-bold">{boundAccount}</div>
        {canChange ? (
          <button onClick={() => setEditing(true)} className="text-[#D4AF37] hover:underline text-sm">
            {t('acc_change')}
          </button>
        ) : (
          <div className="text-xs text-gray-500">
            {t('acc_next_change')} {nextChangeAt!.toLocaleDateString()}
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-2 min-w-[220px]">
      {boundAccount && <div className="text-xs text-amber-400">{t('acc_change_warning')}</div>}
      <div className="flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          value={accountNumber}
          onChange={e => setAccountNumber(e.target.value)}
          placeholder={t('acc_placeholder')}
          className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
        />
        <button
          type="submit"
          disabled={saving}
          className="bg-[#D4AF37] text-black font-bold text-sm px-3 py-2 rounded-lg hover:bg-[#AA8B2C] transition-colors whitespace-nowrap"
        >
          {saving ? t('acc_saving') : t('acc_save')}
        </button>
        {editing && (
          <button type="button" onClick={() => { setEditing(false); setError(''); }} className="text-gray-400 hover:text-white text-sm">
            {t('acc_cancel')}
          </button>
        )}
      </div>
      {error && <div className="text-xs text-red-400">{error}</div>}
      <div className="text-xs text-gray-500">{t('acc_help')}</div>
    </form>
  );
}
