'use client';
import Link from "next/link";

export default function PrivacyPage() {
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
        <h1 className="text-4xl font-bold mb-2">Politique de Confidentialité</h1>
        <p className="text-gray-500 text-sm mb-12">Dernière mise à jour : Juillet 2026</p>

        <div className="space-y-10 text-gray-300 leading-relaxed">
          {/* Section 1 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] text-sm font-bold">1</span>
              Données Collectées
            </h2>
            <p>
              Dans le cadre de l&apos;utilisation du Site et de nos services, nous collectons les données suivantes :
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2 text-gray-400">
              <li><strong className="text-white">Données d&apos;inscription :</strong> nom, adresse email, numéro de téléphone (optionnel).</li>
              <li><strong className="text-white">Données de trading :</strong> numéro(s) de compte MT5, nom du courtier (broker).</li>
              <li><strong className="text-white">Données de paiement :</strong> identifiant de transaction crypto. Nous ne stockons aucune clé privée ni information de portefeuille.</li>
              <li><strong className="text-white">Données techniques :</strong> adresse IP, type de navigateur, pages visitées (à des fins d&apos;analyse et de sécurité).</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] text-sm font-bold">2</span>
              Utilisation des Données
            </h2>
            <p>Vos données sont utilisées pour :</p>
            <ul className="list-disc list-inside mt-3 space-y-2 text-gray-400">
              <li>Créer et gérer votre compte utilisateur.</li>
              <li>Activer et valider votre licence d&apos;utilisation du Robot.</li>
              <li>Traiter vos paiements et vous envoyer des confirmations.</li>
              <li>Vous fournir un support technique.</li>
              <li>Améliorer nos services et la sécurité du Site.</li>
            </ul>
            <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-xl p-4 mt-4">
              <p className="text-[#D4AF37] font-semibold mb-1">🔒 Engagement</p>
              <p className="text-sm">
                Nous ne vendons, ne louons et ne partageons jamais vos données personnelles avec des tiers 
                à des fins commerciales ou publicitaires.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] text-sm font-bold">3</span>
              Sécurité des Données
            </h2>
            <p>
              Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées 
              pour protéger vos données contre tout accès non autorisé, altération, divulgation ou destruction :
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2 text-gray-400">
              <li>Chiffrement des mots de passe (hachage Argon2).</li>
              <li>Connexions sécurisées via HTTPS/TLS.</li>
              <li>Authentification par jetons JWT avec rotation automatique.</li>
              <li>Accès restreint aux bases de données.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] text-sm font-bold">4</span>
              Cookies
            </h2>
            <p>
              Le Site utilise des cookies strictement nécessaires au fonctionnement du service 
              (authentification, préférences de langue). Aucun cookie publicitaire ou de suivi 
              tiers n&apos;est utilisé.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] text-sm font-bold">5</span>
              Vos Droits
            </h2>
            <p>Conformément aux réglementations en vigueur, vous disposez des droits suivants :</p>
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="bg-[#0F1115] border border-white/10 rounded-xl p-4">
                <h4 className="text-white font-semibold mb-1">📋 Droit d&apos;accès</h4>
                <p className="text-sm text-gray-400">Obtenir une copie de toutes les données que nous détenons à votre sujet.</p>
              </div>
              <div className="bg-[#0F1115] border border-white/10 rounded-xl p-4">
                <h4 className="text-white font-semibold mb-1">✏️ Droit de rectification</h4>
                <p className="text-sm text-gray-400">Corriger toute information inexacte ou incomplète.</p>
              </div>
              <div className="bg-[#0F1115] border border-white/10 rounded-xl p-4">
                <h4 className="text-white font-semibold mb-1">🗑️ Droit de suppression</h4>
                <p className="text-sm text-gray-400">Demander la suppression de vos données personnelles.</p>
              </div>
              <div className="bg-[#0F1115] border border-white/10 rounded-xl p-4">
                <h4 className="text-white font-semibold mb-1">📦 Droit de portabilité</h4>
                <p className="text-sm text-gray-400">Recevoir vos données dans un format lisible et structuré.</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-400">
              Pour exercer l&apos;un de ces droits, contactez-nous via le chat en direct sur le Site 
              ou par email à notre adresse de support.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] text-sm font-bold">6</span>
              Conservation des Données
            </h2>
            <p>
              Vos données personnelles sont conservées pendant la durée de votre inscription sur le Site, 
              puis pendant une durée maximale de 3 ans après la clôture de votre compte, conformément 
              aux obligations légales et comptables.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] text-sm font-bold">7</span>
              Modifications
            </h2>
            <p>
              Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. 
              Toute modification sera publiée sur cette page avec une date de mise à jour. 
              En cas de changement substantiel, les utilisateurs seront informés via leur espace client.
            </p>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-wrap gap-6 text-sm text-gray-500">
          <Link href="/terms" className="hover:text-[#D4AF37] transition-colors">Conditions Générales de Vente</Link>
          <Link href="/risk" className="hover:text-[#D4AF37] transition-colors">Avertissement sur les Risques</Link>
          <Link href="/" className="hover:text-[#D4AF37] transition-colors">Accueil</Link>
        </div>
      </div>
    </div>
  );
}
