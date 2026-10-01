import React, { useState, useEffect } from 'react';
import { StoryBook } from '../types';
import { SceneIllustration } from './SceneIllustration';
import { soundEngine } from '../utils/soundEffects';
import { narrationController } from '../utils/narration';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Music,
  Play,
  Pause,
  Moon,
  Sun,
  Clock,
} from 'lucide-react';

interface FullscreenReaderProps {
  story: StoryBook;
  onClose: () => void;
}

export const FullscreenReader: React.FC<FullscreenReaderProps> = ({
  story,
  onClose,
}) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isNarrating, setIsNarrating] = useState(false);
  const [isLullabyOn, setIsLullabyOn] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(false);

  const totalPages = story.pages.length;
  const currentPage = story.pages[currentPageIndex] || story.pages[0];

  useEffect(() => {
    narrationController.stop();
    setIsNarrating(false);
  }, [currentPageIndex]);

  useEffect(() => {
    let interval: any;
    if (autoAdvance) {
      interval = setInterval(() => {
        setCurrentPageIndex((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
        soundEngine.playPageTurn();
      }, 18000);
    }
    return () => clearInterval(interval);
  }, [autoAdvance, totalPages]);

  // Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') {
        if (currentPageIndex < totalPages - 1) {
          soundEngine.playPageTurn();
          setCurrentPageIndex((prev) => prev + 1);
        }
      }
      if (e.key === 'ArrowLeft') {
        if (currentPageIndex > 0) {
          soundEngine.playPageTurn();
          setCurrentPageIndex((prev) => prev - 1);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPageIndex, totalPages, onClose]);

  const toggleNarration = () => {
    if (isNarrating) {
      narrationController.stop();
      setIsNarrating(false);
    } else {
      setIsNarrating(true);
      narrationController.speak(currentPage.narrativeText, 'id', undefined, () => {
        setIsNarrating(false);
      });
    }
  };

  const toggleLullaby = () => {
    const state = soundEngine.toggleAmbientMusic((p) => setIsLullabyOn(p));
    setIsLullabyOn(state);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-between p-4 sm:p-8 transition-colors duration-500 ${
        isDarkMode
          ? 'bg-slate-950 text-stone-100'
          : 'bg-[#faf6ee] text-stone-900'
      }`}
    >
      {/* Top Floating Bar */}
      <div className="flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <span className="font-display font-bold text-base sm:text-lg tracking-wide">
            {story.title}
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md">
            {currentPageIndex + 1} / {totalPages}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Night / Warm Bedtime Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            title="Ganti Mode Malam / Terang"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Lullaby Audio */}
          <button
            onClick={toggleLullaby}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isLullabyOn ? 'bg-amber-600 text-white' : 'bg-white/10 hover:bg-white/20'
            }`}
            title="Musik Pengantar Tidur"
          >
            <Music className="w-4 h-4" />
          </button>

          {/* Auto advance */}
          <button
            onClick={() => setAutoAdvance(!autoAdvance)}
            className={`px-3 py-1.5 rounded-xl text-xs font-sans transition-colors cursor-pointer flex items-center gap-1.5 ${
              autoAdvance ? 'bg-emerald-600 text-white' : 'bg-white/10 hover:bg-white/20'
            }`}
            title="Balik Halaman Otomatis Setiap 18 Detik"
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Otomatis</span>
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors cursor-pointer ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Fullscreen Stage */}
      <div className="flex-1 max-w-5xl mx-auto w-full flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-12 my-auto py-4">
        {/* Left: Illustration */}
        <div className="w-full md:w-1/2 max-w-md aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-white/10">
          <SceneIllustration
            page={currentPage}
            artStyle={story.artStyle}
            bookTitle={story.title}
            className="h-full"
          />
        </div>

        {/* Right: Text */}
        <div className="w-full md:w-1/2 max-w-md flex flex-col justify-center">
          <span className="text-xs uppercase tracking-widest font-sans font-semibold text-amber-400 mb-1">
            Bab {currentPage.pageNumber} · {currentPage.sceneTitle}
          </span>
          <p className="font-serif-book text-lg sm:text-2xl leading-relaxed sm:leading-loose">
            {currentPage.narrativeText}
          </p>

          {currentPage.dialogue && (
            <div className="mt-4 p-3.5 rounded-2xl bg-white/10 border-l-4 border-amber-400 font-serif-book text-base italic text-amber-200">
              {currentPage.dialogue}
            </div>
          )}

          {/* Narration voice play button */}
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={toggleNarration}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-display text-sm font-semibold shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              {isNarrating ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Jeda Suara</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Bacakan Dongeng</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Large Nav Arrows */}
      <div className="flex items-center justify-between max-w-5xl mx-auto w-full z-20">
        <button
          onClick={() => {
            if (currentPageIndex > 0) {
              soundEngine.playPageTurn();
              setCurrentPageIndex((p) => p - 1);
            }
          }}
          disabled={currentPageIndex === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-20 cursor-pointer font-display text-sm"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Sebelumnya</span>
        </button>

        <span className="text-xs text-stone-400 font-serif-book italic">
          Tekan tombol panah keyboard ← / → untuk membalik halaman
        </span>

        <button
          onClick={() => {
            if (currentPageIndex < totalPages - 1) {
              soundEngine.playPageTurn();
              setCurrentPageIndex((p) => p + 1);
            }
          }}
          disabled={currentPageIndex === totalPages - 1}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-20 cursor-pointer font-display text-sm"
        >
          <span>Selanjutnya</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
