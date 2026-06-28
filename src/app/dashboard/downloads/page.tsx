'use client';

import { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

export default function DownloadsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDownload = async (productSlug: string) => {
    setLoading(true);
    setError('');
    try {
      const token = Cookies.get('token');
      // 1. Generate Signed URL
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}` + '/downloads/generate-url', 
        { product: productSlug },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // 2. Redirect to download
      const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}${res.data.url}`;
      window.location.href = downloadUrl;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error generating download link. Ensure you have an active license.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Downloads</h1>
        <p className="text-gray-400">Download the latest versions of your Expert Advisors.</p>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mt-4">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-[#0F1115] border border-[#D4AF37]/30 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 blur-[40px] rounded-full pointer-events-none" />
          <h3 className="text-xl font-bold mb-2">Gold Scalper MT5</h3>
          <p className="text-gray-400 mb-6 text-sm">Version 1.0.0 • Updated today</p>
          <button 
            onClick={() => handleDownload('gold-scalper')}
            disabled={loading}
            className="w-full bg-[#D4AF37] text-black font-bold py-3 rounded-xl hover:bg-[#AA8B2C] disabled:opacity-50"
          >
            {loading ? 'Generating Link...' : 'Download EA (.ex5)'}
          </button>
        </div>
      </div>
    </div>
  );
}
