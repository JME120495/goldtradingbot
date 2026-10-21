import { PrismaClient } from '@prisma/client';

// Restores GOLD_SCALPER's original tiered plans, moves its licenses back to the
// tier matching their lot, and adds the Gold AI product.
// Idempotent. Dry run by default (everything rolled back):
//   npx ts-node prisma/setup-products.ts           -> show what would change
//   npx ts-node prisma/setup-products.ts --apply   -> write

const prisma = new PrismaClient();
const APPLY = process.argv.includes('--apply');

const SCALPER_SLUG = 'GOLD_SCALPER';
const SCALPER_PLANS = [
  { name: 'Starter', lotAllowed: 0.01, isTrial: true, prices: { weekly: 25, monthly: 79, semiAnnual: 399, yearly: 699 } },
  { name: 'Standard', lotAllowed: 0.1, isTrial: false, prices: { weekly: 49, monthly: 149, semiAnnual: 749, yearly: 1299 } },
  { name: 'Pro', lotAllowed: 0.5, isTrial: false, prices: { weekly: 99, monthly: 299, semiAnnual: 1499, yearly: 2599 } },
  { name: 'VIP', lotAllowed: 1.0, isTrial: false, prices: { weekly: 199, monthly: 599, semiAnnual: 2999, yearly: 4999 } },
];

// Slug must match exactly what the EA sends to /verify in "ea".
// The EA ignores the lot returned by /verify: lotAllowed is indicative only.
const GOLDAI = {
  slug: 'GoldAI',
  name: 'Gold AI',
  description:
    "Robot de trading sur l'or (XAUUSD). Vous choisissez uniquement votre taille de lot, tous les autres réglages sont verrouillés. Une licence = un seul compte MT5.",
  plans: [
    { name: 'Plan Mensuel', lotAllowed: 0.01, isTrial: false, prices: { monthly: 30, original: 50, discount: 40 } },
    { name: 'Licence à Vie', lotAllowed: 0.01, isTrial: false, prices: { lifetime: 200, original: 500, discount: 60 } },
  ],
};

class DryRun extends Error {}

async function main() {
  console.log(APPLY ? '=== APPLY ===' : '=== DRY RUN (rien ne sera écrit) ===');
  try {
    await prisma.$transaction(async (tx) => {
      // 1. GOLD_SCALPER: restore the 4 original plans
      const scalper = await tx.product.findUnique({ where: { slug: SCALPER_SLUG } });
      if (!scalper) throw new Error(`Produit ${SCALPER_SLUG} introuvable.`);

      const tierIds: string[] = [];
      for (const p of SCALPER_PLANS) {
        const data = { lotAllowed: p.lotAllowed, isTrial: p.isTrial, prices: JSON.stringify(p.prices) };
        const existing = await tx.productPlan.findFirst({ where: { productId: scalper.id, name: p.name } });
        const plan = existing
          ? await tx.productPlan.update({ where: { id: existing.id }, data })
          : await tx.productPlan.create({ data: { productId: scalper.id, name: p.name, ...data } });
        tierIds.push(plan.id);
        console.log(`${existing ? 'Mis à jour' : 'Créé'} : ${SCALPER_SLUG} / ${p.name} (lot ${p.lotAllowed}) ${JSON.stringify(p.prices)}`);
      }

      // 2. Move GOLD_SCALPER licenses back to the tier matching their lot snapshot
      const tiers = await tx.productPlan.findMany({ where: { id: { in: tierIds } } });
      const toMove = await tx.license.findMany({
        where: { productId: scalper.id, planId: { notIn: tierIds } },
        include: { plan: true },
      });
      for (const lic of toMove) {
        const tier = tiers.find((t) => Math.abs(t.lotAllowed - lic.lotAllowed) < 1e-9);
        if (!tier) {
          console.log(`  ⚠ Licence ${lic.id} (lot ${lic.lotAllowed}) : aucun plan d'origine pour ce lot, laissée sur « ${lic.plan.name} ».`);
          continue;
        }
        await tx.license.update({ where: { id: lic.id }, data: { planId: tier.id } });
        console.log(`  Licence ${lic.id} : « ${lic.plan.name} » -> « ${tier.name} » (lot ${lic.lotAllowed}, expiration inchangée)`);
      }

      // 3. Remove GOLD_SCALPER plans that are no longer tiers and no longer referenced
      const oldPlans = await tx.productPlan.findMany({
        where: { productId: scalper.id, id: { notIn: tierIds } },
        include: { _count: { select: { licenses: true } } },
      });
      for (const plan of oldPlans) {
        if (plan._count.licenses > 0) {
          console.log(`  ⚠ Plan « ${plan.name} » conservé : encore ${plan._count.licenses} licence(s).`);
          continue;
        }
        await tx.productPlan.delete({ where: { id: plan.id } });
        console.log(`Supprimé : ${SCALPER_SLUG} / ${plan.name} (plus aucune licence)`);
      }

      // 4. Gold AI product + plans
      const goldai = await tx.product.upsert({
        where: { slug: GOLDAI.slug },
        update: { name: GOLDAI.name, description: GOLDAI.description, isActive: true },
        create: { slug: GOLDAI.slug, name: GOLDAI.name, description: GOLDAI.description, isActive: true },
      });
      for (const p of GOLDAI.plans) {
        const data = { lotAllowed: p.lotAllowed, isTrial: p.isTrial, prices: JSON.stringify(p.prices) };
        const existing = await tx.productPlan.findFirst({ where: { productId: goldai.id, name: p.name } });
        if (existing) await tx.productPlan.update({ where: { id: existing.id }, data });
        else await tx.productPlan.create({ data: { productId: goldai.id, name: p.name, ...data } });
        console.log(`${existing ? 'Mis à jour' : 'Créé'} : ${GOLDAI.slug} / ${p.name} ${JSON.stringify(p.prices)}`);
      }

      if (!APPLY) throw new DryRun();
    }, { timeout: 60000 });
    console.log('Terminé : modifications écrites.');
  } catch (e) {
    if (e instanceof DryRun) console.log('Simulation terminée : tout a été annulé. Relancer avec --apply pour écrire.');
    else throw e;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
