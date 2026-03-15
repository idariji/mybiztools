import React, { useEffect, useState } from 'react';
import { Mail, Phone, Globe, Linkedin, Twitter, Instagram, MessageCircle, Facebook, Youtube, Music, Github } from 'lucide-react';
import { BusinessCard } from '../../types/businesscard';
import { generateQRCode, generateVCard } from '../../utils/businesscardUtils';

interface Props {
  card: BusinessCard;
}

export const BusinessCardPreview: React.FC<Props> = ({ card }) => {
  const [qrCode, setQrCode] = useState('');

  useEffect(() => {
    const vcard = generateVCard(card);
    generateQRCode(vcard, {
      color: { dark: card.qrColor || '#000000', light: '#ffffff' },
      width: card.qrSize || 200,
      errorCorrectionLevel: card.qrErrorLevel || 'M'
    }).then(setQrCode);
  }, [card]);

  const renderModern = () => (
    <div className="relative w-full h-48 sm:h-56 rounded-xl overflow-hidden shadow-lg" style={{ backgroundColor: card.primaryColor }}>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20" />
      <div className="relative h-full p-6 flex flex-col justify-between text-white">
        <div>
          {card.logo && <img src={card.logo} alt="Logo" className="h-10 w-10 object-contain mb-3" />}
          <h3 className="text-2xl font-bold">{card.name}</h3>
          <p className="text-sm opacity-90">{card.title}</p>
          <p className="text-xs opacity-75 mt-1">{card.company}</p>
        </div>
        <div className="flex justify-between items-end">
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2"><Phone size={12} />{card.phone}</div>
            <div className="flex items-center gap-2"><Mail size={12} />{card.email}</div>
          </div>
          {qrCode && <img src={qrCode} alt="QR" className="w-16 h-16 bg-white p-1 rounded" />}
        </div>
      </div>
    </div>
  );

  const renderClassic = () => (
    <div className="w-full h-48 sm:h-56 rounded-xl overflow-hidden shadow-lg bg-white border-2" style={{ borderColor: card.primaryColor }}>
      <div className="h-full p-6 flex flex-col justify-between">
        <div className="text-center">
          {card.logo && <img src={card.logo} alt="Logo" className="h-12 w-12 object-contain mx-auto mb-3" />}
          <h3 className="text-xl font-bold" style={{ color: card.primaryColor }}>{card.name}</h3>
          <p className="text-sm text-gray-600">{card.title}</p>
          <p className="text-xs text-gray-500 mt-1">{card.company}</p>
        </div>
        <div className="flex justify-between items-end">
          <div className="space-y-1 text-xs text-gray-700">
            <div className="flex items-center gap-2"><Phone size={12} />{card.phone}</div>
            <div className="flex items-center gap-2"><Mail size={12} />{card.email}</div>
          </div>
          {qrCode && <img src={qrCode} alt="QR" className="w-14 h-14 border rounded" />}
        </div>
      </div>
    </div>
  );

  const renderMinimal = () => (
    <div className="w-full h-48 sm:h-56 rounded-xl overflow-hidden shadow-lg bg-gray-50">
      <div className="h-full p-6 flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900">{card.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{card.title}</p>
          <div className="mt-4 space-y-1 text-xs text-gray-700">
            <div>{card.phone}</div>
            <div>{card.email}</div>
          </div>
        </div>
        {qrCode && <img src={qrCode} alt="QR" className="w-20 h-20" />}
      </div>
    </div>
  );

  const renderCreative = () => (
    <div className="relative w-full h-48 sm:h-56 rounded-xl overflow-hidden shadow-lg bg-gradient-to-br" style={{ backgroundImage: `linear-gradient(135deg, ${card.primaryColor} 0%, ${card.secondaryColor} 100%)` }}>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full" style={{ backgroundColor: card.secondaryColor, transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full" style={{ backgroundColor: card.primaryColor, transform: 'translate(-30%, 30%)' }} />
      </div>
      <div className="relative h-full p-6 flex flex-col justify-between text-white">
        <div>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold">{card.name}</h3>
              <p className="text-sm opacity-90 mt-1">{card.title}</p>
              <p className="text-xs opacity-75 mt-0.5">{card.company}</p>
            </div>
            {card.logo && <img src={card.logo} alt="Logo" className="h-12 w-12 object-contain bg-white/20 rounded-lg p-1" />}
          </div>
        </div>
        <div className="flex justify-between items-end">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs"><Phone size={12} />{card.phone}</div>
            <div className="flex items-center gap-2 text-xs"><Mail size={12} />{card.email}</div>
            {(card.linkedin || card.twitter || card.instagram || card.whatsapp) && (
              <div className="flex gap-2 mt-2">
                {card.linkedin && <Linkedin size={14} />}
                {card.twitter && <Twitter size={14} />}
                {card.instagram && <Instagram size={14} />}
                {card.whatsapp && <MessageCircle size={14} />}
              </div>
            )}
          </div>
          {qrCode && <img src={qrCode} alt="QR" className="w-16 h-16 bg-white p-1 rounded-lg" />}
        </div>
      </div>
    </div>
  );

  const renderCorporate = () => (
    <div className="w-full h-48 sm:h-56 rounded-xl overflow-hidden shadow-lg bg-white border-l-8" style={{ borderColor: card.primaryColor }}>
      <div className="h-full p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            {card.logo && <img src={card.logo} alt="Logo" className="h-10 w-10 object-contain" />}
            <div className="text-right">
              <h3 className="text-xl font-bold" style={{ color: card.primaryColor }}>{card.name}</h3>
              <p className="text-sm text-gray-600">{card.title}</p>
            </div>
          </div>
          <div className="h-px bg-gray-200 my-3" />
          <p className="text-xs font-semibold text-gray-700">{card.company}</p>
          {card.tagline && <p className="text-xs text-gray-500 italic mt-1">{card.tagline}</p>}
        </div>
        <div className="flex justify-between items-end">
          <div className="space-y-1 text-xs text-gray-700">
            <div className="flex items-center gap-2"><Phone size={11} />{card.phone}</div>
            <div className="flex items-center gap-2"><Mail size={11} />{card.email}</div>
            {card.website && <div className="flex items-center gap-2"><Globe size={11} />{card.website}</div>}
          </div>
          {qrCode && <img src={qrCode} alt="QR" className="w-14 h-14 border rounded" />}
        </div>
      </div>
    </div>
  );

  const renderBold = () => (
    <div className="relative w-full h-48 sm:h-56 rounded-xl overflow-hidden shadow-lg" style={{ backgroundColor: card.secondaryColor }}>
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full" style={{ backgroundColor: card.primaryColor, transform: 'translate(40%, -40%)' }} />
      <div className="relative h-full p-6 flex flex-col justify-between text-white">
        <div>
          <h3 className="text-3xl font-black">{card.name}</h3>
          <p className="text-base font-bold mt-2">{card.title}</p>
          <p className="text-sm mt-1">{card.company}</p>
        </div>
        <div className="flex justify-between items-end">
          <div className="space-y-1 text-sm font-medium">
            <div>{card.phone}</div>
            <div>{card.email}</div>
          </div>
          {qrCode && <img src={qrCode} alt="QR" className="w-16 h-16 bg-white p-1 rounded-lg" />}
        </div>
      </div>
    </div>
  );

  const renderDark = () => (
    <div className="w-full h-48 sm:h-56 rounded-xl overflow-hidden shadow-lg bg-gray-900">
      <div className="h-full p-6 flex flex-col justify-between text-white">
        <div>
          <div className="flex items-center gap-3 mb-4">
            {card.logo && <img src={card.logo} alt="Logo" className="h-12 w-12 object-contain bg-white/10 rounded-lg p-2" />}
            <div>
              <h3 className="text-xl font-bold">{card.name}</h3>
              <p className="text-sm text-gray-400">{card.title}</p>
            </div>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
          <p className="text-xs text-gray-400 mt-3">{card.company}</p>
        </div>
        <div className="flex justify-between items-end">
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2"><Phone size={11} />{card.phone}</div>
            <div className="flex items-center gap-2"><Mail size={11} />{card.email}</div>
          </div>
          {qrCode && <img src={qrCode} alt="QR" className="w-14 h-14 rounded" />}
        </div>
      </div>
    </div>
  );

  const renderSocial = () => (
    <div className="w-full h-48 sm:h-56 rounded-xl overflow-hidden shadow-lg bg-white">
      <div className="h-full flex">
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{card.name}</h3>
            <p className="text-sm text-gray-600">{card.title}</p>
            <p className="text-xs text-gray-500 mt-1">{card.company}</p>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {card.linkedin && <Linkedin size={18} className="text-blue-600" />}
            {card.twitter && <Twitter size={18} className="text-sky-500" />}
            {card.instagram && <Instagram size={18} className="text-pink-600" />}
            {card.facebook && <Facebook size={18} className="text-blue-700" />}
            {card.youtube && <Youtube size={18} className="text-red-600" />}
            {card.tiktok && <Music size={18} className="text-black" />}
            {card.github && <Github size={18} className="text-gray-800" />}
            {card.whatsapp && <MessageCircle size={18} className="text-green-600" />}
          </div>
        </div>
        <div className="w-24 flex items-center justify-center" style={{ backgroundColor: card.primaryColor }}>
          {qrCode && <img src={qrCode} alt="QR" className="w-20 h-20 bg-white p-1 rounded" />}
        </div>
      </div>
    </div>
  );

  const renderPhoto = () => (
    <div className="w-full h-48 sm:h-56 rounded-xl overflow-hidden shadow-lg bg-white">
      <div className="h-full flex">
        <div className="w-32" style={{ backgroundColor: card.primaryColor }}>
          {card.logo ? (
            <img src={card.logo} alt="Photo" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
              {card.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold" style={{ color: card.primaryColor }}>{card.name}</h3>
            <p className="text-sm text-gray-600">{card.title}</p>
            <p className="text-xs text-gray-500 mt-1">{card.company}</p>
          </div>
          <div className="space-y-1 text-xs text-gray-700">
            <div className="flex items-center gap-2"><Phone size={11} />{card.phone}</div>
            <div className="flex items-center gap-2"><Mail size={11} />{card.email}</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderQROnly = () => (
    <div className="w-full h-48 sm:h-56 rounded-xl overflow-hidden shadow-lg bg-gradient-to-br from-white to-gray-50">
      <div className="h-full p-6 flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-2xl font-bold" style={{ color: card.primaryColor }}>{card.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{card.title}</p>
          <p className="text-xs text-gray-500">{card.company}</p>
          <div className="mt-4 space-y-1 text-xs text-gray-700">
            <div>{card.phone}</div>
            <div>{card.email}</div>
          </div>
        </div>
        {qrCode && (
          <div className="flex flex-col items-center">
            <img src={qrCode} alt="QR" className="w-24 h-24 border-4 rounded-lg" style={{ borderColor: card.primaryColor }} />
            <p className="text-xs text-gray-500 mt-2">Scan to connect</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div id="business-card-preview">
      {card.template === 'modern' && renderModern()}
      {card.template === 'classic' && renderClassic()}
      {card.template === 'minimal' && renderMinimal()}
      {card.template === 'creative' && renderCreative()}
      {card.template === 'corporate' && renderCorporate()}
      {card.template === 'bold' && renderBold()}
      {card.template === 'dark' && renderDark()}
      {card.template === 'social' && renderSocial()}
      {card.template === 'photo' && renderPhoto()}
      {card.template === 'qronly' && renderQROnly()}
    </div>
  );
};
