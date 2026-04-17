'use client';

import { useState, useEffect, useRef } from 'react';
import { searchGameImage, addOrUpdateGame } from '@/app/actions';

export default function AddGameForm() {
  const [title, setTitle] = useState('');
  const [achievements, setAchievements] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

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
    if (title.length < 3) {
      setThumbnailUrl(null);
      return;
    }

    setIsSearching(true);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      const url = await searchGameImage(title);
      setThumbnailUrl(url);
      setIsSearching(false);
    }, 500);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [title]);

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!title.trim() || !achievements.trim()) return;

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 h-full">
      <div className="flex gap-3">
        {/* Thumbnail Preview Area */}
        <div className="w-14 h-14 shrink-0 rounded-lg border border-[#262626] bg-[#0a0a0a] overflow-hidden flex items-center justify-center">
          {isSearching ? (
            <span className="text-xs text-gray-500 animate-pulse">...</span>
          ) : thumbnailUrl ? (
            <img src={thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs text-gray-700">Img</span>
          )}
        </div>

        <input
          type="text"
          placeholder="Game Title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          // Added 'min-w-0' to force the input to respect the flex boundaries
          className="flex-1 min-w-0 bg-[#0a0a0a] border border-[#262626] rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-[#6189ff]"
        />
      </div>

      <textarea
        id="achievements-input"
        placeholder="Paste achievements (one per line)...&#10;Press Ctrl+Enter to save"
        value={achievements}
        onChange={(e) => setAchievements(e.target.value)}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            handleSubmit();
          }
        }}
        required
        className="flex-1 resize-none bg-[#0a0a0a] border border-[#262626] rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-[#6189ff] custom-scrollbar"
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-[#6189ff] hover:bg-[#4a72ff] text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50"
      >
        {isSubmitting ? 'Saving...' : 'Save Game Info'}
      </button>
    </form>
  );
}