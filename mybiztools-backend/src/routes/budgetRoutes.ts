// import { Router, Response } from 'express';
// import { BudgetService } from '../services/budgetService.js';
// import { ExpenseService } from '../services/expenseService.js';
// import { authenticateUser, AuthenticatedRequest } from '../middleware/authMiddleware.js';
// import { safeParseInt, validatePagination } from '../utils/validation.js';

// const router = Router();

// // All routes require authentication
// router.use(authenticateUser);

// // ============ BUDGET ROUTES ============

// // POST /api/budgets
// router.post('/', async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const { name, amount, period, category, startDate, endDate, alertThreshold } = req.body;

//     if (!name || !amount || !period || !category || !startDate || !endDate) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing required fields: name, amount, period, category, startDate, endDate',
//         error: 'MISSING_FIELDS',
//       });
//     }

//     const result = await BudgetService.createBudget({
//       userId: req.user!.id,
//       name,
//       amount: parseFloat(amount),
//       period,
//       category,
//       startDate: new Date(startDate),
//       endDate: new Date(endDate),
//       alertThreshold: alertThreshold ? safeParseInt(alertThreshold, 80) : undefined,
//     });

//     if (!result.success) {
//       return res.status(400).json(result);
//     }

//     return res.status(201).json(result);
//   } catch (error) {
//     console.error('Create budget route error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: 'SERVER_ERROR',
//     });
//   }
// });

// // GET /api/budgets
// router.get('/', async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const { page, limit, category, isActive } = req.query;

//     const pagination = validatePagination(page as string, limit as string);
//     const result = await BudgetService.getBudgets(req.user!.id, {
//       page: pagination.page,
//       limit: pagination.limit,
//       category: category as string,
//       isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
//     });

//     if (!result.success) {
//       return res.status(400).json(result);
//     }

//     return res.status(200).json(result);
//   } catch (error) {
//     console.error('Get budgets route error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: 'SERVER_ERROR',
//     });
//   }
// });

// // GET /api/budgets/summary
// router.get('/summary', async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const result = await BudgetService.getBudgetSummary(req.user!.id);

//     if (!result.success) {
//       return res.status(400).json(result);
//     }

//     return res.status(200).json(result);
//   } catch (error) {
//     console.error('Get budget summary route error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: 'SERVER_ERROR',
//     });
//   }
// });

// // GET /api/budgets/:budgetId
// router.get('/:budgetId', async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const { budgetId } = req.params;

//     const result = await BudgetService.getBudgetById(req.user!.id, budgetId);

//     if (!result.success) {
//       return res.status(404).json(result);
//     }

//     return res.status(200).json(result);
//   } catch (error) {
//     console.error('Get budget route error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: 'SERVER_ERROR',
//     });
//   }
// });

// // PUT /api/budgets/:budgetId
// router.put('/:budgetId', async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const { budgetId } = req.params;
//     const { name, amount, alertThreshold, isActive } = req.body;

//     const result = await BudgetService.updateBudget(req.user!.id, budgetId, {
//       name,
//       amount: amount ? parseFloat(amount) : undefined,
//       alertThreshold: alertThreshold ? safeParseInt(alertThreshold, 80) : undefined,
//       isActive,
//     });

//     if (!result.success) {
//       return res.status(400).json(result);
//     }

//     return res.status(200).json(result);
//   } catch (error) {
//     console.error('Update budget route error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: 'SERVER_ERROR',
//     });
//   }
// });

// // DELETE /api/budgets/:budgetId
// router.delete('/:budgetId', async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const { budgetId } = req.params;

//     const result = await BudgetService.deleteBudget(req.user!.id, budgetId);

//     if (!result.success) {
//       return res.status(400).json(result);
//     }

//     return res.status(200).json(result);
//   } catch (error) {
//     console.error('Delete budget route error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: 'SERVER_ERROR',
//     });
//   }
// });

// // ============ EXPENSE ROUTES ============

// // POST /api/budgets/expenses
// router.post('/expenses', async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const {
//       budgetId,
//       amount,
//       description,
//       category,
//       expenseDate,
//       paymentMethod,
//       vendor,
//       receiptUrl,
//       isRecurring,
//       recurringFrequency,
//     } = req.body;

