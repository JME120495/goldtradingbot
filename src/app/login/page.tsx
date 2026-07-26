'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api, { setAccessToken } from '@/lib/api';
import Cookies from 'js-cookie';
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LoginPage() {
  const t = useTranslations('Auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'login' | '2fa' | 'setup-2fa' | 'backup-codes'>('login');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "/api"}`;
      
      if (step === 'login') {
        const res = await api.post('/auth/login', { email, password });
        if (res.data.setup2faRequired) {
          setTempToken(res.data.temp_token);
          // fetch qr code immediately
          const qrRes = await api.post('/auth/setup-2fa/generate', { temp_token: res.data.temp_token });
          setQrCodeUrl(qrRes.data.qrCodeUrl);
          setStep('setup-2fa');
        } else if (res.data.twoFactorRequired) {
          setTempToken(res.data.temp_token);
          setStep('2fa');
        } else {
          setAccessToken(res.data.access_token);
          router.push('/dashboard');
        }
      } else if (step === 'setup-2fa') {
        const res = await api.post('/auth/setup-2fa/turn-on', { temp_token: tempToken, code: twoFactorCode });
        setBackupCodes(res.data.backupCodes);
        setAccessToken(res.data.access_token);
        setStep('backup-codes');
      } else {
        const res = await api.post('/auth/login/2fa', { tempToken, code: twoFactorCode });
        setAccessToken(res.data.access_token);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || t('invalid_credentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#0F1115] border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-[#D4AF37]/10 blur-[80px] rounded-full pointer-events-none" />
        
        <h2 className="text-3xl font-bold mb-2 text-center">{t('login_title')}</h2>
        <p className="text-gray-400 text-center mb-8">{t('login_subtitle')}</p>
        
        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm text-center">{error}</div>}
        
        {step === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">{t('email')}</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">{t('password')}</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                placeholder="••••••••"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-[#D4AF37] text-black hover:bg-[#AA8B2C] h-12 text-lg font-bold rounded-xl"
              disabled={loading}
            >
              {loading ? '...' : t('login_button')}
            </Button>
          </form>
        ) : step === '2fa' ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Code d'authentification (2FA)</label>
              <input 
                type="text" 
                required
                value={twoFactorCode}
                onChange={e => setTwoFactorCode(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={8}
              />
              <p className="text-xs text-gray-500 mt-2">Entrez le code à 6 chiffres de votre application, ou un code de secours à 8 caractères.</p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-[#D4AF37] text-black hover:bg-[#AA8B2C] h-12 text-lg font-bold rounded-xl"
              disabled={loading}
            >
              {loading ? '...' : 'Vérifier'}
            </Button>
            <button 
              type="button" 
              onClick={() => { setStep('login'); setTwoFactorCode(''); setTempToken(''); setError(''); }}
              className="w-full text-gray-400 hover:text-white text-sm"
            >
              Retour à la connexion
            </button>
          </form>
        ) : step === 'setup-2fa' ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 p-3 rounded-lg mb-4 text-sm text-center">
              La configuration du 2FA est obligatoire pour les administrateurs.
            </div>
            {qrCodeUrl && (
              <div className="flex justify-center mb-4">
                <div className="bg-white p-2 rounded-xl">
                  <img src={qrCodeUrl} alt="QR Code" width={150} height={150} />
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Scannez le QR code puis entrez le code à 6 chiffres</label>
              <input 
                type="text" 
                required
                value={twoFactorCode}
                onChange={e => setTwoFactorCode(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-[#D4AF37] text-black hover:bg-[#AA8B2C] h-12 text-lg font-bold rounded-xl"
              disabled={loading}
            >
              {loading ? '...' : 'Activer'}
            </Button>
            <button 
              type="button" 
              onClick={() => { setStep('login'); setTwoFactorCode(''); setTempToken(''); setError(''); }}
              className="w-full text-gray-400 hover:text-white text-sm"
            >
              Annuler
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 p-4 rounded-lg text-sm">
              <p className="font-bold mb-2">⚠️ Codes de secours importants</p>
              <p>Copiez ces codes dans un endroit sûr. Ils ne seront plus jamais affichés. Ils permettent de vous connecter si vous perdez votre appareil.</p>
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono text-xs text-center bg-black p-4 rounded-xl border border-white/10">
              {backupCodes.map((code, idx) => (
                <div key={idx} className="p-1">{code}</div>
              ))}
            </div>
            <Button 
              onClick={() => router.push('/dashboard')}
              className="w-full bg-[#D4AF37] text-black hover:bg-[#AA8B2C] h-12 text-lg font-bold rounded-xl"
            >
              J'ai sauvegardé mes codes
            </Button>
          </div>
        )}

        <p className="mt-8 text-center text-gray-400 text-sm">
          {t('no_account')} <Link href="/register" className="text-[#D4AF37] hover:underline">{t('create_account')}</Link>
        </p>
      </div>
    </div>
  );
}
