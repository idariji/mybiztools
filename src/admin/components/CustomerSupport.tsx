/**
 * Customer Support Component
 * Handle customer feedback, complaints via Email, WhatsApp, and SMS
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Mail,
  Phone,
  Send,
  Search,
  User,
  RefreshCw,
  MessageCircle,
  HeadphonesIcon
} from 'lucide-react';

interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channel: 'email' | 'whatsapp' | 'sms' | 'in_app';
  createdAt: Date;
  updatedAt: Date;
  responses: TicketResponse[];
}

interface TicketResponse {
  id: string;
  message: string;
  sentVia: 'email' | 'whatsapp' | 'sms';
  sentBy: string;
  sentAt: Date;
}

import { API_BASE_URL as API_URL } from '../../config/apiConfig';

export function CustomerSupport() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [replyMessage, setReplyMessage] = useState('');
  const [replyChannel, setReplyChannel] = useState<'email' | 'whatsapp' | 'sms'>('email');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => { fetchTickets(); }, []);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminAuthToken');
      const response = await fetch(`${API_URL}/api/admin/support/tickets`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        const transformedTickets = (data.data?.tickets || []).map((t: any) => ({
          id: t.id,
          userId: t.user_id,
          userName: t.customer_name,
          userEmail: t.customer_email,
          userPhone: t.customer_phone,
          subject: t.subject,
          message: t.message,
          status: t.status,
          priority: t.priority,
          channel: t.channel,
          createdAt: new Date(t.created_at),
          updatedAt: new Date(t.updated_at),
          responses: (t.responses || []).map((r: any) => ({
            id: r.id,
            message: r.message,
            sentVia: r.channel,
            sentBy: r.sender_name,
            sentAt: new Date(r.created_at)
          }))
        }));
        setTickets(transformedTickets);
      } else {
        setTickets([]);
      }
    } catch {
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;
    setIsSending(true);
    try {
      const token = localStorage.getItem('adminAuthToken');
      const response = await fetch(`${API_URL}/api/admin/support/tickets/${selectedTicket.id}/respond`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyMessage, channel: replyChannel })
      });
      if (response.ok) {
        const data = await response.json();
        const newResponse: TicketResponse = {
          id: data.data?.response?.id || `resp-${Date.now()}`,
          message: replyMessage,
          sentVia: replyChannel,
          sentBy: 'Admin',
          sentAt: new Date()
        };
        setSelectedTicket({ ...selectedTicket, responses: [...selectedTicket.responses, newResponse], status: 'in_progress', updatedAt: new Date() });
        setTickets(tickets.map(t =>
          t.id === selectedTicket.id
            ? { ...t, responses: [...t.responses, newResponse], status: 'in_progress' as const, updatedAt: new Date() }
            : t
        ));
        setReplyMessage('');
      }
    } catch { /* ignore */ } finally {
      setIsSending(false);
    }
  };

  const handleUpdateStatus = (ticketId: string, newStatus: SupportTicket['status']) => {
    setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: newStatus, updatedAt: new Date() } : t));
    if (selectedTicket?.id === ticketId) setSelectedTicket({ ...selectedTicket, status: newStatus, updatedAt: new Date() });
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch =
      ticket.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesChannel = channelFilter === 'all' || ticket.channel === channelFilter;
    return matchesSearch && matchesStatus && matchesChannel;
  });

  const getStatusColor = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-emerald-100 text-emerald-800';
      case 'closed': return 'bg-slate-100 text-slate-700';
    }
  };

  const getPriorityColor = (priority: SupportTicket['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-slate-400 text-white';
    }
  };

  const getChannelIcon = (channel: SupportTicket['channel']) => {
    switch (channel) {
      case 'email': return <Mail className="w-3.5 h-3.5" />;
      case 'whatsapp': return <MessageCircle className="w-3.5 h-3.5" />;
      case 'sms': return <Phone className="w-3.5 h-3.5" />;
      case 'in_app': return <MessageSquare className="w-3.5 h-3.5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-200 border-t-[#FF8A2B] rounded-full animate-spin mx-auto mb-2" />
          <p className="text-slate-500 text-sm">Loading support tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-220px)]"
    >
      {/* Ticket List */}
      <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 shrink-0">
          <h2 className="text-base font-bold text-slate-900 pl-3 border-l-4 border-[#FF8A2B] mb-3">
            Support Tickets
            {filteredTickets.length > 0 && (
              <span className="ml-2 text-xs font-semibold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                {filteredTickets.length}
              </span>
            )}
          </h2>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8A2B]/20 focus:border-[#FF8A2B] transition-all"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#FF8A2B]/20 focus:border-[#FF8A2B] transition-all"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#FF8A2B]/20 focus:border-[#FF8A2B] transition-all"
            >
              <option value="all">All Channels</option>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="sms">SMS</option>
              <option value="in_app">In-App</option>
            </select>
          </div>
        </div>

        {/* Ticket List */}
        <div className="flex-1 overflow-y-auto">
          {filteredTickets.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="w-10 h-10 text-slate-200 mx-auto mb-2" />
              <p className="text-slate-400 text-sm font-medium">No tickets found</p>
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`p-4 border-b border-slate-50 cursor-pointer transition-all duration-150 ${
                  selectedTicket?.id === ticket.id
                    ? 'bg-gradient-to-r from-orange-50 to-white border-l-4 border-l-[#FF8A2B]'
                    : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                }`}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    {getChannelIcon(ticket.channel)}
                    <span className="font-semibold text-slate-900 text-sm truncate max-w-[130px]">
                      {ticket.userName}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-800 truncate">{ticket.subject}</p>
                <p className="text-xs text-slate-400 truncate mt-0.5">{ticket.message}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(ticket.status)}`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-400">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Ticket Detail & Reply */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] flex flex-col overflow-hidden">
        {selectedTicket ? (
          <>
            {/* Ticket Header */}
            <div className="p-5 border-b border-slate-100 shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedTicket.subject}</h3>
                  <div className="flex items-center gap-3 mt-1.5 text-sm text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{selectedTicket.userName}</span>
                    <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{selectedTicket.userEmail}</span>
                    {selectedTicket.userPhone && (
                      <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{selectedTicket.userPhone}</span>
                    )}
                  </div>
                </div>
                <select
                  value={selectedTicket.status}
                  onChange={(e) => handleUpdateStatus(selectedTicket.id, e.target.value as SupportTicket['status'])}
                  className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF8A2B]/20 focus:border-[#FF8A2B] transition-all shrink-0"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            {/* Conversation */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Original Message */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-8 h-8 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {selectedTicket.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{selectedTicket.userName}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(selectedTicket.createdAt).toLocaleString()} · via {selectedTicket.channel}
                    </p>
                  </div>
                </div>
                <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">{selectedTicket.message}</p>
              </div>

              {/* Responses */}
              {selectedTicket.responses.map(response => (
                <div key={response.id} className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-4 border border-orange-100 ml-6">
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#FF8A2B] to-[#FF6B00] rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md shadow-orange-500/20 shrink-0">
                      A
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{response.sentBy}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(response.sentAt).toLocaleString()} · via {response.sentVia}
                      </p>
                    </div>
                  </div>
                  <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">{response.message}</p>
                </div>
              ))}
            </div>

            {/* Reply Box */}
            <div className="p-5 border-t border-slate-100 shrink-0">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium text-slate-500">Reply via:</span>
                {(['email', 'whatsapp', 'sms'] as const).map((ch) => {
                  const icons = { email: <Mail className="w-3.5 h-3.5" />, whatsapp: <MessageCircle className="w-3.5 h-3.5" />, sms: <Phone className="w-3.5 h-3.5" /> };
                  const colors = { email: 'from-blue-500 to-blue-600 shadow-blue-500/25', whatsapp: 'from-emerald-500 to-green-600 shadow-green-500/25', sms: 'from-purple-500 to-purple-600 shadow-purple-500/25' };
                  const active = replyChannel === ch;
                  const disabled = ch !== 'email' && !selectedTicket.userPhone;
                  return (
                    <button
                      key={ch}
                      onClick={() => setReplyChannel(ch)}
                      disabled={disabled}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                        active
                          ? `bg-gradient-to-r ${colors[ch]} text-white shadow-lg -translate-y-0.5`
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      {icons[ch]}
                      {ch.charAt(0).toUpperCase() + ch.slice(1)}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-3">
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply..."
                  rows={3}
                  className="flex-1 p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8A2B]/20 focus:border-[#FF8A2B] transition-all resize-none"
                />
                <button
                  onClick={handleSendReply}
                  disabled={!replyMessage.trim() || isSending}
                  className="px-4 bg-gradient-to-r from-[#FF8A2B] to-[#FF6B00] text-white rounded-xl font-semibold shadow-lg shadow-orange-500/25 hover:-translate-y-0.5 hover:shadow-orange-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center gap-2"
                >
                  {isSending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <HeadphonesIcon className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">Select a ticket to view details</p>
              <p className="text-slate-400 text-sm mt-1">Choose from the list on the left</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