//     if (!amount || !description || !category || !expenseDate) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing required fields: amount, description, category, expenseDate',
//         error: 'MISSING_FIELDS',
//       });
//     }

//     const result = await ExpenseService.createExpense({
//       userId: req.user!.id,
//       budgetId,
//       amount: parseFloat(amount),
//       description,
//       category,
//       expenseDate: new Date(expenseDate),
//       paymentMethod,
//       vendor,
//       receiptUrl,
//       isRecurring,
//       recurringFrequency,
//     });

//     if (!result.success) {
//       return res.status(400).json(result);
//     }

//     return res.status(201).json(result);
//   } catch (error) {
//     console.error('Create expense route error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: 'SERVER_ERROR',
//     });
//   }
// });

// // GET /api/budgets/expenses
// router.get('/expenses', async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const { page, limit, category, budgetId, startDate, endDate } = req.query;

//     const pagination = validatePagination(page as string, limit as string);
//     const result = await ExpenseService.getExpenses(req.user!.id, {
//       page: pagination.page,
//       limit: pagination.limit,
//       category: category as string,
//       budgetId: budgetId as string,
//       startDate: startDate ? new Date(startDate as string) : undefined,
//       endDate: endDate ? new Date(endDate as string) : undefined,
//     });

//     if (!result.success) {
//       return res.status(400).json(result);
//     }

//     return res.status(200).json(result);
//   } catch (error) {
//     console.error('Get expenses route error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: 'SERVER_ERROR',
//     });
//   }
// });

// // GET /api/budgets/expenses/summary
// router.get('/expenses/summary', async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const { startDate, endDate } = req.query;

//     // Default to current month
//     const now = new Date();
//     const start = startDate
//       ? new Date(startDate as string)
//       : new Date(now.getFullYear(), now.getMonth(), 1);
//     const end = endDate
//       ? new Date(endDate as string)
//       : new Date(now.getFullYear(), now.getMonth() + 1, 0);

//     const result = await ExpenseService.getExpenseSummary(req.user!.id, start, end);

//     if (!result.success) {
//       return res.status(400).json(result);
//     }

//     return res.status(200).json(result);
//   } catch (error) {
//     console.error('Get expense summary route error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: 'SERVER_ERROR',
//     });
//   }
// });

// // GET /api/budgets/expenses/:expenseId
// router.get('/expenses/:expenseId', async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const { expenseId } = req.params;

//     const result = await ExpenseService.getExpenseById(req.user!.id, expenseId);

//     if (!result.success) {
//       return res.status(404).json(result);
//     }

//     return res.status(200).json(result);
//   } catch (error) {
//     console.error('Get expense route error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: 'SERVER_ERROR',
//     });
//   }
// });

// // PUT /api/budgets/expenses/:expenseId
// router.put('/expenses/:expenseId', async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const { expenseId } = req.params;
//     const { amount, description, category, expenseDate, paymentMethod, vendor, receiptUrl } = req.body;

//     const result = await ExpenseService.updateExpense(req.user!.id, expenseId, {
//       amount: amount ? parseFloat(amount) : undefined,
//       description,
//       category,
//       expenseDate: expenseDate ? new Date(expenseDate) : undefined,
//       paymentMethod,
//       vendor,
//       receiptUrl,
//     });

//     if (!result.success) {
//       return res.status(400).json(result);
//     }

//     return res.status(200).json(result);
//   } catch (error) {
//     console.error('Update expense route error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: 'SERVER_ERROR',
//     });
//   }
// });

// // DELETE /api/budgets/expenses/:expenseId
// router.delete('/expenses/:expenseId', async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const { expenseId } = req.params;

//     const result = await ExpenseService.deleteExpense(req.user!.id, expenseId);

//     if (!result.success) {
//       return res.status(400).json(result);
//     }

//     return res.status(200).json(result);
//   } catch (error) {
//     console.error('Delete expense route error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: 'SERVER_ERROR',
//     });
//   }
// });

// export default router;


