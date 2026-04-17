import { prisma } from '@/lib/prisma';
import { Gamepad2, Sparkles, PlusCircle, Trophy } from "lucide-react";
import AddGameForm from '@/components/AddGameForm';
import GameGrid from '@/components/GameGrid';
import AiChat from '@/components/AiChat';
import { Metadata } from 'next';

// This function makes the tab title dynamic
export async function generateMetadata(): Promise<Metadata> {
  const lastGame = await prisma.game.findFirst({
    orderBy: { updatedAt: 'desc' },
    select: { title: true }
  });

  return {
    title: lastGame ? `Nexus Board | ${lastGame.title}` : 'Nexus Board | Game Tracker',
    description: 'Bento-styled game completion board',
  };
}

export default async function Home() {
  const games = await prisma.game.findMany({
    include: { achievements: true },
    orderBy: { updatedAt: 'desc' }
  });

  return (
    <main className="h-screen overflow-hidden p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto flex flex-col gap-6">

      <header className="flex items-center gap-3 px-2 shrink-0">
        <div className="bg-[#6189ff] p-2 rounded-xl">
          <Gamepad2 className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Nexus Board</h1>
      </header>

      {/* FIX: Added min-h-0 so the grid can actually shrink to fit the viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 pb-2">

        {/* Column 1: Add Game */}
        <section className="bento-card lg:col-span-4 xl:col-span-3 flex flex-col min-h-0">
          <div className="flex items-center gap-2 mb-4 text-gray-300 shrink-0">
            <PlusCircle className="w-5 h-5 text-[#6189ff]" />
            <h2 className="font-semibold">Add / Update Game</h2>
          </div>
          <div className="flex-1 min-h-0">
            <AddGameForm />
          </div>
        </section>

        {/* Column 2: AI Chat */}
        <section className="bento-card lg:col-span-8 xl:col-span-4 flex flex-col p-0 overflow-hidden min-h-0">
          <div className="flex items-center gap-2 p-4 pb-0 text-gray-300 shrink-0">
            <Sparkles className="w-5 h-5 text-[#6189ff]" />
            <h2 className="font-semibold">Gemini Assistant</h2>
          </div>
          <div className="flex-1 min-h-0">
            <AiChat />
          </div>
        </section>

        {/* Column 3: Game Tracker */}
        <section className="bento-card lg:col-span-12 xl:col-span-5 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-6 shrink-0">
            {/* Unique Icon and Title Group */}
            <div className="flex items-center gap-2 text-gray-300">
              <Trophy className="w-5 h-5 text-[#6189ff]" />
              <h2 className="font-semibold">Completion Tracker</h2>
            </div>

            <div className="text-sm text-gray-500 bg-[#0a0a0a] px-3 py-1 rounded-full border border-[#262626]">
              {games.length} Games
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