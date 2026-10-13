'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-context';
import {
  Plane,
  CreditCard,
  ShieldCheck,
  Lock,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Info,
  Calendar,
  Users,
} from 'lucide-react';

export default function CheckoutPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();

  const [booking, setBooking] = useState<any>(null);
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [paymentMode, setPaymentMode] = useState<'DEMO' | 'STRIPE'>('DEMO');

  // Demo Card fields
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [cardholderName, setCardholderName] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [successOrder, setSuccessOrder] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('pending_booking');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setBooking(parsed);
          if (parsed.passengers && parsed.passengers.length > 0 && parsed.passengers[0].name) {
            setCardholderName(parsed.passengers[0].name);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    if (user) {
      setContactEmail(user.email);
      if (user.phone) setContactPhone(user.phone);
    }
  }, [user]);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) {
      setError('Booking session expired. Please return to the flight page.');
      return;
    }

    setError('');
    setIsProcessing(true);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('kanimo_token') : null;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          flightId: booking.flightId,
          ticketTierId: booking.ticketTierId,
          passengers: booking.passengers,
          contactEmail: contactEmail || user?.email,
          contactPhone,
          paymentMethod: paymentMode === 'DEMO' ? 'DEMO_PAYMENT' : 'STRIPE',
          cardDetails: {
            last4: '4242',
            brand: 'Visa',
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Payment and booking failed');
      }

      // Clear session booking
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('pending_booking');
      }

      setSuccessOrder(data);
      // Wait 1.5s then redirect to order details page
      setTimeout(() => {
        router.push(`/orders/${data.order.id}?new_booking=true`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Transaction failed');
      setIsProcessing(false);
    }
  };

  if (!booking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">No Active Booking Session</h2>
          <p className="text-xs text-slate-600">
            Please choose a flight and select your passengers before checking out.
          </p>
          <Link
            href="/flights"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
          >
            ← Browse Available Flights
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Title */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Confirm Reservation & Payment</h1>
            <p className="text-xs text-slate-500 mt-1">
              Flight {booking.flightNumber} • {booking.tierName}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            <Lock className="w-3.5 h-3.5" />
            <span>256-Bit SSL Encrypted</span>
          </div>
        </div>

        {successOrder ? (
          <div className="bg-white p-10 rounded-3xl border border-emerald-200 text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Booking Confirmed & Paid!</h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Order <span className="font-bold text-slate-900">{successOrder.order?.orderNumber}</span> has been processed. Your HMAC-SHA256 digital boarding passes have been issued.
            </p>
            <p className="text-xs text-blue-600 font-semibold animate-pulse">
              Redirecting you to your digital boarding passes...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Contact Info & Payment Mode */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
                <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                  Booking Contact Details
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirmation Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="passenger@example.com"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mobile Phone Number
                    </label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+1 (555) 019-2831"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Processing Form */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span>Payment Method</span>
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMode('DEMO')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                        paymentMode === 'DEMO'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Demo Card Mode
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMode('STRIPE')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                        paymentMode === 'STRIPE'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Stripe Production
                    </button>
                  </div>
                </div>

                {paymentMode === 'DEMO' ? (
                  <div className="space-y-4">
                    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                      <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Development & Demo Payment Mode Active:</span>
                        <p className="mt-0.5 text-amber-800">
                          Pre-configured test card simulator with instant transactional ticket issuance and QR code generation. No actual funds are charged.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handlePay} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Name on Card
                        </label>
                        <input
                          type="text"
                          required
                          value={cardholderName}
                          onChange={(e) => setCardholderName(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Card Number (Simulated)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            disabled
                            value={cardNumber}
                            className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-mono text-slate-700 cursor-not-allowed"
                          />
                          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            TEST VISA
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Expiration Date
                          </label>
                          <input
                            type="text"
                            disabled
                            value={cardExpiry}
                            className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-mono text-slate-700 cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            CVC / Security Code
                          </label>
                          <input
                            type="text"
                            disabled
                            value={cardCvc}
                            className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-mono text-slate-700 cursor-not-allowed"
                          />
                        </div>
                      </div>

                      {error && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>{error}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" />
                            <span>Confirm & Pay ${booking.totalAmount} (Demo Mode)</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                      <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                        <CreditCard className="w-4 h-4 text-blue-600" />
                        <span>Stripe Production Checkout</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        To enable real live credit card processing, provide your <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">STRIPE_SECRET_KEY</code> and <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">STRIPE_WEBHOOK_SECRET</code> in the server environment variables.
                      </p>
                      <button
                        type="button"
                        onClick={() => setPaymentMode('DEMO')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
                      >
                        Switch Back to Demo Card Mode
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Itinerary & Price Card */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-6 sticky top-24">
                <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-100 pb-3">
                  Flight Itinerary
                </h3>

                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Flight</span>
                    <span className="text-sm font-bold text-slate-900">{booking.flightNumber}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-medium">Cabin Class</span>
                    <span className="text-sm font-bold text-blue-600">{booking.tierName}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-medium">Passengers ({booking.passengerCount})</span>
                    <div className="mt-1 space-y-1">
                      {booking.passengers.map((p: any, i: number) => (
                        <div key={i} className="text-slate-800 font-medium">
                          • {p.name} ({p.seatPreference} seat)
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Fare per ticket:</span>
                    <span>${booking.unitPrice}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Passengers:</span>
                    <span>x {booking.passengerCount}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 text-base pt-2 border-t border-slate-100">
                    <span>Total Amount:</span>
                    <span className="text-2xl font-black text-slate-900">${booking.totalAmount}</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-[11px] space-y-1">
                  <p className="font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Instant Boarding Pass Issuance</span>
                  </p>
                  <p className="text-emerald-700">
                    Your QR digital ticket with HMAC signature is generated right upon checkout.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
