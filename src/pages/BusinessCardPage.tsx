import React, { useState } from 'react';
import { Download, Save, Upload, Trash2, Copy, Mail, MessageCircle } from 'lucide-react';
import { BusinessCard } from '../types/businesscard';
import { BusinessCardPreview } from '../components/businesscard/BusinessCardPreview';
import { BusinessCardForm } from '../components/businesscard/BusinessCardForm';
import { downloadVCard } from '../utils/businesscardUtils';
import { exportToPNG, exportToJPEG, exportToPDF, exportToSVG } from '../utils/exportUtils';
import { shareViaWhatsApp, shareViaEmail, copyToClipboard } from '../utils/shareUtils';
import { saveTemplate, getTemplates, deleteTemplate, loadTemplate } from '../utils/templateStorage';
import { useToast } from '../utils/useToast';

export const BusinessCardPage: React.FC = () => {
  const { addToast } = useToast();
  const [card, setCard] = useState<BusinessCard>({
    id: Date.now().toString(),
    name: '',
    title: '',
    company: '',
    email: '',
    phone: '',
    template: 'modern',
    primaryColor: '#1e3a8a',
    secondaryColor: '#FF8A2B',
    qrColor: '#000000',
    qrSize: 200,
    qrErrorLevel: 'M',
    qrType: 'vcard',
    createdAt: new Date()
  });
  const [savedTemplates, setSavedTemplates] = useState<any[]>(getTemplates());
  const [showTemplates, setShowTemplates] = useState(false);

  const filename = card.name ? card.name.replace(/\s+/g, '_') : 'BusinessCard';

  const handleExport = async (format: 'png' | 'jpeg' | 'pdf' | 'svg') => {
    try {
      switch (format) {
        case 'png':
          await exportToPNG('business-card-preview', filename);
          addToast('Exported as PNG!', 'success');
          break;
        case 'jpeg':
          await exportToJPEG('business-card-preview', filename);
          addToast('Exported as JPEG!', 'success');
          break;
        case 'pdf':
          await exportToPDF('business-card-preview', filename);
          addToast('Exported as PDF!', 'success');
          break;
        case 'svg':
          await exportToSVG('business-card-preview', filename);
          addToast('Exported as SVG!', 'success');
          break;
      }
    } catch (error) {
      addToast(`Failed to export as ${format.toUpperCase()}`, 'error');
    }
  };

  const handleDownloadVCard = () => {
    downloadVCard(card);
    addToast('vCard downloaded!', 'success');
  };

  const handleSaveTemplate = () => {
    const templateName = prompt('Enter template name:');
    if (templateName) {
      saveTemplate(card, templateName);
      setSavedTemplates(getTemplates());
      addToast('Template saved!', 'success');
    }
  };

  const handleLoadTemplate = (id: string) => {
    const template = loadTemplate(id);
    if (template) {
      setCard({ ...template, id: Date.now().toString(), createdAt: new Date() });
      addToast('Template loaded!', 'success');
      setShowTemplates(false);
    }
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm('Delete this template?')) {
      deleteTemplate(id);
      setSavedTemplates(getTemplates());
      addToast('Template deleted!', 'success');
    }
  };

  const handleShare = (method: 'whatsapp' | 'email' | 'copy') => {
    switch (method) {
      case 'whatsapp':
        shareViaWhatsApp(card);
        addToast('Opening WhatsApp...', 'info');
        break;
      case 'email':
        shareViaEmail(card);
        addToast('Opening email client...', 'info');
        break;
      case 'copy':
        const text = `${card.name}\n${card.title} at ${card.company}\n${card.email} | ${card.phone}`;
        copyToClipboard(text);
        addToast('Copied to clipboard!', 'success');
        break;
    }
  };

  return (
    <div>
        <div className="mb-3 sm:mb-6">
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Business Card & QR Generator</h1>
          <p className="text-xs sm:text-base text-gray-600 mt-1">Create professional business cards with QR codes</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-3 sm:gap-6">
          <div className="bg-white rounded-xl shadow-sm p-3.5 sm:p-6 border border-slate-100">
            <h2 className="text-base sm:text-xl font-semibold mb-3 sm:mb-4">Card Details</h2>
            <BusinessCardForm card={card} onChange={setCard} />
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-3.5 sm:p-6 border border-slate-100">
              <h2 className="text-base sm:text-xl font-semibold mb-3 sm:mb-4">Preview</h2>
              <BusinessCardPreview card={card} />
            </div>

            <div className="bg-white rounded-xl shadow-sm p-3.5 sm:p-6 border border-slate-100">
              <h3 className="text-sm sm:text-base font-semibold mb-2.5 sm:mb-3">Export Formats</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2">
                <button onClick={() => handleExport('png')} className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-xs sm:text-sm font-medium shadow-sm active:scale-95 transition-transform">
                  <Download size={16} /> PNG
                </button>
                <button onClick={() => handleExport('jpeg')} className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-blue-700 text-white rounded-xl hover:bg-blue-800 text-xs sm:text-sm font-medium shadow-sm active:scale-95 transition-transform">
                  <Download size={16} /> JPEG
                </button>
                <button onClick={() => handleExport('pdf')} className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 text-xs sm:text-sm font-medium shadow-sm active:scale-95 transition-transform">
                  <Download size={16} /> PDF
                </button>
                <button onClick={() => handleExport('svg')} className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 text-xs sm:text-sm font-medium shadow-sm active:scale-95 transition-transform">
                  <Download size={16} /> SVG
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-3.5 sm:p-6 border border-slate-100">
              <h3 className="text-sm sm:text-base font-semibold mb-2.5 sm:mb-3">Share & Actions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2">
                <button onClick={() => handleShare('whatsapp')} className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 text-xs sm:text-sm font-medium shadow-sm active:scale-95 transition-transform">
                  <MessageCircle size={16} /> WhatsApp
                </button>
                <button onClick={() => handleShare('email')} className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gray-600 text-white rounded-xl hover:bg-gray-700 text-xs sm:text-sm font-medium shadow-sm active:scale-95 transition-transform">
                  <Mail size={16} /> Email
                </button>
                <button onClick={() => handleShare('copy')} className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gray-700 text-white rounded-xl hover:bg-gray-800 text-xs sm:text-sm font-medium shadow-sm active:scale-95 transition-transform">
                  <Copy size={16} /> Copy
                </button>
                <button onClick={handleDownloadVCard} className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-xs sm:text-sm font-medium shadow-sm active:scale-95 transition-transform">
                  <Download size={16} /> vCard
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-3.5 sm:p-6 border border-slate-100">
              <h3 className="text-sm sm:text-base font-semibold mb-2.5 sm:mb-3">Templates</h3>
              <div className="space-y-2">
                <button onClick={handleSaveTemplate} className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gradient-to-r from-[#FF8A2B] to-[#FF6B00] text-white rounded-xl hover:from-[#FF6B00] hover:to-[#FF8A2B] text-xs sm:text-sm font-medium shadow-sm active:scale-95 transition-all">
                  <Save size={16} /> Save Template
                </button>
                <button onClick={() => setShowTemplates(!showTemplates)} className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gray-600 text-white rounded-xl hover:bg-gray-700 text-xs sm:text-sm font-medium shadow-sm active:scale-95 transition-transform">
                  <Upload size={16} /> Load Template ({savedTemplates.length})
                </button>
              </div>
              {showTemplates && savedTemplates.length > 0 && (
                <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                  {savedTemplates.map((template) => (
                    <div key={template.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                      <button onClick={() => handleLoadTemplate(template.id)} className="flex-1 text-left text-sm hover:text-blue-600">
                        {template.name}
                      </button>
                      <button onClick={() => handleDeleteTemplate(template.id)} className="text-red-600 hover:text-red-700">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};
