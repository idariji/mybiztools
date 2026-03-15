import { Router } from 'express';
import { BudgetController } from '../controllers/budgetController.js';
import { authenticateUser,requirePlan } from '../middleware/authMiddleware.js';
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