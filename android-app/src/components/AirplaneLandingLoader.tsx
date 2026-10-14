import React, { useState, useEffect } from 'react';
import { Plane, Radio, Compass } from 'lucide-react';

interface AirplaneLandingLoaderProps {
  title?: string;
  subtitle?: string;
  fullScreen?: boolean;
}

export default function AirplaneLandingLoader({
  title = 'Approaching Runway • Preparing for Landing',
  subtitle = 'Kanimo Skyways Flight Navigation & Inventory System',
  fullScreen = true,
}: AirplaneLandingLoaderProps) {
  const [altitude, setAltitude] = useState(1250);
  const [airspeed, setAirspeed] = useState(155);
  const [loadingPhase, setLoadingPhase] = useState('Glideslope Intercept');
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return 98;
        return prev + 2;
      });

      setAltitude((prev) => {
        if (prev <= 40) return 30;
        return Math.max(30, prev - 25);
      });

      setAirspeed((prev) => {
        if (prev <= 132) return 130;
        return Math.max(130, prev - 1);
      });
    }, 70);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress < 30) {
      setLoadingPhase('ILS CAT-III Localizer Captured');
    } else if (progress < 60) {
      setLoadingPhase('Gear Down • Flaps 30° • Glideslope Locked');
    } else if (progress < 85) {
      setLoadingPhase('Runway In Sight • 500ft Above Ground');
    } else {
      setLoadingPhase('Threshold Crossed • Touchdown & Reverse Thrust');
    }
  }, [progress]);

  const containerClass = fullScreen
    ? 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070d19] text-white overflow-hidden p-4 select-none'
    : 'relative w-full py-8 flex flex-col items-center justify-center bg-[#070d19] rounded-3xl border border-slate-800 text-white overflow-hidden p-4 select-none shadow-xl';

  return (
    <div className={containerClass}>
      <style>{`
        @keyframes floatCloud {
          0% { transform: translateX(120%); opacity: 0; }
          20% { opacity: 0.35; }
          80% { opacity: 0.35; }
          100% { transform: translateX(-120%); opacity: 0; }
        }

        @keyframes runwayCenterline {
          0% { transform: translateY(0); }
          100% { transform: translateY(80px); }
        }

        @keyframes runwayLightsPulse {
          0%, 100% { opacity: 0.4; filter: drop-shadow(0 0 2px #38bdf8); }
          50% { opacity: 1; filter: drop-shadow(0 0 8px #38bdf8); }
        }

        @keyframes airplaneLandingFlight {
          0% {
            transform: translate(-90px, -70px) scale(0.65) rotate(4deg);
          }
          40% {
            transform: translate(-30px, -20px) scale(0.82) rotate(6deg);
          }
          70% {
            transform: translate(15px, 25px) scale(0.96) rotate(2deg);
          }
          85% {
            transform: translate(35px, 42px) scale(1) rotate(0deg);
          }
          100% {
            transform: translate(65px, 46px) scale(0.98) rotate(-1deg);
          }
        }

        @keyframes wheelTouchdownSmoke {
          0%, 65% { opacity: 0; transform: scale(0.2); }
          72% { opacity: 0.85; transform: scale(1.2) translateY(-2px); }
          85% { opacity: 0.4; transform: scale(1.6) translateY(-8px); }
          100% { opacity: 0; transform: scale(2) translateY(-14px); }
        }

        .animate-cloud-fast {
          animation: floatCloud 7s linear infinite;
        }
        .animate-cloud-slow {
          animation: floatCloud 12s linear infinite;
        }
        .animate-landing-plane {
          animation: airplaneLandingFlight 3.2s cubic-bezier(0.25, 0.1, 0.25, 1) infinite;
        }
        .animate-touchdown-smoke {
          animation: wheelTouchdownSmoke 3.2s ease-out infinite;
        }
        .animate-runway-lights {
          animation: runwayLightsPulse 1.2s ease-in-out infinite;
        }
      `}</style>

      {/* Atmospheric Starfield / Night Ambient Background */}
      <div className="absolute inset-0 bg-radial from-blue-950/40 via-[#070d19] to-[#04070e] pointer-events-none" />

      {/* Ambient Clouds */}
      <div className="absolute top-12 left-0 right-0 h-24 overflow-hidden pointer-events-none">
        <div className="animate-cloud-slow absolute -top-4 w-52 h-16 bg-blue-500/10 rounded-full blur-2xl" />
        <div className="animate-cloud-fast absolute top-6 w-72 h-20 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      {/* Cockpit HUD Glideslope Telemetry Header */}
      <div className="relative z-10 w-full max-w-sm mx-auto mb-2.5 flex items-center justify-between px-3.5 py-1.5 bg-slate-900/80 border border-slate-800/80 rounded-2xl backdrop-blur-md shadow-lg text-[9px] font-mono tracking-wider">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold">ILS RWY 05</span>
        </div>
        <div className="text-slate-300">
          ALT <span className="text-amber-400 font-bold">{altitude} FT</span>
        </div>
        <div className="text-slate-300">
          SPD <span className="text-sky-400 font-bold">{airspeed} KTS</span>
        </div>
        <div className="text-blue-400 font-bold flex items-center gap-1">
          <Compass className="w-3 h-3 animate-spin" />
          <span>052°</span>
        </div>
      </div>

      {/* MAIN VISUAL: AIRPLANE APPROACHING & LANDING ON RUNWAY */}
      <div className="relative z-10 w-full max-w-sm h-52 flex items-center justify-center overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-[#09152a] via-[#081122] to-[#040813] shadow-inner">
        {/* Horizon Line with Twilight Glow */}
        <div className="absolute top-1/3 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
        <div className="absolute top-1/3 -translate-y-1/2 left-0 right-0 h-8 bg-cyan-500/5 blur-lg" />

        {/* Airport Control Tower Silhouette */}
        <div className="absolute top-8 left-8 opacity-30 pointer-events-none">
          <div className="w-3.5 h-12 bg-slate-700/60 rounded-t-sm mx-auto" />
          <div className="w-7 h-3.5 bg-slate-600/60 rounded-t-md mx-auto" />
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping mx-auto -mt-5" />
        </div>

        {/* PERSPECTIVE RUNWAY 05 */}
        <div className="absolute bottom-0 w-60 h-32 flex flex-col items-center">
          <svg className="w-full h-full" viewBox="0 0 260 140" fill="none">
            <polygon
              points="105,5 155,5 230,140 30,140"
              fill="#0d1829"
              stroke="#1e293b"
              strokeWidth="1.5"
            />

            {/* Threshold Piano Keys */}
            <g fill="#f8fafc" opacity="0.85">
              <rect x="52" y="128" width="10" height="9" rx="1" />
              <rect x="68" y="128" width="10" height="9" rx="1" />
              <rect x="84" y="128" width="10" height="9" rx="1" />
              <rect x="100" y="128" width="10" height="9" rx="1" />
              <rect x="116" y="128" width="10" height="9" rx="1" />
              <rect x="132" y="128" width="10" height="9" rx="1" />
              <rect x="148" y="128" width="10" height="9" rx="1" />
              <rect x="164" y="128" width="10" height="9" rx="1" />
              <rect x="180" y="128" width="10" height="9" rx="1" />
              <rect x="196" y="128" width="10" height="9" rx="1" />
            </g>

            <text
              x="130"
              y="118"
              fill="#e2e8f0"
              fontSize="12"
              fontWeight="900"
              letterSpacing="2"
              textAnchor="middle"
              fontFamily="monospace"
              opacity="0.8"
            >
              05
            </text>

            {/* Centerline Dashes */}
            <g fill="#facc15" opacity="0.9">
              <rect x="127" y="15" width="6" height="12" rx="1" />
              <rect x="126" y="38" width="8" height="15" rx="1" />
              <rect x="125" y="65" width="10" height="18" rx="1.5" />
              <rect x="124" y="93" width="12" height="22" rx="2" />
            </g>

            {/* Left Edge Lights */}
            <g className="animate-runway-lights" fill="#38bdf8">
              <circle cx="103" cy="8" r="1.5" />
              <circle cx="91" cy="30" r="2" />
              <circle cx="75" cy="62" r="2.5" />
              <circle cx="56" cy="98" r="3" />
              <circle cx="34" cy="136" r="3.5" fill="#22c55e" />
            </g>

            {/* Right Edge Lights */}
            <g className="animate-runway-lights" fill="#38bdf8">
              <circle cx="157" cy="8" r="1.5" />
              <circle cx="169" cy="30" r="2" />
              <circle cx="185" cy="62" r="2.5" />
              <circle cx="204" cy="98" r="3" />
              <circle cx="226" cy="136" r="3.5" fill="#22c55e" />
            </g>
          </svg>
        </div>

        {/* Touchdown Tire Smoke Puffs */}
        <div className="animate-touchdown-smoke absolute bottom-7 z-20 pointer-events-none">
          <div className="w-10 h-6 bg-slate-200/50 rounded-full blur-sm" />
        </div>

        {/* GLIDING & LANDING COMMERCIAL AIRPLANE */}
        <div className="animate-landing-plane relative z-30 flex items-center justify-center">
          {/* Landing Light Beams */}
          <div
            className="absolute -bottom-6 -left-10 w-36 h-14 bg-gradient-to-r from-transparent via-cyan-300/20 to-white/30 transform -rotate-12 blur-sm pointer-events-none"
            style={{ clipPath: 'polygon(0% 40%, 100% 0%, 100% 100%, 0% 60%)' }}
          />

          {/* SVG Passenger Jet */}
          <svg className="w-32 h-20 filter drop-shadow(0 12px 16px rgba(0,0,0,0.7))" viewBox="0 0 200 120" fill="none">
            {/* Fuselage */}
            <path
              d="M185 58 C185 54, 155 46, 110 46 C65 46, 32 50, 16 57 C8 60, 6 64, 14 67 C25 71, 60 72, 110 72 C155 72, 185 64, 185 58 Z"
              fill="url(#mFuselageGrad)"
              stroke="#60a5fa"
              strokeWidth="0.8"
            />

            {/* Cockpit Window */}
            <path d="M20 56 C24 53, 30 52, 34 53 C33 56, 28 58, 22 58 Z" fill="#38bdf8" opacity="0.9" />

            {/* Cabin Windows */}
            <g fill="#93c5fd" opacity="0.85">
              <rect x="44" y="55" width="3" height="4" rx="1" />
              <rect x="52" y="55" width="3" height="4" rx="1" />
              <rect x="60" y="55" width="3" height="4" rx="1" />
              <rect x="68" y="55" width="3" height="4" rx="1" />
              <rect x="76" y="55" width="3" height="4" rx="1" />
              <rect x="84" y="55" width="3" height="4" rx="1" />
              <rect x="92" y="55" width="3" height="4" rx="1" />
              <rect x="100" y="55" width="3" height="4" rx="1" />
              <rect x="108" y="55" width="3" height="4" rx="1" />
              <rect x="116" y="55" width="3" height="4" rx="1" />
              <rect x="124" y="55" width="3" height="4" rx="1" />
            </g>

            {/* Blue and Gold Cheatlines */}
            <path d="M16 60 Q95 62 175 58" stroke="#2563eb" strokeWidth="2.5" fill="none" />
            <path d="M22 63 Q95 65 165 61" stroke="#f59e0b" strokeWidth="1.2" fill="none" />

            {/* Tail Fin with Gold Crest */}
            <path d="M150 46 L180 14 C184 10, 189 12, 187 18 L174 48 Z" fill="url(#mTailGrad)" stroke="#3b82f6" strokeWidth="0.8" />
            <circle cx="178" cy="24" r="3.5" fill="#f59e0b" />

            {/* Horizontal Stabilizer */}
            <path d="M165 57 L186 52 C189 51, 190 54, 187 56 L168 61 Z" fill="#1e3a8a" />

            {/* Swept Wing */}
            <path d="M80 64 L115 88 C118 90, 122 89, 120 86 L108 65 Z" fill="url(#mWingGrad)" stroke="#3b82f6" strokeWidth="0.8" />
            <path d="M115 88 L122 80" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />

            {/* Jet Engine */}
            <rect x="90" y="72" width="20" height="10" rx="3.5" fill="#0f172a" stroke="#60a5fa" strokeWidth="1" />
            <ellipse cx="91" cy="77" rx="2" ry="5" fill="#38bdf8" />

            {/* Landing Gear Struts & Wheels */}
            <g stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round">
              <line x1="36" y1="68" x2="36" y2="80" />
              <line x1="102" y1="70" x2="102" y2="82" />
            </g>
            <g fill="#020617" stroke="#cbd5e1" strokeWidth="1">
              <circle cx="36" cy="82" r="3" />
              <circle cx="100" cy="84" r="4" />
              <circle cx="106" cy="84" r="4" />
            </g>

            {/* Navigation Lights */}
            <circle cx="180" cy="14" r="2" fill="#ef4444" className="animate-ping" />
            <circle cx="120" cy="86" r="2" fill="#22c55e" className="animate-ping" />
            <circle cx="36" cy="78" r="2" fill="#ffffff" className="animate-pulse" />

            <defs>
              <linearGradient id="mFuselageGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="60%" stopColor="#e2e8f0" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>
              <linearGradient id="mTailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e40af" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </linearGradient>
              <linearGradient id="mWingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Progress & Telemetry */}
      <div className="relative z-10 w-full max-w-sm mx-auto mt-3.5 space-y-2.5">
        <div>
          <div className="flex items-center justify-between text-xs font-black tracking-wide text-white mb-1">
            <span className="flex items-center gap-1.5 truncate">
              <Plane className="w-3.5 h-3.5 text-blue-400 transform -rotate-45 shrink-0" />
              <span className="truncate">{title}</span>
            </span>
            <span className="font-mono text-amber-400 font-bold shrink-0">{progress}%</span>
          </div>

          <div className="w-full h-2 bg-slate-900 border border-slate-800 rounded-full overflow-hidden p-0.5 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-amber-400 rounded-full transition-all duration-150 relative shadow-md shadow-blue-500/50"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-0 bottom-0 w-2.5 bg-white/70 animate-pulse rounded-full" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-xl text-[10px] text-slate-300">
          <span className="flex items-center gap-1.5 truncate">
            <Radio className="w-3 h-3 text-blue-400 animate-pulse shrink-0" />
            <span className="font-semibold truncate">{loadingPhase}</span>
          </span>
          <span className="text-[9px] font-bold text-slate-500 uppercase shrink-0">AUTOLAND</span>
        </div>

        <p className="text-[10px] text-center text-slate-400 font-medium">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
