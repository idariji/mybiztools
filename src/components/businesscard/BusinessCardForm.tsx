import React from 'react';
import { Linkedin, Twitter, Instagram, MessageCircle, Facebook, Youtube, Music, Github } from 'lucide-react';
import { BusinessCard, CARD_TEMPLATES, COLOR_PRESETS, SOCIAL_PLATFORMS } from '../../types/businesscard';

interface Props {
  card: BusinessCard;
  onChange: (card: BusinessCard) => void;
}

export const BusinessCardForm: React.FC<Props> = ({ card, onChange }) => {
  const handleChange = (field: keyof BusinessCard, value: any) => {
    onChange({ ...card, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
        <input
          type="text"
          value={card.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
        <input
          type="text"
          value={card.title}
          onChange={(e) => handleChange('title', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
        <input
          type="text"
          value={card.company}
          onChange={(e) => handleChange('company', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
        <input
          type="text"
          value={card.tagline || ''}
          onChange={(e) => handleChange('tagline', e.target.value)}
          placeholder="Your professional tagline"
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
        <input
          type="email"
          value={card.email}
          onChange={(e) => handleChange('email', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
          <input
            type="tel"
            value={card.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Phone</label>
          <input
            type="tel"
            value={card.secondaryPhone || ''}
            onChange={(e) => handleChange('secondaryPhone', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
          <input
            type="url"
            value={card.website || ''}
            onChange={(e) => handleChange('website', e.target.value)}
            placeholder="https://example.com"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input
            type="text"
            value={card.address || ''}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="City, Country"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Social Media</label>
        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center gap-2">
            <Linkedin size={16} className="text-blue-600" />
            <input
              type="text"
              value={card.linkedin || ''}
              onChange={(e) => handleChange('linkedin', e.target.value)}
              placeholder="linkedin.com/in/username"
              className="flex-1 px-2 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Twitter size={16} className="text-sky-500" />
            <input
              type="text"
              value={card.twitter || ''}
              onChange={(e) => handleChange('twitter', e.target.value)}
              placeholder="@username"
              className="flex-1 px-2 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Instagram size={16} className="text-pink-600" />
            <input
              type="text"
              value={card.instagram || ''}
              onChange={(e) => handleChange('instagram', e.target.value)}
              placeholder="@username"
              className="flex-1 px-2 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <MessageCircle size={16} className="text-green-600" />
            <input
              type="text"
              value={card.whatsapp || ''}
              onChange={(e) => handleChange('whatsapp', e.target.value)}
              placeholder="+234XXXXXXXXXX"
              className="flex-1 px-2 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Facebook size={16} className="text-blue-700" />
            <input
              type="text"
              value={card.facebook || ''}
              onChange={(e) => handleChange('facebook', e.target.value)}
              placeholder="facebook.com/username"
              className="flex-1 px-2 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Youtube size={16} className="text-red-600" />
            <input
              type="text"
              value={card.youtube || ''}
              onChange={(e) => handleChange('youtube', e.target.value)}
              placeholder="youtube.com/@channel"
              className="flex-1 px-2 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Music size={16} className="text-black" />
            <input
              type="text"
              value={card.tiktok || ''}
              onChange={(e) => handleChange('tiktok', e.target.value)}
              placeholder="@username"
              className="flex-1 px-2 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Github size={16} className="text-gray-800" />
            <input
              type="text"
              value={card.github || ''}
              onChange={(e) => handleChange('github', e.target.value)}
              placeholder="github.com/username"
              className="flex-1 px-2 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
        <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
          {CARD_TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => handleChange('template', template.id)}
              className={`p-2 border rounded-lg text-sm transition-all ${
                card.template === template.id ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="font-medium text-xs">{template.name}</div>
              <div className="text-xs text-gray-500">{template.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Color Scheme</label>
        <div className="grid grid-cols-4 gap-2">
          {COLOR_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                handleChange('primaryColor', preset.primary);
                handleChange('secondaryColor', preset.secondary);
              }}
              className="h-12 rounded-lg border-2 border-gray-300 hover:border-gray-400 flex"
            >
              <div className="flex-1" style={{ backgroundColor: preset.primary }} />
              <div className="flex-1" style={{ backgroundColor: preset.secondary }} />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">QR Code Settings</label>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">QR Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={card.qrColor || '#000000'}
                onChange={(e) => handleChange('qrColor', e.target.value)}
                className="w-12 h-10 rounded border cursor-pointer"
              />
              <input
                type="text"
                value={card.qrColor || '#000000'}
                onChange={(e) => handleChange('qrColor', e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Error Correction</label>
            <select
              value={card.qrErrorLevel || 'M'}
              onChange={(e) => handleChange('qrErrorLevel', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="L">Low (7%)</option>
              <option value="M">Medium (15%)</option>
              <option value="Q">Quartile (25%)</option>
              <option value="H">High (30%)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
