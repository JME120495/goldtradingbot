'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#0F1115] border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-[#D4AF37]/10 blur-[80px] rounded-full pointer-events-none" />
        
        <Link href="/login" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-6 text-sm">
          <ArrowLeft size={16} className="mr-2" />
          Retour à la connexion
        </Link>
        
        <h2 className="text-3xl font-bold mb-2 text-center">Mot de passe oublié ?</h2>
        <p className="text-gray-400 text-center mb-8">Saisissez votre adresse email pour recevoir un lien de réinitialisation.</p>
        
        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm text-center">{error}</div>}
        
        {success ? (
          <div className="bg-green-500/10 border border-green-500/50 text-green-500 p-6 rounded-xl text-center space-y-4">
            <p className="font-medium text-lg">Email envoyé !</p>
            <p className="text-sm opacity-90">Si l'adresse <b>{email}</b> est associée à un compte, un lien de réinitialisation vous a été envoyé.</p>
            <p className="text-sm opacity-90">Veuillez vérifier votre boîte de réception (et vos spams).</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Adresse Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                placeholder="vous@exemple.com"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-[#D4AF37] text-black hover:bg-[#AA8B2C] h-12 text-lg font-bold rounded-xl"
              disabled={loading || !email}
            >
              {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
