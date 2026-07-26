process.env.DATABASE_URL = "postgresql://postgres.jwxebmnvbtnawlcqfeib:Jmelec%40mele0n@aws-0-eu-west-1.pooler.supabase.com:5432/postgres";
const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');
const prisma = new PrismaClient();

async function main() {
  const email = 'essonojeanmarcel@gmail.com';
  const newPassword = 'password123';
  const passwordHash = await argon2.hash(newPassword);
  
  const user = await prisma.user.update({
    where: { email },
    data: { passwordHash },
  });
  console.log('Password updated for:', user.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
