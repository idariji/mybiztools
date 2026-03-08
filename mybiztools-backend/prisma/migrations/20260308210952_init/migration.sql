-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "businessName" TEXT,
    "phone" TEXT,
    "avatarUrl" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationToken" TEXT,
    "verificationExpires" TIMESTAMP(3),
    "otpCode" TEXT,
    "otpExpires" TIMESTAMP(3),
    "otpPurpose" TEXT,
    "currentPlan" TEXT NOT NULL DEFAULT 'free',
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "country" TEXT,
    "deviceInfo" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "trialEndDate" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancelledReason" TEXT,
    "mrrValue" BIGINT NOT NULL DEFAULT 0,
    "annualValue" BIGINT NOT NULL DEFAULT 0,
    "isPaused" BOOLEAN NOT NULL DEFAULT false,
    "autoRenew" BOOLEAN NOT NULL DEFAULT true,
    "paymentMethodId" TEXT,
    "lastPaymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "amount" BIGINT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "status" TEXT NOT NULL,
    "stripePaymentId" TEXT,
    "stripeInvoiceId" TEXT,
    "billingPeriodStart" TIMESTAMP(3),
    "billingPeriodEnd" TIMESTAMP(3),
    "failureReason" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "nextRetryAt" TIMESTAMP(3),
    "maxRetriesReached" BOOLEAN NOT NULL DEFAULT false,
    "refundedAmount" BIGINT NOT NULL DEFAULT 0,
    "refundReason" TEXT,
    "refundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefundLog" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "reason" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "adminName" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefundLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManualSubscriptionChange" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "adminName" TEXT NOT NULL,
    "adminRole" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "fromPlan" TEXT,
    "toPlan" TEXT,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "approvedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ManualSubscriptionChange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionalOverride" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "overrideType" TEXT NOT NULL,
    "planOverride" TEXT,
    "discountPercentage" DOUBLE PRECISION,
    "discountAmount" BIGINT,
    "specificFeatures" JSONB,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "reason" TEXT NOT NULL,
    "appliedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromotionalOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageTracking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "featureUsage" JSONB NOT NULL,
    "lastResetDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextResetDate" TIMESTAMP(3) NOT NULL,
    "isOverQuota" BOOLEAN NOT NULL DEFAULT false,
    "warningsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsageTracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AbuseReport" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "evidence" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "flaggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "actionTaken" TEXT,
    "actionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AbuseReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAuditLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "adminName" TEXT NOT NULL,
    "adminRole" TEXT NOT NULL,
    "targetUserId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "changes" JSONB,
    "reason" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminRole" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "permissions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'viewer',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" BIGINT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "storageType" TEXT NOT NULL DEFAULT 'local',
    "category" TEXT NOT NULL DEFAULT 'other',
    "tags" JSONB,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "lastAccessedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Budget" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "period" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "spentAmount" BIGINT NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "alertThreshold" INTEGER NOT NULL DEFAULT 80,
    "alertSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "budgetId" TEXT,
    "amount" BIGINT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "receiptUrl" TEXT,
    "receiptDocumentId" TEXT,
    "paymentMethod" TEXT,
    "vendor" TEXT,
    "expenseDate" TIMESTAMP(3) NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringFrequency" TEXT,
    "status" TEXT NOT NULL DEFAULT 'approved',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "company" TEXT,
    "jobTitle" TEXT,
    "type" TEXT NOT NULL DEFAULT 'customer',
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT DEFAULT 'Nigeria',
    "postalCode" TEXT,
    "taxId" TEXT,
    "website" TEXT,
    "notes" TEXT,
    "tags" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastContactedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contactId" TEXT,
    "invoiceNumber" TEXT NOT NULL,
    "subtotal" BIGINT NOT NULL,
    "taxAmount" BIGINT NOT NULL DEFAULT 0,
    "discountAmount" BIGINT NOT NULL DEFAULT 0,
    "total" BIGINT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "issueDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidDate" TIMESTAMP(3),
    "paymentMethod" TEXT,
    "paymentReference" TEXT,
    "notes" TEXT,
    "terms" TEXT,
    "documentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceItem" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" BIGINT NOT NULL,
    "amount" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quotation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quotationNumber" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT,
    "clientPhone" TEXT,
    "clientAddress" TEXT,
    "subtotal" BIGINT NOT NULL,
    "taxAmount" BIGINT NOT NULL DEFAULT 0,
    "discountAmount" BIGINT NOT NULL DEFAULT 0,
    "total" BIGINT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "issueDate" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "terms" TEXT,
    "publicLink" TEXT,
    "publicLinkExpires" TIMESTAMP(3),
    "documentData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuotationItem" (
    "id" TEXT NOT NULL,
    "quotationId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" BIGINT NOT NULL,
    "amount" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuotationItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Receipt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "receiptNumber" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT,
    "customerPhone" TEXT,
    "subtotal" BIGINT NOT NULL,
    "taxAmount" BIGINT NOT NULL DEFAULT 0,
    "total" BIGINT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "paymentMethod" TEXT,
    "paymentReference" TEXT,
    "receiptDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "documentData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReceiptItem" (
    "id" TEXT NOT NULL,
    "receiptId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" BIGINT NOT NULL,
    "amount" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReceiptItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payslip" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "payslipNumber" TEXT NOT NULL,
    "employeeName" TEXT NOT NULL,
    "employeeId" TEXT,
    "employeeDepartment" TEXT,
    "employeePosition" TEXT,
    "payPeriodStart" TIMESTAMP(3) NOT NULL,
    "payPeriodEnd" TIMESTAMP(3) NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "basicSalary" BIGINT NOT NULL,
    "housingAllowance" BIGINT NOT NULL DEFAULT 0,
    "transportAllowance" BIGINT NOT NULL DEFAULT 0,
    "otherAllowances" BIGINT NOT NULL DEFAULT 0,
    "bonus" BIGINT NOT NULL DEFAULT 0,
    "overtime" BIGINT NOT NULL DEFAULT 0,
    "grossEarnings" BIGINT NOT NULL,
    "payeTax" BIGINT NOT NULL DEFAULT 0,
    "pension" BIGINT NOT NULL DEFAULT 0,
    "nhf" BIGINT NOT NULL DEFAULT 0,
    "loans" BIGINT NOT NULL DEFAULT 0,
    "otherDeductions" BIGINT NOT NULL DEFAULT 0,
    "totalDeductions" BIGINT NOT NULL,
    "netPay" BIGINT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "documentData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payslip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialPost" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mediaUrls" JSONB,
    "platforms" JSONB NOT NULL,
    "scheduledAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'draft',
    "likes" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "reach" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatConversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "context" TEXT,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "tokenUsage" INTEGER NOT NULL DEFAULT 0,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT,
    "channel" TEXT NOT NULL DEFAULT 'email',
    "status" TEXT NOT NULL DEFAULT 'open',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "assignedTo" TEXT,
    "assignedName" TEXT,
    "firstResponseAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportTicketResponse" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "senderType" TEXT NOT NULL,
    "senderId" TEXT,
    "senderName" TEXT NOT NULL,
    "delivered" BOOLEAN NOT NULL DEFAULT false,
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupportTicketResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_verificationToken_key" ON "User"("verificationToken");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_subscriptionStatus_idx" ON "User"("subscriptionStatus");

-- CreateIndex
CREATE INDEX "User_currentPlan_idx" ON "User"("currentPlan");

-- CreateIndex
CREATE INDEX "User_verificationToken_idx" ON "User"("verificationToken");

-- CreateIndex
CREATE INDEX "User_otpCode_idx" ON "User"("otpCode");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "Subscription_planName_idx" ON "Subscription"("planName");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX "Subscription_currentPeriodEnd_idx" ON "Subscription"("currentPeriodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripePaymentId_key" ON "Payment"("stripePaymentId");

-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_createdAt_idx" ON "Payment"("createdAt");

-- CreateIndex
CREATE INDEX "Payment_stripePaymentId_idx" ON "Payment"("stripePaymentId");

-- CreateIndex
CREATE INDEX "RefundLog_paymentId_idx" ON "RefundLog"("paymentId");

-- CreateIndex
CREATE INDEX "ManualSubscriptionChange_userId_idx" ON "ManualSubscriptionChange"("userId");

-- CreateIndex
CREATE INDEX "ManualSubscriptionChange_adminId_idx" ON "ManualSubscriptionChange"("adminId");

-- CreateIndex
CREATE INDEX "ManualSubscriptionChange_action_idx" ON "ManualSubscriptionChange"("action");

-- CreateIndex
CREATE INDEX "PromotionalOverride_userId_idx" ON "PromotionalOverride"("userId");

-- CreateIndex
CREATE INDEX "PromotionalOverride_isActive_idx" ON "PromotionalOverride"("isActive");

-- CreateIndex
CREATE INDEX "PromotionalOverride_endDate_idx" ON "PromotionalOverride"("endDate");

-- CreateIndex
CREATE UNIQUE INDEX "UsageTracking_userId_key" ON "UsageTracking"("userId");

-- CreateIndex
CREATE INDEX "UsageTracking_plan_idx" ON "UsageTracking"("plan");

-- CreateIndex
CREATE INDEX "UsageTracking_isOverQuota_idx" ON "UsageTracking"("isOverQuota");

-- CreateIndex
CREATE INDEX "AbuseReport_userId_idx" ON "AbuseReport"("userId");

-- CreateIndex
CREATE INDEX "AbuseReport_severity_idx" ON "AbuseReport"("severity");

-- CreateIndex
CREATE INDEX "AbuseReport_status_idx" ON "AbuseReport"("status");

-- CreateIndex
CREATE INDEX "AdminAuditLog_adminId_idx" ON "AdminAuditLog"("adminId");

-- CreateIndex
CREATE INDEX "AdminAuditLog_action_idx" ON "AdminAuditLog"("action");

-- CreateIndex
CREATE INDEX "AdminAuditLog_resource_idx" ON "AdminAuditLog"("resource");

-- CreateIndex
CREATE INDEX "AdminAuditLog_createdAt_idx" ON "AdminAuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AdminAuditLog_targetUserId_idx" ON "AdminAuditLog"("targetUserId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminRole_name_key" ON "AdminRole"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE INDEX "Admin_email_idx" ON "Admin"("email");

-- CreateIndex
CREATE INDEX "Admin_role_idx" ON "Admin"("role");

-- CreateIndex
CREATE INDEX "Document_userId_idx" ON "Document"("userId");

-- CreateIndex
CREATE INDEX "Document_category_idx" ON "Document"("category");

-- CreateIndex
CREATE INDEX "Document_createdAt_idx" ON "Document"("createdAt");

-- CreateIndex
CREATE INDEX "Budget_userId_idx" ON "Budget"("userId");

-- CreateIndex
CREATE INDEX "Budget_category_idx" ON "Budget"("category");

-- CreateIndex
CREATE INDEX "Budget_isActive_idx" ON "Budget"("isActive");

-- CreateIndex
CREATE INDEX "Expense_userId_idx" ON "Expense"("userId");

-- CreateIndex
CREATE INDEX "Expense_budgetId_idx" ON "Expense"("budgetId");

-- CreateIndex
CREATE INDEX "Expense_category_idx" ON "Expense"("category");

-- CreateIndex
CREATE INDEX "Expense_expenseDate_idx" ON "Expense"("expenseDate");

-- CreateIndex
CREATE INDEX "Expense_status_idx" ON "Expense"("status");

-- CreateIndex
CREATE INDEX "Contact_userId_idx" ON "Contact"("userId");

-- CreateIndex
CREATE INDEX "Contact_type_idx" ON "Contact"("type");

-- CreateIndex
CREATE INDEX "Contact_isActive_idx" ON "Contact"("isActive");

-- CreateIndex
CREATE INDEX "Contact_email_idx" ON "Contact"("email");

-- CreateIndex
CREATE INDEX "Invoice_userId_idx" ON "Invoice"("userId");

-- CreateIndex
CREATE INDEX "Invoice_contactId_idx" ON "Invoice"("contactId");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

-- CreateIndex
CREATE INDEX "Invoice_dueDate_idx" ON "Invoice"("dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_userId_invoiceNumber_key" ON "Invoice"("userId", "invoiceNumber");

-- CreateIndex
CREATE INDEX "InvoiceItem_invoiceId_idx" ON "InvoiceItem"("invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "Quotation_publicLink_key" ON "Quotation"("publicLink");

-- CreateIndex
CREATE INDEX "Quotation_userId_idx" ON "Quotation"("userId");

-- CreateIndex
CREATE INDEX "Quotation_status_idx" ON "Quotation"("status");

-- CreateIndex
CREATE INDEX "Quotation_publicLink_idx" ON "Quotation"("publicLink");

-- CreateIndex
CREATE UNIQUE INDEX "Quotation_userId_quotationNumber_key" ON "Quotation"("userId", "quotationNumber");

-- CreateIndex
CREATE INDEX "QuotationItem_quotationId_idx" ON "QuotationItem"("quotationId");

-- CreateIndex
CREATE INDEX "Receipt_userId_idx" ON "Receipt"("userId");

-- CreateIndex
CREATE INDEX "Receipt_receiptDate_idx" ON "Receipt"("receiptDate");

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_userId_receiptNumber_key" ON "Receipt"("userId", "receiptNumber");

-- CreateIndex
CREATE INDEX "ReceiptItem_receiptId_idx" ON "ReceiptItem"("receiptId");

-- CreateIndex
CREATE INDEX "Payslip_userId_idx" ON "Payslip"("userId");

-- CreateIndex
CREATE INDEX "Payslip_paymentDate_idx" ON "Payslip"("paymentDate");

-- CreateIndex
CREATE UNIQUE INDEX "Payslip_userId_payslipNumber_key" ON "Payslip"("userId", "payslipNumber");

-- CreateIndex
CREATE INDEX "SocialPost_userId_idx" ON "SocialPost"("userId");

-- CreateIndex
CREATE INDEX "SocialPost_status_idx" ON "SocialPost"("status");

-- CreateIndex
CREATE INDEX "SocialPost_scheduledAt_idx" ON "SocialPost"("scheduledAt");

-- CreateIndex
CREATE INDEX "ChatConversation_userId_idx" ON "ChatConversation"("userId");

-- CreateIndex
CREATE INDEX "ChatConversation_isArchived_idx" ON "ChatConversation"("isArchived");

-- CreateIndex
CREATE INDEX "ChatMessage_conversationId_idx" ON "ChatMessage"("conversationId");

-- CreateIndex
CREATE INDEX "ChatMessage_createdAt_idx" ON "ChatMessage"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SupportTicket_ticketNumber_key" ON "SupportTicket"("ticketNumber");

-- CreateIndex
CREATE INDEX "SupportTicket_userId_idx" ON "SupportTicket"("userId");

-- CreateIndex
CREATE INDEX "SupportTicket_status_idx" ON "SupportTicket"("status");

-- CreateIndex
CREATE INDEX "SupportTicket_priority_idx" ON "SupportTicket"("priority");

-- CreateIndex
CREATE INDEX "SupportTicket_channel_idx" ON "SupportTicket"("channel");

-- CreateIndex
CREATE INDEX "SupportTicket_assignedTo_idx" ON "SupportTicket"("assignedTo");

-- CreateIndex
CREATE INDEX "SupportTicketResponse_ticketId_idx" ON "SupportTicketResponse"("ticketId");

-- CreateIndex
CREATE INDEX "SupportTicketResponse_senderType_idx" ON "SupportTicketResponse"("senderType");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundLog" ADD CONSTRAINT "RefundLog_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManualSubscriptionChange" ADD CONSTRAINT "ManualSubscriptionChange_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionalOverride" ADD CONSTRAINT "PromotionalOverride_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageTracking" ADD CONSTRAINT "UsageTracking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbuseReport" ADD CONSTRAINT "AbuseReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAuditLog" ADD CONSTRAINT "AdminAuditLog_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuotationItem" ADD CONSTRAINT "QuotationItem_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "Quotation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceiptItem" ADD CONSTRAINT "ReceiptItem_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "Receipt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ChatConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicketResponse" ADD CONSTRAINT "SupportTicketResponse_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "SupportTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
