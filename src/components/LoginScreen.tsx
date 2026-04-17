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
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      setError('No spaces or special characters allowed.');
      return;
    }

    setIsLoading(true);
    await loginUser(username);
  }

  // Define the intertwined paths routing into the center (X: 720, Y: 450)
  const paths = [
    // Left side cables
    { d: "M-100 200 C 200 200, 400 100, 720 450", duration: 4.5, delay: 0 },
    { d: "M-100 600 C 300 700, 500 800, 720 450", duration: 5.2, delay: 1.5 },
    { d: "M-100 400 C 200 600, 500 300, 720 450", duration: 3.8, delay: 0.5 },
    { d: "M-100 800 C 300 800, 400 400, 720 450", duration: 6.0, delay: 2.5 },
    // Right side cables
    { d: "M1540 200 C 1240 200, 1040 100, 720 450", duration: 4.8, delay: 0.8 },
    { d: "M1540 600 C 1140 700, 940 800, 720 450", duration: 5.5, delay: 0.2 },
    { d: "M1540 400 C 1240 600, 940 300, 720 450", duration: 4.2, delay: 1.8 },
    { d: "M1540 800 C 1140 800, 1040 400, 720 450", duration: 6.3, delay: 1.2 },
  ];

  return (
    <div className="h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#050505]">

      {/* Dynamic Energy Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-80">
        <svg className="w-full h-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
          <defs>
            <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {paths.map((p, i) => (
            <g key={i}>
              {/* The dormant "wire" track */}
              <path
                d={p.d}
                stroke="#262626"
                strokeWidth="1.5"
                fill="none"
                className="opacity-40"
              />

              {/* The shooting energy pulse */}
              <motion.path
                d={p.d}
                stroke="#6189ff"
                strokeWidth="3"
                fill="none"
                filter="url(#neonGlow)"
                initial={{ pathLength: 0.15, pathOffset: 0, opacity: 0 }}
                animate={{
                  pathOffset: 1,
                  opacity: [0, 1, 1, 0]
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            </g>
          ))}
        </svg>
      </div>

      {/* Main Login Card - Added backdrop blur and transparency so lines glow behind it */}
      <div className="bento-card max-w-md w-full flex flex-col items-center text-center p-8 relative z-10 bg-[#0a0a0a]/80 backdrop-blur-xl border border-[#262626] shadow-[0_0_50px_rgba(0,0,0,0.8)]">

        <div className="bg-[#6189ff] p-4 rounded-2xl mb-6 shadow-[0_0_30px_rgba(97,137,255,0.4)] relative">
          <Gamepad2 className="w-10 h-10 text-white relative z-10" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-2 text-gray-100">Nexus Board</h1>
        <p className="text-gray-400 mb-8">Enter a unique username to access your personal completion tracker.</p>

        <form onSubmit={handleLogin} noValidate className="w-full flex flex-col gap-4">
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