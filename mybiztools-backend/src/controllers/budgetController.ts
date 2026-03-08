import { Request, Response } from 'express';
import { BudgetService } from '../services/budgetService.js';
import { ExpenseService } from '../services/expenseService.js';
import { validatePagination } from '../utils/validation.js';

// ============================================================================
// BUDGET CONTROLLER
// ============================================================================

export class BudgetController {
  /** POST /api/budgets */
  static async createBudget(req: Request, res: Response): Promise<void> {
    const { name, amount, period, category, startDate, endDate, alertThreshold } = req.body;
    const result = await BudgetService.createBudget({
      userId: req.user!.id,
      name,
      amount: parseFloat(amount),
      period,
      category,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      alertThreshold,
    });
    res.status(result.success ? 201 : 400).json(result);
  }

  /** GET /api/budgets */
  static async getBudgets(req: Request, res: Response): Promise<void> {
    const { page, limit, category, isActive } = req.query;
    const pagination = validatePagination(page as string, limit as string);
    const result = await BudgetService.getBudgets(req.user!.id, {
      page: pagination.page,
      limit: pagination.limit,
      category: category as string,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    });
    res.status(result.success ? 200 : 400).json(result);
  }

  /** GET /api/budgets/summary */
  static async getBudgetSummary(req: Request, res: Response): Promise<void> {
    const result = await BudgetService.getBudgetSummary(req.user!.id);
    res.status(result.success ? 200 : 400).json(result);
  }

  /** GET /api/budgets/:budgetId */
  static async getBudgetById(req: Request, res: Response): Promise<void> {
    const result = await BudgetService.getBudgetById(req.user!.id, req.params.budgetId);
    res.status(result.success ? 200 : 404).json(result);
  }

  /** PUT /api/budgets/:budgetId */
  static async updateBudget(req: Request, res: Response): Promise<void> {
    const { name, amount, alertThreshold, isActive } = req.body;
    const result = await BudgetService.updateBudget(req.user!.id, req.params.budgetId, {
      name,
      amount: amount ? parseFloat(amount) : undefined,
      alertThreshold,
      isActive,
    });
    res.status(result.success ? 200 : 400).json(result);
  }

  /** DELETE /api/budgets/:budgetId */
  static async deleteBudget(req: Request, res: Response): Promise<void> {
    const result = await BudgetService.deleteBudget(req.user!.id, req.params.budgetId);
    res.status(result.success ? 200 : 400).json(result);
  }

  /** POST /api/budgets/expenses */
  static async createExpense(req: Request, res: Response): Promise<void> {
    const result = await ExpenseService.createExpense({
      userId: req.user!.id,
      ...req.body,
      amount: parseFloat(req.body.amount),
      expenseDate: new Date(req.body.expenseDate),
    });
    res.status(result.success ? 201 : 400).json(result);
  }

  /** GET /api/budgets/expenses */
  static async getExpenses(req: Request, res: Response): Promise<void> {
    const { page, limit, category, budgetId, startDate, endDate } = req.query;
    const pagination = validatePagination(page as string, limit as string);
    const result = await ExpenseService.getExpenses(req.user!.id, {
      page: pagination.page,
      limit: pagination.limit,
      category: category as string,
      budgetId: budgetId as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });
    res.status(result.success ? 200 : 400).json(result);
  }

  /** GET /api/budgets/expenses/summary */
  static async getExpenseSummary(req: Request, res: Response): Promise<void> {
    const { startDate, endDate } = req.query;
    const now = new Date();
    const start = startDate ? new Date(startDate as string) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate as string) : new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const result = await ExpenseService.getExpenseSummary(req.user!.id, start, end);
    res.status(result.success ? 200 : 400).json(result);
  }

  /** GET /api/budgets/expenses/:expenseId */
  static async getExpenseById(req: Request, res: Response): Promise<void> {
    const result = await ExpenseService.getExpenseById(req.user!.id, req.params.expenseId);
    res.status(result.success ? 200 : 404).json(result);
  }

  /** PUT /api/budgets/expenses/:expenseId */
  static async updateExpense(req: Request, res: Response): Promise<void> {
    const { amount, expenseDate, ...rest } = req.body;
    const result = await ExpenseService.updateExpense(req.user!.id, req.params.expenseId, {
      ...rest,
      amount: amount ? parseFloat(amount) : undefined,
      expenseDate: expenseDate ? new Date(expenseDate) : undefined,
    });
    res.status(result.success ? 200 : 400).json(result);
  }

  /** DELETE /api/budgets/expenses/:expenseId */
  static async deleteExpense(req: Request, res: Response): Promise<void> {
    const result = await ExpenseService.deleteExpense(req.user!.id, req.params.expenseId);
    res.status(result.success ? 200 : 400).json(result);
  }
}