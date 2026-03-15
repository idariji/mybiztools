import { Router } from 'express';
import { InventoryController } from '../controllers/inventoryController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import {
  createProductSchema,
  updateProductSchema,
  adjustStockSchema,
} from '../validators/inventoryValidator.js';

const router = Router();
router.use(authenticateUser);

router.get('/stats', InventoryController.getStats);
router.get('/', InventoryController.getProducts);
router.post('/', validate(createProductSchema), InventoryController.createProduct);
router.put('/:productId', validate(updateProductSchema), InventoryController.updateProduct);
router.delete('/:productId', InventoryController.deleteProduct);
router.post('/:productId/adjust', validate(adjustStockSchema), InventoryController.adjustStock);

export default router;
