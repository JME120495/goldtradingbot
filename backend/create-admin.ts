const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'essonojeanmarcel95@gmail.com' },
    update: { role: 'ADMIN' },
    create: {
      email: 'essonojeanmarcel95@gmail.com',
      name: 'Admin',
      role: 'ADMIN',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$vO3z9pE7y/y5/5/5/5/5/5$n5/5/5/5/5/5/5/5/5/5/5/5/5/5/5/5/5/5/5/5/5'
    }
  });
  console.log('Admin user updated:', user);
}
main().catch(console.error).finally(() => prisma.$disconnect());
