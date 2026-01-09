import { BusinessCard } from '../types/businesscard';

export const shareViaWhatsApp = (card: BusinessCard): void => {
  const text = `Check out my business card!\n\n${card.name}\n${card.title} at ${card.company}\n📧 ${card.email}\n📱 ${card.phone}`;
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
};

export const shareViaEmail = (card: BusinessCard): void => {
  const subject = `Business Card - ${card.name}`;
  const body = `Hi,\n\nHere are my contact details:\n\nName: ${card.name}\nTitle: ${card.title}\nCompany: ${card.company}\nEmail: ${card.email}\nPhone: ${card.phone}${card.website ? `\nWebsite: ${card.website}` : ''}\n\nBest regards,\n${card.name}`;
  window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

export const copyToClipboard = async (text: string): Promise<void> => {
  await navigator.clipboard.writeText(text);
};

export const generateShareableLink = (cardId: string): string => {
  return `${window.location.origin}/card/${cardId}`;
};

export const shareViaFacebook = (url: string): void => {
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
};

export const shareViaTwitter = (text: string, url: string): void => {
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
};
