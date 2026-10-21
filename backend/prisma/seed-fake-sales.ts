import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Nettoyage des anciennes fausses ventes...');
  // 1. Récupérer les utilisateurs à supprimer
  const usersToDelete = await prisma.user.findMany({
    where: { email: { contains: '.test@' } },
    select: { id: true },
  });
  const userIds = usersToDelete.map(u => u.id);

  if (userIds.length > 0) {
    // Supprimer les paiements liés à ces utilisateurs
    await prisma.payment.deleteMany({
      where: { userId: { in: userIds } },
    });
    // Supprimer les licences liées à ces utilisateurs
    await prisma.license.deleteMany({
      where: { userId: { in: userIds } },
    });
    // Supprimer les utilisateurs
    await prisma.user.deleteMany({
      where: { id: { in: userIds } },
    });
  }

  console.log('Création des nouvelles fausses ventes...');

  const product = await prisma.product.findFirst({
    where: { slug: 'GOLD_SCALPER' },
  });

  if (!product) {
    console.error("Produit introuvable. Veuillez exécuter 'npm run seed' d'abord.");
    return;
  }

  const plans = await prisma.productPlan.findMany({
    where: { productId: product.id },
  });

  if (plans.length === 0) {
    console.error("Aucun plan trouvé pour le produit.");
    return;
  }

  // Filtrer les plans pour privilégier Starter, Standard et Pro
  const starterPlan = plans.find(p => p.name.toLowerCase() === 'starter');
  const standardPlan = plans.find(p => p.name.toLowerCase() === 'standard');
  const proPlan = plans.find(p => p.name.toLowerCase() === 'pro');

  const firstNames = ['Jean', 'Marc', 'Ahmed', 'Sophie', 'Lucas', 'Amadou', 'Marie', 'Paul', 'Karim', 'Awa', 'Fatou', 'Moussa', 'Oumar', 'Aliou', 'Sarah', 'Koffi', 'Yao', 'Aminata', 'Ismael', 'David'];
  const lastNames = ['Dupont', 'Kouassi', 'Sylla', 'Martin', 'Dubois', 'Diallo', 'Ndiaye', 'Touré', 'Traoré', 'Bamba', 'Koné', 'Coulibaly', 'Keita', 'Diop', 'Fall', 'Sow', 'Cissé', 'Camara', 'Bakayoko', 'Mensah'];

  let createdCount = 0;
  const targetSales = 25;

  for (let i = 0; i < targetSales; i++) {
    const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const fakeName = `${randomFirstName} ${randomLastName}`;
    const fakeEmail = `${randomFirstName.toLowerCase()}.${randomLastName.toLowerCase()}${i}.test@gmail.com`;

    // 1. Choisir le plan
    // Privilégier Starter (40%) et Standard (40%), et quelques Pro (20%)
    let selectedPlan = starterPlan || plans[0];
    const planRand = Math.random();
    if (planRand > 0.8 && proPlan) {
      selectedPlan = proPlan;
    } else if (planRand > 0.4 && standardPlan) {
      selectedPlan = standardPlan;
    } else if (planRand > 0.4 && !standardPlan && starterPlan) {
      selectedPlan = starterPlan; // Fallback si pas de Standard
    }

    // 2. Choisir la durée (1 semaine ou 1 mois)
    // 60% mensuel, 40% hebdomadaire
    const isMonthly = Math.random() > 0.4;
    const durationDays = isMonthly ? 30 : 7;
    
    // Récupérer le prix depuis le JSON (fallback sur une valeur par défaut si non trouvé)
    let amount = isMonthly ? 50 : 15; // Prix par défaut
    try {
      const prices = JSON.parse(selectedPlan.prices);
      if (isMonthly && prices.monthly) amount = prices.monthly;
      else if (!isMonthly && prices.weekly) amount = prices.weekly;
      else amount = isMonthly ? 50 : 25; // fallback
    } catch (e) {}

    // 3. Générer la date de création (réparti sur les 30 derniers jours)
    const randomDaysAgo = Math.floor(Math.random() * 30);
    const fakeDate = new Date();
    fakeDate.setDate(fakeDate.getDate() - randomDaysAgo);

    // 4. Calculer la date d'expiration
    const expiresAt = new Date(fakeDate);
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        name: fakeName,
        email: fakeEmail,
        role: 'CLIENT',
        preferredCurrency: 'USD',
        createdAt: fakeDate,
      },
    });

    // Créer la licence
    const license = await prisma.license.create({
      data: {
        userId: user.id,
        productId: product.id,
        planId: selectedPlan.id,
        status: expiresAt > new Date() ? 'ACTIVE' : 'EXPIRED', // Ajuster le statut si déjà expiré
        lotAllowed: selectedPlan.lotAllowed,
        createdAt: fakeDate,
        expiresAt: expiresAt,
      },
    });

    // Créer le paiement (COMPLETED)
    await prisma.payment.create({
      data: {
        userId: user.id,
        licenseId: license.id,
        amount: amount,
        currency: 'USD',
        status: 'COMPLETED',
        provider: Math.random() > 0.5 ? 'NOWPAYMENTS' : 'KPAY', // Alterne les moyens de paiement
        providerTxId: 'FAKE_TX_' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        createdAt: fakeDate,
      },
    });

    createdCount++;
  }

  console.log(`✅ Succès : ${createdCount} fausses ventes (avec des plans d'une semaine et d'un mois) ont été générées !`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
