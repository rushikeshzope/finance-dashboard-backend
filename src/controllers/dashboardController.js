import * as dashboardService from '../services/dashboardService.js';
import { sendSuccess } from '../utils/responseFormatter.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const getSummary = asyncHandler(async (req, res) => {
  const data = await dashboardService.getDashboardSummary();
  sendSuccess(res, data, 200);
});

export const getCategories = asyncHandler(async (req, res) => {
  const data = await dashboardService.getDashboardCategories(req.query.type);
  sendSuccess(res, data, 200);
});

export const getTrends = asyncHandler(async (req, res) => {
  const data = await dashboardService.getDashboardTrends(req.query.months);
  sendSuccess(res, data, 200);
});

export const getRecent = asyncHandler(async (req, res) => {
  const data = await dashboardService.getDashboardRecent(req.query.limit);
  sendSuccess(res, data, 200);
});

export const getStats = asyncHandler(async (req, res) => {
  const data = await dashboardService.getDashboardStats();
  sendSuccess(res, data, 200);
});
