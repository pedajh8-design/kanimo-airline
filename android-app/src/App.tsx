import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Check,
  Smartphone,
  Landmark,
  X,
  Plus,
  Minus,
  Sparkles,
  Crown,
  Briefcase,
  Users,
  MapPin,
} from 'lucide-react';
import AirplaneLandingLoader from './components/AirplaneLandingLoader';

// Authoritative Airport Directory
interface Airport {
  code: string;
  city: string;
  name: string;
  country: string;
}

const AIRPORTS: Airport[] = [
  { code: 'HGA', city: 'Hargeisa', name: 'Egal International Airport', country: 'Somaliland' },
  { code: 'MGQ', city: 'Mogadishu', name: 'Aden Adde International Airport', country: 'Somalia' },
  { code: 'BSA', city: 'Bosaso', name: 'Bender Qassim International Airport', country: 'Somalia' },
  { code: 'GGR', city: 'Garowe', name: 'Garowe International Airport', country: 'Somalia' },
  { code: 'ADD', city: 'Addis Ababa', name: 'Bole International Airport', country: 'Ethiopia' },
  { code: 'DXB', city: 'Dubai', name: 'Dubai International Airport', country: 'UAE' },
  { code: 'NBO', city: 'Nairobi', name: 'Jomo Kenyatta International Airport', country: 'Kenya' },
  { code: 'IST', city: 'Istanbul', name: 'Istanbul Airport', country: 'Turkey' },
  { code: 'JED', city: 'Jeddah', name: 'King Abdulaziz International Airport', country: 'Saudi Arabia' },
  { code: 'DOH', city: 'Doha', name: 'Hamad International Airport', country: 'Qatar' },
  { code: 'CAI', city: 'Cairo', name: 'Cairo International Airport', country: 'Egypt' },
  { code: 'LHR', city: 'London', name: 'Heathrow Airport', country: 'UK' },
  { code: 'JFK', city: 'New York', name: 'John F. Kennedy International Airport', country: 'USA' },
  { code: 'MIA', city: 'Miami', name: 'Miami International Airport', country: 'USA' },
];

