import type { ServiceResponse } from '../types/index.js';

const fromKobo = (amount: any) => Number(amount) / 100;

//HTML Templates 

const baseStyles = `
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 13px; color: #111827; background: #fff; }
    .container { padding: 40px; max-width: 800px; margin: auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
    .brand { font-size: 22px; font-weight: 700; color: #f97316; }
    .brand-sub { font-size: 12px; color: #6b7280; margin-top: 4px; }
    .doc-title { font-size: 28px; font-weight: 700; color: #111827; text-align: right; }
    .doc-number { font-size: 13px; color: #6b7280; text-align: right; margin-top: 4px; }
    .divider { border: none; border-top: 2px solid #f97316; margin: 24px 0; }
    .two-col { display: flex; justify-content: space-between; margin-bottom: 24px; }
    .col h4 { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; margin-bottom: 8px; }
    .col p { font-size: 13px; color: #374151; line-height: 1.6; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    thead tr { background: #f97316; color: #fff; }
    thead th { padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 600; }
    tbody tr:nth-child(even) { background: #f9fafb; }
    tbody td { padding: 10px 12px; font-size: 13px; color: #374151; border-bottom: 1px solid #e5e7eb; }
    .text-right { text-align: right; }
    .totals { margin-left: auto; width: 280px; }
    .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #374151; border-bottom: 1px solid #f3f4f6; }
    .totals-row.total { font-size: 15px; font-weight: 700; color: #111827; border-top: 2px solid #f97316; border-bottom: none; padding-top: 10px; margin-top: 4px; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .badge-draft { background: #f3f4f6; color: #6b7280; }
    .badge-sent { background: #dbeafe; color: #1d4ed8; }
    .badge-paid { background: #dcfce7; color: #15803d; }
    .badge-overdue { background: #fee2e2; color: #dc2626; }
    .notes { background: #f9fafb; border-left: 3px solid #f97316; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-bottom: 16px; }
    .notes h4 { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; margin-bottom: 6px; }
    .notes p { font-size: 13px; color: #374151; line-height: 1.6; }
    .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 16px; }
    .payment-box { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
    .payment-box h4 { font-size: 12px; font-weight: 600; color: #ea580c; margin-bottom: 8px; }
    .payment-box p { font-size: 13px; color: #374151; line-height: 1.8; }
  </style>
`;

//Invoice HTML 

