'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plane,
  Calendar,
  Users,
  Search,
  ShieldCheck,
  Sparkles,
  Wifi,
  Coffee,
  Tv,
  ArrowRight,
  MapPin,
  Clock,
  Compass,
  Star,
  Check,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [cabinClass, setCabinClass] = useState('ALL');
  const [featuredFlights, setFeaturedFlights] = useState<any[]>([]);
  const [loadingFlights, setLoadingFlights] = useState(true);

  useEffect(() => {
    fetch('/api/flights')
      .then((res) => res.json())
      .then((data) => {
        if (data.flights) {
          setFeaturedFlights(data.flights.slice(0, 4));
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoadingFlights(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (origin) params.append('origin', origin);
    if (destination) params.append('destination', destination);
    if (cabinClass && cabinClass !== 'ALL') params.append('cabinClass', cabinClass);
    router.push(`/flights?${params.toString()}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-slate-950 text-white overflow-hidden py-16 sm:py-24">
        {/* Background gradient & decorative aura */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-950 to-slate-950 pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/80 border border-blue-800/80 text-blue-400 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Generation Flagship Aviation</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
              Fly in Uncompromising <br />
              <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                Luxury & Precision
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-lg max-w-2xl mx-auto font-light">
              Experience non-stop transcontinental flights with lie-flat private suites, gourmet in-flight dining, zero-wait biometric check-in, and instant digital boarding passes.
            </p>
          </div>

          {/* Flight Search Widget */}
          <div className="mt-10 max-w-5xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-4 sm:p-6 backdrop-blur-xl">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* From / Origin */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    From (Origin)
                  </label>
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="New York, JFK, SFO..."
                    className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                {/* To / Destination */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Plane className="w-3.5 h-3.5 text-blue-400" />
                    To (Destination)
                  </label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="London, Tokyo, Paris..."
                    className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                {/* Cabin Class */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    Cabin Class
                  </label>
                  <select
                    value={cabinClass}
                    onChange={(e) => setCabinClass(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  >
                    <option value="ALL">All Cabin Classes</option>
                    <option value="ECONOMY">Economy Classic</option>
                    <option value="PREMIUM_ECONOMY">Premium Comfort</option>
                    <option value="BUSINESS">Business Executive</option>
                    <option value="FIRST">Royal First Class</option>
                  </select>
                </div>

                {/* Submit button */}
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/30 transition transform hover:-translate-y-0.5"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search Flights</span>
                  </button>
                </div>
              </div>

              {/* Quick Route Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Popular Corridors:</span>
                <button
                  type="button"
                  onClick={() => {
                    setOrigin('JFK');
                    setDestination('LHR');
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
                >
                  JFK → LHR (London)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOrigin('SFO');
                    setDestination('HND');
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
                >
                  SFO → HND (Tokyo)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOrigin('JFK');
                    setDestination('MIA');
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
                >
                  JFK → MIA (Miami)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOrigin('DXB');
                    setDestination('CDG');
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
                >
                  DXB → CDG (Paris)
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Featured Flights Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Exclusive Departures
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Featured Flagship Routes
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                Direct flights on state-of-the-art Boeing 787-9 Dreamliners and Airbus A350 aircraft.
              </p>
            </div>
            <Link
              href="/flights"
              className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              <span>View all scheduled flights</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingFlights ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-72 bg-slate-200 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredFlights.map((flight) => (
                <div
                  key={flight.id}
                  className="group bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="relative h-44 overflow-hidden bg-slate-900">
                    <img
                      src={flight.imageUrl}
                      alt={flight.destination}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-600/90 text-white backdrop-blur-md shadow-sm">
                        {flight.flightNumber}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-900/80 text-slate-200 backdrop-blur-md border border-slate-700">
                        {flight.category}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <p className="text-xs text-slate-300 font-medium">Destination</p>
                      <p className="text-base font-bold truncate">{flight.destinationCity}</p>
                    </div>
                  </div>

                  <div className="p-5 flex-grow flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">{flight.originCode}</span>
                        <div className="flex items-center gap-1.5 flex-1 px-3">
                          <div className="h-px bg-slate-200 flex-1" />
                          <Plane className="w-3 h-3 text-blue-500 transform rotate-90" />
                          <div className="h-px bg-slate-200 flex-1" />
                        </div>
                        <span className="font-semibold text-slate-700">{flight.destinationCode}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {flight.duration}
                        </span>
                        <span className="text-slate-400 truncate max-w-[130px]">{flight.aircraft}</span>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Fares From</span>
                        <span className="text-lg font-black text-slate-900">${flight.minPrice}</span>
                      </div>
                      <Link
                        href={`/flights/${flight.id}`}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm"
                      >
                        Book Ticket
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Cabin Class & Premium Amenities */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">The Kanimo Standard</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">Crafted For The Modern Traveler</h2>
            <p className="text-slate-600 text-sm mt-2">
              Every detail is meticulously refined to ensure comfort, privacy, and frictionless airport transfers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Coffee className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Michelin-Inspired Dining</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Multi-course seasonal gastronomy with sommelier wine pairings curated for high altitudes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Wifi className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Gigabit Satellite Wi-Fi</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Stay fully connected above 35,000 feet with low-latency streaming and high-speed browsing.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Cryptographic QR Passes</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                HMAC-SHA256 signed digital boarding passes with real-time gate scanner validation and zero forgery.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Tv className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">OLED Private Entertainment</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                4K HDR touchscreen entertainment with noise-canceling headphones in every seat class.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
