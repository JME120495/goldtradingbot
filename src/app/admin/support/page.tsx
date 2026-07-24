'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Ticket, CheckCircle, XCircle } from 'lucide-react';

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const token = Cookies.get('token');
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/support/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const token = Cookies.get('token');
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/support/admin/${id}/status`, 
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTickets();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  if (loading) return <div className="text-white p-8">Chargement...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <Ticket className="w-8 h-8 text-[#D4AF37]" />
        Support Client
      </h1>

      <div className="bg-[#0F1115] rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="p-4 font-semibold">Client</th>
              <th className="p-4 font-semibold">Sujet</th>
              <th className="p-4 font-semibold">Message</th>
              <th className="p-4 font-semibold">Date</th>
              <th className="p-4 font-semibold">Statut</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-4">
                  <div className="font-medium">{ticket.user?.name || 'Inconnu'}</div>
                  <div className="text-sm text-gray-400">{ticket.user?.email}</div>
                </td>
                <td className="p-4 font-medium">{ticket.subject}</td>
                <td className="p-4 text-sm text-gray-400 max-w-xs break-words">{ticket.message}</td>
                <td className="p-4 text-sm text-gray-400">
                  {new Date(ticket.createdAt).toLocaleString()}
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    ticket.status === 'OPEN' ? 'bg-yellow-500/20 text-yellow-500' :
                    ticket.status === 'CLOSED' ? 'bg-gray-500/20 text-gray-400' :
                    'bg-blue-500/20 text-blue-500'
                  }`}>
                    {ticket.status}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  {ticket.status === 'OPEN' && (
                    <>
                      <button 
                        onClick={() => updateStatus(ticket.id, 'IN_PROGRESS')}
                        className="p-2 bg-blue-500/20 text-blue-500 rounded-lg hover:bg-blue-500/30"
                        title="Marquer en cours"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => updateStatus(ticket.id, 'CLOSED')}
                        className="p-2 bg-gray-500/20 text-gray-400 rounded-lg hover:bg-gray-500/30"
                        title="Clôturer"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {ticket.status === 'IN_PROGRESS' && (
                    <button 
                      onClick={() => updateStatus(ticket.id, 'CLOSED')}
                      className="p-2 bg-gray-500/20 text-gray-400 rounded-lg hover:bg-gray-500/30"
                      title="Clôturer"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">
                  Aucun ticket trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
