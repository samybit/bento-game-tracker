// src/app/page.tsx
import { prisma } from '@/lib/prisma';
import { Gamepad2 } from "lucide-react";
import BoardLayout from '@/components/BoardLayout';
import { Metadata } from 'next';

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

      {/* The BoardLayout component now handles EVERYTHING below the header */}
      <BoardLayout games={games} />

    </main>
  );
}