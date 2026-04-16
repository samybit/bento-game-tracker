// src/app/page.tsx
import { Gamepad2, Sparkles, PlusCircle } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto flex flex-col gap-6">

      {/* Header */}
      <header className="flex items-center gap-3 px-2">
        <div className="bg-[#8b5cf6] p-2 rounded-xl">
          <Gamepad2 className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Nexus Board</h1>
      </header>

      {/* Bento Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-140px)] min-h-[800px]">

        {/* Left Column: Form & Chat (4 cols) */}
        <div className="md:col-span-4 flex flex-col gap-6 h-full">

          {/* Add Game Bento Card */}
          <section className="bento-card flex-none">
            <div className="flex items-center gap-2 mb-4 text-gray-300">
              <PlusCircle className="w-5 h-5 text-[#8b5cf6]" />
              <h2 className="font-semibold">Add / Update Game</h2>
            </div>
            <div className="h-48 border border-dashed border-[#262626] rounded-xl flex items-center justify-center text-sm text-gray-500">
              [Add Game Form Component]
            </div>
          </section>

          {/* AI Chat Bento Card */}
          <section className="bento-card flex-1 flex flex-col min-h-0">
            <div className="flex items-center gap-2 mb-4 text-gray-300">
              <Sparkles className="w-5 h-5 text-[#8b5cf6]" />
              <h2 className="font-semibold">Gemini Assistant</h2>
            </div>
            <div className="flex-1 border border-dashed border-[#262626] rounded-xl flex items-center justify-center text-sm text-gray-500">
              [AI Chat Component]
            </div>
          </section>

        </div>

        {/* Right Column: Game Grid (8 cols) */}
        <section className="md:col-span-8 bento-card flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-gray-300">Completion Tracker</h2>
            <div className="text-sm text-gray-500">
              [Filter/Sort Controls]
            </div>
          </div>

          <div className="flex-1 border border-dashed border-[#262626] rounded-xl flex items-center justify-center text-sm text-gray-500">
            [Game List Grid Component]
          </div>
        </section>

      </div>
    </main>
  );
}