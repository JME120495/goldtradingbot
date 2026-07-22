const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: {
      tradingAccounts: true,
      licenses: {
        where: { status: 'ACTIVE' },
        include: { plan: true, product: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  for (const user of users) {
    if (!user.tradingAccounts.length) continue;
    for (const account of user.tradingAccounts) {
      const webLicense = user.licenses.find(l => !l.expiresAt || l.expiresAt > new Date());
      if (webLicense) {
        const eaName = webLicense.product.slug;
        const accountNumber = BigInt(account.accountNumber);
        
        await prisma.mt5License.upsert({
          where: { accountNumber_eaName: { accountNumber, eaName } },
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
            expiryDate: webLicense.expiresAt || new Date('2099-12-31')
          },
          update: {
            clientName: user.name || 'Client Web',
            clientEmail: user.email,
            broker: account.broker,
            server: account.server || '',
            plan: webLicense.plan.name,
            lot: webLicense.lotAllowed,
            status: 'active',
            expiryDate: webLicense.expiresAt || new Date('2099-12-31')
          }
        });
      }
    }
  }
  console.log('Synced.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
