const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyLicense(account, broker, server, ea) {
  const eaName = ea || 'ALL';

  // Find license for this account, either specific to the EA or 'ALL'.
  // Prioritise exact EA match over 'ALL'.
  const licenses = await prisma.mt5License.findMany({
    where: {
      accountNumber: BigInt(account),
      eaName: { in: [eaName, 'ALL'] },
    },
    orderBy: { eaName: 'desc' }, // exact match ('JMEGOLD_DUAL') > 'ALL'
    take: 2,
  });

  // Pick the best match: prefer exact EA name over 'ALL'
  const lic =
    licenses.find((l) => l.eaName === eaName) ||
    licenses.find((l) => l.eaName === 'ALL') ||
    null;

  if (!lic) {
    return { valid: false, message: 'Aucune licence trouvée pour ce compte.' };
  }
  
  const today = new Date();
  const expiry = new Date(lic.expiryDate);
  const isExpired = expiry < today;

  if (lic.status === 'suspended') {
    return { valid: false, message: 'Licence suspendue. Contactez le support.' };
  }
  if (lic.status === 'cancelled') {
    return { valid: false, message: 'Licence annulée.' };
  }
  if (lic.status === 'expired' || isExpired) {
    return { valid: false, plan: lic.plan, expiry: lic.expiryDate, message: 'Licence expirée.' };
  }

  return {
    valid: true,
    plan: lic.plan,
    lot: Number(lic.lot),
    expiry: lic.expiryDate,
    message: 'Licence valide.',
  };
}

async function main() {
  console.log("Testing with 404999 / JMEGOLD_SCALPER EA");
  const result = await verifyLicense(404999, "", "", "JMEGOLD_SCALPER EA");
  console.log(result);
}

main().finally(() => prisma.$disconnect());
