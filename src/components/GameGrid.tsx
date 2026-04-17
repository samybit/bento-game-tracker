// src/components/GameGrid.tsx
'use client';

import { useState } from 'react';
import { toggleAchievement, deleteGame } from '@/app/actions';
import { Trash2, CheckCircle2, Circle, Image as ImageIcon, Check, X } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

type Achievement = { id: number; name: string; completed: boolean };
type Game = { id: number; title: string; imageUrl: string | null; achievements: Achievement[] };

export default function GameGrid({ games, isExpanded = false }: { games: Game[], isExpanded?: boolean }) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Electric Animation Variants
  const electricCard: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: 10
    },
    visible: {
      opacity: [0, 1, 0.4, 1],
      scale: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
        opacity: { times: [0, 0.4, 0.7, 1] }
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      filter: "blur(4px)",
      transition: { duration: 0.2 }
    }
  };

  const executeDelete = async (id: number) => {
    await deleteGame(id);
    setDeleteConfirmId(null);
  };

  if (games.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        No games added yet. Start by adding one from the left panel.
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 h-full overflow-y-auto custom-scrollbar pr-2 pb-4 content-start ${isExpanded ? 'lg:grid-cols-3 xl:grid-cols-4' : 'xl:grid-cols-2 2xl:grid-cols-3'}`}>
      <AnimatePresence mode="popLayout">
        {games.map((game) => {
          const total = game.achievements.length;
          const completed = game.achievements.filter(a => a.completed).length;
          const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
          const isComplete = progress === 100;

          // Extracted Header Component for cleaner rendering
          const headerContent = (
            <div className="flex justify-between items-start gap-3 mb-4 shrink-0 h-10">
              <div className="flex items-center gap-3 overflow-hidden">
                {!isExpanded && game.imageUrl && (
                  <img src={game.imageUrl} alt={game.title} className="w-10 h-10 rounded-md object-cover border border-gray-800 shrink-0" />
                )}
                <h3 className={`font-bold text-gray-200 truncate ${isExpanded ? 'text-lg mt-1' : ''}`} title={game.title}>
                  {game.title}
                </h3>
              </div>

              <div className="shrink-0 flex items-center justify-end min-w-[80px]">
                <AnimatePresence mode="wait">
                  {deleteConfirmId === game.id ? (
                    <motion.div
                      key="confirm"
                      initial={{ opacity: 0, x: 10, filter: "blur(2px)" }}
                      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, x: -10, filter: "blur(2px)" }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center gap-1.5 bg-red-950/40 border border-red-900/50 rounded-lg px-2 py-1"
                    >
                      <button onClick={() => executeDelete(game.id)} className="text-red-500 hover:text-red-400 transition-colors p-1 rounded-md hover:bg-red-900/50" title="Confirm Delete">
                        <Check className="w-4 h-4" />
                      </button>
                      <div className="w-[1px] h-4 bg-red-900/50"></div>
                      <button onClick={() => setDeleteConfirmId(null)} className="text-gray-400 hover:text-gray-200 transition-colors p-1 rounded-md hover:bg-[#262626]" title="Cancel">
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ) : (
                    <motion.button
                      key="trash"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      onClick={() => setDeleteConfirmId(game.id)}
                      className="text-gray-600 hover:text-red-500 transition-colors p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );

          return (
            <motion.div
              key={game.id}
              layout="position"
              variants={electricCard}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`bg-[#0a0a0a] border border-[#262626] rounded-xl flex flex-col hover:border-gray-600 transition-colors ${isExpanded ? 'h-[400px]' : 'h-[350px] p-5'}`}
            >
              {isExpanded ? (
                <>
                  {game.imageUrl ? (
                    <img src={game.imageUrl} alt={game.title} className="w-full h-32 object-cover rounded-t-xl border-b border-[#262626] shrink-0" />
                  ) : (
                    <div className="w-full h-32 bg-[#121212] rounded-t-xl border-b border-[#262626] shrink-0 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-700" />
                    </div>
                  )}

                  <div className="p-4 flex flex-col flex-1 min-h-0">
                    {headerContent}

                    <div className="mb-4 shrink-0">
                      <div className="flex justify-between text-xs mb-1 font-medium">
                        <span className="text-gray-500 uppercase tracking-wider">Completion</span>
                        <span className={isComplete ? 'text-[#10b981]' : 'text-[#6189ff]'}>{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-900 rounded-full h-1.5 overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-[#10b981]' : 'bg-[#6189ff]'}`} style={{ width: `${progress}%` }} />
                      </div>
                    </div>

                    <ul className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                      {game.achievements.map((ach) => (
                        <li key={ach.id} onClick={() => toggleAchievement(ach.id, ach.completed)} className="flex items-start gap-2 cursor-pointer group">
                          <div className="mt-0.5 shrink-0">
                            {ach.completed ? <CheckCircle2 className="w-4 h-4 text-[#10b981]" /> : <Circle className="w-4 h-4 text-gray-600 group-hover:text-[#6189ff] transition-colors" />}
                          </div>
                          <span className={`text-sm select-none transition-colors leading-snug break-words ${ach.completed ? 'text-gray-600 line-through' : 'text-gray-300 group-hover:text-gray-100'}`}>
                            {ach.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  {headerContent}

                  <div className="mb-4 shrink-0">
                    <div className="flex justify-between text-xs mb-1 font-medium">
                      <span className="text-gray-500 uppercase tracking-wider">Completion</span>
                      <span className={isComplete ? 'text-[#10b981]' : 'text-[#6189ff]'}>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-900 rounded-full h-1.5 overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-[#10b981]' : 'bg-[#6189ff]'}`} style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  <ul className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                    {game.achievements.map((ach) => (
                      <li key={ach.id} onClick={() => toggleAchievement(ach.id, ach.completed)} className="flex items-start gap-2 cursor-pointer group">
                        <div className="mt-0.5 shrink-0">
                          {ach.completed ? <CheckCircle2 className="w-4 h-4 text-[#10b981]" /> : <Circle className="w-4 h-4 text-gray-600 group-hover:text-[#6189ff] transition-colors" />}
                        </div>
                        <span className={`text-sm select-none transition-colors leading-snug break-words ${ach.completed ? 'text-gray-600 line-through' : 'text-gray-300 group-hover:text-gray-100'}`}>
                          {ach.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}