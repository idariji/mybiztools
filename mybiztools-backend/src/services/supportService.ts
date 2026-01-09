/**
 * Support Ticket Service
 * Handles customer support tickets with multi-channel responses (Email, WhatsApp, SMS)
 */

import prisma from '../lib/prisma.js';
import { EmailNotificationService } from './emailNotificationService.js';
import { SmsService } from './smsService.js';

// Generate unique ticket number
function generateTicketNumber(): string {
  const prefix = 'TKT';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export class SupportService {
  /**
   * Get all support tickets with filters
   */
  static async getTickets(filters: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    channel?: string;
    assignedTo?: string;
    search?: string;
  }) {
    try {
      const { page = 1, limit = 20, status, priority, channel, assignedTo, search } = filters;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (status) where.status = status;
      if (priority) where.priority = priority;
      if (channel) where.channel = channel;
      if (assignedTo) where.assigned_to = assignedTo;
      if (search) {
        where.OR = [
          { ticket_number: { contains: search } },
          { subject: { contains: search } },
          { customer_name: { contains: search } },
          { customer_email: { contains: search } },
        ];
      }

      const [tickets, total] = await Promise.all([
        prisma.supportTicket.findMany({
          where,
          include: {
            responses: {
              orderBy: { created_at: 'desc' },
              take: 1,
            },
          },
          orderBy: [{ priority: 'asc' }, { created_at: 'desc' }],
          skip,
          take: limit,
        }),
        prisma.supportTicket.count({ where }),
      ]);

      return {
        success: true,
        data: {
          tickets,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      console.error('Get tickets error:', error);
      return { success: false, message: 'Failed to fetch tickets', error: 'DATABASE_ERROR' };
    }
  }

  /**
   * Get ticket by ID with all responses
   */
  static async getTicketById(ticketId: string) {
    try {
      const ticket = await prisma.supportTicket.findUnique({
        where: { id: ticketId },
        include: {
          responses: {
            orderBy: { created_at: 'asc' },
          },
        },
      });

      if (!ticket) {
        return { success: false, message: 'Ticket not found', error: 'NOT_FOUND' };
      }

      return { success: true, data: ticket };
    } catch (error) {
      console.error('Get ticket error:', error);
      return { success: false, message: 'Failed to fetch ticket', error: 'DATABASE_ERROR' };
    }
  }

  /**
   * Create a new support ticket (from customer)
   */
  static async createTicket(data: {
    userId: string;
    subject: string;
    message: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    channel?: string;
    priority?: string;
  }) {
    try {
      const ticketNumber = generateTicketNumber();

      const ticket = await prisma.supportTicket.create({
        data: {
          user_id: data.userId,
          ticket_number: ticketNumber,
          subject: data.subject,
          message: data.message,
          customer_name: data.customerName,
          customer_email: data.customerEmail,
          customer_phone: data.customerPhone,
          channel: data.channel || 'email',
          priority: data.priority || 'medium',
          status: 'open',
        },
      });

      // Send confirmation email to customer
      try {
        await EmailNotificationService.sendCustomEmail({
          to: data.customerEmail,
          subject: `Support Ticket Created - ${ticketNumber}`,
          html: `
            <h2>Your support request has been received</h2>
            <p>Dear ${data.customerName},</p>
            <p>We have received your support request and created ticket <strong>${ticketNumber}</strong>.</p>
            <p><strong>Subject:</strong> ${data.subject}</p>
            <p>Our support team will review your request and respond as soon as possible.</p>
            <p>Thank you for contacting MyBizTools Support.</p>
          `,
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
      }

      return { success: true, data: ticket };
    } catch (error) {
      console.error('Create ticket error:', error);
      return { success: false, message: 'Failed to create ticket', error: 'DATABASE_ERROR' };
    }
  }

  /**
   * Respond to a ticket via specified channel
   */
  static async respondToTicket(data: {
    ticketId: string;
    message: string;
    channel: 'email' | 'whatsapp' | 'sms';
    adminId: string;
    adminName: string;
  }) {
    try {
      const ticket = await prisma.supportTicket.findUnique({
        where: { id: data.ticketId },
      });

      if (!ticket) {
        return { success: false, message: 'Ticket not found', error: 'NOT_FOUND' };
      }

      // Create response record
      const response = await prisma.supportTicketResponse.create({
        data: {
          ticket_id: data.ticketId,
          message: data.message,
          channel: data.channel,
          sender_type: 'admin',
          sender_id: data.adminId,
          sender_name: data.adminName,
          delivered: false,
        },
      });

      // Update ticket status and first response time
      const updateData: any = {
        status: 'in_progress',
        assigned_to: data.adminId,
        assigned_name: data.adminName,
      };

      if (!ticket.first_response_at) {
        updateData.first_response_at = new Date();
      }

      await prisma.supportTicket.update({
        where: { id: data.ticketId },
        data: updateData,
      });

      // Send response via the selected channel
      let delivered = false;
      let deliveryError = null;

      try {
        switch (data.channel) {
          case 'email':
            await EmailNotificationService.sendCustomEmail({
              to: ticket.customer_email,
              subject: `Re: ${ticket.subject} [${ticket.ticket_number}]`,
              html: `
                <h2>Support Response - ${ticket.ticket_number}</h2>
                <p>Dear ${ticket.customer_name},</p>
                <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
                  ${data.message.replace(/\n/g, '<br>')}
                </div>
                <p>If you have any further questions, please reply to this email or contact our support team.</p>
                <p>Best regards,<br>${data.adminName}<br>MyBizTools Support</p>
              `,
            });
            delivered = true;
            break;

          case 'sms':
            if (ticket.customer_phone) {
              await SmsService.sendSms({
                to: ticket.customer_phone,
                message: `MyBizTools Support [${ticket.ticket_number}]: ${data.message.substring(0, 150)}${data.message.length > 150 ? '...' : ''}`,
              });
              delivered = true;
            } else {
              deliveryError = 'No phone number on file';
            }
            break;

          case 'whatsapp':
            if (ticket.customer_phone) {
              // WhatsApp integration via Termii or similar
              await SmsService.sendWhatsApp({
                to: ticket.customer_phone,
                message: `*MyBizTools Support* [${ticket.ticket_number}]\n\n${data.message}\n\n_Reply to continue the conversation._`,
              });
              delivered = true;
            } else {
              deliveryError = 'No phone number on file';
            }
            break;
        }
      } catch (sendError: any) {
        console.error(`Failed to send ${data.channel} response:`, sendError);
        deliveryError = sendError.message;
      }

      // Update response delivery status
      if (delivered) {
        await prisma.supportTicketResponse.update({
          where: { id: response.id },
          data: { delivered: true, delivered_at: new Date() },
        });
      }

      return {
        success: true,
        data: {
          response,
          delivered,
          deliveryError,
        },
      };
    } catch (error) {
      console.error('Respond to ticket error:', error);
      return { success: false, message: 'Failed to respond to ticket', error: 'DATABASE_ERROR' };
    }
  }

  /**
   * Update ticket status
   */
  static async updateTicketStatus(
    ticketId: string,
    status: 'open' | 'in_progress' | 'resolved' | 'closed',
    adminId: string,
    adminName: string
  ) {
    try {
      const updateData: any = { status };

      if (status === 'resolved' || status === 'closed') {
        updateData.resolved_at = new Date();
      }

      const ticket = await prisma.supportTicket.update({
        where: { id: ticketId },
        data: updateData,
      });

      return { success: true, data: ticket };
    } catch (error) {
      console.error('Update ticket status error:', error);
      return { success: false, message: 'Failed to update ticket status', error: 'DATABASE_ERROR' };
    }
  }

  /**
   * Assign ticket to admin
   */
  static async assignTicket(ticketId: string, adminId: string, adminName: string) {
    try {
      const ticket = await prisma.supportTicket.update({
        where: { id: ticketId },
        data: {
          assigned_to: adminId,
          assigned_name: adminName,
          status: 'in_progress',
        },
      });

      return { success: true, data: ticket };
    } catch (error) {
      console.error('Assign ticket error:', error);
      return { success: false, message: 'Failed to assign ticket', error: 'DATABASE_ERROR' };
    }
  }

  /**
   * Get ticket statistics
   */
  static async getTicketStats() {
    try {
      const [total, open, inProgress, resolved, closed] = await Promise.all([
        prisma.supportTicket.count(),
        prisma.supportTicket.count({ where: { status: 'open' } }),
        prisma.supportTicket.count({ where: { status: 'in_progress' } }),
        prisma.supportTicket.count({ where: { status: 'resolved' } }),
        prisma.supportTicket.count({ where: { status: 'closed' } }),
      ]);

      // Count by channel
      const [emailCount, whatsappCount, smsCount] = await Promise.all([
        prisma.supportTicket.count({ where: { channel: 'email' } }),
        prisma.supportTicket.count({ where: { channel: 'whatsapp' } }),
        prisma.supportTicket.count({ where: { channel: 'sms' } }),
      ]);

      // Count by priority
      const [low, medium, high, urgent] = await Promise.all([
        prisma.supportTicket.count({ where: { priority: 'low' } }),
        prisma.supportTicket.count({ where: { priority: 'medium' } }),
        prisma.supportTicket.count({ where: { priority: 'high' } }),
        prisma.supportTicket.count({ where: { priority: 'urgent' } }),
      ]);

      return {
        success: true,
        data: {
          total,
          byStatus: { open, inProgress, resolved, closed },
          byChannel: { email: emailCount, whatsapp: whatsappCount, sms: smsCount },
          byPriority: { low, medium, high, urgent },
        },
      };
    } catch (error) {
      console.error('Get ticket stats error:', error);
      return { success: false, message: 'Failed to get ticket statistics', error: 'DATABASE_ERROR' };
    }
  }
}
