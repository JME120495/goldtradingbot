'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    
    if (!token) {
      setError('Lien invalide ou expiré (token manquant).');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Une erreur est survenue (le lien est peut-être expiré).');
    } finally {
      setLoading(false);
    }
  };

  if (!token && !success) {
    return (
      <div className="text-center">
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg mb-6">
          Ce lien de réinitialisation est invalide ou incomplet.
        </div>
        <Link href="/forgot-password" className="text-[#D4AF37] hover:underline">
          Demander un nouveau lien
        </Link>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-3xl font-bold mb-2 text-center">Nouveau mot de passe</h2>
      <p className="text-gray-400 text-center mb-8">
        {success ? "Mot de passe réinitialisé avec succès !" : "Veuillez définir votre nouveau mot de passe."}
      </p>
      
      {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm text-center">{error}</div>}
      
      {success ? (
        <div className="text-center space-y-6">
          <div className="flex justify-center text-green-500 mb-4">
            <CheckCircle2 size={64} />
          </div>
          <Link href="/login" className="block w-full">
            <Button className="w-full bg-[#D4AF37] text-black hover:bg-[#AA8B2C] h-12 text-lg font-bold rounded-xl">
              Se connecter
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Nouveau mot de passe</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required
                minLength={8}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Confirmer le mot de passe</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required
                minLength={8}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors pr-12"
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-[#D4AF37] text-black hover:bg-[#AA8B2C] h-12 text-lg font-bold rounded-xl"
            disabled={loading || !password || !confirmPassword}
          >
            {loading ? 'Enregistrement...' : 'Réinitialiser'}
          </Button>
        </form>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#0F1115] border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-[#D4AF37]/10 blur-[80px] rounded-full pointer-events-none" />
        
        <Suspense fallback={<div className="text-center text-gray-500">Chargement...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
