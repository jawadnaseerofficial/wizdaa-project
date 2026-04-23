import { PrismaClient, UserRole, RequestStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@wizdaa.com' },
    update: {},
    create: {
      email: 'admin@wizdaa.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
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
      role: UserRole.MANAGER,
    },
  });

  const employee1 = await prisma.user.upsert({
    where: { email: 'employee1@wizdaa.com' },
    update: {},
    create: {
      email: 'employee1@wizdaa.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.EMPLOYEE,
    },
  });

  const employee2 = await prisma.user.upsert({
    where: { email: 'employee2@wizdaa.com' },
    update: {},
    create: {
      email: 'employee2@wizdaa.com',
      password: hashedPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      role: UserRole.EMPLOYEE,
    },
  });

  await prisma.timeOffBalance.upsert({
    where: { userId: employee1.id },
    update: {},
    create: {
      userId: employee1.id,
      totalDays: 20,
      usedDays: 5,
      pendingDays: 2,
      remainingDays: 13,
      year: new Date().getFullYear(),
    },
  });

  await prisma.timeOffBalance.upsert({
    where: { userId: employee2.id },
    update: {},
    create: {
      userId: employee2.id,
      totalDays: 20,
      usedDays: 0,
      pendingDays: 0,
      remainingDays: 20,
      year: new Date().getFullYear(),
    },
  });

  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  await prisma.timeOffRequest.create({
    data: {
      userId: employee1.id,
      startDate: today,
      endDate: nextWeek,
      days: 5,
      reason: 'Family vacation',
      status: RequestStatus.APPROVED,
      approvedBy: manager.id,
      approvedAt: new Date(),
    },
  });

  await prisma.timeOffRequest.create({
    data: {
      userId: employee1.id,
      startDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000),
      endDate: new Date(today.getTime() + 16 * 24 * 60 * 60 * 1000),
      days: 2,
      reason: 'Personal matters',
      status: RequestStatus.PENDING,
    },
  });

  console.log('Seed completed successfully!');
  console.log('Test users created:');
  console.log('  Admin: admin@wizdaa.com / password123');
  console.log('  Manager: manager@wizdaa.com / password123');
  console.log('  Employee 1: employee1@wizdaa.com / password123');
  console.log('  Employee 2: employee2@wizdaa.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });