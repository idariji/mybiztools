import { Router } from 'express';
import { OrderController } from '../controllers/orderController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = Router();

// Public — customer places an order (no token required)
router.post('/', OrderController.createOrder);

// Authenticated — owner manages their orders
router.get('/', authenticateUser, OrderController.getOrders);
router.put('/:orderId/confirm', authenticateUser, OrderController.confirmOrder);
router.put('/:orderId/cancel', authenticateUser, OrderController.cancelOrder);

export default router;
