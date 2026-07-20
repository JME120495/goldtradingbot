'use client';

import { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (newPassword !== confirmPassword) {
      setError('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setLoading(true);
    try {
      const token = Cookies.get('token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      
      const res = await axios.patch(`${API_URL}/users/password`, {
        currentPassword,
        newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess(res.data.message || 'Mot de passe modifié avec succès.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la modification du mot de passe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Profil & Sécurité</h1>
        <p className="text-gray-400">Gérez vos informations de compte et votre mot de passe.</p>
      </div>

      <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-8 max-w-2xl">
        <h2 className="text-xl font-bold mb-6">Changer de mot de passe</h2>
        
        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm">{error}</div>}
        {success && <div className="bg-green-500/10 border border-green-500/50 text-green-500 p-3 rounded-lg mb-6 text-sm">{success}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Mot de passe actuel</label>
            <input 
              type="password" 
              required
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
              placeholder="••••••••"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Nouveau mot de passe</label>
            <input 
              type="password" 
              required
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
              placeholder="••••••••"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Confirmer le nouveau mot de passe</label>
            <input 
              type="password" 
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
              placeholder="••••••••"
            />
          </div>
          
          <Button type="submit" className="w-full bg-[#D4AF37] text-black font-bold py-3 rounded-xl hover:bg-[#AA8B2C] transition-colors mt-4" disabled={loading}>
            {loading ? 'Enregistrement...' : 'Mettre à jour le mot de passe'}
          </Button>
        </form>
      </div>
    </div>
  );
}