// Airline Logo / Badges
function AirlineBadge({ airline = '', code = '' }: { airline?: string; code?: string }) {
  if (airline.includes('Daallo') || code.startsWith('D')) {
    return (
      <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-sm shadow-sm shrink-0">
        <span className="italic tracking-tighter">D</span>
      </div>
    );
  }
  if (airline.includes('FlySomalia') || code.startsWith('FS')) {
    return (
      <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-sm shrink-0">
        <Plane className="w-4 h-4 transform -rotate-45" />
      </div>
    );
  }
  if (airline.includes('Djibouti') || code.startsWith('AID')) {
    return (
      <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center text-white font-bold text-[10px] shadow-sm shrink-0">
        <span>AID</span>
      </div>
    );
  }
  if (airline.includes('Emirates') || code.startsWith('EK')) {
    return (
      <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-black text-xs shadow-sm shrink-0">
        <span>EK</span>
      </div>
    );
  }
  if (airline.includes('Qatar') || code.startsWith('QR')) {
    return (
      <div className="w-10 h-10 rounded-xl bg-purple-900 flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0">
        <span>QR</span>
      </div>
    );
  }
  if (airline.includes('Turkish') || code.startsWith('TK')) {
    return (
      <div className="w-10 h-10 rounded-xl bg-rose-700 flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0">
        <span>TK</span>
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 via-amber-500 to-rose-600 flex items-center justify-center text-white font-black text-xs shadow-sm shrink-0">
      <span className="text-[10px]">ET</span>
    </div>
  );
}

export default function App() {
  const apiBaseUrl = 'https://kanimo-airline.vercel.app';

  // Navigation State
  const [currentScreen, setCurrentScreen] = useState<string>('home');
  const [activeBottomTab, setActiveBottomTab] = useState<'home' | 'bookings' | 'explore' | 'profile'>('home');

  // Search Configuration State
  const [searchTab, setSearchTab] = useState<'flights' | 'hotels' | 'bus'>('flights');
  const [tripType, setTripType] = useState<'round' | 'oneway'>('round');
  const [fromCode, setFromCode] = useState('HGA');
  const [toCode, setToCode] = useState('MGQ');
  const [departureDate, setDepartureDate] = useState('2026-11-15');
  const [returnDate, setReturnDate] = useState('2026-11-22');

  // Passenger Configuration State
  const [adults, setAdults] = useState<number>(1);
  const [children, setChildren] = useState<number>(0);
  const [infants, setInfants] = useState<number>(0);
  const [isPassengerModalOpen, setIsPassengerModalOpen] = useState(false);

  // Cabin Class Configuration State
  // ECONOMY | BUSINESS | FIRST
  const [cabinClass, setCabinClass] = useState<'ECONOMY' | 'BUSINESS' | 'FIRST'>('ECONOMY');

  // Airport Picker Modal State
  const [airportPickerMode, setAirportPickerMode] = useState<'from' | 'to' | null>(null);
  const [airportSearchQuery, setAirportSearchQuery] = useState('');

  // Primary Contact & Passenger Details State for Checkout
  const [contactName, setContactName] = useState('Kani Mo');
  const [contactEmail, setContactEmail] = useState('kanimo@kanimo.com');
  const [contactPhone, setContactPhone] = useState('+252 63 445 9988');
  const [passengerNames, setPassengerNames] = useState<string[]>(['Kani Mo']);

  // Date strip selection in Search Results
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('2026-11-15');

  // Flights State
  const [flightsList, setFlightsList] = useState<any[]>([]);
  const [isLoadingFlights, setIsLoadingFlights] = useState<boolean>(false);
  const [selectedFlight, setSelectedFlight] = useState<any>(null);

  // Seat Selection State
  const [selectedSeat, setSelectedSeat] = useState<string>('12A');
  const seatRows = [8, 9, 10, 11, 12, 13, 14, 15];
  const occupiedSeats = ['8B', '9E', '10C', '11A', '13F', '14D'];

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'mobile' | 'card' | 'bank'>('mobile');
  const [mobileProvider, setMobileProvider] = useState<'ZAAD' | 'EDAHAB'>('ZAAD');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);

  // Bookings State
  const [bookingFilter, setBookingFilter] = useState<'upcoming' | 'past'>('upcoming');
  const [bookingsList, setBookingsList] = useState<any[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  // QR Modal State
  const [activeBoardingPass, setActiveBoardingPass] = useState<any>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  // Initial App Launch Airplane Landing Loading State
  const [isInitialLandingLoading, setIsInitialLandingLoading] = useState(true);

  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setIsInitialLandingLoading(false);
    }, 2200);
    return () => clearTimeout(splashTimer);
  }, []);

  // Computed Values
  const totalPassengers = adults + children + infants;
  const payingPassengers = adults + children;

  const passengerSummary = useMemo(() => {
    const parts = [];
    if (adults === 1) parts.push('1 Adult');
    else if (adults > 1) parts.push(`${adults} Adults`);

    if (children === 1) parts.push('1 Child');
    else if (children > 1) parts.push(`${children} Children`);

    if (infants === 1) parts.push('1 Infant');
    else if (infants > 1) parts.push(`${infants} Infants`);

    return parts.join(', ') || '1 Adult';
  }, [adults, children, infants]);

  const fromAirport = useMemo(() => {
    return AIRPORTS.find((a) => a.code === fromCode) || {
      code: fromCode,
      city: fromCode,
      name: `${fromCode} Airport`,
      country: '',
    };
  }, [fromCode]);

  const toAirport = useMemo(() => {
    return AIRPORTS.find((a) => a.code === toCode) || {
      code: toCode,
      city: toCode,
      name: `${toCode} Airport`,
      country: '',
    };
  }, [toCode]);

  // Sync passenger names array size with total passengers
  useEffect(() => {
    setPassengerNames((prev) => {
      const updated = [...prev];
      if (updated.length < totalPassengers) {
        for (let i = updated.length; i < totalPassengers; i++) {
          updated.push(i === 0 ? 'Kani Mo' : `Passenger ${i + 1}`);
        }
      } else if (updated.length > totalPassengers) {
        return updated.slice(0, totalPassengers);
      }
      return updated;
    });
  }, [totalPassengers]);

  // Dynamic Date Strip centered around departureDate
  const dynamicDateStrip = useMemo(() => {
    const base = new Date(departureDate);
    const valid = !isNaN(base.getTime()) ? base : new Date('2026-11-15');
    const strip = [];

    for (let offset = -2; offset <= 2; offset++) {
      const d = new Date(valid);
      d.setDate(d.getDate() + offset);
      const iso = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      strip.push({
        day: dayName,
        date: monthDay,
        fullDate: iso,
        isBase: offset === 0,
      });
    }

    // Add 'All Dates' option
    strip.push({
      day: 'All',
      date: 'Flights',
      fullDate: '',
      isBase: false,
    });

    return strip;
  }, [departureDate]);

  // QR Code Rendering
  useEffect(() => {
    if (activeBoardingPass && qrCanvasRef.current) {
      const payload = `KANIMO:PASS:v2:${activeBoardingPass.ticketNumber}:${activeBoardingPass.flightNumber}:${activeBoardingPass.seat}:${activeBoardingPass.fromCode}-${activeBoardingPass.toCode}:VERIFIED`;
      QRCode.toCanvas(qrCanvasRef.current, payload, {
        width: 190,
        margin: 1,
        color: { dark: '#0b1329', light: '#ffffff' },
      }).catch(console.error);
    }
  }, [activeBoardingPass]);

  // Helper date formatter
  const formatPrettyDate = (isoStr: string) => {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr;
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return isoStr;
    }
  };

  // Class specs helper
  const getClassSpecs = (cls: 'ECONOMY' | 'BUSINESS' | 'FIRST') => {
    switch (cls) {
      case 'FIRST':
        return {
          name: 'First Class',
          tag: 'VIP Luxury',
          cabinBaggage: '14 kg',
          checkedBaggage: '3x32 kg (VIP Included)',
          benefits: 'Private suite, à la carte dining, private transfer',
          priceMultiplier: 2.8,
        };
      case 'BUSINESS':
        return {
          name: 'Business Class',
          tag: 'Premium Comfort',
          cabinBaggage: '10 kg',
          checkedBaggage: '2x32 kg (Included)',
          benefits: 'Lie-flat seats, airport lounge, priority check-in',
          priceMultiplier: 1.8,
        };
      case 'ECONOMY':
      default:
        return {
          name: 'Economy Class',
          tag: 'Smart Value',
          cabinBaggage: '7 kg',
          checkedBaggage: '1x20 kg (Included)',
          benefits: 'Ergonomic seat, complimentary beverages, USB charging',
          priceMultiplier: 1.0,
        };
    }
  };

  // Fetch Live Flights from Backend with Strict Route Preservation
  const fetchFlights = async (
    origin = fromCode,
    destination = toCode,
    targetDate = selectedDateFilter,
    targetClass = cabinClass
  ) => {
    setIsLoadingFlights(true);
    try {
      const params = new URLSearchParams();
      if (origin && origin !== 'ALL') params.append('origin', origin);
      if (destination && destination !== 'ALL') params.append('destination', destination);
      if (targetDate) params.append('date', targetDate);
      if (targetClass) params.append('cabinClass', targetClass);

      const qs = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`${apiBaseUrl}/api/flights${qs}`);

      if (res.ok) {
        const data = await res.json();
        if (data.flights && data.flights.length > 0) {
          const mapped = data.flights.map((f: any) => {
            const dep = new Date(f.departureTime);
            const arr = new Date(f.arrivalTime);

            // Find tier matching targetClass or fallback to first tier
            let tier = f.tiers?.find((t: any) => t.cabinClass === targetClass);
            if (!tier && f.tiers && f.tiers.length > 0) {
              tier = f.tiers[0];
            }

            const classSpecs = getClassSpecs(targetClass);
            const basePrice = tier?.price || f.minPrice || 275;

            return {
              id: f.id,
              flightNumber: f.flightNumber,
              airline: f.airline || 'Kanimo Skyways',
              from: f.originCode || origin,
              fromCity: f.originCity || (AIRPORTS.find((a) => a.code === origin)?.city || origin),
              to: f.destinationCode || destination,
              toCity: f.destinationCity || (AIRPORTS.find((a) => a.code === destination)?.city || destination),
              depTime: dep.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
              arrTime: arr.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
              departureDate: dep.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
              departureDateIso: dep.toISOString().split('T')[0],
              duration: f.duration || '1h 20m',
              stopType: f.stops === 0 || !f.stops ? 'Non-stop' : `${f.stops} stop`,
              aircraft: f.aircraft || 'Boeing 737-800',
              classType: classSpecs.name,
              cabinClass: targetClass,
              price: basePrice,
              tierId: tier?.id,
              allTiers: f.tiers || [],
              cabinBaggage: classSpecs.cabinBaggage,
              checkedBaggage: tier?.baggage || classSpecs.checkedBaggage,
              baseFare: Math.round(basePrice * 0.88),
              taxes: Math.round(basePrice * 0.12),
              status: f.status,
            };
          });

          setFlightsList(mapped);
          return;
        }
      }

      // If backend returned 0 flights for this exact route/date combination, set empty array
      // DO NOT overwrite with different origin/destination routes!
      setFlightsList([]);
    } catch (err) {
      console.warn('Flight fetch error:', err);
      setFlightsList([]);
    } finally {
      setIsLoadingFlights(false);
    }
  };

  // Swap From / To Airports
  const handleSwapAirports = () => {
    const prevFrom = fromCode;
    const prevTo = toCode;
    setFromCode(prevTo);
    setToCode(prevFrom);
    fetchFlights(prevTo, prevFrom, departureDate, cabinClass);
  };

  // Sync Backend Orders
  const fetchOrdersFromBackend = async () => {
    setIsLoadingBookings(true);
    try {
      // Query with all=true or contact email so customer and admin orders are visible
      const res = await fetch(`${apiBaseUrl}/api/orders?all=true`);
      if (res.ok) {
        const data = await res.json();
        if (data.orders && data.orders.length > 0) {
          const mapped = data.orders.map((o: any) => {
            const flight = o.flight;
            const departureDateObj = flight?.departureTime ? new Date(flight.departureTime) : new Date(o.createdAt);
            const arrivalDateObj = flight?.arrivalTime ? new Date(flight.arrivalTime) : new Date(o.createdAt);
            const isPast = departureDateObj.getTime() < Date.now();
            const firstItem = o.items?.[0];
            const firstTicket = o.tickets?.[0];

            return {
              id: o.id,
              orderNumber: o.orderNumber,
              status: isPast ? 'Past' : (o.status === 'PAID' ? 'Confirmed' : o.status),
              statusColor: isPast ? 'slate' : (o.status === 'PAID' ? 'emerald' : 'blue'),
              from: flight?.originCity || 'Hargeisa',
              fromCode: flight?.originCode || 'HGA',
              to: flight?.destinationCity || 'Mogadishu',
              toCode: flight?.destinationCode || 'MGQ',
              date: departureDateObj.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }),
              passengers: `${o.passengerCount || 1} Traveler(s)`,
              passengerName: firstItem?.passengerName || o.user?.name || 'Kani Mo',
              airline: flight?.airline || 'Kanimo Skyways',
              flightNumber: flight?.flightNumber || 'FLIGHT',
              depTime: departureDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
              arrTime: arrivalDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
              duration: flight?.duration || '1h 20m',
              seat: firstItem?.seatNumber || '12A',
              gate: flight?.gate || 'A3',
              terminal: flight?.terminal || '1',
              ticketNumber: firstTicket?.ticketNumber || `TKT-${o.orderNumber}-01`,
              amountPaid: o.totalAmount,
              paymentMethod: o.paymentMethod,
              isPast,
            };
          });

          setBookingsList(mapped);
          return;
        }
      }
    } catch (e) {
      console.log('Could not fetch backend orders:', e);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  // Launch initial sync
  useEffect(() => {
    setSelectedDateFilter(departureDate);
    fetchFlights(fromCode, toCode, departureDate, cabinClass);
    fetchOrdersFromBackend();
  }, [apiBaseUrl]);

  // Tab switching
  const handleTabChange = (tab: 'home' | 'bookings' | 'explore' | 'profile') => {
    setActiveBottomTab(tab);
    if (tab === 'home') setCurrentScreen('home');
    if (tab === 'bookings') {
      setCurrentScreen('bookings');
      fetchOrdersFromBackend();
    }
    if (tab === 'explore') setCurrentScreen('explore');
    if (tab === 'profile') setCurrentScreen('profile');
  };

  // Select class within Flight Details screen
  const handleSelectCabinClassOnDetails = (newClass: 'ECONOMY' | 'BUSINESS' | 'FIRST') => {
    if (!selectedFlight) return;
    const specs = getClassSpecs(newClass);

    // Look for matching tier in selected flight's tier list
    const foundTier = selectedFlight.allTiers?.find((t: any) => t.cabinClass === newClass);
    let newPrice = selectedFlight.price;

    if (foundTier) {
      newPrice = foundTier.price;
    } else {
      // Calculate realistic tier price based on multiplier
      const baseEco = selectedFlight.allTiers?.find((t: any) => t.cabinClass === 'ECONOMY')?.price || 275;
      newPrice = Math.round(baseEco * specs.priceMultiplier);
    }

    setSelectedFlight({
      ...selectedFlight,
      cabinClass: newClass,
      classType: specs.name,
      price: newPrice,
      tierId: foundTier?.id || selectedFlight.tierId,
      cabinBaggage: specs.cabinBaggage,
      checkedBaggage: foundTier?.baggage || specs.checkedBaggage,
      baseFare: Math.round(newPrice * 0.88),
      taxes: Math.round(newPrice * 0.12),
    });
  };

  // Guaranteed Real Order Creation & Immediate Backend Synchronization
  const handlePayNow = async () => {
    if (!selectedFlight) return;
    setPaymentProcessing(true);
    setPaymentError(null);

    const selectedPaymentMethod =
      paymentMethod === 'mobile'
        ? mobileProvider === 'ZAAD'
          ? 'MOBILE_MONEY_ZAAD'
          : 'MOBILE_MONEY_EDAHAB'
        : paymentMethod === 'card'
        ? 'CARD'
        : 'BANK_TRANSFER';

    // Construct full passenger list
    const preparedPassengers = [];
    for (let i = 0; i < totalPassengers; i++) {
      const name = passengerNames[i]?.trim() || (i === 0 ? contactName : `Passenger ${i + 1}`);
      const assignedSeat = i === 0 ? selectedSeat : `${parseInt(selectedSeat || '12', 10) + i}B`;
      preparedPassengers.push({
        name,
        email: contactEmail.trim() || 'kanimo@kanimo.com',
        seatNumber: assignedSeat,
        seatPreference: i % 2 === 0 ? 'Window' : 'Aisle',
      });
    }

    const payload = {
      flightNumber: selectedFlight.flightNumber,
      flightId: selectedFlight.id,
      ticketTierId: selectedFlight.tierId,
      contactEmail: contactEmail.trim() || 'kanimo@kanimo.com',
      contactPhone: contactPhone.trim() || '+252 63 445 9988',
      paymentMethod: selectedPaymentMethod,
      passengers: preparedPassengers,
    };

    try {
      const res = await fetch(`${apiBaseUrl}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Server rejected booking. Please verify flight availability.');
      }

      console.log('✅ Real Order created in PostgreSQL backend:', data);

      const serverOrder = data.order || {};
      const serverTicket = data.tickets?.[0] || {};

      const newBooking = {
        id: serverOrder.id || `b-${Date.now()}`,
        orderNumber: serverOrder.orderNumber || 'ORD-KANIMO',
        status: 'Confirmed',
        statusColor: 'emerald',
        from: selectedFlight.fromCity || fromAirport.city,
        fromCode: selectedFlight.from || fromCode,
        to: selectedFlight.toCity || toAirport.city,
        toCode: selectedFlight.to || toCode,
        date: selectedFlight.departureDate || formatPrettyDate(departureDate),
        passengers: passengerSummary,
        passengerName: preparedPassengers[0].name,
        airline: selectedFlight.airline,
        flightNumber: selectedFlight.flightNumber,
        depTime: selectedFlight.depTime,
        arrTime: selectedFlight.arrTime,
        duration: selectedFlight.duration,
        seat: selectedSeat,
        gate: selectedFlight.gate || 'A3',
        terminal: selectedFlight.terminal || '1',
        ticketNumber: serverTicket.ticketNumber || `TKT-${selectedFlight.flightNumber}-${selectedSeat}`,
        amountPaid: serverOrder.totalAmount || selectedFlight.price * payingPassengers,
        paymentMethod: selectedPaymentMethod,
        isPast: false,
      };

      setConfirmedOrder(newBooking);
      setBookingsList((prev) => [newBooking, ...prev]);
      setPaymentDone(true);

      // Re-synchronize authoritative order list from Neon PostgreSQL immediately
      await fetchOrdersFromBackend();
    } catch (err: any) {
      console.error('Order creation failed:', err);
      setPaymentError(err.message || 'Payment processing failed. Please check network connection.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  if (isInitialLandingLoading) {
    return (
      <div onClick={() => setIsInitialLandingLoading(false)}>
        <AirplaneLandingLoader
          title="Approaching Runway • Preparing for Landing"
          subtitle="Kanimo Skyways Flight Navigation & Global Reservations"
          fullScreen={true}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f1f5f9] text-slate-800 antialiased font-sans select-none">
      {/* ======================================================== */}
      {/* SCREEN 1: HOME */}
      {/* ======================================================== */}
      {currentScreen === 'home' && (
        <div className="flex-1 flex flex-col pt-safe-top pb-safe-bottom mb-20 overflow-y-auto">
          {/* Top Bar: Brand, Notification Bell, User Avatar */}
          <div className="px-5 py-3.5 flex items-center justify-between bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
                <Plane className="w-5 h-5 transform -rotate-45" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-lg tracking-tight text-slate-900 leading-none">
                  Kanimo <span className="text-blue-600">Sky</span>
                </span>
                <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mt-0.5">
                  Authoritative Airline App
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => handleTabChange('bookings')}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 relative hover:bg-slate-200 transition"
              >
                <Bell className="w-4 h-4" />
                <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-1 right-1"></span>
              </button>

              <div
                onClick={() => handleTabChange('profile')}
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-sm cursor-pointer"
              >
                KM
              </div>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Hero Card Banner */}
            <div className="relative rounded-3xl overflow-hidden bg-[#0c1b33] text-white p-5 shadow-lg shadow-slate-900/10">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity pointer-events-none"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=800&q=80')",
                }}
              />
              <div className="relative z-10 space-y-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                  <Sparkles className="w-3 h-3 text-amber-300" /> Live Database Connected
                </span>
                <h2 className="text-2xl font-black tracking-tight text-white pt-1">Fly Anywhere</h2>
                <p className="text-xs text-blue-100/90 max-w-xs leading-relaxed font-medium">
                  Customizable departures, passenger counters, and multi-cabin luxury flights.
                </p>
              </div>
            </div>

            {/* Floating Search Card */}
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200 space-y-3.5">
              {/* Trip Type & Mode Tabs */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setTripType('round')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      tripType === 'round' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Round Trip
                  </button>
                  <button
                    onClick={() => setTripType('oneway')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      tripType === 'oneway' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    One Way
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Class:</span>
                  <span className="text-xs font-black text-blue-600">
                    {cabinClass === 'FIRST' ? 'First' : cabinClass === 'BUSINESS' ? 'Business' : 'Economy'}
                  </span>
                </div>
              </div>

              {/* Cabin Class Selector Pills */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Select Cabin Class
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCabinClass('ECONOMY');
                      fetchFlights(fromCode, toCode, departureDate, 'ECONOMY');
                    }}
                    className={`py-2 px-2 rounded-xl text-center border font-bold text-xs transition flex flex-col items-center justify-center gap-1 ${
                      cabinClass === 'ECONOMY'
                        ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Luggage className="w-3.5 h-3.5" />
                    <span>Economy</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCabinClass('BUSINESS');
                      fetchFlights(fromCode, toCode, departureDate, 'BUSINESS');
                    }}
                    className={`py-2 px-2 rounded-xl text-center border font-bold text-xs transition flex flex-col items-center justify-center gap-1 ${
                      cabinClass === 'BUSINESS'
                        ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Business</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCabinClass('FIRST');
                      fetchFlights(fromCode, toCode, departureDate, 'FIRST');
                    }}
                    className={`py-2 px-2 rounded-xl text-center border font-bold text-xs transition flex flex-col items-center justify-center gap-1 ${
                      cabinClass === 'FIRST'
                        ? 'bg-amber-50 border-amber-600 text-amber-800 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-600" />
                    <span>First Class</span>
                  </button>
                </div>
              </div>

              {/* Route Input with Interactive Airport Picker Modal */}
              <div className="relative space-y-2 pt-1">
                {/* From Card */}
                <div
                  onClick={() => {
                    setAirportSearchQuery('');
                    setAirportPickerMode('from');
                  }}
                  className="bg-slate-50 border border-slate-200 hover:border-blue-400 rounded-2xl px-4 py-2.5 cursor-pointer transition active:scale-[0.99]"
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">From (Origin)</span>
                  <div className="flex items-center justify-between mt-0.5">
                    <div className="flex items-center gap-2.5">
                      <Plane className="w-4 h-4 text-blue-600 shrink-0 transform -rotate-45" />
                      <div>
                        <span className="text-sm font-black text-slate-900 block leading-tight">
                          {fromAirport.city} ({fromAirport.code})
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium truncate max-w-[200px] block">
                          {fromAirport.name}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-blue-600">Change</span>
                  </div>
                </div>

                {/* Swap Icon Button */}
                <div className="absolute right-5 top-1/2 -translate-y-1/2 z-10">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSwapAirports();
                    }}
                    className="w-9 h-9 rounded-full bg-white border border-slate-200 text-blue-600 flex items-center justify-center shadow-md active:scale-90 transition hover:bg-blue-50"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                  </button>
                </div>

                {/* To Card */}
                <div
                  onClick={() => {
                    setAirportSearchQuery('');
                    setAirportPickerMode('to');
                  }}
                  className="bg-slate-50 border border-slate-200 hover:border-blue-400 rounded-2xl px-4 py-2.5 cursor-pointer transition active:scale-[0.99]"
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">To (Destination)</span>
                  <div className="flex items-center justify-between mt-0.5">
                    <div className="flex items-center gap-2.5">
                      <Plane className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <span className="text-sm font-black text-slate-900 block leading-tight">
                          {toAirport.city} ({toAirport.code})
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium truncate max-w-[200px] block">
                          {toAirport.name}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-blue-600">Change</span>
                  </div>
                </div>
              </div>

              {/* Customizable Dates Row */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                {/* Departure Date */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 relative">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Departure Date</span>
                  <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-slate-900">
                    <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{formatPrettyDate(departureDate)}</span>
                  </div>
                  <input
                    type="date"
                    value={departureDate}
                    onChange={(e) => {
                      setDepartureDate(e.target.value);
                      setSelectedDateFilter(e.target.value);
                      fetchFlights(fromCode, toCode, e.target.value, cabinClass);
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>

                {/* Return Date */}
                <div
                  className={`bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 relative ${
                    tripType === 'oneway' ? 'opacity-40 pointer-events-none' : ''
                  }`}
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">
                    {tripType === 'oneway' ? 'One Way Flight' : 'Return Date'}
                  </span>
                  <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-slate-900">
                    <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{tripType === 'oneway' ? 'Not Applicable' : formatPrettyDate(returnDate)}</span>
                  </div>
                  {tripType === 'round' && (
                    <input
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  )}
                </div>
              </div>

              {/* Customizable Passenger Counter Card */}
              <div
                onClick={() => setIsPassengerModalOpen(true)}
                className="bg-slate-50 border border-slate-200 hover:border-blue-400 rounded-2xl px-4 py-2.5 flex items-center justify-between cursor-pointer transition active:scale-[0.99]"
              >
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Passengers & Travelers</span>
                  <div className="flex items-center gap-2 mt-0.5 text-xs font-extrabold text-slate-900">
                    <Users className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{passengerSummary}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-blue-600">
                  <span>Edit</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Search Flights Action Button */}
              <button
                onClick={() => {
                  fetchFlights(fromCode, toCode, departureDate, cabinClass);
                  setCurrentScreen('search_results');
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] text-white font-black text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition"
              >
                <Search className="w-4 h-4" />
                <span>Search Scheduled Flights</span>
              </button>
            </div>

            {/* 3 Guarantee Value Props */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white rounded-2xl p-3 border border-slate-200 flex flex-col items-center text-center shadow-xs">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-800">Best Fares</span>
              </div>

              <div className="bg-white rounded-2xl p-3 border border-slate-200 flex flex-col items-center text-center shadow-xs">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-800">Live Orders</span>
              </div>

              <div className="bg-white rounded-2xl p-3 border border-slate-200 flex flex-col items-center text-center shadow-xs">
                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-1">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-800">Instant Sync</span>
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
          <div className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-20 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentScreen('home')}
                className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h3 className="font-black text-sm text-slate-900 leading-tight">
                  {fromAirport.city} ➔ {toAirport.city}
                </h3>
                <p className="text-[11px] text-slate-500 font-semibold">
                  {formatPrettyDate(departureDate)} • {passengerSummary} • {cabinClass}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchFlights(fromCode, toCode, selectedDateFilter, cabinClass)}
                className={`w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 ${
                  isLoadingFlights ? 'animate-spin' : ''
                }`}
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Dynamic 5-Day Strip Centered on Departure Date */}
          <div className="bg-white border-b border-slate-200 px-3 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {dynamicDateStrip.map((item) => {
              const isSelected = selectedDateFilter === item.fullDate;
              return (
                <button
                  key={item.fullDate || 'all'}
                  onClick={() => {
                    setSelectedDateFilter(item.fullDate);
                    fetchFlights(fromCode, toCode, item.fullDate, cabinClass);
                  }}
                  className={`flex-1 min-w-[68px] py-2 px-1.5 rounded-2xl text-center transition ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-[10px] block uppercase font-bold">{item.day}</span>
                  <span className="text-xs font-black block">{item.date}</span>
                </button>
              );
            })}
          </div>

          {/* Flight Results Content */}
          <div className="p-4 space-y-3.5">
            {isLoadingFlights ? (
              <AirplaneLandingLoader
                title="Scanning Flight Corridors • Landing Inventory"
                subtitle={`Querying live scheduled flights from ${fromAirport.city} (${fromCode}) to ${toAirport.city} (${toCode})...`}
                fullScreen={false}
              />
            ) : flightsList.length === 0 ? (
              <div className="py-12 bg-white rounded-3xl p-6 text-center border border-slate-200 space-y-3 shadow-xs">
                <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <Plane className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    No Direct Flights on this specific day for {fromAirport.code} ➔ {toAirport.code}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Try tapping adjacent dates on the strip above or click below to check all upcoming dates for this route.
                  </p>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={() => {
                      setSelectedDateFilter('');
                      fetchFlights(fromCode, toCode, '', cabinClass);
                    }}
                    className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs shadow-sm hover:bg-blue-700"
                  >
                    View All Upcoming {fromAirport.code} ➔ {toAirport.code} Flights
                  </button>
                  <button
                    onClick={() => setCurrentScreen('home')}
                    className="w-full py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-200"
                  >
                    Change Route or Cabin Class
                  </button>
                </div>
              </div>
            ) : (
              flightsList.map((flight) => (
                <div
                  key={flight.id}
                  className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition space-y-3"
                >
                  {/* Airline & Class Tag */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <AirlineBadge airline={flight.airline} code={flight.flightNumber} />
                      <div>
                        <h4 className="font-black text-sm text-slate-900 leading-tight">{flight.airline}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] text-slate-400 font-bold">{flight.flightNumber}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600">
                            {flight.classType}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-slate-900 leading-none">${flight.price}</span>
                      <span className="text-[10px] text-slate-400 block font-semibold">per person</span>
                    </div>
                  </div>

                  {/* Route Timeline */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="text-left">
                      <span className="text-lg font-black text-slate-900 leading-none">{flight.depTime}</span>
                      <span className="text-xs font-bold text-slate-500 block mt-0.5">
                        {flight.fromCity} ({flight.from})
                      </span>
                    </div>

                    <div className="flex-1 px-4 flex flex-col items-center">
                      <span className="text-[10px] font-bold text-slate-400">{flight.duration}</span>
                      <div className="w-full flex items-center my-1">
                        <div className="w-2.5 h-2.5 rounded-full border-2 border-blue-600 bg-white"></div>
                        <div className="flex-1 border-t border-dashed border-slate-300"></div>
                        <Plane className="w-3.5 h-3.5 text-blue-600 transform rotate-90 mx-1 shrink-0" />
                        <div className="flex-1 border-t border-dashed border-slate-300"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600">{flight.stopType}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-black text-slate-900 leading-none">{flight.arrTime}</span>
                      <span className="text-xs font-bold text-slate-500 block mt-0.5">
                        {flight.toCity} ({flight.to})
                      </span>
                    </div>
                  </div>

                  {/* Footer & Select Action */}
                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-semibold">{flight.departureDate}</span>
                    <button
                      onClick={() => {
                        setSelectedFlight(flight);
                        setCurrentScreen('flight_details');
                      }}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-sm shadow-blue-500/20 transition"
                    >
                      Select Flight
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SCREEN 3: FLIGHT DETAILS & CLASS CUSTOMIZER */}
      {/* ======================================================== */}
      {currentScreen === 'flight_details' && selectedFlight && (
        <div className="flex-1 flex flex-col pt-safe-top pb-safe-bottom mb-20 overflow-y-auto">
          {/* Header */}
          <div className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-20 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentScreen('search_results')}
                className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="font-black text-base text-slate-900">Flight Details & Cabin</h3>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Wing / Cloud Banner */}
            <div className="relative rounded-3xl overflow-hidden h-36 bg-slate-900 shadow-md">
              <img
                src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80"
                alt="Sky banner"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-slate-800">
                {selectedFlight.stopType} • Boeing 737
              </div>
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="text-xl font-black drop-shadow-md">
                  {selectedFlight.fromCity} ➔ {selectedFlight.toCity}
                </span>
              </div>
            </div>

            {/* Interactive Airplane Cabin Class Customizer */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Customize Airplane Cabin Class
                </span>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  Instant Update
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {/* Economy */}
                <div
                  onClick={() => handleSelectCabinClassOnDetails('ECONOMY')}
                  className={`p-3 rounded-2xl border text-center cursor-pointer transition ${
                    selectedFlight.cabinClass === 'ECONOMY'
                      ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Luggage className="w-4 h-4 mx-auto text-blue-600 mb-1" />
                  <span className="text-xs font-black block text-slate-900">Economy</span>
                  <span className="text-[10px] text-slate-500 block">7kg + 20kg</span>
                  <span className="text-xs font-black text-blue-600 block mt-1">Standard</span>
                </div>

                {/* Business */}
                <div
                  onClick={() => handleSelectCabinClassOnDetails('BUSINESS')}
                  className={`p-3 rounded-2xl border text-center cursor-pointer transition ${
                    selectedFlight.cabinClass === 'BUSINESS'
                      ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Briefcase className="w-4 h-4 mx-auto text-blue-600 mb-1" />
                  <span className="text-xs font-black block text-slate-900">Business</span>
                  <span className="text-[10px] text-slate-500 block">10kg + 2x32kg</span>
                  <span className="text-xs font-black text-blue-600 block mt-1">Lounge</span>
                </div>

                {/* First Class */}
                <div
                  onClick={() => handleSelectCabinClassOnDetails('FIRST')}
                  className={`p-3 rounded-2xl border text-center cursor-pointer transition ${
                    selectedFlight.cabinClass === 'FIRST'
                      ? 'border-amber-600 bg-amber-50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Crown className="w-4 h-4 mx-auto text-amber-600 mb-1" />
                  <span className="text-xs font-black block text-slate-900">First Class</span>
                  <span className="text-[10px] text-slate-500 block">14kg + 3x32kg</span>
                  <span className="text-xs font-black text-amber-600 block mt-1">VIP Suite</span>
                </div>
              </div>
            </div>

            {/* Flight Itinerary Overview Card */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <AirlineBadge airline={selectedFlight.airline} code={selectedFlight.flightNumber} />
                  <div>
                    <h4 className="font-black text-base text-slate-900">{selectedFlight.airline}</h4>
                    <span className="text-xs text-slate-400 font-bold">{selectedFlight.flightNumber}</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 font-bold text-xs">
                  {selectedFlight.stopType}
                </span>
              </div>

              {/* Large Route Display */}
              <div className="flex items-center justify-between border-y border-slate-100 py-4">
                <div>
                  <span className="text-2xl font-black text-slate-900 block leading-tight">{selectedFlight.from}</span>
                  <span className="text-xs text-slate-500 block font-semibold">{selectedFlight.fromCity}</span>
                  <span className="text-base font-black text-slate-800 block mt-1">{selectedFlight.depTime}</span>
                  <span className="text-[10px] text-slate-400 font-medium">{selectedFlight.departureDate}</span>
                </div>

                <div className="flex-1 px-4 flex flex-col items-center">
                  <Plane className="w-5 h-5 text-blue-600 transform rotate-90" />
                  <span className="text-[11px] font-bold text-slate-500 mt-1">{selectedFlight.duration}</span>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-black text-slate-900 block leading-tight">{selectedFlight.to}</span>
                  <span className="text-xs text-slate-500 block font-semibold">{selectedFlight.toCity}</span>
                  <span className="text-base font-black text-slate-800 block mt-1">{selectedFlight.arrTime}</span>
                  <span className="text-[10px] text-slate-400 font-medium">{selectedFlight.departureDate}</span>
                </div>
              </div>

              {/* Meta details chips */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-50 rounded-2xl p-2.5">
                  <Clock className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-400 block font-bold">Duration</span>
                  <span className="font-black text-slate-800">{selectedFlight.duration}</span>
                </div>

                <div className="bg-slate-50 rounded-2xl p-2.5">
                  <Plane className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-400 block font-bold">Aircraft</span>
                  <span className="font-black text-slate-800">{selectedFlight.aircraft}</span>
                </div>

                <div className="bg-slate-50 rounded-2xl p-2.5">
                  <Luggage className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-400 block font-bold">Class</span>
                  <span className="font-black text-slate-800">{selectedFlight.classType}</span>
                </div>
              </div>

              {/* Baggage info */}
              <div className="space-y-2 pt-1 text-xs">
                <div className="flex items-center justify-between text-slate-700 bg-slate-50 px-3.5 py-2.5 rounded-xl">
                  <span className="flex items-center gap-2 font-medium">
                    <Luggage className="w-4 h-4 text-blue-600" />
                    <span>Cabin Baggage</span>
                  </span>
                  <span className="font-black text-slate-900">{selectedFlight.cabinBaggage}</span>
                </div>

                <div className="flex items-center justify-between text-slate-700 bg-slate-50 px-3.5 py-2.5 rounded-xl">
                  <span className="flex items-center gap-2 font-medium">
                    <Luggage className="w-4 h-4 text-blue-600" />
                    <span>Checked Baggage</span>
                  </span>
                  <span className="font-black text-slate-900">{selectedFlight.checkedBaggage}</span>
                </div>
              </div>
            </div>

            {/* Bottom Floating Bar */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-md flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Price ({payingPassengers} Passenger{payingPassengers > 1 ? 's' : ''})
                </span>
                <span className="text-2xl font-black text-slate-900">
                  ${selectedFlight.price * payingPassengers}
                </span>
                <span className="text-[10px] text-slate-500 ml-1 font-semibold">
                  (${selectedFlight.price}/person)
                </span>
              </div>

              <button
                onClick={() => setCurrentScreen('select_seat')}
                className="px-7 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-md shadow-blue-500/25 active:scale-95 transition"
              >
                Select Seats
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SCREEN 4: SELECT SEAT */}
      {/* ======================================================== */}
      {currentScreen === 'select_seat' && selectedFlight && (
        <div className="flex-1 flex flex-col pt-safe-top pb-safe-bottom mb-20 overflow-y-auto">
          {/* Header */}
          <div className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-20 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentScreen('flight_details')}
                className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h3 className="font-black text-base text-slate-900">Select Airplane Seat</h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  {selectedFlight.from} ➔ {selectedFlight.to} • {passengerSummary}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Airplane Fuselage Container */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs max-w-sm mx-auto w-full">
              {/* Cockpit Nose */}
              <div className="w-28 h-10 border-t-2 border-x-2 border-slate-300 rounded-t-full mx-auto mb-4 flex items-center justify-center bg-slate-50">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cockpit</span>
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
                    {['A', 'B', 'C'].map((col) => {
                      const seatId = `${row}${col}`;
                      const isOcc = occupiedSeats.includes(seatId);
                      const isSel = selectedSeat === seatId;
                      return (
                        <button
                          key={seatId}
                          disabled={isOcc}
                          onClick={() => setSelectedSeat(seatId)}
                          className={`w-8 h-8 rounded-lg mx-auto flex items-center justify-center text-[10px] font-black transition ${
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
                    })}

                    {/* Aisle */}
                    <span className="text-[11px] font-bold text-slate-400">{row}</span>

                    {['D', 'E', 'F'].map((col) => {
                      const seatId = `${row}${col}`;
                      const isOcc = occupiedSeats.includes(seatId);
                      const isSel = selectedSeat === seatId;
                      return (
                        <button
                          key={seatId}
                          disabled={isOcc}
                          onClick={() => setSelectedSeat(seatId)}
                          className={`w-8 h-8 rounded-lg mx-auto flex items-center justify-center text-[10px] font-black transition ${
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
                    })}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-around border-t border-slate-100 mt-5 pt-4 text-xs font-semibold text-slate-500">
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded bg-blue-50 border border-blue-200"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded bg-blue-600"></div>
                  <span className="font-black text-slate-900">Selected</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded bg-slate-200"></div>
                  <span>Occupied</span>
                </div>
              </div>
            </div>

            {/* Bottom floating bar */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-md flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Selected Seat</span>
                <span className="text-xl font-black text-slate-900">{selectedSeat}</span>
                <span className="text-[10px] text-slate-500 ml-1 font-medium">({passengerNames[0]})</span>
              </div>

              <button
                onClick={() => setCurrentScreen('payment')}
                className="px-7 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-md shadow-blue-500/25 active:scale-95 transition"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SCREEN 5: CHECKOUT & SYNCHRONIZED REAL PURCHASE */}
      {/* ======================================================== */}
      {currentScreen === 'payment' && selectedFlight && (
        <div className="flex-1 flex flex-col pt-safe-top pb-safe-bottom mb-20 overflow-y-auto">
          {/* Header */}
          <div className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-20 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentScreen('select_seat')}
                className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="font-black text-base text-slate-900">Checkout & Payment</h3>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Error Banner */}
            {paymentError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-800 text-xs font-bold">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{paymentError}</span>
              </div>
            )}

            {/* Flight Summary Card */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Flight Summary</span>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  {selectedFlight.classType}
                </span>
              </div>

              <div>
                <h4 className="font-black text-base text-slate-900">
                  {selectedFlight.fromCity} ➔ {selectedFlight.toCity}
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  {selectedFlight.departureDate} • {passengerSummary} • Seat {selectedSeat}
                </p>
                <p className="text-xs text-blue-600 font-bold mt-0.5">
                  ✈ {selectedFlight.airline} {selectedFlight.flightNumber} • {selectedFlight.stopType}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span>
                    Fare ({payingPassengers} x ${selectedFlight.price})
                  </span>
                  <span className="font-black text-slate-900">${selectedFlight.price * payingPassengers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Taxes, Security & Airport Charges</span>
                  <span className="font-bold text-emerald-600">Included</span>
                </div>
                <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-base font-black text-slate-900">
                  <span>Grand Total</span>
                  <span className="text-xl text-blue-600">${selectedFlight.price * payingPassengers}</span>
                </div>
              </div>
            </div>

            {/* Passenger Information Form */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">
                Traveler & Contact Details
              </span>

              {/* Primary Contact Email & Phone */}
              <div className="space-y-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    Contact Email (For Digital Tickets)
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="e.g. kanimo@kanimo.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    Mobile Phone (For Booking SMS)
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="e.g. +252 63 445 9988"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Passenger Names List */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Passenger Names ({passengerNames.length} Travelers)
                </span>
                {passengerNames.map((name, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        const updated = [...passengerNames];
                        updated[idx] = e.target.value;
                        setPassengerNames(updated);
                        if (idx === 0) setContactName(e.target.value);
                      }}
                      placeholder={`Passenger ${idx + 1} Full Name`}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Choose Payment Method */}
            <div className="space-y-2.5">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider block ml-1">
                Choose Payment Method
              </span>

              {/* Option 1: Mobile Money (Zaad / eDahab) */}
              <div
                onClick={() => setPaymentMethod('mobile')}
                className={`p-4 rounded-3xl border transition cursor-pointer ${
                  paymentMethod === 'mobile'
                    ? 'bg-white border-blue-500 shadow-md ring-1 ring-blue-500'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-900">Mobile Money</h4>
                      <p className="text-xs text-slate-500 font-medium">Zaad Service / eDahab</p>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'mobile' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                    }`}
                  >
                    {paymentMethod === 'mobile' && <Check className="w-3 h-3" />}
                  </div>
                </div>

                {paymentMethod === 'mobile' && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setMobileProvider('ZAAD')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                          mobileProvider === 'ZAAD' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        Zaad Service
                      </button>
                      <button
                        type="button"
                        onClick={() => setMobileProvider('EDAHAB')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                          mobileProvider === 'EDAHAB' ? 'bg-amber-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        eDahab
                      </button>
                    </div>
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="e.g. +252 63 445 9988"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Option 2: Card Payment */}
              <div
                onClick={() => setPaymentMethod('card')}
                className={`p-4 rounded-3xl border transition cursor-pointer flex items-center justify-between ${
                  paymentMethod === 'card'
                    ? 'bg-white border-blue-500 shadow-md ring-1 ring-blue-500'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-slate-900">Card Payment</h4>
                    <p className="text-xs text-slate-500 font-medium">Visa / Mastercard / Amex</p>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    paymentMethod === 'card' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                  }`}
                >
                  {paymentMethod === 'card' && <Check className="w-3 h-3" />}
                </div>
              </div>

              {/* Option 3: Bank Transfer */}
              <div
                onClick={() => setPaymentMethod('bank')}
                className={`p-4 rounded-3xl border transition cursor-pointer flex items-center justify-between ${
                  paymentMethod === 'bank'
                    ? 'bg-white border-blue-500 shadow-md ring-1 ring-blue-500'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-slate-900">Bank Transfer</h4>
                    <p className="text-xs text-slate-500 font-medium">Dahabshiil / Premier Bank</p>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    paymentMethod === 'bank' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                  }`}
                >
                  {paymentMethod === 'bank' && <Check className="w-3 h-3" />}
                </div>
              </div>
            </div>

            {/* Authoritative Pay Now Action */}
            <button
              onClick={handlePayNow}
              disabled={paymentProcessing}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] text-white font-black text-base shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 transition"
            >
              {paymentProcessing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Synchronizing Order with Database...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Confirm & Pay ${selectedFlight.price * payingPassengers}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Full-screen Airplane Landing Loader during payment processing */}
      {paymentProcessing && (
        <AirplaneLandingLoader
          title="Securing Reservation • Finalizing Landing"
          subtitle="Synchronizing your booking & tickets with live Neon PostgreSQL..."
          fullScreen={true}
        />
      )}

      {/* ======================================================== */}
      {/* PAYMENT SUCCESS MODAL & REAL ORDER VERIFICATION */}
      {/* ======================================================== */}
      {paymentDone && confirmedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Order Synchronized!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Your booking is officially recorded in the live PostgreSQL database and issued.
              </p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 text-xs text-left space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Order Number</span>
                <span className="font-mono font-black text-blue-600">{confirmedOrder.orderNumber}</span>
              </div>
              <p className="font-black text-slate-900">
                {confirmedOrder.airline} • {confirmedOrder.flightNumber}
              </p>
              <p className="text-slate-500 font-semibold">
                {confirmedOrder.from} ➔ {confirmedOrder.to}
              </p>
              <p className="text-slate-500">Seat {confirmedOrder.seat} • {confirmedOrder.passengers}</p>
              <div className="border-t border-slate-200 pt-1 flex items-center justify-between font-black text-emerald-600">
                <span>Total Paid</span>
                <span>${confirmedOrder.amountPaid}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setPaymentDone(false);
                  setActiveBoardingPass(confirmedOrder);
                }}
                className="w-full py-3 rounded-2xl bg-blue-600 text-white font-bold text-xs shadow-md hover:bg-blue-700 transition"
              >
                View Digital Boarding Pass
              </button>
              <button
                onClick={() => {
                  setPaymentDone(false);
                  handleTabChange('bookings');
                }}
                className="w-full py-2.5 rounded-2xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition"
              >
                Go to My Orders
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SCREEN 6: MY BOOKINGS & ORDERS (SYNCHRONIZED) */}
      {/* ======================================================== */}
      {currentScreen === 'bookings' && (
        <div className="flex-1 flex flex-col pt-safe-top pb-safe-bottom mb-20 overflow-y-auto">
          {/* Header */}
          <div className="px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="font-black text-lg text-slate-900">Customer Orders</h3>
              <p className="text-[11px] text-slate-400 font-semibold">Synchronized with Neon PostgreSQL</p>
            </div>
            <button
              onClick={fetchOrdersFromBackend}
              className={`w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 ${
                isLoadingBookings ? 'animate-spin' : ''
              }`}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* Filter Tabs */}
            <div className="flex bg-slate-200/80 p-1 rounded-2xl">
              <button
                onClick={() => setBookingFilter('upcoming')}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition ${
                  bookingFilter === 'upcoming' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Upcoming Orders
              </button>
              <button
                onClick={() => setBookingFilter('past')}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition ${
                  bookingFilter === 'past' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Past Flights
              </button>
            </div>

            {/* Booking Cards */}
            <div className="space-y-3">
              {isLoadingBookings ? (
                <AirplaneLandingLoader
                  title="Fetching Customer Orders"
                  subtitle="Retrieving reservations from Neon PostgreSQL..."
                  fullScreen={false}
                />
              ) : bookingsList.filter((b) => (bookingFilter === 'upcoming' ? !b.isPast : b.isPast)).length === 0 ? (
                <div className="py-12 bg-white rounded-3xl p-6 text-center border border-slate-200 space-y-2">
                  <Ticket className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                  <h4 className="font-black text-slate-800 text-sm">No bookings in this tab</h4>
                  <p className="text-xs text-slate-400">Book any flight to see your tickets and barcode here.</p>
                  <button
                    onClick={() => handleTabChange('home')}
                    className="mt-3 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs shadow-sm hover:bg-blue-700"
                  >
                    Search Flights
                  </button>
                </div>
              ) : (
                bookingsList
                  .filter((b) => (bookingFilter === 'upcoming' ? !b.isPast : b.isPast))
                  .map((b) => (
                    <div
                      key={b.id}
                      onClick={() => setActiveBoardingPass(b)}
                      className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition cursor-pointer space-y-3"
                    >
                      {/* Status & Order Number */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
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
                          {b.orderNumber && (
                            <span className="text-[10px] font-mono font-bold text-slate-400">{b.orderNumber}</span>
                          )}
                        </div>
                        <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
                          Boarding Pass <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>

                      {/* Route */}
                      <div>
                        <h4 className="font-black text-base text-slate-900">
                          {b.from} ➔ {b.to}
                        </h4>
                        <p className="text-xs text-slate-500 font-semibold">
                          {b.date} • {b.passengers}
                        </p>
                      </div>

                      {/* Airline & Times */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <AirlineBadge airline={b.airline} code={b.flightNumber} />
                          <div>
                            <span className="font-black text-slate-900 block">{b.airline}</span>
                            <span className="text-[10px] text-slate-400 font-bold">{b.flightNumber}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-black text-slate-900 block">
                            {b.depTime} - {b.arrTime}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">Seat {b.seat}</span>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SCREEN: EXPLORE */}
      {/* ======================================================== */}
      {currentScreen === 'explore' && (
        <div className="flex-1 flex flex-col pt-safe-top pb-safe-bottom mb-20 overflow-y-auto">
          <div className="px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
            <h3 className="font-black text-lg text-slate-900">Explore Destinations</h3>
            <p className="text-xs text-slate-500">Popular global routes with instant database reservations</p>
          </div>

          <div className="p-4 space-y-3">
            {[
              {
                from: 'HGA',
                to: 'DXB',
                city: 'Dubai (DXB)',
                price: '$520 Round Trip',
                duration: '2h 45m • Direct',
                img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
              },
              {
                from: 'MGQ',
                to: 'IST',
                city: 'Istanbul (IST)',
                price: '$680 Round Trip',
                duration: '6h 20m • 1 Stop',
                img: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80',
              },
              {
                from: 'HGA',
                to: 'NBO',
                city: 'Nairobi (NBO)',
                price: '$450 Round Trip',
                duration: '2h 15m • Direct',
                img: 'https://images.unsplash.com/photo-1619865668616-e57caeb67fc1?auto=format&fit=crop&w=800&q=80',
              },
              {
                from: 'MGQ',
                to: 'LHR',
                city: 'London (LHR)',
                price: '$820 Round Trip',
                duration: '10h 30m • 1 Stop',
                img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
              },
              {
                from: 'HGA',
                to: 'DOH',
                city: 'Doha (DOH)',
                price: '$640 Round Trip',
                duration: '3h 45m • Direct',
                img: 'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?auto=format&fit=crop&w=800&q=80',
              },
            ].map((dest) => (
              <div
                key={dest.city}
                onClick={() => {
                  setFromCode(dest.from);
                  setToCode(dest.to);
                  fetchFlights(dest.from, dest.to, departureDate, cabinClass);
                  setCurrentScreen('search_results');
                }}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xs cursor-pointer flex gap-3 p-3 items-center hover:shadow-md transition active:scale-[0.99]"
              >
                <img src={dest.img} alt={dest.city} className="w-20 h-20 rounded-2xl object-cover" />
                <div className="flex-1">
                  <h4 className="font-black text-sm text-slate-900">{dest.city}</h4>
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
          <div className="px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
            <h3 className="font-black text-lg text-slate-900">Profile & Configuration</h3>
          </div>

          <div className="p-4 space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 text-center space-y-2 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center mx-auto shadow-md">
                KM
              </div>
              <div>
                <h4 className="font-black text-base text-slate-900">{contactName}</h4>
                <p className="text-xs text-slate-500 font-semibold">{contactEmail}</p>
                <span className="inline-block mt-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600">
                  Verified Member
                </span>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 text-xs font-bold text-slate-700 shadow-xs">
              <div onClick={() => handleTabChange('bookings')} className="p-4 flex items-center justify-between cursor-pointer">
                <span>View Customer Orders</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
              <div className="p-4 flex items-center justify-between">
                <span>Active Phone: {contactPhone}</span>
                <span className="text-emerald-600 text-[11px] font-bold">Zaad / eDahab</span>
              </div>
              <div className="p-4 flex items-center justify-between">
                <span>Database Sync Server</span>
                <span className="text-blue-600 text-[10px] truncate max-w-[170px] font-mono">{apiBaseUrl}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: PASSENGER COUNTER MODAL */}
      {/* ======================================================== */}
      {isPassengerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900">Custom Passengers</h3>
                <p className="text-[11px] text-slate-400">Configure travelers for this flight</p>
              </div>
              <button
                onClick={() => setIsPassengerModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Adults Counter */}
            <div className="flex items-center justify-between py-1">
              <div>
                <span className="text-sm font-black text-slate-900 block">Adults</span>
                <span className="text-[11px] text-slate-400 block">Age 12+ years</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={adults <= 1}
                  onClick={() => setAdults((prev) => Math.max(1, prev - 1))}
                  className="w-8 h-8 rounded-full bg-slate-100 disabled:opacity-30 text-slate-700 flex items-center justify-center active:scale-90 font-bold"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-5 text-center font-black text-sm text-slate-900">{adults}</span>
                <button
                  type="button"
                  disabled={adults >= 9}
                  onClick={() => setAdults((prev) => Math.min(9, prev + 1))}
                  className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center active:scale-90 font-bold"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Children Counter */}
            <div className="flex items-center justify-between py-1 border-t border-slate-100 pt-3">
              <div>
                <span className="text-sm font-black text-slate-900 block">Children</span>
                <span className="text-[11px] text-slate-400 block">Age 2-11 years</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={children <= 0}
                  onClick={() => setChildren((prev) => Math.max(0, prev - 1))}
                  className="w-8 h-8 rounded-full bg-slate-100 disabled:opacity-30 text-slate-700 flex items-center justify-center active:scale-90 font-bold"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-5 text-center font-black text-sm text-slate-900">{children}</span>
                <button
                  type="button"
                  disabled={children >= 8}
                  onClick={() => setChildren((prev) => Math.min(8, prev + 1))}
                  className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center active:scale-90 font-bold"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Infants Counter */}
            <div className="flex items-center justify-between py-1 border-t border-slate-100 pt-3">
              <div>
                <span className="text-sm font-black text-slate-900 block">Infants</span>
                <span className="text-[11px] text-slate-400 block">Under 2 years (On lap)</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={infants <= 0}
                  onClick={() => setInfants((prev) => Math.max(0, prev - 1))}
                  className="w-8 h-8 rounded-full bg-slate-100 disabled:opacity-30 text-slate-700 flex items-center justify-center active:scale-90 font-bold"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-5 text-center font-black text-sm text-slate-900">{infants}</span>
                <button
                  type="button"
                  disabled={infants >= 4}
                  onClick={() => setInfants((prev) => Math.min(4, prev + 1))}
                  className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center active:scale-90 font-bold"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsPassengerModalOpen(false)}
              className="w-full py-3 rounded-2xl bg-blue-600 text-white font-black text-xs shadow-md hover:bg-blue-700 transition"
            >
              Done ({passengerSummary})
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: INTERACTIVE AIRPORT PICKER */}
      {/* ======================================================== */}
      {airportPickerMode && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl max-h-[85vh] flex flex-col animate-in slide-in-from-bottom-10 sm:zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900">
                  Select {airportPickerMode === 'from' ? 'Departure City' : 'Destination City'}
                </h3>
                <p className="text-[11px] text-slate-400">All 14 connected international & regional airports</p>
              </div>
              <button
                onClick={() => setAirportPickerMode(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search filter input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                value={airportSearchQuery}
                onChange={(e) => setAirportSearchQuery(e.target.value)}
                placeholder="Search city, code (e.g. Dubai, HGA, MGQ)..."
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Airport List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {AIRPORTS.filter(
                (a) =>
                  a.city.toLowerCase().includes(airportSearchQuery.toLowerCase()) ||
                  a.code.toLowerCase().includes(airportSearchQuery.toLowerCase()) ||
                  a.name.toLowerCase().includes(airportSearchQuery.toLowerCase())
              ).map((airport) => {
                const isSelected = airportPickerMode === 'from' ? fromCode === airport.code : toCode === airport.code;
                return (
                  <div
                    key={airport.code}
                    onClick={() => {
                      if (airportPickerMode === 'from') {
                        setFromCode(airport.code);
                        fetchFlights(airport.code, toCode, departureDate, cabinClass);
                      } else {
                        setToCode(airport.code);
                        fetchFlights(fromCode, airport.code, departureDate, cabinClass);
                      }
                      setAirportPickerMode(null);
                    }}
                    className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/80 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center shrink-0">
                        {airport.code}
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-slate-900 leading-tight">
                          {airport.city} ({airport.country})
                        </h4>
                        <p className="text-[11px] text-slate-400 font-medium truncate max-w-[200px]">{airport.name}</p>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                  </div>
                );
              })}
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
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plane className="w-5 h-5 transform -rotate-45" />
                <span className="font-black text-sm">Kanimo Sky Boarding Pass</span>
              </div>
              <button
                onClick={() => setActiveBoardingPass(null)}
                className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 text-center space-y-4">
              <div>
                <span className="text-2xl font-black text-slate-900 block">
                  {activeBoardingPass.fromCode} ➔ {activeBoardingPass.toCode}
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  {activeBoardingPass.airline} • {activeBoardingPass.flightNumber}
                </span>
                <span className="text-[11px] text-blue-600 font-black block mt-0.5">
                  Passenger: {activeBoardingPass.passengerName || 'Kani Mo'}
                </span>
              </div>

              {/* Scannable Verified QR Code */}
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
                  <span className="font-black text-slate-900 text-base">{activeBoardingPass.gate || 'A3'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Terminal</span>
                  <span className="font-black text-slate-900 text-base">{activeBoardingPass.terminal || '1'}</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 font-mono">
                Ticket: {activeBoardingPass.ticketNumber} • Database Synchronized
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PERSISTENT BOTTOM NAVIGATION BAR */}
      {/* ======================================================== */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 pb-safe-bottom shadow-lg">
        <div className="flex items-center justify-around py-2 px-2 max-w-md mx-auto">
          {/* Home */}
          <button
            onClick={() => handleTabChange('home')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition active:scale-95 ${
              activeBottomTab === 'home' ? 'text-blue-600 font-black' : 'text-slate-400 font-medium hover:text-slate-600'
            }`}
          >
            <div className={`p-1 rounded-xl ${activeBottomTab === 'home' ? 'bg-blue-50' : ''}`}>
              <Plane className="w-5 h-5 transform -rotate-45" />
            </div>
            <span className="text-[10px] mt-0.5">Flights</span>
          </button>

          {/* Bookings / Orders */}
          <button
            onClick={() => handleTabChange('bookings')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition active:scale-95 ${
              activeBottomTab === 'bookings' ? 'text-blue-600 font-black' : 'text-slate-400 font-medium hover:text-slate-600'
            }`}
          >
            <div className={`p-1 rounded-xl ${activeBottomTab === 'bookings' ? 'bg-blue-50' : ''}`}>
              <Ticket className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5">My Orders</span>
          </button>

          {/* Explore */}
          <button
            onClick={() => handleTabChange('explore')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition active:scale-95 ${
              activeBottomTab === 'explore' ? 'text-blue-600 font-black' : 'text-slate-400 font-medium hover:text-slate-600'
            }`}
          >
            <div className={`p-1 rounded-xl ${activeBottomTab === 'explore' ? 'bg-blue-50' : ''}`}>
              <Search className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5">Explore</span>
          </button>

          {/* Profile */}
          <button
            onClick={() => handleTabChange('profile')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition active:scale-95 ${
              activeBottomTab === 'profile' ? 'text-blue-600 font-black' : 'text-slate-400 font-medium hover:text-slate-600'
            }`}
          >
            <div className={`p-1 rounded-xl ${activeBottomTab === 'profile' ? 'bg-blue-50' : ''}`}>
              <UserIcon className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5">Account</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
