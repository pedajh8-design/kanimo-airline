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
  Edit2,
  Trash2,
  AlertTriangle,
  X,
  RefreshCw,
  Save,
  CreditCard,
  Phone,
  Mail,
  Plane,
} from 'lucide-react';
import AirplaneLandingLoader from '@/components/AirplaneLandingLoader';

interface OrderItem {
  id: string;
  passengerName: string;
  passengerEmail?: string;
  seatNumber?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  flightId: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  passengerCount: number;
  contactEmail: string;
  contactPhone?: string;
  createdAt: string;
  flight?: {
    flightNumber: string;
    originCode: string;
    originCity: string;
    destinationCode: string;
    destinationCity: string;
  };
  user?: {
    name: string;
    email: string;
  };
  items?: OrderItem[];
  tickets?: any[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Confirmation Popup State: { type: 'refund' | 'delete', order: Order } | null
  const [confirmModal, setConfirmModal] = useState<{
    type: 'refund' | 'delete';
    order: Order;
  } | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Edit Order Modal State
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    customerName: '',
    contactEmail: '',
    contactPhone: '',
    status: 'PAID',
    totalAmount: 0,
    paymentMethod: 'MOBILE_MONEY_ZAAD',
    passengers: [] as { id: string; passengerName: string; passengerEmail: string; seatNumber: string }[],
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('kanimo_token') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/orders?all=true', { headers });
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

  // Show auto-dismissing notification
  const showToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4500);
  };

  // Open Edit Modal with order data
  const handleOpenEdit = (order: Order) => {
    setEditingOrder(order);
    setEditForm({
      customerName: order.user?.name || '',
      contactEmail: order.contactEmail || '',
      contactPhone: order.contactPhone || '',
      status: order.status || 'PAID',
      totalAmount: order.totalAmount || 0,
      paymentMethod: order.paymentMethod || 'MOBILE_MONEY_ZAAD',
      passengers: (order.items || []).map((item) => ({
        id: item.id,
        passengerName: item.passengerName || '',
        passengerEmail: item.passengerEmail || '',
        seatNumber: item.seatNumber || '',
      })),
    });
  };

  // Save Edit Order
  const handleSaveEdit = async () => {
    if (!editingOrder) return;
    setIsSavingEdit(true);
    setError('');

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('kanimo_token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/orders/${editingOrder.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update order');

      showToast(`Order #${editingOrder.orderNumber} successfully updated.`);
      setEditingOrder(null);
      await fetchOrders();
    } catch (err: any) {
      setError(err.message || 'Error updating order');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Confirm Refund Action
  const handleConfirmRefund = async () => {
    if (!confirmModal || confirmModal.type !== 'refund') return;
    setIsProcessingAction(true);
    setError('');

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('kanimo_token') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/orders/${confirmModal.order.id}/refund`, {
        method: 'POST',
        headers,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Refund failed');

      showToast(`Order #${confirmModal.order.orderNumber} refunded successfully and seat inventory restored.`);
      setConfirmModal(null);
      await fetchOrders();
    } catch (err: any) {
      setError(err.message || 'Error processing refund');
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Confirm Delete Action
  const handleConfirmDelete = async () => {
    if (!confirmModal || confirmModal.type !== 'delete') return;
    setIsProcessingAction(true);
    setError('');

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('kanimo_token') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/orders/${confirmModal.order.id}`, {
        method: 'DELETE',
        headers,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete order');

      showToast(`Order #${confirmModal.order.orderNumber} permanently deleted.`);
      setConfirmModal(null);
      await fetchOrders();
    } catch (err: any) {
      setError(err.message || 'Error deleting order');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const filtered = orders.filter((o) => {
    if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      const numMatch = o.orderNumber?.toLowerCase().includes(s);
      const emailMatch = o.contactEmail?.toLowerCase().includes(s);
      const userMatch = o.user?.name?.toLowerCase().includes(s);
      const flightMatch = o.flight?.flightNumber?.toLowerCase().includes(s);
      return numMatch || emailMatch || userMatch || flightMatch;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-emerald-400 text-xs font-bold animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-400/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-between text-rose-400 text-xs font-bold animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-rose-400/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Financial Ledger & Reservations
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
            Platform Orders & Purchases
          </h1>
          <p className="text-xs text-slate-400">
            Complete transaction history across web and mobile clients. Modify, refund, edit, and manage bookings.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-xs text-slate-400 block font-semibold">Total Platform Volume</span>
            <span className="text-2xl font-black text-white">
              ${orders.filter((o) => o.status === 'PAID').reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}
            </span>
          </div>
          <button
            onClick={fetchOrders}
            className={`w-10 h-10 rounded-2xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition ${
              loading ? 'animate-spin' : ''
            }`}
            title="Refresh Orders"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
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
          {['ALL', 'PAID', 'REFUNDED', 'CANCELLED'].map((st) => (
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
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-4">
                    <AirplaneLandingLoader
                      title="Loading Platform Orders Ledger"
                      subtitle="Synchronizing bookings with Neon PostgreSQL..."
                      fullScreen={false}
                    />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 font-semibold text-xs">
                    No orders found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  const isPaid = order.status === 'PAID';
                  const isRefunded = order.status === 'REFUNDED';
                  const canRefund = isPaid && !order.tickets?.some((t: any) => t.status === 'CHECKED_IN');

                  return (
                    <tr key={order.id} className="hover:bg-slate-800/50 transition">
                      {/* Order # */}
                      <td className="p-4 font-mono font-bold text-white">
                        {order.orderNumber}
                        <span className="text-[10px] text-slate-500 block font-sans">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="p-4">
                        <div className="text-white font-bold">{order.user?.name || 'Customer'}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                          {order.contactEmail}
                        </div>
                        {order.contactPhone && (
                          <div className="text-[9px] text-slate-500 font-mono">
                            {order.contactPhone}
                          </div>
                        )}
                      </td>

                      {/* Flight */}
                      <td className="p-4">
                        <span className="font-bold text-white block">
                          {order.flight?.flightNumber || 'FLIGHT'}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {order.flight?.originCode || 'ORIG'} → {order.flight?.destinationCode || 'DEST'}
                        </span>
                      </td>

                      {/* Passengers */}
                      <td className="p-4">
                        <span className="font-bold text-white">{order.passengerCount || 1} traveler(s)</span>
                      </td>

                      {/* Amount */}
                      <td className="p-4 font-bold text-white text-sm">
                        ${order.totalAmount}
                      </td>

                      {/* Payment */}
                      <td className="p-4">
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                          {order.paymentMethod}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span
                          className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                            isPaid
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : isRefunded
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                              : 'bg-slate-700 text-slate-300 border-slate-600'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>

                      {/* Actions: Edit, Refund, Delete */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Button */}
                          <button
                            onClick={() => handleOpenEdit(order)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-blue-300 bg-blue-950/40 hover:bg-blue-900/50 border border-blue-800 transition flex items-center gap-1"
                            title="Edit Order"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>

                          {/* Refund Button */}
                          {canRefund ? (
                            <button
                              onClick={() => setConfirmModal({ type: 'refund', order })}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-amber-300 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-800 transition flex items-center gap-1"
                              title="Refund Order"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Refund</span>
                            </button>
                          ) : isRefunded ? (
                            <span className="px-2 py-1 rounded-lg text-[10px] font-semibold text-rose-400 bg-rose-950/20 border border-rose-900/30">
                              Refunded
                            </span>
                          ) : null}

                          {/* Delete Button */}
                          <button
                            onClick={() => setConfirmModal({ type: 'delete', order })}
                            className="p-1.5 rounded-lg text-rose-400 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800 transition"
                            title="Delete Order Permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* CONFIRMATION POPUP MODAL (REFUND & DELETE) */}
      {/* ======================================================== */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95">
            {/* Modal Icon and Header */}
            <div className="flex items-center gap-3.5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  confirmModal.type === 'refund'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {confirmModal.type === 'refund' ? (
                  <RotateCcw className="w-6 h-6" />
                ) : (
                  <AlertTriangle className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  {confirmModal.type === 'refund' ? 'Confirm Order Refund' : 'Confirm Order Deletion'}
                </h3>
                <p className="text-xs text-slate-400">
                  {confirmModal.type === 'refund'
                    ? 'Please confirm you wish to issue a refund for this client.'
                    : 'This action is irreversible and permanently erases the booking.'}
                </p>
              </div>
            </div>

            {/* Order Details Card */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800/80 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Order Number</span>
                <span className="font-mono font-bold text-white">{confirmModal.order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Customer</span>
                <span className="font-bold text-white">
                  {confirmModal.order.user?.name || confirmModal.order.contactEmail}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Flight</span>
                <span className="font-bold text-amber-400">
                  {confirmModal.order.flight?.flightNumber} ({confirmModal.order.flight?.originCode} →{' '}
                  {confirmModal.order.flight?.destinationCode})
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-800/80 pt-2 font-bold">
                <span className="text-slate-400">Total Transaction Amount</span>
                <span className="text-white text-sm">${confirmModal.order.totalAmount}</span>
              </div>
            </div>

            {/* Warning Message */}
            <p className="text-xs text-slate-400 leading-relaxed">
              {confirmModal.type === 'refund' ? (
                <>
                  Refunding will update the order to <span className="text-amber-400 font-bold">REFUNDED</span>,
                  cancel all customer boarding passes, and automatically return the seat capacity to the flight
                  inventory.
                </>
              ) : (
                <>
                  <span className="text-rose-400 font-bold">Warning:</span> All associated database records (issued
                  tickets, baggage allocations, seat reservations, and payment ledger entries) will be permanently
                  deleted.
                </>
              )}
            </p>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                disabled={isProcessingAction}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmModal.type === 'refund' ? handleConfirmRefund : handleConfirmDelete}
                disabled={isProcessingAction}
                className={`flex-1 py-3 font-black text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-lg ${
                  confirmModal.type === 'refund'
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20'
                    : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                }`}
              >
                {isProcessingAction ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : confirmModal.type === 'refund' ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Yes, Confirm Refund</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete Order</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* EDIT / UPDATE ORDER MODAL */}
      {/* ======================================================== */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto space-y-5 animate-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-white">Edit Customer Order</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Order #{editingOrder.orderNumber} • {editingOrder.flight?.flightNumber || 'FLIGHT'}
                </p>
              </div>
              <button
                onClick={() => setEditingOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 text-xs">
              {/* Customer Name */}
              <div>
                <label className="text-slate-400 font-bold block mb-1">Customer / Contact Name</label>
                <input
                  type="text"
                  value={editForm.customerName}
                  onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })}
                  placeholder="e.g. Kani Mo"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={editForm.contactEmail}
                    onChange={(e) => setEditForm({ ...editForm, contactEmail: e.target.value })}
                    placeholder="e.g. kanimo@kanimo.com"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={editForm.contactPhone}
                    onChange={(e) => setEditForm({ ...editForm, contactPhone: e.target.value })}
                    placeholder="e.g. +252 63 445 9988"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Status & Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Order Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="PAID">PAID (Active)</option>
                    <option value="REFUNDED">REFUNDED</option>
                    <option value="CANCELLED">CANCELLED</option>
                    <option value="PENDING">PENDING</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">Total Amount ($)</label>
                  <input
                    type="number"
                    value={editForm.totalAmount}
                    onChange={(e) => setEditForm({ ...editForm, totalAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="text-slate-400 font-bold block mb-1">Payment Method</label>
                <select
                  value={editForm.paymentMethod}
                  onChange={(e) => setEditForm({ ...editForm, paymentMethod: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="MOBILE_MONEY_ZAAD">Zaad Service (Telesom)</option>
                  <option value="MOBILE_MONEY_EDAHAB">eDahab (Somtel)</option>
                  <option value="CARD">Credit / Debit Card</option>
                  <option value="BANK_TRANSFER">Bank Transfer (Direct)</option>
                  <option value="DEMO_PAYMENT">Demo Payment</option>
                </select>
              </div>

              {/* Passengers & Seat Allocation */}
              {editForm.passengers.length > 0 && (
                <div className="pt-2 border-t border-slate-800 space-y-3">
                  <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">
                    Passenger & Seat Assignments ({editForm.passengers.length})
                  </span>

                  {editForm.passengers.map((p, idx) => (
                    <div key={p.id} className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-amber-400">
                        <span>Traveler {idx + 1}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <label className="text-[10px] text-slate-500 block mb-0.5 font-semibold">Name</label>
                          <input
                            type="text"
                            value={p.passengerName}
                            onChange={(e) => {
                              const updated = [...editForm.passengers];
                              updated[idx].passengerName = e.target.value;
                              setEditForm({ ...editForm, passengers: updated });
                            }}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-semibold focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 block mb-0.5 font-semibold">Seat</label>
                          <input
                            type="text"
                            value={p.seatNumber}
                            onChange={(e) => {
                              const updated = [...editForm.passengers];
                              updated[idx].seatNumber = e.target.value;
                              setEditForm({ ...editForm, passengers: updated });
                            }}
                            placeholder="e.g. 12A"
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold text-center focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingOrder(null)}
                disabled={isSavingEdit}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isSavingEdit}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20"
              >
                {isSavingEdit ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Update Order</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
