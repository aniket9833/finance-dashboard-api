import { DashboardService } from '../services/dashboard.service.js';
import { asyncHandler } from '../utils/errors.js';
import { sendSuccess } from '../utils/response.js';

export const getFullDashboard = asyncHandler(async (req, res) => {
  const data = await DashboardService.getFullDashboard();
  sendSuccess(res, data, 'Dashboard data retrieved successfully');
});

export const getSummary = asyncHandler(async (req, res) => {
  const { date_from, date_to } = req.query;
  const data = await DashboardService.getSummary({ date_from, date_to });
  sendSuccess(res, data, 'Summary retrieved successfully');
});

export const getCategoryBreakdown = asyncHandler(async (req, res) => {
  const { date_from, date_to } = req.query;
  const data = await DashboardService.getCategoryBreakdown({
    date_from,
    date_to,
  });
  sendSuccess(res, { breakdown: data });
});

export const getMonthlyTrends = asyncHandler(async (req, res) => {
  const months = Math.min(parseInt(req.query.months) || 12, 24);
  const data = await DashboardService.getMonthlyTrends(months);
  sendSuccess(res, { trends: data });
});

export const getWeeklyTrends = asyncHandler(async (req, res) => {
  const weeks = Math.min(parseInt(req.query.weeks) || 12, 52);
  const data = await DashboardService.getWeeklyTrends(weeks);
  sendSuccess(res, { trends: data });
});

export const getRecentActivity = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  const data = await DashboardService.getRecentActivity(limit);
  sendSuccess(res, { activity: data });
});
