import prisma from '../lib/prisma.js';

export interface CreateExpenseInput {
  userId: string;
  budgetId?: string;
  amount: number;
  description: string;
  category: string;
  expenseDate: Date;
  paymentMethod?: string;
  vendor?: string;
  receiptUrl?: string;
  isRecurring?: boolean;
  recurringFrequency?: string;
}

export interface UpdateExpenseInput {
  amount?: number;
  description?: string;
  category?: string;
  expenseDate?: Date;
  paymentMethod?: string;
  vendor?: string;
  receiptUrl?: string;
}

export class ExpenseService {
  /**
   * Create a new expense
   */
  static async createExpense(input: CreateExpenseInput) {
    try {
      const validCategories = ['marketing', 'operations', 'salary', 'utilities', 'inventory', 'rent', 'transport', 'food', 'office_supplies', 'software', 'other'];
      if (!validCategories.includes(input.category)) {
        return {
          success: false,
          message: 'Invalid category',
          error: 'INVALID_CATEGORY',
        };
      }

      const amountInKobo = BigInt(Math.round(input.amount * 100));

      // Create expense
      const expense = await prisma.expense.create({
        data: {
          user_id: input.userId,
          budget_id: input.budgetId,
          amount: amountInKobo,
          description: input.description,
          category: input.category,
          expense_date: input.expenseDate,
          payment_method: input.paymentMethod,
          vendor: input.vendor,
          receipt_url: input.receiptUrl,
          is_recurring: input.isRecurring || false,
          recurring_frequency: input.recurringFrequency,
        },
      });

      // Update budget spent amount if linked to a budget
      if (input.budgetId) {
        await prisma.budget.update({
          where: { id: input.budgetId },
          data: {
            spent_amount: { increment: amountInKobo },
          },
        });
      }

      return {
        success: true,
        message: 'Expense recorded successfully',
        data: {
          expense: {
            ...expense,
            amount: Number(expense.amount) / 100,
          },
        },
      };
    } catch (error) {
      console.error('Create expense error:', error);
      return {
        success: false,
        message: 'Failed to create expense',
        error: 'CREATE_EXPENSE_FAILED',
      };
    }
  }

