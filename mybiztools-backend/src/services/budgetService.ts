// import prisma from '../lib/prisma.js';

// export interface CreateBudgetInput {
//   userId: string;
//   name: string;
//   amount: number;
//   period: string;
//   category: string;
//   startDate: Date;
//   endDate: Date;
//   alertThreshold?: number;
// }

// export interface UpdateBudgetInput {
//   name?: string;
//   amount?: number;
//   alertThreshold?: number;
//   isActive?: boolean;
// }

// export class BudgetService {
//   /**
//    * Create a new budget
//    */
//   static async createBudget(input: CreateBudgetInput) {
//     try {
//       const validPeriods = ['monthly', 'quarterly', 'yearly', 'custom'];
//       if (!validPeriods.includes(input.period)) {
//         return {
//           success: false,
//           message: 'Invalid period. Must be: monthly, quarterly, yearly, or custom',
//           error: 'INVALID_PERIOD',
//         };
//       }

//       const validCategories = ['marketing', 'operations', 'salary', 'utilities', 'inventory', 'rent', 'transport', 'other'];
//       if (!validCategories.includes(input.category)) {
//         return {
//           success: false,
//           message: 'Invalid category',
//           error: 'INVALID_CATEGORY',
//         };
//       }

//       const budget = await prisma.budget.create({
//         data: {
//           user_id: input.userId,
//           name: input.name,
//           amount: BigInt(Math.round(input.amount * 100)), // Store in kobo
//           period: input.period,
//           category: input.category,
//           start_date: input.startDate,
//           end_date: input.endDate,
//           alert_threshold: input.alertThreshold || 80,
//         },
//       });

//       return {
//         success: true,
//         message: 'Budget created successfully',
//         data: {
//           budget: {
//             ...budget,
//             amount: Number(budget.amount) / 100,
//             spent_amount: Number(budget.spent_amount) / 100,
//           },
//         },
//       };
//     } catch (error) {
//       console.error('Create budget error:', error);
//       return {
//         success: false,
//         message: 'Failed to create budget',
//         error: 'CREATE_BUDGET_FAILED',
//       };
//     }
//   }

//   /**
//    * Get user's budgets
//    */
//   static async getBudgets(
//     userId: string,
//     options: {
//       page?: number;
//       limit?: number;
//       category?: string;
//       isActive?: boolean;
//     } = {}
//   ) {
//     try {
//       const { page = 1, limit = 20, category, isActive } = options;
//       const skip = (page - 1) * limit;

//       const where: any = { user_id: userId };
//       if (category) where.category = category;
//       if (typeof isActive === 'boolean') where.is_active = isActive;

//       const [budgets, total] = await Promise.all([
//         prisma.budget.findMany({
//           where,
//           orderBy: { created_at: 'desc' },
//           skip,
//           take: limit,
//           include: {
//             expenses: {
//               select: { id: true, amount: true },
//             },
//           },
//         }),
//         prisma.budget.count({ where }),
//       ]);

//       return {
//         success: true,
//         data: {
//           budgets: budgets.map(b => ({
//             id: b.id,
//             name: b.name,
//             amount: Number(b.amount) / 100,
//             spent_amount: Number(b.spent_amount) / 100,
//             remaining: (Number(b.amount) - Number(b.spent_amount)) / 100,
//             percentage_used: Number(b.amount) > 0
//               ? Math.round((Number(b.spent_amount) / Number(b.amount)) * 100)
//               : 0,
//             period: b.period,
//             category: b.category,
//             start_date: b.start_date,
//             end_date: b.end_date,
//             is_active: b.is_active,
//             alert_threshold: b.alert_threshold,
//             expense_count: b.expenses.length,
//             created_at: b.created_at,
//           })),
//           pagination: {
//             current: page,
//             limit,
//             total,
//             pages: Math.ceil(total / limit),
//           },
//         },
//       };
//     } catch (error) {
//       console.error('Get budgets error:', error);
//       return {
//         success: false,
//         message: 'Failed to retrieve budgets',
//         error: 'GET_BUDGETS_FAILED',
//       };
//     }
//   }

//   /**
//    * Get budget by ID
//    */
//   static async getBudgetById(userId: string, budgetId: string) {
//     try {
//       const budget = await prisma.budget.findFirst({
//         where: {
//           id: budgetId,
//           user_id: userId,
//         },
//         include: {
//           expenses: {
//             orderBy: { expense_date: 'desc' },
//             take: 10,
//           },
//         },
//       });

