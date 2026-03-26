// /**
//  * Document Generator Service
//  * Handles Invoice, Quotation, Receipt, and Payslip CRUD operations
//  */

// import prisma from '../lib/prisma.js';
// import { v4 as uuidv4 } from 'uuid';

// // ============================================================================
// // INVOICE SERVICE
// // ============================================================================

// export class InvoiceService {
//   static async create(userId: string, data: any) {
//     try {
//       const invoiceNumber = data.invoiceNumber || `INV-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

//       const invoice = await prisma.invoice.create({
//         data: {
//           user_id: userId,
//           contact_id: data.contactId,
//           invoice_number: invoiceNumber,
//           subtotal: BigInt(Math.round((data.subtotal || 0) * 100)),
//           tax_amount: BigInt(Math.round((data.taxAmount || 0) * 100)),
//           discount_amount: BigInt(Math.round((data.discountAmount || 0) * 100)),
//           total: BigInt(Math.round((data.total || 0) * 100)),
//           currency: data.currency || 'NGN',
//           status: data.status || 'draft',
//           issue_date: new Date(data.issueDate || Date.now()),
//           due_date: new Date(data.dueDate || Date.now()),
//           payment_method: data.paymentMethod,
//           payment_reference: data.paymentReference,
//           notes: data.notes,
//           terms: data.terms,
//           document_url: data.documentUrl,
//           items: {
//             create: (data.items || []).map((item: any) => ({
//               description: item.description,
//               quantity: item.quantity || 1,
//               unit_price: BigInt(Math.round((item.unitPrice || 0) * 100)),
//               amount: BigInt(Math.round((item.amount || 0) * 100)),
//             })),
//           },
//         },
//         include: { items: true },
//       });

//       return {
//         success: true,
//         message: 'Invoice created successfully',
//         data: { invoice: this.formatInvoice(invoice) },
//       };
//     } catch (error: any) {
//       console.error('Create invoice error:', error);
//       if (error.code === 'P2002') {
//         return { success: false, message: 'Invoice number already exists', error: 'DUPLICATE_NUMBER' };
//       }
//       return { success: false, message: 'Failed to create invoice', error: 'CREATE_FAILED' };
//     }
//   }

//   static async getAll(userId: string, options: { page?: number; limit?: number; status?: string } = {}) {
//     try {
//       const { page = 1, limit = 20, status } = options;
//       const skip = (page - 1) * limit;
//       const where: any = { user_id: userId };
//       if (status) where.status = status;

//       const [invoices, total] = await Promise.all([
//         prisma.invoice.findMany({
//           where,
//           orderBy: { created_at: 'desc' },
//           skip,
//           take: limit,
//           include: { items: true, contact: { select: { name: true, email: true } } },
//         }),
//         prisma.invoice.count({ where }),
//       ]);

//       return {
//         success: true,
//         data: {
//           invoices: invoices.map(this.formatInvoice),
//           pagination: { current: page, limit, total, pages: Math.ceil(total / limit) },
//         },
//       };
//     } catch (error) {
//       console.error('Get invoices error:', error);
//       return { success: false, message: 'Failed to retrieve invoices', error: 'GET_FAILED' };
//     }
//   }

//   static async getById(userId: string, invoiceId: string) {
//     try {
//       const invoice = await prisma.invoice.findFirst({
//         where: { id: invoiceId, user_id: userId },
//         include: { items: true, contact: true },
//       });

//       if (!invoice) {
//         return { success: false, message: 'Invoice not found', error: 'NOT_FOUND' };
//       }

//       return { success: true, data: { invoice: this.formatInvoice(invoice) } };
//     } catch (error) {
//       console.error('Get invoice error:', error);
//       return { success: false, message: 'Failed to retrieve invoice', error: 'GET_FAILED' };
//     }
//   }

//   static async update(userId: string, invoiceId: string, data: any) {
//     try {
//       const existing = await prisma.invoice.findFirst({ where: { id: invoiceId, user_id: userId } });
//       if (!existing) {
//         return { success: false, message: 'Invoice not found', error: 'NOT_FOUND' };
//       }

//       // Delete existing items and recreate
//       await prisma.invoiceItem.deleteMany({ where: { invoice_id: invoiceId } });

//       const invoice = await prisma.invoice.update({
//         where: { id: invoiceId },
//         data: {
//           subtotal: data.subtotal ? BigInt(Math.round(data.subtotal * 100)) : undefined,
//           tax_amount: data.taxAmount ? BigInt(Math.round(data.taxAmount * 100)) : undefined,
//           discount_amount: data.discountAmount ? BigInt(Math.round(data.discountAmount * 100)) : undefined,
//           total: data.total ? BigInt(Math.round(data.total * 100)) : undefined,
//           status: data.status,
//           due_date: data.dueDate ? new Date(data.dueDate) : undefined,
//           paid_date: data.paidDate ? new Date(data.paidDate) : undefined,
//           payment_method: data.paymentMethod,
//           notes: data.notes,
//           terms: data.terms,
//           items: data.items ? {
//             create: data.items.map((item: any) => ({
//               description: item.description,
//               quantity: item.quantity || 1,
//               unit_price: BigInt(Math.round((item.unitPrice || 0) * 100)),
//               amount: BigInt(Math.round((item.amount || 0) * 100)),
//             })),
//           } : undefined,
//         },
//         include: { items: true },
//       });

//       return { success: true, message: 'Invoice updated', data: { invoice: this.formatInvoice(invoice) } };
//     } catch (error) {
//       console.error('Update invoice error:', error);
//       return { success: false, message: 'Failed to update invoice', error: 'UPDATE_FAILED' };
//     }
//   }

//   static async delete(userId: string, invoiceId: string) {
//     try {
//       const existing = await prisma.invoice.findFirst({ where: { id: invoiceId, user_id: userId } });
//       if (!existing) {
//         return { success: false, message: 'Invoice not found', error: 'NOT_FOUND' };
//       }

//       await prisma.invoice.delete({ where: { id: invoiceId } });
//       return { success: true, message: 'Invoice deleted successfully' };
//     } catch (error) {
//       console.error('Delete invoice error:', error);
//       return { success: false, message: 'Failed to delete invoice', error: 'DELETE_FAILED' };
//     }
//   }

