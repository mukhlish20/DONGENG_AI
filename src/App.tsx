import React, { useState, useEffect } from 'react';
import { StoryBook, StoryPage } from './types';
import { PRESET_STORIES } from './presetStories';
import { Navbar } from './components/Navbar';
import { BookReaderView } from './components/BookReaderView';
import { StoryGeneratorModal } from './components/StoryGeneratorModal';
import { StoryBranchingModal } from './components/StoryBranchingModal';
import { StoryEditorModal } from './components/StoryEditorModal';
import { PrintBookModal } from './components/PrintBookModal';
import { FullscreenReader } from './components/FullscreenReader';
import { LibraryDrawer } from './components/LibraryDrawer';
import { CloudflareStatusModal } from './components/CloudflareStatusModal';
import {
  Sparkles,
  BookOpen,
  Clock,
  Heart,
  Palette,
  Users,
  Compass,
  Wand2,
  Share2,
} from 'lucide-react';

const STORAGE_KEY = 'dongeng_ai_stories_v1';

export default function App() {
  const [stories, setStories] = useState<StoryBook[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return PRESET_STORIES;
  });

  const [activeStoryId, setActiveStoryId] = useState<string>(() => {
    return stories[0]?.id || PRESET_STORIES[0].id;
  });

  // Modal visibility states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorPageIndex, setEditorPageIndex] = useState(0);
  const [isBranchingOpen, setIsBranchingOpen] = useState(false);
  const [branchingPage, setBranchingPage] = useState<StoryPage | null>(null);
  const [isCloudflareModalOpen, setIsCloudflareModalOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }, [stories]);

  const activeStory = stories.find((s) => s.id === activeStoryId) || stories[0] || PRESET_STORIES[0];

  const handleSelectStory = (storyId: string) => {
    setActiveStoryId(storyId);
  };

  const handleStoryGenerated = (newStory: StoryBook) => {
    setStories((prev) => [newStory, ...prev]);
    setActiveStoryId(newStory.id);
  };

  const handleSaveEditedStory = (updatedStory: StoryBook) => {
    setStories((prev) => prev.map((s) => (s.id === updatedStory.id ? updatedStory : s)));
  };

  const handleAppendBranchPage = (newPage: StoryPage) => {
    setStories((prev) =>
      prev.map((s) => {
        if (s.id === activeStory.id) {
          return {
            ...s,
            pages: [...s.pages, newPage],
          };
        }
        return s;
      })
    );
  };

  const handleDeleteStory = (storyId: string) => {
    setStories((prev) => {
      const filtered = prev.filter((s) => s.id !== storyId);
      if (activeStoryId === storyId) {
        setActiveStoryId(filtered[0]?.id || PRESET_STORIES[0].id);
      }
      return filtered;
    });
  };

  const handleImportStory = (importedStory: StoryBook) => {
    const storyWithId = {
      ...importedStory,
      id: importedStory.id || `imported-${Date.now()}`,
      isCustom: true,
    };
    setStories((prev) => [storyWithId, ...prev]);
    setActiveStoryId(storyWithId.id);
  };

  const handleOpenEditPage = (pageIndex: number) => {
    setEditorPageIndex(pageIndex);
    setIsEditorOpen(true);
  };

  const handleOpenBranching = (page: StoryPage) => {
    setBranchingPage(page);
    setIsBranchingOpen(true);
  };

  const handleUpdatePageImage = (pageIndex: number, imageUrl: string) => {
    setStories((prev) =>
      prev.map((s) => {
        if (s.id === activeStory.id) {
          const updatedPages = [...s.pages];
          if (updatedPages[pageIndex]) {
            updatedPages[pageIndex] = {
              ...updatedPages[pageIndex],
              imageUrl,
            };
          }
          return { ...s, pages: updatedPages };
        }
        return s;
      })
    );
  };

  return (
    <div className="min-h-screen bg-[#faf6ee] text-stone-900 flex flex-col font-sans selection:bg-amber-200 selection:text-amber-900">
      {/* Top Navigation */}
      <Navbar
        stories={stories}
        activeStory={activeStory}
        onSelectStory={handleSelectStory}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onOpenLibrary={() => setIsLibraryOpen(true)}
        onOpenCloudflareModal={() => setIsCloudflareModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col items-center">
        {/* Story Metadata & Badges Hero Strip */}
        <div className="no-print w-full max-w-5xl mb-6 text-center flex flex-col items-center">
          {/* Tagline */}
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 uppercase tracking-widest mb-1.5 font-sans">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{activeStory.genre}</span>
            <span>·</span>
            <span>{activeStory.targetAgeGroup}</span>
          </div>

          <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-amber-950 tracking-tight max-w-3xl">
            {activeStory.title}
          </h1>

          <p className="font-serif-book italic text-stone-600 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
            "{activeStory.tagline}"
          </p>

          {/* Quick Badges Strip */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap mt-4 text-xs text-stone-600 font-sans">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-amber-200 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              <span>{activeStory.readingTimeMinutes} Menit Membaca</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-amber-200 shadow-2xs">
              <Palette className="w-3.5 h-3.5 text-amber-700" />
              <span>Gaya: {activeStory.artStyle}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-amber-200 shadow-2xs">
              <Heart className="w-3.5 h-3.5 text-rose-600" />
              <span className="truncate max-w-[200px]">Nilai: {activeStory.moralLesson}</span>
            </div>
          </div>
        </div>

        {/* The Realistic Interactive Storybook Spread */}
        <BookReaderView
          story={activeStory}
          onEditPage={handleOpenEditPage}
          onOpenBranching={handleOpenBranching}
          onOpenPrintModal={() => setIsPrintModalOpen(true)}
          onOpenFullscreen={() => setIsFullscreenOpen(true)}
          onUpdatePageImage={handleUpdatePageImage}
        />

        {/* Preset Story Suggestions Strip (Quick Hop) */}
        <section className="no-print w-full max-w-5xl mt-12 pt-8 border-t border-amber-200/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-bold text-lg text-amber-950">
                Pilihan Cerita Populer
              </h3>
              <p className="text-xs text-stone-600 font-sans">
                Jelajahi berbagai dongeng teladan yang siap dibacakan
              </p>
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 text-xs font-display font-semibold text-amber-800 hover:text-amber-950 p-2 rounded-xl hover:bg-amber-100 transition-colors cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5 text-amber-600" />
              <span>Buat Cerita Sendiri</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stories.slice(0, 4).map((s) => {
              const isActive = s.id === activeStory.id;
              return (
                <div
                  key={s.id}
                  onClick={() => setActiveStoryId(s.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isActive
                      ? 'bg-amber-100/90 border-amber-400 shadow-sm ring-2 ring-amber-300'
                      : 'bg-white hover:bg-amber-50/70 border-stone-200 hover:border-amber-300 shadow-2xs'
                  }`}
                >
                  <div>
                    <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider mb-1">
                      {s.genre}
                    </div>
                    <h4 className="font-display font-bold text-sm text-stone-950 line-clamp-1">
                      {s.title}
                    </h4>
                    <p className="text-xs text-stone-600 font-serif-book italic mt-1 line-clamp-2">
                      "{s.tagline}"
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500 font-sans">
                    <span>{s.pages.length} Halaman</span>
                    <span className="font-medium text-amber-800">
                      {isActive ? 'Sedang Dibaca' : 'Buka Buku →'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="no-print w-full border-t border-amber-200/80 bg-white/70 py-6 mt-12 text-center text-xs text-stone-600 font-sans">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-amber-950 text-sm">
              DongengAI
            </span>
            <span className="text-stone-400">·</span>
            <span>Aplikasi Generator Storybook Anak Berbasis AI</span>
          </div>
          <div>
            <span>Didukung Gemini 3.8 Flash & Web Speech API · Buatan Indonesia</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <StoryGeneratorModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onStoryGenerated={handleStoryGenerated}
      />

      {isBranchingOpen && branchingPage && (
        <StoryBranchingModal
          isOpen={isBranchingOpen}
          onClose={() => setIsBranchingOpen(false)}
          story={activeStory}
          currentPage={branchingPage}
          onAppendBranchPage={handleAppendBranchPage}
        />
      )}

      {isEditorOpen && (
        <StoryEditorModal
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          story={activeStory}
          initialPageIndex={editorPageIndex}
          onSaveStory={handleSaveEditedStory}
        />
      )}

      <PrintBookModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        story={activeStory}
      />

      {isFullscreenOpen && (
        <FullscreenReader
          story={activeStory}
          onClose={() => setIsFullscreenOpen(false)}
        />
      )}

      <LibraryDrawer
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        stories={stories}
        activeStoryId={activeStory.id}
        onSelectStory={handleSelectStory}
        onDeleteStory={handleDeleteStory}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onImportStory={handleImportStory}
      />

      <CloudflareStatusModal
        isOpen={isCloudflareModalOpen}
        onClose={() => setIsCloudflareModalOpen(false)}
      />
    </div>
  );
}
