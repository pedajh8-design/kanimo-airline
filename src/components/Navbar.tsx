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
  Globe,
  Building2,
  Home,
} from 'lucide-react';

export default function Navbar() {
  const { user, login, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('EN');

  const isStaffOrAdmin = user?.role === 'STAFF' || user?.role === 'ADMIN';

  const navLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Flights', href: '/flights', icon: Plane },
    { name: 'Hotels', href: '/flights?tab=hotels', icon: Building2 },
    { name: 'My Bookings', href: user ? '/wallet' : '/login', icon: Ticket },
    { name: 'Help', href: '/support', icon: HelpCircle },
  ];

  const handleDemoLoginKaniMo = async () => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'kanimo@kanimo.com', password: 'passenger123' }),
      });
      const data = await res.json();
      if (data.token && data.user) {
        login(data.token, data.user);
        setUserDropdownOpen(false);
      } else {
        // Fallback to passenger
        const fallbackRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'passenger@example.com', password: 'passenger123' }),
        });
        const fbData = await fallbackRes.json();
        if (fbData.token && fbData.user) {
          login(fbData.token, fbData.user);
          setUserDropdownOpen(false);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0b1329] border-b border-slate-800/80 text-white shadow-lg backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* SkyTickets Brand Logo */}
          <div className="flex items-center gap-3 py-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform">
                <Plane className="w-5 h-5 text-white transform -rotate-45" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-0.5">
                  Sky<span className="text-blue-400">Tickets</span>
                </span>
                <span className="text-[10px] text-blue-200/80 font-medium tracking-wide -mt-0.5">
                  Fly More • Explore More
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href.split('?')[0]);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 opacity-90" />
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
                  Scanner
                </Link>
              </div>
            )}
          </div>

          {/* Right Controls: Language & User */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 border border-slate-750 transition"
              >
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>{currentLang}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
              {langDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-24 rounded-lg bg-slate-900 border border-slate-800 shadow-xl py-1 z-50 text-xs">
                  {['EN', 'SO', 'AR'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setCurrentLang(lang);
                        setLangDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-slate-300 hover:bg-blue-600/20 hover:text-blue-400 font-medium"
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-850 hover:bg-slate-800 border border-slate-700/80 transition-colors text-sm shadow-sm"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-inner">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold leading-tight text-white">{user.name}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-750 shadow-2xl py-2 z-50 text-slate-200 text-sm animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2 border-b border-slate-800">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-bold truncate text-white">{user.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>

                    <Link
                      href="/wallet"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-800 text-slate-200 transition-colors"
                    >
                      <Ticket className="w-4 h-4 text-blue-400" />
                      My Bookings & Tickets
                    </Link>

                    <Link
                      href="/orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-800 text-slate-200 transition-colors"
                    >
                      <Luggage className="w-4 h-4 text-indigo-400" />
                      Order History
                    </Link>

                    {isStaffOrAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-800 text-amber-300 transition-colors"
                      >
                        <Shield className="w-4 h-4" />
                        Staff / Admin Panel
                      </Link>
                    )}

                    <div className="border-t border-slate-800 my-1"></div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 hover:bg-rose-950/40 text-rose-300 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDemoLoginKaniMo}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-semibold transition"
                  title="Quick Demo sign in as Kani Mo"
                >
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  <span>Kani Mo</span>
                </button>
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu button */}
          <div className="md:hidden flex items-center gap-2">
            {!user && (
              <button
                onClick={handleDemoLoginKaniMo}
                className="px-2.5 py-1 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-300 text-xs font-medium"
              >
                Kani Mo
              </button>
            )}
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
        <div className="md:hidden bg-[#0b1329] border-b border-slate-800 px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-white"
              >
                <Icon className="w-4 h-4 text-blue-400" />
                {link.name}
              </Link>
            );
          })}

          <div className="pt-2 border-t border-slate-800 space-y-2">
            {user ? (
              <div className="flex items-center justify-between px-3 py-2 bg-slate-850 rounded-lg">
                <span className="text-xs font-bold text-white">{user.name}</span>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="text-xs text-rose-400 hover:underline"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-xs font-semibold bg-slate-800 text-white rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-xs font-bold bg-blue-600 text-white rounded-lg"
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
