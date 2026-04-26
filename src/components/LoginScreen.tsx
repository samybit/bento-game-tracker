// src/components/LoginScreen.tsx
'use client';

import { useState } from 'react';
import { Gamepad2, AlertCircle } from 'lucide-react';
import { loginUser } from '@/app/actions';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (!username.trim()) {
      setError('Identify yourself to access the board.');
      return;
    }
    if (!/^[\p{L}\p{N}_-]+$/u.test(username)) {
      setError('No spaces or special characters allowed.');
      return;
    }

    setIsLoading(true);
    await loginUser(username);
  }

  // DESKTOP: Widescreen ViewBox (1440x900), converging on (720, 450)
  const desktopPaths = [
    { d: "M-100 150 L 300 150 L 450 300 L 450 450 L 720 450", color: "#6189ff", duration: 6, delay: 0 },
    { d: "M-100 750 L 300 750 L 450 600 L 450 450 L 720 450", color: "#8b5cf6", duration: 7, delay: 1.2 },
    { d: "M 150 -100 L 150 200 L 300 350 L 720 350 L 720 450", color: "#10b981", duration: 6.5, delay: 0.5 },
    { d: "M 150 1000 L 150 700 L 300 550 L 720 550 L 720 450", color: "#f43f5e", duration: 5.8, delay: 2.1 },
    { d: "M 1540 150 L 1140 150 L 990 300 L 990 450 L 720 450", color: "#06b6d4", duration: 6.2, delay: 0.8 },
    { d: "M 1540 750 L 1140 750 L 990 600 L 990 450 L 720 450", color: "#f59e0b", duration: 7.2, delay: 1.5 },
    { d: "M 1290 -100 L 1290 200 L 1140 350 L 720 350 L 720 450", color: "#6189ff", duration: 5.5, delay: 2.5 },
    { d: "M 1290 1000 L 1290 700 L 1140 550 L 720 550 L 720 450", color: "#8b5cf6", duration: 6.8, delay: 0.3 },
  ];

  // MOBILE: Portrait ViewBox (600x1200), converging on (300, 600)
  const mobilePaths = [
    { d: "M -100 200 L 150 200 L 150 600 L 300 600", color: "#6189ff", duration: 6, delay: 0 },
    { d: "M 700 300 L 450 300 L 450 600 L 300 600", color: "#8b5cf6", duration: 7, delay: 1.2 },
    { d: "M -100 1000 L 150 1000 L 150 600 L 300 600", color: "#10b981", duration: 6.5, delay: 0.5 },
    { d: "M 700 900 L 450 900 L 450 600 L 300 600", color: "#f43f5e", duration: 5.8, delay: 2.1 },
    { d: "M 150 -100 L 150 350 L 300 350 L 300 600", color: "#06b6d4", duration: 6.2, delay: 0.8 },
    { d: "M 450 1300 L 450 850 L 300 850 L 300 600", color: "#f59e0b", duration: 7.2, delay: 1.5 },
    { d: "M 450 -100 L 450 250 L 300 250 L 300 600", color: "#6189ff", duration: 5.5, delay: 2.5 },
    { d: "M 150 1300 L 150 950 L 300 950 L 300 600", color: "#8b5cf6", duration: 6.8, delay: 0.3 },
  ];

  return (
    <div className="h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#050505]">

      {/* Radial Gradient Ambient Background */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,#111_0%,#050505_100%)] pointer-events-none" />

      {/* Dynamic Energy Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-80">
        {/* DESKTOP SVG */}
        <svg className="hidden md:block w-full h-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
          <defs>
            {/* Subtle Grid Pattern */}
            <pattern id="blueprint-grid-desktop" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#262626" strokeWidth="0.5" strokeOpacity="0.4"/>
            </pattern>
          </defs>

          {/* Grid Background */}
          <rect width="100%" height="100%" fill="url(#blueprint-grid-desktop)" />

          {/* Pulsing Central Rings */}
          <motion.circle
            cx="720" cy="450"
            stroke="#6189ff" strokeWidth="1" fill="none"
            initial={{ r: 100, opacity: 0 }}
            animate={{ r: 400, opacity: [0, 0.4, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.circle
            cx="720" cy="450"
            stroke="#8b5cf6" strokeWidth="1" fill="none"
            initial={{ r: 100, opacity: 0 }}
            animate={{ r: 450, opacity: [0, 0.3, 0] }}
            transition={{ duration: 5, delay: 1.5, repeat: Infinity, ease: "easeOut" }}
          />

          {/* Circuit Paths */}
          {desktopPaths.map((p, i) => (
            <g key={`desktop-circuit-${i}`}>
              {/* Static background track */}
              <path d={p.d} stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinejoin="bevel" />

              {/* Energy Trail (Thick, colored glow) */}
              <motion.path
                d={p.d}
                stroke={p.color}
                strokeWidth="8"
                strokeOpacity="0.4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="bevel"
                initial={{ pathLength: 0.15, pathOffset: 0, opacity: 0 }}
                animate={{ pathOffset: 1, opacity: [0, 1, 1, 0] }}
                transition={{
                  pathOffset: { duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" },
                  opacity: { duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear", times: [0, 0.1, 0.9, 1] }
                }}
              />

              {/* Core Highlight (Thin, bright white) */}
              <motion.path
                d={p.d}
                stroke="#ffffff"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="bevel"
                initial={{ pathLength: 0.05, pathOffset: 0, opacity: 0 }}
                animate={{ pathOffset: 1, opacity: [0, 1, 1, 0] }}
                transition={{
                  pathOffset: { duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" },
                  opacity: { duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear", times: [0, 0.1, 0.9, 1] }
                }}
              />
            </g>
          ))}
        </svg>

        {/* MOBILE SVG */}
        <svg className="block md:hidden w-full h-full" viewBox="0 0 600 1200" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="blueprint-grid-mobile" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#262626" strokeWidth="0.5" strokeOpacity="0.4"/>
            </pattern>
          </defs>

          <rect width="100%" height="100%" fill="url(#blueprint-grid-mobile)" />

          <motion.circle
            cx="300" cy="600"
            stroke="#6189ff" strokeWidth="1" fill="none"
            initial={{ r: 80, opacity: 0 }}
            animate={{ r: 250, opacity: [0, 0.4, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.circle
            cx="300" cy="600"
            stroke="#8b5cf6" strokeWidth="1" fill="none"
            initial={{ r: 80, opacity: 0 }}
            animate={{ r: 300, opacity: [0, 0.3, 0] }}
            transition={{ duration: 5, delay: 1.5, repeat: Infinity, ease: "easeOut" }}
          />

          {mobilePaths.map((p, i) => (
            <g key={`mobile-circuit-${i}`}>
              <path d={p.d} stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinejoin="bevel" />
              
              <motion.path
                d={p.d}
                stroke={p.color}
                strokeWidth="8"
                strokeOpacity="0.4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="bevel"
                initial={{ pathLength: 0.15, pathOffset: 0, opacity: 0 }}
                animate={{ pathOffset: 1, opacity: [0, 1, 1, 0] }}
                transition={{
                  pathOffset: { duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" },
                  opacity: { duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear", times: [0, 0.1, 0.9, 1] }
                }}
              />
              
              <motion.path
                d={p.d}
                stroke="#ffffff"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="bevel"
                initial={{ pathLength: 0.05, pathOffset: 0, opacity: 0 }}
                animate={{ pathOffset: 1, opacity: [0, 1, 1, 0] }}
                transition={{
                  pathOffset: { duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" },
                  opacity: { duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear", times: [0, 0.1, 0.9, 1] }
                }}
              />
            </g>
          ))}
        </svg>
      </div>

      {/* Main Login Card */}
      <div className="bento-card max-w-md w-full flex flex-col items-center text-center p-6 md:p-8 relative z-10 bg-[#0a0a0a]/80 backdrop-blur-xl border border-[#262626] shadow-[0_0_50px_rgba(0,0,0,0.8)]">

        {/* Gamepad Container */}
        <div className="bg-[#6189ff] p-4 rounded-2xl mb-6 shadow-[0_0_30px_rgba(97,137,255,0.4)] relative z-20">
          <Gamepad2 className="w-10 h-10 text-white relative z-40" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-2 text-gray-100">Nexus Board</h1>
        <p className="text-gray-400 mb-8">Enter a unique username to access your personal completion tracker.</p>

        <form onSubmit={handleLogin} noValidate className="w-full flex flex-col gap-4 relative z-40">
          <div className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="Username..."
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) setError('');
              }}
              className={`w-full bg-[#121212]/80 border ${error ? 'border-red-500' : 'border-[#262626] focus:border-[#6189ff]'} rounded-xl px-4 py-3 text-gray-200 focus:outline-none text-center text-lg transition-colors`}
            />

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -5 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -5 }}
                  className="text-red-500 text-sm font-medium flex items-center justify-center gap-1 overflow-hidden"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#6189ff] hover:bg-[#5179ef] text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 hover:shadow-[0_0_20px_rgba(97,137,255,0.3)]"
          >
            {isLoading ? 'Establishing Connection...' : 'Enter Board'}
          </button>
        </form>
      </div>
    </div>
  );
}