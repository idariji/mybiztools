import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma.js';

// Public storefront routes — no authentication required
const router = Router();

/**
 * GET /api/store/:userId
 * Public endpoint that returns a user's store info + in-stock products.
 * Used by the public storefront page (/store/:userId on the frontend).
 */
router.get('/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    // Fetch user public info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        businessName: true,
        phone: true,
        email: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'Store not found' });
      return;
    }

    // Fetch in-stock products only
    const products = await (prisma as any).product.findMany({
      where: { userId, quantity: { gt: 0 } },
      select: {
        id: true,
        name: true,
        category: true,
        sellingPrice: true,
        quantity: true,
        description: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const storeName = user.businessName
      || `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
      || 'My Store';

    res.json({
      success: true,
      data: {
        store: {
          userId: user.id,
          storeName,
          phone: user.phone,
          email: user.email,
        },
        products,
      },
    });
  } catch (err) {
    console.error('[StoreRoutes.getStore]', err);
    res.status(500).json({ success: false, message: 'Failed to load store' });
  }
});

export default router;