//   private static formatInvoice(invoice: any) {
//     return {
//       ...invoice,
//       subtotal: Number(invoice.subtotal) / 100,
//       tax_amount: Number(invoice.tax_amount) / 100,
//       discount_amount: Number(invoice.discount_amount) / 100,
//       total: Number(invoice.total) / 100,
//       items: invoice.items?.map((item: any) => ({
//         ...item,
//         unit_price: Number(item.unit_price) / 100,
//         amount: Number(item.amount) / 100,
//       })),
//     };
//   }
// }

// // ============================================================================
// // QUOTATION SERVICE
// // ============================================================================

// export class QuotationService {
//   static async create(userId: string, data: any) {
//     try {
//       const quotationNumber = data.quotationNumber || `QT-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
//       const publicLink = data.generatePublicLink ? uuidv4() : null;

//       const quotation = await prisma.quotation.create({
//         data: {
//           user_id: userId,
//           quotation_number: quotationNumber,
//           client_name: data.clientName,
//           client_email: data.clientEmail,
//           client_phone: data.clientPhone,
//           client_address: data.clientAddress,
//           subtotal: BigInt(Math.round((data.subtotal || 0) * 100)),
//           tax_amount: BigInt(Math.round((data.taxAmount || 0) * 100)),
//           discount_amount: BigInt(Math.round((data.discountAmount || 0) * 100)),
//           total: BigInt(Math.round((data.total || 0) * 100)),
//           currency: data.currency || 'NGN',
//           status: data.status || 'draft',
//           issue_date: new Date(data.issueDate || Date.now()),
//           valid_until: new Date(data.validUntil || Date.now() + 30 * 24 * 60 * 60 * 1000),
//           notes: data.notes,
//           terms: data.terms,
//           public_link: publicLink,
//           public_link_expires: publicLink ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
//           document_data: data.documentData,
//           items: {
//             create: (data.items || []).map((item: any) => ({
//               description: item.description,
//               quantity: item.quantity || 1,
//               unit_price: BigInt(Math.round((item.unitPrice || 0) * 100)),
//               amount: BigInt(Math.round((item.amount || 0) * 100)),
//             })),
//           },
//         },
//         include: { items: true },
//       });

//       return {
//         success: true,
//         message: 'Quotation created successfully',
//         data: { quotation: this.formatQuotation(quotation) },
//       };
//     } catch (error: any) {
//       console.error('Create quotation error:', error);
//       if (error.code === 'P2002') {
//         return { success: false, message: 'Quotation number already exists', error: 'DUPLICATE_NUMBER' };
//       }
//       return { success: false, message: 'Failed to create quotation', error: 'CREATE_FAILED' };
//     }
//   }

//   static async getAll(userId: string, options: { page?: number; limit?: number; status?: string } = {}) {
//     try {
//       const { page = 1, limit = 20, status } = options;
//       const skip = (page - 1) * limit;
//       const where: any = { user_id: userId };
//       if (status) where.status = status;

//       const [quotations, total] = await Promise.all([
//         prisma.quotation.findMany({
//           where,
//           orderBy: { created_at: 'desc' },
//           skip,
//           take: limit,
//           include: { items: true },
//         }),
//         prisma.quotation.count({ where }),
//       ]);

//       return {
//         success: true,
//         data: {
//           quotations: quotations.map(this.formatQuotation),
//           pagination: { current: page, limit, total, pages: Math.ceil(total / limit) },
//         },
//       };
//     } catch (error) {
//       console.error('Get quotations error:', error);
//       return { success: false, message: 'Failed to retrieve quotations', error: 'GET_FAILED' };
//     }
//   }

//   static async getById(userId: string, quotationId: string) {
//     try {
//       const quotation = await prisma.quotation.findFirst({
//         where: { id: quotationId, user_id: userId },
//         include: { items: true },
//       });

//       if (!quotation) {
//         return { success: false, message: 'Quotation not found', error: 'NOT_FOUND' };
//       }

//       return { success: true, data: { quotation: this.formatQuotation(quotation) } };
//     } catch (error) {
//       console.error('Get quotation error:', error);
//       return { success: false, message: 'Failed to retrieve quotation', error: 'GET_FAILED' };
//     }
//   }

//   static async getByPublicLink(publicLink: string) {
//     try {
//       const quotation = await prisma.quotation.findUnique({
//         where: { public_link: publicLink },
//         include: { items: true },
//       });

//       if (!quotation) {
//         return { success: false, message: 'Quotation not found', error: 'NOT_FOUND' };
//       }

//       if (quotation.public_link_expires && quotation.public_link_expires < new Date()) {
//         return { success: false, message: 'This link has expired', error: 'LINK_EXPIRED' };
//       }

//       return { success: true, data: { quotation: this.formatQuotation(quotation) } };
//     } catch (error) {
//       console.error('Get quotation by link error:', error);
//       return { success: false, message: 'Failed to retrieve quotation', error: 'GET_FAILED' };
//     }
//   }

//   static async update(userId: string, quotationId: string, data: any) {
//     try {
//       const existing = await prisma.quotation.findFirst({ where: { id: quotationId, user_id: userId } });
//       if (!existing) {
//         return { success: false, message: 'Quotation not found', error: 'NOT_FOUND' };
//       }

//       if (data.items) {
//         await prisma.quotationItem.deleteMany({ where: { quotation_id: quotationId } });
//       }

//       const quotation = await prisma.quotation.update({
//         where: { id: quotationId },
//         data: {
//           client_name: data.clientName,
//           client_email: data.clientEmail,
//           subtotal: data.subtotal ? BigInt(Math.round(data.subtotal * 100)) : undefined,
//           tax_amount: data.taxAmount ? BigInt(Math.round(data.taxAmount * 100)) : undefined,
//           discount_amount: data.discountAmount ? BigInt(Math.round(data.discountAmount * 100)) : undefined,
//           total: data.total ? BigInt(Math.round(data.total * 100)) : undefined,
//           status: data.status,
//           valid_until: data.validUntil ? new Date(data.validUntil) : undefined,
//           notes: data.notes,
//           document_data: data.documentData,
//           items: data.items ? {
//             create: data.items.map((item: any) => ({
//               description: item.description,
//               quantity: item.quantity || 1,
//               unit_price: BigInt(Math.round((item.unitPrice || 0) * 100)),
//               amount: BigInt(Math.round((item.amount || 0) * 100)),
//             })),
//           } : undefined,
//         },
//         include: { items: true },
//       });

