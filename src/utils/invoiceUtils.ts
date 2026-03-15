export const generateInvoiceNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `INV-${year}${month}${day}-${random}`;
};

export const numberToWords = (num: number, currency: string = 'NGN'): string => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  const convertHundreds = (n: number): string => {
    let str = '';
    if (n > 99) {
      str += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n > 19) {
      str += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    } else if (n >= 10) {
      str += teens[n - 10] + ' ';
      return str;
    }
    if (n > 0) str += ones[n] + ' ';
    return str;
  };

  const convertToWords = (n: number): string => {
    if (n === 0) return 'Zero';
    let result = '';
    if (n >= 1000000) {
      result += convertHundreds(Math.floor(n / 1000000)) + 'Million ';
      n %= 1000000;
    }
    if (n >= 1000) {
      result += convertHundreds(Math.floor(n / 1000)) + 'Thousand ';
      n %= 1000;
    }
    result += convertHundreds(n);
    return result.trim();
  };

  const whole = Math.floor(num);
  const cents = Math.round((num - whole) * 100);

  const currencyMap: Record<string, { main: string; sub: string }> = {
    NGN: { main: 'Naira', sub: 'Kobo' },
    USD: { main: 'Dollar', sub: 'Cent' },
    GBP: { main: 'Pound', sub: 'Penny' },
    EUR: { main: 'Euro', sub: 'Cent' },
  };

  const names = currencyMap[currency];
  const wholeWords = convertToWords(whole);

  if (names) {
    const centsWords = cents > 0 ? convertToWords(cents) : '';
    return `${wholeWords} ${names.main}${cents > 0 ? `, ${centsWords} ${names.sub}` : ''} Only`;
  } else {
    const centsWords = cents > 0 ? convertToWords(cents) : '';
    return `${wholeWords} ${currency}${cents > 0 ? `, ${centsWords}` : ''} Only`;
  }
};

export const formatCurrency = (amount: number, currencySymbol: string): string => {
  return `${currencySymbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const calculateLineTotal = (
  quantity: number,
  unitPrice: number,
  discount: number,
  tax: number
): number => {
  const subtotal = quantity * unitPrice;
  const discountAmount = (subtotal * discount) / 100;
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = (afterDiscount * tax) / 100;
  return afterDiscount + taxAmount;
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
