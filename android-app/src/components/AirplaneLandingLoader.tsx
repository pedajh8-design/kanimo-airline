import React from 'react';

interface AirplaneLandingLoaderProps {
  title?: string;
  subtitle?: string;
  fullScreen?: boolean;
}

export default function AirplaneLandingLoader({
  title,
  subtitle,
  fullScreen = true,
}: AirplaneLandingLoaderProps) {
  const containerClass = fullScreen
    ? 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white select-none p-4 overflow-hidden'
    : 'relative w-full py-12 flex flex-col items-center justify-center bg-black/70 rounded-3xl border border-slate-900 text-white select-none p-6 shadow-2xl';

  return (
    <div className={containerClass}>
      <style>{`
        @keyframes spinFlightRing {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes planeFlightHover {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(1.8px, -1.8px); }
        }

        @keyframes jetThrustPulse {
          0%, 100% {
            opacity: 0.85;
            filter: drop-shadow(0 0 4px rgba(0, 195, 255, 0.65));
          }
          50% {
            opacity: 1;
            filter: drop-shadow(0 0 10px rgba(0, 220, 255, 0.95));
          }
        }

        @keyframes dotPulseWave {
          0%, 20% { opacity: 0.2; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-1.5px); }
          80%, 100% { opacity: 0.2; transform: translateY(0); }
        }

        .animate-spin-ring {
          transform-origin: 150px 150px;
          animation: spinFlightRing 1.5s linear infinite;
        }

        .animate-plane-hover {
          transform-origin: 150px 150px;
          animation: planeFlightHover 2.2s ease-in-out infinite;
        }

        .animate-jet-pulse {
          animation: jetThrustPulse 1.2s ease-in-out infinite;
        }

        .dot-wave-1 { animation: dotPulseWave 1.4s infinite 0.0s; }
        .dot-wave-2 { animation: dotPulseWave 1.4s infinite 0.2s; }
        .dot-wave-3 { animation: dotPulseWave 1.4s infinite 0.4s; }
      `}</style>

      <div className="flex flex-col items-center justify-center">
        {/* EXACT VECTOR ANIMATED FLIGHT LOADER */}
        <div className="relative flex items-center justify-center">
          <svg
            className="w-48 h-48 select-none"
            viewBox="0 0 300 300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* 18 DASHED CIRCLE (ROTATING) */}
            <g className="animate-spin-ring">
              {/* 6 Glowing Cyan/Blue Dashes */}
              <path d="M 139.63 54.56 A 96 96 0 0 1 160.37 54.56" stroke="#0084ff" strokeWidth="11" strokeLinecap="round" />
              <path d="M 172.90 56.77 A 96 96 0 0 1 192.38 63.86" stroke="#0099ff" strokeWidth="11" strokeLinecap="round" />
              <path d="M 203.40 70.23 A 96 96 0 0 1 219.29 83.55" stroke="#00b4d8" strokeWidth="11" strokeLinecap="round" />
              <path d="M 227.47 93.30 A 96 96 0 0 1 237.84 111.26" stroke="#00d4ff" strokeWidth="11" strokeLinecap="round" />
              <path d="M 242.19 123.22 A 96 96 0 0 1 245.79 143.64" stroke="#38e1f9" strokeWidth="11" strokeLinecap="round" />
              <path d="M 245.79 156.36 A 96 96 0 0 1 242.19 176.78" stroke="#62ebff" strokeWidth="11" strokeLinecap="round" />

              {/* 12 Muted Slate Gray Dashes */}
              <path d="M 237.84 188.74 A 96 96 0 0 1 227.47 206.70" stroke="#2d3748" strokeWidth="11" strokeLinecap="round" />
              <path d="M 219.29 216.45 A 96 96 0 0 1 203.40 229.77" stroke="#2d3748" strokeWidth="11" strokeLinecap="round" />
              <path d="M 192.38 236.14 A 96 96 0 0 1 172.90 243.23" stroke="#2d3748" strokeWidth="11" strokeLinecap="round" />
              <path d="M 160.37 245.44 A 96 96 0 0 1 139.63 245.44" stroke="#2d3748" strokeWidth="11" strokeLinecap="round" />
              <path d="M 127.10 243.23 A 96 96 0 0 1 107.62 236.14" stroke="#2d3748" strokeWidth="11" strokeLinecap="round" />
              <path d="M 96.60 229.77 A 96 96 0 0 1 80.71 216.45" stroke="#2d3748" strokeWidth="11" strokeLinecap="round" />
              <path d="M 72.53 206.70 A 96 96 0 0 1 62.16 188.74" stroke="#2d3748" strokeWidth="11" strokeLinecap="round" />
              <path d="M 57.81 176.78 A 96 96 0 0 1 54.21 156.36" stroke="#2d3748" strokeWidth="11" strokeLinecap="round" />
              <path d="M 54.21 143.64 A 96 96 0 0 1 57.81 123.22" stroke="#2d3748" strokeWidth="11" strokeLinecap="round" />
              <path d="M 62.16 111.26 A 96 96 0 0 1 72.53 93.30" stroke="#2d3748" strokeWidth="11" strokeLinecap="round" />
              <path d="M 80.71 83.55 A 96 96 0 0 1 96.60 70.23" stroke="#2d3748" strokeWidth="11" strokeLinecap="round" />
              <path d="M 107.62 63.86 A 96 96 0 0 1 127.10 56.77" stroke="#2d3748" strokeWidth="11" strokeLinecap="round" />
            </g>

            {/* CENTER AIRPLANE & 3 SPEED STREAKS */}
            <g className="animate-plane-hover">
              {/* 3 Electric Blue Speed/Jet Streaks */}
              <g className="animate-jet-pulse" fill="url(#loaderJetBlueGradient_mob)">
                {/* Top Streak */}
                <path d="M 112.73 160.85 L 114.62 163.21 L 112.26 164.62 L 111.79 166.51 L 102.35 173.59 L 85.37 183.02 L 101.88 167.93 L 112.73 160.85 Z" />
                {/* Middle Streak */}
                <path d="M 121.70 168.40 L 121.70 169.34 L 124.53 171.70 L 123.11 173.12 L 110.37 182.08 L 94.33 191.04 L 108.96 177.36 L 121.70 168.40 Z" />
                {/* Bottom Streak */}
                <path d="M 125.00 180.66 L 128.30 183.02 L 127.36 183.97 L 113.20 194.34 L 96.22 203.78 L 111.79 189.63 L 125.00 180.66 Z" />
              </g>

              {/* Solid White Jet Silhouette */}
              <path
                d="M 202.36 111.32 L 206.14 112.73 L 202.36 121.22 L 195.76 127.83 L 177.83 140.09 L 175.47 183.02 L 172.64 188.21 L 166.51 176.89 L 162.27 159.43 L 159.43 152.83 L 144.34 161.79 L 143.87 174.53 L 140.09 177.83 L 138.68 177.36 L 133.49 163.68 L 120.28 155.19 L 125.00 151.42 L 138.68 153.77 L 150.94 142.92 L 122.64 126.88 L 117.92 123.58 L 118.39 122.17 L 125.94 120.28 L 169.81 130.19 L 189.15 116.03 L 202.36 111.32 Z"
                fill="#ffffff"
              />
            </g>

            {/* Jet Exhaust Gradient */}
            <defs>
              <linearGradient id="loaderJetBlueGradient_mob" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0066ff" />
                <stop offset="50%" stopColor="#00b4d8" />
                <stop offset="100%" stopColor="#38f0ff" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* LOADING... TEXT */}
        <div className="mt-7 text-center">
          <div className="text-white font-bold tracking-[0.38em] text-sm uppercase flex items-center justify-center">
            <span>LOADING</span>
            <span className="dot-wave-1">.</span>
            <span className="dot-wave-2">.</span>
            <span className="dot-wave-3">.</span>
          </div>

          {title && (
            <p className="mt-2 text-xs font-semibold text-slate-400 tracking-wide">
              {title}
            </p>
          )}
          {subtitle && (
            <p className="mt-1 text-[11px] text-slate-500">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
