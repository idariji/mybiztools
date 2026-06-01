import prisma from '../lib/prisma.js';

interface OrderItemInput {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

interface CreateOrderInput {
  userId: string;
  items: OrderItemInput[];
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  notes?: string;
}

export class OrderService {
  // Called by the public storefront — no auth required
  static async createOrder(input: CreateOrderInput) {
    const { userId, items, customerName, customerPhone, customerEmail, notes } = input;

    if (!items || items.length === 0) {
      return { success: false, message: 'Order must contain at least one item', error: 'EMPTY_ORDER' };
    }

    // Verify the store owner exists
    const owner = await (prisma as any).user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!owner) return { success: false, message: 'Store not found', error: 'STORE_NOT_FOUND' };

    // Validate each product belongs to this owner and has enough stock
    for (const item of items) {
      const product = await (prisma as any).product.findFirst({
        where: { id: item.productId, userId },
        select: { id: true, quantity: true, name: true },
      });
      if (!product) {
        return { success: false, message: `Product "${item.productName}" not found`, error: 'PRODUCT_NOT_FOUND' };
      }
      if (product.quantity < item.quantity) {
        return {
          success: false,
          message: `Not enough stock for "${item.productName}". Available: ${product.quantity}`,
          error: 'INSUFFICIENT_STOCK',
        };
      }
    }

    const totalAmount = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

    const order = await (prisma as any).order.create({
      data: {
        userId,
        totalAmount,
        customerName,
        customerPhone,
        customerEmail,
        notes,
        items: {
          create: items.map(i => ({
            productId: i.productId,
            productName: i.productName,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            lineTotal: i.unitPrice * i.quantity,
          })),
        },
      },
      include: { items: true },
    });

    return { success: true, message: 'Order placed', data: { order } };
  }

  // Owner fetches their orders
  static async getOrders(userId: string, status?: string) {
    const where: any = { userId };
    if (status && status !== 'all') where.status = status;

    const orders = await (prisma as any).order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, message: 'Orders retrieved', data: { orders } };
  }

  // Owner confirms an order → stock is reduced for each item
  static async confirmOrder(userId: string, orderId: string) {
    const order = await (prisma as any).order.findFirst({
      where: { id: orderId, userId },
      include: { items: true },
    });

    if (!order) return { success: false, message: 'Order not found', error: 'NOT_FOUND' };
    if (order.status !== 'pending') {
      return { success: false, message: `Order is already ${order.status}`, error: 'INVALID_STATUS' };
    }

    // Check stock is still sufficient for every item before committing
    for (const item of order.items) {
      const product = await (prisma as any).product.findFirst({
        where: { id: item.productId, userId },
        select: { id: true, quantity: true, name: true },
      });
      if (!product || product.quantity < item.quantity) {
        return {
          success: false,
          message: `Insufficient stock for "${item.productName}". Available: ${product?.quantity ?? 0}`,
          error: 'INSUFFICIENT_STOCK',
        };
      }
    }

    // Reduce stock + create StockMovement records + mark order confirmed — all in one transaction
    await (prisma as any).$transaction([
      // Mark order confirmed
      (prisma as any).order.update({
        where: { id: orderId },
        data: { status: 'confirmed' },
      }),
      // Reduce each product's stock and record the movement
      ...order.items.flatMap((item: any) => [
        (prisma as any).product.update({
          where: { id: item.productId },
          data: { quantity: { decrement: item.quantity } },
        }),
        (prisma as any).stockMovement.create({
          data: {
            productId: item.productId,
            userId,
            type: 'out',
            quantity: item.quantity,
            reason: 'Sale',
            notes: `Order #${orderId.slice(0, 8)}`,
          },
        }),
      ]),
    ]);

    const updated = await (prisma as any).order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    return { success: true, message: 'Order confirmed and stock updated', data: { order: updated } };
  }

  // Owner cancels an order — no stock change
  static async cancelOrder(userId: string, orderId: string) {
    const order = await (prisma as any).order.findFirst({ where: { id: orderId, userId } });
    if (!order) return { success: false, message: 'Order not found', error: 'NOT_FOUND' };
    if (order.status === 'cancelled') {
      return { success: false, message: 'Order is already cancelled', error: 'INVALID_STATUS' };
    }

    const updated = await (prisma as any).order.update({
      where: { id: orderId },
      data: { status: 'cancelled' },
      include: { items: true },
    });

    return { success: true, message: 'Order cancelled', data: { order: updated } };
  }
}
