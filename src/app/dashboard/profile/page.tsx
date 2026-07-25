'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Cookies from 'js-cookie';
import { Button } from "@/components/ui/button";

import { useTranslations } from 'next-intl';

export default function ProfilePage() {
  const t = useTranslations('DashboardProfile');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // 2FA state
  const [is2faEnabled, setIs2faEnabled] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [setupStep, setSetupStep] = useState(0); // 0: inactive, 1: show QR, 2: processing
  const [twoFactorError, setTwoFactorError] = useState('');
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/me');
        setIs2faEnabled(res.data.isTwoFactorEnabled || false);
      } catch (e) {
        console.error(e);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (newPassword !== confirmPassword) {
      setError(t('pwd_mismatch'));
      return;
    }
    
    if (newPassword.length < 6) {
      setError(t('pwd_length'));
      return;
    }

    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
      
      const res = await api.patch(`${API_URL}/users/password`, {
        currentPassword,
        newPassword
      });
      
      setSuccess(res.data.message || t('pwd_success'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.message || t('pwd_error'));
    } finally {
      setLoading(false);
    }
  };

  const start2faSetup = async () => {
    setTwoFactorError('');
    try {
      const res = await api.post('/auth/2fa/generate');
      setQrCodeUrl(res.data.qrCodeUrl);
      setSetupStep(1);
    } catch (e) {
      setTwoFactorError("Impossible de générer le QR Code.");
    }
  };

  const confirm2faSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFactorError('');
    setSetupStep(2);
    try {
      await api.post('/auth/2fa/turn-on', { code: twoFactorCode });
      setIs2faEnabled(true);
      setSetupStep(0);
      setTwoFactorCode('');
      setSuccess("L'authentification à double facteur a été activée avec succès.");
    } catch (e: any) {
      setTwoFactorError(e.response?.data?.message || "Code invalide.");
      setSetupStep(1);
    }
  };

  const disable2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFactorError('');
    try {
      await api.post('/auth/2fa/turn-off', { code: twoFactorCode });
      setIs2faEnabled(false);
      setTwoFactorCode('');
      setSuccess("L'authentification à double facteur a été désactivée.");
    } catch (e: any) {
      setTwoFactorError(e.response?.data?.message || "Code invalide.");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-gray-400">{t('desc')}</p>
      </div>

      <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-8 max-w-2xl">
        <h2 className="text-xl font-bold mb-6">{t('change_password')}</h2>
        
        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm">{error}</div>}
        {success && <div className="bg-green-500/10 border border-green-500/50 text-green-500 p-3 rounded-lg mb-6 text-sm">{success}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">{t('current_pwd')}</label>
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
            <label className="block text-sm font-medium text-gray-400 mb-2">{t('new_pwd')}</label>
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
            <label className="block text-sm font-medium text-gray-400 mb-2">{t('confirm_pwd')}</label>
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
            {loading ? t('saving') : t('update_btn')}
          </Button>
        </form>
      </div>

      {/* SECTION 2FA */}
      <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-8 max-w-2xl">
        <h2 className="text-xl font-bold mb-2">Sécurité (2FA)</h2>
        <p className="text-gray-400 text-sm mb-6">Protégez votre compte avec l'authentification à double facteur (Google Authenticator, Authy, etc.).</p>

        {twoFactorError && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm">{twoFactorError}</div>}

        {!is2faEnabled && setupStep === 0 && (
          <Button onClick={start2faSetup} className="bg-[#D4AF37] text-black font-bold hover:bg-[#AA8B2C]">
            Activer le 2FA
          </Button>
        )}

        {!is2faEnabled && setupStep === 1 && (
          <form onSubmit={confirm2faSetup} className="space-y-4">
            <div className="bg-white p-4 rounded-xl inline-block mb-4">
              <img src={qrCodeUrl} alt="QR Code 2FA" className="w-48 h-48" />
            </div>
            <p className="text-sm text-gray-300">Scannez ce QR code avec votre application d'authentification, puis saisissez le code généré ci-dessous :</p>
            <div>
              <input 
                type="text" 
                required
                value={twoFactorCode}
                onChange={e => setTwoFactorCode(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors text-center tracking-widest text-xl max-w-[200px]"
                placeholder="000000"
                maxLength={6}
              />
            </div>
            <div className="flex gap-4">
              <Button type="submit" className="bg-[#D4AF37] text-black font-bold hover:bg-[#AA8B2C]">
                Valider l'activation
              </Button>
              <Button type="button" variant="outline" onClick={() => setSetupStep(0)} className="text-gray-400 border-white/10 hover:text-white">
                Annuler
              </Button>
            </div>
          </form>
        )}

        {is2faEnabled && (
          <form onSubmit={disable2fa} className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-green-500 font-bold">2FA Activé</span>
            </div>
            <p className="text-sm text-gray-300">Pour désactiver le 2FA, veuillez entrer un code de votre application :</p>
            <div>
              <input 
                type="text" 
                required
                value={twoFactorCode}
                onChange={e => setTwoFactorCode(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors tracking-widest max-w-[200px]"
                placeholder="000000"
                maxLength={6}
              />
            </div>
            <Button type="submit" variant="destructive" className="bg-red-500 hover:bg-red-600 text-white font-bold">
              Désactiver le 2FA
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
