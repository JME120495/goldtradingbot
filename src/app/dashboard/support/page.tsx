'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Ticket, Plus, MessageSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function SupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const t = useTranslations('Dashboard');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const token = Cookies.get('token');
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/support`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;
    setSubmitting(true);
    try {
      const token = Cookies.get('token');
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/support`, 
        { subject, message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowModal(false);
      setSubject('');
      setMessage('');
      fetchTickets();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la création du ticket');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Ticket className="w-8 h-8 text-[#D4AF37]" />
          Support
        </h1>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#D4AF37] text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[#AA8B2C] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouveau Ticket
        </button>
      </div>

      <div className="bg-[#0F1115] rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="p-4 font-semibold">Sujet</th>
              <th className="p-4 font-semibold">Message</th>
              <th className="p-4 font-semibold">Statut</th>
              <th className="p-4 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-400">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  Aucun ticket de support
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr key={ticket.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-medium">{ticket.subject}</td>
                  <td className="p-4 text-gray-400 max-w-xs truncate">{ticket.message}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      ticket.status === 'OPEN' ? 'bg-yellow-500/20 text-yellow-500' :
                      ticket.status === 'CLOSED' ? 'bg-gray-500/20 text-gray-400' :
                      'bg-blue-500/20 text-blue-500'
                    }`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-400">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#1A1D24] border border-[#D4AF37]/30 p-6 rounded-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Ouvrir un ticket</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Sujet</label>
                <input 
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#D4AF37]"
                  placeholder="Problème avec le bot, question commerciale..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Message</label>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#D4AF37] h-32"
                  placeholder="Décrivez votre problème en détail..."
                  required
                />
              </div>
              <div className="flex gap-4 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-[#D4AF37] text-black font-bold rounded-lg hover:bg-[#AA8B2C] transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Envoi...' : 'Envoyer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
