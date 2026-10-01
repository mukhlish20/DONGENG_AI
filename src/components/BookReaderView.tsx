import React, { useState, useEffect } from 'react';
import { StoryBook, StoryPage, VoicePersona } from '../types';
import { SceneIllustration } from './SceneIllustration';
import { VoiceSelectorModal } from './VoiceSelectorModal';
import { soundEngine } from '../utils/soundEffects';
import { narrationController, VOICE_PROFILES } from '../utils/narration';
import {
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Music,
  Printer,
  Edit3,
  Maximize2,
  GitBranch,
  Languages,
  Sparkles,
  BookOpen,
  HelpCircle,
  Footprints,
  Radio,
} from 'lucide-react';

interface BookReaderViewProps {
  story: StoryBook;
  onEditPage?: (pageIndex: number) => void;
  onOpenBranching?: (currentPage: StoryPage) => void;
  onOpenPrintModal?: () => void;
  onOpenFullscreen?: () => void;
  onUpdatePageImage?: (pageIndex: number, imageUrl: string) => void;
}

export const BookReaderView: React.FC<BookReaderViewProps> = ({
  story,
  onEditPage,
  onOpenBranching,
  onOpenPrintModal,
  onOpenFullscreen,
  onUpdatePageImage,
}) => {
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [showEnglishTranslation, setShowEnglishTranslation] = useState<boolean>(false);
  const [isNarrating, setIsNarrating] = useState<boolean>(false);
  const [isNarrationPaused, setIsNarrationPaused] = useState<boolean>(false);
  const [narrationLang, setNarrationLang] = useState<'id' | 'en'>('id');
  const [speechRate, setSpeechRate] = useState<number>(0.95);
  const [isAmbientMusicOn, setIsAmbientMusicOn] = useState<boolean>(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [activePersona, setActivePersona] = useState<VoicePersona>(
    narrationController.getActivePersona()
  );

  const totalPages = story.pages.length;
  const currentPage = story.pages[currentPageIndex] || story.pages[0];

  // Stop narration on page change or unmount
  useEffect(() => {
    narrationController.stop();
    setIsNarrating(false);
    setIsNarrationPaused(false);
  }, [currentPageIndex, story.id]);

  useEffect(() => {
    return () => {
      narrationController.stop();
      soundEngine.stopAmbientMusic();
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        goToNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goToPrevPage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPageIndex, totalPages]);

  const goToNextPage = () => {
    if (currentPageIndex < totalPages - 1) {
      soundEngine.playPageTurn();
      setCurrentPageIndex((prev) => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPageIndex > 0) {
      soundEngine.playPageTurn();
      setCurrentPageIndex((prev) => prev - 1);
    }
  };

  // Narration Playback
  const handleToggleNarration = () => {
    if (isNarrating) {
      if (isNarrationPaused) {
        narrationController.resume();
        setIsNarrationPaused(false);
      } else {
        narrationController.pause();
        setIsNarrationPaused(true);
      }
    } else {
      const textToRead =
        narrationLang === 'en' && currentPage.englishTranslation
          ? currentPage.englishTranslation
          : currentPage.narrativeText;

      setIsNarrating(true);
      setIsNarrationPaused(false);

      narrationController.setRate(speechRate);
      narrationController.speak(
        textToRead,
        narrationLang,
        undefined,
        () => {
          setIsNarrating(false);
          setIsNarrationPaused(false);
        }
      );
    }
  };

  const handleStopNarration = () => {
    narrationController.stop();
    setIsNarrating(false);
    setIsNarrationPaused(false);
  };

  const handleToggleAmbientMusic = () => {
    const state = soundEngine.toggleAmbientMusic((playing) => {
      setIsAmbientMusicOn(playing);
    });
    setIsAmbientMusicOn(state);
  };

  // Extract first letter for ornamental fairy tale drop cap
  const firstChar = currentPage.narrativeText?.charAt(0) || '';
  const remainingText = currentPage.narrativeText?.slice(1) || '';

  return (
    <div className="w-full flex flex-col items-center">
      {/* Top Floating Control Bar */}
      <div className="w-full max-w-5xl mb-4 px-4 py-2.5 bg-amber-100/70 backdrop-blur-md rounded-2xl border border-amber-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3 text-sm">
        {/* Left: Book Meta & Page Indicator */}
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-800" />
          <span className="font-display font-semibold text-amber-950 truncate max-w-[200px] md:max-w-xs">
            {story.title}
          </span>
          <span className="text-amber-700/60 font-medium">·</span>
          <span className="text-xs font-medium text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded-full">
            Halaman {currentPageIndex + 1} dari {totalPages}
          </span>
        </div>

        {/* Right: Sound, Narration & Presentation Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Ambient Bedtime Music Button */}
          <button
            onClick={handleToggleAmbientMusic}
            title={isAmbientMusicOn ? 'Matikan musik dongeng' : 'Nyalakan musik dongeng'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              isAmbientMusicOn
                ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-400'
                : 'bg-white/80 text-amber-900 hover:bg-white border border-amber-200'
            }`}
          >
            <Music className={`w-3.5 h-3.5 ${isAmbientMusicOn ? 'animate-bounce' : ''}`} />
            <span className="hidden sm:inline">Musik Lullaby</span>
          </button>

          {/* Bilingual English Subtitle Toggle */}
          {currentPage.englishTranslation && (
            <button
              onClick={() => setShowEnglishTranslation(!showEnglishTranslation)}
              title="Tampilkan/Sembunyikan terjemahan bahasa Inggris"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                showEnglishTranslation
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white/80 text-indigo-900 hover:bg-white border border-indigo-200'
              }`}
            >
              <Languages className="w-3.5 h-3.5" />
              <span>Dwibahasa (EN)</span>
            </button>
          )}

          {/* Fullscreen Reading Mode */}
          {onOpenFullscreen && (
            <button
              onClick={onOpenFullscreen}
              title="Mode Layar Penuh / Dongeng Pengantar Tidur"
              className="p-1.5 rounded-xl bg-white/80 text-amber-900 hover:bg-white border border-amber-200 transition-colors cursor-pointer"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}

          {/* Print / PDF Export */}
          {onOpenPrintModal && (
            <button
              onClick={onOpenPrintModal}
              title="Cetak Buku / Simpan PDF"
              className="p-1.5 rounded-xl bg-white/80 text-amber-900 hover:bg-white border border-amber-200 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>
          )}

          {/* Edit Page */}
          {onEditPage && (
            <button
              onClick={() => onEditPage(currentPageIndex)}
              title="Edit teks halaman ini"
              className="p-1.5 rounded-xl bg-white/80 text-amber-900 hover:bg-white border border-amber-200 transition-colors cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Two-Page Realistic Storybook Spread */}
      <div className="w-full max-w-5xl bg-[#f7f2e7] rounded-3xl p-3 sm:p-5 md:p-8 book-page-shadow border border-amber-200/90 relative">
        {/* Book Central Spine Shadow & Bookmark Ribbon */}
        <div className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 bg-gradient-to-r from-stone-900/10 via-stone-900/25 to-stone-900/10 pointer-events-none z-20 rounded-sm" />

        {/* Golden Silk Bookmark Ribbon (Ornamental) */}
        <div className="hidden md:block absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-12 bg-gradient-to-b from-amber-600 to-amber-700 shadow-md rounded-b-md z-30 pointer-events-none transform -rotate-1" />

        {/* Grid Container for Left (Illustration) and Right (Story Text) Pages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 items-stretch min-h-[500px]">
          {/* LEFT PAGE: Interactive Illustration Scene */}
          <div className="paper-texture rounded-2xl p-4 sm:p-6 flex flex-col justify-between border border-amber-200/70 book-spine-right shadow-inner">
            <div className="w-full h-full flex flex-col">
              <SceneIllustration
                page={currentPage}
                artStyle={story.artStyle}
                bookTitle={story.title}
                className="flex-1"
                onImageGenerated={(imageUrl) =>
                  onUpdatePageImage && onUpdatePageImage(currentPageIndex, imageUrl)
                }
              />

              {/* Character Badge Strip */}
              {story.characters && story.characters.length > 0 && (
                <div className="mt-3 pt-3 border-t border-amber-200/60 flex items-center justify-between text-xs text-amber-900/80">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    <span className="text-[11px] font-semibold text-amber-950 uppercase tracking-wider">
                      Tokoh:
                    </span>
                    {story.characters.map((c, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100/90 border border-amber-300/60 font-sans text-xs shrink-0"
                        title={`${c.name} - ${c.role}: ${c.traits}`}
                      >
                        <span>{c.emoji}</span>
                        <span className="font-medium text-amber-950">{c.name}</span>
                      </div>
                    ))}
                  </div>

                  <span className="text-[11px] font-serif-book text-amber-700 italic hidden sm:inline">
                    Hal. {currentPage.pageNumber}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PAGE: Typeset Story Typography & Discussion Card */}
          <div className="paper-texture rounded-2xl p-5 sm:p-7 md:p-8 flex flex-col justify-between border border-amber-200/70 book-spine-left shadow-inner">
            <div className="flex flex-col">
              {/* Scene Title Kicker */}
              <div className="flex items-center justify-between pb-3 border-b border-amber-200/60 mb-4">
                <h3 className="font-display text-lg sm:text-xl font-bold text-amber-950 tracking-tight">
                  {currentPage.sceneTitle}
                </h3>
                <span className="text-xs font-serif-book text-amber-800/70 italic">
                  Bab {currentPage.pageNumber}
                </span>
              </div>

              {/* Main Narrative Text with Ornamental Drop Cap */}
              <div className="relative font-serif-book text-base sm:text-lg text-stone-800 leading-relaxed md:leading-loose">
                <span className="float-left font-display text-4xl sm:text-5xl font-bold text-amber-900 leading-none mr-2.5 mt-0.5 p-1 rounded-lg bg-amber-100/80 border border-amber-300/60 shadow-xs">
                  {firstChar}
                </span>
                <span>{remainingText}</span>
              </div>

              {/* English Bilingual Translation Box (Optional Toggle) */}
              {showEnglishTranslation && currentPage.englishTranslation && (
                <div className="mt-4 p-3.5 bg-indigo-50/70 border border-indigo-200/80 rounded-xl text-xs sm:text-sm text-indigo-950 font-sans italic leading-relaxed">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-800 mb-1">
                    <Languages className="w-3.5 h-3.5" />
                    <span>English Translation:</span>
                  </div>
                  {currentPage.englishTranslation}
                </div>
              )}

              {/* Key Dialogue Quote Box (If Present) */}
              {currentPage.dialogue && (
                <div className="mt-4 p-3 bg-amber-100/70 border-l-4 border-amber-600 rounded-r-xl font-serif-book text-sm sm:text-base text-amber-950 italic">
                  {currentPage.dialogue}
                </div>
              )}

              {/* Interactive Parent-Child Discussion & Activity Card */}
              <div className="mt-6 pt-4 border-t border-amber-200/60 space-y-2.5">
                {/* Interactive Question */}
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-amber-100/50 border border-amber-200/60 text-xs sm:text-sm text-amber-950">
                  <HelpCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-amber-900">Momen Tanya Jawab: </span>
                    <span className="font-sans text-stone-800">{currentPage.interactiveQuestion}</span>
                  </div>
                </div>

                {/* Activity Prompt */}
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/60 text-xs sm:text-sm text-emerald-950">
                  <Footprints className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-emerald-900">Aktivitas Ceria: </span>
                    <span className="font-sans text-stone-800">{currentPage.activityPrompt}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Narration Audio Controls Bar for Right Page */}
            <div className="mt-6 pt-3 border-t border-amber-200/60 flex items-center justify-between gap-2 flex-wrap">
              {/* Narration Voice Player */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Voice Persona Selector (Google Flow: Kore, Leda, Puck, Fenrir, Aoede, Charon) */}
                <button
                  onClick={() => setIsVoiceModalOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-950 text-xs font-medium border border-purple-200 cursor-pointer shadow-xs transition-colors"
                  title="Pilih Suara Pendongeng (Kore, Leda, Puck, Fenrir, Aoede, Charon)"
                >
                  <span className="text-sm">
                    {VOICE_PROFILES[activePersona]?.avatar || '🌸'}
                  </span>
                  <span className="font-semibold">
                    {VOICE_PROFILES[activePersona]?.name || 'Kore'}
                  </span>
                  <span className="text-[10px] text-purple-700 bg-purple-200/80 px-1.5 py-0.5 rounded-full font-mono">
                    eleven-v2
                  </span>
                </button>

                <button
                  onClick={handleToggleNarration}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all shadow-xs ${
                    isNarrating && !isNarrationPaused
                      ? 'bg-amber-600 text-white ring-2 ring-amber-400'
                      : 'bg-amber-100 text-amber-950 hover:bg-amber-200'
                  }`}
                >
                  {isNarrating && !isNarrationPaused ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Jeda Suara</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Bacakan Suara</span>
                    </>
                  )}
                </button>

                {/* Animated Voice Equalizer when speaking */}
                {isNarrating && !isNarrationPaused && (
                  <div
                    className="flex items-center gap-0.5 h-6 px-2 bg-amber-200/70 rounded-lg"
                    title="Suara sedang mendongeng..."
                  >
                    <span
                      className="w-1 bg-amber-800 rounded-full animate-pulse h-2"
                      style={{ animationDuration: '0.4s' }}
                    />
                    <span
                      className="w-1 bg-amber-800 rounded-full animate-pulse h-4"
                      style={{ animationDuration: '0.6s' }}
                    />
                    <span
                      className="w-1 bg-amber-800 rounded-full animate-pulse h-2.5"
                      style={{ animationDuration: '0.5s' }}
                    />
                    <span
                      className="w-1 bg-amber-800 rounded-full animate-pulse h-4"
                      style={{ animationDuration: '0.7s' }}
                    />
                  </div>
                )}

                {isNarrating && (
                  <button
                    onClick={handleStopNarration}
                    title="Hentikan pembacaan"
                    className="p-1.5 rounded-xl bg-amber-100 text-amber-900 hover:bg-amber-200 text-xs cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Voice Language Selector */}
                <div className="flex items-center bg-amber-100/80 rounded-lg p-0.5 text-[11px] font-sans">
                  <button
                    onClick={() => {
                      setNarrationLang('id');
                      handleStopNarration();
                    }}
                    className={`px-2 py-0.5 rounded-md cursor-pointer ${
                      narrationLang === 'id' ? 'bg-amber-700 text-white font-medium' : 'text-amber-900'
                    }`}
                  >
                    ID
                  </button>
                  <button
                    onClick={() => {
                      setNarrationLang('en');
                      handleStopNarration();
                    }}
                    className={`px-2 py-0.5 rounded-md cursor-pointer ${
                      narrationLang === 'en' ? 'bg-amber-700 text-white font-medium' : 'text-amber-900'
                    }`}
                  >
                    EN
                  </button>
                </div>
              </div>

              {/* Branch Story / "Pilih Jalan Cerita" CTA */}
              {onOpenBranching && (
                <button
                  onClick={() => onOpenBranching(currentPage)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-medium cursor-pointer shadow-xs transition-all active:scale-95"
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>Pilih Jalan Cerita</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Large Navigation Bar */}
      <div className="w-full max-w-5xl mt-5 px-4 flex items-center justify-between gap-4">
        {/* Previous Page Button */}
        <button
          onClick={goToPrevPage}
          disabled={currentPageIndex === 0}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-display font-medium text-sm transition-all shadow-sm ${
            currentPageIndex === 0
              ? 'opacity-40 cursor-not-allowed bg-stone-200 text-stone-500'
              : 'bg-white hover:bg-amber-100 text-amber-950 border border-amber-300 cursor-pointer active:scale-95'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Halaman Sebelumnya</span>
        </button>

        {/* Thumbnail Page Navigation Dots / Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-xs md:max-w-md">
          {story.pages.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                soundEngine.playPageTurn();
                setCurrentPageIndex(idx);
              }}
              className={`w-7 h-7 rounded-full text-xs font-display transition-all cursor-pointer flex items-center justify-center ${
                currentPageIndex === idx
                  ? 'bg-amber-700 text-white font-bold ring-2 ring-amber-400 scale-110 shadow-sm'
                  : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300/60'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        {/* Next Page Button */}
        <button
          onClick={goToNextPage}
          disabled={currentPageIndex === totalPages - 1}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-display font-medium text-sm transition-all shadow-sm ${
            currentPageIndex === totalPages - 1
              ? 'opacity-40 cursor-not-allowed bg-stone-200 text-stone-500'
              : 'bg-amber-700 hover:bg-amber-800 text-white cursor-pointer active:scale-95 shadow-md ring-2 ring-amber-400/40'
          }`}
        >
          <span>Halaman Berikutnya</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Moral Lesson Footer Card */}
      <div className="w-full max-w-5xl mt-6 p-4 bg-amber-100/60 border border-amber-200 rounded-2xl flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-amber-700 shrink-0" />
        <div className="text-xs sm:text-sm text-amber-950 font-sans">
          <span className="font-semibold text-amber-900">Pesan Budi Pekerti: </span>
          <span>{story.moralLesson}</span>
        </div>
      </div>

      {/* Voice Persona Selector Modal (Google Flow & ElevenLabs v2) */}
      <VoiceSelectorModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        activePersona={activePersona}
        onSelectPersona={(persona) => {
          setActivePersona(persona);
          narrationController.setActivePersona(persona);
        }}
      />
    </div>
  );
};
