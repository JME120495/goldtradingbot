'use client';
import Link from "next/link";

export default function TermsPage() {
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
        <h1 className="text-4xl font-bold mb-2">Conditions Générales de Vente</h1>
        <p className="text-gray-500 text-sm mb-12">Dernière mise à jour : Juillet 2026</p>

        <div className="space-y-10 text-gray-300 leading-relaxed">
          {/* Article 1 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] text-sm font-bold">1</span>
              Objet
            </h2>
            <p>
              Les présentes Conditions Générales de Vente (ci-après &quot;CGV&quot;) régissent la vente de licences 
              d&apos;utilisation du logiciel Expert Advisor &quot;JMEgold Scalper EA&quot; (ci-après &quot;le Robot&quot; ou &quot;l&apos;EA&quot;) 
              via le site internet Gold Trading Bot (ci-après &quot;le Site&quot;).
            </p>
            <p className="mt-3">
              En passant commande sur le Site, le client (ci-après &quot;l&apos;Utilisateur&quot;) accepte sans réserve 
              les présentes CGV.
            </p>
          </section>

          {/* Article 2 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] text-sm font-bold">2</span>
              Produits et Services
            </h2>
            <p>
              Le Site propose la vente de licences d&apos;utilisation d&apos;un Expert Advisor (EA) pour la plateforme 
              MetaTrader 5 (MT5), destiné au trading automatisé sur l&apos;or (XAU/USD).
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2 text-gray-400">
              <li>Les licences sont proposées sous différents plans (Starter, Standard, Pro, VIP) avec des tailles de lots maximales différentes.</li>
              <li>Chaque licence est liée à un numéro de compte MT5 unique.</li>
              <li>Les licences sont vendues pour des durées déterminées (hebdomadaire, mensuelle, semestrielle, annuelle).</li>
            </ul>
          </section>

          {/* Article 3 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] text-sm font-bold">3</span>
              Prix et Paiement
            </h2>
            <p>
              Les prix sont indiqués en dollars américains (USD) et sont susceptibles d&apos;être modifiés à tout moment. 
              Le prix applicable est celui affiché au moment de la commande.
            </p>
            <p className="mt-3">
              Le paiement est effectué exclusivement en cryptomonnaie via notre prestataire de paiement sécurisé. 
              La licence est activée automatiquement après confirmation du paiement par le réseau blockchain.
            </p>
          </section>

          {/* Article 4 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] text-sm font-bold">4</span>
              Livraison
            </h2>
            <p>
              Après validation du paiement, l&apos;Utilisateur peut télécharger le fichier du Robot (.ex5) 
              depuis son espace client sur le Site. La livraison est considérée comme effectuée dès que 
              le fichier est mis à disposition dans l&apos;espace de téléchargement.
            </p>
          </section>

          {/* Article 5 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] text-sm font-bold">5</span>
              Droit de Rétractation et Remboursement
            </h2>
            <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-xl p-4">
              <p className="text-[#D4AF37] font-semibold mb-2">⚠️ Important</p>
              <p>
                Conformément à la législation en vigueur concernant les contenus numériques, le droit de 
                rétractation ne s&apos;applique pas une fois que le téléchargement du logiciel a été effectué. 
                En procédant au téléchargement, l&apos;Utilisateur reconnaît renoncer expressément à son droit de rétractation.
              </p>
            </div>
            <p className="mt-3">
              Aucun remboursement ne sera accordé après le téléchargement du fichier EA. 
              En cas de dysfonctionnement technique avéré du Robot, un échange ou une extension de licence 
              pourra être envisagé au cas par cas par le support client.
            </p>
          </section>

          {/* Article 6 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] text-sm font-bold">6</span>
              Licence d&apos;Utilisation
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li>La licence est personnelle, non transférable et non cessible.</li>
              <li>L&apos;Utilisateur s&apos;engage à ne pas redistribuer, copier, décompiler ou rétro-ingénierer le Robot.</li>
              <li>Toute violation de ces conditions entraînera la révocation immédiate de la licence sans remboursement.</li>
              <li>La licence est valable uniquement pour le numéro de compte MT5 enregistré lors de l&apos;achat.</li>
            </ul>
          </section>

          {/* Article 7 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] text-sm font-bold">7</span>
              Limitation de Responsabilité
            </h2>
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
              <p className="text-red-400 font-semibold mb-2">🔴 Avertissement</p>
              <p>
                Le trading sur les marchés financiers comporte des risques importants de perte en capital. 
                Le Robot est un outil d&apos;aide à la décision et ne garantit en aucun cas des profits. 
                Les performances passées ne préjugent pas des performances futures.
              </p>
            </div>
            <p className="mt-3">
              Le vendeur ne saurait être tenu responsable des pertes financières subies par l&apos;Utilisateur 
              lors de l&apos;utilisation du Robot, quelle qu&apos;en soit la cause (conditions de marché défavorables, 
              mauvaise configuration, problèmes de connectivité, etc.).
            </p>
          </section>

          {/* Article 8 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] text-sm font-bold">8</span>
              Support Technique
            </h2>
            <p>
              Un support technique est proposé pour aider à l&apos;installation et à la configuration du Robot. 
              Le support est accessible via le chat en direct sur le Site ou par email. 
              Le support ne couvre pas les conseils en investissement ni les recommandations de trading.
            </p>
          </section>

          {/* Article 9 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] text-sm font-bold">9</span>
              Modifications
            </h2>
            <p>
              Le vendeur se réserve le droit de modifier les présentes CGV à tout moment. 
              Les CGV applicables sont celles en vigueur au moment de la commande. L&apos;Utilisateur 
              sera informé de toute modification substantielle par email ou via son espace client.
            </p>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-wrap gap-6 text-sm text-gray-500">
          <Link href="/privacy" className="hover:text-[#D4AF37] transition-colors">Politique de Confidentialité</Link>
          <Link href="/risk" className="hover:text-[#D4AF37] transition-colors">Avertissement sur les Risques</Link>
          <Link href="/" className="hover:text-[#D4AF37] transition-colors">Accueil</Link>
        </div>
      </div>
    </div>
  );
}