//       return { success: true, message: 'Quotation updated', data: { quotation: this.formatQuotation(quotation) } };
//     } catch (error) {
//       console.error('Update quotation error:', error);
//       return { success: false, message: 'Failed to update quotation', error: 'UPDATE_FAILED' };
//     }
//   }

//   static async delete(userId: string, quotationId: string) {
//     try {
//       const existing = await prisma.quotation.findFirst({ where: { id: quotationId, user_id: userId } });
//       if (!existing) {
//         return { success: false, message: 'Quotation not found', error: 'NOT_FOUND' };
//       }

//       await prisma.quotation.delete({ where: { id: quotationId } });
//       return { success: true, message: 'Quotation deleted successfully' };
//     } catch (error) {
//       console.error('Delete quotation error:', error);
//       return { success: false, message: 'Failed to delete quotation', error: 'DELETE_FAILED' };
//     }
//   }

//   private static formatQuotation(quotation: any) {
//     return {
//       ...quotation,
//       subtotal: Number(quotation.subtotal) / 100,
//       tax_amount: Number(quotation.tax_amount) / 100,
//       discount_amount: Number(quotation.discount_amount) / 100,
//       total: Number(quotation.total) / 100,
//       items: quotation.items?.map((item: any) => ({
//         ...item,
//         unit_price: Number(item.unit_price) / 100,
//         amount: Number(item.amount) / 100,
//       })),
//     };
//   }
// }

// // ============================================================================
// // RECEIPT SERVICE
// // ============================================================================

// export class ReceiptService {
//   static async create(userId: string, data: any) {
//     try {
//       const receiptNumber = data.receiptNumber || `RCPT-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

//       const receipt = await prisma.receipt.create({
//         data: {
//           user_id: userId,
//           receipt_number: receiptNumber,
//           customer_name: data.customerName,
//           customer_email: data.customerEmail,
//           customer_phone: data.customerPhone,
//           subtotal: BigInt(Math.round((data.subtotal || 0) * 100)),
//           tax_amount: BigInt(Math.round((data.taxAmount || 0) * 100)),
//           total: BigInt(Math.round((data.total || 0) * 100)),
//           currency: data.currency || 'NGN',
//           payment_method: data.paymentMethod,
//           payment_reference: data.paymentReference,
//           receipt_date: new Date(data.receiptDate || Date.now()),
//           notes: data.notes,
//           document_data: data.documentData,
//           items: {
//             create: (data.items || []).map((item: any) => ({
//               description: item.description,
//               quantity: item.quantity || 1,
//               unit_price: BigInt(Math.round((item.unitPrice || 0) * 100)),
//               amount: BigInt(Math.round((item.amount || 0) * 100)),
//             })),
//           },
//         },
//         include: { items: true },
//       });

//       return {
//         success: true,
//         message: 'Receipt created successfully',
//         data: { receipt: this.formatReceipt(receipt) },
//       };
//     } catch (error: any) {
//       console.error('Create receipt error:', error);
//       if (error.code === 'P2002') {
//         return { success: false, message: 'Receipt number already exists', error: 'DUPLICATE_NUMBER' };
//       }
//       return { success: false, message: 'Failed to create receipt', error: 'CREATE_FAILED' };
//     }
//   }

//   static async getAll(userId: string, options: { page?: number; limit?: number } = {}) {
//     try {
//       const { page = 1, limit = 20 } = options;
//       const skip = (page - 1) * limit;

//       const [receipts, total] = await Promise.all([
//         prisma.receipt.findMany({
//           where: { user_id: userId },
//           orderBy: { created_at: 'desc' },
//           skip,
//           take: limit,
//           include: { items: true },
//         }),
//         prisma.receipt.count({ where: { user_id: userId } }),
//       ]);

//       return {
//         success: true,
//         data: {
//           receipts: receipts.map(this.formatReceipt),
//           pagination: { current: page, limit, total, pages: Math.ceil(total / limit) },
//         },
//       };
//     } catch (error) {
//       console.error('Get receipts error:', error);
//       return { success: false, message: 'Failed to retrieve receipts', error: 'GET_FAILED' };
//     }
//   }

//   static async getById(userId: string, receiptId: string) {
//     try {
//       const receipt = await prisma.receipt.findFirst({
//         where: { id: receiptId, user_id: userId },
//         include: { items: true },
//       });

//       if (!receipt) {
//         return { success: false, message: 'Receipt not found', error: 'NOT_FOUND' };
//       }

//       return { success: true, data: { receipt: this.formatReceipt(receipt) } };
//     } catch (error) {
//       console.error('Get receipt error:', error);
//       return { success: false, message: 'Failed to retrieve receipt', error: 'GET_FAILED' };
//     }
//   }

//   static async delete(userId: string, receiptId: string) {
//     try {
//       const existing = await prisma.receipt.findFirst({ where: { id: receiptId, user_id: userId } });
//       if (!existing) {
//         return { success: false, message: 'Receipt not found', error: 'NOT_FOUND' };
//       }

//       await prisma.receipt.delete({ where: { id: receiptId } });
//       return { success: true, message: 'Receipt deleted successfully' };
//     } catch (error) {
//       console.error('Delete receipt error:', error);
//       return { success: false, message: 'Failed to delete receipt', error: 'DELETE_FAILED' };
//     }
//   }

//   private static formatReceipt(receipt: any) {
//     return {
//       ...receipt,
//       subtotal: Number(receipt.subtotal) / 100,
//       tax_amount: Number(receipt.tax_amount) / 100,
//       total: Number(receipt.total) / 100,
//       items: receipt.items?.map((item: any) => ({
//         ...item,
//         unit_price: Number(item.unit_price) / 100,
//         amount: Number(item.amount) / 100,
//       })),
//     };
//   }
// }

// // ============================================================================
// // PAYSLIP SERVICE
// // ============================================================================

// export class PayslipService {
//   static async create(userId: string, data: any) {
//     try {
//       const payslipNumber = data.payslipNumber || `PS-${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

