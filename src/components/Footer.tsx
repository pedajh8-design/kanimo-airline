import React from 'react';
import Link from 'next/link';
import { Plane, ShieldCheck, Clock, Award, Globe, PhoneCall } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#081226] border-t border-slate-800 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Plane className="w-4 h-4 text-white transform -rotate-45" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white">
                Sky<span className="text-blue-400">Tickets</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Fly More • Explore More. The easiest way to search and book domestic and international airline tickets with instant confirmation and secure mobile payments.
            </p>
            <div className="flex items-center gap-2 text-xs text-blue-400">
              <Globe className="w-4 h-4 text-blue-400" />
              <span>Horn of Africa & International Flight Network</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Book & Explore</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/flights" className="hover:text-blue-400 transition-colors">
                  Search Flights
                </Link>
              </li>
              <li>
                <Link href="/wallet" className="hover:text-blue-400 transition-colors">
                  My Bookings & Boarding Passes
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-blue-400 transition-colors">
                  Order & Receipt History
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-blue-400 transition-colors">
                  Customer Help Desk
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & Reliability */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Guaranteed Security</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Encrypted Booking & Digital Passes</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>Zaad, eDahab & Visa/Mastercard</span>
              </li>
              <li className="flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Direct Airline Ticket Issuance</span>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">24/7 Support Service</h4>
            <p className="text-xs text-slate-400 mb-2">
              Our 24/7 flight concierge is available for booking inquiries, ticket changes, and passenger support.
            </p>
            <div className="flex items-center gap-2 text-xs text-blue-400 font-semibold">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>+252 (63) 445-9988 / +1 (800) 526-4660</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">support@skytickets.com</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} SkyTickets Airline Network. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-[11px] bg-slate-900 text-slate-300 px-2.5 py-1 rounded-full border border-slate-800">
              SkyTickets Web & Mobile App Connected
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
