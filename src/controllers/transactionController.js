import * as transactionService from '../services/transactionService.js';
import { sendSuccess, sendError } from '../utils/responseFormatter.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const createTransaction = asyncHandler(async (req, res) => {
  const data = await transactionService.createTransaction(req.body, req.user.id);
  sendSuccess(res, data, 201);
});

export const getTransactions = asyncHandler(async (req, res) => {
  const { page, limit, ...filters } = req.query;
  const data = await transactionService.getTransactions(filters, { page, limit });
  sendSuccess(res, data, 200);
});

export const getTransactionById = asyncHandler(async (req, res) => {
  const data = await transactionService.getTransactionById(req.params.id);
  sendSuccess(res, data, 200);
});

export const updateTransaction = asyncHandler(async (req, res) => {
  const data = await transactionService.updateTransaction(req.params.id, req.body, req.user.id);
  sendSuccess(res, data, 200);
});

export const deleteTransaction = asyncHandler(async (req, res) => {
  const data = await transactionService.deleteTransaction(req.params.id, req.user.id);
  sendSuccess(res, data, 200);
});

export const exportTransactions = asyncHandler(async (req, res) => {
  const csvStr = await transactionService.exportTransactionsCSV();
  res.header('Content-Type', 'text/csv');
  res.attachment('transactions.csv');
  return res.send(csvStr);
});

export const importTransactions = asyncHandler(async (req, res) => {
  if (!req.file) {
    return sendError(res, 'No CSV file uploaded', 400);
  }
  const data = await transactionService.importTransactionsCSV(req.file.buffer, req.user.id);
  sendSuccess(res, data, 201);
});