//       const payslip = await prisma.payslip.create({
//         data: {
//           user_id: userId,
//           payslip_number: payslipNumber,
//           employee_name: data.employeeName,
//           employee_id: data.employeeId,
//           employee_department: data.employeeDepartment,
//           employee_position: data.employeePosition,
//           pay_period_start: new Date(data.payPeriodStart),
//           pay_period_end: new Date(data.payPeriodEnd),
//           payment_date: new Date(data.paymentDate || Date.now()),
//           basic_salary: BigInt(Math.round((data.basicSalary || 0) * 100)),
//           housing_allowance: BigInt(Math.round((data.housingAllowance || 0) * 100)),
//           transport_allowance: BigInt(Math.round((data.transportAllowance || 0) * 100)),
//           other_allowances: BigInt(Math.round((data.otherAllowances || 0) * 100)),
//           bonus: BigInt(Math.round((data.bonus || 0) * 100)),
//           overtime: BigInt(Math.round((data.overtime || 0) * 100)),
//           gross_earnings: BigInt(Math.round((data.grossEarnings || 0) * 100)),
//           paye_tax: BigInt(Math.round((data.payeTax || 0) * 100)),
//           pension: BigInt(Math.round((data.pension || 0) * 100)),
//           nhf: BigInt(Math.round((data.nhf || 0) * 100)),
//           loans: BigInt(Math.round((data.loans || 0) * 100)),
//           other_deductions: BigInt(Math.round((data.otherDeductions || 0) * 100)),
//           total_deductions: BigInt(Math.round((data.totalDeductions || 0) * 100)),
//           net_pay: BigInt(Math.round((data.netPay || 0) * 100)),
//           currency: data.currency || 'NGN',
//           document_data: data.documentData,
//         },
//       });

//       return {
//         success: true,
//         message: 'Payslip created successfully',
//         data: { payslip: this.formatPayslip(payslip) },
//       };
//     } catch (error: any) {
//       console.error('Create payslip error:', error);
//       if (error.code === 'P2002') {
//         return { success: false, message: 'Payslip number already exists', error: 'DUPLICATE_NUMBER' };
//       }
//       return { success: false, message: 'Failed to create payslip', error: 'CREATE_FAILED' };
//     }
//   }

//   static async getAll(userId: string, options: { page?: number; limit?: number } = {}) {
//     try {
//       const { page = 1, limit = 20 } = options;
//       const skip = (page - 1) * limit;

//       const [payslips, total] = await Promise.all([
//         prisma.payslip.findMany({
//           where: { user_id: userId },
//           orderBy: { created_at: 'desc' },
//           skip,
//           take: limit,
//         }),
//         prisma.payslip.count({ where: { user_id: userId } }),
//       ]);

//       return {
//         success: true,
//         data: {
//           payslips: payslips.map(this.formatPayslip),
//           pagination: { current: page, limit, total, pages: Math.ceil(total / limit) },
//         },
//       };
//     } catch (error) {
//       console.error('Get payslips error:', error);
//       return { success: false, message: 'Failed to retrieve payslips', error: 'GET_FAILED' };
//     }
//   }

//   static async getById(userId: string, payslipId: string) {
//     try {
//       const payslip = await prisma.payslip.findFirst({
//         where: { id: payslipId, user_id: userId },
//       });

//       if (!payslip) {
//         return { success: false, message: 'Payslip not found', error: 'NOT_FOUND' };
//       }

//       return { success: true, data: { payslip: this.formatPayslip(payslip) } };
//     } catch (error) {
//       console.error('Get payslip error:', error);
//       return { success: false, message: 'Failed to retrieve payslip', error: 'GET_FAILED' };
//     }
//   }

//   static async delete(userId: string, payslipId: string) {
//     try {
//       const existing = await prisma.payslip.findFirst({ where: { id: payslipId, user_id: userId } });
//       if (!existing) {
//         return { success: false, message: 'Payslip not found', error: 'NOT_FOUND' };
//       }

//       await prisma.payslip.delete({ where: { id: payslipId } });
//       return { success: true, message: 'Payslip deleted successfully' };
//     } catch (error) {
//       console.error('Delete payslip error:', error);
//       return { success: false, message: 'Failed to delete payslip', error: 'DELETE_FAILED' };
//     }
//   }

//   private static formatPayslip(payslip: any) {
//     return {
//       ...payslip,
//       basic_salary: Number(payslip.basic_salary) / 100,
//       housing_allowance: Number(payslip.housing_allowance) / 100,
//       transport_allowance: Number(payslip.transport_allowance) / 100,
//       other_allowances: Number(payslip.other_allowances) / 100,
//       bonus: Number(payslip.bonus) / 100,
//       overtime: Number(payslip.overtime) / 100,
//       gross_earnings: Number(payslip.gross_earnings) / 100,
//       paye_tax: Number(payslip.paye_tax) / 100,
//       pension: Number(payslip.pension) / 100,
//       nhf: Number(payslip.nhf) / 100,
//       loans: Number(payslip.loans) / 100,
//       other_deductions: Number(payslip.other_deductions) / 100,
//       total_deductions: Number(payslip.total_deductions) / 100,
//       net_pay: Number(payslip.net_pay) / 100,
//     };
//   }
// }

// // ============================================================================
// // DOCUMENT STATS SERVICE
// // ============================================================================

// export class DocumentStatsService {
//   static async getUserDocumentCounts(userId: string) {
//     try {
//       const [invoiceCount, quotationCount, receiptCount, payslipCount] = await Promise.all([
//         prisma.invoice.count({ where: { user_id: userId } }),
//         prisma.quotation.count({ where: { user_id: userId } }),
//         prisma.receipt.count({ where: { user_id: userId } }),
//         prisma.payslip.count({ where: { user_id: userId } }),
//       ]);

//       return {
//         success: true,
//         data: {
//           counts: {
//             invoices: invoiceCount,
//             quotations: quotationCount,
//             receipts: receiptCount,
//             payslips: payslipCount,
//             total: invoiceCount + quotationCount + receiptCount + payslipCount,
//           },
//         },
//       };
//     } catch (error) {
//       console.error('Get document counts error:', error);
//       return { success: false, message: 'Failed to get document counts', error: 'GET_FAILED' };
//     }
//   }

