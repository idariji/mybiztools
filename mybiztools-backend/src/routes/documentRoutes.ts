// import { Router, Response } from 'express';
// import multer from 'multer';
// import { DocumentService } from '../services/documentService.js';
// import { authenticateUser, AuthenticatedRequest } from '../middleware/authMiddleware.js';

// const router = Router();
// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
// });

// // All routes require authentication
// router.use(authenticateUser);

// // POST /api/documents/upload
// router.post('/upload', upload.single('file'), async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: 'No file provided',
//         error: 'NO_FILE',
//       });
//     }

//     const { name, category, tags, description } = req.body;

//     const result = await DocumentService.uploadDocument({
//       userId: req.user!.id,
//       name: name || req.file.originalname,
//       originalName: req.file.originalname,
//       mimeType: req.file.mimetype,
//       size: req.file.size,
//       buffer: req.file.buffer,
//       category,
//       tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim())) : [],
//       description,
//     });

//     if (!result.success) {
//       return res.status(400).json(result);
//     }

//     return res.status(201).json(result);
//   } catch (error) {
//     console.error('Upload document route error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: 'SERVER_ERROR',
//     });
//   }
// });

// // GET /api/documents
// router.get('/', async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const { page, limit, category, search } = req.query;

//     const result = await DocumentService.getDocuments(req.user!.id, {
//       page: page ? parseInt(page as string) : 1,
//       limit: limit ? parseInt(limit as string) : 20,
//       category: category as string,
//       search: search as string,
//     });

//     if (!result.success) {
//       return res.status(400).json(result);
//     }

//     return res.status(200).json(result);
//   } catch (error) {
//     console.error('Get documents route error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: 'SERVER_ERROR',
//     });
//   }
// });

// // GET /api/documents/usage
// router.get('/usage', async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const result = await DocumentService.getStorageUsage(req.user!.id);

//     if (!result.success) {
//       return res.status(400).json(result);
//     }

//     return res.status(200).json(result);
//   } catch (error) {
//     console.error('Get storage usage route error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: 'SERVER_ERROR',
//     });
//   }
// });

// // GET /api/documents/:documentId
// router.get('/:documentId', async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const { documentId } = req.params;

//     const result = await DocumentService.getDocumentById(req.user!.id, documentId);

//     if (!result.success) {
//       return res.status(404).json(result);
//     }

//     return res.status(200).json(result);
//   } catch (error) {
//     console.error('Get document route error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: 'SERVER_ERROR',
//     });
//   }
// });

// // GET /api/documents/:documentId/download
// router.get('/:documentId/download', async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const { documentId } = req.params;

//     const result = await DocumentService.downloadDocument(req.user!.id, documentId);

//     if (!result.success) {
//       return res.status(404).json(result);
//     }

//     res.setHeader('Content-Type', result.data!.mimeType);
//     res.setHeader('Content-Disposition', `attachment; filename="${result.data!.filename}"`);
//     return res.send(result.data!.buffer);
//   } catch (error) {
//     console.error('Download document route error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: 'SERVER_ERROR',
//     });
//   }
// });

// // PUT /api/documents/:documentId
// router.put('/:documentId', async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const { documentId } = req.params;
//     const { name, category, tags, description } = req.body;

//     const result = await DocumentService.updateDocument(req.user!.id, documentId, {
//       name,
//       category,
//       tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim())) : undefined,
//       description,
//     });

//     if (!result.success) {
//       return res.status(400).json(result);
//     }

//     return res.status(200).json(result);
//   } catch (error) {
//     console.error('Update document route error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: 'SERVER_ERROR',
//     });
//   }
// });

// // DELETE /api/documents/:documentId
// router.delete('/:documentId', async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const { documentId } = req.params;

//     const result = await DocumentService.deleteDocument(req.user!.id, documentId);

//     if (!result.success) {
//       return res.status(400).json(result);
//     }

//     return res.status(200).json(result);
//   } catch (error) {
//     console.error('Delete document route error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: 'SERVER_ERROR',
//     });
//   }
// });

// export default router;


import { Router } from 'express';
import multer from 'multer';
import { DocumentController } from '../controllers/documentController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
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