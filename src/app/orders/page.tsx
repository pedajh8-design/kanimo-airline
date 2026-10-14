'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth-context';
import {
  Luggage,
  Plane,
  Clock,
  ArrowRight,
  AlertCircle,
  Receipt,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import AirplaneLandingLoader from '@/components/AirplaneLandingLoader';

export default function OrdersPage() {
  const { user, isLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('kanimo_token') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/orders', { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch orders');
      setOrders(data.orders || []);
    } catch (err: any) {
      setError(err.message || 'Error loading orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        fetchOrders();
      } else {
        setLoading(false);
      }
    }
  }, [user, isLoading]);

  if (isLoading || loading) {
    return (
      <AirplaneLandingLoader
        title="Retrieving Orders & Digital Boarding Passes"
        subtitle="Connecting to Kanimo satellite ledger..."
        fullScreen={true}
      />
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm">
          <Luggage className="w-10 h-10 text-blue-600 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Sign In to View Orders</h2>
          <p className="text-xs text-slate-600">
            Access your passenger receipts, transaction records, and tax invoices.
          </p>
          <Link
            href="/login?redirect=/orders"
            className="inline-block px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
          >
            Sign In to Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Purchases & Invoices
            </span>
            <h1 className="text-2xl sm:text-3xl font-black">Booking History</h1>
            <p className="text-xs text-slate-400">
              Review your completed reservations, payment methods, and receipts.
            </p>
          </div>
          <div className="hidden sm:block">
            <span className="px-4 py-2 rounded-2xl bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold">
              Total Bookings: {orders.length}
            </span>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
            <Luggage className="w-12 h-12 text-slate-400 mx-auto" />
            <div>
              <h3 className="text-base font-bold text-slate-900">No booking records found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                You haven't purchased any flight tickets yet.
              </p>
            </div>
            <Link
              href="/flights"
              className="inline-block px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
            >
              Book a Flight
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isPaid = order.status === 'PAID';
              const isRefunded = order.status === 'REFUNDED';

              return (
                <div
                  key={order.id}
                  className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-slate-900">
                          {order.orderNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            isPaid
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isRefunded
                              ? 'bg-slate-100 text-slate-600 border-slate-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Booked on {new Date(order.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Paid</span>
                      <span className="text-xl font-black text-slate-900">${order.totalAmount}</span>
                    </div>
                  </div>

                  {/* Flight & Passenger Info */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {order.flight?.airline} {order.flight?.flightNumber}
                        </span>
                        <span className="text-xs text-slate-500">
                          ({order.flight?.originCode} → {order.flight?.destinationCode})
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        {order.passengerCount} passenger{order.passengerCount > 1 ? 's' : ''} • Contact: {order.contactEmail}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/orders/${order.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition shadow-sm"
                      >
                        <Receipt className="w-3.5 h-3.5 text-blue-400" />
                        <span>View Receipt & Tickets</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
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
