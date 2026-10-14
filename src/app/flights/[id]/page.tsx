'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-context';
import {
  Plane,
  Clock,
  MapPin,
  Calendar,
  Luggage,
  Sparkles,
  ShieldCheck,
  Check,
  User,
  ArrowRight,
  AlertCircle,
  Wifi,
  Coffee,
  Info,
} from 'lucide-react';
import AirplaneLandingLoader from '@/components/AirplaneLandingLoader';

export default function FlightDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();

  const [flight, setFlight] = useState<any>(null);
  const [selectedTierId, setSelectedTierId] = useState<string>('');
  const [passengerCount, setPassengerCount] = useState<number>(1);
  const [passengers, setPassengers] = useState<Array<{ name: string; passport: string; seatPreference: string }>>([
    { name: '', passport: '', seatPreference: 'Window' },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/flights/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setFlight(data.flight);
        if (data.flight.tiers && data.flight.tiers.length > 0) {
          setSelectedTierId(data.flight.tiers[0].id);
        }
      })
      .catch((err) => setError(err.message || 'Error loading flight'))
      .finally(() => setLoading(false));
  }, [params.id]);

  // Adjust passenger input fields when count changes
  const handlePassengerCountChange = (count: number) => {
    setPassengerCount(count);
    const newPassengers = [...passengers];
    while (newPassengers.length < count) {
      newPassengers.push({ name: '', passport: '', seatPreference: 'Window' });
    }
    setPassengers(newPassengers.slice(0, count));
  };

  const updatePassenger = (index: number, field: string, value: string) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const handleProceedToCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push(`/login?redirect=/flights/${params.id}`);
      return;
    }

    // Validate that passenger names are filled
    for (let i = 0; i < passengers.length; i++) {
      if (!passengers[i].name.trim()) {
        setError(`Please enter the full name for Passenger ${i + 1}`);
        return;
      }
    }

    const selectedTier = flight.tiers.find((t: any) => t.id === selectedTierId);
    if (!selectedTier || selectedTier.remainingSeats < passengerCount) {
      setError('Not enough available seats in this cabin class.');
      return;
    }

    // Store pending booking details in session storage
    const bookingData = {
      flightId: flight.id,
      flightNumber: flight.flightNumber,
      ticketTierId: selectedTierId,
      tierName: selectedTier.name,
      cabinClass: selectedTier.cabinClass,
      unitPrice: selectedTier.price,
      passengerCount,
      passengers,
      totalAmount: selectedTier.price * passengerCount,
    };

    sessionStorage.setItem('pending_booking', JSON.stringify(bookingData));
    router.push(`/checkout/${flight.id}`);
  };

  if (loading) {
    return (
      <AirplaneLandingLoader
        title="Retrieving Flight Details & Live Cabin"
        subtitle="Loading aircraft configuration and seat inventory..."
        fullScreen={true}
      />
    );
  }

  if (error || !flight) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-rose-200 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Flight Not Available</h2>
          <p className="text-xs text-slate-600">{error || 'Flight not found'}</p>
          <Link
            href="/flights"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
          >
            ← Return to Flights
          </Link>
        </div>
      </div>
    );
  }

  const selectedTier = flight.tiers.find((t: any) => t.id === selectedTierId) || flight.tiers[0];
  const totalAmount = selectedTier ? selectedTier.price * passengerCount : 0;

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/flights" className="hover:text-blue-600">
            Flights
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-900">{flight.flightNumber}</span>
          <span>/</span>
          <span>{flight.originCity} to {flight.destinationCity}</span>
        </div>

        {/* Flight Header Card */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-lg text-xs font-black bg-blue-600 text-white shadow-sm">
                  {flight.flightNumber}
                </span>
                <span className="text-xs text-slate-300 font-medium">{flight.aircraft}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  {flight.status}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black">
                {flight.originCity} ({flight.originCode}) → {flight.destinationCity} ({flight.destinationCode})
              </h1>
              <p className="text-xs text-slate-400 max-w-xl">{flight.description}</p>
            </div>

            {/* Timings Card */}
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 flex items-center gap-6">
              <div>
                <p className="text-xs text-slate-400">Departure</p>
                <p className="text-xl font-bold">{flight.originCode}</p>
                <p className="text-xs text-slate-300">
                  {new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-[11px] text-slate-500">{flight.terminal || 'T1'} • Gate {flight.gate || 'TBA'}</p>
              </div>

              <div className="text-center px-2">
                <span className="text-[10px] text-slate-400 font-bold">{flight.duration}</span>
                <div className="w-16 h-px bg-slate-600 my-1 relative">
                  <Plane className="w-3 h-3 text-blue-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-90" />
                </div>
                <span className="text-[9px] text-emerald-400">Direct Flight</span>
              </div>

              <div>
                <p className="text-xs text-slate-400">Arrival</p>
                <p className="text-xl font-bold">{flight.destinationCode}</p>
                <p className="text-xs text-slate-300">
                  {new Date(flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-[11px] text-slate-500">Destination</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Selection Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Cabin Class Selector & Passenger Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* 1. Cabin Class & Fare Tier Selector */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <span>1. Select Cabin Class & Fare</span>
                </h2>
                <span className="text-xs text-slate-500">All fares include seat allocation</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {flight.tiers.map((tier: any) => {
                  const isSelected = tier.id === selectedTierId;
                  const isSoldOut = tier.remainingSeats <= 0;

                  return (
                    <div
                      key={tier.id}
                      onClick={() => !isSoldOut && setSelectedTierId(tier.id)}
                      className={`relative p-5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                        isSoldOut
                          ? 'border-slate-200 bg-slate-100 opacity-60 cursor-not-allowed'
                          : isSelected
                          ? 'border-blue-600 bg-blue-50/40 shadow-md ring-2 ring-blue-600/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-slate-900 text-base">{tier.name}</h3>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {tier.cabinClass.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-slate-900">${tier.price}</span>
                          <span className="text-xs text-slate-500">/ passenger</span>
                        </div>

                        {/* Inventory counter */}
                        <div>
                          {isSoldOut ? (
                            <span className="text-xs font-bold text-rose-600">Sold Out</span>
                          ) : tier.remainingSeats < 10 ? (
                            <span className="text-xs font-bold text-amber-600">
                              Only {tier.remainingSeats} seats remaining!
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500">
                              {tier.remainingSeats} seats available
                            </span>
                          )}
                        </div>

                        <div className="pt-2 text-xs text-slate-600 space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                            <Luggage className="w-3.5 h-3.5 text-blue-600" />
                            <span>{tier.baggage}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 pt-1 leading-relaxed">
                            {tier.benefits}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Passenger Details Form */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <span>2. Passenger Information</span>
                </h2>

                <div className="flex items-center gap-2 text-xs">
                  <label className="text-slate-600 font-semibold">Travelers:</label>
                  <select
                    value={passengerCount}
                    onChange={(e) => handlePassengerCountChange(parseInt(e.target.value, 10))}
                    className="px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[1, 2, 3, 4].map((num) => (
                      <option key={num} value={num}>
                        {num} Passenger{num > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-5">
                {passengers.map((p, index) => (
                  <div key={index} className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                      Passenger {index + 1}
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Full Legal Name (as on ID / Passport) *
                        </label>
                        <input
                          type="text"
                          required
                          value={p.name}
                          onChange={(e) => updatePassenger(index, 'name', e.target.value)}
                          placeholder="e.g. John Alexander Smith"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Seat Preference
                        </label>
                        <select
                          value={p.seatPreference}
                          onChange={(e) => updatePassenger(index, 'seatPreference', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Window">Window</option>
                          <option value="Aisle">Aisle</option>
                          <option value="Middle">Middle / Extra Legroom</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Passport / National ID (Optional)
                        </label>
                        <input
                          type="text"
                          value={p.passport}
                          onChange={(e) => updatePassenger(index, 'passport', e.target.value)}
                          placeholder="e.g. US10928391"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Col: Price Summary & Checkout Action */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-6 sticky top-24">
              <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-100 pb-3">
                Fare Summary
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Selected Fare:</span>
                  <span className="font-semibold text-slate-900">{selectedTier?.name}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Base Price per ticket:</span>
                  <span className="font-semibold text-slate-900">${selectedTier?.price}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Number of Passengers:</span>
                  <span className="font-semibold text-slate-900">{passengerCount}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Airport Taxes & Security:</span>
                  <span className="font-semibold text-emerald-600">Included ($0.00)</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
                <div>
                  <span className="text-xs uppercase font-bold text-slate-500 block">Total Due</span>
                  <span className="text-3xl font-black text-slate-900">${totalAmount}</span>
                </div>
                <span className="text-xs text-slate-500">USD</span>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleProceedToCheckout}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/30 transition transform hover:-translate-y-0.5"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span>Guaranteed transactional seat reservation</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                  <span>HMAC-SHA256 digital boarding pass issued upon payment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