import { Router } from 'express';
import { BudgetController } from '../controllers/budgetController.js';
import { authenticateUser, requirePlan } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import {
  createBudgetSchema,
  updateBudgetSchema,
  createExpenseSchema,
  updateExpenseSchema,
} from '../validators/budgetValidator.js';

// ============================================================================
// BUDGET ROUTES
// All routes require authentication
// ============================================================================

const router = Router();

router.use(authenticateUser);
router.use(requirePlan('starter', 'pro', 'enterprise'));

/**
 * @swagger
 * tags:
 *   name: Budgets
 *   description: Budget and expense management
 */

// ── Budget routes ────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/budgets:
 *   post:
 *     summary: Create a new budget
 *     tags: [Budgets]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBudgetRequest'
 *     responses:
 *       201:
 *         description: Budget created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', validate(createBudgetSchema), BudgetController.createBudget);

/**
 * @swagger
 * /api/budgets:
 *   get:
 *     summary: Get all budgets for current user
 *     tags: [Budgets]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: isActive
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Budgets retrieved successfully
 */
router.get('/', BudgetController.getBudgets);

/**
 * @swagger
 * /api/budgets/summary:
 *   get:
 *     summary: Get budget summary for current month
 *     tags: [Budgets]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Summary retrieved successfully
 */
router.get('/summary', BudgetController.getBudgetSummary);

// ── Expense routes ───────────────────────────────────────────────────────────
// NOTE: /expenses routes must be defined BEFORE /:budgetId to avoid conflicts

/**
 * @swagger
 * /api/budgets/expenses:
 *   post:
 *     summary: Create a new expense
 *     tags: [Budgets]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: Expense created successfully
 */
router.post('/expenses', validate(createExpenseSchema), BudgetController.createExpense);

/**
 * @swagger
 * /api/budgets/expenses:
 *   get:
 *     summary: Get all expenses for current user
 *     tags: [Budgets]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: budgetId
 *         schema: { type: string }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Expenses retrieved successfully
 */
router.get('/expenses', BudgetController.getExpenses);

/**
 * @swagger
 * /api/budgets/expenses/summary:
 *   get:
 *     summary: Get expense summary for a date range
 *     tags: [Budgets]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Expense summary retrieved successfully
 */
router.get('/expenses/summary', BudgetController.getExpenseSummary);

/**
 * @swagger
 * /api/budgets/expenses/{expenseId}:
 *   get:
 *     summary: Get expense by ID
 *     tags: [Budgets]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: expenseId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Expense retrieved successfully
 *       404:
 *         description: Expense not found
 */
router.get('/expenses/:expenseId', BudgetController.getExpenseById);

/**
 * @swagger
 * /api/budgets/expenses/{expenseId}:
 *   put:
 *     summary: Update an expense
 *     tags: [Budgets]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: expenseId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Expense updated successfully
 */
router.put('/expenses/:expenseId', validate(updateExpenseSchema), BudgetController.updateExpense);

/**
 * @swagger
 * /api/budgets/expenses/{expenseId}:
 *   delete:
 *     summary: Delete an expense
 *     tags: [Budgets]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: expenseId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Expense deleted successfully
 */
router.delete('/expenses/:expenseId', BudgetController.deleteExpense);

// ── Budget by ID routes ──────────────────────────────────────────────────────

/**
 * @swagger
 * /api/budgets/{budgetId}:
 *   get:
 *     summary: Get budget by ID
 *     tags: [Budgets]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: budgetId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Budget retrieved successfully
 *       404:
 *         description: Budget not found
 */
router.get('/:budgetId', BudgetController.getBudgetById);

/**
 * @swagger
 * /api/budgets/{budgetId}:
 *   put:
 *     summary: Update a budget
 *     tags: [Budgets]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: budgetId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Budget updated successfully
 */
router.put('/:budgetId', validate(updateBudgetSchema), BudgetController.updateBudget);

/**
 * @swagger
 * /api/budgets/{budgetId}:
 *   delete:
 *     summary: Delete a budget
 *     tags: [Budgets]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: budgetId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Budget deleted successfully
 */
router.delete('/:budgetId', BudgetController.deleteBudget);

export default router;