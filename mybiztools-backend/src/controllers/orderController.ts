import { Request, Response } from 'express';
import { OrderService } from '../services/orderService.js';

export class OrderController {
  /** POST /api/orders — public, placed by customer */
  static async createOrder(req: Request, res: Response): Promise<void> {
    const result = await OrderService.createOrder(req.body);
    res.status(result.success ? 201 : 400).json(result);
  }

  /** GET /api/orders — owner lists their orders */
  static async getOrders(req: Request, res: Response): Promise<void> {
    const status = req.query.status as string | undefined;
    const result = await OrderService.getOrders(req.user!.id, status);
    res.status(result.success ? 200 : 400).json(result);
  }

  /** PUT /api/orders/:orderId/confirm — owner confirms, stock reduces */
  static async confirmOrder(req: Request, res: Response): Promise<void> {
    const result = await OrderService.confirmOrder(req.user!.id, req.params.orderId);
    res.status(result.success ? 200 : 400).json(result);
  }

  /** PUT /api/orders/:orderId/cancel — owner cancels, no stock change */
  static async cancelOrder(req: Request, res: Response): Promise<void> {
    const result = await OrderService.cancelOrder(req.user!.id, req.params.orderId);
    res.status(result.success ? 200 : 400).json(result);
  }
}
