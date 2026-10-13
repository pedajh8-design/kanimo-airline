'use client';

import React, { useState, useEffect } from 'react';
import {
  LifeBuoy,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Shield,
} from 'lucide-react';

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  const fetchTickets = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('kanimo_token') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/support', { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch tickets');

      const items = data.supportTickets || [];
      setTickets(items);
      if (items.length > 0 && !selectedTicket) {
        setSelectedTicket(items[0]);
      } else if (selectedTicket) {
        const found = items.find((t: any) => t.id === selectedTicket.id);
        if (found) setSelectedTicket(found);
      }
    } catch (err: any) {
      setError(err.message || 'Error loading support');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;

    setReplyLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('kanimo_token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/support/${selectedTicket.id}/comments`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: replyMessage }),
      });

      if (!res.ok) throw new Error('Failed to send reply');

      setReplyMessage('');
      fetchTickets();
    } catch (err: any) {
      alert(err.message || 'Failed to post reply');
    } finally {
      setReplyLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedTicket) return;
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('kanimo_token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/support/${selectedTicket.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      fetchTickets();
    } catch (err: any) {
      alert(err.message || 'Failed to update ticket status');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Passenger Concierge Desk
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
            Support Requests & Inquiries
          </h1>
          <p className="text-xs text-slate-400">
            Handle inquiries for baggage assistance, flight changes, upgrades, and meal requests.
          </p>
        </div>

        <span className="px-4 py-2 rounded-2xl bg-slate-800 text-amber-300 border border-slate-700 text-xs font-bold">
          {tickets.filter((t) => t.status !== 'RESOLVED' && t.status !== 'CLOSED').length} Open Inquiries
        </span>
      </div>

      {/* Main Support Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left List */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col h-[650px]">
          <div className="p-4 border-b border-slate-800 bg-slate-950 font-bold text-xs text-slate-300">
            All Passenger Tickets ({tickets.length})
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800">
            {tickets.map((t) => {
              const isSelected = selectedTicket?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className={`p-4 cursor-pointer transition ${
                    isSelected ? 'bg-amber-500/10 border-l-4 border-amber-500' : 'hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-white">{t.ticketCode}</span>
                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        t.status === 'RESOLVED'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : t.status === 'OPEN'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-blue-950 text-blue-400 border border-blue-800'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{t.subject}</h4>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2">
                    <span className="text-slate-400">{t.user?.name || 'Customer'}</span>
                    <span>{new Date(t.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Active Ticket Detail */}
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col h-[650px] overflow-hidden">
          {selectedTicket ? (
            <>
              {/* Header */}
              <div className="p-5 border-b border-slate-800 bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400">{selectedTicket.ticketCode}</span>
                    <span className="text-xs font-bold text-slate-400 uppercase">
                      {selectedTicket.category.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-500">• From: {selectedTicket.user?.name} ({selectedTicket.user?.email})</span>
                  </div>
                  <h3 className="text-base font-extrabold text-white mt-1">{selectedTicket.subject}</h3>
                </div>

                {/* Status Switcher */}
                <div className="flex items-center gap-2">
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleUpdateStatus(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-xs rounded-xl px-3 py-1.5 text-white font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="OPEN">Status: OPEN</option>
                    <option value="IN_PROGRESS">Status: IN PROGRESS</option>
                    <option value="RESOLVED">Status: RESOLVED</option>
                    <option value="CLOSED">Status: CLOSED</option>
                  </select>
                </div>
              </div>

              {/* Message Thread */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {selectedTicket.comments?.map((c: any) => {
                  const isStaff = c.isStaffReply;

                  return (
                    <div
                      key={c.id}
                      className={`flex gap-3 max-w-[85%] ${isStaff ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          isStaff ? 'bg-amber-500 text-slate-950' : 'bg-blue-600 text-white'
                        }`}
                      >
                        {isStaff ? 'STAFF' : c.user?.name?.charAt(0) || 'C'}
                      </div>

                      <div className="space-y-1">
                        <div className={`flex items-center gap-2 text-[11px] text-slate-400 ${isStaff ? 'justify-end' : ''}`}>
                          <span className="font-semibold text-slate-300">
                            {isStaff ? 'Staff Response' : c.user?.name || 'Customer'}
                          </span>
                          <span>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>

                        <div
                          className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                            isStaff
                              ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30 rounded-tr-none'
                              : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                          }`}
                        >
                          {c.message}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Staff Reply Bar */}
              <form onSubmit={handleSendReply} className="p-4 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
                <input
                  type="text"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Respond to passenger as Kanimo Operations Agent..."
                  className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="submit"
                  disabled={replyLoading || !replyMessage.trim()}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Staff Reply</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-slate-500 text-xs">
              Select a customer inquiry to view the conversation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
