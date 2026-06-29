'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
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
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}`;
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      Cookies.set('token', res.data.access_token, { expires: 1 });
      router.push('/dashboard');
    } catch (err) {
      setError(t('invalid_credentials'));
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
          <Button type="submit" className="w-full bg-[#D4AF37] text-black font-bold py-3 rounded-xl hover:bg-[#AA8B2C] transition-colors" disabled={loading}>
            {loading ? '...' : t('signin')}
          </Button>
        </form>
        <p className="text-center text-gray-400 mt-6 text-sm">
          {t('no_account')} <Link href="/register" className="text-[#D4AF37] hover:underline">{t('create_account')}</Link>
        </p>
      </div>
    </div>
  );
}
