'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth-context';
import {
  Ticket,
  Plane,
  QrCode,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Luggage,
} from 'lucide-react';

export default function WalletPage() {
  const { user, isLoading } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'ISSUED' | 'CHECKED_IN'>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTickets = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('kanimo_token') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/tickets', { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch tickets');
      setTickets(data.tickets || []);
    } catch (err: any) {
      setError(err.message || 'Error loading tickets');
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

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Opening Digital Wallet & Boarding Passes...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm">
          <Ticket className="w-10 h-10 text-blue-600 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Sign In to View Boarding Passes</h2>
          <p className="text-xs text-slate-600">
            Your digital boarding passes are safely stored in your Kanimo Airline passenger wallet.
          </p>
          <Link
            href="/login?redirect=/wallet"
            className="inline-block px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
          >
            Sign In to Wallet
          </Link>
        </div>
      </div>
    );
  }

  const filteredTickets = tickets.filter((t) => {
    if (filter === 'ALL') return true;
    return t.status === filter;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Banner */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                <Ticket className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Passenger Wallet
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">Digital Boarding Passes</h1>
            <p className="text-xs text-slate-400">
              Passes are cryptographically signed with HMAC-SHA256 for instantaneous gate scanning.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filter === 'ALL' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Passes ({tickets.length})
            </button>
            <button
              onClick={() => setFilter('ISSUED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filter === 'ISSUED' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Upcoming ({tickets.filter((t) => t.status === 'ISSUED').length})
            </button>
            <button
              onClick={() => setFilter('CHECKED_IN')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filter === 'CHECKED_IN' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Validated ({tickets.filter((t) => t.status === 'CHECKED_IN').length})
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {filteredTickets.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
              <Plane className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">No boarding passes found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                You haven't booked any flights in this category yet. Explore our scheduled flights to book a trip!
              </p>
            </div>
            <Link
              href="/flights"
              className="inline-block px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
            >
              Explore Flights
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTickets.map((ticket) => {
              const isCheckedIn = ticket.status === 'CHECKED_IN';
              const isCancelled = ticket.status === 'CANCELLED';

              return (
                <div
                  key={ticket.id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-lg transition overflow-hidden flex flex-col justify-between"
                >
                  {/* Top Card Banner */}
                  <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm tracking-wider text-blue-400">
                          {ticket.flight.airline}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono font-bold">
                          {ticket.flight.flightNumber}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{ticket.ticketTier?.name}</p>
                    </div>

                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                        isCheckedIn
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : isCancelled
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      }`}
                    >
                      {isCheckedIn ? 'Checked In' : isCancelled ? 'Void / Cancelled' : 'Ready to Board'}
                    </span>
                  </div>

                  {/* Flight Route Visualizer */}
                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-black text-slate-900">{ticket.flight.originCode}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[120px]">
                          {ticket.flight.originCity}
                        </p>
                      </div>

                      <div className="flex flex-col items-center flex-1 px-4">
                        <span className="text-[10px] font-bold text-slate-400 mb-1">
                          {ticket.flight.duration}
                        </span>
                        <div className="w-full flex items-center gap-1">
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                          <div className="h-0.5 bg-blue-200 flex-1 relative">
                            <Plane className="w-3.5 h-3.5 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-90" />
                          </div>
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-3xl font-black text-slate-900">{ticket.flight.destinationCode}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[120px]">
                          {ticket.flight.destinationCity}
                        </p>
                      </div>
                    </div>

                    {/* Passenger & Seat Details */}
                    <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-center">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Passenger</span>
                        <span className="text-xs font-bold text-slate-800 truncate block">
                          {ticket.passengerName}
                        </span>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Seat</span>
                        <span className="text-sm font-black text-blue-600 block">
                          {ticket.seatNumber}
                        </span>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Gate</span>
                        <span className="text-xs font-bold text-slate-800 block">
                          {ticket.flight.gate || 'TBA'}
                        </span>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Group</span>
                        <span className="text-xs font-bold text-slate-800 block">
                          {ticket.boardingGroup || 'Group B'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer with QR Action */}
                  <div className="bg-slate-50/80 p-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-500 font-semibold">
                      {ticket.ticketNumber}
                    </span>

                    <Link
                      href={`/tickets/${ticket.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition shadow-sm"
                    >
                      <QrCode className="w-3.5 h-3.5 text-blue-400" />
                      <span>View QR Boarding Pass</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
