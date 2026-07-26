process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres.jwxebmnvbtnawlcqfeib:Jmelec%40mele0n@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');
const prisma = new PrismaClient();

async function main() {
  const email = 'essonojeanmarcel@gmail.com';
  const newPassword = 'password123';
  const hashedPassword = await argon2.hash(newPassword, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  // Find user if exists
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    console.log('Resetting existing user:', email);
    const updated = await prisma.user.update({
      where: { email },
      data: {
        role: 'ADMIN',
        passwordHash: hashedPassword,
        isTwoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorTempSecret: null,
        backupCodes: [],
      },
    });
    console.log('User reset successfully:', updated.email, updated.role);
  } else {
    console.log('Creating new admin user:', email);
    const created = await prisma.user.create({
      data: {
        email,
        name: 'Admin Jean-Marcel',
        role: 'ADMIN',
        passwordHash: hashedPassword,
        isTwoFactorEnabled: false,
        preferredCurrency: 'XAF',
      },
    });
    console.log('User created successfully:', created.email, created.role);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
