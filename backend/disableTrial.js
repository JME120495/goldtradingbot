const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.productPlan.updateMany({ data: { isTrial: false } });
  console.log('Successfully disabled trial for all plans.');
}
main().finally(() => prisma.$disconnect());
