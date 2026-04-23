import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Password123!', 10);
  const currentYear = new Date().getFullYear();

  const location = await prisma.location.upsert({
    where: { externalId: 'hq' },
    update: { name: 'Headquarters' },
    create: {
      name: 'Headquarters',
      externalId: 'hq',
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@wizdaa.com' },
    update: {},
    create: {
      email: 'admin@wizdaa.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      locationId: location.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'manager@wizdaa.com' },
    update: {},
    create: {
      email: 'manager@wizdaa.com',
      password: hashedPassword,
      firstName: 'Manager',
      lastName: 'User',
      role: 'MANAGER',
      locationId: location.id,
    },
  });

  const employee = await prisma.user.upsert({
    where: { email: 'employee@wizdaa.com' },
    update: {},
    create: {
      email: 'employee@wizdaa.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'EMPLOYEE',
      locationId: location.id,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@wizdaa.com' },
    update: {},
    create: {
      email: 'manager@wizdaa.com',
      password: hashedPassword,
      firstName: 'Manager',
      lastName: 'User',
      role: 'MANAGER',
      locationId: location.id,
    },
  });

  const balance = await prisma.timeOffBalance.upsert({
    where: {
      userId_locationId_year: {
        userId: employee.id,
        locationId: location.id,
        year: currentYear,
      },
    },
    update: {},
    create: {
      userId: employee.id,
      locationId: location.id,
      year: currentYear,
      totalDays: 20,
      availableDays: 18,
      usedDays: 2,
      pendingDays: 0,
    },
  });

  await prisma.timeOffRequest.upsert({
    where: { id: 'sample-request-1' },
    update: {},
    create: {
      id: 'sample-request-1',
      userId: employee.id,
      locationId: location.id,
      balanceId: balance.id,
      startDate: new Date(currentYear, 6, 10),
      endDate: new Date(currentYear, 6, 14),
      days: 5,
      reason: 'Family vacation',
      status: 'APPROVED',
      approverId: manager.id,
      approvedAt: new Date(),
    },
  });

  console.log('Seed completed successfully');
  console.log('Credentials:');
  console.log('  Admin: admin@wizdaa.com / Password123!');
  console.log('  Manager: manager@wizdaa.com / Password123!');
  console.log('  Employee: employee@wizdaa.com / Password123!');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
