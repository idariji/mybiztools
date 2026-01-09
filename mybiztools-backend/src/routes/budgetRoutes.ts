import { Router, Response } from 'express';
import { BudgetService } from '../services/budgetService.js';
import { ExpenseService } from '../services/expenseService.js';
import { authenticateUser, AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { safeParseInt, validatePagination } from '../utils/validation.js';

const router = Router();

// All routes require authentication
router.use(authenticateUser);

// ============ BUDGET ROUTES ============

// POST /api/budgets
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, amount, period, category, startDate, endDate, alertThreshold } = req.body;

    if (!name || !amount || !period || !category || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, amount, period, category, startDate, endDate',
        error: 'MISSING_FIELDS',
      });
    }

    const result = await BudgetService.createBudget({
      userId: req.user!.id,
      name,
      amount: parseFloat(amount),
      period,
      category,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      alertThreshold: alertThreshold ? safeParseInt(alertThreshold, 80) : undefined,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error('Create budget route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

// GET /api/budgets
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page, limit, category, isActive } = req.query;

    const pagination = validatePagination(page as string, limit as string);
    const result = await BudgetService.getBudgets(req.user!.id, {
      page: pagination.page,
      limit: pagination.limit,
      category: category as string,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Get budgets route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

// GET /api/budgets/summary
router.get('/summary', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await BudgetService.getBudgetSummary(req.user!.id);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Get budget summary route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

// GET /api/budgets/:budgetId
router.get('/:budgetId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { budgetId } = req.params;

    const result = await BudgetService.getBudgetById(req.user!.id, budgetId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Get budget route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

// PUT /api/budgets/:budgetId
router.put('/:budgetId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { budgetId } = req.params;
    const { name, amount, alertThreshold, isActive } = req.body;

    const result = await BudgetService.updateBudget(req.user!.id, budgetId, {
      name,
      amount: amount ? parseFloat(amount) : undefined,
      alertThreshold: alertThreshold ? safeParseInt(alertThreshold, 80) : undefined,
      isActive,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Update budget route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

// DELETE /api/budgets/:budgetId
router.delete('/:budgetId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { budgetId } = req.params;

    const result = await BudgetService.deleteBudget(req.user!.id, budgetId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Delete budget route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

// ============ EXPENSE ROUTES ============

// POST /api/budgets/expenses
router.post('/expenses', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      budgetId,
      amount,
      description,
      category,
      expenseDate,
      paymentMethod,
      vendor,
      receiptUrl,
      isRecurring,
      recurringFrequency,
    } = req.body;

    if (!amount || !description || !category || !expenseDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: amount, description, category, expenseDate',
        error: 'MISSING_FIELDS',
      });
    }

    const result = await ExpenseService.createExpense({
      userId: req.user!.id,
      budgetId,
      amount: parseFloat(amount),
      description,
      category,
      expenseDate: new Date(expenseDate),
      paymentMethod,
      vendor,
      receiptUrl,
      isRecurring,
      recurringFrequency,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error('Create expense route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

// GET /api/budgets/expenses
router.get('/expenses', async (req: AuthenticatedRequest, res: Response) => {
  try {
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

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Get expenses route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

// GET /api/budgets/expenses/summary
router.get('/expenses/summary', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    // Default to current month
    const now = new Date();
    const start = startDate
      ? new Date(startDate as string)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate
      ? new Date(endDate as string)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const result = await ExpenseService.getExpenseSummary(req.user!.id, start, end);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Get expense summary route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

// GET /api/budgets/expenses/:expenseId
router.get('/expenses/:expenseId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { expenseId } = req.params;

    const result = await ExpenseService.getExpenseById(req.user!.id, expenseId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Get expense route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

// PUT /api/budgets/expenses/:expenseId
router.put('/expenses/:expenseId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { expenseId } = req.params;
    const { amount, description, category, expenseDate, paymentMethod, vendor, receiptUrl } = req.body;

    const result = await ExpenseService.updateExpense(req.user!.id, expenseId, {
      amount: amount ? parseFloat(amount) : undefined,
      description,
      category,
      expenseDate: expenseDate ? new Date(expenseDate) : undefined,
      paymentMethod,
      vendor,
      receiptUrl,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Update expense route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

// DELETE /api/budgets/expenses/:expenseId
router.delete('/expenses/:expenseId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { expenseId } = req.params;

    const result = await ExpenseService.deleteExpense(req.user!.id, expenseId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Delete expense route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

export default router;
