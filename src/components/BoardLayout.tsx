'use client';

import { useState } from 'react';
import { Sparkles, PlusCircle, Trophy, Maximize2, Minimize2 } from "lucide-react";
import AddGameForm from '@/components/AddGameForm';
import GameGrid from '@/components/GameGrid';
import AiChat from '@/components/AiChat';
import { motion, Transition } from 'framer-motion';

type Achievement = { id: number; name: string; completed: boolean };
type Game = { id: number; title: string; imageUrl: string | null; achievements: Achievement[] };

export default function BoardLayout({ games }: { games: Game[] }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // High-stiffness spring for that fast, electric snap without lingering bounce
  const layoutTransition: Transition = {
    type: "spring",
    stiffness: 350,
    damping: 30,
    mass: 0.8
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 pb-2">

      {/* 1. Add Game Form */}
      <motion.section
        layout
        transition={layoutTransition}
        className={`bento-card min-h-0 flex-col ${isExpanded ? 'hidden' : 'flex lg:col-span-4 xl:col-span-3'}`}
      >
        <div className="flex items-center gap-2 mb-4 text-gray-300 shrink-0">
          <PlusCircle className="w-5 h-5 text-[#6189ff]" />
          <h2 className="font-semibold">Add / Update Game</h2>
        </div>
        <div className="flex-1 min-h-0">
          <AddGameForm />
        </div>
      </motion.section>

      {/* 2. AI Chat */}
      <motion.section
        layout
        transition={layoutTransition}
        className={`bento-card p-0 overflow-hidden min-h-0 flex-col ${isExpanded ? 'hidden' : 'flex lg:col-span-8 xl:col-span-4'}`}
      >
        <div className="flex items-center gap-2 p-4 pb-0 text-gray-300 shrink-0">
          <Sparkles className="w-5 h-5 text-[#6189ff]" />
          <h2 className="font-semibold">Gemini Assistant</h2>
        </div>
        <div className="flex-1 min-h-0">
          <AiChat />
        </div>
      </motion.section>

      {/* 3. Game Tracker */}
      <motion.section
        layout
        transition={layoutTransition}
        className={`bento-card flex flex-col min-h-0 ${isExpanded ? 'col-span-1 lg:col-span-12 xl:col-span-12' : 'lg:col-span-12 xl:col-span-5'}`}
      >
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div className="flex items-center gap-2 text-gray-300">
            <Trophy className="w-5 h-5 text-[#6189ff]" />
            <h2 className="font-semibold">Completion Tracker</h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500 bg-[#0a0a0a] px-3 py-1 rounded-full border border-[#262626]">
              {games.length} Games
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-gray-400 hover:text-white bg-[#0a0a0a] border border-[#262626] rounded-lg hover:border-[#6189ff] transition-colors"
              title={isExpanded ? "Exit Fullscreen" : "Fullscreen Tracker"}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <GameGrid games={games} isExpanded={isExpanded} />
        </div>
      </motion.section>

    </div>
  );
}