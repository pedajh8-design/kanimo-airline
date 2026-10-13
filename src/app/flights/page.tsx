'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Plane,
  Clock,
  MapPin,
  Calendar,
  Filter,
  Search,
  Sparkles,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  Luggage,
} from 'lucide-react';

function FlightsContent() {
  const searchParams = useSearchParams();
  const initialOrigin = searchParams.get('origin') || '';
  const initialDest = searchParams.get('destination') || '';
  const initialClass = searchParams.get('cabinClass') || 'ALL';

  const [origin, setOrigin] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDest);
  const [cabinClass, setCabinClass] = useState(initialClass);
  const [category, setCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('price');

  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFlights = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (origin) params.append('origin', origin);
      if (destination) params.append('destination', destination);
      if (cabinClass && cabinClass !== 'ALL') params.append('cabinClass', cabinClass);
      if (category && category !== 'ALL') params.append('category', category);

      const res = await fetch(`/api/flights?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch flights');

      let sorted = data.flights || [];
      if (sortBy === 'price') {
        sorted.sort((a: any, b: any) => a.minPrice - b.minPrice);
      } else if (sortBy === 'departure') {
        sorted.sort((a: any, b: any) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime());
      }
      setFlights(sorted);
    } catch (err: any) {
      setError(err.message || 'Error loading flights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, [origin, destination, cabinClass, category, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFlights();
  };

  const clearFilters = () => {
    setOrigin('');
    setDestination('');
    setCabinClass('ALL');
    setCategory('ALL');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-xl border border-slate-800">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-blue-400">
              Kanimo Network Fleet
            </span>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Explore Available Flights & Fares
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm font-light">
              Real-time seat inventory, guaranteed reservations with transactional concurrency protection, and instant digital ticketing.
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {/* General query */}
            <div className="md:col-span-2 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search flight number, city, or aircraft..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            {/* Cabin Class */}
            <div>
              <select
                value={cabinClass}
                onChange={(e) => setCabinClass(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="ALL">All Cabin Classes</option>
                <option value="ECONOMY">Economy Classic</option>
                <option value="PREMIUM_ECONOMY">Premium Comfort</option>
                <option value="BUSINESS">Business Executive</option>
                <option value="FIRST">Royal First Class</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="ALL">All Route Categories</option>
                <option value="International">International</option>
                <option value="Domestic">Domestic</option>
                <option value="Luxury Charter">Luxury Charter</option>
              </select>
            </div>

            {/* Sort order */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="price">Sort: Lowest Fare</option>
                <option value="departure">Sort: Earliest Departure</option>
              </select>
            </div>
          </form>

          {(origin || destination || cabinClass !== 'ALL' || category !== 'ALL' || searchQuery) && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-500">Active filters applied</span>
              <button
                type="button"
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Results Stream */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 bg-slate-200 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-rose-200 text-rose-600">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p className="font-semibold text-sm">{error}</p>
          </div>
        ) : flights.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
              <Plane className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">No scheduled flights match your search</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try widening your search terms, selecting "All Cabin Classes", or clearing your filters.
              </p>
            </div>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {flights.map((flight) => (
              <div
                key={flight.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition duration-200 p-5 sm:p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Flight Info & Route */}
                  <div className="space-y-4 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-blue-50 text-blue-700 border border-blue-200">
                        {flight.flightNumber}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {flight.aircraft}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold">
                        {flight.category}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold">
                        {flight.status}
                      </span>
                    </div>

                    {/* Flight Times & Airports */}
                    <div className="grid grid-cols-3 items-center max-w-lg gap-2">
                      {/* Origin */}
                      <div>
                        <p className="text-2xl font-black text-slate-900">{flight.originCode}</p>
                        <p className="text-xs text-slate-600 truncate">{flight.originCity}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      {/* Flight path line & duration */}
                      <div className="text-center px-2">
                        <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                          {flight.duration}
                        </span>
                        <div className="flex items-center gap-1">
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                          <div className="h-0.5 bg-blue-300 flex-1 relative">
                            <Plane className="w-3.5 h-3.5 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-90" />
                          </div>
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                        </div>
                        <span className="text-[10px] text-emerald-600 font-semibold block mt-1">Non-stop</span>
                      </div>

                      {/* Destination */}
                      <div className="text-right">
                        <p className="text-2xl font-black text-slate-900">{flight.destinationCode}</p>
                        <p className="text-xs text-slate-600 truncate">{flight.destinationCity}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                      <span>Departure: {new Date(flight.departureTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      <span>Terminal: {flight.terminal || 'Main'}</span>
                      <span>Gate: {flight.gate || 'TBA'}</span>
                    </div>
                  </div>

                  {/* Tier Badges & Action */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-end justify-between border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6 min-w-[200px] gap-4">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Fares Starting At
                      </span>
                      <span className="text-3xl font-black text-slate-900">${flight.minPrice}</span>
                      <div className="mt-1">
                        {flight.availableSeats <= 10 ? (
                          <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Only {flight.availableSeats} seats left!
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500">
                            {flight.availableSeats} seats available
                          </span>
                        )}
                      </div>
                    </div>

                    <Link
                      href={`/flights/${flight.id}`}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition transform hover:-translate-y-0.5"
                    >
                      <span>Select Fare & Seats</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Cabin Tier Preview Tabs */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                  {flight.tiers.map((tier: any) => (
                    <div
                      key={tier.id}
                      className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center gap-2"
                    >
                      <span className="font-semibold text-slate-800">{tier.name}:</span>
                      <span className="font-bold text-blue-600">${tier.price}</span>
                      <span className="text-[10px] text-slate-500">({tier.remainingSeats} left)</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FlightsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <FlightsContent />
    </Suspense>
  );
}
