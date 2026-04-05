import { Router } from 'express';
import {
  getFullDashboard,
  getSummary,
  getCategoryBreakdown,
  getMonthlyTrends,
  getWeeklyTrends,
  getRecentActivity,
} from '../controllers/dashboard.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { PERMISSIONS } from '../config/constants.js';

const router = Router();

router.use(authenticate);
router.use(authorize(PERMISSIONS.VIEW_DASHBOARD));

/**
 * @route  GET /api/dashboard
 * @desc   Full dashboard snapshot (summary + breakdown + trends + activity)
 * @access Viewer, Analyst, Admin
 */
router.get('/', getFullDashboard);

/**
 * @route  GET /api/dashboard/summary
 * @desc   Aggregated totals: income, expenses, net balance
 * @access Viewer, Analyst, Admin
 * @query  date_from, date_to
 */
router.get('/summary', getSummary);

/**
 * @route  GET /api/dashboard/categories
 * @desc   Per-category totals broken down by type
 * @access Analyst, Admin
 * @query  date_from, date_to
 */
router.get(
  '/categories',
  authorize(PERMISSIONS.VIEW_ANALYTICS),
  getCategoryBreakdown,
);

/**
 * @route  GET /api/dashboard/trends/monthly
 * @desc   Monthly income vs expense trend
 * @access Analyst, Admin
 * @query  months (default 12, max 24)
 */
router.get(
  '/trends/monthly',
  authorize(PERMISSIONS.VIEW_ANALYTICS),
  getMonthlyTrends,
);

/**
 * @route  GET /api/dashboard/trends/weekly
 * @desc   Weekly income vs expense trend
 * @access Analyst, Admin
 * @query  weeks (default 12, max 52)
 */
router.get(
  '/trends/weekly',
  authorize(PERMISSIONS.VIEW_ANALYTICS),
  getWeeklyTrends,
);

/**
 * @route  GET /api/dashboard/activity
 * @desc   Most recent financial records
 * @access Viewer, Analyst, Admin
 * @query  limit (default 10, max 50)
 */
router.get('/activity', getRecentActivity);

export default router;