//   static async getAdminDocumentStats() {
//     try {
//       const [invoiceCount, quotationCount, receiptCount, payslipCount] = await Promise.all([
//         prisma.invoice.count(),
//         prisma.quotation.count(),
//         prisma.receipt.count(),
//         prisma.payslip.count(),
//       ]);

//       // Get counts by status for invoices
//       const invoicesByStatus = await prisma.invoice.groupBy({
//         by: ['status'],
//         _count: true,
//       });

//       // Get this month's document counts
//       const startOfMonth = new Date();
//       startOfMonth.setDate(1);
//       startOfMonth.setHours(0, 0, 0, 0);

//       const [monthlyInvoices, monthlyQuotations, monthlyReceipts, monthlyPayslips] = await Promise.all([
//         prisma.invoice.count({ where: { created_at: { gte: startOfMonth } } }),
//         prisma.quotation.count({ where: { created_at: { gte: startOfMonth } } }),
//         prisma.receipt.count({ where: { created_at: { gte: startOfMonth } } }),
//         prisma.payslip.count({ where: { created_at: { gte: startOfMonth } } }),
//       ]);

//       return {
//         success: true,
//         data: {
//           total: {
//             invoices: invoiceCount,
//             quotations: quotationCount,
//             receipts: receiptCount,
//             payslips: payslipCount,
//             all: invoiceCount + quotationCount + receiptCount + payslipCount,
//           },
//           thisMonth: {
//             invoices: monthlyInvoices,
//             quotations: monthlyQuotations,
//             receipts: monthlyReceipts,
//             payslips: monthlyPayslips,
//             all: monthlyInvoices + monthlyQuotations + monthlyReceipts + monthlyPayslips,
//           },
//           invoicesByStatus: invoicesByStatus.map(s => ({ status: s.status, count: s._count })),
//         },
//       };
//     } catch (error) {
//       console.error('Get admin document stats error:', error);
//       return { success: false, message: 'Failed to get document stats', error: 'GET_FAILED' };
//     }
//   }
// }

// export default { InvoiceService, QuotationService, ReceiptService, PayslipService, DocumentStatsService };


import prisma from '../lib/prisma.js';
import { v4 as uuidv4 } from 'uuid';
import type { ServiceResponse } from '../types/index.js';

// ============================================================================
// DOCUMENT GENERATOR SERVICE
// Handles Invoice, Quotation, Receipt, and Payslip CRUD operations
// ============================================================================

// Helper to generate document numbers
const genNumber = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

// Helper to convert amount to BigInt kobo
const toKobo = (amount: number) => BigInt(Math.round((amount || 0) * 100));

// Helper to convert BigInt kobo to number
const fromKobo = (amount: any) => Number(amount) / 100;

// ============================================================================
// INVOICE SERVICE
// ============================================================================

export class InvoiceService {
  private static format(invoice: any) {
    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      contactId: invoice.contactId,
      contact: invoice.contact ?? null,
      subtotal: fromKobo(invoice.subtotal),
      taxAmount: fromKobo(invoice.taxAmount),
      discountAmount: fromKobo(invoice.discountAmount),
      total: fromKobo(invoice.total),
      currency: invoice.currency,
      status: invoice.status,
      issueDate: invoice.issueDate?.toISOString() ?? null,
      dueDate: invoice.dueDate?.toISOString() ?? null,
      paidDate: invoice.paidDate?.toISOString() ?? null,
      paymentMethod: invoice.paymentMethod,
      paymentReference: invoice.paymentReference,
      notes: invoice.notes,
      terms: invoice.terms,
      documentUrl: invoice.documentUrl,
      createdAt: invoice.createdAt?.toISOString() ?? null,
      items: invoice.items?.map((item: any) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: fromKobo(item.unitPrice),
        amount: fromKobo(item.amount),
      })) ?? [],
    };
  }

  // Normalise incoming data — frontend sends summary.total / invoiceDate,
  // admin/API clients may send total / issueDate directly
  private static normalise(data: any) {
    const s = data.summary ?? {};
    return {
      subtotal:       data.subtotal       ?? s.subtotal       ?? 0,
      taxAmount:      data.taxAmount      ?? (s.totalTax ?? 0) + (s.vat ?? 0),
      discountAmount: data.discountAmount ?? s.totalDiscount   ?? 0,
      total:          data.total          ?? s.total           ?? 0,
      issueDate:      data.issueDate      ?? data.invoiceDate  ?? new Date(),
      dueDate:        data.dueDate        ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };
  }

  static async create(userId: string, data: any): Promise<ServiceResponse> {
    const norm = InvoiceService.normalise(data);

    const invoice = await prisma.invoice.create({
      data: {
        userId,
        contactId: data.contactId,
        invoiceNumber: data.invoiceNumber || genNumber('INV'),
        subtotal:        toKobo(norm.subtotal),
        taxAmount:       toKobo(norm.taxAmount),
        discountAmount:  toKobo(norm.discountAmount),
        total:           toKobo(norm.total),
        currency:        data.currency ?? 'NGN',
        status:          data.status   ?? 'draft',
        issueDate:       new Date(norm.issueDate),
        dueDate:         new Date(norm.dueDate),
        paymentMethod:   data.paymentMethod,
        paymentReference: data.paymentReference,
        notes:           data.notes,
        terms:           data.terms,
        documentUrl:     data.documentUrl,
        documentData:    data, // store full frontend object for round-trip fidelity
        items: {
          create: (data.items || []).map((item: any) => ({
            description: item.description ?? '',
            quantity:    item.quantity    ?? 1,
            unitPrice:   toKobo(item.unitPrice),
            amount:      toKobo(item.amount),
          })),
        },
      },
      include: { items: true, contact: { select: { name: true, email: true } } },
    });

    // Return the original frontend object with the new DB id attached
    return {
      success: true,
      message: 'Invoice created successfully',
      data: { invoice: { ...data, id: invoice.id } },
    };
  }

  static async getAll(
    userId: string,
    options: { page?: number; limit?: number; status?: string } = {}
  ): Promise<ServiceResponse> {
    const { page = 1, limit = 20, status } = options;
    const skip = (page - 1) * limit;
    const where: any = { userId };
    if (status) where.status = status;

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { items: true, contact: { select: { name: true, email: true } } },
      }),
      prisma.invoice.count({ where }),
    ]);

    // Return documentData (frontend format) when available, otherwise formatted DB fields
    const mapped = (invoices as any[]).map((i) =>
      i.documentData ? { ...(i.documentData as any), id: i.id } : this.format(i)
    );

    return {
      success: true,
      message: 'Invoices retrieved successfully',
      data: {
        invoices: mapped,
        pagination: { current: page, limit, total, pages: Math.ceil(total / limit) },
      },
    };
  }

  static async getById(userId: string, invoiceId: string): Promise<ServiceResponse> {
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, userId },
      include: { items: true, contact: true },
    });

    if (!invoice) {
      return { success: false, message: 'Invoice not found', error: 'NOT_FOUND' };
    }

    const result = (invoice as any).documentData
      ? { ...(invoice as any).documentData, id: invoice.id }
      : this.format(invoice);
    return { success: true, message: 'Invoice retrieved successfully', data: { invoice: result } };
  }

  static async update(userId: string, invoiceId: string, data: any): Promise<ServiceResponse> {
    const existing = await prisma.invoice.findFirst({ where: { id: invoiceId, userId } });
    if (!existing) {
      return { success: false, message: 'Invoice not found', error: 'NOT_FOUND' };
    }

    const norm = InvoiceService.normalise(data);

    if (data.items) {
      await prisma.invoiceItem.deleteMany({ where: { invoiceId } });
    }

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        subtotal:        norm.subtotal       ? toKobo(norm.subtotal)       : undefined,
        taxAmount:       norm.taxAmount      ? toKobo(norm.taxAmount)      : undefined,
        discountAmount:  norm.discountAmount ? toKobo(norm.discountAmount) : undefined,
        total:           norm.total          ? toKobo(norm.total)          : undefined,
        status:          data.status,
        dueDate:         data.dueDate  ? new Date(data.dueDate)  : undefined,
        paidDate:        data.paidDate ? new Date(data.paidDate) : undefined,
        paymentMethod:   data.paymentMethod,
        notes:           data.notes,
        terms:           data.terms,
        documentData:    data,
        items: data.items ? {
          create: data.items.map((item: any) => ({
            description: item.description ?? '',
            quantity:    item.quantity    ?? 1,
            unitPrice:   toKobo(item.unitPrice),
            amount:      toKobo(item.amount),
          })),
        } : undefined,
      },
    });

    return { success: true, message: 'Invoice updated successfully', data: { invoice: { ...data, id: invoiceId } } };
  }

  static async delete(userId: string, invoiceId: string): Promise<ServiceResponse> {
    const existing = await prisma.invoice.findFirst({ where: { id: invoiceId, userId } });
    if (!existing) {
      return { success: false, message: 'Invoice not found', error: 'NOT_FOUND' };
    }

    await prisma.invoice.delete({ where: { id: invoiceId } });
    return { success: true, message: 'Invoice deleted successfully' };
  }
}

