import { PrismaClient } from '@prisma/client';

async function testSubscription() {
  const prisma = new PrismaClient();
  try {
    console.log('--- DEBUT DU TEST DE SOUSCRIPTION ---');

    // 1. Trouver ou créer un utilisateur
    let user = await prisma.user.findFirst();
    if (!user) {
      console.error('❌ Aucun utilisateur trouvé. Veuillez créer un utilisateur d\'abord.');
      return;
    } else {
      console.log('✅ Utilisateur de test trouvé:', user.email);
    }

    // 2. Trouver le premier produit et plan disponibles
    const product = await prisma.product.findFirst();
    const plan = await prisma.productPlan.findFirst({
      where: { name: 'Starter' }
    });

    if (!product || !plan) {
      throw new Error('Aucun produit ou plan "Starter" trouvé dans la base.');
    }
    console.log(`✅ Produit (${product.name}) et Plan (${plan.name}) trouvés.`);

    // 3. Créer un paiement PENDING comme si initié par initiatePayment
    const duration = 'weekly';
    const txRef = `GTB_${Date.now()}_${product.id}_${plan.id}_${duration}`;

    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount: 79,
        currency: 'USD',
        provider: 'NOWPAYMENTS',
        providerTxId: txRef,
        status: 'PENDING',
      }
    });
    console.log(`✅ Paiement en attente créé. Réf: ${txRef}`);

    // 4. Simuler l'arrivée du Webhook depuis NowPayments
    console.log('🔄 Simulation du Webhook NowPayments en cours...');
    
    const payload = {
      payment_status: 'finished',
      order_id: txRef
    };

    if (payload.payment_status === 'finished') {
      const dbPayment = await prisma.payment.findUnique({ where: { providerTxId: payload.order_id } });
      if (!dbPayment) {
        console.error('Paiement non trouvé');
        return;
      }

      await prisma.payment.update({
        where: { id: dbPayment.id },
        data: { status: 'COMPLETED' }
      });
      console.log('✅ Statut du paiement mis à jour à COMPLETED.');

      const parts = txRef.split('_');
      if (parts.length >= 5) {
        const productId = parts[2];
        const planId = parts[3];
        const pDuration = parts[4];

        let days = 30;
        if (pDuration === 'weekly') days = 7;
        else if (pDuration === 'monthly') days = 30;
        else if (pDuration === 'semiAnnual') days = 182;
        else if (pDuration === 'yearly') days = 365;

        const newLicense = await prisma.license.create({
          data: {
            userId: dbPayment.userId,
            productId: productId,
            planId: planId,
            status: 'ACTIVE',
            lotAllowed: plan.lotAllowed || 0.01,
            expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000) 
          }
        });
        
        console.log('✅ Licence créée automatiquement avec succès !');
        console.log(`   - Limite de lot (lotAllowed) : ${newLicense.lotAllowed}`);
        console.log(`   - Durée attribuée : ${days} jours`);
        console.log(`   - Date d'expiration : ${newLicense.expiresAt?.toISOString()}`);
        console.log(`   - Statut de la licence : ${newLicense.status}`);
      }
    }
    
    console.log('--- FIN DU TEST ---');
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSubscription();
