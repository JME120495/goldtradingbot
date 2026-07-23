const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const plans = await prisma.productPlan.findMany({ include: { product: true } });
  console.log(JSON.stringify(plans, null, 2));
}
main().finally(() => prisma.$disconnect());
