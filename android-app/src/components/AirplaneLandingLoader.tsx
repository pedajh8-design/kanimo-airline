import React, { useState, useEffect } from 'react';
import { Plane, Radio, Gauge } from 'lucide-react';

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
  const [altitude, setAltitude] = useState(1200);
  const [airspeed, setAirspeed] = useState(150);
  const [loadingPhase, setLoadingPhase] = useState('2D Glideslope Approach');
  const [progress, setProgress] = useState(18);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return 98;
        return prev + 2;
      });

      setAltitude((prev) => {
        if (prev <= 0) return 0;
        return Math.max(0, prev - 24);
      });

      setAirspeed((prev) => {
        if (prev <= 55) return 50;
        return Math.max(50, prev - 2);
      });
    }, 70);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress < 30) {
      setLoadingPhase('2D Glideslope Approach • Descending from 1,200 FT');
    } else if (progress < 60) {
      setLoadingPhase('Runway 05 In Sight • Gear Deployed & Flaps 30°');
    } else if (progress < 85) {
      setLoadingPhase('2D Flare • Main Gear Runway Touchdown');
    } else {
      setLoadingPhase('Touchdown Confirmed • Reverse Thrust & Rollout');
    }
  }, [progress]);

  const containerClass = fullScreen
    ? 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070d19] text-white overflow-hidden p-4 select-none'
    : 'relative w-full py-8 flex flex-col items-center justify-center bg-[#070d19] rounded-3xl border border-slate-800 text-white overflow-hidden p-4 select-none shadow-xl';

  return (
    <div className={containerClass}>
      <style>{`
        /* 2D Cloud Floating */
        @keyframes cloudDrift2D {
          0% { transform: translateX(110%); }
          100% { transform: translateX(-110%); }
        }

        /* Pure 2D Airplane Landing Flight Motion */
        @keyframes planeLanding2D {
          0% {
            transform: translate(-100px, 12px) rotate(8deg);
            opacity: 0;
          }
          10% {
            transform: translate(-30px, 32px) rotate(7.5deg);
            opacity: 1;
          }
          35% {
            transform: translate(60px, 68px) rotate(7deg);
          }
          52% {
            /* 2D Flare: Nose pitches up smoothly right before wheel touchdown */
            transform: translate(125px, 92px) rotate(-1.5deg);
          }
          64% {
            /* Touchdown: Main gear hits runway surface line */
            transform: translate(175px, 102px) rotate(0deg);
          }
          78% {
            /* Rolling along flat runway */
            transform: translate(255px, 102px) rotate(0deg);
            opacity: 1;
          }
          92% {
            transform: translate(350px, 102px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(430px, 102px) rotate(0deg);
            opacity: 0;
          }
        }

        /* 2D Touchdown Smoke Puffs */
        @keyframes smokePuff2D {
          0%, 60% {
            transform: scale(0.2);
            opacity: 0;
          }
          64% {
            transform: scale(0.8) translate(-4px, -2px);
            opacity: 0.9;
          }
          74% {
            transform: scale(1.6) translate(-14px, -8px);
            opacity: 0.4;
          }
          85%, 100% {
            transform: scale(2.2) translate(-24px, -14px);
            opacity: 0;
          }
        }

        /* Flat Runway Centerline Dash Movement */
        @keyframes runwayCenterline2D {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -48; }
        }

        /* 2D Runway Edge Lights Blinking */
        @keyframes runwayLightPulse2D {
          0%, 100% { opacity: 0.5; filter: drop-shadow(0 0 1px #38bdf8); }
          50% { opacity: 1; filter: drop-shadow(0 0 5px #38bdf8); }
        }

        .animate-cloud-2d-slow {
          animation: cloudDrift2D 14s linear infinite;
        }
        .animate-cloud-2d-fast {
          animation: cloudDrift2D 9s linear infinite;
        }
        .animate-landing-plane-2d {
          animation: planeLanding2D 3.4s cubic-bezier(0.35, 0.1, 0.25, 1) infinite;
        }
        .animate-smoke-2d {
          animation: smokePuff2D 3.4s ease-out infinite;
        }
        .animate-centerline-2d {
          animation: runwayCenterline2D 1.2s linear infinite;
        }
        .animate-runway-lights-2d {
          animation: runwayLightPulse2D 1.5s ease-in-out infinite;
        }
      `}</style>

      {/* Atmospheric Starfield & Clean Twilight 2D Ambient Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#060c18] via-[#09152b] to-[#040813] pointer-events-none" />

      {/* 2D HUD Telemetry Strip */}
      <div className="relative z-10 w-full max-w-md mx-auto mb-3 flex items-center justify-between px-4 py-2 bg-slate-900/85 border border-slate-800 rounded-2xl shadow-lg text-[10px] font-mono tracking-wider">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold">2D RUNWAY 05</span>
        </div>
        <div className="text-slate-300">
          ALT <span className="text-amber-400 font-bold">{altitude > 0 ? `${altitude} FT` : 'TOUCHDOWN'}</span>
        </div>
        <div className="text-slate-300">
          SPD <span className="text-sky-400 font-bold">{airspeed} KTS</span>
        </div>
        <div className="text-blue-400 font-bold flex items-center gap-1">
          <Gauge className="w-3 h-3 text-cyan-400" />
          <span>FLAPS 30°</span>
        </div>
      </div>

      {/* PURE 2D AIRPLANE RUNWAY LANDING STAGE */}
      <div className="relative z-10 w-full max-w-md h-52 rounded-3xl border border-slate-800 bg-[#070e1e] overflow-hidden shadow-2xl flex items-center justify-center">
        {/* SVG Viewport (440 x 180) - Strictly Flat 2D */}
        <svg
          viewBox="0 0 440 180"
          className="w-full h-full select-none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Flat 2D Sky Gradient */}
          <rect width="440" height="180" fill="url(#skyGradient2D_mob)" />

          {/* Twinkling 2D Stars in Night Sky */}
          <g fill="#93c5fd" opacity="0.6">
            <circle cx="35" cy="20" r="1" />
            <circle cx="85" cy="38" r="1.2" />
            <circle cx="150" cy="18" r="1" />
            <circle cx="210" cy="32" r="1.2" />
            <circle cx="295" cy="15" r="1" />
            <circle cx="360" cy="28" r="1.2" />
            <circle cx="410" cy="20" r="1" />
          </g>

          {/* Flat 2D Drifting Clouds */}
          <g opacity="0.25">
            <path
              className="animate-cloud-2d-slow"
              d="M320 30 Q330 18 348 20 Q362 12 378 22 Q392 20 398 32 Q404 42 390 44 L325 44 Q314 42 320 30 Z"
              fill="#93c5fd"
            />
            <path
              className="animate-cloud-2d-fast"
              d="M140 45 Q150 36 164 38 Q174 30 188 38 Q200 37 206 46 Q210 54 198 56 L144 56 Q135 54 140 45 Z"
              fill="#60a5fa"
            />
          </g>

          {/* Distant Airfield Horizon Silhouette */}
          <g fill="#13233f" opacity="0.75">
            {/* Tower Shaft */}
            <rect x="26" y="85" width="7" height="57" rx="1" />
            {/* Tower Control Cab (Glass Hexagon) */}
            <polygon points="23,85 36,85 38,76 21,76" fill="#1e3458" />
            {/* Tower Radome Roof */}
            <path d="M24 76 Q29.5 70 35 76 Z" fill="#2d4a7a" />
            {/* Blinking Red Obstruction Beacon */}
            <circle cx="29.5" cy="69" r="1.5" fill="#ef4444" className="animate-ping" />
            {/* Terminal Roofline */}
            <rect x="42" y="125" width="35" height="17" rx="2" fill="#0f1c33" />
            <rect x="50" y="118" width="18" height="7" rx="1" fill="#152744" />
          </g>

          {/* Windsock Pole on Right (Flat 2D) */}
          <g opacity="0.85">
            <line x1="410" y1="118" x2="410" y2="142" stroke="#64748b" strokeWidth="1.5" />
            <polygon points="410,120 425,123 425,127 410,126" fill="#f97316" />
            <polygon points="415,121 420,122 420,127.5 415,126.5" fill="#f8fafc" />
          </g>

          {/* 2D Glideslope Dashed Descent Guide Line */}
          <path
            d="M -20 28 Q 110 65 175 142 L 440 142"
            stroke="#38bdf8"
            strokeWidth="1.2"
            strokeDasharray="4 5"
            opacity="0.3"
          />

          {/* FLAT 2D RUNWAY (Cross-section at y = 142) */}
          <g>
            {/* Runway Asphalt Surface */}
            <rect x="0" y="142" width="440" height="38" fill="#0c1629" />
            {/* Top Runway Edge Line */}
            <line x1="0" y1="142" x2="440" y2="142" stroke="#334155" strokeWidth="1.5" />

            {/* Threshold Piano Keys (Vertical White Bars) */}
            <g fill="#f8fafc" opacity="0.9">
              <rect x="12" y="146" width="3.5" height="14" rx="0.8" />
              <rect x="19" y="146" width="3.5" height="14" rx="0.8" />
              <rect x="26" y="146" width="3.5" height="14" rx="0.8" />
              <rect x="33" y="146" width="3.5" height="14" rx="0.8" />
              <rect x="40" y="146" width="3.5" height="14" rx="0.8" />
              <rect x="47" y="146" width="3.5" height="14" rx="0.8" />
              <rect x="54" y="146" width="3.5" height="14" rx="0.8" />
              <rect x="61" y="146" width="3.5" height="14" rx="0.8" />
            </g>

            {/* Runway Designation Number */}
            <text
              x="82"
              y="158"
              fill="#f1f5f9"
              fontSize="12"
              fontWeight="900"
              fontFamily="monospace"
              letterSpacing="1"
              opacity="0.85"
            >
              05
            </text>

            {/* Yellow Dashed Centerline */}
            <line
              x1="108"
              y1="154"
              x2="440"
              y2="154"
              stroke="#facc15"
              strokeWidth="2"
              strokeDasharray="16 12"
              className="animate-centerline-2d"
            />

            {/* Green Threshold Edge Lights */}
            <g fill="#22c55e">
              <circle cx="8" cy="142" r="2" />
              <circle cx="8" cy="142" r="4" fill="#22c55e" opacity="0.3" />
            </g>

            {/* Amber Runway Edge Lights Along Runway Line */}
            <g fill="#38bdf8" className="animate-runway-lights-2d">
              <circle cx="110" cy="142" r="1.5" />
              <circle cx="160" cy="142" r="1.5" />
              <circle cx="210" cy="142" r="1.5" />
              <circle cx="260" cy="142" r="1.5" />
              <circle cx="310" cy="142" r="1.5" />
              <circle cx="360" cy="142" r="1.5" />
              <circle cx="410" cy="142" r="1.5" />
            </g>
          </g>

          {/* 2D TOUCHDOWN TIRE SMOKE PUFFS */}
          <g className="animate-smoke-2d" pointerEvents="none">
            <circle cx="228" cy="141" r="5" fill="#cbd5e1" opacity="0.8" />
            <circle cx="223" cy="139" r="4" fill="#e2e8f0" opacity="0.6" />
            <circle cx="233" cy="140" r="3.5" fill="#94a3b8" opacity="0.7" />
          </g>

          {/* 2D AIRLINER VECTOR (Gliding, Flaring & Landing) */}
          <g className="animate-landing-plane-2d">
            {/* Airplane Landing Headlight Beam in 2D */}
            <polygon
              points="110,22 210,50 200,90 105,27"
              fill="url(#headlightBeam2D_mob)"
              opacity="0.3"
            />

            {/* Fuselage (Main Body) */}
            <path
              d="M 12 21 C 12 17, 28 15, 60 15 C 90 15, 106 17, 114 21 C 117 22.5, 117 25, 113 26.5 C 104 30, 85 31, 55 31 C 28 31, 12 26, 12 21 Z"
              fill="url(#fuselageGradient2D_mob)"
              stroke="#60a5fa"
              strokeWidth="0.8"
            />

            {/* Cockpit Windshield */}
            <path
              d="M 103 18 C 106 18, 110 19, 112 21 L 105 22 Z"
              fill="#38bdf8"
            />

            {/* Passenger Windows */}
            <g fill="#93c5fd" opacity="0.9">
              <rect x="34" y="20" width="3.5" height="3" rx="1" />
              <rect x="41" y="20" width="3.5" height="3" rx="1" />
              <rect x="48" y="20" width="3.5" height="3" rx="1" />
              <rect x="55" y="20" width="3.5" height="3" rx="1" />
              <rect x="62" y="20" width="3.5" height="3" rx="1" />
              <rect x="69" y="20" width="3.5" height="3" rx="1" />
              <rect x="76" y="20" width="3.5" height="3" rx="1" />
              <rect x="83" y="20" width="3.5" height="3" rx="1" />
              <rect x="90" y="20" width="3.5" height="3" rx="1" />
            </g>

            {/* Kanimo Airline Cheatline Stripe */}
            <path
              d="M 14 24 Q 60 26 112 24"
              stroke="#2563eb"
              strokeWidth="1.8"
              fill="none"
            />
            <path
              d="M 16 26 Q 60 27.5 106 25.5"
              stroke="#f59e0b"
              strokeWidth="1"
              fill="none"
            />

            {/* Tail Fin */}
            <path
              d="M 15 17 L 3 3 C 2 1.5, 5 1.5, 8 2.5 L 30 15 Z"
              fill="url(#tailGradient2D_mob)"
              stroke="#3b82f6"
              strokeWidth="0.8"
            />
            <circle cx="8" cy="6" r="2.2" fill="#f59e0b" />

            {/* Horizontal Tail Stabilizer */}
            <polygon points="4,21 16,19 18,22 6,23" fill="#1e3a8a" />

            {/* Swept Main Wing */}
            <path
              d="M 52 26 L 36 37 C 35 38, 38 38.5, 40 38 L 68 28 Z"
              fill="url(#wingGradient2D_mob)"
              stroke="#3b82f6"
              strokeWidth="0.7"
            />
            <line x1="36" y1="37" x2="34" y2="33" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />

            {/* Jet Engine Turbofan */}
            <rect x="52" y="30" width="18" height="8" rx="3" fill="#0f172a" stroke="#60a5fa" strokeWidth="0.8" />
            <ellipse cx="69" cy="34" rx="1.8" ry="3.8" fill="#38bdf8" />
            <ellipse cx="53" cy="34" rx="1" ry="3" fill="#0284c7" />

            {/* Landing Gear */}
            <g stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round">
              <line x1="98" y1="28" x2="98" y2="37" />
              <line x1="54" y1="30" x2="54" y2="37" />
            </g>

            {/* Wheels */}
            <g fill="#0f172a" stroke="#cbd5e1" strokeWidth="0.8">
              <circle cx="98" cy="38.5" r="2.8" />
              <circle cx="51.5" cy="38.5" r="3.2" />
              <circle cx="56.5" cy="38.5" r="3.2" />
            </g>

            {/* Strobe Lights */}
            <circle cx="3" cy="3" r="1.5" fill="#ef4444" className="animate-ping" />
            <circle cx="34" cy="33" r="1.5" fill="#22c55e" className="animate-ping" />
            <circle cx="98" cy="36" r="1.2" fill="#ffffff" className="animate-pulse" />
          </g>

          <defs>
            <linearGradient id="skyGradient2D_mob" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#081022" />
              <stop offset="60%" stopColor="#0d1c3a" />
              <stop offset="100%" stopColor="#091428" />
            </linearGradient>

            <linearGradient id="fuselageGradient2D_mob" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="70%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>

            <linearGradient id="tailGradient2D_mob" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1d4ed8" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            <linearGradient id="wingGradient2D_mob" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>

            <linearGradient id="headlightBeam2D_mob" x1="0%" y1="0%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#38bdf8" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Dynamic Status Badges and Animated Progress Bar */}
      <div className="relative z-10 w-full max-w-md mx-auto mt-4 space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs font-black tracking-wide text-white mb-1">
            <span className="flex items-center gap-1.5">
              <Plane className="w-4 h-4 text-blue-400" />
              <span>{title}</span>
            </span>
            <span className="font-mono text-amber-400 font-bold">{progress}%</span>
          </div>

          <div className="w-full h-2.5 bg-slate-900 border border-slate-800 rounded-full overflow-hidden p-0.5 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-amber-400 rounded-full transition-all duration-150 relative shadow-md shadow-blue-500/50"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-0 bottom-0 w-3 bg-white/70 animate-pulse rounded-full" />
            </div>
          </div>
        </div>

        {/* Phase subtitle */}
        <div className="flex items-center justify-between px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-[11px] text-slate-300">
          <span className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span className="font-semibold">{loadingPhase}</span>
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">2D APPROACH</span>
        </div>

        <p className="text-[11px] text-center text-slate-400 font-medium">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
