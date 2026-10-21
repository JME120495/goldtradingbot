import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Nettoyage des fausses ventes...');
  
  // 1. Récupérer les utilisateurs à supprimer (ceux avec .test@)
  const usersToDelete = await prisma.user.findMany({
    where: { email: { contains: '.test@' } },
    select: { id: true },
  });
  const userIds = usersToDelete.map(u => u.id);

  if (userIds.length > 0) {
    console.log(`Suppression de ${userIds.length} faux utilisateurs et leurs ventes associées...`);
    
    // Supprimer les paiements liés à ces utilisateurs
    const deletedPayments = await prisma.payment.deleteMany({
      where: { userId: { in: userIds } },
    });
    console.log(`- ${deletedPayments.count} faux paiements supprimés`);

    // Supprimer les licences liées à ces utilisateurs
    const deletedLicenses = await prisma.license.deleteMany({
      where: { userId: { in: userIds } },
    });
    console.log(`- ${deletedLicenses.count} fausses licences supprimées`);

    // Supprimer les utilisateurs
    const deletedUsers = await prisma.user.deleteMany({
      where: { id: { in: userIds } },
    });
    console.log(`- ${deletedUsers.count} faux utilisateurs supprimés`);
  } else {
    console.log("Aucune fausse vente trouvée (les utilisateurs .test@ n'existent pas).");
  }

  // 2. Vérification des vrais utilisateurs restants
  const realUsers = await prisma.user.count({
    where: { NOT: { email: { contains: '.test@' } } }
  });
  
  const realPayments = await prisma.payment.count({
    where: { NOT: { user: { email: { contains: '.test@' } } } }
  });

  const realLicenses = await prisma.license.count({
    where: { NOT: { user: { email: { contains: '.test@' } } } }
  });

  console.log('\n✅ Terminé ! Seules les VRAIES données sont désormais dans la base :');
  console.log(`- Vrais utilisateurs : ${realUsers}`);
  console.log(`- Vraies licences : ${realLicenses}`);
  console.log(`- Vrais paiements : ${realPayments}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
