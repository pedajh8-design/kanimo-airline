'use client';

import React, { useState, useEffect } from 'react';
import {
  Plane,
  PlusCircle,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Edit,
  Trash2,
  Users,
} from 'lucide-react';

export default function AdminFlightsPage() {
  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New flight form state
  const [flightNumber, setFlightNumber] = useState('');
  const [origin, setOrigin] = useState('');
  const [originCode, setOriginCode] = useState('');
  const [destination, setDestination] = useState('');
  const [destinationCode, setDestinationCode] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [duration, setDuration] = useState('4h 00m');
  const [aircraft, setAircraft] = useState('Boeing 787-9 Dreamliner');
  const [category, setCategory] = useState('International');
  const [terminal, setTerminal] = useState('Terminal 4');
  const [gate, setGate] = useState('B22');
  const [createLoading, setCreateLoading] = useState(false);

  const fetchFlights = async () => {
    try {
      const res = await fetch('/api/flights');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch flights');
      setFlights(data.flights || []);
    } catch (err: any) {
      setError(err.message || 'Error loading flights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, []);

  const handleStatusChange = async (flightId: string, newStatus: string) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('kanimo_token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/flights/${flightId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update flight status');
      }

      fetchFlights();
    } catch (err: any) {
      alert(err.message || 'Error updating status');
    }
  };

  const handleCreateFlight = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setError('');

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('kanimo_token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/flights', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          flightNumber,
          origin,
          originCode,
          originCity: origin,
          destination,
          destinationCode,
          destinationCity: destination,
          departureTime,
          arrivalTime,
          duration,
          aircraft,
          category,
          terminal,
          gate,
          tiers: [
            { name: 'Economy Classic', cabinClass: 'ECONOMY', price: 390.0, capacity: 160 },
            { name: 'Business Executive', cabinClass: 'BUSINESS', price: 1850.0, capacity: 28 },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create flight');

      setShowCreateModal(false);
      setFlightNumber('');
      setOrigin('');
      setDestination('');
      fetchFlights();
    } catch (err: any) {
      setError(err.message || 'Error creating flight');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Fleet Schedule & Capacity
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
            Flight Inventory Management
          </h1>
          <p className="text-xs text-slate-400">
            Control flight schedules, gate assignments, and real-time cabin tier inventory.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Flight Listing</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/40 border border-rose-800 rounded-2xl text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Flight Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800 tracking-wider">
              <tr>
                <th className="p-4">Flight</th>
                <th className="p-4">Route</th>
                <th className="p-4">Aircraft</th>
                <th className="p-4">Departure Time</th>
                <th className="p-4">Gate / Term</th>
                <th className="p-4">Capacity & Sold</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {flights.map((f) => {
                const totalSold = f.tiers?.reduce((acc: number, t: any) => acc + t.soldCount, 0) || 0;
                const totalCap = f.tiers?.reduce((acc: number, t: any) => acc + t.capacity, 0) || 0;

                return (
                  <tr key={f.id} className="hover:bg-slate-800/50 transition">
                    <td className="p-4">
                      <span className="font-mono font-bold text-white text-sm block">
                        {f.flightNumber}
                      </span>
                      <span className="text-[10px] text-slate-500">{f.category}</span>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-white">
                        {f.originCode} → {f.destinationCode}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[140px]">
                        {f.originCity} to {f.destinationCity}
                      </div>
                    </td>

                    <td className="p-4 text-slate-400 font-medium">{f.aircraft}</td>

                    <td className="p-4">
                      <div className="text-white font-medium">
                        {new Date(f.departureTime).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(f.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="text-white font-bold">{f.gate || 'TBA'}</span>
                      <span className="text-[10px] text-slate-500 block">{f.terminal || 'T1'}</span>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{totalSold}</span>
                        <span className="text-slate-500">/ {totalCap} seats</span>
                      </div>
                      <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                        <div
                          className="bg-blue-500 h-full rounded-full"
                          style={{ width: `${totalCap > 0 ? (totalSold / totalCap) * 100 : 0}%` }}
                        />
                      </div>
                    </td>

                    <td className="p-4">
                      <select
                        value={f.status}
                        onChange={(e) => handleStatusChange(f.id, e.target.value)}
                        className="bg-slate-950 border border-slate-700 text-xs rounded-lg px-2.5 py-1 text-white font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                      >
                        <option value="SCHEDULED">SCHEDULED</option>
                        <option value="BOARDING">BOARDING</option>
                        <option value="DEPARTED">DEPARTED</option>
                        <option value="DELAYED">DELAYED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Flight Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 border border-slate-800 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold">Add New Flight Schedule</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFlight} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Flight Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value)}
                    placeholder="KN-780"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Aircraft</label>
                  <input
                    type="text"
                    value={aircraft}
                    onChange={(e) => setAircraft(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Origin City</label>
                  <input
                    type="text"
                    required
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="Chicago"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Origin Code</label>
                  <input
                    type="text"
                    required
                    value={originCode}
                    onChange={(e) => setOriginCode(e.target.value)}
                    placeholder="ORD"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Destination City</label>
                  <input
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Seattle"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Destination Code</label>
                  <input
                    type="text"
                    required
                    value={destinationCode}
                    onChange={(e) => setDestinationCode(e.target.value)}
                    placeholder="SEA"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Departure Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Arrival Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition disabled:opacity-50"
                >
                  {createLoading ? 'Creating Flight...' : 'Create Flight'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