//       if (!budget) {
//         return {
//           success: false,
//           message: 'Budget not found',
//           error: 'BUDGET_NOT_FOUND',
//         };
//       }

//       return {
//         success: true,
//         data: {
//           budget: {
//             ...budget,
//             amount: Number(budget.amount) / 100,
//             spent_amount: Number(budget.spent_amount) / 100,
//             remaining: (Number(budget.amount) - Number(budget.spent_amount)) / 100,
//             percentage_used: Number(budget.amount) > 0
//               ? Math.round((Number(budget.spent_amount) / Number(budget.amount)) * 100)
//               : 0,
//             expenses: budget.expenses.map(e => ({
//               ...e,
//               amount: Number(e.amount) / 100,
//             })),
//           },
//         },
//       };
//     } catch (error) {
//       console.error('Get budget error:', error);
//       return {
//         success: false,
//         message: 'Failed to retrieve budget',
//         error: 'GET_BUDGET_FAILED',
//       };
//     }
//   }

//   /**
//    * Update budget
//    */
//   static async updateBudget(userId: string, budgetId: string, input: UpdateBudgetInput) {
//     try {
//       const budget = await prisma.budget.findFirst({
//         where: {
//           id: budgetId,
//           user_id: userId,
//         },
//       });

//       if (!budget) {
//         return {
//           success: false,
//           message: 'Budget not found',
//           error: 'BUDGET_NOT_FOUND',
//         };
//       }

//       const updateData: any = {};
//       if (input.name) updateData.name = input.name;
//       if (input.amount) updateData.amount = BigInt(Math.round(input.amount * 100));
//       if (input.alertThreshold) updateData.alert_threshold = input.alertThreshold;
//       if (typeof input.isActive === 'boolean') updateData.is_active = input.isActive;

//       const updatedBudget = await prisma.budget.update({
//         where: { id: budgetId },
//         data: updateData,
//       });

//       return {
//         success: true,
//         message: 'Budget updated successfully',
//         data: {
//           budget: {
//             ...updatedBudget,
//             amount: Number(updatedBudget.amount) / 100,
//             spent_amount: Number(updatedBudget.spent_amount) / 100,
//           },
//         },
//       };
//     } catch (error) {
//       console.error('Update budget error:', error);
//       return {
//         success: false,
//         message: 'Failed to update budget',
//         error: 'UPDATE_BUDGET_FAILED',
//       };
//     }
//   }

//   /**
//    * Delete budget
//    */
//   static async deleteBudget(userId: string, budgetId: string) {
//     try {
//       const budget = await prisma.budget.findFirst({
//         where: {
//           id: budgetId,
//           user_id: userId,
//         },
//       });

//       if (!budget) {
//         return {
//           success: false,
//           message: 'Budget not found',
//           error: 'BUDGET_NOT_FOUND',
//         };
//       }

//       await prisma.budget.delete({
//         where: { id: budgetId },
//       });

//       return {
//         success: true,
//         message: 'Budget deleted successfully',
//       };
//     } catch (error) {
//       console.error('Delete budget error:', error);
//       return {
//         success: false,
//         message: 'Failed to delete budget',
//         error: 'DELETE_BUDGET_FAILED',
//       };
//     }
//   }

//   /**
//    * Get budget summary for user
//    */
//   static async getBudgetSummary(userId: string) {
//     try {
//       const now = new Date();

//       // Get active budgets
//       const activeBudgets = await prisma.budget.findMany({
//         where: {
//           user_id: userId,
//           is_active: true,
//           start_date: { lte: now },
//           end_date: { gte: now },
//         },
//       });

//       const totalBudgeted = activeBudgets.reduce((sum, b) => sum + Number(b.amount), 0);
//       const totalSpent = activeBudgets.reduce((sum, b) => sum + Number(b.spent_amount), 0);

//       // Get budgets that are over threshold
//       const overThreshold = activeBudgets.filter(b => {
//         const percentage = Number(b.amount) > 0
//           ? (Number(b.spent_amount) / Number(b.amount)) * 100
//           : 0;
//         return percentage >= b.alert_threshold;
//       });

//       // Get category breakdown
//       const categoryBreakdown = activeBudgets.reduce((acc: any, b) => {
//         if (!acc[b.category]) {
//           acc[b.category] = { budgeted: 0, spent: 0 };
//         }
//         acc[b.category].budgeted += Number(b.amount);
//         acc[b.category].spent += Number(b.spent_amount);
//         return acc;
//       }, {});

