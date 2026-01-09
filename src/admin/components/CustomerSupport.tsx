/**
 * Customer Support Component
 * Handle customer feedback, complaints via Email, WhatsApp, and SMS
 */

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Mail,
  Phone,
  Send,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  RefreshCw,
  ChevronDown,
  MessageCircle
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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      // Try to fetch from API
      const token = localStorage.getItem('adminAuthToken');
      const response = await fetch(`${API_URL}/api/admin/support/tickets`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Transform API data to match component interface
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
        // No tickets available - show empty state
        setTickets([]);
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
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

      // Use the new support ticket respond endpoint
      const response = await fetch(`${API_URL}/api/admin/support/tickets/${selectedTicket.id}/respond`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: replyMessage,
          channel: replyChannel
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Add response to ticket using returned data
        const newResponse: TicketResponse = {
          id: data.data?.response?.id || `resp-${Date.now()}`,
          message: replyMessage,
          sentVia: replyChannel,
          sentBy: 'Admin',
          sentAt: new Date()
        };

        setSelectedTicket({
          ...selectedTicket,
          responses: [...selectedTicket.responses, newResponse],
          status: 'in_progress',
          updatedAt: new Date()
        });

        setTickets(tickets.map(t =>
          t.id === selectedTicket.id
            ? { ...t, responses: [...t.responses, newResponse], status: 'in_progress' as const, updatedAt: new Date() }
            : t
        ));

        setReplyMessage('');

        // Check delivery status
        if (data.data?.delivered) {
          alert(`Reply sent successfully via ${replyChannel}!`);
        } else if (data.data?.deliveryError) {
          alert(`Reply saved but delivery failed: ${data.data.deliveryError}`);
        } else {
          alert(`Reply sent via ${replyChannel}!`);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to send reply: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to send reply:', error);
      alert('Failed to send reply. Please check your connection and try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleUpdateStatus = (ticketId: string, newStatus: SupportTicket['status']) => {
    setTickets(tickets.map(t =>
      t.id === ticketId ? { ...t, status: newStatus, updatedAt: new Date() } : t
    ));
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, status: newStatus, updatedAt: new Date() });
    }
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
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: SupportTicket['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-gray-400 text-white';
    }
  };

  const getChannelIcon = (channel: SupportTicket['channel']) => {
    switch (channel) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'whatsapp': return <MessageCircle className="w-4 h-4" />;
      case 'sms': return <Phone className="w-4 h-4" />;
      case 'in_app': return <MessageSquare className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Loading support tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      {/* Ticket List */}
      <div className="lg:col-span-1 bg-white rounded-lg border border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Support Tickets</h2>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <div className="p-4 text-center text-gray-500">
              No tickets found
            </div>
          ) : (
            filteredTickets.map(ticket => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedTicket?.id === ticket.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getChannelIcon(ticket.channel)}
                    <span className="font-medium text-gray-900 text-sm truncate max-w-[150px]">
                      {ticket.userName}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-800 truncate">{ticket.subject}</p>
                <p className="text-xs text-gray-500 truncate mt-1">{ticket.message}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(ticket.status)}`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Ticket Detail & Reply */}
      <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 flex flex-col">
        {selectedTicket ? (
          <>
            {/* Ticket Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedTicket.subject}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {selectedTicket.userName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {selectedTicket.userEmail}
                    </span>
                    {selectedTicket.userPhone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {selectedTicket.userPhone}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleUpdateStatus(selectedTicket.id, e.target.value as SupportTicket['status'])}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Conversation */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Original Message */}
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {selectedTicket.userName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{selectedTicket.userName}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(selectedTicket.createdAt).toLocaleString()} via {selectedTicket.channel}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedTicket.message}</p>
              </div>

              {/* Responses */}
              {selectedTicket.responses.map(response => (
                <div key={response.id} className="bg-blue-50 rounded-lg p-4 ml-8">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      A
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{response.sentBy}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(response.sentAt).toLocaleString()} via {response.sentVia}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{response.message}</p>
                </div>
              ))}
            </div>

            {/* Reply Box */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-gray-600">Reply via:</span>
                <button
                  onClick={() => setReplyChannel('email')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm ${
                    replyChannel === 'email' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Mail className="w-4 h-4" /> Email
                </button>
                <button
                  onClick={() => setReplyChannel('whatsapp')}
                  disabled={!selectedTicket.userPhone}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm ${
                    replyChannel === 'whatsapp' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${!selectedTicket.userPhone ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </button>
                <button
                  onClick={() => setReplyChannel('sms')}
                  disabled={!selectedTicket.userPhone}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm ${
                    replyChannel === 'sms' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${!selectedTicket.userPhone ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Phone className="w-4 h-4" /> SMS
                </button>
              </div>
              <div className="flex gap-2">
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply..."
                  rows={3}
                  className="flex-1 p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <button
                  onClick={handleSendReply}
                  disabled={!replyMessage.trim() || isSending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Select a ticket to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
