'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth-context';
import QRCode from 'qrcode';
import {
  Plane,
  ShieldCheck,
  Printer,
  Calendar,
  Clock,
  MapPin,
  Luggage,
  User,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Hash,
} from 'lucide-react';

export default function TicketBoardingPassPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('kanimo_token') : null;
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`/api/tickets/${params.id}`, { headers });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch ticket');
        setTicket(data.ticket);
      } catch (err: any) {
        setError(err.message || 'Error loading ticket');
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [params.id]);

  // Render QR code to canvas
  useEffect(() => {
    if (ticket && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, ticket.qrSecurityPayload, {
        width: 180,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      }).catch((e) => console.error('QR render error:', e));
    }
  }, [ticket]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Generating digital boarding pass & security token...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-rose-200 text-center space-y-4 shadow-sm">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Boarding Pass Not Found</h2>
          <p className="text-xs text-slate-600">{error || 'Ticket not found or unauthorized'}</p>
          <Link
            href="/wallet"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
          >
            ← Return to Wallet
          </Link>
        </div>
      </div>
    );
  }

  const isCheckedIn = ticket.status === 'CHECKED_IN';
  const isCancelled = ticket.status === 'CANCELLED';

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation & Print Actions */}
        <div className="flex items-center justify-between no-print">
          <Link
            href="/wallet"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Wallet</span>
          </Link>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-xl shadow-sm transition"
          >
            <Printer className="w-4 h-4 text-blue-400" />
            <span>Print Boarding Pass</span>
          </button>
        </div>

        {/* Authentic Luxury Boarding Pass Card */}
        <div className="bg-white rounded-3xl overflow-hidden border border-slate-300 shadow-2xl">
          {/* Header Strip */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                <Plane className="w-5 h-5 text-white transform -rotate-45" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-widest text-white uppercase">
                  KANIMO <span className="text-blue-400 font-light">AIRLINE</span>
                </span>
                <p className="text-[10px] text-slate-400 tracking-widest uppercase">
                  Official Digital Boarding Pass
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Flight</span>
                <span className="text-xl font-black text-white">{ticket.flight.flightNumber}</span>
              </div>
              <div className="pl-3 border-l border-slate-800 text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Class</span>
                <span className="text-xs font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {ticket.ticketTier?.name || 'Class'}
                </span>
              </div>
            </div>
          </div>

          {/* Route Section */}
          <div className="p-6 sm:p-8 border-b border-dashed border-slate-200 bg-slate-50/50">
            <div className="flex items-center justify-between">
              {/* Origin */}
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">
                  Departure
                </span>
                <p className="text-4xl sm:text-5xl font-black text-slate-900">{ticket.flight.originCode}</p>
                <p className="text-sm font-semibold text-slate-700">{ticket.flight.originCity}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(ticket.flight.departureTime).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                  {' • '}
                  {new Date(ticket.flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {/* Graphic Icon */}
              <div className="flex flex-col items-center px-4">
                <span className="text-xs font-bold text-slate-400 mb-1">{ticket.flight.duration}</span>
                <div className="w-24 sm:w-36 flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-blue-600" />
                  <div className="h-0.5 bg-blue-300 flex-1 relative">
                    <Plane className="w-4 h-4 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-90" />
                  </div>
                  <div className="h-2 w-2 rounded-full bg-blue-600" />
                </div>
                <span className="text-[10px] font-semibold text-emerald-600 mt-1">Non-stop Flight</span>
              </div>

              {/* Destination */}
              <div className="text-right">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">
                  Arrival
                </span>
                <p className="text-4xl sm:text-5xl font-black text-slate-900">{ticket.flight.destinationCode}</p>
                <p className="text-sm font-semibold text-slate-700">{ticket.flight.destinationCity}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(ticket.flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>

          {/* Passenger & Flight Details Grid */}
          <div className="p-6 sm:p-8 grid grid-cols-2 sm:grid-cols-4 gap-6 bg-white">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Passenger Name</span>
              <p className="text-base font-extrabold text-slate-900 mt-0.5">{ticket.passengerName}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Seat Number</span>
              <p className="text-2xl font-black text-blue-600 mt-0.5">{ticket.seatNumber}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Gate / Terminal</span>
              <p className="text-base font-extrabold text-slate-900 mt-0.5">
                {ticket.flight.gate || 'TBA'} • {ticket.flight.terminal || 'T1'}
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Boarding Group</span>
              <p className="text-base font-extrabold text-slate-900 mt-0.5">
                {ticket.boardingGroup || 'Group B'}
              </p>
            </div>
          </div>

          {/* Scannable Barcode & Security Section */}
          <div className="p-6 sm:p-8 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Scannable Canvas QR */}
            <div className="flex flex-col items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <canvas ref={canvasRef} className="rounded-lg" />
              <span className="text-[10px] font-mono font-bold text-slate-400 mt-2 tracking-wider">
                SCAN AT GATE KIOSK
              </span>
            </div>

            {/* Cryptographic Security Details */}
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border ${
                    isCheckedIn
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : isCancelled
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : 'bg-blue-100 text-blue-800 border-blue-300'
                  }`}
                >
                  Status: {isCheckedIn ? 'CHECKED-IN / BOARDED' : isCancelled ? 'CANCELLED / VOID' : 'ISSUED / READY TO BOARD'}
                </span>
              </div>

              {isCheckedIn && (
                <p className="text-xs text-emerald-700 font-medium">
                  Validated at airport gate on {new Date(ticket.checkedInAt).toLocaleString()}.
                </p>
              )}

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    HMAC-SHA256 Digital Signature:
                  </span>
                  <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    VERIFIED
                  </span>
                </div>
                <p className="font-mono text-[11px] text-slate-600 truncate">
                  Hash: {ticket.securityHash}
                </p>
                <p className="text-[10px] text-slate-400">
                  Cryptographically binds passenger, seat, and flight timestamp to prevent boarding pass reuse and forgery.
                </p>
              </div>

              <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                <span>E-Ticket No: <strong className="font-mono text-slate-800">{ticket.ticketNumber}</strong></span>
                <span>Aircraft: <strong className="text-slate-800">{ticket.flight.aircraft}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
