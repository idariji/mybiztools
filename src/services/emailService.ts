import { Invoice } from '../types/invoice';
import { Receipt } from '../types/receipt';
import { Quotation } from '../types/quotation';
import { Payslip } from '../types/payslip';
import { apiEndpoints } from '../config/apiConfig';
import { authService } from './authService';

// Helper to get authorization header
const getAuthHeader = (): string => {
  const token = authService.getToken();
  return token ? `Bearer ${token}` : '';
};

// ============================================
// EMAIL CONFIGURATION
// ============================================

const EMAIL_COLORS = {
  primary: '#1e3a8a',
  accent: '#FF8A2B',
  background: '#f9fafb',
  text: '#333',
  lightText: '#666',
  border: '#e5e7eb',
};

const EMAIL_STYLES = `
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Arial, sans-serif; 
      line-height: 1.6; 
      color: ${EMAIL_COLORS.text};
      background: #f3f4f6;
    }
    .wrapper { background: #f3f4f6; padding: 20px 0; }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      padding: 0; 
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .header { 
      background: linear-gradient(135deg, ${EMAIL_COLORS.primary} 0%, #2d5a9f 100%); 
      color: white; 
      padding: 30px 20px; 
      text-align: center; 
    }
    .header h1 { font-size: 28px; margin-bottom: 5px; }
    .header p { font-size: 14px; opacity: 0.9; }
    .content { 
      padding: 30px 20px; 
      background: white; 
    }
    .section { margin-bottom: 25px; }
    .section-title { 
      font-size: 16px; 
      font-weight: 600; 
      color: ${EMAIL_COLORS.primary}; 
      margin-bottom: 12px;
      border-bottom: 2px solid ${EMAIL_COLORS.accent};
      padding-bottom: 8px;
    }
    .info-block { 
      background: ${EMAIL_COLORS.background}; 
      padding: 15px; 
      border-radius: 6px;
      margin-bottom: 15px;
      border-left: 4px solid ${EMAIL_COLORS.accent};
    }
    .info-row { 
      display: flex; 
      justify-content: space-between; 
      padding: 8px 0; 
      border-bottom: 1px solid ${EMAIL_COLORS.border};
    }
    .info-row:last-child { border-bottom: none; }
    .info-label { 
      font-weight: 600; 
      color: ${EMAIL_COLORS.primary}; 
      width: 45%;
    }
    .info-value { 
      color: ${EMAIL_COLORS.text}; 
      text-align: right;
      width: 55%;
    }
    .button { 
      display: inline-block; 
      padding: 12px 30px; 
      background: ${EMAIL_COLORS.accent}; 
      color: white; 
      text-decoration: none; 
      border-radius: 6px; 
      margin: 20px 0; 
      font-weight: 600;
      transition: background 0.3s;
    }
    .button:hover { background: #e67e1a; }
    .button-block {
      text-align: center;
      margin: 25px 0;
    }
    .message { 
      white-space: pre-line;
      padding: 15px;
      background: ${EMAIL_COLORS.background};
      border-radius: 6px;
      margin: 15px 0;
    }
    .footer { 
      background: ${EMAIL_COLORS.background};
      padding: 20px; 
      text-align: center; 
      color: ${EMAIL_COLORS.lightText}; 
      font-size: 12px;
      border-top: 1px solid ${EMAIL_COLORS.border};
    }
    .footer p { margin: 5px 0; }
    .divider { 
      height: 1px; 
      background: ${EMAIL_COLORS.border}; 
      margin: 20px 0; 
    }
    table { width: 100%; border-collapse: collapse; }
    th { 
      background: ${EMAIL_COLORS.primary}; 
      color: white; 
      padding: 12px; 
      text-align: left;
    }
    td { 
      padding: 12px; 
      border-bottom: 1px solid ${EMAIL_COLORS.border};
    }
    tr:last-child td { border-bottom: none; }
    .highlight { 
      background: #fef3c7; 
      padding: 2px 6px; 
      border-radius: 3px;
    }
    .success { color: #10b981; font-weight: 600; }
    .warning { color: #f59e0b; font-weight: 600; }
    .error { color: #ef4444; font-weight: 600; }
  </style>
`;

// ============================================
// SEND EMAIL FUNCTIONS
// ============================================

