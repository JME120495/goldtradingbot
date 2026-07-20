'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Mt5License {
  id: number;
  clientName: string;
  clientEmail: string;
  clientWhatsapp: string | null;
  accountNumber: number;
  broker: string;
  server: string;
  eaName: string;
  plan: string;
  lot: number;
  status: string;
  expiryDate: string;
  lastCheckAt: string | null;
  lastCheckIp: string | null;
  checkCount: number;
  createdAt: string;
  updatedAt: string;
}

const EA_OPTIONS = [
  { value: 'JMEGOLD_DUAL', label: 'JMEGOLD DUAL' },
  { value: 'GOLD_SCALPER', label: 'Gold Scalper' },
  { value: 'GOLDDOUBLESTOP', label: 'GoldDoubleStop' },
  { value: 'ALL', label: 'ALL (tous les EA)' },
];

const PLAN_OPTIONS = ['Starter', 'Standard', 'Pro', 'VIP'];

function statusBadge(status: string, expiryDate: string) {
  const isExpired = new Date(expiryDate) < new Date();
  const effectiveStatus = isExpired && status === 'active' ? 'expired' : status;

  const styles: Record<string, string> = {
    active: 'bg-emerald-500/20 text-emerald-400',
    suspended: 'bg-amber-500/20 text-amber-400',
    expired: 'bg-red-500/20 text-red-400',
    cancelled: 'bg-red-500/20 text-red-400',
  };

  const labels: Record<string, string> = {
    active: 'Actif',
    suspended: 'Suspendu',
    expired: 'Expiré',
    cancelled: 'Annulé',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide ${styles[effectiveStatus] || styles.expired}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          effectiveStatus === 'active'
            ? 'bg-emerald-400'
            : effectiveStatus === 'suspended'
              ? 'bg-amber-400'
              : 'bg-red-400'
        }`}
      />
      {labels[effectiveStatus] || effectiveStatus}
    </span>
  );
}

function formatDateTime(dateStr: string | null) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function AdminMt5Licenses() {
  const [licenses, setLicenses] = useState<Mt5License[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const t = useTranslations('Admin');

  const PAGE_SIZE = 50;

  const getAuthHeaders = () => {
    // Try to get JWT token from localStorage or cookies
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchLicenses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/license/admin/list`, {
        params: {
          limit: PAGE_SIZE,
          offset: page * PAGE_SIZE,
          search: search || undefined,
        },
        headers: getAuthHeaders(),
      });
      setLicenses(res.data.licenses);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Error fetching MT5 licenses:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchLicenses();
  }, [fetchLicenses]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchLicenses();
  };

  const toggleStatus = async (lic: Mt5License) => {
    const action =
      lic.status === 'active' || lic.status === 'expired'
        ? 'suspend'
        : 'reactivate';
    const confirmMsg =
      action === 'suspend'
        ? `Suspendre la licence du compte ${lic.accountNumber} (${lic.eaName}) ?`
        : `Réactiver la licence du compte ${lic.accountNumber} (${lic.eaName}) ?`;

    if (!confirm(confirmMsg)) return;

    try {
      await axios.post(
        `${API_URL}/api/license/admin/${action}`,
        {
          account_number: lic.accountNumber,
          ea_name: lic.eaName,
        },
        { headers: getAuthHeaders() },
      );
      fetchLicenses();
    } catch (err) {
      alert(`Erreur lors de l'action: ${action}`);
    }
  };

  const handleCreateLicense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      client_name: form.get('client_name') as string,
      client_email: form.get('client_email') as string,
      client_whatsapp: (form.get('client_whatsapp') as string) || undefined,
      account_number: parseInt(form.get('account_number') as string, 10),
      broker: form.get('broker') as string,
      server: form.get('server') as string,
      ea_name: form.get('ea_name') as string,
      plan: form.get('plan') as string,
      lot: parseFloat(form.get('lot') as string),
      expiry_date: form.get('expiry_date') as string,
    };

    try {
      await axios.post(`${API_URL}/api/license/admin/create`, payload, {
        headers: getAuthHeaders(),
      });
      (e.target as HTMLFormElement).reset();
      setShowForm(false);
      fetchLicenses();
      alert('Licence créée/renouvelée avec succès !');
    } catch (err: any) {
      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Erreur lors de la création de la licence.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const activeCount = licenses.filter(
    (l) => l.status === 'active' && new Date(l.expiryDate) >= new Date(),
  ).length;
  const expiredCount = licenses.filter(
    (l) =>
      l.status === 'expired' || new Date(l.expiryDate) < new Date(),
  ).length;
  const suspendedCount = licenses.filter(
    (l) => l.status === 'suspended',
  ).length;

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('mt5_licenses_title')}</h1>
          <p className="text-gray-400 mt-1">{t('mt5_licenses_subtitle')}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#D4AF37] text-black font-bold px-5 py-2.5 rounded-xl hover:bg-[#AA8B2C] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          {showForm ? '✕ Fermer' : '+ Nouvelle Licence'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0F1115] border border-white/10 p-5 rounded-2xl">
          <h3 className="text-gray-400 text-sm mb-1">Total</h3>
          <div className="text-3xl font-bold text-[#D4AF37]">{total}</div>
        </div>
        <div className="bg-[#0F1115] border border-white/10 p-5 rounded-2xl">
          <h3 className="text-gray-400 text-sm mb-1">Actives</h3>
          <div className="text-3xl font-bold text-emerald-400">
            {activeCount}
          </div>
        </div>
        <div className="bg-[#0F1115] border border-white/10 p-5 rounded-2xl">
          <h3 className="text-gray-400 text-sm mb-1">
            Expirées / Suspendues
          </h3>
          <div className="text-3xl font-bold text-red-400">
            {expiredCount + suspendedCount}
          </div>
        </div>
      </div>

      {/* Create / Renew Form */}
      {showForm && (
        <div className="bg-[#0F1115] border border-[#D4AF37]/30 rounded-2xl p-6 animate-in fade-in duration-300">
          <h2 className="text-xl font-bold mb-4 text-[#D4AF37]">
            Créer / Renouveler une Licence MT5
          </h2>
          <form
            onSubmit={handleCreateLicense}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Nom du client *
              </label>
              <input
                type="text"
                name="client_name"
                required
                placeholder="Jean Dupont"
                className="w-full bg-black border border-white/20 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#D4AF37] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="client_email"
                required
                placeholder="client@email.com"
                className="w-full bg-black border border-white/20 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#D4AF37] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                WhatsApp
              </label>
              <input
                type="text"
                name="client_whatsapp"
                placeholder="+33 6 12 34 56 78"
                className="w-full bg-black border border-white/20 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#D4AF37] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Compte MT5 *
              </label>
              <input
                type="number"
                name="account_number"
                required
                placeholder="12345678"
                className="w-full bg-black border border-white/20 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#D4AF37] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Broker
              </label>
              <input
                type="text"
                name="broker"
                placeholder="IC Markets"
                className="w-full bg-black border border-white/20 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#D4AF37] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Serveur MT5
              </label>
              <input
                type="text"
                name="server"
                placeholder="ICMarkets-Live01"
                className="w-full bg-black border border-white/20 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#D4AF37] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Expert Advisor *
              </label>
              <select
                name="ea_name"
                required
                defaultValue="JMEGOLD_DUAL"
                className="w-full bg-black border border-white/20 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#D4AF37] transition-colors"
              >
                {EA_OPTIONS.map((ea) => (
                  <option key={ea.value} value={ea.value}>
                    {ea.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Plan *
              </label>
              <select
                name="plan"
                required
                defaultValue="Starter"
                className="w-full bg-black border border-white/20 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#D4AF37] transition-colors"
              >
                {PLAN_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Lot autorisé *
              </label>
              <input
                type="number"
                name="lot"
                required
                step="0.01"
                min="0.01"
                defaultValue="0.01"
                className="w-full bg-black border border-white/20 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#D4AF37] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Date d&apos;expiration *
              </label>
              <input
                type="date"
                name="expiry_date"
                required
                className="w-full bg-black border border-white/20 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#D4AF37] transition-colors"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#D4AF37] text-black font-bold px-5 py-2.5 rounded-lg hover:bg-[#AA8B2C] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Création...' : 'Créer / Renouveler'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par n° de compte ou email..."
          className="flex-1 bg-[#0F1115] border border-white/20 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[#D4AF37] transition-colors"
        />
        <button
          type="submit"
          className="bg-white/10 text-white font-medium px-5 py-2.5 rounded-xl hover:bg-white/20 transition-colors"
        >
          Rechercher
        </button>
        {search && (
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setPage(0);
              setTimeout(fetchLicenses, 0);
            }}
            className="text-gray-400 hover:text-white px-3 transition-colors"
          >
            ✕
          </button>
        )}
      </form>

      {/* Licenses Table */}
      <div className="bg-[#0F1115] border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="p-4 text-gray-400 font-medium whitespace-nowrap">
                  Client
                </th>
                <th className="p-4 text-gray-400 font-medium whitespace-nowrap">
                  Compte MT5
                </th>
                <th className="p-4 text-gray-400 font-medium whitespace-nowrap">
                  Broker
                </th>
                <th className="p-4 text-gray-400 font-medium whitespace-nowrap">
                  EA
                </th>
                <th className="p-4 text-gray-400 font-medium whitespace-nowrap">
                  Plan
                </th>
                <th className="p-4 text-gray-400 font-medium whitespace-nowrap">
                  Lot
                </th>
                <th className="p-4 text-gray-400 font-medium whitespace-nowrap">
                  Statut
                </th>
                <th className="p-4 text-gray-400 font-medium whitespace-nowrap">
                  Expiration
                </th>
                <th className="p-4 text-gray-400 font-medium whitespace-nowrap">
                  Dernière vérif.
                </th>
                <th className="p-4 text-gray-400 font-medium whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                      {t('loading')}
                    </div>
                  </td>
                </tr>
              ) : licenses.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-gray-500">
                    Aucune licence MT5 trouvée.
                  </td>
                </tr>
              ) : (
                licenses.map((lic) => (
                  <tr
                    key={lic.id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4">
                      <div className="font-medium text-white">
                        {lic.clientName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {lic.clientEmail}
                      </div>
                    </td>
                    <td className="p-4 font-mono text-[#D4AF37]">
                      {lic.accountNumber}
                    </td>
                    <td className="p-4 text-gray-300">
                      <div>{lic.broker || '—'}</div>
                      {lic.server && (
                        <div className="text-xs text-gray-500">
                          {lic.server}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="bg-white/10 text-white px-2 py-0.5 rounded text-xs font-medium">
                        {lic.eaName}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-white">{lic.plan}</td>
                    <td className="p-4 text-white">{lic.lot}</td>
                    <td className="p-4">
                      {statusBadge(lic.status, lic.expiryDate)}
                    </td>
                    <td className="p-4 text-gray-300 whitespace-nowrap">
                      {formatDate(lic.expiryDate)}
                    </td>
                    <td className="p-4 text-gray-500 text-xs whitespace-nowrap">
                      {formatDateTime(lic.lastCheckAt)}
                    </td>
                    <td className="p-4 flex items-center gap-4">
                      <Link
                        href={`/admin/mt5-licenses/${lic.accountNumber}`}
                        className="font-semibold text-sm text-[#D4AF37] hover:text-[#AA8B2C] transition-colors whitespace-nowrap"
                      >
                        Trading
                      </Link>
                      <button
                        onClick={() => toggleStatus(lic)}
                        className={`font-semibold text-sm transition-colors whitespace-nowrap ${
                          lic.status === 'active'
                            ? 'text-amber-400 hover:text-amber-300'
                            : 'text-emerald-400 hover:text-emerald-300'
                        }`}
                      >
                        {lic.status === 'active' ? 'Suspendre' : 'Réactiver'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-white/10">
            <span className="text-sm text-gray-400">
              {total} licence{total > 1 ? 's' : ''} — Page {page + 1} /{' '}
              {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white/10 text-white hover:bg-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ← Précédent
              </button>
              <button
                onClick={() =>
                  setPage((p) => Math.min(totalPages - 1, p + 1))
                }
                disabled={page >= totalPages - 1}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white/10 text-white hover:bg-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Suivant →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
