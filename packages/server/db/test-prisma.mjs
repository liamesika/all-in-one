import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const lead = await prisma.lead.create({
    data: {
      name: 'Test Lead',
      email: 'test@example.com',
      phone: '+972-501234567',
      interest: 'ecommerce',
      budget: 10000,
      source: 'website',
      consent: true,
    },
  });
  console.log('Created lead:', lead.id);

  const count = await prisma.lead.count();
  console.log('Total leads:', count);
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
