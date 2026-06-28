import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create or Update Product
  const product = await prisma.product.upsert({
    where: { slug: 'gold-scalper-mt5' },
    update: {
      name: 'Gold Scalper MT5',
      description: 'Fully automated, backtested, and optimized for XAUUSD.',
    },
    create: {
      name: 'Gold Scalper MT5',
      slug: 'gold-scalper-mt5',
      description: 'Fully automated, backtested, and optimized for XAUUSD.',
    },
  });

  console.log(`Product created/updated: ${product.name}`);

  const plans = [
    {
      name: 'Starter',
      lotAllowed: 0.01,
      prices: JSON.stringify({ weekly: 25, monthly: 79, semiAnnual: 399, yearly: 699 }),
      isTrial: true, // Only Starter can be used for Trial
    },
    {
      name: 'Standard',
      lotAllowed: 0.10,
      prices: JSON.stringify({ weekly: 49, monthly: 149, semiAnnual: 749, yearly: 1299 }),
      isTrial: false,
    },
    {
      name: 'Pro',
      lotAllowed: 0.50,
      prices: JSON.stringify({ weekly: 99, monthly: 299, semiAnnual: 1499, yearly: 2599 }),
      isTrial: false,
    },
    {
      name: 'VIP',
      lotAllowed: 1.00,
      prices: JSON.stringify({ weekly: 199, monthly: 599, semiAnnual: 2999, yearly: 4999 }),
      isTrial: false,
    }
  ];

  for (const planData of plans) {
    // Check if plan exists
    const existingPlan = await prisma.productPlan.findFirst({
      where: {
        productId: product.id,
        name: planData.name,
      }
    });

    if (existingPlan) {
      await prisma.productPlan.update({
        where: { id: existingPlan.id },
        data: planData
      });
      console.log(`Updated plan: ${planData.name}`);
    } else {
      await prisma.productPlan.create({
        data: {
          productId: product.id,
          ...planData
        }
      });
      console.log(`Created plan: ${planData.name}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
