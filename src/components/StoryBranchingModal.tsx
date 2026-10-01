import React, { useState } from 'react';
import { StoryBook, StoryPage } from '../types';
import { soundEngine } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import { GitBranch, Sparkles, X, Compass, Loader2, ArrowRight } from 'lucide-react';

interface StoryBranchingModalProps {
  isOpen: boolean;
  onClose: () => void;
  story: StoryBook;
  currentPage: StoryPage;
  onAppendBranchPage: (newPage: StoryPage) => void;
}

export const StoryBranchingModal: React.FC<StoryBranchingModalProps> = ({
  isOpen,
  onClose,
  story,
  currentPage,
  onAppendBranchPage,
}) => {
  const [customChoice, setCustomChoice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Suggested whimsical branches based on scene
  const suggestedBranches = [
    {
      title: 'Menyelidiki Cahaya Aneh',
      description: 'Mendekati sumber cahaya misterius yang berkedip di balik pepohonan purba.',
    },
    {
      title: 'Meminta Bantuan Sahabat',
      description: 'Meniup peluit daun untuk memanggil kawan-kawan satwa berkumpul.',
    },
    {
      title: 'Membuka Peti Rahasia Kuno',
      description: 'Membuka kotak berukir lumut yang tersembunyi di bawah akar pohon.',
    },
  ];

  const handleBranchSelect = async (chosenText: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    soundEngine.playMagicalChime();

    try {
      const response = await fetch('/api/branch-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyTitle: story.title,
          previousPages: `Bab ${currentPage.pageNumber}: ${currentPage.sceneTitle}. ${currentPage.narrativeText}`,
          chosenDirection: chosenText,
          language: 'id',
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Gagal merangkai cabang cerita.');
      }

      const branch = data.branch;
      const newPage: StoryPage = {
        pageNumber: story.pages.length + 1,
        sceneTitle: branch.sceneTitle || 'Babak Baru Pilihanmu',
        narrativeText: branch.narrativeText || `Sesuai pilihanmu: ${chosenText}...`,
        englishTranslation: branch.englishTranslation || '',
        dialogue: branch.dialogue || '',
        interactiveQuestion: branch.interactiveQuestion || 'Bagaimana kelanjutan petualangan yang kamu bayangkan?',
        activityPrompt: 'Tarik napas lega dan sambut babak baru petualanganmu!',
        sceneSetting: branch.sceneSetting || currentPage.sceneSetting,
        colorPalette: branch.colorPalette || currentPage.colorPalette,
        illustrationPrompt: branch.illustrationPrompt || `Adegan: ${chosenText}`,
      };

      confetti({ particleCount: 50, spread: 60 });
      soundEngine.playMagicalChime();

      onAppendBranchPage(newPage);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Terjadi kendala saat merangkai cabang cerita.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-[#fffefc] rounded-3xl border border-emerald-300 shadow-2xl p-5 sm:p-7 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-emerald-950">
                Pilih Jalan Ceritamu Sendiri!
              </h3>
              <p className="text-xs text-stone-600">
                Tentukan apa yang terjadi selanjutnya di Halaman {currentPage.pageNumber + 1}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Context */}
        <div className="my-4 p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-950 font-serif-book italic">
          <span className="font-semibold not-italic text-amber-900 block mb-0.5">
            Adegan Saat Ini (Hal. {currentPage.pageNumber}):
          </span>
          "{currentPage.narrativeText.slice(0, 140)}..."
        </div>

        {/* Suggested Branches */}
        <div className="space-y-2 mb-4">
          <span className="text-xs font-semibold text-stone-800 block font-sans">
            Pilih Salah Satu Arah Petualangan:
          </span>
          {suggestedBranches.map((branch, idx) => (
            <button
              key={idx}
              disabled={isLoading}
              onClick={() => handleBranchSelect(`${branch.title}: ${branch.description}`)}
              className="w-full text-left p-3 rounded-xl border border-stone-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/50 transition-all cursor-pointer group flex items-center justify-between gap-3 shadow-2xs active:scale-[0.99]"
            >
              <div>
                <h4 className="font-display text-xs sm:text-sm font-semibold text-stone-900 group-hover:text-emerald-900">
                  {branch.title}
                </h4>
                <p className="text-[11px] text-stone-500 group-hover:text-emerald-700/80 font-sans mt-0.5">
                  {branch.description}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-600 shrink-0 transform group-hover:translate-x-1 transition-transform" />
            </button>
          ))}
        </div>

        {/* Custom Custom Choice */}
        <div className="pt-2 border-t border-stone-200">
          <label className="block text-xs font-semibold text-stone-800 mb-1.5 font-sans">
            Atau Tuliskan Imajinasimu Sendiri:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customChoice}
              onChange={(e) => setCustomChoice(e.target.value)}
              placeholder="Contoh: Milo menemukan sayap kupu-kupu emas di atas pohon..."
              disabled={isLoading}
              className="flex-1 px-3 py-2 text-xs bg-white rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-stone-900 font-sans"
            />
            <button
              type="button"
              disabled={isLoading || !customChoice.trim()}
              onClick={() => handleBranchSelect(customChoice)}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-display text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              Lanjutkan
            </button>
          </div>
        </div>

        {errorMessage && (
          <p className="mt-3 text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
            {errorMessage}
          </p>
        )}

        {/* Loading state indicator */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20">
            <Loader2 className="w-7 h-7 text-emerald-600 animate-spin mb-2" />
            <h4 className="font-display font-semibold text-emerald-950 text-sm">
              Menenun Babak Cerita Baru...
            </h4>
            <p className="text-xs text-stone-600 font-sans mt-0.5">
              Gemini AI sedang menuliskan petualangan berdasarkan pilihanmu!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
