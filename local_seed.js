process.env.DATABASE_URL = "postgresql://postgres.jwxebmnvbtnawlcqfeib:Jmelec%40mele0n@aws-0-eu-west-1.pooler.supabase.com:5432/postgres";
const { PrismaClient } = require("./backend/node_modules/@prisma/client");
const prisma = new PrismaClient();

async function main() {
    const product = await prisma.product.create({
      data: {
        name: "Gold Scalper MT5",
        slug: "gold-scalper-mt5",
        description: "Expert Advisor Gold Scalper (MT5)"
      }
    });

    await prisma.productPlan.createMany({
      data: [
        {
          productId: product.id,
          name: "Starter",
          lotAllowed: 0.01,
          prices: "{\"monthly\": 50, \"yearly\": 400}"
        },
        {
          productId: product.id,
          name: "Pro",
          lotAllowed: 0.1,
          prices: "{\"monthly\": 100, \"yearly\": 800}"
        }
      ]
    });
    console.log("SUCCESS!");
}
main().catch(console.error).finally(() => prisma.$disconnect());
