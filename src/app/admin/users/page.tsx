'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { 
  Users, 
  Search,
  ShieldBan,
  CheckCircle2,
  Calendar,
  Key,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  isBanned: boolean;
  licensesCount: number;
  tradingAccountsCount: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBan = async (user: User) => {
    if (user.role === 'ADMIN') {
      alert("Vous ne pouvez pas bannir un administrateur.");
      return;
    }

    const action = user.isBanned ? 'débannir' : 'bannir';
    if (!window.confirm(`Êtes-vous sûr de vouloir ${action} cet utilisateur ?`)) return;

    setActionLoading(user.id);
    try {
      await api.put(`/admin/users/${user.id}/ban`);
      await fetchUsers(); // Refresh the list
    } catch (error) {
      console.error(`Erreur lors de l'action ${action}:`, error);
      alert(`Une erreur est survenue lors de l'action.`);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Users className="text-[#D4AF37]" size={32} />
            Gestion des Utilisateurs
          </h1>
          <p className="text-gray-400 mt-2">
            Consultez et gérez les comptes de vos clients.
          </p>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher par email ou nom..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
          />
        </div>
      </div>

      {/* Tableau des utilisateurs */}
      <div className="bg-[#0F1115] border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/50 border-b border-white/10">
                <th className="p-4 text-sm font-medium text-gray-400">Utilisateur</th>
                <th className="p-4 text-sm font-medium text-gray-400">Rôle</th>
                <th className="p-4 text-sm font-medium text-gray-400">Activité</th>
                <th className="p-4 text-sm font-medium text-gray-400">Inscription</th>
                <th className="p-4 text-sm font-medium text-gray-400">Statut</th>
                <th className="p-4 text-sm font-medium text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Chargement des utilisateurs...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-white font-medium">{user.name || 'Non renseigné'}</span>
                        <span className="text-sm text-gray-400">{user.email}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                        user.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 
                        'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Key size={14} className="text-[#D4AF37]" />
                          {user.licensesCount} licence(s)
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp size={14} className="text-[#D4AF37]" />
                          {user.tradingAccountsCount} compte(s)
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-400 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="p-4">
                      {user.isBanned ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-md text-xs font-medium">
                          <AlertTriangle size={12} /> Banni
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-md text-xs font-medium">
                          <CheckCircle2 size={12} /> Actif
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {user.role !== 'ADMIN' && (
                        <Button
                          onClick={() => toggleBan(user)}
                          disabled={actionLoading === user.id}
                          variant="ghost"
                          className={`h-9 px-3 ${
                            user.isBanned 
                              ? 'text-green-500 hover:text-green-400 hover:bg-green-500/10' 
                              : 'text-red-500 hover:text-red-400 hover:bg-red-500/10'
                          }`}
                        >
                          {actionLoading === user.id ? (
                            "..."
                          ) : user.isBanned ? (
                            <>
                              <CheckCircle2 size={16} className="mr-2" />
                              Débannir
                            </>
                          ) : (
                            <>
                              <ShieldBan size={16} className="mr-2" />
                              Bannir
                            </>
                          )}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
