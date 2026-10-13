import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Plane,
  Ticket,
  Luggage,
  LifeBuoy,
  User,
  Search,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Send,
  PlusCircle,
  CreditCard,
  Lock,
  RefreshCw,
  Settings,
  Wifi,
  WifiOff,
} from 'lucide-react';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'explore' | 'wallet' | 'orders' | 'support' | 'profile'>('explore');

  // API Config (Defaults to current window host or Android emulator loopback 10.0.2.2:3000)
  const [apiBaseUrl, setApiBaseUrl] = useState(() => {
    return localStorage.getItem('kanimo_api_url') || 'https://kanimo-airline.vercel.app';
  });
  const [showSettings, setShowSettings] = useState(false);
  const [customApiUrl, setCustomApiUrl] = useState(apiBaseUrl);

  // Auth State
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem('kanimo_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('kanimo_token');
  });

  // Auth Forms
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER' | 'FORGOT'>('LOGIN');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Data States
  const [flights, setFlights] = useState<any[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<any>(null);
  const [searchOrigin, setSearchOrigin] = useState('');
  const [searchDest, setSearchDest] = useState('');
  const [filterClass, setFilterClass] = useState('ALL');
  const [loadingFlights, setLoadingFlights] = useState(false);

  // Booking Flow in Mobile Modal
  const [selectedTierId, setSelectedTierId] = useState('');
  const [passengerName, setPassengerName] = useState('');
  const [passengerPassport, setPassengerPassport] = useState('');
  const [seatPreference, setSeatPreference] = useState('Window');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState<any>(null);

  // Tickets Wallet & QR state
  const [tickets, setTickets] = useState<any[]>(() => {
    const cached = localStorage.getItem('kanimo_cached_tickets');
    return cached ? JSON.parse(cached) : [];
  });
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Support State
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [selectedSupport, setSelectedSupport] = useState<any>(null);
  const [newSupportSubject, setNewSupportSubject] = useState('');
  const [newSupportMessage, setNewSupportMessage] = useState('');
  const [newSupportCategory, setNewSupportCategory] = useState('BOOKING_CHANGE');
  const [showNewSupportModal, setShowNewSupportModal] = useState(false);
  const [supportComment, setSupportComment] = useState('');
  const [supportLoading, setSupportLoading] = useState(false);

  // Network Banner
  const [networkError, setNetworkError] = useState('');

  // ----------------------------------------------------
  // Sync Data on Tab Change
  // ----------------------------------------------------
  useEffect(() => {
    fetchFlights();
  }, [apiBaseUrl, searchOrigin, searchDest, filterClass]);

  useEffect(() => {
    if (user && token) {
      if (activeTab === 'wallet') fetchTickets();
      if (activeTab === 'orders') fetchOrders();
      if (activeTab === 'support') fetchSupport();
    }
  }, [activeTab, user, token, apiBaseUrl]);

  // QR canvas renderer
  useEffect(() => {
    if (selectedTicket && qrCanvasRef.current) {
      QRCode.toCanvas(qrCanvasRef.current, selectedTicket.qrSecurityPayload, {
        width: 190,
        margin: 2,
        color: { dark: '#0f172a', light: '#ffffff' },
      }).catch(console.error);
    }
  }, [selectedTicket]);

  const saveApiUrl = (url: string) => {
    setApiBaseUrl(url);
    localStorage.setItem('kanimo_api_url', url);
    setShowSettings(false);
  };

  // ----------------------------------------------------
  // API Calls
  // ----------------------------------------------------
  const fetchFlights = async () => {
    setLoadingFlights(true);
    setNetworkError('');
    try {
      const params = new URLSearchParams();
      if (searchOrigin) params.append('origin', searchOrigin);
      if (searchDest) params.append('destination', searchDest);
      if (filterClass !== 'ALL') params.append('cabinClass', filterClass);

      const res = await fetch(`${apiBaseUrl}/api/flights?${params.toString()}`);
      if (!res.ok) throw new Error('Could not connect to Kanimo Airline backend');
      const data = await res.json();
      setFlights(data.flights || []);
    } catch (err: any) {
      setNetworkError(err.message || 'Network connection error');
    } finally {
      setLoadingFlights(false);
    }
  };

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
        localStorage.setItem('kanimo_cached_tickets', JSON.stringify(data.tickets || []));
      }
    } catch (err) {
      // Keep cached tickets in offline mode
    }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchSupport = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/support`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSupportTickets(data.supportTickets || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ----------------------------------------------------
  // Authentication Actions
  // ----------------------------------------------------
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setAuthLoading(true);

    try {
      if (authMode === 'LOGIN') {
        const res = await fetch(`${apiBaseUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: authEmail, password: authPassword }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Authentication failed');

        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('kanimo_user', JSON.stringify(data.user));
        localStorage.setItem('kanimo_token', data.token);
        setActiveTab('explore');
      } else if (authMode === 'REGISTER') {
        const res = await fetch(`${apiBaseUrl}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: authName, email: authEmail, password: authPassword, phone: authPhone }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');

        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('kanimo_user', JSON.stringify(data.user));
        localStorage.setItem('kanimo_token', data.token);
        setActiveTab('explore');
      } else if (authMode === 'FORGOT') {
        const res = await fetch(`${apiBaseUrl}/api/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: authEmail }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Request failed');
        setAuthSuccess(data.message || 'Recovery instructions sent.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Auth failure');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('kanimo_user');
    localStorage.removeItem('kanimo_token');
    setActiveTab('explore');
  };

  const fastFillAccount = (email: string, pass: string) => {
    setAuthEmail(email);
    setAuthPassword(pass);
    setAuthError('');
  };

  // ----------------------------------------------------
  // Booking Action
  // ----------------------------------------------------
  const handleBookTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setActiveTab('profile');
      return;
    }

    setBookingLoading(true);
    setBookingError('');
    setBookingSuccess(null);

    try {
      const res = await fetch(`${apiBaseUrl}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          flightId: selectedFlight.id,
          ticketTierId: selectedTierId,
          paymentMethod: 'DEMO_PAYMENT',
          passengers: [{ name: passengerName || user.name, passport: passengerPassport, seatPreference }],
          contactEmail: user.email,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Booking reservation failed');

      setBookingSuccess(data);
      fetchTickets();
      fetchOrders();
    } catch (err: any) {
      setBookingError(err.message || 'Reservation error');
    } finally {
      setBookingLoading(false);
    }
  };

  // ----------------------------------------------------
  // Support Action
  // ----------------------------------------------------
  const handleCreateSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupportLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/support`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject: newSupportSubject,
          category: newSupportCategory,
          initialMessage: newSupportMessage,
        }),
      });

      if (!res.ok) throw new Error('Could not submit inquiry');
      setShowNewSupportModal(false);
      setNewSupportSubject('');
      setNewSupportMessage('');
      fetchSupport();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSupportLoading(false);
    }
  };

  const handleSendSupportComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportComment.trim() || !selectedSupport) return;
    try {
      const res = await fetch(`${apiBaseUrl}/api/support/${selectedSupport.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: supportComment }),
      });
      if (res.ok) {
        setSupportComment('');
        fetchSupport();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Status & Brand Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between z-20 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
            <Plane className="w-4 h-4 text-white transform -rotate-45" />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-wider text-white">
              KANIMO <span className="text-blue-400 font-light">AIRLINE</span>
            </span>
            <span className="text-[9px] text-slate-400 block -mt-1 font-mono">Mobile App</span>
          </div>
        </div>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
        >
          <Settings className="w-4 h-4" />
        </button>
      </header>

      {/* Network Alert Banner */}
      {networkError && (
        <div className="bg-rose-950 border-b border-rose-800 px-4 py-2 text-[11px] text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WifiOff className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Server unreachable at {apiBaseUrl}. Configure API Host in settings.</span>
          </div>
          <button onClick={() => setShowSettings(true)} className="underline font-bold ml-2">
            Settings
          </button>
        </div>
      )}

      {/* Settings Modal (API host changer) */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-sm w-full p-6 border border-slate-800 space-y-4 shadow-2xl">
            <h3 className="font-bold text-sm text-white">Backend Server URL</h3>
            <p className="text-xs text-slate-400">
              Configure the API host the Android client connects to:
            </p>

            <input
              type="text"
              value={customApiUrl}
              onChange={(e) => setCustomApiUrl(e.target.value)}
              placeholder="http://10.0.2.2:3000"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white"
            />

            <div className="space-y-1.5 text-[11px] text-slate-400">
              <button
                type="button"
                onClick={() => setCustomApiUrl('https://kanimo-airline.vercel.app')}
                className="w-full text-left px-2 py-1 bg-blue-600/30 border border-blue-500/50 rounded hover:bg-blue-600/50 block text-blue-200 font-bold"
              >
                🌐 Live Production: https://kanimo-airline.vercel.app
              </button>
              <button
                type="button"
                onClick={() => setCustomApiUrl('http://192.168.1.102:3000')}
                className="w-full text-left px-2 py-1 bg-slate-800 rounded hover:bg-slate-700 block text-emerald-300 font-medium"
              >
                📶 Local Wi-Fi: http://192.168.1.102:3000
              </button>
              <button
                type="button"
                onClick={() => setCustomApiUrl('http://10.0.2.2:3000')}
                className="w-full text-left px-2 py-1 bg-slate-800 rounded hover:bg-slate-700 block text-blue-300"
              >
                📱 Android Emulator: http://10.0.2.2:3000
              </button>
              <button
                type="button"
                onClick={() => setCustomApiUrl('http://localhost:3000')}
                className="w-full text-left px-2 py-1 bg-slate-800 rounded hover:bg-slate-700 block text-blue-300"
              >
                💻 Web / Localhost: http://localhost:3000
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSettings(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => saveApiUrl(customApiUrl)}
                className="px-4 py-1.5 bg-blue-600 rounded-xl text-xs font-bold text-white shadow-sm"
              >
                Save Server URL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Screen Content Body */}
      <main className="flex-1 overflow-y-auto pb-20">
        {/* ========================================== */}
        {/* TAB 1: EXPLORE / FLIGHTS                   */}
        {/* ========================================== */}
        {activeTab === 'explore' && (
          <div className="p-4 space-y-4">
            {/* Search Bar */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  Find Scheduled Flights
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {flights.length} Direct Routes
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={searchOrigin}
                  onChange={(e) => setSearchOrigin(e.target.value)}
                  placeholder="From (JFK, SFO...)"
                  className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500"
                />
                <input
                  type="text"
                  value={searchDest}
                  onChange={(e) => setSearchDest(e.target.value)}
                  placeholder="To (LHR, HND...)"
                  className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500"
                />
              </div>

              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
              >
                <option value="ALL">All Cabin Classes</option>
                <option value="ECONOMY">Economy Classic</option>
                <option value="PREMIUM_ECONOMY">Premium Comfort</option>
                <option value="BUSINESS">Business Executive</option>
                <option value="FIRST">Royal First Class</option>
              </select>
            </div>

            {/* Flight Cards Stream */}
            {loadingFlights ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-slate-900 animate-pulse rounded-2xl border border-slate-800" />
                ))}
              </div>
            ) : flights.length === 0 ? (
              <div className="p-8 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                No flights matching search criteria.
              </div>
            ) : (
              <div className="space-y-3">
                {flights.map((f) => (
                  <div
                    key={f.id}
                    className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3 shadow-sm hover:border-slate-700 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">
                          {f.flightNumber}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate max-w-[150px]">
                          {f.aircraft}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold uppercase text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                        {f.status}
                      </span>
                    </div>

                    {/* Route Visualizer */}
                    <div className="flex items-center justify-between py-1">
                      <div>
                        <p className="text-xl font-black text-white">{f.originCode}</p>
                        <p className="text-[11px] text-slate-400">{f.originCity}</p>
                      </div>

                      <div className="flex flex-col items-center flex-1 px-4">
                        <span className="text-[10px] text-slate-500 font-bold">{f.duration}</span>
                        <div className="w-full flex items-center gap-1">
                          <div className="h-1 w-1 rounded-full bg-blue-500" />
                          <div className="h-0.5 bg-blue-500/40 flex-1 relative">
                            <Plane className="w-3 h-3 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90" />
                          </div>
                          <div className="h-1 w-1 rounded-full bg-blue-500" />
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xl font-black text-white">{f.destinationCode}</p>
                        <p className="text-[11px] text-slate-400">{f.destinationCity}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-500 block">From</span>
                        <span className="text-base font-black text-white">${f.minPrice}</span>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedFlight(f);
                          setSelectedTierId(f.tiers[0]?.id || '');
                          setPassengerName(user?.name || '');
                          setBookingSuccess(null);
                          setBookingError('');
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20"
                      >
                        Book Flight
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 2: MY WALLET & BOARDING PASSES        */}
        {/* ========================================== */}
        {activeTab === 'wallet' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white">Digital Boarding Passes</h2>
                <p className="text-[11px] text-slate-400">HMAC-SHA256 authenticated kiosk passes</p>
              </div>
              <button
                onClick={fetchTickets}
                className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {!user ? (
              <div className="p-8 text-center bg-slate-900 rounded-3xl border border-slate-800 space-y-3">
                <Ticket className="w-10 h-10 text-blue-500 mx-auto" />
                <h3 className="text-sm font-bold text-white">Sign In to View Passes</h3>
                <p className="text-xs text-slate-400">
                  Access your issued boarding passes with offline QR codes.
                </p>
                <button
                  onClick={() => setActiveTab('profile')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
                >
                  Sign In
                </button>
              </div>
            ) : tickets.length === 0 ? (
              <div className="p-8 text-center bg-slate-900 rounded-3xl border border-slate-800 space-y-3">
                <Plane className="w-8 h-8 text-slate-600 mx-auto" />
                <h3 className="text-sm font-bold text-white">No Tickets Found</h3>
                <p className="text-xs text-slate-400">You haven't booked any trips yet.</p>
                <button
                  onClick={() => setActiveTab('explore')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
                >
                  Explore Flights
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-3 shadow-md cursor-pointer hover:border-slate-700 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-blue-400">
                        {t.flight.flightNumber}
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          t.status === 'CHECKED_IN'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-blue-950 text-blue-400 border border-blue-800'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-black text-white">{t.flight.originCode}</p>
                        <p className="text-[10px] text-slate-400">{t.flight.originCity}</p>
                      </div>

                      <Plane className="w-4 h-4 text-blue-500 transform rotate-90" />

                      <div className="text-right">
                        <p className="text-2xl font-black text-white">{t.flight.destinationCode}</p>
                        <p className="text-[10px] text-slate-400">{t.flight.destinationCity}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center text-xs">
                      <div className="bg-slate-950 p-2 rounded-xl">
                        <span className="text-[9px] text-slate-500 uppercase block font-bold">Passenger</span>
                        <span className="font-bold text-white truncate block">{t.passengerName}</span>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-xl">
                        <span className="text-[9px] text-slate-500 uppercase block font-bold">Seat</span>
                        <span className="font-black text-blue-400 block">{t.seatNumber}</span>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-xl">
                        <span className="text-[9px] text-slate-500 uppercase block font-bold">Gate</span>
                        <span className="font-bold text-white block">{t.flight.gate || 'TBA'}</span>
                      </div>
                    </div>

                    <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-mono">{t.ticketNumber}</span>
                      <span className="text-blue-400 font-bold flex items-center gap-1">
                        View QR Pass <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 3: BOOKINGS / ORDERS                   */}
        {/* ========================================== */}
        {activeTab === 'orders' && (
          <div className="p-4 space-y-4">
            <h2 className="text-lg font-black text-white">Purchase History & Receipts</h2>

            {!user ? (
              <div className="p-8 text-center bg-slate-900 rounded-3xl border border-slate-800 space-y-3">
                <Luggage className="w-10 h-10 text-blue-500 mx-auto" />
                <h3 className="text-sm font-bold text-white">Sign In to View Orders</h3>
                <button
                  onClick={() => setActiveTab('profile')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
                >
                  Sign In
                </button>
              </div>
            ) : orders.length === 0 ? (
              <div className="p-8 text-center bg-slate-900 rounded-3xl border border-slate-800 text-slate-400 text-xs">
                No purchases on record.
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((o) => (
                  <div key={o.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-white">{o.orderNumber}</span>
                      <span
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          o.status === 'PAID'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {o.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <p className="text-xs font-bold text-white">
                          Flight {o.flight?.flightNumber} ({o.flight?.originCode} → {o.flight?.destinationCode})
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {o.passengerCount} traveler(s) • {new Date(o.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-base font-black text-white">${o.totalAmount}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 4: SUPPORT DESK                        */}
        {/* ========================================== */}
        {activeTab === 'support' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white">Passenger Support</h2>
                <p className="text-[11px] text-slate-400">Kanimo 24/7 Concierge Service</p>
              </div>
              {user && (
                <button
                  onClick={() => setShowNewSupportModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Open Ticket</span>
                </button>
              )}
            </div>

            {!user ? (
              <div className="p-8 text-center bg-slate-900 rounded-3xl border border-slate-800 space-y-3">
                <LifeBuoy className="w-10 h-10 text-blue-500 mx-auto" />
                <h3 className="text-sm font-bold text-white">Sign In for Assistance</h3>
                <button
                  onClick={() => setActiveTab('profile')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
                >
                  Sign In
                </button>
              </div>
            ) : supportTickets.length === 0 ? (
              <div className="p-8 text-center bg-slate-900 rounded-3xl border border-slate-800 text-slate-400 text-xs">
                No active support inquiries. Click 'Open Ticket' to start a conversation.
              </div>
            ) : (
              <div className="space-y-3">
                {supportTickets.map((st) => (
                  <div
                    key={st.id}
                    onClick={() => setSelectedSupport(st)}
                    className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2 cursor-pointer hover:border-slate-700"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-blue-400">{st.ticketCode}</span>
                      <span
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          st.status === 'RESOLVED'
                            ? 'bg-emerald-950 text-emerald-400'
                            : 'bg-amber-950 text-amber-400'
                        }`}
                      >
                        {st.status}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-white">{st.subject}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span>{st.category.replace('_', ' ')}</span>
                      <span>{new Date(st.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 5: PROFILE & AUTHENTICATION            */}
        {/* ========================================== */}
        {activeTab === 'profile' && (
          <div className="p-4 space-y-6">
            <h2 className="text-lg font-black text-white">Account & Preferences</h2>

            {user ? (
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-xl text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">{user.name}</h3>
                    <p className="text-xs text-slate-400">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
                      ROLE: {user.role}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Active Server Host:</span>
                    <span className="font-mono text-white">{apiBaseUrl}</span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full py-3 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Kanimo Airline</span>
                </button>
              </div>
            ) : (
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-5">
                {/* 1-Click Fast Login Helper */}
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-blue-400 block">
                    Instant Demo Logins:
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => fastFillAccount('passenger@example.com', 'CustomerPass123!')}
                      className="p-2 bg-blue-950/60 rounded-xl border border-blue-800 text-blue-300 font-semibold text-center"
                    >
                      ✈️ Passenger
                    </button>
                    <button
                      type="button"
                      onClick={() => fastFillAccount('admin@kanimo.com', 'AdminPass123!')}
                      className="p-2 bg-amber-950/60 rounded-xl border border-amber-800 text-amber-300 font-semibold text-center"
                    >
                      👑 Admin
                    </button>
                  </div>
                </div>

                {/* Form Tabs */}
                <div className="flex border-b border-slate-800 text-xs font-bold">
                  <button
                    onClick={() => {
                      setAuthMode('LOGIN');
                      setAuthError('');
                    }}
                    className={`flex-1 py-2 text-center border-b-2 transition ${
                      authMode === 'LOGIN' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setAuthMode('REGISTER');
                      setAuthError('');
                    }}
                    className={`flex-1 py-2 text-center border-b-2 transition ${
                      authMode === 'REGISTER' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400'
                    }`}
                  >
                    Register
                  </button>
                </div>

                {authError && (
                  <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-300 text-xs">
                    {authError}
                  </div>
                )}
                {authSuccess && (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-emerald-300 text-xs">
                    {authSuccess}
                  </div>
                )}

                <form onSubmit={handleAuthSubmit} className="space-y-3">
                  {authMode === 'REGISTER' && (
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Full Legal Name
                      </label>
                      <input
                        type="text"
                        required
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder="Alexander Mitchell"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="passenger@example.com"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  {authMode !== 'FORGOT' && (
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Password</label>
                        {authMode === 'LOGIN' && (
                          <button
                            type="button"
                            onClick={() => setAuthMode('FORGOT')}
                            className="text-[10px] text-blue-400"
                          >
                            Forgot?
                          </button>
                        )}
                      </div>
                      <input
                        type="password"
                        required
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 transition disabled:opacity-50"
                  >
                    {authLoading
                      ? 'Processing...'
                      : authMode === 'LOGIN'
                      ? 'Sign In to Account'
                      : authMode === 'REGISTER'
                      ? 'Create Passenger Account'
                      : 'Send Recovery Link'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* MODAL: FLIGHT DETAIL & BOOKING FLOW                      */}
      {/* ======================================================== */}
      {selectedFlight && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 border border-slate-800 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-blue-400">
                  {selectedFlight.flightNumber}
                </span>
                <h3 className="text-base font-black text-white">
                  {selectedFlight.originCity} → {selectedFlight.destinationCity}
                </h3>
              </div>
              <button
                onClick={() => setSelectedFlight(null)}
                className="text-slate-400 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {bookingSuccess ? (
              <div className="p-6 text-center space-y-3 bg-emerald-950/40 rounded-2xl border border-emerald-800">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-base font-black text-white">Boarding Pass Issued!</h4>
                <p className="text-xs text-slate-300">
                  Order <span className="font-bold text-white">{bookingSuccess.order?.orderNumber}</span> paid in Demo Mode. Your pass has been saved to your wallet.
                </p>
                <button
                  onClick={() => {
                    setSelectedFlight(null);
                    setActiveTab('wallet');
                  }}
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                >
                  View in My Wallet
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookTicket} className="space-y-4">
                {/* Select Tier */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400">
                    Select Cabin Class Tier
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedFlight.tiers?.map((tier: any) => {
                      const isSelected = selectedTierId === tier.id;
                      return (
                        <div
                          key={tier.id}
                          onClick={() => setSelectedTierId(tier.id)}
                          className={`p-3 rounded-xl border cursor-pointer text-xs space-y-1 transition ${
                            isSelected
                              ? 'bg-blue-950/60 border-blue-500 shadow-sm'
                              : 'bg-slate-950 border-slate-800'
                          }`}
                        >
                          <div className="font-bold text-white truncate">{tier.name}</div>
                          <div className="text-sm font-black text-blue-400">${tier.price}</div>
                          <div className="text-[10px] text-slate-500">
                            {tier.remainingSeats} seats left
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Passenger Form */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <label className="text-[10px] uppercase font-bold text-slate-400">
                    Passenger Legal Name
                  </label>
                  <input
                    type="text"
                    required
                    value={passengerName}
                    onChange={(e) => setPassengerName(e.target.value)}
                    placeholder="Passenger full name..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Passport / ID
                    </label>
                    <input
                      type="text"
                      value={passengerPassport}
                      onChange={(e) => setPassengerPassport(e.target.value)}
                      placeholder="US918293..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Seat Preference
                    </label>
                    <select
                      value={seatPreference}
                      onChange={(e) => setSeatPreference(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    >
                      <option value="Window">Window</option>
                      <option value="Aisle">Aisle</option>
                      <option value="Middle">Middle</option>
                    </select>
                  </div>
                </div>

                {/* Demo Payment Notice */}
                <div className="p-3 bg-amber-950/40 rounded-xl border border-amber-800 text-[11px] text-amber-300 flex items-start gap-2">
                  <Lock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span>
                    Simulated Instant Card Checkout active. Tickets are transactionally issued.
                  </span>
                </div>

                {bookingError && (
                  <div className="p-2.5 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-300 text-xs">
                    {bookingError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
                >
                  {bookingLoading ? 'Reserving Seat...' : 'Pay & Issue Digital Boarding Pass'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: QR BOARDING PASS VIEWER                           */}
      {/* ======================================================== */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 font-bold text-lg"
            >
              ✕
            </button>

            {/* Header */}
            <div className="text-center space-y-1">
              <span className="font-extrabold text-sm tracking-wider uppercase text-blue-600">
                KANIMO AIRLINE
              </span>
              <h3 className="text-xl font-black">{selectedTicket.flight.flightNumber}</h3>
              <p className="text-xs text-slate-500">
                {selectedTicket.flight.originCode} → {selectedTicket.flight.destinationCode}
              </p>
            </div>

            {/* QR Canvas */}
            <div className="flex flex-col items-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <canvas ref={qrCanvasRef} className="rounded-lg" />
              <span className="text-[10px] font-mono font-bold text-slate-500 mt-2 tracking-wider">
                SCAN AT AIRPORT KIOSK
              </span>
            </div>

            {/* Passenger Details */}
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2 bg-slate-100 rounded-xl">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Passenger</span>
                <span className="font-bold text-slate-800 truncate block">
                  {selectedTicket.passengerName}
                </span>
              </div>
              <div className="p-2 bg-slate-100 rounded-xl">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Seat</span>
                <span className="font-black text-blue-600 text-sm block">
                  {selectedTicket.seatNumber}
                </span>
              </div>
            </div>

            {/* HMAC security stamp */}
            <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-[10px] font-mono text-center">
              ✓ HMAC-SHA256 SIGNED & SECURED
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: SUPPORT CONVERSATION THREAD                       */}
      {/* ======================================================== */}
      {selectedSupport && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-md w-full h-[550px] flex flex-col border border-slate-800 shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div>
                <span className="font-mono text-xs font-bold text-blue-400">
                  {selectedSupport.ticketCode}
                </span>
                <h4 className="text-xs font-bold text-white line-clamp-1">
                  {selectedSupport.subject}
                </h4>
              </div>
              <button
                onClick={() => setSelectedSupport(null)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {selectedSupport.comments?.map((c: any) => {
                const isStaff = c.isStaffReply;
                return (
                  <div
                    key={c.id}
                    className={`p-3 rounded-2xl text-xs max-w-[85%] ${
                      isStaff
                        ? 'bg-slate-800 text-slate-200 mr-auto rounded-tl-none border border-slate-700'
                        : 'bg-blue-600 text-white ml-auto rounded-tr-none'
                    }`}
                  >
                    <span className="text-[10px] block opacity-75 font-semibold mb-1">
                      {isStaff ? 'Kanimo Concierge Agent' : 'You'}
                    </span>
                    {c.message}
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSendSupportComment} className="p-3 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={supportComment}
                onChange={(e) => setSupportComment(e.target.value)}
                placeholder="Reply to concierge..."
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
              />
              <button
                type="submit"
                disabled={!supportComment.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CREATE SUPPORT TICKET                             */}
      {/* ======================================================== */}
      {showNewSupportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-sm w-full p-6 border border-slate-800 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-sm text-white">New Support Ticket</h3>
              <button onClick={() => setShowNewSupportModal(false)} className="text-slate-400">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSupport} className="space-y-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={newSupportSubject}
                  onChange={(e) => setNewSupportSubject(e.target.value)}
                  placeholder="e.g. Dietary meal request"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Category
                </label>
                <select
                  value={newSupportCategory}
                  onChange={(e) => setNewSupportCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                >
                  <option value="BOOKING_CHANGE">Booking Change</option>
                  <option value="CANCELLATION">Cancellation / Refund</option>
                  <option value="BAGGAGE">Baggage Assistance</option>
                  <option value="SEAT_UPGRADE">Seat Upgrade</option>
                  <option value="GENERAL">General Inquiry</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Details
                </label>
                <textarea
                  required
                  rows={3}
                  value={newSupportMessage}
                  onChange={(e) => setNewSupportMessage(e.target.value)}
                  placeholder="Describe your request..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewSupportModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={supportLoading}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* BOTTOM NAVIGATION BAR                                    */}
      {/* ======================================================== */}
      <nav className="fixed bottom-0 inset-x-0 bg-slate-900 border-t border-slate-800 px-2 py-2 flex items-center justify-around z-30">
        <button
          onClick={() => setActiveTab('explore')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            activeTab === 'explore' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px]">Explore</span>
        </button>

        <button
          onClick={() => setActiveTab('wallet')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            activeTab === 'wallet' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Ticket className="w-5 h-5" />
          <span className="text-[10px]">My Passes</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            activeTab === 'orders' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Luggage className="w-5 h-5" />
          <span className="text-[10px]">Bookings</span>
        </button>

        <button
          onClick={() => setActiveTab('support')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            activeTab === 'support' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          <LifeBuoy className="w-5 h-5" />
          <span className="text-[10px]">Support</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            activeTab === 'profile' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">Account</span>
        </button>
      </nav>
    </div>
  );
}
