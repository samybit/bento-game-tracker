'use client';

import { toggleAchievement, deleteGame } from '@/app/actions';
import { Trash2, CheckCircle2, Circle } from 'lucide-react';

// Type definition based on the Prisma schema
type Achievement = { id: number; name: string; completed: boolean };
type Game = { id: number; title: string; imageUrl: string | null; achievements: Achievement[] };

export default function GameGrid({ games }: { games: Game[] }) {
  if (games.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        No games added yet. Start by adding one from the left panel.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto custom-scrollbar pr-2 h-[calc(100vh-250px)]">
      {games.map((game) => {
        const total = game.achievements.length;
        const completed = game.achievements.filter(a => a.completed).length;
        const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
        const isComplete = progress === 100;

        return (
          <div key={game.id} className="bg-[#0a0a0a] border border-[#262626] rounded-xl p-5 flex flex-col hover:border-gray-600 transition-colors">

            {/* Header */}
            <div className="flex justify-between items-start gap-3 mb-4">
              <div className="flex items-center gap-3 overflow-hidden">
                {game.imageUrl && (
                  <img src={game.imageUrl} alt={game.title} className="w-10 h-10 rounded-md object-cover border border-gray-800" />
                )}
                <h3 className="font-bold text-gray-200 truncate" title={game.title}>{game.title}</h3>
              </div>
              <button
                onClick={() => { if (confirm('Delete this game?')) deleteGame(game.id); }}
                className="text-gray-600 hover:text-red-500 transition-colors shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-gray-500 uppercase tracking-wider">Completion</span>
                <span className={isComplete ? 'text-[#10b981]' : 'text-[#8b5cf6]'}>{progress}%</span>
              </div>
              <div className="w-full bg-gray-900 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-[#10b981]' : 'bg-[#8b5cf6]'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Achievements List */}
            <ul className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2 max-h-48">
              {game.achievements.map((ach) => (
                <li
                  key={ach.id}
                  onClick={() => toggleAchievement(ach.id, ach.completed)}
                  className="flex items-start gap-2 cursor-pointer group"
                >
                  <div className="mt-0.5 shrink-0">
                    {ach.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-600 group-hover:text-[#8b5cf6] transition-colors" />
                    )}
                  </div>
                  <span className={`text-sm select-none transition-colors ${ach.completed ? 'text-gray-600 line-through' : 'text-gray-300 group-hover:text-gray-100'}`}>
                    {ach.name}
                  </span>
                </li>
              ))}
            </ul>

          </div>
        );
      })}
    </div>
  );
}