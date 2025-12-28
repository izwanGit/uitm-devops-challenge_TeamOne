const { PrismaClient } = require('@prisma/client');
const path = require('path');
const prisma = new PrismaClient();

async function createTestData() {
  console.log('Creating test data...');

  const landlord = await prisma.user.create({
    data: {
      email: `landlord_${Date.now()}@test.com`,
      password: 'hash',
      name: 'John Landlord',
      role: 'USER',
    },
  });

  const tenant = await prisma.user.create({
    data: {
      email: `tenant_${Date.now()}@test.com`,
      password: 'hash',
      name: 'Jane Tenant',
      role: 'USER',
    },
  });

  let pType = await prisma.propertyType.findFirst();
  if (!pType) {
    pType = await prisma.propertyType.create({
      data: { code: 'APT', name: 'Apartment' },
    });
  }

  const property = await prisma.property.create({
    data: {
      title: 'Luxury Condo',
      address: '123 Main St',
      city: 'KL',
      state: 'WP',
      zipCode: '50450',
      price: 2500,
      ownerId: landlord.id,
      propertyTypeId: pType.id,
      code: `PROP_${Date.now()}`,
    },
  });

  const lease = await prisma.lease.create({
    data: {
      startDate: new Date(),
      endDate: new Date(),
      rentAmount: 2500,
      propertyId: property.id,
      landlordId: landlord.id,
      tenantId: tenant.id,
      status: 'APPROVED',
    },
  });

  console.log('-------------------------------------------');
  console.log(`LEASE ID: ${lease.id}`);
  console.log('-------------------------------------------');
  console.log(`Use this URL: http://localhost:4000/leases/${lease.id}/sign`);

  await prisma.$disconnect();
}

createTestData();
