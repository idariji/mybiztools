import { Router, Response } from 'express';
import { ContactService } from '../services/contactService.js';
import { authenticateUser, AuthenticatedRequest } from '../middleware/authMiddleware.js';

const router = Router();

// All routes require authentication
router.use(authenticateUser);

// POST /api/contacts
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      jobTitle,
      type,
      address,
      city,
      state,
      country,
      postalCode,
      taxId,
      website,
      notes,
      tags,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required',
        error: 'MISSING_NAME',
      });
    }

    const result = await ContactService.createContact({
      userId: req.user!.id,
      name,
      email,
      phone,
      company,
      jobTitle,
      type,
      address,
      city,
      state,
      country,
      postalCode,
      taxId,
      website,
      notes,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim())) : undefined,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error('Create contact route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

// GET /api/contacts
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page, limit, type, search, isActive } = req.query;

    const result = await ContactService.getContacts(req.user!.id, {
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
      type: type as string,
      search: search as string,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Get contacts route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

// GET /api/contacts/stats
router.get('/stats', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await ContactService.getContactStats(req.user!.id);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Get contact stats route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

// GET /api/contacts/:contactId
router.get('/:contactId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { contactId } = req.params;

    const result = await ContactService.getContactById(req.user!.id, contactId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Get contact route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

// PUT /api/contacts/:contactId
router.put('/:contactId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { contactId } = req.params;
    const {
      name,
      email,
      phone,
      company,
      jobTitle,
      type,
      address,
      city,
      state,
      country,
      postalCode,
      taxId,
      website,
      notes,
      tags,
      isActive,
    } = req.body;

    const result = await ContactService.updateContact(req.user!.id, contactId, {
      name,
      email,
      phone,
      company,
      jobTitle,
      type,
      address,
      city,
      state,
      country,
      postalCode,
      taxId,
      website,
      notes,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim())) : undefined,
      isActive,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Update contact route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

// POST /api/contacts/:contactId/contacted
router.post('/:contactId/contacted', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { contactId } = req.params;

    const result = await ContactService.markContacted(req.user!.id, contactId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Mark contacted route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

// DELETE /api/contacts/:contactId
router.delete('/:contactId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { contactId } = req.params;

    const result = await ContactService.deleteContact(req.user!.id, contactId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Delete contact route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

export default router;
