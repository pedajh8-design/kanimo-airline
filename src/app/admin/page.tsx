'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  Ticket,
  Plane,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  LifeBuoy,
  Shield,
  ArrowRight,
  Activity,
} from 'lucide-react';
import AirplaneLandingLoader from '@/components/AirplaneLandingLoader';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('kanimo_token') : null;
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch('/api/admin/stats', { headers });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to fetch admin stats');
        setData(json);
      } catch (err: any) {
        setError(err.message || 'Error loading dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="py-6">
        <AirplaneLandingLoader
          title="Loading Operations Analytics & Telemetry"
          subtitle="Computing real-time passenger loads and revenue..."
          fullScreen={false}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-950/40 border border-rose-800 rounded-2xl text-rose-300 text-sm">
        <AlertCircle className="w-5 h-5 mb-1" />
        <p>{error}</p>
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentLogs = data?.recentAuditLogs || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400">
            Operations Command Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
            Fleet Performance & Revenue Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry, synchronized gate validation counters, and transactional bookings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/scanner"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition"
          >
            Open Gate Scanner
          </Link>
          <Link
            href="/admin/flights"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition"
          >
            Manage Flights
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-400">Total Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">${stats.totalRevenue?.toLocaleString() || 0}</p>
          <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Paid & Confirmed Orders</span>
          </p>
        </div>

        {/* Tickets Issued & Sold */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-400">Boarding Passes Issued</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{stats.totalTickets || 0}</p>
          <p className="text-[11px] text-slate-400">Across all scheduled flights</p>
        </div>

        {/* Gate Check-In Rate */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-400">Gate Check-In Rate</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-amber-400">{stats.checkInRate || 0}%</p>
          <p className="text-[11px] text-slate-400">
            {stats.checkedInTickets || 0} passengers scanned at gate
          </p>
        </div>

        {/* Active Flights */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-400">Active Flights</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Plane className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{stats.totalFlights || 0}</p>
          <p className="text-[11px] text-slate-400">{stats.openSupportCount || 0} open support tickets</p>
        </div>
      </div>

      {/* Cabin Class Revenue Breakdown */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-base font-extrabold text-white">Revenue By Cabin Class</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-blue-400">Economy Classic</span>
            <p className="text-xl font-black text-white">
              ${stats.cabinRevenue?.ECONOMY?.toLocaleString() || 0}
            </p>
          </div>
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-indigo-400">Premium Comfort</span>
            <p className="text-xl font-black text-white">
              ${stats.cabinRevenue?.PREMIUM_ECONOMY?.toLocaleString() || 0}
            </p>
          </div>
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-400">Business Executive</span>
            <p className="text-xl font-black text-white">
              ${stats.cabinRevenue?.BUSINESS?.toLocaleString() || 0}
            </p>
          </div>
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-rose-400">Royal First Class</span>
            <p className="text-xl font-black text-white">
              ${stats.cabinRevenue?.FIRST?.toLocaleString() || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Live System Activity Feed */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-extrabold text-white">Live System Audit & Security Trail</h3>
          </div>
          <span className="text-xs text-slate-400">Real-time ledger</span>
        </div>

        <div className="divide-y divide-slate-800">
          {recentLogs.length === 0 ? (
            <p className="text-xs text-slate-500 py-4">No recent activity logs recorded.</p>
          ) : (
            recentLogs.map((log: any) => (
              <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {log.action}
                  </span>
                  <span className="text-slate-300">{log.entityType} ({log.entityId.substring(0, 8)}...)</span>
                </div>
                <span className="text-slate-500 font-mono text-[11px]">
                  {new Date(log.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