// ============================================================================
// QUOTATION SERVICE
// ============================================================================

export class QuotationService {
  private static format(quotation: any) {
    return {
      id: quotation.id,
      quotationNumber: quotation.quotationNumber,
      clientName: quotation.clientName,
      clientEmail: quotation.clientEmail,
      clientPhone: quotation.clientPhone,
      clientAddress: quotation.clientAddress,
      subtotal: fromKobo(quotation.subtotal),
      taxAmount: fromKobo(quotation.taxAmount),
      discountAmount: fromKobo(quotation.discountAmount),
      total: fromKobo(quotation.total),
      currency: quotation.currency,
      status: quotation.status,
      issueDate: quotation.issueDate?.toISOString() ?? null,
      validUntil: quotation.validUntil?.toISOString() ?? null,
      publicLink: quotation.publicLink,
      publicLinkExpires: quotation.publicLinkExpires?.toISOString() ?? null,
      notes: quotation.notes,
      terms: quotation.terms,
      createdAt: quotation.createdAt?.toISOString() ?? null,
      items: quotation.items?.map((item: any) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: fromKobo(item.unitPrice),
        amount: fromKobo(item.amount),
      })) ?? [],
    };
  }

  static async create(userId: string, data: any): Promise<ServiceResponse> {
    const publicLink = data.generatePublicLink ? uuidv4() : null;

    const quotation = await prisma.quotation.create({
      data: {
        userId,
        quotationNumber: data.quotationNumber || genNumber('QT'),
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        clientAddress: data.clientAddress,
        subtotal: toKobo(data.subtotal),
        taxAmount: toKobo(data.taxAmount),
        discountAmount: toKobo(data.discountAmount),
        total: toKobo(data.total),
        currency: data.currency ?? 'NGN',
        status: data.status ?? 'draft',
        issueDate: new Date(data.issueDate || Date.now()),
        validUntil: new Date(data.validUntil || Date.now() + 30 * 24 * 60 * 60 * 1000),
        notes: data.notes,
        terms: data.terms,
        publicLink,
        publicLinkExpires: publicLink
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          : null,
        documentData: data.documentData,
        items: {
          create: (data.items || []).map((item: any) => ({
            description: item.description,
            quantity: item.quantity ?? 1,
            unitPrice: toKobo(item.unitPrice),
            amount: toKobo(item.amount),
          })),
        },
      },
      include: { items: true },
    });

    return {
      success: true,
      message: 'Quotation created successfully',
      data: { quotation: this.format(quotation) },
    };
  }

  static async getAll(
    userId: string,
    options: { page?: number; limit?: number; status?: string } = {}
  ): Promise<ServiceResponse> {
    const { page = 1, limit = 20, status } = options;
    const skip = (page - 1) * limit;
    const where: any = { userId };
    if (status) where.status = status;

    const [quotations, total] = await Promise.all([
      prisma.quotation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { items: true },
      }),
      prisma.quotation.count({ where }),
    ]);

    return {
      success: true,
      message: 'Quotations retrieved successfully',
      data: {
        quotations: (quotations as any[]).map((q) => this.format(q)),
        pagination: { current: page, limit, total, pages: Math.ceil(total / limit) },
      },
    };
  }

  static async getById(userId: string, quotationId: string): Promise<ServiceResponse> {
    const quotation = await prisma.quotation.findFirst({
      where: { id: quotationId, userId },
      include: { items: true },
    });

    if (!quotation) {
      return { success: false, message: 'Quotation not found', error: 'NOT_FOUND' };
    }

    return { success: true, message: 'Quotation retrieved successfully', data: { quotation: this.format(quotation) } };
  }

  static async getByPublicLink(publicLink: string): Promise<ServiceResponse> {
    const quotation = await prisma.quotation.findUnique({
      where: { publicLink },
      include: { items: true },
    }) as any;

    if (!quotation) {
      return { success: false, message: 'Quotation not found', error: 'NOT_FOUND' };
    }

    if (quotation.publicLinkExpires && quotation.publicLinkExpires < new Date()) {
      return { success: false, message: 'This link has expired', error: 'LINK_EXPIRED' };
    }

    return { success: true, message: 'Quotation retrieved successfully', data: { quotation: this.format(quotation) } };
  }

  static async update(userId: string, quotationId: string, data: any): Promise<ServiceResponse> {
    const existing = await prisma.quotation.findFirst({ where: { id: quotationId, userId } });
    if (!existing) {
      return { success: false, message: 'Quotation not found', error: 'NOT_FOUND' };
    }

    if (data.items) {
      await prisma.quotationItem.deleteMany({ where: { quotationId } });
    }

    const quotation = await prisma.quotation.update({
      where: { id: quotationId },
      data: {
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        subtotal: data.subtotal ? toKobo(data.subtotal) : undefined,
        taxAmount: data.taxAmount ? toKobo(data.taxAmount) : undefined,
        discountAmount: data.discountAmount ? toKobo(data.discountAmount) : undefined,
        total: data.total ? toKobo(data.total) : undefined,
        status: data.status,
        validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
        notes: data.notes,
        documentData: data.documentData,
        items: data.items ? {
          create: data.items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity ?? 1,
            unitPrice: toKobo(item.unitPrice),
            amount: toKobo(item.amount),
          })),
        } : undefined,
      },
      include: { items: true },
    });

    return { success: true, message: 'Quotation updated successfully', data: { quotation: this.format(quotation) } };
  }

  static async delete(userId: string, quotationId: string): Promise<ServiceResponse> {
    const existing = await prisma.quotation.findFirst({ where: { id: quotationId, userId } });
    if (!existing) {
      return { success: false, message: 'Quotation not found', error: 'NOT_FOUND' };
    }

    await prisma.quotation.delete({ where: { id: quotationId } });
    return { success: true, message: 'Quotation deleted successfully' };
  }
}

