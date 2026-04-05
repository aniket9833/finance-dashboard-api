import { RecordModel } from '../models/record.model.js';

export const DashboardService = {
  async getSummary(filters = {}) {
    const summary = await RecordModel.getSummary(filters);
    return {
      total_income: parseFloat(summary.total_income),
      total_expenses: parseFloat(summary.total_expenses),
      net_balance: parseFloat(summary.net_balance),
      total_records: parseInt(summary.total_records),
    };
  },

  async getCategoryBreakdown(filters = {}) {
    const rows = await RecordModel.getCategoryTotals(filters);
    return rows.map((r) => ({
      category: r.category,
      type: r.type,
      total: parseFloat(r.total),
      count: parseInt(r.count),
    }));
  },

  async getMonthlyTrends(months = 12) {
    const rows = await RecordModel.getMonthlyTrends({ months });
    return rows.map((r) => ({
      month: r.month,
      income: parseFloat(r.income),
      expenses: parseFloat(r.expenses),
      net: parseFloat(r.income) - parseFloat(r.expenses),
    }));
  },

  async getWeeklyTrends(weeks = 12) {
    const rows = await RecordModel.getWeeklyTrends({ weeks });
    return rows.map((r) => ({
      week_start: r.week_start,
      income: parseFloat(r.income),
      expenses: parseFloat(r.expenses),
      net: parseFloat(r.income) - parseFloat(r.expenses),
    }));
  },

  async getRecentActivity(limit = 10) {
    return RecordModel.getRecentActivity({ limit });
  },

  async getFullDashboard() {
    const [summary, categoryBreakdown, monthlyTrends, recentActivity] =
      await Promise.all([
        RecordModel.getSummary(),
        RecordModel.getCategoryTotals(),
        RecordModel.getMonthlyTrends({ months: 6 }),
        RecordModel.getRecentActivity({ limit: 5 }),
      ]);

    return {
      summary: {
        total_income: parseFloat(summary.total_income),
        total_expenses: parseFloat(summary.total_expenses),
        net_balance: parseFloat(summary.net_balance),
        total_records: parseInt(summary.total_records),
      },
      category_breakdown: categoryBreakdown.map((r) => ({
        category: r.category,
        type: r.type,
        total: parseFloat(r.total),
        count: parseInt(r.count),
      })),
      monthly_trends: monthlyTrends.map((r) => ({
        month: r.month,
        income: parseFloat(r.income),
        expenses: parseFloat(r.expenses),
        net: parseFloat(r.income) - parseFloat(r.expenses),
      })),
      recent_activity: recentActivity,
    };
  },
};
