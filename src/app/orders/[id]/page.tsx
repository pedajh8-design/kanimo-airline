'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/auth-context';
import {
  Receipt,
  Plane,
  Ticket,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  RotateCcw,
  User,
} from 'lucide-react';

function OrderDetailContent({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNewBooking = searchParams.get('new_booking') === 'true';
  const { user } = useAuth();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundMessage, setRefundMessage] = useState('');

  const fetchOrder = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('kanimo_token') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/orders/${params.id}`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch order');
      setOrder(data.order);
    } catch (err: any) {
      setError(err.message || 'Error loading order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const handleRefund = async () => {
    if (!window.confirm('Are you sure you want to cancel and refund this booking? All issued digital boarding passes will be voided and seats released.')) {
      return;
    }

    setRefundLoading(true);
    setRefundMessage('');
    setError('');

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('kanimo_token') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/orders/${params.id}/refund`, {
        method: 'POST',
        headers,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to refund order');

      setRefundMessage('Booking cancelled and refunded successfully. Seat capacity has been restored.');
      fetchOrder();
    } catch (err: any) {
      setError(err.message || 'Refund request failed');
    } finally {
      setRefundLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Retrieving booking receipt...</p>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-rose-200 text-center space-y-4 shadow-sm">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Order Not Found</h2>
          <p className="text-xs text-slate-600">{error}</p>
          <Link
            href="/orders"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
          >
            ← Return to Orders
          </Link>
        </div>
      </div>
    );
  }

  const isPaid = order.status === 'PAID';
  const isRefunded = order.status === 'REFUNDED';
  const canRefund = isPaid && !order.tickets.some((t: any) => t.status === 'CHECKED_IN' || t.status === 'BOARDED');

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Orders</span>
          </Link>
        </div>

        {/* Success Banner if redirected from checkout */}
        {isNewBooking && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm font-medium shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>
              Congratulations! Your booking and payment was successful. Your digital boarding passes are ready below.
            </span>
          </div>
        )}

        {refundMessage && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-3 text-blue-800 text-sm font-medium shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <span>{refundMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-sm font-medium">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Receipt Container */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs uppercase font-extrabold tracking-wider text-blue-400">
                Official Passenger Receipt
              </span>
              <h1 className="text-2xl font-black">{order.orderNumber}</h1>
              <p className="text-xs text-slate-400">
                Date: {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span
                className={`inline-block text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border ${
                  isPaid
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : isRefunded
                    ? 'bg-slate-700 text-slate-300 border-slate-600'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}
              >
                {order.status}
              </span>
              <p className="text-2xl font-black mt-2">${order.totalAmount} USD</p>
            </div>
          </div>

          {/* Flight Details */}
          <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase">Flight Service</span>
                <p className="text-lg font-black text-slate-900">
                  {order.flight?.airline} • {order.flight?.flightNumber}
                </p>
                <p className="text-xs text-slate-600">Aircraft: {order.flight?.aircraft}</p>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-slate-500 uppercase">Route</span>
                <p className="text-lg font-black text-slate-900">
                  {order.flight?.originCode} → {order.flight?.destinationCode}
                </p>
                <p className="text-xs text-slate-600">
                  Departure: {new Date(order.flight?.departureTime).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Passenger & Ticket Allocation */}
          <div className="p-6 sm:p-8 space-y-6">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              <span>Passengers & Digital Boarding Passes</span>
            </h3>

            <div className="space-y-3">
              {order.items.map((item: any, idx: number) => {
                const ticket = order.tickets.find((t: any) => t.orderItemId === item.id) || item.ticket;

                return (
                  <div
                    key={item.id}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{item.passengerName}</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                          Seat {item.seatNumber || 'Assigned'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {item.ticketTier?.name} • Seat Preference: {item.seatPreference || 'Standard'}
                      </p>
                      {item.passportNumber && (
                        <p className="text-[11px] text-slate-400">ID/Passport: {item.passportNumber}</p>
                      )}
                    </div>

                    <div>
                      {ticket ? (
                        <Link
                          href={`/tickets/${ticket.id}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
                        >
                          <Ticket className="w-3.5 h-3.5 text-blue-400" />
                          <span>View Boarding Pass ({ticket.status})</span>
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-400">Pending issuance</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment & Audit Info */}
          <div className="p-6 sm:p-8 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1 text-xs text-slate-600">
              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>Payment Method: {order.payment?.cardBrand || 'Card'} ending in {order.payment?.cardLast4 || '4242'}</span>
              </p>
              <p className="text-slate-500">Transaction Ref: {order.payment?.providerPaymentId || 'N/A'}</p>
              <p className="text-slate-500">Contact Email: {order.contactEmail}</p>
            </div>

            {/* Refund Action */}
            {canRefund && (
              <div>
                <button
                  type="button"
                  onClick={handleRefund}
                  disabled={refundLoading}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{refundLoading ? 'Cancelling...' : 'Cancel & Refund Order'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <OrderDetailContent params={params} />
    </Suspense>
  );
}
