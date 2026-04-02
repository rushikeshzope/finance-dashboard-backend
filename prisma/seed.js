import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  const adminPass = await bcrypt.hash('admin123', 10);
  const analystPass = await bcrypt.hash('analyst123', 10);
  const viewerPass = await bcrypt.hash('viewer123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@demo.com',
      passwordHash: adminPass,
      role: 'ADMIN',
    },
  });

  const analyst = await prisma.user.upsert({
    where: { email: 'analyst@demo.com' },
    update: {},
    create: {
      name: 'Analyst User',
      email: 'analyst@demo.com',
      passwordHash: analystPass,
      role: 'ANALYST',
    },
  });

  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@demo.com' },
    update: {},
    create: {
      name: 'Viewer User',
      email: 'viewer@demo.com',
      passwordHash: viewerPass,
      role: 'VIEWER',
    },
  });

  // Create 20 transactions over the last 6 months
  const categories = ['Salary', 'Rent', 'Food', 'Freelance', 'Utilities'];
  const types = ['INCOME', 'EXPENSE'];
  
  for (let i = 0; i < 20; i++) {
    // Spread dates over the last 6 months
    const date = new Date();
    date.setMonth(date.getMonth() - Math.floor(Math.random() * 6));
    date.setDate(Math.floor(Math.random() * 28) + 1);

    const type = i % 3 === 0 ? 'INCOME' : 'EXPENSE';
    let category, amount;
    
    if (type === 'INCOME') {
      category = i % 2 === 0 ? 'Salary' : 'Freelance';
      amount = category === 'Salary' ? 50000 : 10000 + Math.random() * 5000;
    } else {
      category = categories[Math.floor(Math.random() * 3) + 1]; // Rent, Food, Utilities
      if (category === 'Rent') amount = 15000;
      else if (category === 'Food') amount = 3000 + Math.random() * 5000;
      else amount = 1000 + Math.random() * 2000;
    }

    await prisma.transaction.create({
      data: {
        amount: Math.round(amount * 100) / 100,
        type,
        category,
        date,
        notes: `Sample ${category} transaction`,
        createdById: admin.id,
      }
    });
  }

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
