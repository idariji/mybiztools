import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Bot, Send, Paperclip, Command, FileText, Receipt, Calculator, CreditCard, TrendingUp, DollarSign, Calendar, Briefcase, MoreVertical } from 'lucide-react';
import { DEDAI_GREETING, DEDAI_COMMANDS } from '../config/dedaSystemPrompt';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'dedai';
  timestamp: Date;
}

interface Chat {
  id: string;
  title: string;
  timestamp: Date;
  icon: string;
}

const quickTools = [
  { icon: FileText, label: 'Invoice', color: 'text-blue-500' },
  { icon: FileText, label: 'Quotation', color: 'text-teal-500' },
  { icon: Receipt, label: 'Receipt', color: 'text-green-500' },
  { icon: CreditCard, label: 'Payslip', color: 'text-purple-500' },
  { icon: TrendingUp, label: 'Budget', color: 'text-orange-500' },
  { icon: DollarSign, label: 'Cost Manager', color: 'text-red-500' },
  { icon: Calculator, label: 'Tax Calc', color: 'text-indigo-500' },
  { icon: Calendar, label: 'Social Plan', color: 'text-pink-500' },
  { icon: Briefcase, label: 'Business Card', color: 'text-cyan-500' }
];

const workspaceTabs = [
  'General Conversation',
  'Finance & Accounting',
  'Marketing & Content',
  'Operations & Strategy',
  'Documents & Exports'
];

