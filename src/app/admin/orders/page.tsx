'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Luggage,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  Receipt,
  User,
} from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

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
    fetchOrders();
  }, []);

  const handleRefund = async (orderId: string) => {
    if (!window.confirm('Process administrative refund for this booking? Tickets will be marked CANCELLED and seat capacity restored.')) {
      return;
    }

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('kanimo_token') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/orders/${orderId}/refund`, {
        method: 'POST',
        headers,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Refund failed');

      alert('Order refunded successfully and tickets cancelled');
      fetchOrders();
    } catch (err: any) {
      alert(err.message || 'Error processing refund');
    }
  };

  const filtered = orders.filter((o) => {
    if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      const numMatch = o.orderNumber.toLowerCase().includes(s);
      const emailMatch = o.contactEmail?.toLowerCase().includes(s);
      const userMatch = o.user?.name?.toLowerCase().includes(s);
      return numMatch || emailMatch || userMatch;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Financial Ledger & Reservations
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
            Platform Orders & Purchases
          </h1>
          <p className="text-xs text-slate-400">
            Complete transaction history across web and mobile clients.
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block font-semibold">Total Platform Volume</span>
          <span className="text-2xl font-black text-white">
            ${orders.filter((o) => o.status === 'PAID').reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order #, customer, or email..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold">Filter:</span>
          {['ALL', 'PAID', 'REFUNDED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                statusFilter === st ? 'bg-amber-500 text-slate-950 shadow-sm' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800 tracking-wider">
              <tr>
                <th className="p-4">Order #</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Flight</th>
                <th className="p-4">Passengers</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((order) => {
                const isPaid = order.status === 'PAID';
                const canRefund = isPaid && !order.tickets?.some((t: any) => t.status === 'CHECKED_IN');

                return (
                  <tr key={order.id} className="hover:bg-slate-800/50 transition">
                    <td className="p-4 font-mono font-bold text-white">
                      {order.orderNumber}
                      <span className="text-[10px] text-slate-500 block font-sans">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="text-white font-bold">{order.user?.name || 'Customer'}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                        {order.contactEmail}
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="font-bold text-white block">
                        {order.flight?.flightNumber}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {order.flight?.originCode} → {order.flight?.destinationCode}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="font-bold text-white">{order.passengerCount} traveler(s)</span>
                    </td>

                    <td className="p-4 font-bold text-white text-sm">
                      ${order.totalAmount}
                    </td>

                    <td className="p-4">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                        {order.paymentMethod}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                          isPaid
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-slate-700 text-slate-300 border-slate-600'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      {canRefund ? (
                        <button
                          onClick={() => handleRefund(order.id)}
                          className="px-3 py-1 rounded-lg text-[11px] font-bold text-rose-300 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800 transition"
                        >
                          Refund Order
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500">N/A</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
