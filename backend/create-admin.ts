const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.update({
    where: { email: 'essonojeanmarcel@gmail.com' },
    data: { role: 'ADMIN' }
  });
  console.log('User upgraded to ADMIN:', user.email);
}
main().catch(console.error).finally(() => prisma.$disconnect());
