'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, Suspense } from 'react';
import axios from 'axios';

function MockCheckout() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const tx_ref = searchParams.get('tx_ref');
  const amount = searchParams.get('amount');
  const productId = searchParams.get('productId');
  const planId = searchParams.get('planId');
  const duration = searchParams.get('duration');

  const handleSimulatePayment = async (status: 'successful' | 'failed') => {
    setLoading(true);
    try {
      const payload = {
        event: 'charge.completed',
        data: {
          tx_ref,
          status,
          amount,
          meta: { productId, planId, duration }
        }
      };
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      await axios.post(`${apiUrl}/payments/webhook`, payload);
      
      alert(`Paiement simulé avec succès (${status})`);
      router.push('/dashboard/downloads');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la simulation du paiement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-8 rounded-xl shadow-xl max-w-md w-full border border-gray-700">
      <h1 className="text-2xl font-bold mb-6 text-center text-yellow-500">MOCK Flutterwave Gateway</h1>
      
      <div className="space-y-4 mb-8 text-sm">
        <div className="flex justify-between border-b border-gray-700 pb-2">
          <span className="text-gray-400">Transaction Ref:</span>
          <span className="font-mono">{tx_ref}</span>
        </div>
        <div className="flex justify-between border-b border-gray-700 pb-2">
          <span className="text-gray-400">Montant:</span>
          <span className="font-bold text-green-400">${amount}</span>
        </div>
      </div>

      <div className="space-y-3">
        <button 
          onClick={() => handleSimulatePayment('successful')}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Traitement...' : 'Simuler un paiement RÉUSSI'}
        </button>
        
        <button 
          onClick={() => handleSimulatePayment('failed')}
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Traitement...' : 'Simuler un paiement ÉCHOUÉ'}
        </button>
      </div>
      
      <p className="text-xs text-center text-gray-500 mt-6">
        Ceci est une page de test car les vraies clés Flutterwave ne sont pas encore configurées.
      </p>
    </div>
  );
}

export default function MockFlutterwavePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <Suspense fallback={<div>Chargement...</div>}>
        <MockCheckout />
      </Suspense>
    </div>
  );
}
