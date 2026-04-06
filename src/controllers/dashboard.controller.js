import { DashboardService } from '../services/dashboard.service.js';
import { asyncHandler } from '../utils/errors.js';
import { sendSuccess } from '../utils/response.js';

export const getFullDashboard = asyncHandler(async (req, res) => {
  const data = await DashboardService.getFullDashboard();
  sendSuccess(res, data, 'Dashboard data retrieved successfully');
});

export const getSummary = asyncHandler(async (req, res) => {
  const q = req.parsedQuery || req.query;
  const { date_from, date_to } = q;
  const data = await DashboardService.getSummary({ date_from, date_to });
  sendSuccess(res, data, 'Summary retrieved successfully');
});

export const getCategoryBreakdown = asyncHandler(async (req, res) => {
  const q = req.parsedQuery || req.query;
  const { date_from, date_to } = q;
  const data = await DashboardService.getCategoryBreakdown({
    date_from,
    date_to,
  });
  sendSuccess(res, { breakdown: data });
});

export const getMonthlyTrends = asyncHandler(async (req, res) => {
  const q = req.parsedQuery || req.query;
  const months = Math.min(parseInt(q.months) || 12, 24);
  const data = await DashboardService.getMonthlyTrends(months);
  sendSuccess(res, { trends: data });
});

export const getWeeklyTrends = asyncHandler(async (req, res) => {
  const q = req.parsedQuery || req.query;
  const weeks = Math.min(parseInt(q.weeks) || 12, 52);
  const data = await DashboardService.getWeeklyTrends(weeks);
  sendSuccess(res, { trends: data });
});

export const getRecentActivity = asyncHandler(async (req, res) => {
  const q = req.parsedQuery || req.query;
  const limit = Math.min(parseInt(q.limit) || 10, 50);
  const data = await DashboardService.getRecentActivity(limit);
  sendSuccess(res, { activity: data });
});
