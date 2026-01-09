import prisma from '../lib/prisma.js';

export interface CreateContactInput {
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  type?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  taxId?: string;
  website?: string;
  notes?: string;
  tags?: string[];
}

export interface UpdateContactInput {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  type?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  taxId?: string;
  website?: string;
  notes?: string;
  tags?: string[];
  isActive?: boolean;
}

export class ContactService {
  /**
   * Create a new contact
   */
  static async createContact(input: CreateContactInput) {
    try {
      const validTypes = ['customer', 'supplier', 'partner', 'lead', 'other'];
      const type = input.type || 'customer';

      if (!validTypes.includes(type)) {
        return {
          success: false,
          message: 'Invalid contact type',
          error: 'INVALID_TYPE',
        };
      }

      const contact = await prisma.contact.create({
        data: {
          user_id: input.userId,
          name: input.name,
          email: input.email,
          phone: input.phone,
          company: input.company,
          job_title: input.jobTitle,
          type,
          address: input.address,
          city: input.city,
          state: input.state,
          country: input.country || 'Nigeria',
          postal_code: input.postalCode,
          tax_id: input.taxId,
          website: input.website,
          notes: input.notes,
          tags: input.tags || [],
        },
      });

      return {
        success: true,
        message: 'Contact created successfully',
        data: { contact },
      };
    } catch (error) {
      console.error('Create contact error:', error);
      return {
        success: false,
        message: 'Failed to create contact',
        error: 'CREATE_CONTACT_FAILED',
      };
    }
  }

