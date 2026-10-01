import React from 'react';
import { StoryBook } from '../types';
import {
  BookOpen,
  Sparkles,
  BookMarked,
  Plus,
  Cloud,
} from 'lucide-react';

interface NavbarProps {
  stories: StoryBook[];
  activeStory: StoryBook;
  onSelectStory: (storyId: string) => void;
  onOpenCreateModal: () => void;
  onOpenLibrary: () => void;
  onOpenCloudflareModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  stories,
  activeStory,
  onSelectStory,
  onOpenCreateModal,
  onOpenLibrary,
  onOpenCloudflareModal,
}) => {
  return (
    <header className="no-print w-full bg-white/80 backdrop-blur-md border-b border-amber-200/80 sticky top-0 z-40 px-4 sm:px-8 py-3 transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center text-white shadow-md shadow-amber-600/20 ring-2 ring-amber-300">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-xl sm:text-2xl text-amber-950 tracking-tight">
                Dongeng<span className="text-amber-600">AI</span>
              </span>
              <span className="text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                Storybook Cerdas
              </span>
            </div>
            <p className="text-[11px] text-stone-500 font-sans hidden sm:block">
              Generator buku cerita bergambar interaktif & beredukasi anak
            </p>
          </div>
        </div>

        {/* Center / Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Story Selector Dropdown */}
          <div className="relative hidden md:block">
            <select
              value={activeStory.id}
              onChange={(e) => onSelectStory(e.target.value)}
              className="pl-3 pr-8 py-2 text-xs font-display font-semibold rounded-xl bg-amber-50/80 hover:bg-amber-100 border border-amber-300 text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer max-w-[200px] truncate"
            >
              {stories.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          {/* Cloudflare Worker Gateway Status Button */}
          <button
            onClick={onOpenCloudflareModal}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-900 bg-amber-100/70 hover:bg-amber-200/80 rounded-xl border border-amber-300/80 transition-all cursor-pointer"
            title="Pengaturan Provider Cloudflare Worker / AI"
          >
            <Cloud className="w-4 h-4 text-orange-600" />
            <span className="hidden sm:inline">Cloudflare</span>
          </button>

          {/* Library Button */}
          <button
            onClick={onOpenLibrary}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-900 bg-amber-100/70 hover:bg-amber-200/80 rounded-xl border border-amber-300/80 transition-all cursor-pointer"
            title="Buka Koleksi Dongeng"
          >
            <BookMarked className="w-4 h-4 text-amber-800" />
            <span className="hidden sm:inline">Koleksi ({stories.length})</span>
          </button>

          {/* Primary CTA: Buat Dongeng Baru */}
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-display font-semibold text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer ring-2 ring-amber-400/40"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Buat Dongeng Baru</span>
          </button>
        </div>
      </div>
    </header>
  );
};
