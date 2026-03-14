import prisma from '../lib/prisma.js';
import type { ServiceResponse } from '../types/index.js';

export class InventoryService {

  static async getProducts(userId: string, filters: { search?: string; category?: string; status?: string }): Promise<ServiceResponse> {
    const where: any = { userId };
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { sku: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    if (filters.category) where.category = filters.category;

    const products = await (prisma as any).product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { stockMovements: { orderBy: { createdAt: 'desc' }, take: 5 } },
    });

    if (filters.status === 'low') return { success: true, message: 'ok', data: products.filter((p: any) => p.quantity > 0 && p.quantity <= p.lowStockThreshold) };
    if (filters.status === 'out') return { success: true, message: 'ok', data: products.filter((p: any) => p.quantity === 0) };
    if (filters.status === 'in') return { success: true, message: 'ok', data: products.filter((p: any) => p.quantity > p.lowStockThreshold) };

    return { success: true, message: 'Products retrieved', data: products };
  }

  static async createProduct(userId: string, data: any): Promise<ServiceResponse> {
    const sku = data.sku || `SKU-${Date.now()}`;
    const existing = await (prisma as any).product.findUnique({ where: { userId_sku: { userId, sku } } });
    if (existing) return { success: false, message: 'A product with this SKU already exists', error: 'DUPLICATE_SKU' };

    const product = await (prisma as any).product.create({
      data: { userId, name: data.name, sku, category: data.category || 'Other', quantity: data.quantity ?? 0, unitCost: data.unitCost ?? 0, sellingPrice: data.sellingPrice ?? 0, lowStockThreshold: data.lowStockThreshold ?? 5, supplier: data.supplier, description: data.description },
    });
    return { success: true, message: 'Product created', data: product };
  }

  static async updateProduct(userId: string, productId: string, data: any): Promise<ServiceResponse> {
    const product = await (prisma as any).product.findFirst({ where: { id: productId, userId } });
    if (!product) return { success: false, message: 'Product not found', error: 'NOT_FOUND' };

    const updated = await (prisma as any).product.update({
      where: { id: productId },
      data: { name: data.name, category: data.category, unitCost: data.unitCost, sellingPrice: data.sellingPrice, lowStockThreshold: data.lowStockThreshold, supplier: data.supplier, description: data.description },
    });
    return { success: true, message: 'Product updated', data: updated };
  }

  static async deleteProduct(userId: string, productId: string): Promise<ServiceResponse> {
    const product = await (prisma as any).product.findFirst({ where: { id: productId, userId } });
    if (!product) return { success: false, message: 'Product not found', error: 'NOT_FOUND' };

    await (prisma as any).product.delete({ where: { id: productId } });
    return { success: true, message: 'Product deleted', data: null };
  }

  static async adjustStock(userId: string, productId: string, type: 'in' | 'out', quantity: number, reason: string, notes?: string): Promise<ServiceResponse> {
    const product = await (prisma as any).product.findFirst({ where: { id: productId, userId } });
    if (!product) return { success: false, message: 'Product not found', error: 'NOT_FOUND' };

    const newQty = type === 'in' ? product.quantity + quantity : product.quantity - quantity;
    if (newQty < 0) return { success: false, message: 'Insufficient stock', error: 'INSUFFICIENT_STOCK' };

    const [updated] = await (prisma as any).$transaction([
      (prisma as any).product.update({ where: { id: productId }, data: { quantity: newQty } }),
      (prisma as any).stockMovement.create({ data: { productId, userId, type, quantity, reason, notes } }),
    ]);

    return { success: true, message: 'Stock adjusted', data: { product: updated, newQuantity: newQty } };
  }

  static async getStats(userId: string): Promise<ServiceResponse> {
    const products = await (prisma as any).product.findMany({ where: { userId } });
    const totalProducts = products.length;
    const outOfStock = products.filter((p: any) => p.quantity === 0).length;
    const lowStock = products.filter((p: any) => p.quantity > 0 && p.quantity <= p.lowStockThreshold).length;
    const totalValue = products.reduce((sum: number, p: any) => sum + p.quantity * p.unitCost, 0);

    return { success: true, message: 'Stats retrieved', data: { totalProducts, outOfStock, lowStock, totalValue } };
  }
}
