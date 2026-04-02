import { PrismaClient } from '@prisma/client';
import { Parser } from 'json2csv';
import csvParser from 'csv-parser';
import { Readable } from 'stream';

const prisma = new PrismaClient();

export const createTransaction = async (data, userId) => {
  const transaction = await prisma.transaction.create({
    data: {
      ...data,
      date: new Date(data.date),
      createdById: userId
    }
  });

  await prisma.auditLog.create({
    data: { userId, action: 'CREATE', entity: 'Transaction', entityId: transaction.id }
  });

  return transaction;
};

export const getTransactions = async (filters, pagination) => {
  const { type, category, from, to, search } = filters;
  let { page = 1, limit = 20 } = pagination;

  let pageNum = parseInt(page, 10) || 1;
  let limitNum = parseInt(limit, 10) || 20;
  if (limitNum > 100) limitNum = 100;

  const whereParams = { isDeleted: false };
  if (type) whereParams.type = type;
  if (category) whereParams.category = { contains: category };
  if (from || to) {
    whereParams.date = {};
    if (from) whereParams.date.gte = new Date(from);
    if (to) whereParams.date.lte = new Date(to);
  }
  if (search) {
    whereParams.OR = [
      { notes: { contains: search } },
      { category: { contains: search } }
    ];
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where: whereParams,
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      orderBy: { date: 'desc' }
    }),
    prisma.transaction.count({ where: whereParams })
  ]);

  return {
    data: transactions,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum)
  };
};

export const getTransactionById = async (id) => {
  const transaction = await prisma.transaction.findFirst({
    where: { id, isDeleted: false }
  });
  if (!transaction) {
    const error = new Error('Resource not found');
    error.statusCode = 404;
    throw error;
  }
  return transaction;
};

export const updateTransaction = async (id, data, userId) => {
  const existing = await prisma.transaction.findFirst({
    where: { id, isDeleted: false }
  });
  if (!existing) {
    const error = new Error('Resource not found');
    error.statusCode = 404;
    throw error;
  }

  const updateData = { ...data };
  if (data.date) updateData.date = new Date(data.date);

  const transaction = await prisma.transaction.update({
    where: { id },
    data: updateData
  });

  await prisma.auditLog.create({
    data: { userId, action: 'UPDATE', entity: 'Transaction', entityId: transaction.id }
  });

  return transaction;
};

export const deleteTransaction = async (id, userId) => {
  const existing = await prisma.transaction.findFirst({
    where: { id, isDeleted: false }
  });
  if (!existing) {
    const error = new Error('Resource not found or already deleted');
    error.statusCode = 404;
    throw error;
  }

  await prisma.transaction.update({
    where: { id },
    data: { isDeleted: true }
  });

  await prisma.auditLog.create({
    data: { userId, action: 'DELETE', entity: 'Transaction', entityId: id }
  });

  return { message: 'Transaction deleted successfully' };
};

export const exportTransactionsCSV = async () => {
  const transactions = await prisma.transaction.findMany({
    where: { isDeleted: false },
    orderBy: { date: 'desc' }
  });
  const fields = ['id', 'amount', 'type', 'category', 'date', 'notes'];
  const json2csvParser = new Parser({ fields });
  return json2csvParser.parse(transactions);
};

export const importTransactionsCSV = async (fileBuffer, userId) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = Readable.from(fileBuffer);

    stream
      .pipe(csvParser())
      .on('data', (data) => {
        if (data.amount && data.type && data.category && data.date) {
          results.push({
            amount: parseFloat(data.amount),
            type: data.type.trim(),
            category: data.category.trim(),
            date: new Date(data.date),
            notes: data.notes ? data.notes.trim() : null,
            createdById: userId
          });
        }
      })
      .on('end', async () => {
        if (results.length === 0) {
          const error = new Error('CSV file contains no valid rows');
          error.statusCode = 400;
          return reject(error);
        }

        try {
          const inserted = await prisma.transaction.createMany({ data: results });
          await prisma.auditLog.create({
            data: { userId, action: 'bulk_import', entity: 'Transaction', entityId: 'bulk' }
          });
          resolve({ message: `Successfully imported ${inserted.count} transactions` });
        } catch (dbErr) {
          reject(dbErr);
        }
      })
      .on('error', reject);
  });
};