export function DEDAPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [showCommands, setShowCommands] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [chats] = useState<Chat[]>([
    { id: '1', title: 'Invoice for ABC Corp', timestamp: new Date(), icon: '📄' },
    { id: '2', title: 'Tax Calculation Help', timestamp: new Date(), icon: '🧮' },
    { id: '3', title: 'Budget Planning Q1', timestamp: new Date(), icon: '💰' }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{
      id: '1',
      text: DEDAI_GREETING,
      sender: 'dedai' as 'dedai',
      timestamp: new Date()
    }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const dedaResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I understand your request. This is a demo response. In production, I will provide comprehensive business assistance powered by advanced AI.',
        sender: 'dedai' as 'dedai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, dedaResponse]);
    }, 1500);
  };

  const handleQuickAction = (action: string) => {
    setMessage(`Generate ${action.toLowerCase()}`);
  };

  const insertCommand = (cmd: string) => {
    setMessage(cmd + ' ');
    setShowCommands(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-[calc(100vh-160px)]">
      <div className="flex h-full">
        {/* DEDAI Sidebar */}
        <div className="hidden md:flex md:w-[280px] bg-slate-50 border-r border-slate-200 flex-col overflow-y-auto shrink-0">
          {/* Header */}
          <div className="p-3 sm:p-4 border-b border-slate-200 bg-white">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <Bot className="w-6 h-6 sm:w-8 sm:h-8 text-[#FF8A2B]" />
              <div className="min-w-0">
                <h2 className="text-sm sm:text-lg font-bold text-slate-900 truncate">DEDAI</h2>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-slate-500">Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Tools */}
          <div className="p-3 sm:p-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Quick Tools</h3>
            <div className="grid grid-cols-3 gap-2">
              {quickTools.map((tool, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickAction(tool.label)}
                  className="flex flex-col items-center gap-1 p-2 sm:p-3 bg-white rounded-xl hover:shadow-md transition-all border border-slate-100"
                  title={tool.label}
                >
                  <tool.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${tool.color}`} />
                  <span className="text-[9px] sm:text-[10px] font-medium text-slate-600 text-center">{tool.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Workspace Tabs */}
          <div className="p-3 sm:p-4 border-y border-slate-200 bg-white">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">DEDAI Workspace</h3>
            <div className="space-y-1">
              {workspaceTabs.map((tab, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  className={`w-full text-left px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    activeTab === idx
                      ? 'bg-[#FF8A2B] text-white'
                      : 'text-slate-600 hover:bg-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Recent Chats */}
          <div className="p-3 sm:p-4 flex-1">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Recent Chats</h3>
            <div className="space-y-2">
              {chats.map((chat) => (
                <div key={chat.id} className="flex items-center gap-2 p-2 bg-white rounded-lg hover:shadow-sm transition-all cursor-pointer group border border-slate-100">
                  <span className="text-lg sm:text-xl flex-shrink-0">{chat.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-slate-900 truncate">{chat.title}</p>
                    <p className="text-xs text-slate-500">2h ago</p>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <MoreVertical className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Screen */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {/* Mode Badge */}
          <div className="px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
            <p className="text-xs sm:text-sm text-blue-700">
              🔍 <span className="font-semibold">{workspaceTabs[activeTab]}</span> — DEDAI is optimized for this mode
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 bg-slate-50">
            {messages.length === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-orange-50 to-white rounded-xl sm:rounded-2xl p-4 sm:p-8 border border-orange-100 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#FF8A2B] to-[#FF6B00] rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Bot className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-2xl font-bold text-slate-900">Hello, I'm DEDAI</h2>
                    <p className="text-xs sm:text-base text-slate-600">Your Disciplined, Efficient, Determined, Accurate and Intelligent Business Assistant</p>
                  </div>
                </div>
                <p className="text-xs sm:text-base text-slate-700 mb-4 sm:mb-6">How can I help your business today?</p>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setMessage('Generate invoice')} className="px-2 sm:px-4 py-1.5 sm:py-2 bg-white rounded-lg border border-slate-200 hover:border-[#FF8A2B] hover:bg-orange-50 transition-all text-xs sm:text-sm font-medium whitespace-nowrap">
                    ▶ Invoice
                  </button>
                  <button onClick={() => setMessage('Calculate taxes')} className="px-2 sm:px-4 py-1.5 sm:py-2 bg-white rounded-lg border border-slate-200 hover:border-[#FF8A2B] hover:bg-orange-50 transition-all text-xs sm:text-sm font-medium whitespace-nowrap">
                    ▶ Taxes
                  </button>
                  <button onClick={() => setMessage('Create business strategy')} className="px-2 sm:px-4 py-1.5 sm:py-2 bg-white rounded-lg border border-slate-200 hover:border-[#FF8A2B] hover:bg-orange-50 transition-all text-xs sm:text-sm font-medium whitespace-nowrap">
                    ▶ Strategy
                  </button>
                  <button onClick={() => setMessage('Draft social media plan')} className="px-2 sm:px-4 py-1.5 sm:py-2 bg-white rounded-lg border border-slate-200 hover:border-[#FF8A2B] hover:bg-orange-50 transition-all text-xs sm:text-sm font-medium whitespace-nowrap">
                    ▶ Social Media
                  </button>
                </div>
              </motion.div>
            )}

            {messages.map((msg, idx) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}
              >
                {msg.sender === 'dedai' && (
                  <div className="w-10 h-10 bg-gradient-to-br from-[#FF8A2B] to-[#FF6B00] rounded-full flex items-center justify-center shrink-0">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                )}
                <div className={`max-w-[70%] ${msg.sender === 'user' ? 'bg-[#165DFF] text-white rounded-[18px_18px_4px_18px]' : 'bg-white border border-slate-200 text-slate-900 rounded-[18px_18px_18px_4px] shadow-sm'} p-4`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  {msg.sender === 'dedai' && idx > 0 && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                      <button className="text-xs px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">Explain more</button>
                      <button className="text-xs px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">Create PDF</button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#FF8A2B] to-[#FF6B00] rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="bg-white border border-slate-200 rounded-[18px_18px_18px_4px] p-4 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-[#FF8A2B] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-[#FF8A2B] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-[#FF8A2B] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="border-t border-slate-200 bg-white px-3 sm:px-4 py-3 sm:py-4">
            <div className="flex items-end gap-2 sm:gap-3">
              <button className="p-2 sm:p-3 hover:bg-slate-100 rounded-lg sm:rounded-xl transition-colors flex-shrink-0">
                <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
              </button>
              <button onClick={() => setShowCommands(!showCommands)} className="p-2 sm:p-3 hover:bg-slate-100 rounded-lg sm:rounded-xl transition-colors relative flex-shrink-0">
                <Command className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
                {showCommands && (
                  <div className="absolute bottom-full left-0 mb-2 w-56 sm:w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 max-h-64 overflow-y-auto">
                    {DEDAI_COMMANDS.map((cmd, idx) => (
                      <button
                        key={idx}
                        onClick={() => insertCommand(cmd.command)}
                        className="w-full text-left px-2 sm:px-3 py-2 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <p className="text-xs sm:text-sm font-mono text-[#FF8A2B]">{cmd.command}</p>
                        <p className="text-xs text-slate-500 line-clamp-1">{cmd.description}</p>
                      </button>
                    ))}
                  </div>
                )}
              </button>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder="Ask DEDAI… or use /commands"
                rows={1}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#FF8A2B] focus:bg-white resize-none text-xs sm:text-base"
                style={{ maxHeight: '120px' }}
              />
              <button onClick={handleSend} className="p-2 sm:p-3 bg-[#165DFF] hover:bg-[#0047CC] rounded-lg sm:rounded-xl transition-all hover:scale-105 flex-shrink-0">
                <Send className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
