import React from 'react';
import Link from 'next/link';
import { Plane, ShieldCheck, Clock, Award, Globe, PhoneCall } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Plane className="w-4 h-4 text-white transform -rotate-45" />
              </div>
              <span className="font-extrabold text-base tracking-wider text-white">
                KANIMO <span className="text-blue-400 font-light">AIRLINE</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Experience pinnacle aviation comfort with Kanimo Airline. Connecting world capitals with modern widebody fleets, biometric security, and lie-flat luxury suites.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <Globe className="w-4 h-4 text-blue-400" />
              <span>Global Flight Operations</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Book & Manage</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/flights" className="hover:text-blue-400 transition-colors">
                  Explore Destinations
                </Link>
              </li>
              <li>
                <Link href="/wallet" className="hover:text-blue-400 transition-colors">
                  Digital Boarding Passes
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-blue-400 transition-colors">
                  Order & Receipt History
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-blue-400 transition-colors">
                  Passenger Assistance & Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & Reliability */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Security & Trust</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>HMAC-SHA256 Signed Boarding Passes</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>Transactional Inventory Protection</span>
              </li>
              <li className="flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Zero-Overselling Concurrency Engine</span>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Customer Concierge</h4>
            <p className="text-xs text-slate-400 mb-2">
              Our 24/7 flight concierge is available for booking inquiries, baggage tracing, and VIP services.
            </p>
            <div className="flex items-center gap-2 text-xs text-blue-400 font-semibold">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>+1 (800) 526-4660 (Toll-Free)</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">support@kanimo-airline.com</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} Kanimo Airline Systems Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700">
              Vercel Production Ready
            </span>
            <span className="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700">
              Android Native APK Connected
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
