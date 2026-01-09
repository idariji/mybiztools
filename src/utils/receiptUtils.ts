export const generateReceiptNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `RCPT-${year}${month}${day}-${random}`;
};

export const calculateReceiptLineTotal = (quantity: number, unitPrice: number): number => {
  return quantity * unitPrice;
};
