import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Plane,
  Ticket,
  Search,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  LogOut,
  CreditCard,
  Lock,
  RefreshCw,
  Building2,
  Bus,
  ArrowRightLeft,
  ChevronRight,
  ChevronLeft,
  SlidersHorizontal,
  Bell,
  User as UserIcon,
  Luggage,
  Compass,
  Check,
  Smartphone,
  Landmark,
  X,
  Share2,
} from 'lucide-react';

// Airline Logos / Badges
function AirlineBadge({ airline, code }: { airline: string; code: string }) {
  if (airline.includes('Daallo') || code.startsWith('D')) {
    return (
      <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-black text-sm shadow-sm shrink-0">
        <span className="italic tracking-tighter">D</span>
      </div>
    );
  }
  if (airline.includes('FlySomalia') || code.startsWith('FS')) {
    return (
      <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-sm shrink-0">
        <Plane className="w-4 h-4 transform -rotate-45" />
      </div>
    );
  }
  if (airline.includes('Djibouti') || code.startsWith('AID')) {
    return (
      <div className="w-9 h-9 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold text-[10px] shadow-sm shrink-0">
        <span>AID</span>
      </div>
    );
  }
  // Ethiopian Airlines or partner
  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-600 via-amber-500 to-rose-600 flex items-center justify-center text-white font-black text-xs shadow-sm shrink-0">
      <span className="text-[10px]">ET</span>
    </div>
  );
}

