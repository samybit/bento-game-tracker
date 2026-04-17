import { prisma } from '@/lib/prisma';
import { Gamepad2, LogOut } from "lucide-react";
import BoardLayout from '@/components/BoardLayout';
import LoginScreen from '@/components/LoginScreen';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { logoutUser } from '@/app/actions';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const username = cookieStore.get('nexus_user')?.value;

  if (!username) return { title: 'Nexus Board | Login' };

  const lastGame = await prisma.game.findFirst({
    where: { username },
    orderBy: { updatedAt: 'desc' },
    select: { title: true }
  });

  return {
    title: lastGame ? `Nexus | ${lastGame.title}` : `Nexus Board | ${username}`,
  };
}

export default async function Home() {
  const cookieStore = await cookies();
  const username = cookieStore.get('nexus_user')?.value;

  // Render gatekeeper if no cookie exists
  if (!username) {
    return (
      <main className="min-h-screen max-w-[1600px] mx-auto bg-transparent">
        <LoginScreen />
      </main>
    );
  }

  // Fetch ONLY the games belonging to this specific username
  const games = await prisma.game.findMany({
    where: { username },
    include: { achievements: true },
    orderBy: { updatedAt: 'desc' }
  });

  return (
    <main className="h-screen overflow-hidden p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto flex flex-col gap-6">

      <header className="flex items-center justify-between px-2 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-[#6189ff] p-2 rounded-xl">
            <Gamepad2 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Nexus Board</h1>
        </div>

        {/* User Info & Logout Button */}
        <div className="flex items-center gap-4 bg-[#121212] border border-[#262626] rounded-xl p-1.5 pr-4">
          <div className="bg-[#0a0a0a] px-3 py-1.5 rounded-lg border border-[#262626] text-sm text-gray-300 font-medium">
            @{username}
          </div>
          <form action={logoutUser}>
            <button type="submit" className="text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1 text-sm font-medium">
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </header>

      {/* Drop in the new client wrapper */}
      <BoardLayout games={games} />

    </main>
  );
}