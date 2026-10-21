const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function syncUserToMt5Licenses(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      tradingAccounts: {
        orderBy: { createdAt: 'asc' },
      },
      licenses: {
        where: { status: 'ACTIVE' },
        include: { plan: true, product: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!user) return;

  const activeLicenses = user.licenses.filter(l => !l.expiresAt || l.expiresAt > new Date());
  let licenseIndex = 0;

  for (const account of user.tradingAccounts) {
    const webLicense = activeLicenses[licenseIndex];
    const accountNumber = BigInt(account.accountNumber);

    if (webLicense) {
      const eaName = 'ALL'; // ALWAYS USE 'ALL' FOR THE NEW EA

      await prisma.mt5License.upsert({
        where: {
          accountNumber_eaName: { accountNumber, eaName },
        },
        create: {
          clientName: user.name || 'Client Web',
          clientEmail: user.email,
          accountNumber,
          broker: account.broker,
          server: account.server || '',
          eaName,
          plan: webLicense.plan.name,
          lot: webLicense.lotAllowed,
          status: 'active',
          expiryDate: webLicense.expiresAt || new Date('2099-12-31'),
        },
        update: {
          clientName: user.name || 'Client Web',
          clientEmail: user.email,
          broker: account.broker,
          server: account.server || '',
          plan: webLicense.plan.name,
          lot: webLicense.lotAllowed,
          status: 'active',
          expiryDate: webLicense.expiresAt || new Date('2099-12-31'),
        },
      });

      await prisma.license.update({
        where: { id: webLicense.id },
        data: { tradingAccountId: account.id }
      });

      console.log(`Synced account ${accountNumber} with plan ${webLicense.plan.name}, expiry: ${webLicense.expiresAt}`);
      licenseIndex++;
    } else {
      try {
         await prisma.mt5License.updateMany({
           where: { accountNumber },
           data: { status: 'suspended' }
         });
      } catch(e) {}
      
      await prisma.license.updateMany({
        where: { tradingAccountId: account.id },
        data: { tradingAccountId: null }
      });
    }
  }

  for (let i = licenseIndex; i < activeLicenses.length; i++) {
     await prisma.license.update({
        where: { id: activeLicenses[i].id },
        data: { tradingAccountId: null }
     });
  }
}

async function main() {
  const users = await prisma.user.findMany({
    where: {
      licenses: {
        some: { status: 'ACTIVE' }
      }
    }
  });

  console.log(`Found ${users.length} users with active web licenses. Syncing...`);

  for (const u of users) {
    await syncUserToMt5Licenses(u.id);
  }
  
  // Update ANY other Mt5License to 'ALL' just in case
  await prisma.mt5License.updateMany({
    where: { status: 'active', eaName: { not: 'ALL' } },
    data: { eaName: 'ALL' }
  });

  console.log('All licenses synchronized successfully.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
