const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const l = await prisma.mt5License.findMany({ where: { accountNumber: 404999n } });
  console.log(JSON.stringify(l, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2));
}
main().finally(() => prisma.$disconnect());