//       return {
//         success: true,
//         data: {
//           summary: {
//             total_budgeted: totalBudgeted / 100,
//             total_spent: totalSpent / 100,
//             total_remaining: (totalBudgeted - totalSpent) / 100,
//             overall_percentage: totalBudgeted > 0
//               ? Math.round((totalSpent / totalBudgeted) * 100)
//               : 0,
//             active_budgets_count: activeBudgets.length,
//             over_threshold_count: overThreshold.length,
//             category_breakdown: Object.entries(categoryBreakdown).map(([category, values]: [string, any]) => ({
//               category,
//               budgeted: values.budgeted / 100,
//               spent: values.spent / 100,
//               percentage: values.budgeted > 0
//                 ? Math.round((values.spent / values.budgeted) * 100)
//                 : 0,
//             })),
//           },
//         },
//       };
//     } catch (error) {
//       console.error('Get budget summary error:', error);
//       return {
//         success: false,
//         message: 'Failed to get budget summary',
//         error: 'GET_SUMMARY_FAILED',
//       };
//     }
//   }
// }

// export default BudgetService;


import prisma from '../lib/prisma.js';
import type { ServiceResponse } from '../types/index.js';

// ============================================================================
// BUDGET SERVICE
// ============================================================================

export interface CreateBudgetInput {
  userId: string;
  name: string;
  amount: number;
  period: string;
  category: string;
  startDate: Date;
  endDate: Date;
  alertThreshold?: number;
}

export interface UpdateBudgetInput {
  name?: string;
  amount?: number;
  alertThreshold?: number;
  isActive?: boolean;
}

const VALID_PERIODS = ['monthly', 'quarterly', 'yearly', 'custom'];
const VALID_CATEGORIES = ['marketing', 'operations', 'salary', 'utilities', 'inventory', 'rent', 'transport', 'other'];

const formatBudget = (b: any) => ({
  id: b.id,
  name: b.name,
  amount: Number(b.amount) / 100,
  spentAmount: Number(b.spentAmount) / 100,
  remaining: (Number(b.amount) - Number(b.spentAmount)) / 100,
  percentageUsed: Number(b.amount) > 0
    ? Math.round((Number(b.spentAmount) / Number(b.amount)) * 100)
    : 0,
  period: b.period,
  category: b.category,
  startDate: b.startDate?.toISOString() ?? null,
  endDate: b.endDate?.toISOString() ?? null,
  isActive: b.isActive,
  alertThreshold: b.alertThreshold,
  createdAt: b.createdAt?.toISOString() ?? null,
});

export class BudgetService {
  // --------------------------------------------------------------------------
  // CREATE BUDGET
  // --------------------------------------------------------------------------