const buildInvoiceHtml = (invoice: any, businessName?: string, businessEmail?: string): string => {
  const items = invoice.items || [];
  const currency = invoice.currency ?? 'NGN';
  const status = invoice.status ?? 'draft';

  const statusClass: Record<string, string> = {
    draft: 'badge-draft', sent: 'badge-sent', paid: 'badge-paid', overdue: 'badge-overdue',
  };

  const itemRows = items.map((item: any) => `
    <tr>
      <td>${item.description ?? ''}</td>
      <td class="text-right">${item.quantity ?? 1}</td>
      <td class="text-right">${currency} ${Number(item.unitPrice ?? 0).toLocaleString()}</td>
      <td class="text-right">${currency} ${Number(item.amount ?? 0).toLocaleString()}</td>
    </tr>
  `).join('');

  const subtotal = Number(invoice.subtotal ?? 0);
  const tax = Number(invoice.taxAmount ?? invoice.tax ?? 0);
  const discount = Number(invoice.discountAmount ?? invoice.discount ?? 0);
  const total = Number(invoice.total ?? 0);
  const dueDate = invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
  const issueDate = invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('en-NG');

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8">${baseStyles}</head>
    <body>
      <div class="container">
        <div class="header">
          <div>
            <div class="brand">${businessName ?? 'MyBizTools'}</div>
            ${businessEmail ? `<div class="brand-sub">${businessEmail}</div>` : ''}
          </div>
          <div>
            <div class="doc-title">INVOICE</div>
            <div class="doc-number">${invoice.invoiceNumber ?? ''}</div>
            <div style="margin-top:8px;"><span class="badge ${statusClass[status] ?? 'badge-draft'}">${status}</span></div>
          </div>
        </div>

        <hr class="divider" />

        <div class="two-col">
          <div class="col">
            <h4>Bill To</h4>
            <p><strong>${invoice.clientName ?? invoice.contact?.name ?? 'N/A'}</strong></p>
            ${invoice.clientEmail || invoice.contact?.email ? `<p>${invoice.clientEmail ?? invoice.contact?.email}</p>` : ''}
            ${invoice.clientAddress ? `<p>${invoice.clientAddress}</p>` : ''}
          </div>
          <div class="col" style="text-align:right;">
            <h4>Invoice Details</h4>
            <p>Issue Date: ${issueDate}</p>
            <p>Due Date: <strong>${dueDate}</strong></p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th class="text-right">Qty</th>
              <th class="text-right">Unit Price</th>
              <th class="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>

        <div class="totals">
          <div class="totals-row"><span>Subtotal</span><span>${currency} ${subtotal.toLocaleString()}</span></div>
          ${tax > 0 ? `<div class="totals-row"><span>Tax</span><span>${currency} ${tax.toLocaleString()}</span></div>` : ''}
          ${discount > 0 ? `<div class="totals-row"><span>Discount</span><span>- ${currency} ${discount.toLocaleString()}</span></div>` : ''}
          <div class="totals-row total"><span>Total Due</span><span>${currency} ${total.toLocaleString()}</span></div>
        </div>

        ${invoice.bankName || invoice.accountNumber ? `
          <div class="payment-box">
            <h4>Payment Information</h4>
            <p>
              ${invoice.bankName ? `Bank: ${invoice.bankName}<br/>` : ''}
              ${invoice.accountNumber ? `Account Number: ${invoice.accountNumber}<br/>` : ''}
              ${invoice.accountName ? `Account Name: ${invoice.accountName}<br/>` : ''}
              ${invoice.paymentInstructions ? `<br/>${invoice.paymentInstructions}` : ''}
            </p>
          </div>
        ` : ''}

        ${invoice.notes ? `
          <div class="notes">
            <h4>Notes</h4>
            <p>${invoice.notes}</p>
          </div>
        ` : ''}

        ${invoice.terms ? `
          <div class="notes">
            <h4>Terms & Conditions</h4>
            <p>${invoice.terms}</p>
          </div>
        ` : ''}

        <div class="footer">
          <p>Thank you for your business! · Generated by MyBizTools · © ${new Date().getFullYear()}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

//Quotation HTML 

const buildQuotationHtml = (quotation: any, businessName?: string): string => {
  const items = quotation.items || [];
  const currency = quotation.currency ?? 'NGN';

  const itemRows = items.map((item: any) => `
    <tr>
      <td>${item.description ?? ''}</td>
      <td class="text-right">${item.quantity ?? 1}</td>
      <td class="text-right">${currency} ${Number(item.unitPrice ?? 0).toLocaleString()}</td>
      <td class="text-right">${currency} ${Number(item.amount ?? 0).toLocaleString()}</td>
    </tr>
  `).join('');

  const total = Number(quotation.total ?? 0);
  const validUntil = quotation.validUntil
    ? new Date(quotation.validUntil).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8">${baseStyles}</head>
    <body>
      <div class="container">
        <div class="header">
          <div>
            <div class="brand">${businessName ?? 'MyBizTools'}</div>
          </div>
          <div>
            <div class="doc-title">QUOTATION</div>
            <div class="doc-number">${quotation.quotationNumber ?? ''}</div>
          </div>
        </div>
        <hr class="divider" />
        <div class="two-col">
          <div class="col">
            <h4>Prepared For</h4>
            <p><strong>${quotation.clientName ?? 'N/A'}</strong></p>
            ${quotation.clientEmail ? `<p>${quotation.clientEmail}</p>` : ''}
            ${quotation.clientAddress ? `<p>${quotation.clientAddress}</p>` : ''}
          </div>
          <div class="col" style="text-align:right;">
            <h4>Valid Until</h4>
            <p><strong>${validUntil}</strong></p>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th class="text-right">Qty</th>
              <th class="text-right">Unit Price</th>
              <th class="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>
        <div class="totals">
          <div class="totals-row total"><span>Total</span><span>${currency} ${total.toLocaleString()}</span></div>
        </div>
        ${quotation.notes ? `<div class="notes"><h4>Notes</h4><p>${quotation.notes}</p></div>` : ''}
        <div class="footer"><p>Generated by MyBizTools · © ${new Date().getFullYear()}</p></div>
      </div>
    </body>
    </html>
  `;
};

//Receipt HTML 

const buildReceiptHtml = (receipt: any, businessName?: string): string => {
  const items = receipt.items || [];
  const currency = receipt.currency ?? 'NGN';

  const itemRows = items.map((item: any) => `
    <tr>
      <td>${item.description ?? ''}</td>
      <td class="text-right">${item.quantity ?? 1}</td>
      <td class="text-right">${currency} ${Number(item.unitPrice ?? 0).toLocaleString()}</td>
      <td class="text-right">${currency} ${Number(item.amount ?? 0).toLocaleString()}</td>
    </tr>
  `).join('');

  const total = Number(receipt.total ?? 0);
  const receiptDate = receipt.receiptDate
    ? new Date(receipt.receiptDate).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-NG');

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8">${baseStyles}</head>
    <body>
      <div class="container">
        <div class="header">
          <div>
            <div class="brand">${businessName ?? 'MyBizTools'}</div>
          </div>
          <div>
            <div class="doc-title">RECEIPT</div>
            <div class="doc-number">${receipt.receiptNumber ?? ''}</div>
          </div>
        </div>
        <hr class="divider" />
        <div class="two-col">
          <div class="col">
            <h4>Received From</h4>
            <p><strong>${receipt.customerName ?? 'N/A'}</strong></p>
            ${receipt.customerEmail ? `<p>${receipt.customerEmail}</p>` : ''}
          </div>
          <div class="col" style="text-align:right;">
            <h4>Receipt Date</h4>
            <p><strong>${receiptDate}</strong></p>
            ${receipt.paymentMethod ? `<p>Payment: ${receipt.paymentMethod}</p>` : ''}
            ${receipt.paymentReference ? `<p>Ref: ${receipt.paymentReference}</p>` : ''}
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th class="text-right">Qty</th>
              <th class="text-right">Unit Price</th>
              <th class="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>
        <div class="totals">
          <div class="totals-row total"><span>Total Paid</span><span>${currency} ${total.toLocaleString()}</span></div>
        </div>
        ${receipt.notes ? `<div class="notes"><h4>Notes</h4><p>${receipt.notes}</p></div>` : ''}
        <div class="footer"><p>Generated by MyBizTools · © ${new Date().getFullYear()}</p></div>
      </div>
    </body>
    </html>
  `;
};

//PDF Generator 

const generatePdf = async (html: string): Promise<Buffer> => {
  // Dynamically import html-pdf-node to avoid issues with ESM
  const htmlPdf = await import('html-pdf-node');

  const options = {
    format: 'A4',
    margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
    printBackground: true,
  };

  const file = { content: html };
  const pdfBuffer = await htmlPdf.default.generatePdf(file, options);
  return Buffer.from(pdfBuffer as unknown as ArrayBuffer);
};


// PUBLIC API

export class PdfService {
  static async generateInvoicePdf(
    invoice: any,
    businessName?: string,
    businessEmail?: string
  ): Promise<ServiceResponse<{ buffer: Buffer; filename: string }>> {
    const html = buildInvoiceHtml(invoice, businessName, businessEmail);
    const buffer = await generatePdf(html);
    return {
      success: true,
      message: 'Invoice PDF generated',
      data: {
        buffer,
        filename: `invoice-${invoice.invoiceNumber ?? Date.now()}.pdf`,
      },
    };
  }

  static async generateQuotationPdf(
    quotation: any,
    businessName?: string
  ): Promise<ServiceResponse<{ buffer: Buffer; filename: string }>> {
    const html = buildQuotationHtml(quotation, businessName);
    const buffer = await generatePdf(html);
    return {
      success: true,
      message: 'Quotation PDF generated',
      data: {
        buffer,
        filename: `quotation-${quotation.quotationNumber ?? Date.now()}.pdf`,
      },
    };
  }

  static async generateReceiptPdf(
    receipt: any,
    businessName?: string
  ): Promise<ServiceResponse<{ buffer: Buffer; filename: string }>> {
    const html = buildReceiptHtml(receipt, businessName);
    const buffer = await generatePdf(html);
    return {
      success: true,
      message: 'Receipt PDF generated',
      data: {
        buffer,
        filename: `receipt-${receipt.receiptNumber ?? Date.now()}.pdf`,
      },
    };
  }
}

export default PdfService;