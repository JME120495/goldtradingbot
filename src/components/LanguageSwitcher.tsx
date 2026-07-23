'use client';

import { useState } from "react";
import { setUserLocale } from "@/services/locale";

export default function LanguageSwitcher() {
  const [loading, setLoading] = useState(false);

  const switchLocale = async (locale: string) => {
    setLoading(true);
    await setUserLocale(locale);
    window.location.reload();
  };

  return (
    <div className="flex gap-2">
      {['en', 'fr', 'es', 'pt', 'ar'].map((lang) => (
        <button 
          key={lang}
          onClick={() => switchLocale(lang)}
          disabled={loading}
          className="text-xs text-gray-400 hover:text-[#D4AF37] uppercase font-bold"
        >
          {lang}
        </button>
      ))}
    </div>
  );
}
