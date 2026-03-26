import { Request, Response } from 'express';
import { InventoryService } from '../services/inventoryService.js';

type AuthenticatedRequest = Request & { user?: any };

export class InventoryController {
  static async getProducts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { search, category, status } = req.query;
      const result = await InventoryService.getProducts(req.user!.id, { search: search as string, category: category as string, status: status as string });
      res.status(200).json(result);
    } catch (err) {
      console.error('[InventoryController.getProducts]', err);
      res.status(500).json({ success: false, message: 'Failed to load products' });
    }
  }

  static async createProduct(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await InventoryService.createProduct(req.user!.id, req.body);
      res.status(result.success ? 201 : 400).json(result);
    } catch (err) {
      console.error('[InventoryController.createProduct]', err);
      res.status(500).json({ success: false, message: 'Failed to create product' });
    }
  }

  static async updateProduct(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await InventoryService.updateProduct(req.user!.id, req.params.productId, req.body);
      res.status(result.success ? 200 : 404).json(result);
    } catch (err) {
      console.error('[InventoryController.updateProduct]', err);
      res.status(500).json({ success: false, message: 'Failed to update product' });
    }
  }

  static async deleteProduct(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await InventoryService.deleteProduct(req.user!.id, req.params.productId);
      res.status(result.success ? 200 : 404).json(result);
    } catch (err) {
      console.error('[InventoryController.deleteProduct]', err);
      res.status(500).json({ success: false, message: 'Failed to delete product' });
    }
  }

  static async adjustStock(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { type, quantity, reason, notes } = req.body;
      const result = await InventoryService.adjustStock(req.user!.id, req.params.productId, type, Number(quantity), reason, notes);
      res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('[InventoryController.adjustStock]', err);
      res.status(500).json({ success: false, message: 'Failed to adjust stock' });
    }
  }

  static async getStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await InventoryService.getStats(req.user!.id);
      res.status(200).json(result);
    } catch (err) {
      console.error('[InventoryController.getStats]', err);
      res.status(500).json({ success: false, message: 'Failed to load stats' });
    }
  }
}
