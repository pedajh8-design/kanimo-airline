'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './auth-context';
import {
  Plane,
  Ticket,
  Luggage,
  HelpCircle,
  Shield,
  QrCode,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isStaffOrAdmin = user?.role === 'STAFF' || user?.role === 'ADMIN';

  const navLinks = [
    { name: 'Flights', href: '/flights', icon: Plane },
    { name: 'My Tickets', href: '/wallet', icon: Ticket, authRequired: true },
    { name: 'Orders', href: '/orders', icon: Luggage, authRequired: true },
    { name: 'Support', href: '/support', icon: HelpCircle },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-white backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Plane className="w-5 h-5 text-white transform -rotate-45" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-wider text-white">
                  KANIMO <span className="text-blue-400 font-light">AIRLINE</span>
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest -mt-1 font-medium">
                  Skyways & Beyond
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              if (link.authRequired && !user) return null;
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}

            {/* Admin / Staff shortcuts */}
            {isStaffOrAdmin && (
              <div className="flex items-center space-x-1 pl-2 border-l border-slate-800 ml-2">
                <Link
                  href="/admin"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                    pathname.startsWith('/admin') && !pathname.startsWith('/admin/scanner')
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'text-amber-300/80 hover:text-amber-300 hover:bg-amber-950/30'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  Admin
                </Link>
                <Link
                  href="/admin/scanner"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                    pathname === '/admin/scanner'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-emerald-300/80 hover:text-emerald-300 hover:bg-emerald-950/30'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  Gate Scanner
                </Link>
              </div>
            )}
          </div>

          {/* User Auth controls */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 transition-colors text-sm"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold leading-tight text-slate-200">{user.name}</p>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        user.role === 'ADMIN'
                          ? 'bg-amber-500/20 text-amber-300'
                          : user.role === 'STAFF'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-800 border border-slate-700 shadow-2xl py-2 z-50 text-slate-200 text-sm animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2 border-b border-slate-700/60">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-semibold truncate text-white">{user.email}</p>
                    </div>

                    <Link
                      href="/wallet"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-700/60 transition-colors"
                    >
                      <Ticket className="w-4 h-4 text-blue-400" />
                      Digital Boarding Passes
                    </Link>

                    <Link
                      href="/orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-700/60 transition-colors"
                    >
                      <Luggage className="w-4 h-4 text-indigo-400" />
                      Booking History
                    </Link>

                    {isStaffOrAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-700/60 text-amber-300 transition-colors"
                      >
                        <Shield className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    )}

                    <div className="border-t border-slate-700/60 my-1"></div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="flex items-center gap-2.5 w-full text-left px-4 py-2 hover:bg-rose-950/40 text-rose-300 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-600/20 transition-all hover:shadow-blue-600/30"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => {
            if (link.authRequired && !user) return null;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <Icon className="w-5 h-5 text-blue-400" />
                {link.name}
              </Link>
            );
          })}

          {isStaffOrAdmin && (
            <div className="pt-2 border-t border-slate-800 space-y-1">
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-amber-300 hover:bg-slate-800"
              >
                <Shield className="w-5 h-5" />
                Admin Dashboard
              </Link>
              <Link
                href="/admin/scanner"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-emerald-300 hover:bg-slate-800"
              >
                <QrCode className="w-5 h-5" />
                Gate Ticket Scanner
              </Link>
            </div>
          )}

          <div className="pt-4 border-t border-slate-800">
            {user ? (
              <div className="space-y-2">
                <div className="px-3 py-2 bg-slate-800/80 rounded-lg">
                  <p className="text-sm font-semibold text-white">{user.name}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                  <span className="inline-block mt-1 text-[10px] uppercase font-bold text-blue-400 bg-blue-900/40 px-2 py-0.5 rounded">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-rose-300 bg-rose-950/40 hover:bg-rose-900/50 text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-lg bg-slate-800 text-sm font-medium text-white hover:bg-slate-700"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-lg bg-blue-600 text-sm font-semibold text-white hover:bg-blue-500"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