  /**
   * Get user's contacts
   */
  static async getContacts(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      type?: string;
      search?: string;
      isActive?: boolean;
    } = {}
  ) {
    try {
      const { page = 1, limit = 20, type, search, isActive } = options;
      const skip = (page - 1) * limit;

      const where: any = { user_id: userId };
      if (type) where.type = type;
      if (typeof isActive === 'boolean') where.is_active = isActive;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { company: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [contacts, total] = await Promise.all([
        prisma.contact.findMany({
          where,
          orderBy: { name: 'asc' },
          skip,
          take: limit,
          include: {
            _count: {
              select: { invoices: true },
            },
          },
        }),
        prisma.contact.count({ where }),
      ]);

      return {
        success: true,
        data: {
          contacts: contacts.map(c => ({
            ...c,
            invoice_count: c._count.invoices,
          })),
          pagination: {
            current: page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      console.error('Get contacts error:', error);
      return {
        success: false,
        message: 'Failed to retrieve contacts',
        error: 'GET_CONTACTS_FAILED',
      };
    }
  }

  /**
   * Get contact by ID
   */
  static async getContactById(userId: string, contactId: string) {
    try {
      const contact = await prisma.contact.findFirst({
        where: {
          id: contactId,
          user_id: userId,
        },
        include: {
          invoices: {
            orderBy: { created_at: 'desc' },
            take: 5,
            select: {
              id: true,
              invoice_number: true,
              total: true,
              status: true,
              due_date: true,
            },
          },
        },
      });

      if (!contact) {
        return {
          success: false,
          message: 'Contact not found',
          error: 'CONTACT_NOT_FOUND',
        };
      }

      return {
        success: true,
        data: {
          contact: {
            ...contact,
            invoices: contact.invoices.map(i => ({
              ...i,
              total: Number(i.total) / 100,
            })),
          },
        },
      };
    } catch (error) {
      console.error('Get contact error:', error);
      return {
        success: false,
        message: 'Failed to retrieve contact',
        error: 'GET_CONTACT_FAILED',
      };
    }
  }

  /**
   * Update contact
   */
  static async updateContact(userId: string, contactId: string, input: UpdateContactInput) {
    try {
      const contact = await prisma.contact.findFirst({
        where: {
          id: contactId,
          user_id: userId,
        },
      });

      if (!contact) {
        return {
          success: false,
          message: 'Contact not found',
          error: 'CONTACT_NOT_FOUND',
        };
      }

      const updateData: any = {};
      if (input.name) updateData.name = input.name;
      if (input.email !== undefined) updateData.email = input.email;
      if (input.phone !== undefined) updateData.phone = input.phone;
      if (input.company !== undefined) updateData.company = input.company;
      if (input.jobTitle !== undefined) updateData.job_title = input.jobTitle;
      if (input.type) updateData.type = input.type;
      if (input.address !== undefined) updateData.address = input.address;
      if (input.city !== undefined) updateData.city = input.city;
      if (input.state !== undefined) updateData.state = input.state;
      if (input.country !== undefined) updateData.country = input.country;
      if (input.postalCode !== undefined) updateData.postal_code = input.postalCode;
      if (input.taxId !== undefined) updateData.tax_id = input.taxId;
      if (input.website !== undefined) updateData.website = input.website;
      if (input.notes !== undefined) updateData.notes = input.notes;
      if (input.tags) updateData.tags = input.tags;
      if (typeof input.isActive === 'boolean') updateData.is_active = input.isActive;

      const updatedContact = await prisma.contact.update({
        where: { id: contactId },
        data: updateData,
      });

      return {
        success: true,
        message: 'Contact updated successfully',
        data: { contact: updatedContact },
      };
    } catch (error) {
      console.error('Update contact error:', error);
      return {
        success: false,
        message: 'Failed to update contact',
        error: 'UPDATE_CONTACT_FAILED',
      };
    }
  }

  /**
   * Delete contact
   */
  static async deleteContact(userId: string, contactId: string) {
    try {
      const contact = await prisma.contact.findFirst({
        where: {
          id: contactId,
          user_id: userId,
        },
      });

      if (!contact) {
        return {
          success: false,
          message: 'Contact not found',
          error: 'CONTACT_NOT_FOUND',
        };
      }

      await prisma.contact.delete({
        where: { id: contactId },
      });

      return {
        success: true,
        message: 'Contact deleted successfully',
      };
    } catch (error) {
      console.error('Delete contact error:', error);
      return {
        success: false,
        message: 'Failed to delete contact',
        error: 'DELETE_CONTACT_FAILED',
      };
    }
  }

  /**
   * Mark contact as contacted
   */
  static async markContacted(userId: string, contactId: string) {
    try {
      const contact = await prisma.contact.findFirst({
        where: {
          id: contactId,
          user_id: userId,
        },
      });

      if (!contact) {
        return {
          success: false,
          message: 'Contact not found',
          error: 'CONTACT_NOT_FOUND',
        };
      }

      const updatedContact = await prisma.contact.update({
        where: { id: contactId },
        data: { last_contacted_at: new Date() },
      });

      return {
        success: true,
        message: 'Contact marked as contacted',
        data: { contact: updatedContact },
      };
    } catch (error) {
      console.error('Mark contacted error:', error);
      return {
        success: false,
        message: 'Failed to mark contact',
        error: 'MARK_CONTACTED_FAILED',
      };
    }
  }

  /**
   * Get contact statistics
   */
  static async getContactStats(userId: string) {
    try {
      const [totalCount, byType, recentContacts] = await Promise.all([
        prisma.contact.count({ where: { user_id: userId } }),
        prisma.contact.groupBy({
          by: ['type'],
          where: { user_id: userId },
          _count: true,
        }),
        prisma.contact.findMany({
          where: { user_id: userId },
          orderBy: { created_at: 'desc' },
          take: 5,
          select: {
            id: true,
            name: true,
            type: true,
            created_at: true,
          },
        }),
      ]);

      return {
        success: true,
        data: {
          stats: {
            total: totalCount,
            by_type: byType.map(t => ({
              type: t.type,
              count: t._count,
            })),
            recent_contacts: recentContacts,
          },
        },
      };
    } catch (error) {
      console.error('Get contact stats error:', error);
      return {
        success: false,
        message: 'Failed to get contact stats',
        error: 'GET_STATS_FAILED',
      };
    }
  }
}

export default ContactService;
