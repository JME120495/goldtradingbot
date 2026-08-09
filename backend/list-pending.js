const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Find all PENDING KPAY payments
  const pendingPayments = await prisma.payment.findMany({
    where: { status: 'PENDING', provider: 'KPAY' },
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { id: true, email: true, name: true } } }
  });

  console.log(`Found ${pendingPayments.length} pending KPay payments:\n`);
  for (const p of pendingPayments) {
    console.log(`  ID: ${p.id}`);
    console.log(`  User: ${p.user?.name || 'N/A'} (${p.user?.email || 'N/A'})`);
    console.log(`  Amount: $${p.amount} ${p.currency}`);
    console.log(`  TxRef: ${p.providerTxId}`);
    console.log(`  Date: ${p.createdAt.toISOString()}`);
    console.log(`  License linked: ${p.licenseId || 'NONE'}`);
    console.log('---');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
