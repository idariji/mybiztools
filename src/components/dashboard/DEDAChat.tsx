import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, Minimize2, Maximize2 } from 'lucide-react';
import { DEDAI_GREETING } from '../../config/dedaSystemPrompt';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'deda';
  timestamp: Date;
}

export function DEDAChat() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  // Hide widget on non-dashboard pages and on the DEDAI full page
  const shouldHide = !location.pathname.startsWith('/dashboard/') || location.pathname === '/dashboard/dedai';

  useEffect(() => {
    if (isOpen && isFirstVisit) {
      setMessages([{
        id: '1',
        text: DEDAI_GREETING,
        sender: 'deda',
        timestamp: new Date()
      }]);
      setIsFirstVisit(false);
    }
  }, [isOpen, isFirstVisit]);

  const handleSend = () => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');

    // Simulate DEDA response
    setTimeout(() => {
      const dedaResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I understand you need help with that. This is a demo response. In production, I will be powered by advanced AI to provide comprehensive business assistance.',
        sender: 'deda',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, dedaResponse]);
    }, 1000);
  };

  // Return null after all hooks are called
  if (shouldHide) {
    return null;
  }

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-[#FF8A2B] to-[#FF6B00] rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-50"
      >
        <Bot className="w-6 h-6 text-white" />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-gradient-to-r from-[#FF8A2B] to-[#FF6B00] rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">DEDAI Assistant</h3>
                  <p className="text-xs text-white/80">Always here to help</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/dashboard/dedai')}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="Open full screen"
                >
                  <Maximize2 className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <Minimize2 className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                  {msg.sender === 'deda' && (
                    <div className="w-8 h-8 bg-gradient-to-r from-[#FF8A2B] to-[#FF6B00] rounded-full flex items-center justify-center shrink-0">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className={`rounded-2xl p-4 max-w-[80%] ${msg.sender === 'user' ? 'bg-[#FF8A2B] rounded-tr-none' : 'bg-slate-100 rounded-tl-none'}`}>
                    <p className={`text-sm whitespace-pre-wrap ${msg.sender === 'user' ? 'text-white' : 'text-slate-900'}`}>
                      {msg.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask DEDAI anything..."
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#FF8A2B]"
                />
                <button onClick={handleSend} className="p-3 bg-[#FF8A2B] rounded-xl hover:bg-[#FF6B00] transition-colors">
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
