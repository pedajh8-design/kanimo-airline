'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth-context';
import {
  HelpCircle,
  MessageSquare,
  Send,
  PlusCircle,
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
  Shield,
  LifeBuoy,
} from 'lucide-react';
import AirplaneLandingLoader from '@/components/AirplaneLandingLoader';

export default function SupportPage() {
  const { user, isLoading } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // New Ticket Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('BOOKING_CHANGE');
  const [priority, setPriority] = useState('MEDIUM');
  const [initialMessage, setInitialMessage] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  // New Comment State
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  const fetchTickets = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('kanimo_token') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/support', { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch support tickets');

      const items = data.supportTickets || [];
      setTickets(items);
      if (items.length > 0 && !selectedTicket) {
        setSelectedTicket(items[0]);
      } else if (selectedTicket) {
        const refreshed = items.find((t: any) => t.id === selectedTicket.id);
        if (refreshed) setSelectedTicket(refreshed);
      }
    } catch (err: any) {
      setError(err.message || 'Error loading support tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        fetchTickets();
      } else {
        setLoading(false);
      }
    }
  }, [user, isLoading]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setError('');

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('kanimo_token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/support', {
        method: 'POST',
        headers,
        body: JSON.stringify({ subject, category, priority, initialMessage }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create support ticket');

      setShowCreateModal(false);
      setSubject('');
      setInitialMessage('');
      await fetchTickets();
      setSelectedTicket(data.supportTicket);
    } catch (err: any) {
      setError(err.message || 'Error creating ticket');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedTicket) return;

    setCommentLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('kanimo_token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/support/${selectedTicket.id}/comments`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: newComment }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to post reply');

      setNewComment('');
      fetchTickets();
    } catch (err: any) {
      setError(err.message || 'Error sending reply');
    } finally {
      setCommentLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <AirplaneLandingLoader
        title="Connecting to Kanimo Concierge Desk"
        subtitle="Establishing encrypted passenger support session..."
        fullScreen={true}
      />
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm">
          <LifeBuoy className="w-10 h-10 text-blue-600 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Sign In for Customer Support</h2>
          <p className="text-xs text-slate-600">
            Submit booking requests, special dietary notifications, and track inquiries.
          </p>
          <Link
            href="/login?redirect=/support"
            className="inline-block px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
          >
            Sign In to Support
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <LifeBuoy className="w-5 h-5 text-blue-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Kanimo Concierge Helpdesk
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">Passenger Support Tickets</h1>
            <p className="text-xs text-slate-400">
              Submit requests for flight rescheduling, baggage tracing, dietary meals, and upgrades.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Open Support Ticket</span>
          </button>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Support Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Tickets List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[650px]">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <span className="font-extrabold text-sm text-slate-900">Your Tickets</span>
              <span className="text-xs text-slate-500 font-semibold">{tickets.length} total</span>
            </div>

            <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
              {tickets.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs">No active support inquiries.</p>
                </div>
              ) : (
                tickets.map((t) => {
                  const isSelected = selectedTicket?.id === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTicket(t)}
                      className={`p-4 cursor-pointer transition ${
                        isSelected ? 'bg-blue-50/70 border-l-4 border-blue-600' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-slate-900">{t.ticketCode}</span>
                        <span
                          className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            t.status === 'OPEN'
                              ? 'bg-amber-100 text-amber-800'
                              : t.status === 'RESOLVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{t.subject}</h4>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                        <span>{t.category.replace('_', ' ')}</span>
                        <span>{new Date(t.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Active Conversation */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[650px] overflow-hidden">
            {selectedTicket ? (
              <>
                {/* Thread Header */}
                <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-800">
                        {selectedTicket.ticketCode}
                      </span>
                      <span className="text-xs font-bold text-blue-600 uppercase">
                        {selectedTicket.category.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-400">• Priority: {selectedTicket.priority}</span>
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900 mt-1">{selectedTicket.subject}</h3>
                  </div>

                  <span
                    className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${
                      selectedTicket.status === 'RESOLVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedTicket.status === 'OPEN'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {selectedTicket.status}
                  </span>
                </div>

                {/* Message Stream */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                  {selectedTicket.comments?.map((c: any) => {
                    const isStaff = c.isStaffReply;

                    return (
                      <div
                        key={c.id}
                        className={`flex gap-3 max-w-[85%] ${isStaff ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            isStaff ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'
                          }`}
                        >
                          {isStaff ? 'STAFF' : c.user?.name?.charAt(0) || 'U'}
                        </div>

                        <div className="space-y-1">
                          <div className={`flex items-center gap-2 text-[11px] text-slate-400 ${isStaff ? '' : 'justify-end'}`}>
                            <span className="font-semibold text-slate-700">
                              {isStaff ? `${c.user?.name || 'Kanimo Support Agent'}` : c.user?.name || 'You'}
                            </span>
                            <span>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>

                          <div
                            className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                              isStaff
                                ? 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
                                : 'bg-blue-600 text-white rounded-tr-none shadow-sm'
                            }`}
                          >
                            {c.message}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Comment Reply Input */}
                <form onSubmit={handleSendComment} className="p-3 sm:p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Type your response to the concierge..."
                    className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={commentLoading || !newComment.trim()}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400">
                <p className="text-xs">Select a support ticket from the list or open a new one.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">New Passenger Assistance Request</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subject / Summary *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Dietary meal request for flight KN-101"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="BOOKING_CHANGE">Booking Change</option>
                    <option value="CANCELLATION">Cancellation / Refund</option>
                    <option value="BAGGAGE">Baggage Assistance</option>
                    <option value="SEAT_UPGRADE">Seat Upgrade</option>
                    <option value="PAYMENT">Payment Inquiry</option>
                    <option value="GENERAL">General Assistance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent (Within 24h departure)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Describe your inquiry *
                </label>
                <textarea
                  required
                  rows={4}
                  value={initialMessage}
                  onChange={(e) => setInitialMessage(e.target.value)}
                  placeholder="Provide flight number, booking reference, and details of what you need..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  {createLoading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
