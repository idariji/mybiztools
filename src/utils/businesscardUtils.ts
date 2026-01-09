import QRCode from 'qrcode';

export const generateVCard = (card: any): string => {
  let vcard = `BEGIN:VCARD
VERSION:3.0
FN:${card.name}
TITLE:${card.title}
ORG:${card.company}
TEL:${card.phone}
EMAIL:${card.email}`;
  
  if (card.website) vcard += `\nURL:${card.website}`;
  if (card.address) vcard += `\nADR:;;${card.address};;;;`;
  if (card.linkedin) vcard += `\nX-SOCIALPROFILE;TYPE=linkedin:${card.linkedin}`;
  if (card.twitter) vcard += `\nX-SOCIALPROFILE;TYPE=twitter:${card.twitter}`;
  if (card.instagram) vcard += `\nX-SOCIALPROFILE;TYPE=instagram:${card.instagram}`;
  if (card.whatsapp) vcard += `\nX-SOCIALPROFILE;TYPE=whatsapp:${card.whatsapp}`;
  
  vcard += '\nEND:VCARD';
  return vcard;
};

export const generateQRCode = async (data: string, options?: any): Promise<string> => {
  try {
    return await QRCode.toDataURL(data, {
      width: options?.width || 200,
      margin: 1,
      color: options?.color || { dark: '#000000', light: '#ffffff' },
      errorCorrectionLevel: options?.errorCorrectionLevel || 'M'
    });
  } catch (error) {
    console.error('QR generation failed:', error);
    return '';
  }
};

export const downloadVCard = (card: any) => {
  const vcard = generateVCard(card);
  const blob = new Blob([vcard], { type: 'text/vcard' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${card.name.replace(/\s+/g, '_')}.vcf`;
  a.click();
  URL.revokeObjectURL(url);
};
