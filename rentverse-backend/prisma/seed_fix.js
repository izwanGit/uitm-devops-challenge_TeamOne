const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding missing users...');

  const password = 'password123';
  const hashedPassword = await bcrypt.hash(password, 10);

  // Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@rentverse.com' },
    update: { password: hashedPassword },
    create: {
      email: 'admin@rentverse.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log('Created/Updated Admin:', admin.email);

  // Tenant User
  const tenant = await prisma.user.upsert({
    where: { email: 'tenant@rentverse.com' },
    update: { password: hashedPassword },
    create: {
      email: 'tenant@rentverse.com',
      name: 'Tenant User',
      password: hashedPassword,
      role: 'USER',
      isActive: true,
    },
  });
  console.log('Created/Updated Tenant:', tenant.email);

  // Landlord User (for good measure)
  const landlord = await prisma.user.upsert({
    where: { email: 'landlord@rentverse.com' },
    update: { password: hashedPassword },
    create: {
      email: 'landlord@rentverse.com',
      name: 'Landlord User',
      password: hashedPassword,
      role: 'USER', // Or LANDLORD if that role exists in schema? Default schema often uses 'USER' + permissions or logic
      isActive: true,
    },
  });
  console.log('Created/Updated Landlord:', landlord.email);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
