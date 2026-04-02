import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true
    }
  });
};

export const updateRole = async (id, role) => {
  return await prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, name: true, email: true, role: true, status: true, createdAt: true }
  });
};

export const updateStatus = async (id, status, requestingUserId) => {
  if (status === 'INACTIVE' && id === requestingUserId) {
    const error = new Error('Cannot deactivate your own account');
    error.statusCode = 400;
    throw error;
  }

  return await prisma.user.update({
    where: { id },
    data: { status },
    select: { id: true, name: true, email: true, role: true, status: true, createdAt: true }
  });
};
