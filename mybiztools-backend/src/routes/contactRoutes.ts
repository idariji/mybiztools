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