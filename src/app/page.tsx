// src/app/page.tsx
import { prisma } from '@/lib/prisma';
import { Gamepad2, Sparkles, PlusCircle } from "lucide-react";
import AddGameForm from '@/components/AddGameForm';
import GameGrid from '@/components/GameGrid';
import AiChat from '@/components/AiChat';

export default async function Home() {
  const games = await prisma.game.findMany({
    include: { achievements: true },
    orderBy: { updatedAt: 'desc' }
  });

  return (
    // FIX 1: Added xl:h-screen and xl:overflow-hidden to lock the body height on desktop
    <main className="min-h-screen xl:h-screen xl:overflow-hidden p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto flex flex-col gap-6">

      <header className="flex items-center gap-3 px-2 shrink-0">
        <div className="bg-[#8b5cf6] p-2 rounded-xl">
          <Gamepad2 className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Nexus Board</h1>
      </header>

      {/* The New Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 xl:pb-2">

        {/* 1. Add Game Form */}
        {/* FIX 2: Changed xl:h-[calc...] to xl:h-full. Flexbox will now handle the exact remaining space perfectly */}
        <section className="bento-card lg:col-span-4 xl:col-span-3 flex flex-col h-[400px] lg:h-[400px] xl:h-full">
          <div className="flex items-center gap-2 mb-4 text-gray-300 shrink-0">
            <PlusCircle className="w-5 h-5 text-[#8b5cf6]" />
            <h2 className="font-semibold">Add / Update Game</h2>
          </div>
          <div className="flex-1 min-h-0">
            <AddGameForm />
          </div>
        </section>

        {/* 2. AI Chat */}
        <section className="bento-card lg:col-span-8 xl:col-span-4 flex flex-col p-0 overflow-hidden h-[600px] lg:h-[400px] xl:h-full">
          <div className="flex items-center gap-2 p-4 pb-0 text-gray-300 shrink-0">
            <Sparkles className="w-5 h-5 text-[#8b5cf6]" />
            <h2 className="font-semibold">Gemini Assistant</h2>
          </div>
          <div className="flex-1 overflow-hidden min-h-0">
            <AiChat />
          </div>
        </section>

        {/* 3. Game Tracker Grid */}
        <section className="bento-card lg:col-span-12 xl:col-span-5 flex flex-col h-[800px] lg:h-[600px] xl:h-full">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <h2 className="font-semibold text-gray-300">Completion Tracker</h2>
            <div className="text-sm text-gray-500 bg-[#0a0a0a] px-3 py-1 rounded-full border border-[#262626]">
              {games.length} Games Tracked
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <GameGrid games={games} />
          </div>
        </section>

      </div>
    </main>
  );
}