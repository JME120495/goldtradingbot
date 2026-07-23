'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface License {
  id: string;
  status: string;
  plan: { name: string };
  expiresAt: string | null;
  lotAllowed: number;
  product: {
    slug: string;
    name: string;
  };
}


export default function DownloadsPage() {
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = Cookies.get('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [productsRes, licensesRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL || "/api"}/downloads/products`, { headers }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL || "/api"}/licenses/mine`, { headers }).catch(() => ({ data: [] })),
      ]);

      setProducts(productsRes.data);
      setLicenses(licensesRes.data);
    } catch (err: any) {
      setError('Erreur lors du chargement des données.');
    } finally {
      setLoadingProducts(false);
    }
  };

  const getActiveLicense = (productSlug: string): License | undefined => {
    return licenses.find(
      (lic) =>
        lic.product?.slug === productSlug &&
        lic.status === 'ACTIVE' &&
        (!lic.expiresAt || new Date(lic.expiresAt) > new Date())
    );
  };

  const handleDownload = async (productSlug: string) => {
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const token = Cookies.get('token');
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || "/api"}/downloads/generate-url`,
        { product: productSlug },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL || "/api"}${res.data.url}`;
      setSuccessMsg('Téléchargement lancé ! Si rien ne se passe, vérifiez vos téléchargements.');
      window.location.href = downloadUrl;
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'Erreur lors de la génération du lien. Vérifiez que vous avez une licence active.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Téléchargements</h1>
        <p className="text-gray-400">Téléchargez la dernière version de votre Expert Advisor.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mt-4 flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {successMsg && (
        <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-4 rounded-xl mt-4 flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {successMsg}
        </div>
      )}

      {loadingProducts ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {products.map((product) => {
            const activeLicense = getActiveLicense(product.slug);
            const hasLicense = !!activeLicense;

            return (
              <div
                key={product.id}
                className="bg-[#0F1115] border border-[#D4AF37]/30 rounded-2xl p-6 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 blur-[40px] rounded-full pointer-events-none" />

                {/* Product Info */}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold">{product.name}</h3>
                  {hasLicense ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      Licence Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                      Pas de licence
                    </span>
                  )}
                </div>

                <p className="text-gray-400 mb-2 text-sm">
                  {product.description || 'Expert Advisor MetaTrader 5'}
                </p>

                {/* License Details */}
                {hasLicense && activeLicense && (
                  <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-lg p-3 mb-4 text-sm">
                    <div className="flex justify-between text-gray-400">
                      <span>Plan :</span>
                      <span className="text-white font-semibold">{activeLicense.plan.name}</span>
                    </div>
                    {activeLicense.expiresAt && (
                      <div className="flex justify-between text-gray-400 mt-1">
                        <span>Expire le :</span>
                        <span className="text-white font-semibold">
                          {new Date(activeLicense.expiresAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Button */}
                {hasLicense ? (
                  <button
                    onClick={() => handleDownload(product.slug)}
                    disabled={loading}
                    className="w-full bg-[#D4AF37] text-black font-bold py-3 rounded-xl hover:bg-[#AA8B2C] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black" />
                        Génération du lien...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Télécharger l&apos;EA (.ex5)
                      </>
                    )}
                  </button>
                ) : (
                  <Link href="/dashboard/billing">
                    <button className="w-full bg-white/10 border border-[#D4AF37]/50 text-[#D4AF37] font-bold py-3 rounded-xl hover:bg-[#D4AF37]/10 transition-colors flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                      </svg>
                      Acheter une licence
                    </button>
                  </Link>
                )}
              </div>
            );
          })}

          {products.length === 0 && !error && (
            <div className="text-gray-400 col-span-2">Aucun robot disponible.</div>
          )}
        </div>
      )}

      {/* Installation Guide */}
      <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-6 mt-8">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Guide d&apos;installation rapide
        </h3>
        <ol className="space-y-3 text-sm text-gray-400">
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] text-xs font-bold shrink-0 mt-0.5">1</span>
            <span>Téléchargez le fichier <code className="text-[#D4AF37] bg-[#D4AF37]/10 px-1.5 py-0.5 rounded text-xs">.ex5</code> ci-dessus.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] text-xs font-bold shrink-0 mt-0.5">2</span>
            <span>Ouvrez MetaTrader 5 et allez dans <strong className="text-white">Fichier → Ouvrir le dossier de données</strong>.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] text-xs font-bold shrink-0 mt-0.5">3</span>
            <span>Placez le fichier dans le dossier <code className="text-[#D4AF37] bg-[#D4AF37]/10 px-1.5 py-0.5 rounded text-xs">MQL5/Experts</code>.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] text-xs font-bold shrink-0 mt-0.5">4</span>
            <span>Allez dans <strong className="text-white">Outils → Options → Expert Advisors</strong> et autorisez le WebRequest pour l&apos;URL de votre licence.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] text-xs font-bold shrink-0 mt-0.5">5</span>
            <span>Glissez l&apos;EA sur un graphique XAU/USD et activez le trading automatique. 🚀</span>
          </li>
        </ol>
      </div>
    </div>
  );
}
