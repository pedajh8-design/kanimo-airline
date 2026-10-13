'use client';

import React, { useState } from 'react';
import {
  QrCode,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Plane,
  User,
  Clock,
  Search,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export default function GateScannerPage() {
  const [scanInput, setScanInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [scanHistory, setScanHistory] = useState<any[]>([]);

  const handleValidate = async (payloadToTest?: string) => {
    const raw = payloadToTest || scanInput;
    if (!raw.trim()) return;

    setIsVerifying(true);
    setValidationResult(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('kanimo_token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const isQr = raw.startsWith('KANIMO:v1:');
      const body = isQr ? { qrPayload: raw.trim() } : { ticketNumber: raw.trim() };

      const res = await fetch('/api/tickets/validate', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      const data = await res.json();

      const scanRecord = {
        timestamp: new Date(),
        rawInput: raw,
        success: res.ok,
        status: res.status,
        data,
      };

      setValidationResult(scanRecord);
      setScanHistory((prev) => [scanRecord, ...prev.slice(0, 9)]);
    } catch (err: any) {
      const errorRecord = {
        timestamp: new Date(),
        rawInput: raw,
        success: false,
        status: 500,
        data: { error: err.message || 'Validation system error' },
      };
      setValidationResult(errorRecord);
      setScanHistory((prev) => [errorRecord, ...prev.slice(0, 9)]);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleQuickTest = (type: 'VALID' | 'REUSE' | 'TAMPERED') => {
    if (type === 'VALID') {
      // Alexander Mitchell's upcoming KN-101 ticket
      setScanInput('TKT-KN-94829103');
      handleValidate('TKT-KN-94829103');
    } else if (type === 'REUSE') {
      // Alexander Mitchell's already checked-in KN-502 ticket
      setScanInput('TKT-KN-50291844');
      handleValidate('TKT-KN-50291844');
    } else if (type === 'TAMPERED') {
      // Fake forged payload with bad HMAC
      const forged = 'KANIMO:v1:fake_id|TKT-KN-FORGED|KN-101|Counterfeit Passenger|1A|1700000000|badnonce:deadbeefcafebabe0000111122223333';
      setScanInput(forged);
      handleValidate(forged);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Scanner Header */}
      <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <QrCode className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Airport Gate Terminal Kiosk
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Gate Ticket Scanner & Validator
          </h1>
          <p className="text-xs text-slate-400">
            Cryptographic HMAC-SHA256 signature verification & atomic single-entry reuse prevention.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            GATE KIOSK ONLINE
          </span>
        </div>
      </div>

      {/* Main Scanner Console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Scanner Input & Active Result */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-5">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-300">
              Scanner Reader / Barcode Input
            </h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleValidate();
              }}
              className="space-y-4"
            >
              <div className="relative">
                <input
                  type="text"
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  placeholder="Scan barcode, paste QR payload, or enter Ticket Number (e.g. TKT-KN-94829103)..."
                  className="w-full px-4 py-3.5 bg-slate-950 border border-slate-700 rounded-2xl text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="submit"
                  disabled={isVerifying || !scanInput.trim()}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {isVerifying ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                  <span>{isVerifying ? 'Verifying HMAC Signature...' : 'Validate Boarding Pass'}</span>
                </button>

                {/* Instant Test Presets */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 font-semibold">Test Presets:</span>
                  <button
                    type="button"
                    onClick={() => handleQuickTest('VALID')}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold transition"
                  >
                    Valid Pass
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickTest('REUSE')}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold transition"
                  >
                    Test Re-Use
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickTest('TAMPERED')}
                    className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold transition"
                  >
                    Test Tampered
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Validation Result Box */}
          {validationResult && (
            <div
              className={`p-6 sm:p-8 rounded-3xl border-2 transition-all animate-in fade-in zoom-in-95 ${
                validationResult.success
                  ? 'bg-emerald-950/40 border-emerald-500 shadow-2xl shadow-emerald-500/10'
                  : validationResult.data?.alreadyValidated
                  ? 'bg-amber-950/40 border-amber-500 shadow-2xl shadow-amber-500/10'
                  : 'bg-rose-950/40 border-rose-500 shadow-2xl shadow-rose-500/10'
              }`}
            >
              {validationResult.success ? (
                /* SUCCESS STATE */
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div>
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                        HMAC Signature Verified • Valid Pass
                      </span>
                      <h3 className="text-2xl font-black text-white">
                        BOARDING PASS ACCEPTED • PASSENGER CHECKED IN
                      </h3>
                    </div>
                  </div>

                  {/* Passenger Card */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/30">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Passenger</span>
                      <span className="text-base font-extrabold text-white mt-0.5 block truncate">
                        {validationResult.data.passengerName}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Seat</span>
                      <span className="text-2xl font-black text-emerald-400 mt-0.5 block">
                        {validationResult.data.seatNumber}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Flight</span>
                      <span className="text-base font-extrabold text-white mt-0.5 block">
                        {validationResult.data.flightNumber}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Boarding Group</span>
                      <span className="text-base font-extrabold text-white mt-0.5 block">
                        {validationResult.data.boardingGroup || 'Group B'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                    <span>Gate: <strong className="text-white">{validationResult.data.gate || 'B24'}</strong></span>
                    <span>Terminal: <strong className="text-white">{validationResult.data.terminal || 'T4'}</strong></span>
                    <span>Status: <strong className="text-emerald-400 font-mono">CHECKED_IN</strong></span>
                  </div>
                </div>
              ) : (
                /* FAILURE / RE-USE STATE */
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                        validationResult.data?.alreadyValidated
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      }`}
                    >
                      {validationResult.data?.alreadyValidated ? (
                        <AlertTriangle className="w-8 h-8" />
                      ) : (
                        <XCircle className="w-8 h-8" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <span
                        className={`text-xs font-mono font-bold uppercase tracking-wider ${
                          validationResult.data?.alreadyValidated ? 'text-amber-400' : 'text-rose-400'
                        }`}
                      >
                        {validationResult.data?.alreadyValidated
                          ? 'RE-USE PREVENTION TRIGGERED'
                          : 'VALIDATION REJECTED'}
                      </span>
                      <h3 className="text-xl font-black text-white">
                        {validationResult.data?.error || 'Validation Failed'}
                      </h3>
                      {validationResult.data?.ticket && (
                        <p className="text-xs text-slate-400 pt-1">
                          Passenger: <strong className="text-white">{validationResult.data.ticket.passengerName}</strong> • Seat: <strong className="text-white">{validationResult.data.ticket.seatNumber}</strong>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Col: Recent Scans Log */}
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4 flex flex-col h-[520px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
              Gate Validation Ledger
            </h3>
            <span className="text-[11px] text-slate-400">{scanHistory.length} events</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800 space-y-2">
            {scanHistory.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center">
                No tickets scanned in this session yet.
              </p>
            ) : (
              scanHistory.map((h, i) => (
                <div key={i} className="pt-2 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded ${
                        h.success
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {h.success ? 'CHECKED-IN' : 'DENIED'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(h.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <p className="text-slate-300 font-mono truncate text-[11px]">
                    {h.data.passengerName ? `${h.data.passengerName} (Seat ${h.data.seatNumber})` : h.data.error}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
