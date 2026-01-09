export interface BusinessCard {
  id: string;
  name: string;
  title: string;
  company: string;
  tagline?: string;
  email: string;
  phone: string;
  secondaryPhone?: string;
  website?: string;
  address?: string;
  logo?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  whatsapp?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
  github?: string;
  template: 'modern' | 'classic' | 'minimal' | 'creative' | 'corporate' | 'bold' | 'dark' | 'social' | 'photo' | 'qronly';
  primaryColor: string;
  secondaryColor: string;
  qrColor?: string;
  qrSize?: number;
  qrErrorLevel?: 'L' | 'M' | 'Q' | 'H';
  qrType?: 'vcard' | 'url' | 'whatsapp' | 'social';
  createdAt: Date;
}

export const CARD_TEMPLATES = [
  { id: 'modern', name: 'Modern', description: 'Clean and contemporary' },
  { id: 'classic', name: 'Classic', description: 'Traditional business style' },
  { id: 'minimal', name: 'Minimal', description: 'Simple and elegant' },
  { id: 'creative', name: 'Creative', description: 'Bold and artistic' },
  { id: 'corporate', name: 'Corporate', description: 'Professional business' },
  { id: 'bold', name: 'Bold', description: 'Eye-catching design' },
  { id: 'dark', name: 'Dark Mode', description: 'Elegant dark theme' },
  { id: 'social', name: 'Social First', description: 'Social media focused' },
  { id: 'photo', name: 'Photo Card', description: 'Photo-centric layout' },
  { id: 'qronly', name: 'QR Focus', description: 'QR code prominent' }
] as const;

export const SOCIAL_PLATFORMS = [
  { id: 'linkedin', name: 'LinkedIn', icon: 'Linkedin', color: '#0A66C2', placeholder: 'linkedin.com/in/username' },
  { id: 'twitter', name: 'Twitter/X', icon: 'Twitter', color: '#1DA1F2', placeholder: '@username' },
  { id: 'instagram', name: 'Instagram', icon: 'Instagram', color: '#E4405F', placeholder: '@username' },
  { id: 'whatsapp', name: 'WhatsApp', icon: 'MessageCircle', color: '#25D366', placeholder: '+234XXXXXXXXXX' },
  { id: 'facebook', name: 'Facebook', icon: 'Facebook', color: '#1877F2', placeholder: 'facebook.com/username' },
  { id: 'youtube', name: 'YouTube', icon: 'Youtube', color: '#FF0000', placeholder: 'youtube.com/@channel' },
  { id: 'tiktok', name: 'TikTok', icon: 'Music', color: '#000000', placeholder: '@username' },
  { id: 'github', name: 'GitHub', icon: 'Github', color: '#181717', placeholder: 'github.com/username' }
] as const;

export const COLOR_PRESETS = [
  { primary: '#1e3a8a', secondary: '#FF8A2B', name: 'MyBizTools' },
  { primary: '#000000', secondary: '#FFD700', name: 'Gold' },
  { primary: '#1F2937', secondary: '#10B981', name: 'Emerald' },
  { primary: '#7C3AED', secondary: '#EC4899', name: 'Purple' }
];
