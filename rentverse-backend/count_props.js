const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.property.count();
  console.log('Total Properties:', count);
}
main();
