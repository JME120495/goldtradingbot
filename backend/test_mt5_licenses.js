const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const licenses = await prisma.mt5License.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log("Recent MT5 Licenses:");
  console.log(JSON.stringify(licenses, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
