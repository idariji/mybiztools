import { Router } from 'express';
import { InventoryController } from '../controllers/inventoryController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = Router();
router.use(authenticateUser);

router.get('/stats', InventoryController.getStats);
router.get('/', InventoryController.getProducts);
router.post('/', InventoryController.createProduct);
router.put('/:productId', InventoryController.updateProduct);
router.delete('/:productId', InventoryController.deleteProduct);
router.post('/:productId/adjust', InventoryController.adjustStock);

export default router;
