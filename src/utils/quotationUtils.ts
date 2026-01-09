export const generateQuotationNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `QT-${year}${month}${day}-${random}`;
};

export const calculateQuotationLineTotal = (
  quantity: number,
  unitPrice: number,
  vat: number
): number => {
  const subtotal = quantity * unitPrice;
  const vatAmount = (subtotal * vat) / 100;
  return subtotal + vatAmount;
};

export const generatePublicLink = (quotationId: string): string => {
  const baseUrl = window.location.origin;
  const token = btoa(`${quotationId}-${Date.now()}`);
  return `${baseUrl}/quote/${token}`;
};

export const isQuotationExpired = (validUntil: string): boolean => {
  return new Date(validUntil) < new Date();
};
