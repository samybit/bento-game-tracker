// src/components/AddGameForm.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { searchGameImage, addOrUpdateGame, getTrendingGames } from '@/app/actions';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Dices } from 'lucide-react';

export default function AddGameForm() {
  const [title, setTitle] = useState('');
  const [achievements, setAchievements] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Suggestion States
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const [titleError, setTitleError] = useState('');
  const [achError, setAchError] = useState('');

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Existing CheapShark Effect...
  useEffect(() => {
    let active = true;
    if (title.trim().length >= 3) {
      setIsSearching(true);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(async () => {
        const url = await searchGameImage(title);
        if (active) {
          setThumbnailUrl(url);
          setIsSearching(false);
        }
      }, 800);
    } else {
      setThumbnailUrl(null);
      setIsSearching(false);
    }
    return () => { active = false; };
  }, [title]);

  // --- AI Chat Listener Effect ---
  useEffect(() => {
    const handleFill = (e: Event) => {
      // Cast the generic Event to a CustomEvent to read your payload
      const customEvent = e as CustomEvent<string>;

      // Update the textarea with the AI's tasks
      setAchievements(customEvent.detail);

      // Clear any validation error automatically
      setAchError('');
    };

    // Start listening when the component mounts
    window.addEventListener('fill-achievements', handleFill);

    // Clean up the listener when the component unmounts
    return () => window.removeEventListener('fill-achievements', handleFill);
  }, []);

  async function handleGetSuggestions() {
    if (showSuggestions) {
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    setShowSuggestions(true);
    const trending = await getTrendingGames();
    setSuggestions(trending);
    setIsLoadingSuggestions(false);
  }

  function handleSelectSuggestion(gameName: string) {
    setTitle(gameName);
    setShowSuggestions(false);
    if (titleError) setTitleError('');
  }

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();

    let hasError = false;
    if (!title.trim()) {
      setTitleError('Nexus requires a game title.');
      hasError = true;
    }
    if (!achievements.trim()) {
      setAchError('Paste achievements to track them.');
      hasError = true;
    }
    if (hasError) return;

    setIsSubmitting(true);
    const result = await addOrUpdateGame(title, achievements, thumbnailUrl || '');
    setIsSubmitting(false);

    if (result.success) {
      setTitle('');
      setAchievements('');
      setThumbnailUrl(null);
    } else {
      alert(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 h-full">
      <div className="flex flex-col gap-1.5 shrink-0">
        <div className="flex gap-3 w-full">
          {/* Thumbnail Box (Forced to stay exactly 14x14) */}
          <div className="w-14 h-14 shrink-0 rounded-lg border border-[#262626] bg-[#0a0a0a] overflow-hidden flex items-center justify-center relative">
            {isSearching ? (
              <span className="text-xs text-gray-500 animate-pulse">...</span>
            ) : thumbnailUrl ? (
              <img src={thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover absolute inset-0" />
            ) : (
              <span className="text-xs text-gray-700">Img</span>
            )}
          </div>

          {/* Input & Button Container (min-w-0 is the secret sauce here) */}
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <input
              type="text"
              placeholder="Game Title..."
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleError) setTitleError('');
              }}
              // flex-1 allows it to grow, min-w-0 allows it to shrink below default input widths
              className={`flex-1 min-w-0 w-full bg-[#0a0a0a] border ${titleError ? 'border-red-500' : 'border-[#262626] focus:border-[#6189ff]'} rounded-lg px-3 py-2.5 text-gray-200 focus:outline-none transition-colors`}
            />

            {/* The Discovery Button (shrink-0 prevents it from getting crushed) */}
            <button
              type="button"
              onClick={handleGetSuggestions}
              className={`shrink-0 p-2.5 rounded-lg border transition-colors ${showSuggestions ? 'bg-[#6189ff] border-[#6189ff] text-white' : 'bg-[#0a0a0a] border-[#262626] text-gray-400 hover:text-[#6189ff] hover:border-[#6189ff]'}`}
              title="Suggest a Game"
            >
              <Dices className={`w-5 h-5 ${isLoadingSuggestions ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Animated Suggestions Dropdown */}
        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              className="overflow-hidden"
            >
              <div className="pt-2 pb-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {isLoadingSuggestions ? (
                  <div className="col-span-2 text-xs text-gray-500 text-center py-2">Scanning network...</div>
                ) : (
                  suggestions.map((game, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSuggestion(game)}
                      className="text-xs text-left truncate bg-[#121212] border border-[#262626] hover:border-[#6189ff] hover:text-white text-gray-400 px-3 py-2 rounded-md transition-colors"
                    >
                      {game}
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {titleError && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-red-500 text-xs font-medium flex items-center gap-1 px-1">
              <AlertCircle className="w-3 h-3" /> {titleError}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-1.5 flex-1 min-h-0">
        <textarea
          id="achievements-input"
          placeholder="Paste achievements (one per line)...&#10;Press Ctrl+Enter to save"
          value={achievements}
          onChange={(e) => {
            setAchievements(e.target.value);
            if (achError) setAchError('');
          }}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              handleSubmit();
            }
          }}
          className={`flex-1 resize-none bg-[#0a0a0a] border ${achError ? 'border-red-500' : 'border-[#262626] focus:border-[#6189ff]'} rounded-lg px-3 py-2 text-gray-200 focus:outline-none custom-scrollbar transition-colors`}
        />
        <AnimatePresence>
          {achError && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-red-500 text-xs font-medium flex items-center gap-1 px-1">
              <AlertCircle className="w-3 h-3" /> {achError}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-[#6189ff] hover:bg-[#5179ef] text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50 shrink-0"
      >
        {isSubmitting ? 'Saving...' : 'Save Game Info'}
      </button>
    </form>
  );
}