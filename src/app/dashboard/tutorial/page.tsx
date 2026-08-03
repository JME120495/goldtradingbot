'use client';

import { useTranslations } from 'next-intl';

export default function TutorialPage() {
  const t = useTranslations('Dashboard');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-2">{t('tutorial', { fallback: 'Tutoriel d\'Installation' })}</h1>
        <p className="text-gray-400">
          Suivez attentivement cette vidéo pour installer et configurer l'Expert Advisor sur votre plateforme de trading.
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-bold mb-4 text-[#D4AF37] flex items-center gap-2">
            📺 Tutoriel d'Installation (Général)
          </h2>
          <div className="bg-[#0F1115] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative group">
            <div className="relative w-full rounded-2xl overflow-hidden bg-black">
              <video 
                className="w-full h-auto"
                controls
                controlsList="nodownload"
                preload="metadata"
                poster="/images/video-thumbnail.jpg"
              >
                <source src="/videos/tutorial.mp4" type="video/mp4" />
                Votre navigateur ne supporte pas la lecture de vidéos.
              </video>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4 text-[#D4AF37] flex items-center gap-2">
            🇫🇷 Tutoriel en Français
          </h2>
          <div className="bg-[#0F1115] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative group">
            <div className="relative w-full rounded-2xl overflow-hidden bg-black">
              {/* Remplacez le fichier tutorial-fr.mp4 dans le dossier public/videos de votre projet */}
              <video 
                className="w-full h-auto"
                controls
                controlsList="nodownload"
                preload="metadata"
                poster="/images/video-thumbnail-fr.jpg" /* Optionnel : image de miniature */
              >
                <source src="/videos/tutorial-fr.mp4" type="video/mp4" />
                Votre navigateur ne supporte pas la lecture de vidéos.
              </video>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4 text-[#D4AF37] flex items-center gap-2">
            🇬🇧 English Tutorial
          </h2>
          <div className="bg-[#0F1115] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative group">
            <div className="relative w-full rounded-2xl overflow-hidden bg-black">
              {/* Remplacez le fichier tutorial-en.mp4 dans le dossier public/videos de votre projet */}
              <video 
                className="w-full h-auto"
                controls
                controlsList="nodownload"
                preload="metadata"
                poster="/images/video-thumbnail-en.jpg" /* Optionnel : image de miniature */
              >
                <source src="/videos/tutorial-en.mp4" type="video/mp4" />
                Your browser does not support video playback.
              </video>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#0F1115] border border-[#D4AF37]/30 rounded-2xl p-6 mt-8">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#D4AF37]">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Points importants à retenir
        </h3>
        <ul className="space-y-4 text-gray-300">
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 mt-2 rounded-full bg-[#D4AF37] shrink-0"></div>
            <p>Assurez-vous d'avoir téléchargé la dernière version de l'Expert Advisor depuis la page <strong>Téléchargements</strong>.</p>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 mt-2 rounded-full bg-[#D4AF37] shrink-0"></div>
            <p>Autorisez le WebRequest (AutoTrading) dans les options de MetaTrader 5 en cochant la case <strong>"Autoriser le trading algorithmique"</strong>.</p>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 mt-2 rounded-full bg-[#D4AF37] shrink-0"></div>
            <p>Glissez-déposez le robot sur un graphique M1 ou M5 (selon les recommandations) de la paire XAUUSD (Gold).</p>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 mt-2 rounded-full bg-[#D4AF37] shrink-0"></div>
            <p>Entrez votre adresse email associée à votre compte Gold Scalper dans les paramètres du robot pour valider votre licence.</p>
          </li>
        </ul>
      </div>
    </div>
  );
}
