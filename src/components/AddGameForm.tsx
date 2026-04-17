'use client';

import { useState, useEffect } from 'react';
import { searchGameImage, addOrUpdateGame } from '@/app/actions';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

export default function AddGameForm() {
  const [title, setTitle] = useState('');
  const [achievements, setAchievements] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Error States
  const [titleError, setTitleError] = useState('');
  const [achError, setAchError] = useState('');

  // --- Listen for AI filling the form ---
  useEffect(() => {
    const handleFill = (e: Event) => {
      const customEvent = e as CustomEvent;
      setAchievements(customEvent.detail);

      // flash a success color on the textarea
      const textarea = document.getElementById('achievements-input');
      if (textarea) {
        textarea.classList.add('border-[#10b981]', 'bg-[#10b981]/10');
        setTimeout(() => {
          textarea.classList.remove('border-[#10b981]', 'bg-[#10b981]/10');
        }, 1000);
      }
    };

    window.addEventListener('fill-achievements', handleFill);
    return () => window.removeEventListener('fill-achievements', handleFill);
  }, []);

  // Debounced search for CheapShark thumbnail
  useEffect(() => {
    let active = true;

    if (title.length < 3) {
      setThumbnailUrl(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    const timer = setTimeout(async () => {
      const url = await searchGameImage(title);
      if (active) {
        setThumbnailUrl(url);
        setIsSearching(false);
      }
    }, 500);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [title]);

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();

    // Custom Validation
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
    // Added noValidate
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 h-full">
      <div className="flex flex-col gap-1.5 shrink-0">
        <div className="flex gap-3">
          <div className="w-14 h-14 shrink-0 rounded-lg border border-[#262626] bg-[#0a0a0a] overflow-hidden flex items-center justify-center relative">
            {isSearching ? (
              <span className="text-xs text-gray-500 animate-pulse">...</span>
            ) : thumbnailUrl ? (
              <Image src={thumbnailUrl} alt="Thumbnail" fill className="object-cover" unoptimized />
            ) : (
              <span className="text-xs text-gray-700">Img</span>
            )}
          </div>

          <input
            type="text"
            placeholder="Game Title..."
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (titleError) setTitleError('');
            }}
            className={`flex-1 min-w-0 bg-[#0a0a0a] border ${titleError ? 'border-red-500' : 'border-[#262626] focus:border-[#6189ff]'} rounded-lg px-3 py-2 text-gray-200 focus:outline-none transition-colors`}
          />
        </div>
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