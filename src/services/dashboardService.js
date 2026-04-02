import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardSummary = async () => {
  const transactions = await prisma.transaction.findMany({
    where: { isDeleted: false },
    select: { amount: true, type: true }
  });

  let totalIncome = 0;
  let totalExpenses = 0;
  let incomeCount = 0;
  let expenseCount = 0;

  for (const t of transactions) {
    if (t.type === 'INCOME') {
      totalIncome += t.amount;
      incomeCount++;
    } else {
      totalExpenses += t.amount;
      expenseCount++;
    }
  }

  return {
    totalIncome,
    totalExpenses,
    netBalance: totalIncome - totalExpenses,
    totalTransactions: transactions.length,
    incomeCount,
    expenseCount
  };
};

export const getDashboardCategories = async (typeFilter) => {
  const whereParams = { isDeleted: false };
  if (typeFilter) whereParams.type = typeFilter;

  const transactions = await prisma.transaction.findMany({
    where: whereParams,
    select: { amount: true, category: true }
  });

  let overallTotal = 0;
  const categoryTotals = {};
  const categoryCounts = {};

  for (const t of transactions) {
    if (!categoryTotals[t.category]) {
      categoryTotals[t.category] = 0;
      categoryCounts[t.category] = 0;
    }
    categoryTotals[t.category] += t.amount;
    categoryCounts[t.category]++;
    overallTotal += t.amount;
  }

  return Object.keys(categoryTotals).map(category => {
    const total = categoryTotals[category];
    return {
      category,
      total,
      count: categoryCounts[category],
      percentage: overallTotal > 0 ? (total / overallTotal) * 100 : 0
    };
  }).sort((a, b) => b.total - a.total);
};

export const getDashboardTrends = async (months) => {
  let numMonths = parseInt(months, 10);
  if (isNaN(numMonths) || numMonths < 1) numMonths = 6;
  if (numMonths > 12) numMonths = 12;

  const trends = {};
  const currentDate = new Date();
  
  for (let i = numMonths - 1; i >= 0; i--) {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    trends[monthStr] = { month: monthStr, income: 0, expenses: 0, net: 0 };
  }

  const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - numMonths + 1, 1);

  const transactions = await prisma.transaction.findMany({
    where: { isDeleted: false, date: { gte: startDate } },
    select: { amount: true, type: true, date: true }
  });

  for (const t of transactions) {
    const monthStr = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, '0')}`;
    if (trends[monthStr]) {
      if (t.type === 'INCOME') {
        trends[monthStr].income += t.amount;
      } else {
        trends[monthStr].expenses += t.amount;
      }
      trends[monthStr].net = trends[monthStr].income - trends[monthStr].expenses;
    }
  }

  return Object.values(trends);
};

export const getDashboardRecent = async (limit) => {
  let limitNum = parseInt(limit, 10);
  if (isNaN(limitNum) || limitNum < 1) limitNum = 10;
  if (limitNum > 50) limitNum = 50;

  return await prisma.transaction.findMany({
    where: { isDeleted: false },
    orderBy: { date: 'desc' },
    take: limitNum,
    select: {
      id: true, amount: true, type: true, category: true, date: true, notes: true,
      createdBy: { select: { name: true } }
    }
  });
};

export const getDashboardStats = async () => {
  const transactions = await prisma.transaction.findMany({
    where: { isDeleted: false },
    select: { id: true, amount: true, type: true, category: true, date: true }
  });

  let largestIncome = null;
  let largestExpense = null;
  const categoryCounts = {};
  let totalAmount = 0;
  const currentDate = new Date();
  let thisMonthIncome = 0;
  let thisMonthExpenses = 0;

  for (const t of transactions) {
    totalAmount += t.amount;

    if (t.type === 'INCOME') {
      if (!largestIncome || t.amount > largestIncome.amount) largestIncome = t;
      if (t.date.getMonth() === currentDate.getMonth() && t.date.getFullYear() === currentDate.getFullYear()) {
        thisMonthIncome += t.amount;
      }
    } else {
      if (!largestExpense || t.amount > largestExpense.amount) largestExpense = t;
      if (t.date.getMonth() === currentDate.getMonth() && t.date.getFullYear() === currentDate.getFullYear()) {
        thisMonthExpenses += t.amount;
      }
    }

    categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
  }

  let mostActiveCategory = null;
  let maxCount = -1;
  for (const [cat, count] of Object.entries(categoryCounts)) {
    if (count > maxCount) {
      maxCount = count;
      mostActiveCategory = cat;
    }
  }

  return {
    largestIncome,
    largestExpense,
    mostActiveCategory,
    averageTransactionAmount: transactions.length > 0 ? totalAmount / transactions.length : 0,
    thisMonthIncome,
    thisMonthExpenses
  };
};
