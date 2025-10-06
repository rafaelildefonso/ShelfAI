import { hash } from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

// @ts-ignore - Ignore TypeScript error for process
const prisma = new PrismaClient();

async function main() {
  try {
    // Criar usuário admin
    const hashedPassword = await hash('admin123', 12);
    
    await prisma.user.upsert({
      where: { email: 'admin@shelfai.com' },
      update: {},
      create: {
        name: 'Admin',
        email: 'admin@shelfai.com',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });

    console.log('✅ Database seeded successfully');
    // @ts-ignore - Ignore TypeScript error for process
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    // @ts-ignore - Ignore TypeScript error for process
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);