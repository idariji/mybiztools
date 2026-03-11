// import { Router, Response } from 'express';
// import { ContactService } from '../services/contactService.js';
// import { authenticateUser, AuthenticatedRequest } from '../middleware/authMiddleware.js';

// const router = Router();

// // All routes require authentication
// router.use(authenticateUser);

// // POST /api/contacts
// router.post('/', async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const {
//       name,
//       email,
//       phone,
//       company,
//       jobTitle,
//       type,
//       address,
//       city,
//       state,
//       country,
//       postalCode,
//       taxId,
//       website,
//       notes,
//       tags,
//     } = req.body;

//     if (!name) {
//       return res.status(400).json({
//         success: false,
//         message: 'Name is required',
//         error: 'MISSING_NAME',
//       });
//     }

//     const result = await ContactService.createContact({
//       userId: req.user!.id,
//       name,
//       email,
//       phone,
//       company,
//       jobTitle,
//       type,
//       address,
//       city,
//       state,
//       country,
//       postalCode,
//       taxId,
//       website,
//       notes,
//       tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim())) : undefined,
//     });

//     if (!result.success) {
//       return res.status(400).json(result);
//     }

//     return res.status(201).json(result);
//   } catch (error) {
//     console.error('Create contact route error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: 'SERVER_ERROR',
//     });
//   }
// });

// // GET /api/contacts
// router.get('/', async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const { page, limit, type, search, isActive } = req.query;

//     const result = await ContactService.getContacts(req.user!.id, {
//       page: page ? parseInt(page as string) : 1,
//       limit: limit ? parseInt(limit as string) : 20,
//       type: type as string,
//       search: search as string,
//       isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
//     });

//     if (!result.success) {
//       return res.status(400).json(result);
//     }

//     return res.status(200).json(result);
//   } catch (error) {
//     console.error('Get contacts route error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: 'SERVER_ERROR',
//     });
//   }
// });

// // GET /api/contacts/stats
// router.get('/stats', async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const result = await ContactService.getContactStats(req.user!.id);

//     if (!result.success) {
//       return res.status(400).json(result);
//     }

//     return res.status(200).json(result);
//   } catch (error) {
//     console.error('Get contact stats route error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: 'SERVER_ERROR',
//     });
//   }
// });

// // GET /api/contacts/:contactId
// router.get('/:contactId', async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const { contactId } = req.params;

//     const result = await ContactService.getContactById(req.user!.id, contactId);

//     if (!result.success) {
//       return res.status(404).json(result);
//     }

//     return res.status(200).json(result);
//   } catch (error) {
//     console.error('Get contact route error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: 'SERVER_ERROR',
//     });
//   }
// });

// // PUT /api/contacts/:contactId
// router.put('/:contactId', async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const { contactId } = req.params;
//     const {
//       name,
//       email,
//       phone,
//       company,
//       jobTitle,
//       type,
//       address,
//       city,
//       state,
//       country,
//       postalCode,
//       taxId,
//       website,
//       notes,
//       tags,
//       isActive,
//     } = req.body;

//     const result = await ContactService.updateContact(req.user!.id, contactId, {
//       name,
//       email,
//       phone,
//       company,
//       jobTitle,
//       type,
//       address,
//       city,
//       state,
//       country,
//       postalCode,
//       taxId,
//       website,
//       notes,
//       tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim())) : undefined,
//       isActive,
//     });

//     if (!result.success) {
//       return res.status(400).json(result);
//     }

//     return res.status(200).json(result);
//   } catch (error) {
//     console.error('Update contact route error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: 'SERVER_ERROR',
//     });
//   }
// });

// // POST /api/contacts/:contactId/contacted
// router.post('/:contactId/contacted', async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const { contactId } = req.params;

//     const result = await ContactService.markContacted(req.user!.id, contactId);

//     if (!result.success) {
//       return res.status(400).json(result);
//     }

//     return res.status(200).json(result);
//   } catch (error) {
//     console.error('Mark contacted route error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: 'SERVER_ERROR',
//     });
//   }
// });

// // DELETE /api/contacts/:contactId
// router.delete('/:contactId', async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const { contactId } = req.params;

//     const result = await ContactService.deleteContact(req.user!.id, contactId);

//     if (!result.success) {
//       return res.status(400).json(result);
//     }

//     return res.status(200).json(result);
//   } catch (error) {
//     console.error('Delete contact route error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: 'SERVER_ERROR',
//     });
//   }
// });

// export default router;

import { Router } from 'express';
import { ContactController } from '../controllers/contactController.js';
import { authenticateUser, requirePlan } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { createContactSchema, updateContactSchema } from '../validators/contactValidator.js';

// ============================================================================
// CONTACT ROUTES
// All routes require authentication
// ============================================================================

const router = Router();

router.use(authenticateUser);

/**
 * @swagger
 * tags:
 *   name: Contacts
 *   description: Customer, supplier and lead management
 */

/**
 * @swagger
 * /api/contacts:
 *   post:
 *     summary: Create a new contact
 *     tags: [Contacts]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               company:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [customer, supplier, partner, lead, other]
 *     responses:
 *       201:
 *         description: Contact created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', validate(createContactSchema), ContactController.createContact);

/**
 * @swagger
 * /api/contacts:
 *   get:
 *     summary: Get all contacts
 *     tags: [Contacts]
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
 *         name: type
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: isActive
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Contacts retrieved successfully
 */
router.get('/', ContactController.getContacts);

// NOTE: /stats must be before /:contactId
/**
 * @swagger
 * /api/contacts/stats:
 *   get:
 *     summary: Get contact statistics
 *     tags: [Contacts]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Stats retrieved successfully
 */
router.get('/stats', ContactController.getContactStats);

/**
 * @swagger
 * /api/contacts/{contactId}:
 *   get:
 *     summary: Get contact by ID
 *     tags: [Contacts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Contact retrieved successfully
 *       404:
 *         description: Contact not found
 */
router.get('/:contactId', ContactController.getContactById);

/**
 * @swagger
 * /api/contacts/{contactId}:
 *   put:
 *     summary: Update a contact
 *     tags: [Contacts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Contact updated successfully
 */
router.put('/:contactId', validate(updateContactSchema), ContactController.updateContact);

/**
 * @swagger
 * /api/contacts/{contactId}/contacted:
 *   post:
 *     summary: Mark contact as contacted
 *     tags: [Contacts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Contact marked successfully
 */
router.post('/:contactId/contacted', ContactController.markContacted);

/**
 * @swagger
 * /api/contacts/{contactId}:
 *   delete:
 *     summary: Delete a contact
 *     tags: [Contacts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Contact deleted successfully
 */
router.delete('/:contactId', ContactController.deleteContact);

export default router;