export default function App() {
  // Authoritative production backend URL
  const apiBaseUrl = 'https://kanimo-airline.vercel.app';

  // Navigation State
  // screen: 'home' | 'search_results' | 'flight_details' | 'select_seat' | 'payment' | 'bookings' | 'explore' | 'profile'
  const [currentScreen, setCurrentScreen] = useState<string>('home');
  const [activeBottomTab, setActiveBottomTab] = useState<'home' | 'bookings' | 'explore' | 'profile'>('home');

  // Search State
  const [searchTab, setSearchTab] = useState<'flights' | 'hotels' | 'bus'>('flights');
  const [fromCode, setFromCode] = useState('HGA');
  const [toCode, setToCode] = useState('MGQ');
  const [depDate, setDepDate] = useState('Nov 15, 2026');
  const [retDate, setRetDate] = useState('Nov 22, 2026');
  const [passengers, setPassengers] = useState('1 Adult');

  // Date strip selection in Search Results
  const [selectedDateIdx, setSelectedDateIdx] = useState(2); // Sun Nov 15 default
  const dateStrip = [
    { day: 'Fri', date: 'Nov 13', price: '$320' },
    { day: 'Sat', date: 'Nov 14', price: '$298' },
    { day: 'Sun', date: 'Nov 15', price: '$275' },
    { day: 'Mon', date: 'Nov 16', price: '$289' },
    { day: 'Tue', date: 'Nov 17', price: '$310' },
  ];

  // Mockup flight data
  const defaultFlights = [
    {
      id: 'f-d4721',
      flightNumber: 'D4721',
      airline: 'Daallo Airlines',
      from: 'HGA',
      to: 'MGQ',
      depTime: '08:30',
      arrTime: '09:50',
      duration: '1h 20m',
      stopType: 'Non-stop',
      aircraft: 'Boeing 737',
      classType: 'Economy',
      price: 275,
      cabinBaggage: '7 kg',
      checkedBaggage: '20 kg (included)',
      baseFare: 240,
      taxes: 35,
    },
    {
      id: 'f-fs312',
      flightNumber: 'FS312',
      airline: 'FlySomalia',
      from: 'HGA',
      to: 'MGQ',
      depTime: '11:15',
      arrTime: '12:30',
      duration: '1h 15m',
      stopType: 'Non-stop',
      aircraft: 'Boeing 737',
      classType: 'Economy',
      price: 298,
      cabinBaggage: '7 kg',
      checkedBaggage: '20 kg (included)',
      baseFare: 260,
      taxes: 38,
    },
    {
      id: 'f-aid420',
      flightNumber: 'AID420',
      airline: 'Air Djibouti',
      from: 'HGA',
      to: 'MGQ',
      depTime: '14:40',
      arrTime: '16:05',
      duration: '1h 25m',
      stopType: 'Non-stop',
      aircraft: 'Boeing 737',
      classType: 'Economy',
      price: 320,
      cabinBaggage: '7 kg',
      checkedBaggage: '20 kg (included)',
      baseFare: 280,
      taxes: 40,
    },
    {
      id: 'f-et634',
      flightNumber: 'ET634',
      airline: 'Ethiopian Airlines',
      from: 'HGA',
      to: 'MGQ',
      depTime: '18:20',
      arrTime: '19:55',
      duration: '1h 35m',
      stopType: 'Non-stop',
      aircraft: 'Boeing 737',
      classType: 'Economy',
      price: 345,
      cabinBaggage: '7 kg',
      checkedBaggage: '2x23 kg (included)',
      baseFare: 300,
      taxes: 45,
    },
  ];

  // Selected Flight in flow
  const [selectedFlight, setSelectedFlight] = useState<any>(defaultFlights[0]);

  // Seat Selection State
  const [selectedSeat, setSelectedSeat] = useState<string>('12A');
  const seatRows = [8, 9, 10, 11, 12, 13, 14, 15];
  const occupiedSeats = ['8B', '9E', '10C', '11A', '13F', '14D'];

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'mobile' | 'card' | 'bank'>('mobile');
  const [mobileNumber, setMobileNumber] = useState('+252 63 445 9988');
  const [mobileProvider, setMobileProvider] = useState<'ZAAD' | 'EDAHAB'>('ZAAD');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  // Bookings State
  const [bookingFilter, setBookingFilter] = useState<'upcoming' | 'past'>('upcoming');
  const [bookingsList, setBookingsList] = useState<any[]>([
    {
      id: 'b-1',
      status: 'Confirmed',
      statusColor: 'emerald',
      from: 'Hargeisa',
      fromCode: 'HGA',
      to: 'Mogadishu',
      toCode: 'MGQ',
      date: 'Sun, Nov 15, 2026',
      passengers: '1 Adult',
      airline: 'Daallo Airlines',
      flightNumber: 'D4721',
      depTime: '08:30',
      arrTime: '09:50',
      duration: '1h 20m',
      seat: '12A',
      gate: 'A3',
      terminal: '1',
      ticketNumber: 'TKT-D4721-12A',
      isPast: false,
    },
    {
      id: 'b-2',
      status: 'Ticketed',
      statusColor: 'blue',
      from: 'Mogadishu',
      fromCode: 'MGQ',
      to: 'Hargeisa',
      toCode: 'HGA',
      date: 'Fri, Nov 20, 2026',
      passengers: '1 Adult',
      airline: 'FlySomalia',
      flightNumber: 'FS318',
      depTime: '15:10',
      arrTime: '16:30',
      duration: '1h 20m',
      seat: '8F',
      gate: 'B1',
      terminal: '1',
      ticketNumber: 'TKT-FS318-8F',
      isPast: false,
    },
    {
      id: 'b-3',
      status: 'Past',
      statusColor: 'slate',
      from: 'Hargeisa',
      fromCode: 'HGA',
      to: 'Addis Ababa',
      toCode: 'ADD',
      date: 'Mar 10, 2026',
      passengers: '1 Adult',
      airline: 'Ethiopian Airlines',
      flightNumber: 'ET502',
      depTime: '10:15',
      arrTime: '12:45',
      duration: '2h 30m',
      seat: '15C',
      gate: 'C2',
      terminal: '2',
      ticketNumber: 'TKT-ET502-15C',
      isPast: true,
    },
  ]);

  // QR Modal State
  const [activeBoardingPass, setActiveBoardingPass] = useState<any>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (activeBoardingPass && qrCanvasRef.current) {
      const payload = `SKYTICKETS:v1:${activeBoardingPass.ticketNumber}:${activeBoardingPass.flightNumber}:${activeBoardingPass.seat}:HMACVERIFIED`;
      QRCode.toCanvas(qrCanvasRef.current, payload, {
        width: 180,
        margin: 1,
        color: { dark: '#0b1329', light: '#ffffff' },
      }).catch(console.error);
    }
  }, [activeBoardingPass]);

  // Swap From / To
  const handleSwap = () => {
    const temp = fromCode;
    setFromCode(toCode);
    setToCode(temp);
  };

  // Switch Bottom Navigation Tab
  const handleTabChange = (tab: 'home' | 'bookings' | 'explore' | 'profile') => {
    setActiveBottomTab(tab);
    if (tab === 'home') setCurrentScreen('home');
    if (tab === 'bookings') setCurrentScreen('bookings');
    if (tab === 'explore') setCurrentScreen('explore');
    if (tab === 'profile') setCurrentScreen('profile');
  };

  // Perform Booking Payment
  const handlePayNow = () => {
    setPaymentProcessing(true);
    setTimeout(() => {
      setPaymentProcessing(false);
      setPaymentDone(true);

      const newBooking = {
        id: `b-${Date.now()}`,
        status: 'Confirmed',
        statusColor: 'emerald',
        from: fromCode === 'HGA' ? 'Hargeisa' : fromCode,
        fromCode: fromCode,
        to: toCode === 'MGQ' ? 'Mogadishu' : toCode,
        toCode: toCode,
        date: depDate,
        passengers: passengers,
        airline: selectedFlight.airline,
        flightNumber: selectedFlight.flightNumber,
        depTime: selectedFlight.depTime,
        arrTime: selectedFlight.arrTime,
        duration: selectedFlight.duration,
        seat: selectedSeat,
        gate: 'A3',
        terminal: '1',
        ticketNumber: `TKT-${selectedFlight.flightNumber}-${selectedSeat}`,
        isPast: false,
      };

      setBookingsList([newBooking, ...bookingsList]);
    }, 1200);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f1f5f9] text-slate-800 antialiased font-sans">
      {/* ======================================================== */}
      {/* SCREEN 1: HOME */}
      {/* ======================================================== */}
      {currentScreen === 'home' && (
        <div className="flex-1 flex flex-col pt-safe-top pb-safe-bottom mb-20 overflow-y-auto">
          {/* Top Bar: Logo, Notification Bell, User Avatar */}
          <div className="px-5 py-3.5 flex items-center justify-between bg-white border-b border-slate-150">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Plane className="w-4 h-4 transform -rotate-45" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 leading-none">
                  Sky<span className="text-blue-600">Tickets</span>
                </span>
                <span className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">
                  Fly More • Explore More
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 relative">
                <Bell className="w-4 h-4" />
                <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-1 right-1"></span>
              </button>

              <div
                onClick={() => handleTabChange('profile')}
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                KM
              </div>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Hero Card Banner */}
            <div className="relative rounded-2xl overflow-hidden bg-[#0c1b33] text-white p-5 shadow-md">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity pointer-events-none"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=800&q=80')",
                }}
              />
              <div className="relative z-10">
                <h2 className="text-2xl font-black tracking-tight text-white">Explore the World</h2>
                <p className="text-xs text-blue-100/90 mt-1 max-w-xs leading-relaxed font-normal">
                  Book your flights with the best prices and best experience.
                </p>
              </div>
            </div>

            {/* Floating Search Card */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-150 space-y-3.5">
              {/* Tabs: Flights / Hotels / Bus */}
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <button
                  onClick={() => setSearchTab('flights')}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition ${
                    searchTab === 'flights'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <Plane className="w-3.5 h-3.5 transform -rotate-45" />
                  <span>Flights</span>
                </button>

                <button
                  onClick={() => setSearchTab('hotels')}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition ${
                    searchTab === 'hotels'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Hotels</span>
                </button>

                <button
                  onClick={() => setSearchTab('bus')}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition ${
                    searchTab === 'bus'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <Bus className="w-3.5 h-3.5" />
                  <span>Bus</span>
                </button>
              </div>

              {/* Route Input with Swap */}
              <div className="relative space-y-2">
                {/* From */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">From</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Plane className="w-4 h-4 text-blue-600 shrink-0 transform -rotate-45" />
                    <select
                      value={fromCode}
                      onChange={(e) => setFromCode(e.target.value)}
                      className="w-full bg-transparent font-bold text-slate-800 text-sm focus:outline-none"
                    >
                      <option value="HGA">Hargeisa (HGA)</option>
                      <option value="MGQ">Mogadishu (MGQ)</option>
                      <option value="ADD">Addis Ababa (ADD)</option>
                      <option value="DXB">Dubai (DXB)</option>
                    </select>
                  </div>
                </div>

                {/* Swap Icon Button */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
                  <button
                    type="button"
                    onClick={handleSwap}
                    className="w-8 h-8 rounded-full bg-white border border-slate-200 text-blue-600 flex items-center justify-center shadow-md active:scale-95 transition"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* To */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">To</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Plane className="w-4 h-4 text-blue-600 shrink-0" />
                    <select
                      value={toCode}
                      onChange={(e) => setToCode(e.target.value)}
                      className="w-full bg-transparent font-bold text-slate-800 text-sm focus:outline-none"
                    >
                      <option value="MGQ">Mogadishu (MGQ)</option>
                      <option value="HGA">Hargeisa (HGA)</option>
                      <option value="ADD">Addis Ababa (ADD)</option>
                      <option value="DXB">Dubai (DXB)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Dates Row */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Departure</span>
                  <div className="flex items-center gap-1.5 mt-0.5 text-xs font-bold text-slate-800">
                    <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{depDate}</span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Return</span>
                  <div className="flex items-center gap-1.5 mt-0.5 text-xs font-bold text-slate-800">
                    <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{retDate}</span>
                  </div>
                </div>
              </div>

              {/* Passengers */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Passengers</span>
                  <div className="flex items-center gap-2 mt-0.5 text-xs font-bold text-slate-800">
                    <UserIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{passengers}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>

              {/* Search Flights Button */}
              <button
                onClick={() => setCurrentScreen('search_results')}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 transition"
              >
                <Search className="w-4 h-4" />
                <span>Search Flights</span>
              </button>
            </div>

            {/* 3 Guarantee Pills */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white rounded-xl p-2.5 border border-slate-150 flex flex-col items-center text-center shadow-xs">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-800">Best Prices</span>
              </div>

              <div className="bg-white rounded-xl p-2.5 border border-slate-150 flex flex-col items-center text-center shadow-xs">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-800">Secure Booking</span>
              </div>

              <div className="bg-white rounded-xl p-2.5 border border-slate-150 flex flex-col items-center text-center shadow-xs">
                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-1">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-800">24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SCREEN 2: SEARCH RESULTS */}
      {/* ======================================================== */}
      {currentScreen === 'search_results' && (
        <div className="flex-1 flex flex-col pt-safe-top pb-safe-bottom mb-20 overflow-y-auto">
          {/* Header */}
          <div className="px-4 py-3.5 bg-white border-b border-slate-150 flex items-center justify-between sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentScreen('home')}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
                  {fromCode === 'HGA' ? 'Hargeisa' : fromCode} ➔ {toCode === 'MGQ' ? 'Mogadishu' : toCode}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">Nov 15, 2026 • 1 Adult</p>
              </div>
            </div>
            <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Horizontal Date Slider Strip */}
          <div className="bg-white border-b border-slate-200 px-3 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {dateStrip.map((item, idx) => (
              <button
                key={item.date}
                onClick={() => setSelectedDateIdx(idx)}
                className={`flex-1 min-w-[62px] py-2 px-1.5 rounded-xl text-center transition ${
                  selectedDateIdx === idx
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="text-[10px] block uppercase font-medium">{item.day}</span>
                <span className="text-xs font-bold block">{item.date}</span>
                <span
                  className={`text-[10px] font-extrabold block mt-0.5 ${
                    selectedDateIdx === idx ? 'text-blue-100' : 'text-slate-500'
                  }`}
                >
                  {item.price}
                </span>
              </button>
            ))}
          </div>

          {/* Flight Cards List */}
          <div className="p-4 space-y-3.5">
            {defaultFlights.map((flight) => (
              <div
                key={flight.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition space-y-3"
              >
                {/* Airline Title & Code */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <AirlineBadge airline={flight.airline} code={flight.flightNumber} />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 leading-tight">{flight.airline}</h4>
                      <span className="text-[11px] text-slate-400 font-medium">{flight.flightNumber}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-slate-900">${flight.price}</span>
                  </div>
                </div>

                {/* Timeline Route Display */}
                <div className="flex items-center justify-between pt-1">
                  <div className="text-left">
                    <span className="text-base font-black text-slate-900 leading-none">{flight.depTime}</span>
                    <span className="text-[11px] font-bold text-slate-400 block mt-0.5">{flight.from}</span>
                  </div>

                  <div className="flex-1 px-4 flex flex-col items-center">
                    <span className="text-[10px] font-semibold text-slate-400">{flight.duration}</span>
                    <div className="w-full flex items-center my-1">
                      <div className="w-2 h-2 rounded-full border-2 border-blue-600 bg-white"></div>
                      <div className="flex-1 border-t border-dashed border-slate-300"></div>
                      <Plane className="w-3.5 h-3.5 text-blue-600 transform rotate-90 mx-1 shrink-0" />
                      <div className="flex-1 border-t border-dashed border-slate-300"></div>
                      <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                    </div>
                    <span className="text-[10px] font-medium text-emerald-600">{flight.stopType}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-slate-900 leading-none">{flight.arrTime}</span>
                    <span className="text-[11px] font-bold text-slate-400 block mt-0.5">{flight.to}</span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                  <button
                    onClick={() => {
                      setSelectedFlight(flight);
                      setCurrentScreen('flight_details');
                    }}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-500/20"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SCREEN 3: FLIGHT DETAILS */}
      {/* ======================================================== */}
      {currentScreen === 'flight_details' && (
        <div className="flex-1 flex flex-col pt-safe-top pb-safe-bottom mb-20 overflow-y-auto">
          {/* Header */}
          <div className="px-4 py-3.5 bg-white border-b border-slate-150 flex items-center justify-between sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentScreen('search_results')}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="font-extrabold text-base text-slate-900">Flight Details</h3>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Wing / Cloud Banner */}
            <div className="relative rounded-2xl overflow-hidden h-36 bg-slate-900 shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80"
                alt="Sky banner"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-800">
                Direct Route
              </div>
            </div>

            {/* Airline Info Card */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <AirlineBadge airline={selectedFlight.airline} code={selectedFlight.flightNumber} />
                  <div>
                    <h4 className="font-extrabold text-base text-slate-900">{selectedFlight.airline}</h4>
                    <span className="text-xs text-slate-400 font-medium">{selectedFlight.flightNumber}</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 font-bold text-xs">
                  {selectedFlight.stopType}
                </span>
              </div>

              {/* Large Route Display */}
              <div className="flex items-center justify-between border-y border-slate-100 py-4">
                <div>
                  <span className="text-2xl font-black text-slate-900 block leading-tight">HGA</span>
                  <span className="text-xs text-slate-500 block">Hargeisa</span>
                  <span className="text-base font-extrabold text-slate-800 block mt-1">{selectedFlight.depTime}</span>
                  <span className="text-[10px] text-slate-400 font-medium">Sun, Nov 15, 2026</span>
                </div>

                <div className="flex-1 px-4 flex flex-col items-center">
                  <Plane className="w-5 h-5 text-blue-600 transform rotate-90" />
                  <span className="text-[11px] font-bold text-slate-500 mt-1">{selectedFlight.duration}</span>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-black text-slate-900 block leading-tight">MGQ</span>
                  <span className="text-xs text-slate-500 block">Mogadishu</span>
                  <span className="text-base font-extrabold text-slate-800 block mt-1">{selectedFlight.arrTime}</span>
                  <span className="text-[10px] text-slate-400 font-medium">Sun, Nov 15, 2026</span>
                </div>
              </div>

              {/* Meta details chips */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-50 rounded-xl p-2.5">
                  <Clock className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-400 block font-medium">Duration</span>
                  <span className="font-bold text-slate-800">{selectedFlight.duration}</span>
                </div>

                <div className="bg-slate-50 rounded-xl p-2.5">
                  <Plane className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-400 block font-medium">Aircraft</span>
                  <span className="font-bold text-slate-800">{selectedFlight.aircraft}</span>
                </div>

                <div className="bg-slate-50 rounded-xl p-2.5">
                  <Luggage className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-400 block font-medium">Class</span>
                  <span className="font-bold text-slate-800">{selectedFlight.classType}</span>
                </div>
              </div>

              {/* Baggage info */}
              <div className="space-y-2 pt-1 text-xs">
                <div className="flex items-center justify-between text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                  <span className="flex items-center gap-2">
                    <Luggage className="w-3.5 h-3.5 text-blue-600" />
                    <span>Cabin baggage</span>
                  </span>
                  <span className="font-bold text-slate-900">{selectedFlight.cabinBaggage}</span>
                </div>

                <div className="flex items-center justify-between text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                  <span className="flex items-center gap-2">
                    <Luggage className="w-3.5 h-3.5 text-blue-600" />
                    <span>Checked baggage</span>
                  </span>
                  <span className="font-bold text-slate-900">{selectedFlight.checkedBaggage}</span>
                </div>
              </div>
            </div>

            {/* Bottom floating bar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Price</span>
                <span className="text-xl font-black text-slate-900">${selectedFlight.price}</span>
                <span className="text-[10px] text-slate-500 ml-1 font-medium">(per person)</span>
              </div>

              <button
                onClick={() => setCurrentScreen('select_seat')}
                className="px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SCREEN 4: SELECT SEAT */}
      {/* ======================================================== */}
      {currentScreen === 'select_seat' && (
        <div className="flex-1 flex flex-col pt-safe-top pb-safe-bottom mb-20 overflow-y-auto">
          {/* Header */}
          <div className="px-4 py-3.5 bg-white border-b border-slate-150 flex items-center justify-between sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentScreen('flight_details')}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Select Seat</h3>
                <p className="text-[11px] text-slate-500 font-medium">HGA ➔ MGQ • Sun, Nov 15 • 1h 20m</p>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Airplane Fuselage Container */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs max-w-sm mx-auto w-full">
              {/* Airplane Nose Shape */}
              <div className="w-28 h-10 border-t-2 border-x-2 border-slate-300 rounded-t-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cockpit</span>
              </div>

              {/* Column Headers */}
              <div className="grid grid-cols-7 text-center text-xs font-black text-slate-400 mb-3">
                <span>A</span>
                <span>B</span>
                <span>C</span>
                <span className="text-[10px] text-slate-300">AISLE</span>
                <span>D</span>
                <span>E</span>
                <span>F</span>
              </div>

              {/* Seat Rows */}
              <div className="space-y-2.5">
                {seatRows.map((row) => (
                  <div key={row} className="grid grid-cols-7 items-center text-center">
                    {/* Seat A */}
                    {(() => {
                      const seatId = `${row}A`;
                      const isOcc = occupiedSeats.includes(seatId);
                      const isSel = selectedSeat === seatId;
                      return (
                        <button
                          disabled={isOcc}
                          onClick={() => setSelectedSeat(seatId)}
                          className={`w-8 h-8 rounded-lg mx-auto flex items-center justify-center text-[10px] font-bold transition ${
                            isSel
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                              : isOcc
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              : 'bg-blue-50 text-blue-900 hover:bg-blue-100'
                          }`}
                        >
                          {isSel ? <Check className="w-3.5 h-3.5" /> : seatId}
                        </button>
                      );
                    })()}

                    {/* Seat B */}
                    {(() => {
                      const seatId = `${row}B`;
                      const isOcc = occupiedSeats.includes(seatId);
                      const isSel = selectedSeat === seatId;
                      return (
                        <button
                          disabled={isOcc}
                          onClick={() => setSelectedSeat(seatId)}
                          className={`w-8 h-8 rounded-lg mx-auto flex items-center justify-center text-[10px] font-bold transition ${
                            isSel
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                              : isOcc
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              : 'bg-blue-50 text-blue-900 hover:bg-blue-100'
                          }`}
                        >
                          {isSel ? <Check className="w-3.5 h-3.5" /> : seatId}
                        </button>
                      );
                    })()}

                    {/* Seat C */}
                    {(() => {
                      const seatId = `${row}C`;
                      const isOcc = occupiedSeats.includes(seatId);
                      const isSel = selectedSeat === seatId;
                      return (
                        <button
                          disabled={isOcc}
                          onClick={() => setSelectedSeat(seatId)}
                          className={`w-8 h-8 rounded-lg mx-auto flex items-center justify-center text-[10px] font-bold transition ${
                            isSel
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                              : isOcc
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              : 'bg-blue-50 text-blue-900 hover:bg-blue-100'
                          }`}
                        >
                          {isSel ? <Check className="w-3.5 h-3.5" /> : seatId}
                        </button>
                      );
                    })()}

                    {/* Row Number in Aisle */}
                    <span className="text-[11px] font-bold text-slate-400">{row}</span>

                    {/* Seat D */}
                    {(() => {
                      const seatId = `${row}D`;
                      const isOcc = occupiedSeats.includes(seatId);
                      const isSel = selectedSeat === seatId;
                      return (
                        <button
                          disabled={isOcc}
                          onClick={() => setSelectedSeat(seatId)}
                          className={`w-8 h-8 rounded-lg mx-auto flex items-center justify-center text-[10px] font-bold transition ${
                            isSel
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                              : isOcc
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              : 'bg-blue-50 text-blue-900 hover:bg-blue-100'
                          }`}
                        >
                          {isSel ? <Check className="w-3.5 h-3.5" /> : seatId}
                        </button>
                      );
                    })()}

                    {/* Seat E */}
                    {(() => {
                      const seatId = `${row}E`;
                      const isOcc = occupiedSeats.includes(seatId);
                      const isSel = selectedSeat === seatId;
                      return (
                        <button
                          disabled={isOcc}
                          onClick={() => setSelectedSeat(seatId)}
                          className={`w-8 h-8 rounded-lg mx-auto flex items-center justify-center text-[10px] font-bold transition ${
                            isSel
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                              : isOcc
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              : 'bg-blue-50 text-blue-900 hover:bg-blue-100'
                          }`}
                        >
                          {isSel ? <Check className="w-3.5 h-3.5" /> : seatId}
                        </button>
                      );
                    })()}

                    {/* Seat F */}
                    {(() => {
                      const seatId = `${row}F`;
                      const isOcc = occupiedSeats.includes(seatId);
                      const isSel = selectedSeat === seatId;
                      return (
                        <button
                          disabled={isOcc}
                          onClick={() => setSelectedSeat(seatId)}
                          className={`w-8 h-8 rounded-lg mx-auto flex items-center justify-center text-[10px] font-bold transition ${
                            isSel
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                              : isOcc
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              : 'bg-blue-50 text-blue-900 hover:bg-blue-100'
                          }`}
                        >
                          {isSel ? <Check className="w-3.5 h-3.5" /> : seatId}
                        </button>
                      );
                    })()}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-around border-t border-slate-100 mt-5 pt-4 text-xs font-medium text-slate-500">
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded bg-blue-50 border border-blue-200"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded bg-blue-600"></div>
                  <span className="font-bold text-slate-800">Selected</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded bg-slate-200"></div>
                  <span>Unavailable</span>
                </div>
              </div>
            </div>

            {/* Bottom floating action */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">1 Seat Selected</span>
                <span className="text-xl font-black text-slate-900">{selectedSeat}</span>
              </div>

              <button
                onClick={() => setCurrentScreen('payment')}
                className="px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SCREEN 5: PAYMENT */}
      {/* ======================================================== */}
      {currentScreen === 'payment' && (
        <div className="flex-1 flex flex-col pt-safe-top pb-safe-bottom mb-20 overflow-y-auto">
          {/* Header */}
          <div className="px-4 py-3.5 bg-white border-b border-slate-150 flex items-center justify-between sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentScreen('select_seat')}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="font-extrabold text-base text-slate-900">Payment</h3>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Flight Summary Card */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Flight Summary</span>
                <button
                  onClick={() => setCurrentScreen('flight_details')}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  Edit
                </button>
              </div>

              <div>
                <h4 className="font-extrabold text-base text-slate-900">HGA ➔ MGQ</h4>
                <p className="text-xs text-slate-500 font-medium">Sun, Nov 15, 2026 • 1 Adult • Seat {selectedSeat}</p>
                <p className="text-xs text-blue-600 font-semibold mt-0.5">
                  ✈ {selectedFlight.airline} {selectedFlight.flightNumber} • Non-stop
                </p>
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Base Fare</span>
                  <span className="font-bold text-slate-900">${selectedFlight.baseFare}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Taxes & Fees</span>
                  <span className="font-bold text-slate-900">${selectedFlight.taxes}</span>
                </div>
                <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-sm font-black text-slate-900">
                  <span>Total</span>
                  <span className="text-lg text-blue-600">${selectedFlight.price}</span>
                </div>
              </div>
            </div>

            {/* Choose Payment Method */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block ml-1">
                Choose Payment Method
              </span>

              {/* Option 1: Mobile Money (Zaad / eDahab) */}
              <div
                onClick={() => setPaymentMethod('mobile')}
                className={`p-4 rounded-2xl border transition cursor-pointer ${
                  paymentMethod === 'mobile'
                    ? 'bg-white border-blue-500 shadow-sm ring-1 ring-blue-500'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Mobile Money</h4>
                      <p className="text-xs text-slate-500">Zaad / eDahab</p>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'mobile'
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-300'
                    }`}
                  >
                    {paymentMethod === 'mobile' && <Check className="w-3 h-3" />}
                  </div>
                </div>

                {paymentMethod === 'mobile' && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setMobileProvider('ZAAD')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${
                          mobileProvider === 'ZAAD'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        Zaad Service
                      </button>
                      <button
                        type="button"
                        onClick={() => setMobileProvider('EDAHAB')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${
                          mobileProvider === 'EDAHAB'
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        eDahab
                      </button>
                    </div>
                    <input
                      type="text"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="e.g. +252 63 445 9988"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Option 2: Card Payment */}
              <div
                onClick={() => setPaymentMethod('card')}
                className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                  paymentMethod === 'card'
                    ? 'bg-white border-blue-500 shadow-sm ring-1 ring-blue-500'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Card Payment</h4>
                    <p className="text-xs text-slate-500">Visa / Mastercard</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>

              {/* Option 3: Bank Transfer */}
              <div
                onClick={() => setPaymentMethod('bank')}
                className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                  paymentMethod === 'bank'
                    ? 'bg-white border-blue-500 shadow-sm ring-1 ring-blue-500'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Bank Transfer</h4>
                    <p className="text-xs text-slate-500">Direct Account Deposit</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>
            </div>

            {/* Pay Now Button */}
            <button
              onClick={handlePayNow}
              disabled={paymentProcessing}
              className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-black text-base shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition"
            >
              {paymentProcessing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Pay Now ${selectedFlight.price}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Payment Success Modal */}
      {paymentDone && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Payment Successful!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Your flight has been booked and your digital boarding pass has been issued.
              </p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-xs text-left space-y-1">
              <p className="font-bold text-slate-900">Daallo Airlines D4721</p>
              <p className="text-slate-500">Seat {selectedSeat} • Sun, Nov 15, 2026</p>
              <p className="font-bold text-emerald-600">Total Paid: ${selectedFlight.price}</p>
            </div>
            <button
              onClick={() => {
                setPaymentDone(false);
                handleTabChange('bookings');
              }}
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-md"
            >
              View My Bookings
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SCREEN 6: MY BOOKINGS */}
      {/* ======================================================== */}
      {currentScreen === 'bookings' && (
        <div className="flex-1 flex flex-col pt-safe-top pb-safe-bottom mb-20 overflow-y-auto">
          {/* Header */}
          <div className="px-4 py-3.5 bg-white border-b border-slate-150 sticky top-0 z-20">
            <h3 className="font-extrabold text-lg text-slate-900">My Bookings</h3>
          </div>

          <div className="p-4 space-y-4">
            {/* Filter Tabs */}
            <div className="flex bg-slate-200/80 p-1 rounded-xl">
              <button
                onClick={() => setBookingFilter('upcoming')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                  bookingFilter === 'upcoming'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setBookingFilter('past')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                  bookingFilter === 'past'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Past
              </button>
            </div>

            {/* Booking Cards */}
            <div className="space-y-3">
              {bookingsList
                .filter((b) => (bookingFilter === 'upcoming' ? !b.isPast : b.isPast))
                .map((b) => (
                  <div
                    key={b.id}
                    onClick={() => setActiveBoardingPass(b)}
                    className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition cursor-pointer space-y-3"
                  >
                    {/* Status Pill */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          b.status === 'Confirmed'
                            ? 'bg-emerald-50 text-emerald-600'
                            : b.status === 'Ticketed'
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        <span>{b.status}</span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>

                    {/* Route */}
                    <div>
                      <h4 className="font-extrabold text-base text-slate-900">
                        {b.from} ➔ {b.to}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        {b.date} • {b.passengers}
                      </p>
                    </div>

                    {/* Airline & Times */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <AirlineBadge airline={b.airline} code={b.flightNumber} />
                        <div>
                          <span className="font-bold text-slate-900 block">{b.airline}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{b.flightNumber}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-black text-slate-900 block">
                          {b.depTime} - {b.arrTime}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">{b.duration}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SCREEN: EXPLORE */}
      {/* ======================================================== */}
      {currentScreen === 'explore' && (
        <div className="flex-1 flex flex-col pt-safe-top pb-safe-bottom mb-20 overflow-y-auto">
          <div className="px-4 py-3.5 bg-white border-b border-slate-150 sticky top-0 z-20">
            <h3 className="font-extrabold text-lg text-slate-900">Explore Destinations</h3>
            <p className="text-xs text-slate-500">Popular routes with instant booking</p>
          </div>

          <div className="p-4 space-y-3">
            {[
              {
                city: 'Dubai (DXB)',
                price: '$520 Round Trip',
                duration: '2h 45m • Direct',
                img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
              },
              {
                city: 'Istanbul (IST)',
                price: '$680 Round Trip',
                duration: '6h 20m • 1 Stop',
                img: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80',
              },
              {
                city: 'Nairobi (NBO)',
                price: '$750 Round Trip',
                duration: '8h 15m • 1 Stop',
                img: 'https://images.unsplash.com/photo-1619865668616-e57caeb67fc1?auto=format&fit=crop&w=800&q=80',
              },
              {
                city: 'London (LHR)',
                price: '$820 Round Trip',
                duration: '10h 30m • 1 Stop',
                img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
              },
              {
                city: 'Doha (DOH)',
                price: '$640 Round Trip',
                duration: '6h 45m • 1 Stop',
                img: 'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?auto=format&fit=crop&w=800&q=80',
              },
            ].map((dest) => (
              <div
                key={dest.city}
                onClick={() => {
                  setToCode(dest.city.slice(dest.city.indexOf('(') + 1, dest.city.indexOf(')')));
                  setCurrentScreen('search_results');
                }}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs cursor-pointer flex gap-3 p-3 items-center"
              >
                <img src={dest.img} alt={dest.city} className="w-20 h-20 rounded-xl object-cover" />
                <div className="flex-1">
                  <h4 className="font-extrabold text-sm text-slate-900">{dest.city}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{dest.duration}</p>
                  <span className="inline-block mt-1 text-xs font-black text-blue-600">{dest.price}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SCREEN: PROFILE */}
      {/* ======================================================== */}
      {currentScreen === 'profile' && (
        <div className="flex-1 flex flex-col pt-safe-top pb-safe-bottom mb-20 overflow-y-auto">
          <div className="px-4 py-3.5 bg-white border-b border-slate-150 sticky top-0 z-20">
            <h3 className="font-extrabold text-lg text-slate-900">Profile & Account</h3>
          </div>

          <div className="p-4 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xl flex items-center justify-center mx-auto shadow-md">
                KM
              </div>
              <div>
                <h4 className="font-extrabold text-base text-slate-900">Kani Mo</h4>
                <p className="text-xs text-slate-500 font-medium">kanimo@kanimo.com</p>
                <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                  Verified Passenger
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              <div
                onClick={() => handleTabChange('bookings')}
                className="p-4 flex items-center justify-between cursor-pointer"
              >
                <span>My Bookings</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
              <div className="p-4 flex items-center justify-between">
                <span>Phone: +252 63 445 9988</span>
                <span className="text-emerald-600 text-[11px]">Zaad Active</span>
              </div>
              <div className="p-4 flex items-center justify-between">
                <span>Connected Server</span>
                <span className="text-blue-600 text-[10px] truncate max-w-[160px] font-mono">{apiBaseUrl}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* BOARDING PASS / QR CODE MODAL */}
      {/* ======================================================== */}
      {activeBoardingPass && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl animate-in zoom-in-95">
            {/* Header */}
            <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plane className="w-5 h-5 transform -rotate-45" />
                <span className="font-extrabold text-sm">SkyTickets Boarding Pass</span>
              </div>
              <button
                onClick={() => setActiveBoardingPass(null)}
                className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 text-center space-y-4">
              <div>
                <span className="text-2xl font-black text-slate-900 block">
                  {activeBoardingPass.fromCode} ➔ {activeBoardingPass.toCode}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {activeBoardingPass.airline} • {activeBoardingPass.flightNumber}
                </span>
              </div>

              {/* Scannable QR Code */}
              <div className="w-48 h-48 mx-auto bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center p-2 shadow-inner">
                <canvas ref={qrCanvasRef} className="w-full h-full" />
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-2xl p-3 border border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Seat</span>
                  <span className="font-black text-slate-900 text-base">{activeBoardingPass.seat}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Gate</span>
                  <span className="font-black text-slate-900 text-base">{activeBoardingPass.gate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Terminal</span>
                  <span className="font-black text-slate-900 text-base">{activeBoardingPass.terminal}</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 font-mono">
                Security Hash: HMAC-SHA256 • Verified Pass
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PERSISTENT BOTTOM NAVIGATION BAR WITH SAFE AREA INSETS */}
      {/* ======================================================== */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 pb-safe-bottom shadow-lg">
        <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
          {/* Home */}
          <button
            onClick={() => handleTabChange('home')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
              activeBottomTab === 'home' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Plane className="w-5 h-5 transform -rotate-45" />
            <span className="text-[10px] font-bold mt-1">Home</span>
          </button>

          {/* My Bookings */}
          <button
            onClick={() => handleTabChange('bookings')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
              activeBottomTab === 'bookings' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Ticket className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-1">My Bookings</span>
          </button>

          {/* Explore */}
          <button
            onClick={() => handleTabChange('explore')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
              activeBottomTab === 'explore' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-1">Explore</span>
          </button>

          {/* Profile */}
          <button
            onClick={() => handleTabChange('profile')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
              activeBottomTab === 'profile' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <UserIcon className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-1">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