// ============================================================================
// RECEIPT SERVICE
// ============================================================================

export class ReceiptService {
  private static format(receipt: any) {
    return {
      id: receipt.id,
      receiptNumber: receipt.receiptNumber,
      customerName: receipt.customerName,
      customerEmail: receipt.customerEmail,
      customerPhone: receipt.customerPhone,
      subtotal: fromKobo(receipt.subtotal),
      taxAmount: fromKobo(receipt.taxAmount),
      total: fromKobo(receipt.total),
      currency: receipt.currency,
      paymentMethod: receipt.paymentMethod,
      paymentReference: receipt.paymentReference,
      receiptDate: receipt.receiptDate?.toISOString() ?? null,
      notes: receipt.notes,
      createdAt: receipt.createdAt?.toISOString() ?? null,
      items: receipt.items?.map((item: any) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: fromKobo(item.unitPrice),
        amount: fromKobo(item.amount),
      })) ?? [],
    };
  }

  static async create(userId: string, data: any): Promise<ServiceResponse> {
    const receipt = await prisma.receipt.create({
      data: {
        userId,
        receiptNumber: data.receiptNumber || genNumber('RCPT'),
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        subtotal: toKobo(data.subtotal),
        taxAmount: toKobo(data.taxAmount),
        total: toKobo(data.total),
        currency: data.currency ?? 'NGN',
        paymentMethod: data.paymentMethod,
        paymentReference: data.paymentReference,
        receiptDate: new Date(data.receiptDate || Date.now()),
        notes: data.notes,
        documentData: data.documentData,
        items: {
          create: (data.items || []).map((item: any) => ({
            description: item.description,
            quantity: item.quantity ?? 1,
            unitPrice: toKobo(item.unitPrice),
            amount: toKobo(item.amount),
          })),
        },
      },
      include: { items: true },
    });

    return {
      success: true,
      message: 'Receipt created successfully',
      data: { receipt: this.format(receipt) },
    };
  }

  static async getAll(
    userId: string,
    options: { page?: number; limit?: number } = {}
  ): Promise<ServiceResponse> {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const [receipts, total] = await Promise.all([
      prisma.receipt.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { items: true },
      }),
      prisma.receipt.count({ where: { userId } }),
    ]);

    return {
      success: true,
      message: 'Receipts retrieved successfully',
      data: {
        receipts: (receipts as any[]).map((r) => this.format(r)),
        pagination: { current: page, limit, total, pages: Math.ceil(total / limit) },
      },
    };
  }

  static async getById(userId: string, receiptId: string): Promise<ServiceResponse> {
    const receipt = await prisma.receipt.findFirst({
      where: { id: receiptId, userId },
      include: { items: true },
    });

    if (!receipt) {
      return { success: false, message: 'Receipt not found', error: 'NOT_FOUND' };
    }

    return { success: true, message: 'Receipt retrieved successfully', data: { receipt: this.format(receipt) } };
  }

  static async delete(userId: string, receiptId: string): Promise<ServiceResponse> {
    const existing = await prisma.receipt.findFirst({ where: { id: receiptId, userId } });
    if (!existing) {
      return { success: false, message: 'Receipt not found', error: 'NOT_FOUND' };
    }

    await prisma.receipt.delete({ where: { id: receiptId } });
    return { success: true, message: 'Receipt deleted successfully' };
  }
}

// ============================================================================
// PAYSLIP SERVICE
// ============================================================================