export const sendInvoiceEmail = async (
  invoice: Invoice,
  message: string,
  pdfBlob: Blob
): Promise<boolean> => {
  try {
    const formData = new FormData();
    formData.append('to', invoice.clientInfo.email);
    formData.append('subject', `Invoice #${invoice.invoiceNumber} from ${invoice.businessInfo.name}`);
    formData.append('message', message);
    formData.append('invoice', pdfBlob, `${invoice.invoiceNumber}.pdf`);
    formData.append('businessName', invoice.businessInfo.name);
    formData.append('businessEmail', invoice.businessInfo.email);

    const response = await fetch(apiEndpoints.sendEmail, {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeader(),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('Invoice email error:', error);
    return false;
  }
};

export const sendReceiptEmail = async (
  receipt: Receipt,
  message: string,
  pdfBlob: Blob
): Promise<boolean> => {
  try {
    const formData = new FormData();
    formData.append('to', receipt.customerInfo.email || '');
    formData.append('subject', `Receipt #${receipt.receiptNumber} - Thank You`);
    formData.append('message', message);
    formData.append('receipt', pdfBlob, `${receipt.receiptNumber}.pdf`);
    formData.append('businessName', receipt.businessInfo.name);
    formData.append('businessEmail', receipt.businessInfo.email);

    const response = await fetch(apiEndpoints.sendEmail, {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeader(),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('Receipt email error:', error);
    return false;
  }
};

export const sendQuotationEmail = async (
  quotation: Quotation,
  message: string,
  pdfBlob: Blob
): Promise<boolean> => {
  try {
    const formData = new FormData();
    formData.append('to', quotation.clientInfo.email);
    formData.append('subject', `Quotation #${quotation.quotationNumber} from ${quotation.businessInfo.name}`);
    formData.append('message', message);
    formData.append('quotation', pdfBlob, `${quotation.quotationNumber}.pdf`);
    formData.append('businessName', quotation.businessInfo.name);
    formData.append('businessEmail', quotation.businessInfo.email);

    const response = await fetch(apiEndpoints.sendEmail, {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeader(),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('Quotation email error:', error);
    return false;
  }
};

export const sendPayslipEmail = async (
  payslip: Payslip,
  pdfBlob: Blob
): Promise<boolean> => {
  try {
    const formData = new FormData();
    formData.append('to', payslip.employeeInfo.email);
    formData.append('subject', `Payslip for ${payslip.month} - ${payslip.employeeInfo.name}`);
    formData.append('payslip', pdfBlob, `payslip_${payslip.month}.pdf`);
    formData.append('message', `Attached is your payslip for ${payslip.month}.`);

    const response = await fetch(apiEndpoints.sendEmail, {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeader(),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('Payslip email error:', error);
    return false;
  }
};

export const sendUserRegistrationEmail = async (
  email: string,
  userName: string,
  verificationLink: string
): Promise<boolean> => {
  try {
    const response = await fetch(apiEndpoints.sendEmail, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthHeader(),
      },
      body: JSON.stringify({
        to: email,
        subject: 'Welcome to MyBizTools - Verify Your Email',
        html: generateUserRegistrationTemplate(userName, verificationLink),
      }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('Registration email error:', error);
    return false;
  }
};

export const sendEmailVerificationEmail = async (
  email: string,
  verificationLink: string
): Promise<boolean> => {
  try {
    const response = await fetch(apiEndpoints.sendEmail, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthHeader(),
      },
      body: JSON.stringify({
        to: email,
        subject: 'Verify Your Email Address - MyBizTools',
        html: generateEmailVerificationTemplate(verificationLink),
      }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('Verification email error:', error);
    return false;
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  resetLink: string,
  userName: string
): Promise<boolean> => {
  try {
    const response = await fetch(apiEndpoints.sendEmail, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthHeader(),
      },
      body: JSON.stringify({
        to: email,
        subject: 'Reset Your MyBizTools Password',
        html: generatePasswordResetTemplate(resetLink, userName),
      }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('Password reset email error:', error);
    return false;
  }
};

export const sendPaymentReminderEmail = async (
  email: string,
  clientName: string,
  invoiceNumber: string,
  amount: number | string,
  currency: string,
  daysOverdue: number
): Promise<boolean> => {
  try {
    const response = await fetch(apiEndpoints.sendEmail, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthHeader(),
      },
      body: JSON.stringify({
        to: email,
        subject: `Payment Reminder: Invoice #${invoiceNumber} is ${daysOverdue} Days Overdue`,
        html: generatePaymentReminderTemplate(
          clientName,
          invoiceNumber,
          amount,
          currency,
          daysOverdue
        ),
      }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('Payment reminder email error:', error);
    return false;
  }
};

export const sendInvoiceWhatsApp = (
  invoice: Invoice,
  message: string
): void => {
  const phoneNumber = invoice.clientInfo.phone.replace(/[\s\-\(\)]/g, '');
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  window.open(whatsappUrl, '_blank');
};

// ============================================
// EMAIL TEMPLATE GENERATORS
// ============================================

export const generateEmailTemplate = (invoice: Invoice, message: string): string => {
  const total = (invoice.summary.total || 0).toLocaleString();
  const dueDate = new Date(invoice.dueDate).toLocaleDateString();

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${EMAIL_STYLES}
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <h1>${invoice.businessInfo.name}</h1>
            <p>Invoice Notification</p>
          </div>
          
          <div class="content">
            <div class="section">
              <p>Hello <strong>${invoice.clientInfo.name}</strong>,</p>
              <p style="margin-top: 10px;">Your invoice is now ready. Please review the details below:</p>
            </div>

            <div class="info-block">
              <div class="info-row">
                <span class="info-label">Invoice #</span>
                <span class="info-value">${invoice.invoiceNumber}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Total Amount</span>
                <span class="info-value"><strong>${invoice.currency || 'NGN'} ${total}</strong></span>
              </div>
              <div class="info-row">
                <span class="info-label">Due Date</span>
                <span class="info-value">${dueDate}</span>
              </div>
            </div>

            ${message ? `<div class="message">${message}</div>` : ''}

            <div class="button-block">
              <a href="${window.location.href}" class="button">View Full Invoice</a>
            </div>

            <div class="section">
              <h3 style="color: ${EMAIL_COLORS.primary}; margin-bottom: 10px;">Questions?</h3>
              <p>If you have any questions about this invoice, please don't hesitate to contact us.</p>
            </div>
          </div>

          <div class="footer">
            <p><strong>${invoice.businessInfo.name}</strong></p>
            <p>${invoice.businessInfo.email} | ${invoice.businessInfo.phone}</p>
            <p>Thank you for your business!</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const generateReceiptTemplate = (receipt: Receipt, message: string): string => {
  const total = (receipt.summary?.total || 0).toLocaleString();
  const issueDate = new Date(receipt.receiptDate).toLocaleDateString();

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${EMAIL_STYLES}
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <h1>Payment Receipt</h1>
            <p>Thank you for your payment</p>
          </div>
          
          <div class="content">
            <div class="section">
              <p>Hello <strong>${receipt.customerInfo.name}</strong>,</p>
              <p style="margin-top: 10px;">We have received your payment. Here's your receipt:</p>
            </div>

            <div class="info-block">
              <div class="info-row">
                <span class="info-label">Receipt #</span>
                <span class="info-value">${receipt.receiptNumber}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Date</span>
                <span class="info-value">${issueDate}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Amount Paid</span>
                <span class="info-value"><strong class="success">₦ ${total}</strong></span>
              </div>
            </div>

            ${message ? `<div class="message">${message}</div>` : ''}

            <div class="section">
              <h3 style="color: ${EMAIL_COLORS.primary}; margin-bottom: 10px;">Receipt Details</h3>
              <p>Your receipt is attached to this email. Please keep it for your records.</p>
            </div>
          </div>

          <div class="footer">
            <p><strong>Thank you!</strong></p>
            <p>Your payment has been successfully processed.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const generateQuotationTemplate = (quotation: Quotation, message: string): string => {
  const total = (quotation.summary?.total || 0).toLocaleString();
  const expiryDate = new Date(quotation.validUntil || Date.now()).toLocaleDateString();

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${EMAIL_STYLES}
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <h1>${quotation.businessInfo.name}</h1>
            <p>Quotation</p>
          </div>
          
          <div class="content">
            <div class="section">
              <p>Hello <strong>${quotation.clientInfo.name}</strong>,</p>
              <p style="margin-top: 10px;">We are pleased to provide you with our quotation for your consideration:</p>
            </div>

            <div class="info-block">
              <div class="info-row">
                <span class="info-label">Quotation #</span>
                <span class="info-value">${quotation.quotationNumber}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Total Price</span>
                <span class="info-value"><strong>₦ ${total}</strong></span>
              </div>
              <div class="info-row">
                <span class="info-label">Valid Until</span>
                <span class="info-value">${expiryDate}</span>
              </div>
            </div>

            ${message ? `<div class="message">${message}</div>` : ''}

            <div class="button-block">
              <a href="${window.location.href}" class="button">Review Quotation</a>
            </div>

            <div class="section">
              <h3 style="color: ${EMAIL_COLORS.primary}; margin-bottom: 10px;">Next Steps</h3>
              <p>Please review the attached quotation. If you have any questions or need modifications, feel free to reach out to us.</p>
            </div>
          </div>

          <div class="footer">
            <p><strong>${quotation.businessInfo.name}</strong></p>
            <p>${quotation.businessInfo.email} | ${quotation.businessInfo.phone}</p>
            <p>We look forward to serving you!</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const generatePayslipTemplate = (payslip: Payslip): string => {
  const grossSalary = (payslip.summary?.grossPay || 0).toLocaleString();
  const netSalary = (payslip.summary?.netPay || 0).toLocaleString();
  const deductions = (payslip.summary?.totalDeductions || 0).toLocaleString();

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${EMAIL_STYLES}
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <h1>Payslip</h1>
            <p>${payslip.month}</p>
          </div>
          
          <div class="content">
            <div class="section">
              <p>Hello <strong>${payslip.employeeInfo.name}</strong>,</p>
              <p style="margin-top: 10px;">Your payslip for ${payslip.month} is now available.</p>
            </div>

            <div class="info-block">
              <div class="info-row">
                <span class="info-label">Employee Name</span>
                <span class="info-value">${payslip.employeeInfo.name}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Period</span>
                <span class="info-value">${payslip.month}</span>
              </div>
              <div class="divider" style="margin: 10px 0;"></div>
              <div class="info-row">
                <span class="info-label">Gross Salary</span>
                <span class="info-value">₦ ${grossSalary}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Deductions</span>
                <span class="info-value">₦ ${deductions}</span>
              </div>
              <div class="info-row" style="font-weight: bold; background: ${EMAIL_COLORS.background}; margin: 10px -15px -15px -15px; padding: 10px 15px;">
                <span class="info-label">Net Salary</span>
                <span class="info-value" style="color: ${EMAIL_COLORS.accent};">₦ ${netSalary}</span>
              </div>
            </div>

            <div class="section">
              <p>Your complete payslip is attached to this email. Please keep it for your records.</p>
            </div>
          </div>
          <div class="footer">
            <p><strong>Questions?</strong></p>
            <p>Contact your HR department if you have any questions about your payslip.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const generateUserRegistrationTemplate = (
  userName: string,
  verificationLink: string
): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${EMAIL_STYLES}
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <h1>Welcome to MyBizTools! 🎉</h1>
            <p>Your business operating system awaits</p>
          </div>
          
          <div class="content">
            <div class="section">
              <p>Hello <strong>${userName}</strong>,</p>
              <p style="margin-top: 10px;">Thank you for signing up! We're excited to have you on board.</p>
            </div>

            <div class="info-block">
              <p style="margin-bottom: 15px;"><strong>To complete your registration, please verify your email address:</strong></p>
              <div style="text-align: center; margin: 20px 0;">
                <a href="${verificationLink}" class="button">Verify Email Address</a>
              </div>
              <p style="font-size: 12px; color: ${EMAIL_COLORS.lightText}; margin-top: 15px;">
                Or copy and paste this link in your browser:<br>
                <span style="word-break: break-all;">${verificationLink}</span>
              </p>
            </div>

            <div class="section">
              <h3 style="color: ${EMAIL_COLORS.primary}; margin-bottom: 10px;">What You Can Do with MyBizTools:</h3>
              <ul style="margin-left: 20px; line-height: 1.8;">
                <li>📄 Create professional invoices & receipts</li>
                <li>💰 Track expenses & manage budgets</li>
                <li>🧮 Calculate taxes automatically</li>
                <li>💼 Generate quotations & payslips</li>
                <li>📊 Monitor financial performance</li>
                <li>🤖 Use AI-powered DEDAI assistant</li>
              </ul>
            </div>

            <div class="info-block" style="border-left-color: #f59e0b;">
              <p><strong>⏰ Important:</strong> This verification link expires in 24 hours. Please verify your email soon.</p>
            </div>
          </div>

          <div class="footer">
            <p>If you didn't create this account, please ignore this email.</p>
            <p>© 2025 MyBizTools. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const generateEmailVerificationTemplate = (verificationLink: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${EMAIL_STYLES}
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <h1>Verify Your Email</h1>
            <p>Secure your MyBizTools account</p>
          </div>
          
          <div class="content">
            <div class="section">
              <p>We received a request to verify your email address for your MyBizTools account.</p>
            </div>

            <div class="info-block">
              <p style="margin-bottom: 15px;"><strong>Click the button below to verify your email:</strong></p>
              <div style="text-align: center; margin: 20px 0;">
                <a href="${verificationLink}" class="button">Verify Email</a>
              </div>
              <p style="font-size: 12px; color: ${EMAIL_COLORS.lightText}; margin-top: 15px;">
                If the button doesn't work, copy and paste this link:<br>
                <span style="word-break: break-all;">${verificationLink}</span>
              </p>
            </div>

            <div class="info-block" style="border-left-color: #f59e0b;">
              <p><strong>⏰ This link expires in 24 hours.</strong></p>
              <p>If you didn't request this verification, you can safely ignore this email.</p>
            </div>

            <div class="section">
              <p>Once verified, you'll have full access to all MyBizTools features.</p>
            </div>
          </div>

          <div class="footer">
            <p>© 2025 MyBizTools. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const generatePasswordResetTemplate = (
  resetLink: string,
  userName: string
): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${EMAIL_STYLES}
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <h1>Reset Your Password</h1>
            <p>MyBizTools Account</p>
          </div>
          
          <div class="content">
            <div class="section">
              <p>Hello <strong>${userName}</strong>,</p>
              <p style="margin-top: 10px;">We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
            </div>

            <div class="info-block">
              <p style="margin-bottom: 15px;"><strong>To reset your password, click the button below:</strong></p>
              <div style="text-align: center; margin: 20px 0;">
                <a href="${resetLink}" class="button">Reset Password</a>
              </div>
              <p style="font-size: 12px; color: ${EMAIL_COLORS.lightText}; margin-top: 15px;">
                Or copy and paste this link:<br>
                <span style="word-break: break-all;">${resetLink}</span>
              </p>
            </div>

            <div class="info-block" style="border-left-color: #ef4444;">
              <p><strong>⏰ Security Notice:</strong></p>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>This link expires in 1 hour</li>
                <li>Only click this link if you requested a password reset</li>
                <li>Never share this link with anyone</li>
              </ul>
            </div>

            <div class="section">
              <p>After resetting your password, you'll be able to log in with your new credentials.</p>
            </div>
          </div>

          <div class="footer">
            <p>If you didn't request this password reset, please secure your account immediately.</p>
            <p>© 2025 MyBizTools. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const generatePaymentReminderTemplate = (
  clientName: string,
  invoiceNumber: string,
  amount: number | string,
  currency: string,
  daysOverdue: number
): string => {
  const amountFormatted = typeof amount === 'number' ? amount.toLocaleString() : amount;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${EMAIL_STYLES}
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <h1>Payment Reminder</h1>
            <p>Invoice #${invoiceNumber}</p>
          </div>
          
          <div class="content">
            <div class="section">
              <p>Hello <strong>${clientName}</strong>,</p>
              <p style="margin-top: 10px;">We noticed that your invoice remains unpaid. We kindly request your prompt payment.</p>
            </div>

            <div class="info-block">
              <div class="info-row">
                <span class="info-label">Invoice #</span>
                <span class="info-value">${invoiceNumber}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Outstanding Amount</span>
                <span class="info-value"><strong class="error">${currency} ${amountFormatted}</strong></span>
              </div>
              <div class="info-row">
                <span class="info-label">Days Overdue</span>
                <span class="info-value"><strong class="warning">${daysOverdue} days</strong></span>
              </div>
            </div>

            <div class="button-block">
              <a href="${window.location.href}" class="button">Pay Now</a>
            </div>

            <div class="info-block" style="border-left-color: #f59e0b;">
              <p><strong>⚠️ Important:</strong> Please settle this payment at your earliest convenience to avoid any service interruptions.</p>
            </div>

            <div class="section">
              <h3 style="color: ${EMAIL_COLORS.primary}; margin-bottom: 10px;">Payment Options</h3>
              <p>If you have already made this payment, please disregard this reminder.</p>
              <p>For inquiries about payment terms or assistance, please contact us.</p>
            </div>
          </div>

          <div class="footer">
            <p>Thank you for your prompt attention to this matter.</p>
            <p>© 2025 MyBizTools. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};
