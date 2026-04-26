import { prisma } from '@/lib/prisma';
import { Gamepad2, LogOut } from "lucide-react";
import BoardLayout from '@/components/BoardLayout';
import LoginScreen from '@/components/LoginScreen';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { logoutUser } from '@/app/actions';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const rawUsername = cookieStore.get('nexus_user')?.value;
  // Decode the username to safely handle Arabic characters in metadata
  const username = rawUsername ? decodeURIComponent(rawUsername) : null;

  // Unauthenticated users (and social scrapers like Upwork) see this rich metadata
  if (!username) {
    return {
      title: 'Nexus Board | Login',
      openGraph: {
        title: 'Nexus Board | Master Your Backlog',
        description: 'A high-performance, Bento-styled game completion board powered by Gemini AI.',
        url: 'https://nexus-board.vercel.app',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Nexus Board | Master Your Backlog',
        description: 'A high-performance, Bento-styled game completion board powered by Gemini AI.',
      }
    };
  }

  const lastGame = await prisma.game.findFirst({
    where: { username },
    orderBy: { updatedAt: 'desc' },
    select: { title: true }
  });

  const pageTitle = lastGame ? `Nexus | ${lastGame.title}` : `Nexus Board | ${username}`;
  const pageDesc = `Check out @${username}'s gaming backlog and completion roadmap on Nexus Board.`;

  return {
    title: pageTitle,
    description: pageDesc,
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      url: 'https://nexus-board.vercel.app',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDesc,
    }
  };
}

export default async function Home() {
  const cookieStore = await cookies();
  const rawUsername = cookieStore.get('nexus_user')?.value;
  // Decode the username to safely handle Arabic characters in the UI
  const username = rawUsername ? decodeURIComponent(rawUsername) : null;

  // Render gatekeeper if no cookie exists
  if (!username) {
    return (
      <main className="h-screen w-full bg-[#050505]">
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
    <main className="min-h-screen lg:h-screen lg:overflow-hidden p-3 sm:p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto flex flex-col gap-4 md:gap-6">

      <header className="flex flex-wrap items-center justify-between px-1 md:px-2 shrink-0 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-[#6189ff] p-1.5 md:p-2 rounded-xl shrink-0">
            <Gamepad2 className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">Nexus Board</h1>
        </div>

        {/* User Info & Logout Button */}
        <div className="flex items-center gap-3 md:gap-4 bg-[#121212] border border-[#262626] rounded-xl p-1.5 pr-3 md:pr-4">
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