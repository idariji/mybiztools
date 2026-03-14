import { Request, Response } from 'express';
import { InventoryService } from '../services/inventoryService.js';

type AuthenticatedRequest = Request & { user?: any };

export class InventoryController {
  static async getProducts(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { search, category, status } = req.query;
    const result = await InventoryService.getProducts(req.user!.id, { search: search as string, category: category as string, status: status as string });
    res.status(200).json(result);
  }

  static async createProduct(req: AuthenticatedRequest, res: Response): Promise<void> {
    const result = await InventoryService.createProduct(req.user!.id, req.body);
    res.status(result.success ? 201 : 400).json(result);
  }

  static async updateProduct(req: AuthenticatedRequest, res: Response): Promise<void> {
    const result = await InventoryService.updateProduct(req.user!.id, req.params.productId, req.body);
    res.status(result.success ? 200 : 404).json(result);
  }

  static async deleteProduct(req: AuthenticatedRequest, res: Response): Promise<void> {
    const result = await InventoryService.deleteProduct(req.user!.id, req.params.productId);
    res.status(result.success ? 200 : 404).json(result);
  }

  static async adjustStock(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { type, quantity, reason, notes } = req.body;
    const result = await InventoryService.adjustStock(req.user!.id, req.params.productId, type, parseInt(quantity), reason, notes);
    res.status(result.success ? 200 : 400).json(result);
  }

  static async getStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    const result = await InventoryService.getStats(req.user!.id);
    res.status(200).json(result);
  }
}
