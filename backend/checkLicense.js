const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const account = 379105n;
  const l = await prisma.mt5License.findMany({ where: { accountNumber: account } });
  
  console.log("Licenses for 379105:");
  // Convert BigInt to string for JSON.stringify to work
  console.log(JSON.stringify(l, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
  , 2));
}

main().finally(() => prisma.$disconnect());
