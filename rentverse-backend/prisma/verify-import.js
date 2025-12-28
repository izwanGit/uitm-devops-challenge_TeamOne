const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.property.count();
    console.log(`Total Properties in DB: ${count}`);

    // Check property types
    const types = await prisma.propertyType.findMany();
    console.log(`Property Types: ${types.length}`);
    console.log('Types:', types.map(t => t.name).join(', '));

    // Check one sample
    const sample = await prisma.property.findFirst({
      orderBy: { createdAt: 'desc' },
      include: { propertyType: true, owner: true },
    });
    console.log('\nSample Property:', JSON.stringify(sample, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
