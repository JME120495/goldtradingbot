'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function RegisterPage() {
  const t = useTranslations('Auth');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneCode, setPhoneCode] = useState('+237'); // Default to Cameroon
  const [phoneNumber, setPhoneNumber] = useState('');
  const [preferredCurrency, setPreferredCurrency] = useState('XAF');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fullPhone = `${phoneCode}${phoneNumber}`;
      const API_URL = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "/api"}`;
      const res = await axios.post(`${API_URL}/auth/register`, { 
        name, 
        email, 
        password,
        phone: fullPhone,
        preferredCurrency
      });
      Cookies.set('token', res.data.access_token, { expires: 1 });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Network error or server unreachable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#0F1115] border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden my-8">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-[#D4AF37]/10 blur-[80px] rounded-full pointer-events-none" />
        <h2 className="text-3xl font-bold mb-2 text-center">{t('register_title')}</h2>
        <p className="text-gray-400 text-center mb-8">{t('register_subtitle')}</p>
        
        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm text-center">{error}</div>}
        
        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">{t('name')}</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
              placeholder="John Doe"
            />
          </div>
          
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
            <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
            <div className="flex gap-2">
              <select 
                value={phoneCode}
                onChange={e => setPhoneCode(e.target.value)}
                className="bg-black border border-white/10 rounded-xl px-2 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors w-1/3"
              >
                <option value="+237">🇨🇲 +237</option>
                <option value="+225">🇨🇮 +225</option>
                <option value="+221">🇸🇳 +221</option>
                <option value="+228">🇹🇬 +228</option>
                <option value="+241">🇬🇦 +241</option>
                <option value="+242">🇨🇬 +242</option>
                <option value="+243">🇨🇩 +243</option>
                <option value="+33">🇫🇷 +33</option>
                <option value="+1">🇺🇸 +1</option>
                <option value="+44">🇬🇧 +44</option>
                <option value="+971">🇦🇪 +971</option>
              </select>
              <input 
                type="tel" 
                required
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                className="w-2/3 bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                placeholder="6XX XX XX XX"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Preferred Currency</label>
            <select 
              value={preferredCurrency}
              onChange={e => setPreferredCurrency(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
            >
              <option value="XAF">FCFA (CEMAC - XAF)</option>
              <option value="XOF">FCFA (UEMOA - XOF)</option>
              <option value="USD">US Dollar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
            </select>
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
          
          <Button type="submit" className="w-full bg-[#D4AF37] text-black font-bold py-3 rounded-xl hover:bg-[#AA8B2C] transition-colors mt-4" disabled={loading}>
            {loading ? '...' : t('register')}
          </Button>
        </form>
        <p className="text-center text-gray-400 mt-6 text-sm">
          {t('has_account')} <Link href="/login" className="text-[#D4AF37] hover:underline">{t('signin')}</Link>
        </p>
      </div>
    </div>
  );
}
