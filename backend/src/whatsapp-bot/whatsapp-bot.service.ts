import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

@Injectable()
export class WhatsappBotService {
  private readonly logger = new Logger(WhatsappBotService.name);
  private genAI: GoogleGenerativeAI;
  
  // Simple in-memory session store to remember context (phone -> history)
  private sessions = new Map<string, any[]>();

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || '';
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  // ----------------------------------------------------------
  // Process Incoming Webhook from Meta WhatsApp API
  // ----------------------------------------------------------
  async handleIncomingMessage(body: any) {
    try {
      // Parse the Meta WhatsApp Webhook payload
      if (body.object !== 'whatsapp_business_account') {
        return; // Not a WhatsApp event
      }

      for (const entry of body.entry) {
        for (const change of entry.changes) {
          const value = change.value;
          
          if (value.messages && value.messages.length > 0) {
            const message = value.messages[0];
            const senderPhone = message.from;
            
            // Only process text messages for now
            if (message.type === 'text') {
              const text = message.text.body;
              this.logger.log(`Received message from ${senderPhone}: ${text}`);
              
              // Generate AI response and reply
              await this.processAndReply(senderPhone, text);
            }
          }
        }
      }
    } catch (error) {
      this.logger.error('Error handling WhatsApp message', error);
    }
  }

  // ----------------------------------------------------------
  // Generate Response with Gemini and Send
  // ----------------------------------------------------------
  private async processAndReply(phone: string, userText: string) {
    try {
      // 1. Get or create chat history for this user
      if (!this.sessions.has(phone)) {
        this.sessions.set(phone, []);
      }
      const history = this.sessions.get(phone);

      // System Prompt (Context for the AI)
      const systemPrompt = `
Tu es l'assistant virtuel officiel de "Gold Trading Bot", un robot de trading automatisé très performant (Expert Advisor pour MetaTrader 5).
Ton rôle est de répondre aux questions des prospects (qui viennent souvent de Facebook) de manière polie, professionnelle et concise.
Tu dois utiliser le vouvoiement. 

INFORMATIONS CLÉS SUR LE PRODUIT :
- Nom : Gold Trading Bot (ou GoldScalper)
- Plateforme requise : MetaTrader 5 (MT5) exclusivement.
- Fonctionnement : Le bot analyse le marché de l'or (XAUUSD) et passe des trades automatiquement pour générer du profit.
- Marché ciblé : Uniquement l'Or (XAUUSD).
- Dépôt minimum recommandé : 100$.

BROKERS ET RECOMMANDATIONS :
- Nous recommandons fortement le broker Fusion Markets, car c'est avec eux que nous avons fait tous nos tests et obtenu les meilleurs résultats. 
- Voici notre lien d'affiliation Fusion Markets pour vous inscrire : [INSERER_LIEN_AFFILIATION_FUSION_MARKETS]
- Toutefois, le client n'est pas obligé d'utiliser Fusion Markets, le robot fonctionne avec tous les brokers.

PRIX ET LICENCES (Durées : 1 Semaine, 1 Mois, 6 Mois, 1 An) :
- Plan Starter (Lot max 0.01, Capital min 100$) : 25$/semaine, 79$/mois, 399$/6 mois, 699$/an.
- Plan Standard (Lot max 0.10, Capital min 1000$) : 49$/semaine, 149$/mois, 749$/6 mois, 1299$/an.
- Plan Pro (Lot max 0.50, Capital min 5000$) : 99$/semaine, 299$/mois, 1499$/6 mois, 2599$/an.
- Plan VIP (Lot max 1.00, Capital min 10000$) : 199$/semaine, 599$/mois, 2999$/6 mois, 4999$/an.
- Mode de paiement : Crypto-monnaie ou Mobile Money Africain. (Ne cite jamais de nom de plateforme ou d'agrégateur).

RENTABILITÉ (À MENTIONNER SI ON DEMANDE) :
- Précise que nos tests depuis plus de 6 mois ont montré que même avec le plus petit plan (Starter), le robot ne donne pas des gains inférieurs à 20$ la journée.

COMMENT ACHETER / DÉMARRER :
Si le client veut démarrer, dis-lui de se rendre sur le site officiel : https://goldtradingboot.shop
Il devra s'inscrire, payer sa licence, puis ajouter son numéro de compte MT5 dans son espace client pour activer le robot. Le fichier du robot est téléchargeable dans l'espace client.
Tu dois aussi l'inviter à rejoindre notre groupe WhatsApp en disant : "Vous pouvez suivre nos positions et voir la démonstration du robot en intégrant le groupe WhatsApp : [INSERER_LIEN_GROUPE_WHATSAPP]"

INSTRUCTIONS DE RÉPONSE :
- Sois bref et direct (c'est WhatsApp, les gens n'aiment pas les longs textes).
- Ne donne pas d'informations fausses ou inventées.
- Si on te demande des choses techniques hors de ton périmètre, dis de contacter le support technique sur le site.
      `.trim();

      // Combine history with current prompt
      const model = this.genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        systemInstruction: systemPrompt 
      });

      const chat = model.startChat({
        history: history,
      });

      // 2. Generate AI response
      const result = await chat.sendMessage(userText);
      const aiResponse = result.response.text();
      
      // Update history (save last 10 messages max to avoid huge memory)
      history.push({ role: 'user', parts: [{ text: userText }] });
      history.push({ role: 'model', parts: [{ text: aiResponse }] });
      if (history.length > 20) history.splice(0, 2);

      this.logger.log(`AI Response for ${phone}: ${aiResponse}`);

      // 3. Send response via WhatsApp API
      await this.sendWhatsAppMessage(phone, aiResponse);
      
    } catch (error) {
      this.logger.error('Error generating AI response:', error);
      await this.sendWhatsAppMessage(phone, "Désolé, je rencontre une petite difficulté technique. Veuillez patienter ou vous rendre sur https://goldtradingboot.shop.");
    }
  }

  // ----------------------------------------------------------
  // Send Message via Meta WhatsApp API
  // ----------------------------------------------------------
  private async sendWhatsAppMessage(toPhone: string, text: string) {
    const token = process.env.WHATSAPP_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!token || !phoneNumberId) {
      this.logger.warn('WhatsApp API not configured. Message not sent.');
      return;
    }

    try {
      const url = \`https://graph.facebook.com/v19.0/\${phoneNumberId}/messages\`;
      
      const payload = {
        messaging_product: 'whatsapp',
        to: toPhone,
        type: 'text',
        text: { body: text },
      };

      await axios.post(url, payload, {
        headers: {
          Authorization: \`Bearer \${token}\`,
          'Content-Type': 'application/json',
        },
      });
      
    } catch (error: any) {
      this.logger.error(
        'Failed to send WhatsApp message', 
        error.response?.data || error.message
      );
    }
  }
}
