const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function run() {
  try {
    const sqlFile = path.join(__dirname, 'prisma', 'migrations', '20260713091500_add_mt5_licenses', 'migration.sql');
    const sqlText = fs.readFileSync(sqlFile, 'utf8');
    
    // Split the statements by semicolon (basic parsing)
    const statements = sqlText.split(';').map(s => s.trim()).filter(s => s.length > 0);
    
    console.log(`Found ${statements.length} statements to execute.`);
    
    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      await prisma.$executeRawUnsafe(statement);
    }
    
    console.log('Migration applied successfully!');
  } catch (error) {
    console.error('Error applying migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
