const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const activeLicenses = await prisma.mt5License.findMany({
    where: { status: 'active' }
  });

  console.log(`Found ${activeLicenses.length} active MT5 licenses.`);
  let updated = 0;
  let deleted = 0;

  for (const lic of activeLicenses) {
    if (lic.eaName === 'ALL') continue;

    const existingAll = await prisma.mt5License.findUnique({
      where: {
        accountNumber_eaName: {
          accountNumber: lic.accountNumber,
          eaName: 'ALL'
        }
      }
    });

    if (existingAll) {
      await prisma.mt5License.delete({ where: { id: lic.id } });
      deleted++;
    } else {
      await prisma.mt5License.update({
        where: { id: lic.id },
        data: { eaName: 'ALL' }
      });
      updated++;
    }
  }

  console.log(`Done. Updated ${updated} licenses to 'ALL' and removed ${deleted} redundant specific ones.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