  /**
   * Get user's expenses
   */
  static async getExpenses(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      category?: string;
      budgetId?: string;
      startDate?: Date;
      endDate?: Date;
    } = {}
  ) {
    try {
      const { page = 1, limit = 20, category, budgetId, startDate, endDate } = options;
      const skip = (page - 1) * limit;

      const where: any = { user_id: userId };
      if (category) where.category = category;
      if (budgetId) where.budget_id = budgetId;
      if (startDate || endDate) {
        where.expense_date = {};
        if (startDate) where.expense_date.gte = startDate;
        if (endDate) where.expense_date.lte = endDate;
      }

      const [expenses, total] = await Promise.all([
        prisma.expense.findMany({
          where,
          orderBy: { expense_date: 'desc' },
          skip,
          take: limit,
          include: {
            budget: {
              select: { id: true, name: true },
            },
          },
        }),
        prisma.expense.count({ where }),
      ]);

      return {
        success: true,
        data: {
          expenses: expenses.map(e => ({
            ...e,
            amount: Number(e.amount) / 100,
            budget_name: e.budget?.name,
          })),
          pagination: {
            current: page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      console.error('Get expenses error:', error);
      return {
        success: false,
        message: 'Failed to retrieve expenses',
        error: 'GET_EXPENSES_FAILED',
      };
    }
  }

  /**
   * Get expense by ID
   */
  static async getExpenseById(userId: string, expenseId: string) {
    try {
      const expense = await prisma.expense.findFirst({
        where: {
          id: expenseId,
          user_id: userId,
        },
        include: {
          budget: {
            select: { id: true, name: true, category: true },
          },
        },
      });

      if (!expense) {
        return {
          success: false,
          message: 'Expense not found',
          error: 'EXPENSE_NOT_FOUND',
        };
      }

      return {
        success: true,
        data: {
          expense: {
            ...expense,
            amount: Number(expense.amount) / 100,
          },
        },
      };
    } catch (error) {
      console.error('Get expense error:', error);
      return {
        success: false,
        message: 'Failed to retrieve expense',
        error: 'GET_EXPENSE_FAILED',
      };
    }
  }

  /**
   * Update expense
   */
  static async updateExpense(userId: string, expenseId: string, input: UpdateExpenseInput) {
    try {
      const expense = await prisma.expense.findFirst({
        where: {
          id: expenseId,
          user_id: userId,
        },
      });

      if (!expense) {
        return {
          success: false,
          message: 'Expense not found',
          error: 'EXPENSE_NOT_FOUND',
        };
      }

      const oldAmount = expense.amount;
      const updateData: any = {};

      if (input.amount) updateData.amount = BigInt(Math.round(input.amount * 100));
      if (input.description) updateData.description = input.description;
      if (input.category) updateData.category = input.category;
      if (input.expenseDate) updateData.expense_date = input.expenseDate;
      if (input.paymentMethod) updateData.payment_method = input.paymentMethod;
      if (input.vendor) updateData.vendor = input.vendor;
      if (input.receiptUrl) updateData.receipt_url = input.receiptUrl;

      const updatedExpense = await prisma.expense.update({
        where: { id: expenseId },
        data: updateData,
      });

      // Update budget if amount changed and expense is linked to a budget
      if (input.amount && expense.budget_id) {
        const newAmount = BigInt(Math.round(input.amount * 100));
        const difference = newAmount - oldAmount;

        await prisma.budget.update({
          where: { id: expense.budget_id },
          data: {
            spent_amount: { increment: difference },
          },
        });
      }

      return {
        success: true,
        message: 'Expense updated successfully',
        data: {
          expense: {
            ...updatedExpense,
            amount: Number(updatedExpense.amount) / 100,
          },
        },
      };
    } catch (error) {
      console.error('Update expense error:', error);
      return {
        success: false,
        message: 'Failed to update expense',
        error: 'UPDATE_EXPENSE_FAILED',
      };
    }
  }

  /**
   * Delete expense
   */
  static async deleteExpense(userId: string, expenseId: string) {
    try {
      const expense = await prisma.expense.findFirst({
        where: {
          id: expenseId,
          user_id: userId,
        },
      });

      if (!expense) {
        return {
          success: false,
          message: 'Expense not found',
          error: 'EXPENSE_NOT_FOUND',
        };
      }

      // Update budget if linked
      if (expense.budget_id) {
        await prisma.budget.update({
          where: { id: expense.budget_id },
          data: {
            spent_amount: { decrement: expense.amount },
          },
        });
      }

      await prisma.expense.delete({
        where: { id: expenseId },
      });

      return {
        success: true,
        message: 'Expense deleted successfully',
      };
    } catch (error) {
      console.error('Delete expense error:', error);
      return {
        success: false,
        message: 'Failed to delete expense',
        error: 'DELETE_EXPENSE_FAILED',
      };
    }
  }

  /**
   * Get expense summary for a period
   */
  static async getExpenseSummary(
    userId: string,
    startDate: Date,
    endDate: Date
  ) {
    try {
      const expenses = await prisma.expense.findMany({
        where: {
          user_id: userId,
          expense_date: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      const totalAmount = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

      // Group by category
      const byCategory = expenses.reduce((acc: any, e) => {
        if (!acc[e.category]) {
          acc[e.category] = { count: 0, total: 0 };
        }
        acc[e.category].count++;
        acc[e.category].total += Number(e.amount);
        return acc;
      }, {});

      // Group by payment method
      const byPaymentMethod = expenses.reduce((acc: any, e) => {
        const method = e.payment_method || 'unknown';
        if (!acc[method]) {
          acc[method] = { count: 0, total: 0 };
        }
        acc[method].count++;
        acc[method].total += Number(e.amount);
        return acc;
      }, {});

      return {
        success: true,
        data: {
          summary: {
            total_expenses: totalAmount / 100,
            expense_count: expenses.length,
            average_expense: expenses.length > 0 ? (totalAmount / expenses.length) / 100 : 0,
            by_category: Object.entries(byCategory).map(([category, data]: [string, any]) => ({
              category,
              count: data.count,
              total: data.total / 100,
              percentage: totalAmount > 0 ? Math.round((data.total / totalAmount) * 100) : 0,
            })).sort((a, b) => b.total - a.total),
            by_payment_method: Object.entries(byPaymentMethod).map(([method, data]: [string, any]) => ({
              method,
              count: data.count,
              total: data.total / 100,
            })),
            period: {
              start: startDate,
              end: endDate,
            },
          },
        },
      };
    } catch (error) {
      console.error('Get expense summary error:', error);
      return {
        success: false,
        message: 'Failed to get expense summary',
        error: 'GET_SUMMARY_FAILED',
      };
    }
  }
}

export default ExpenseService;
