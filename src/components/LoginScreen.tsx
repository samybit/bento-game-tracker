'use client';

import { useState } from 'react';
import { Gamepad2 } from 'lucide-react';
import { loginUser } from '@/app/actions';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) return;

    setIsLoading(true);
    await loginUser(username);
    // No need to setIsLoading(false) because the page will re-render from the server
  }

  return (
    <div className="h-screen flex items-center justify-center p-4">
      <div className="bento-card max-w-md w-full flex flex-col items-center text-center p-8">
        <div className="bg-[#6189ff] p-4 rounded-2xl mb-6 shadow-[0_0_30px_rgba(97,137,255,0.3)]">
          <Gamepad2 className="w-10 h-10 text-white" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-2 text-gray-100">Nexus Board</h1>
        <p className="text-gray-400 mb-8">Enter a unique username to access your personal completion tracker.</p>

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
          <input
            type="text"
            placeholder="Username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            pattern="[a-zA-Z0-9_-]+"
            title="Only letters, numbers, underscores, and dashes allowed."
            className="w-full bg-[#0a0a0a] border border-[#262626] rounded-xl px-4 py-3 text-gray-200 focus:outline-none focus:border-[#6189ff] text-center text-lg"
          />
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