  static async createBudget(input: CreateBudgetInput): Promise<ServiceResponse> {
    if (!VALID_PERIODS.includes(input.period)) {
      return {
        success: false,
        message: 'Invalid period. Must be: monthly, quarterly, yearly, or custom',
        error: 'INVALID_PERIOD',
      };
    }

    if (!VALID_CATEGORIES.includes(input.category)) {
      return {
        success: false,
        message: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`,
        error: 'INVALID_CATEGORY',
      };
    }

    const budget = await prisma.budget.create({
      data: {
        userId: input.userId,
        name: input.name,
        amount: BigInt(Math.round(input.amount * 100)),
        period: input.period,
        category: input.category,
        startDate: input.startDate,
        endDate: input.endDate,
        alertThreshold: input.alertThreshold ?? 80,
      },
    });

    return {
      success: true,
      message: 'Budget created successfully',
      data: { budget: formatBudget(budget) },
    };
  }

  // --------------------------------------------------------------------------
  // GET BUDGETS
  // --------------------------------------------------------------------------

  static async getBudgets(
    userId: string,
    options: { page?: number; limit?: number; category?: string; isActive?: boolean } = {}
  ): Promise<ServiceResponse> {
    const { page = 1, limit = 20, category, isActive } = options;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (category) where.category = category;
    if (typeof isActive === 'boolean') where.isActive = isActive;

    const [budgets, total] = await Promise.all([
      prisma.budget.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          expenses: { select: { id: true } },
        },
      }),
      prisma.budget.count({ where }),
    ]);

    return {
      success: true,
      message: 'Budgets retrieved successfully',
      data: {
        budgets: (budgets as any[]).map((b) => ({
          ...formatBudget(b),
          expenseCount: (b as any).expenses?.length ?? 0,
        })),
        pagination: {
          current: page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    };
  }

  // --------------------------------------------------------------------------
  // GET BUDGET BY ID
  // --------------------------------------------------------------------------

  static async getBudgetById(userId: string, budgetId: string): Promise<ServiceResponse> {
    const budget = await prisma.budget.findFirst({
      where: { id: budgetId, userId },
      include: {
        expenses: { orderBy: { expenseDate: 'desc' }, take: 10 },
      },
    });

    if (!budget) {
      return { success: false, message: 'Budget not found', error: 'BUDGET_NOT_FOUND' };
    }

    return {
      success: true,
      message: 'Budget retrieved successfully',
      data: {
        budget: {
          ...formatBudget(budget),
          expenses: (budget as any).expenses?.map((e: any) => ({
            id: e.id,
            amount: Number(e.amount) / 100,
            description: e.description,
            category: e.category,
            expenseDate: e.expenseDate?.toISOString() ?? null,
            paymentMethod: e.paymentMethod,
            vendor: e.vendor,
          })) ?? [],
        },
      },
    };
  }

  // --------------------------------------------------------------------------
  // UPDATE BUDGET
  // --------------------------------------------------------------------------

  static async updateBudget(
    userId: string,
    budgetId: string,
    input: UpdateBudgetInput
  ): Promise<ServiceResponse> {
    const budget = await prisma.budget.findFirst({ where: { id: budgetId, userId } });

    if (!budget) {
      return { success: false, message: 'Budget not found', error: 'BUDGET_NOT_FOUND' };
    }

    const updateData: any = {};
    if (input.name) updateData.name = input.name;
    if (input.amount) updateData.amount = BigInt(Math.round(input.amount * 100));
    if (input.alertThreshold) updateData.alertThreshold = input.alertThreshold;
    if (typeof input.isActive === 'boolean') updateData.isActive = input.isActive;

    const updatedBudget = await prisma.budget.update({
      where: { id: budgetId },
      data: updateData,
    });

    return {
      success: true,
      message: 'Budget updated successfully',
      data: { budget: formatBudget(updatedBudget) },
    };
  }

  // --------------------------------------------------------------------------
  // DELETE BUDGET
  // --------------------------------------------------------------------------

  static async deleteBudget(userId: string, budgetId: string): Promise<ServiceResponse> {
    const budget = await prisma.budget.findFirst({ where: { id: budgetId, userId } });

    if (!budget) {
      return { success: false, message: 'Budget not found', error: 'BUDGET_NOT_FOUND' };
    }

    await prisma.budget.delete({ where: { id: budgetId } });
    return { success: true, message: 'Budget deleted successfully' };
  }

  // --------------------------------------------------------------------------
  // GET BUDGET SUMMARY
  // --------------------------------------------------------------------------

  static async getBudgetSummary(userId: string): Promise<ServiceResponse> {
    const now = new Date();

    const activeBudgets = await prisma.budget.findMany({
      where: {
        userId,
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
    }) as any[];

    const totalBudgeted = activeBudgets.reduce((sum, b) => sum + Number(b.amount), 0);
    const totalSpent = activeBudgets.reduce((sum, b) => sum + Number(b.spentAmount), 0);

    const overThreshold = activeBudgets.filter((b) => {
      const percentage = Number(b.amount) > 0
        ? (Number(b.spentAmount) / Number(b.amount)) * 100
        : 0;
      return percentage >= b.alertThreshold;
    });

    const categoryBreakdown = activeBudgets.reduce((acc: any, b) => {
      if (!acc[b.category]) acc[b.category] = { budgeted: 0, spent: 0 };
      acc[b.category].budgeted += Number(b.amount);
      acc[b.category].spent += Number(b.spentAmount);
      return acc;
    }, {});

    return {
      success: true,
      message: 'Budget summary retrieved successfully',
      data: {
        summary: {
          totalBudgeted: totalBudgeted / 100,
          totalSpent: totalSpent / 100,
          totalRemaining: (totalBudgeted - totalSpent) / 100,
          overallPercentage: totalBudgeted > 0
            ? Math.round((totalSpent / totalBudgeted) * 100)
            : 0,
          activeBudgetsCount: activeBudgets.length,
          overThresholdCount: overThreshold.length,
          categoryBreakdown: Object.entries(categoryBreakdown).map(
            ([category, values]: [string, any]) => ({
              category,
              budgeted: values.budgeted / 100,
              spent: values.spent / 100,
              percentage: values.budgeted > 0
                ? Math.round((values.spent / values.budgeted) * 100)
                : 0,
            })
          ),
        },
      },
    };
  }
}

export default BudgetService;