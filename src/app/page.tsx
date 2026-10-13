'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plane,
  Building2,
  Bus,
  Calendar,
  User,
  Search,
  ArrowRightLeft,
  ShieldCheck,
  Tag,
  Zap,
  Headphones,
  MapPin,
  Clock,
  ArrowRight,
  Send,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  // Search State initialized to mockup values
  const [activeSearchTab, setActiveSearchTab] = useState<'flights' | 'hotels' | 'bus'>('flights');
  const [fromCity, setFromCity] = useState('HGA');
  const [toCity, setToCity] = useState('MGQ');
  const [departureDate, setDepartureDate] = useState('2026-11-15');
  const [returnDate, setReturnDate] = useState('2026-11-22');
  const [passengers, setPassengers] = useState('1 Adult');

  const airportOptions = [
    { code: 'HGA', name: 'Hargeisa (HGA)', city: 'Hargeisa' },
    { code: 'MGQ', name: 'Mogadishu (MGQ)', city: 'Mogadishu' },
    { code: 'ADD', name: 'Addis Ababa (ADD)', city: 'Addis Ababa' },
    { code: 'DXB', name: 'Dubai (DXB)', city: 'Dubai' },
    { code: 'IST', name: 'Istanbul (IST)', city: 'Istanbul' },
    { code: 'NBO', name: 'Nairobi (NBO)', city: 'Nairobi' },
    { code: 'LHR', name: 'London (LHR)', city: 'London' },
    { code: 'DOH', name: 'Doha (DOH)', city: 'Doha' },
  ];

  const handleSwap = () => {
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (fromCity) params.append('origin', fromCity);
    if (toCity) params.append('destination', toCity);
    if (departureDate) params.append('date', departureDate);
    router.push(`/flights?${params.toString()}`);
  };

  const popularDestinations = [
    {
      city: 'Dubai',
      code: 'DXB',
      price: '$520',
      type: 'Round Trip',
      duration: '2h 45m',
      stops: 'Direct',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
    },
    {
      city: 'Istanbul',
      code: 'IST',
      price: '$680',
      type: 'Round Trip',
      duration: '6h 20m',
      stops: '1 Stop',
      image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80',
    },
    {
      city: 'Nairobi',
      code: 'NBO',
      price: '$750',
      type: 'Round Trip',
      duration: '8h 15m',
      stops: '1 Stop',
      image: 'https://images.unsplash.com/photo-1619865668616-e57caeb67fc1?auto=format&fit=crop&w=800&q=80',
    },
    {
      city: 'London',
      code: 'LHR',
      price: '$820',
      type: 'Round Trip',
      duration: '10h 30m',
      stops: '1 Stop',
      image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
    },
    {
      city: 'Doha',
      code: 'DOH',
      price: '$640',
      type: 'Round Trip',
      duration: '6h 45m',
      stops: '1 Stop',
      image: 'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?auto=format&fit=crop&w=800&q=80',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] text-slate-800">
      {/* 1. Hero Section with Commercial Airliner & Dubai Sunset Skyline */}
      <section className="relative bg-[#081226] overflow-hidden pt-12 pb-24 lg:pt-16 lg:pb-36">
        {/* Airliner & Skyline Background Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-right lg:bg-center opacity-45 mix-blend-luminosity scale-105 pointer-events-none"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=2000&q=85')",
          }}
        />
        {/* Twilight Sky Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#081226] via-[#081226]/85 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#081226] via-transparent to-[#081226]/60 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-5">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-900/60 border border-blue-500/30 text-blue-300 text-xs font-semibold backdrop-blur-sm">
              <Plane className="w-3.5 h-3.5 text-blue-400 transform -rotate-45" />
              <span>Your Next Journey Awaits</span>
            </div>

            {/* Headline matching mockup */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12]">
              Book Your <span className="text-[#38bdf8]">Tickets</span> <br />
              to <span className="text-[#38bdf8]">Anywhere</span> in the World
            </h1>

            {/* Subtitle */}
            <p className="text-slate-300 text-base sm:text-lg font-normal tracking-wide">
              Fast • Secure • Best Prices
            </p>
          </div>
        </div>
      </section>

      {/* 2. Floating Search Box (Elevated white card overlapping Hero) */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 lg:-mt-24 z-20 w-full">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-100 p-5 sm:p-7">
          {/* Tabs: Flights / Hotels / Bus */}
          <div className="flex items-center gap-2 mb-5 border-b border-slate-100 pb-4">
            <button
              onClick={() => setActiveSearchTab('flights')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                activeSearchTab === 'flights'
                  ? 'bg-[#0066FF] text-white shadow-md shadow-blue-500/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Plane className="w-4 h-4 transform -rotate-45" />
              Flights
            </button>

            <button
              onClick={() => setActiveSearchTab('hotels')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                activeSearchTab === 'hotels'
                  ? 'bg-[#0066FF] text-white shadow-md shadow-blue-500/30'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Hotels
            </button>

            <button
              onClick={() => setActiveSearchTab('bus')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                activeSearchTab === 'bus'
                  ? 'bg-[#0066FF] text-white shadow-md shadow-blue-500/30'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Bus className="w-4 h-4" />
              Bus
            </button>
          </div>

          {/* Form Grid */}
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* From Selector (3 cols) */}
              <div className="md:col-span-3 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  From
                </span>
                <div className="flex items-center gap-2">
                  <Plane className="w-4 h-4 text-blue-600 shrink-0 transform -rotate-45" />
                  <select
                    value={fromCity}
                    onChange={(e) => setFromCity(e.target.value)}
                    className="w-full bg-transparent font-semibold text-slate-800 text-sm focus:outline-none cursor-pointer"
                  >
                    {airportOptions.map((opt) => (
                      <option key={opt.code} value={opt.code}>
                        {opt.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Swap Button (1 col or inline) */}
              <div className="flex justify-center md:col-span-1">
                <button
                  type="button"
                  onClick={handleSwap}
                  className="w-10 h-10 rounded-full border border-slate-200 bg-white text-blue-600 hover:bg-blue-50 hover:border-blue-300 flex items-center justify-center shadow-sm transition hover:scale-105 active:scale-95"
                  title="Swap Origin and Destination"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </button>
              </div>

              {/* To Selector (3 cols) */}
              <div className="md:col-span-3 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  To
                </span>
                <div className="flex items-center gap-2">
                  <Plane className="w-4 h-4 text-blue-600 shrink-0" />
                  <select
                    value={toCity}
                    onChange={(e) => setToCity(e.target.value)}
                    className="w-full bg-transparent font-semibold text-slate-800 text-sm focus:outline-none cursor-pointer"
                  >
                    {airportOptions.map((opt) => (
                      <option key={opt.code} value={opt.code}>
                        {opt.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Departure Date (2 cols) */}
              <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Departure Date
                </span>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                  <input
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="w-full bg-transparent font-semibold text-slate-800 text-sm focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Return Date / Passengers (1.5 cols) */}
              <div className="md:col-span-1.5 lg:col-span-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Return
                </span>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full bg-transparent font-semibold text-slate-800 text-xs focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Passengers (1.5 cols) */}
              <div className="md:col-span-1.5 lg:col-span-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Passengers
                </span>
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <select
                    value={passengers}
                    onChange={(e) => setPassengers(e.target.value)}
                    className="w-full bg-transparent font-semibold text-slate-800 text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="1 Adult">1 Adult</option>
                    <option value="2 Adults">2 Adults</option>
                    <option value="3 Adults">3 Adults</option>
                    <option value="Family (2+2)">Family</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                className="flex items-center justify-center gap-2.5 w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/35 hover:-translate-y-0.5 active:translate-y-0"
              >
                <Search className="w-4 h-4" />
                <span>Search Flights</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 3. Four Trust Badges matching mockup */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Badge 1: Secure Booking */}
          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-white border border-slate-150 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 leading-tight">Secure Booking</h4>
              <p className="text-xs text-slate-500 mt-0.5">Your data is always safe</p>
            </div>
          </div>

          {/* Badge 2: Best Price Guarantee */}
          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-white border border-slate-150 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Tag className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 leading-tight">Best Price Guarantee</h4>
              <p className="text-xs text-slate-500 mt-0.5">We match the lowest prices</p>
            </div>
          </div>

          {/* Badge 3: Instant Confirmation */}
          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-white border border-slate-150 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 leading-tight">Instant Confirmation</h4>
              <p className="text-xs text-slate-500 mt-0.5">Get your tickets in minutes</p>
            </div>
          </div>

          {/* Badge 4: 24/7 Customer Support */}
          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-white border border-slate-150 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 leading-tight">24/7 Customer Support</h4>
              <p className="text-xs text-slate-500 mt-0.5">We're here to help anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Popular Destinations Section matching mockup */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14 mb-16 w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Popular Destinations</h2>
            <p className="text-sm text-slate-500 mt-0.5">Explore top destinations and find the best deals</p>
          </div>
          <Link
            href="/flights"
            className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 transition"
          >
            <span>View All Destinations</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 5 Destination Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {popularDestinations.map((dest) => (
            <div
              key={dest.code}
              onClick={() => {
                router.push(`/flights?origin=MGQ&destination=${dest.code}`);
              }}
              className="group bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col hover:-translate-y-1"
            >
              {/* Image Container with Price Badge */}
              <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                <img
                  src={dest.image}
                  alt={dest.city}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2.5 right-2.5 bg-slate-950/85 backdrop-blur-md text-white rounded-lg px-2 py-1 text-right shadow-md">
                  <div className="text-xs font-black text-white">{dest.price}</div>
                  <div className="text-[9px] text-slate-300 font-medium leading-none">{dest.type}</div>
                </div>
              </div>

              {/* Destination Details */}
              <div className="p-3.5 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>
                      {dest.city} <span className="text-xs text-slate-400 font-normal">({dest.code})</span>
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{dest.duration}</span>
                    <span>•</span>
                    <span>{dest.stops}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Bottom CTA Banner matching mockup */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 w-full">
        <div className="relative rounded-2xl bg-gradient-to-r from-[#0b1736] via-[#0e214d] to-[#0a193b] text-white p-7 sm:p-10 shadow-xl overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Decorative aura */}
          <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-5 z-10">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center shrink-0">
              <Send className="w-7 h-7 text-blue-400 transform rotate-12" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight">Ready to Fly?</h3>
              <p className="text-sm text-slate-300 mt-1 max-w-lg">
                Book now and start your next adventure with SkyTickets.
              </p>
            </div>
          </div>

          <Link
            href="/flights"
            className="z-10 flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white font-bold text-sm shadow-lg shadow-blue-500/30 transition hover:scale-105 active:scale-95 shrink-0"
          >
            <span>Book Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
