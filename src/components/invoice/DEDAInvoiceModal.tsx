import React, { useState } from 'react';
import { X, Sparkles, Send } from 'lucide-react';
import { Invoice, InvoiceItem } from '../../types/invoice';
import { generateInvoiceNumber, calculateLineTotal } from '../../utils/invoiceUtils';

interface DEDAInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (invoice: Partial<Invoice>) => void;
}

export function DEDAInvoiceModal({ isOpen, onClose, onGenerate }: DEDAInvoiceModalProps) {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const parseInvoiceFromPrompt = (text: string): Partial<Invoice> => {
    const lines = text.toLowerCase();
    
    // Extract client name
    const clientMatch = lines.match(/(?:for|to|client)\s+([a-z\s]+?)(?:\s*[-–—]|\s*,|\s*\.|$)/i);
    const clientName = clientMatch ? clientMatch[1].trim() : '';
    
    // Extract items with quantities and prices
    const items: InvoiceItem[] = [];
    const itemPatterns = [
      /(\d+)\s*(?:x|pcs?|units?|bags?|boxes?)?\s*([a-z\s]+?)\s*(?:at|@|for)?\s*[₦$]?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/gi,
      /([a-z\s]+?)\s*[-–—]\s*[₦$]?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/gi
    ];
    
    itemPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        if (match.length === 4) {
          // Pattern with quantity
          const quantity = parseInt(match[1]);
          const name = match[2].trim();
          const price = parseFloat(match[3].replace(/,/g, ''));
          
          if (name && !name.match(/delivery|shipping|fee|charge/i)) {
            items.push({
              id: Date.now().toString() + Math.random(),
              name: name.charAt(0).toUpperCase() + name.slice(1),
              description: '',
              quantity,
              unitPrice: price,
              discount: 0,
              tax: 0,
              lineTotal: calculateLineTotal(quantity, price, 0, 0)
            });
          }
        } else if (match.length === 3) {
          // Pattern without quantity
          const name = match[1].trim();
          const price = parseFloat(match[2].replace(/,/g, ''));
          
          items.push({
            id: Date.now().toString() + Math.random(),
            name: name.charAt(0).toUpperCase() + name.slice(1),
            description: '',
            quantity: 1,
            unitPrice: price,
            discount: 0,
            tax: 0,
            lineTotal: calculateLineTotal(1, price, 0, 0)
          });
        }
      }
    });
    
    // Extract delivery/shipping fees
    const deliveryMatch = lines.match(/(?:delivery|shipping)\s*(?:fee|charge|cost)?\s*[₦$]?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i);
    const bankCharges = deliveryMatch ? parseFloat(deliveryMatch[1].replace(/,/g, '')) : 0;
    
    return {
      clientInfo: {
        name: clientName.charAt(0).toUpperCase() + clientName.slice(1),
        address: '',
        email: '',
        phone: ''
      },
      items: items.length > 0 ? items : [],
      summary: {
        subtotal: 0,
        totalDiscount: 0,
        totalTax: 0,
        bankCharges,
        vat: 0,
        total: 0,
        amountInWords: ''
      }
    };
  };

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    
    setIsProcessing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const parsedInvoice = parseInvoiceFromPrompt(prompt);
      onGenerate(parsedInvoice);
      setIsProcessing(false);
      setPrompt('');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Generate with DEDA AI</h2>
              <p className="text-sm text-gray-600">Describe your invoice in natural language</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Describe your invoice
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: Create invoice for Tunde - 5 bags of cement at ₦4,500 each, delivery fee ₦10,000"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            rows={6}
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Tips for better results:</h3>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Mention client name: "for John" or "to ABC Company"</li>
            <li>• Include quantities: "5 bags of cement"</li>
            <li>• Specify prices: "at ₦4,500 each" or "₦4,500 per unit"</li>
            <li>• Add delivery fees: "delivery fee ₦10,000"</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isProcessing}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Generate Invoice
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
