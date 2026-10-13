'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  DollarSign,
  Ticket,
  Luggage,
  Calendar,
  Shield,
  UserCheck,
} from 'lucide-react';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('kanimo_token') : null;
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch('/api/admin/customers', { headers });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch customers');
        setCustomers(data.customers || []);
      } catch (err: any) {
        setError(err.message || 'Error loading customers');
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const filtered = customers.filter((c) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return c.name.toLowerCase().includes(s) || c.email.toLowerCase().includes(s) || (c.phone && c.phone.includes(s));
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Passenger Directory & VIP Status
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
            Registered Customer Accounts
          </h1>
          <p className="text-xs text-slate-400">
            Track passenger loyalty, total platform spend, and account roles.
          </p>
        </div>

        <span className="px-4 py-2 rounded-2xl bg-slate-800 text-white border border-slate-700 text-xs font-bold">
          {customers.length} Accounts Registered
        </span>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, email, or phone..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800 tracking-wider">
              <tr>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Contact Details</th>
                <th className="p-4">Role</th>
                <th className="p-4">Bookings</th>
                <th className="p-4">Tickets Issued</th>
                <th className="p-4">Lifetime Spend</th>
                <th className="p-4">Member Since</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/50 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center font-bold text-xs border border-slate-700">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-white text-sm">{c.name}</span>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="text-white block">{c.email}</span>
                    <span className="text-[11px] text-slate-500">{c.phone || 'No phone on file'}</span>
                  </td>

                  <td className="p-4">
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                        c.role === 'ADMIN'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : c.role === 'STAFF'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      }`}
                    >
                      {c.role}
                    </span>
                  </td>

                  <td className="p-4 font-bold text-white">
                    {c.totalOrders} order{c.totalOrders !== 1 ? 's' : ''}
                  </td>

                  <td className="p-4 font-bold text-white">
                    {c.totalTickets} pass{c.totalTickets !== 1 ? 'es' : ''}
                  </td>

                  <td className="p-4 font-extrabold text-emerald-400 text-sm">
                    ${c.totalSpend.toLocaleString()}
                  </td>

                  <td className="p-4 text-slate-500 font-mono text-[11px]">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
