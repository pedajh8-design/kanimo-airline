'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth-context';
import {
  LayoutDashboard,
  Plane,
  QrCode,
  Luggage,
  Users,
  LifeBuoy,
  Shield,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || (user.role !== 'ADMIN' && user.role !== 'STAFF')) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md bg-slate-900 p-8 rounded-3xl border border-rose-500/30 text-center space-y-4 text-white">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-black">Restricted Operations Area</h2>
          <p className="text-xs text-slate-400">
            This terminal requires Kanimo Airline Staff or Operations Director security clearance.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/login?redirect=/admin"
              className="px-4 py-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-bold hover:bg-amber-400 transition"
            >
              Sign In with Staff Account
            </Link>
            <Link
              href="/"
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700 transition"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: 'Analytics & Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Gate Ticket Scanner', href: '/admin/scanner', icon: QrCode },
    { name: 'Flights & Inventory', href: '/admin/flights', icon: Plane },
    { name: 'Customer Orders', href: '/admin/orders', icon: Luggage },
    { name: 'Passenger Concierge', href: '/admin/support', icon: LifeBuoy },
    { name: 'Customer Accounts', href: '/admin/customers', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-4 sm:p-6 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Admin Header */}
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-wider uppercase text-white">
                Operations <span className="text-amber-400 font-light">HQ</span>
              </span>
              <p className="text-[10px] text-slate-400 uppercase font-mono">
                {user.role} TERMINAL
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800 text-xs text-slate-500 flex items-center justify-between">
          <Link href="/" className="hover:text-slate-300 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Public Site</span>
          </Link>
          <span className="font-mono text-[10px] text-amber-400/80">v1.0-LIVE</span>
        </div>
      </aside>

      {/* Main Admin Content Body */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
