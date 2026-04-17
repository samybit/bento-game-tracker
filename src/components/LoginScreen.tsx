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

    // Custom Validation Logic
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

  return (
    <div className="h-screen flex items-center justify-center p-4">
      <div className="bento-card max-w-md w-full flex flex-col items-center text-center p-8">
        <div className="bg-[#6189ff] p-4 rounded-2xl mb-6 shadow-[0_0_30px_rgba(97,137,255,0.3)]">
          <Gamepad2 className="w-10 h-10 text-white" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-2 text-gray-100">Nexus Board</h1>
        <p className="text-gray-400 mb-8">Enter a unique username to access your personal completion tracker.</p>

        {/* Added noValidate to disable browser popups */}
        <form onSubmit={handleLogin} noValidate className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="Username..."
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) setError(''); // Clear error when user types
              }}
              className={`w-full bg-[#0a0a0a] border ${error ? 'border-red-500' : 'border-[#262626] focus:border-[#6189ff]'} rounded-xl px-4 py-3 text-gray-200 focus:outline-none text-center text-lg transition-colors`}
            />

            {/* Animated Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -5 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -5 }}
                  className="text-red-500 text-sm font-medium flex items-center justify-center gap-1 overflow-hidden"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#6189ff] hover:bg-[#5179ef] text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Entering Nexus...' : 'Enter Board'}
          </button>
        </form>
      </div>
    </div>
  );
}