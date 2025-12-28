const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const props = await prisma.property.findMany({
    take: 5,
    select: { title: true, city: true, state: true },
  });
  console.log(JSON.stringify(props, null, 2));
}
main();
