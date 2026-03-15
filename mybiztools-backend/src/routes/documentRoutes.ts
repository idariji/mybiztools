import { Router } from 'express';
import multer from 'multer';
import { DocumentController } from '../controllers/documentController.js';
import { authenticateUser, requirePlan } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { uploadDocumentSchema, updateDocumentSchema } from '../validators/documentValidator.js';

// ============================================================================
// DOCUMENT ROUTES
// All routes require authentication
// ============================================================================

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

router.use(authenticateUser);

/**
 * @swagger
 * tags:
 *   name: Documents
 *   description: Document upload and management
 */

/**
 * @swagger
 * /api/documents/upload:
 *   post:
 *     summary: Upload a document
 *     tags: [Documents]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [invoice, receipt, contract, report, other]
 *               description:
 *                 type: string
 *               tags:
 *                 type: string
 *     responses:
 *       201:
 *         description: Document uploaded successfully
 *       400:
 *         description: File missing or invalid type
 */
router.post('/upload', upload.single('file'), validate(uploadDocumentSchema), DocumentController.uploadDocument);

/**
 * @swagger
 * /api/documents:
 *   get:
 *     summary: Get all documents for current user
 *     tags: [Documents]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Documents retrieved successfully
 */
router.get('/', DocumentController.getDocuments);

// NOTE: /usage must be before /:documentId
/**
 * @swagger
 * /api/documents/usage:
 *   get:
 *     summary: Get storage usage
 *     tags: [Documents]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Storage usage retrieved successfully
 */
router.get('/usage', DocumentController.getStorageUsage);

/**
 * @swagger
 * /api/documents/{documentId}:
 *   get:
 *     summary: Get document by ID
 *     tags: [Documents]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Document retrieved successfully
 *       404:
 *         description: Document not found
 */
router.get('/:documentId', DocumentController.getDocumentById);

/**
 * @swagger
 * /api/documents/{documentId}/download:
 *   get:
 *     summary: Download a document
 *     tags: [Documents]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: File download
 *       404:
 *         description: Document not found
 */
router.get('/:documentId/download', DocumentController.downloadDocument);

/**
 * @swagger
 * /api/documents/{documentId}:
 *   put:
 *     summary: Update document metadata
 *     tags: [Documents]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Document updated successfully
 */
router.put('/:documentId', validate(updateDocumentSchema), DocumentController.updateDocument);

/**
 * @swagger
 * /api/documents/{documentId}:
 *   delete:
 *     summary: Delete a document
 *     tags: [Documents]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Document deleted successfully
 */
router.delete('/:documentId', DocumentController.deleteDocument);

export default router;