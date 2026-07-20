const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'jmetradingacademy@gmail.com';
  const passwordHash = '$argon2id$v=19$m=65536,t=3,p=4$1HdJ7IFkTBXZ044/UWVngg$FJpepQcPgxHlZFy3yOfbTtQ6TTL6VPlZGGd0Eyw/jOU';
  
  const user = await prisma.user.upsert({
    where: { email },
    update: { role: 'ADMIN', passwordHash },
    create: { email, role: 'ADMIN', passwordHash, name: 'Admin JME' },
  });
  console.log('User created/updated:', user.email, user.role);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
