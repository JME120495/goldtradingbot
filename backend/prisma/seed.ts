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
      name: 'Plan Mensuel',
      lotAllowed: 100.0,
      prices: JSON.stringify({ monthly: 25.5, original: 30, discount: 15 }),
      isTrial: false,
    },
    {
      name: 'Licence à Vie',
      lotAllowed: 100.0,
      prices: JSON.stringify({ lifetime: 200, original: 500, discount: 60 }),
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
