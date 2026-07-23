'use client';
import Link from "next/link";

export default function RiskPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-[#0F1115]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#AA8B2C] flex items-center justify-center">
                <span className="text-black font-bold text-lg leading-none">G</span>
              </div>
              <span className="font-bold text-xl tracking-tight">Gold Trading Bot</span>
            </Link>
            <Link href="/" className="text-sm text-gray-400 hover:text-[#D4AF37] transition-colors">
              ← Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold mb-2">Avertissement sur les Risques</h1>
        <p className="text-gray-500 text-sm mb-12">Dernière mise à jour : Juillet 2026</p>

        {/* Main Warning Banner */}
        <div className="bg-red-500/10 border-2 border-red-500/30 rounded-2xl p-8 mb-12 text-center">
          <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-400 mb-4">
            ⚠️ AVERTISSEMENT IMPORTANT
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Le trading sur les marchés financiers, y compris le trading de l&apos;or (XAU/USD) sur le marché 
            des changes (Forex), comporte un <strong className="text-red-400">risque élevé de perte en capital</strong>. 
            Il est possible de perdre la totalité de votre investissement initial.
          </p>
        </div>

        <div className="space-y-10 text-gray-300 leading-relaxed">
          {/* Section 1 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 text-sm font-bold">1</span>
              Risques liés au Trading Forex
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">●</span>
                <p><strong className="text-white">Effet de levier :</strong> Le trading sur le Forex utilise un effet de levier qui peut amplifier aussi bien les gains que les pertes. Un mouvement défavorable du marché peut entraîner des pertes supérieures à votre mise initiale.</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">●</span>
                <p><strong className="text-white">Volatilité du marché de l&apos;or :</strong> Le prix de l&apos;or (XAU/USD) est particulièrement volatile et peut subir des variations rapides et imprévisibles, notamment lors d&apos;annonces économiques majeures.</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">●</span>
                <p><strong className="text-white">Risque de liquidité :</strong> Dans certaines conditions de marché extrêmes, il peut être impossible d&apos;exécuter des ordres aux prix souhaités (slippage).</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">●</span>
                <p><strong className="text-white">Risque technique :</strong> Des interruptions de connexion internet, des pannes de serveur ou des dysfonctionnements de la plateforme MT5 peuvent empêcher l&apos;exécution correcte des ordres.</p>
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 text-sm font-bold">2</span>
              Risques liés au Trading Automatisé (EA)
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">●</span>
                <p><strong className="text-white">Aucune garantie de profit :</strong> L&apos;Expert Advisor JMEgold Scalper EA est un outil algorithmique. Il ne garantit en aucun cas des profits et peut générer des pertes.</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">●</span>
                <p><strong className="text-white">Performances passées :</strong> Les résultats passés (y compris les résultats de backtests) ne sont pas un indicateur fiable des performances futures. Les conditions de marché changent constamment.</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">●</span>
                <p><strong className="text-white">Dépendance technologique :</strong> Le Robot nécessite une connexion internet stable et un VPS (serveur virtuel) pour fonctionner de manière optimale 24h/24. Toute interruption peut entraîner des positions non gérées.</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">●</span>
                <p><strong className="text-white">Conditions de marché :</strong> Le Robot a été conçu pour des conditions de marché spécifiques. Il peut ne pas être adapté à toutes les conditions (fortes tendances, marchés en range, faible liquidité).</p>
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] text-sm font-bold">3</span>
              Recommandations
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-[#0F1115] border border-white/10 rounded-xl p-5">
                <h4 className="text-white font-semibold mb-2">💰 Capital à risque</h4>
                <p className="text-sm text-gray-400">N&apos;investissez que de l&apos;argent que vous pouvez vous permettre de perdre en totalité.</p>
              </div>
              <div className="bg-[#0F1115] border border-white/10 rounded-xl p-5">
                <h4 className="text-white font-semibold mb-2">📊 Formez-vous</h4>
                <p className="text-sm text-gray-400">Assurez-vous de comprendre les mécanismes du trading Forex et de l&apos;effet de levier avant d&apos;utiliser le Robot.</p>
              </div>
              <div className="bg-[#0F1115] border border-white/10 rounded-xl p-5">
                <h4 className="text-white font-semibold mb-2">🧪 Testez d&apos;abord</h4>
                <p className="text-sm text-gray-400">Utilisez un compte de démonstration (démo) avant de trader en réel pour vous familiariser avec le Robot.</p>
              </div>
              <div className="bg-[#0F1115] border border-white/10 rounded-xl p-5">
                <h4 className="text-white font-semibold mb-2">👨‍💼 Conseil professionnel</h4>
                <p className="text-sm text-gray-400">Consultez un conseiller financier indépendant si vous avez le moindre doute sur l&apos;adéquation de ce produit à votre situation.</p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 text-sm font-bold">4</span>
              Déclaration de Non-Responsabilité
            </h2>
            <div className="bg-[#0F1115] border border-white/10 rounded-xl p-6">
              <p className="mb-4">
                Gold Trading Bot et ses administrateurs, employés et affiliés :
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-400">
                <li>Ne fournissent <strong className="text-white">aucun conseil en investissement</strong>.</li>
                <li>Ne sont <strong className="text-white">pas un courtier (broker)</strong> réglementé.</li>
                <li>Ne garantissent <strong className="text-white">aucun rendement ni profit</strong>.</li>
                <li>Ne sont <strong className="text-white">pas responsables des pertes financières</strong> résultant de l&apos;utilisation du Robot.</li>
              </ul>
              <p className="mt-4 text-sm">
                En achetant et en utilisant le Robot, vous reconnaissez avoir lu, compris et accepté 
                les risques décrits dans ce document, et vous assumez l&apos;entière responsabilité de vos 
                décisions de trading.
              </p>
            </div>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-wrap gap-6 text-sm text-gray-500">
          <Link href="/terms" className="hover:text-[#D4AF37] transition-colors">Conditions Générales de Vente</Link>
          <Link href="/privacy" className="hover:text-[#D4AF37] transition-colors">Politique de Confidentialité</Link>
          <Link href="/" className="hover:text-[#D4AF37] transition-colors">Accueil</Link>
        </div>
      </div>
    </div>
  );
}
