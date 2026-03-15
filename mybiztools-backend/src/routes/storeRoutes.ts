import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma.js';

// Public storefront routes — no authentication required
const router = Router();

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * GET /api/store/:storeId
 * Accepts either a UUID (legacy) or a brand-name slug (e.g. "my-biz-tools").
 * Slug is matched against businessName converted to a slug.
 */
router.get('/:storeId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { storeId } = req.params;

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(storeId);

    let user = null;

    if (isUuid) {
      user = await prisma.user.findUnique({
        where: { id: storeId },
        select: { id: true, firstName: true, lastName: true, businessName: true, phone: true, email: true },
      });
    } else {
      // Match slug against all users' businessName or full name
      const candidates = await (prisma as any).user.findMany({
        select: { id: true, firstName: true, lastName: true, businessName: true, phone: true, email: true },
      });
      user = candidates.find((u: any) => {
        const name = u.businessName || `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();
        return slugify(name) === storeId;
      }) ?? null;
    }

    if (!user) {
      res.status(404).json({ success: false, message: 'Store not found' });
      return;
    }

    // Fetch in-stock products only
    const products = await (prisma as any).product.findMany({
      where: { userId: user.id, quantity: { gt: 0 } },
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
          storeSlug: slugify(storeName),
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
