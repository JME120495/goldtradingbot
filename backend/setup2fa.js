const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const prisma = new PrismaClient();

const algorithm = 'aes-256-gcm';
const secret = process.env.ENCRYPTION_KEY || 'default-secret-key-must-be-32-chars-long!';
const key = crypto.scryptSync(secret, 'salt', 32);

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

async function main() {
  const email = 'essonojeanmarcel@gmail.com';
  
  const tfaSecret = speakeasy.generateSecret({
    name: `JME120495/goldtradingbot (${email})`
  });
  
  const encryptedSecret = encrypt(tfaSecret.base32);

  const backupCodes = [
    crypto.randomBytes(4).toString('hex'),
    crypto.randomBytes(4).toString('hex')
  ];

  await prisma.user.update({
    where: { email },
    data: { 
      twoFactorSecret: encryptedSecret,
      isTwoFactorEnabled: true,
      backupCodes: backupCodes
    }
  });

  console.log('2FA enabled for user.');
  console.log('Secret (Base32):', tfaSecret.base32);
  console.log('Backup Codes:', backupCodes);
}

main().catch(console.error).finally(() => prisma.$disconnect());