export class PayslipService {
  private static format(payslip: any) {
    return {
      id: payslip.id,
      payslipNumber: payslip.payslipNumber,
      employeeName: payslip.employeeName,
      employeeId: payslip.employeeId,
      employeeDepartment: payslip.employeeDepartment,
      employeePosition: payslip.employeePosition,
      payPeriodStart: payslip.payPeriodStart?.toISOString() ?? null,
      payPeriodEnd: payslip.payPeriodEnd?.toISOString() ?? null,
      paymentDate: payslip.paymentDate?.toISOString() ?? null,
      basicSalary: fromKobo(payslip.basicSalary),
      housingAllowance: fromKobo(payslip.housingAllowance),
      transportAllowance: fromKobo(payslip.transportAllowance),
      otherAllowances: fromKobo(payslip.otherAllowances),
      bonus: fromKobo(payslip.bonus),
      overtime: fromKobo(payslip.overtime),
      grossEarnings: fromKobo(payslip.grossEarnings),
      payeTax: fromKobo(payslip.payeTax),
      pension: fromKobo(payslip.pension),
      nhf: fromKobo(payslip.nhf),
      loans: fromKobo(payslip.loans),
      otherDeductions: fromKobo(payslip.otherDeductions),
      totalDeductions: fromKobo(payslip.totalDeductions),
      netPay: fromKobo(payslip.netPay),
      currency: payslip.currency,
      createdAt: payslip.createdAt?.toISOString() ?? null,
    };
  }

  static async create(userId: string, data: any): Promise<ServiceResponse> {
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const payslipNumber = data.payslipNumber ||
      `PS-${new Date().getFullYear()}-${month}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const payslip = await prisma.payslip.create({
      data: {
        userId,
        payslipNumber,
        employeeName: data.employeeName,
        employeeId: data.employeeId,
        employeeDepartment: data.employeeDepartment,
        employeePosition: data.employeePosition,
        payPeriodStart: new Date(data.payPeriodStart),
        payPeriodEnd: new Date(data.payPeriodEnd),
        paymentDate: new Date(data.paymentDate || Date.now()),
        basicSalary: toKobo(data.basicSalary),
        housingAllowance: toKobo(data.housingAllowance),
        transportAllowance: toKobo(data.transportAllowance),
        otherAllowances: toKobo(data.otherAllowances),
        bonus: toKobo(data.bonus),
        overtime: toKobo(data.overtime),
        grossEarnings: toKobo(data.grossEarnings),
        payeTax: toKobo(data.payeTax),
        pension: toKobo(data.pension),
        nhf: toKobo(data.nhf),
        loans: toKobo(data.loans),
        otherDeductions: toKobo(data.otherDeductions),
        totalDeductions: toKobo(data.totalDeductions),
        netPay: toKobo(data.netPay),
        currency: data.currency ?? 'NGN',
        documentData: data.documentData,
      },
    });

    return {
      success: true,
      message: 'Payslip created successfully',
      data: { payslip: this.format(payslip) },
    };
  }

  static async getAll(
    userId: string,
    options: { page?: number; limit?: number } = {}
  ): Promise<ServiceResponse> {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const [payslips, total] = await Promise.all([
      prisma.payslip.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.payslip.count({ where: { userId } }),
    ]);

    return {
      success: true,
      message: 'Payslips retrieved successfully',
      data: {
        payslips: (payslips as any[]).map((p) => this.format(p)),
        pagination: { current: page, limit, total, pages: Math.ceil(total / limit) },
      },
    };
  }

  static async getById(userId: string, payslipId: string): Promise<ServiceResponse> {
    const payslip = await prisma.payslip.findFirst({ where: { id: payslipId, userId } });

    if (!payslip) {
      return { success: false, message: 'Payslip not found', error: 'NOT_FOUND' };
    }

    return { success: true, message: 'Payslip retrieved successfully', data: { payslip: this.format(payslip) } };
  }

  static async delete(userId: string, payslipId: string): Promise<ServiceResponse> {
    const existing = await prisma.payslip.findFirst({ where: { id: payslipId, userId } });
    if (!existing) {
      return { success: false, message: 'Payslip not found', error: 'NOT_FOUND' };
    }

    await prisma.payslip.delete({ where: { id: payslipId } });
    return { success: true, message: 'Payslip deleted successfully' };
  }
}

// ============================================================================
// DOCUMENT STATS SERVICE
// ============================================================================

export class DocumentStatsService {
  static async getUserDocumentCounts(userId: string): Promise<ServiceResponse> {
    const [invoiceCount, quotationCount, receiptCount, payslipCount] = await Promise.all([
      prisma.invoice.count({ where: { userId } }),
      prisma.quotation.count({ where: { userId } }),
      prisma.receipt.count({ where: { userId } }),
      prisma.payslip.count({ where: { userId } }),
    ]);

    return {
      success: true,
      message: 'Document counts retrieved successfully',
      data: {
        counts: {
          invoices: invoiceCount,
          quotations: quotationCount,
          receipts: receiptCount,
          payslips: payslipCount,
          total: invoiceCount + quotationCount + receiptCount + payslipCount,
        },
      },
    };
  }

  static async getAdminDocumentStats(): Promise<ServiceResponse> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
      invoiceCount, quotationCount, receiptCount, payslipCount,
      invoicesByStatus,
      monthlyInvoices, monthlyQuotations, monthlyReceipts, monthlyPayslips,
    ] = await Promise.all([
      prisma.invoice.count(),
      prisma.quotation.count(),
      prisma.receipt.count(),
      prisma.payslip.count(),
      prisma.invoice.groupBy({ by: ['status'], _count: true }),
      prisma.invoice.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.quotation.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.receipt.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.payslip.count({ where: { createdAt: { gte: startOfMonth } } }),
    ]);

    return {
      success: true,
      message: 'Admin document stats retrieved successfully',
      data: {
        total: {
          invoices: invoiceCount,
          quotations: quotationCount,
          receipts: receiptCount,
          payslips: payslipCount,
          all: invoiceCount + quotationCount + receiptCount + payslipCount,
        },
        thisMonth: {
          invoices: monthlyInvoices,
          quotations: monthlyQuotations,
          receipts: monthlyReceipts,
          payslips: monthlyPayslips,
          all: monthlyInvoices + monthlyQuotations + monthlyReceipts + monthlyPayslips,
        },
        invoicesByStatus: (invoicesByStatus as any[]).map((s) => ({ status: s.status, count: s._count })),
      },
    };
  }
}