const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

function signPayload(payload) {
  const secret = process.env.EA_SECRET || '';
  const jsonString = JSON.stringify(payload);
  const signature = crypto
    .createHmac('sha256', secret)
    .update(jsonString)
    .digest('hex');
  return {
    payload,
    signature,
  };
}

function formatDate(d) {
  const date = new Date(d);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

async function main() {
  const licenses = await prisma.mt5License.findMany({
    where: { status: 'active' },
    take: 1
  });

  if (licenses.length === 0) {
    console.log("No active licenses found.");
    return;
  }

  const lic = licenses[0];
  console.log("Database License:", lic);

  const payload = {
    active: true,
    plan: lic.plan,
    lot: Number(lic.lot),
    expiresAt: formatDate(lic.expiryDate),
  };

  const response = {
    valid: true,
    plan: lic.plan,
    lot: Number(lic.lot),
    expiry: formatDate(lic.expiryDate),
    message: 'Licence valide.',
    ...signPayload(payload),
  };

  console.log("API Response would be:", JSON.stringify(response, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
