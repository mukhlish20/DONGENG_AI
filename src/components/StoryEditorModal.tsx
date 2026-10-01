import React, { useState } from 'react';
import { StoryBook, StoryPage, SceneSetting } from '../types';
import { soundEngine } from '../utils/soundEffects';
import {
  Edit3,
  X,
  Plus,
  Trash2,
  Save,
  Compass,
  ArrowUp,
  ArrowDown,
  Sparkles,
} from 'lucide-react';

interface StoryEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  story: StoryBook;
  initialPageIndex?: number;
  onSaveStory: (updatedStory: StoryBook) => void;
}

export const StoryEditorModal: React.FC<StoryEditorModalProps> = ({
  isOpen,
  onClose,
  story,
  initialPageIndex = 0,
  onSaveStory,
}) => {
  const [editedStory, setEditedStory] = useState<StoryBook>(() => JSON.parse(JSON.stringify(story)));
  const [selectedPageIndex, setSelectedPageIndex] = useState<number>(initialPageIndex);

  if (!isOpen) return null;

  const currentPage = editedStory.pages[selectedPageIndex] || editedStory.pages[0];

  const sceneSettings: SceneSetting[] = [
    'enchanted-forest',
    'starry-sky',
    'underwater-coral',
    'village-morning',
    'cozy-bedroom',
    'cloud-kingdom',
    'mountain-river',
    'futuristic-city',
    'magical-library',
    'sunny-meadow',
  ];

  const handleUpdatePage = (field: keyof StoryPage, value: any) => {
    setEditedStory((prev) => {
      const newPages = [...prev.pages];
      newPages[selectedPageIndex] = {
        ...newPages[selectedPageIndex],
        [field]: value,
      };
      return { ...prev, pages: newPages };
    });
  };

  const handleAddPage = () => {
    const newPageNum = editedStory.pages.length + 1;
    const newPage: StoryPage = {
      pageNumber: newPageNum,
      sceneTitle: `Babak Baru ${newPageNum}`,
      narrativeText: 'Tuliskan petualangan seru tokoh-tokohmu di sini...',
      englishTranslation: '',
      dialogue: '"Kita pasti bisa melakukannya!"',
      interactiveQuestion: 'Apa yang akan kamu lakukan selanjutnya?',
      activityPrompt: 'Tersenyumlah dan tepuk tangan sekali!',
      sceneSetting: 'enchanted-forest',
      colorPalette: 'emerald-gold',
      illustrationPrompt: 'Pemandangan indah penuh warna',
    };

    setEditedStory((prev) => ({
      ...prev,
      pages: [...prev.pages, newPage],
    }));
    setSelectedPageIndex(editedStory.pages.length);
  };

  const handleDeletePage = (index: number) => {
    if (editedStory.pages.length <= 1) return;
    setEditedStory((prev) => {
      const filtered = prev.pages.filter((_, i) => i !== index);
      // Re-number
      const renumbered = filtered.map((p, i) => ({ ...p, pageNumber: i + 1 }));
      return { ...prev, pages: renumbered };
    });
    setSelectedPageIndex(Math.max(0, index - 1));
  };

  const handleSave = () => {
    soundEngine.playMagicalChime();
    onSaveStory(editedStory);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#fffefc] rounded-3xl border border-amber-300 shadow-2xl p-5 sm:p-7 my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-200">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-amber-950">
                Studio Edit Dongeng
              </h3>
              <p className="text-xs text-stone-600">
                Ubah teks cerita, dialog, latar adegan, atau tambahkan halaman baru
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area with Page Tabs & Editor Form */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* Global Story Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-amber-50/60 rounded-2xl border border-amber-200/80">
            <div>
              <label className="block text-[11px] font-semibold text-stone-800 mb-1 font-sans">
                Judul Buku
              </label>
              <input
                type="text"
                value={editedStory.title}
                onChange={(e) => setEditedStory((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-1.5 text-xs bg-white rounded-lg border border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-500 font-display font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-800 mb-1 font-sans">
                Pesan Moral Utama
              </label>
              <input
                type="text"
                value={editedStory.moralLesson}
                onChange={(e) =>
                  setEditedStory((prev) => ({ ...prev, moralLesson: e.target.value }))
                }
                className="w-full px-3 py-1.5 text-xs bg-white rounded-lg border border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
              />
            </div>
          </div>

          {/* Page Tabs Strip */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
            <div className="flex items-center gap-1.5">
              {editedStory.pages.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedPageIndex(idx)}
                  className={`px-3 py-1 rounded-xl text-xs font-display font-medium transition-all cursor-pointer ${
                    selectedPageIndex === idx
                      ? 'bg-amber-700 text-white shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                  }`}
                >
                  Hal {p.pageNumber}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddPage}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-xl transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Hal</span>
            </button>
          </div>

          {/* Selected Page Form */}
          {currentPage && (
            <div className="space-y-3 p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-amber-950 text-sm">
                  Mengedit Halaman {currentPage.pageNumber}
                </span>

                {editedStory.pages.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeletePage(selectedPageIndex)}
                    className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 p-1 rounded-lg hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Halaman</span>
                  </button>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-800 mb-1">
                  Judul Bab / Adegan
                </label>
                <input
                  type="text"
                  value={currentPage.sceneTitle}
                  onChange={(e) => handleUpdatePage('sceneTitle', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-amber-50/30 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-800 mb-1">
                  Teks Narasi Dongeng
                </label>
                <textarea
                  rows={4}
                  value={currentPage.narrativeText}
                  onChange={(e) => handleUpdatePage('narrativeText', e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-amber-50/30 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-500 font-serif-book leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-800 mb-1">
                    Terjemahan Bahasa Inggris (Opsional)
                  </label>
                  <textarea
                    rows={2}
                    value={currentPage.englishTranslation || ''}
                    onChange={(e) => handleUpdatePage('englishTranslation', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-stone-50 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-800 mb-1">
                    Dialog Karakter
                  </label>
                  <textarea
                    rows={2}
                    value={currentPage.dialogue || ''}
                    onChange={(e) => handleUpdatePage('dialogue', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-stone-50 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-800 mb-1">
                    Pertanyaan Interaktif
                  </label>
                  <input
                    type="text"
                    value={currentPage.interactiveQuestion}
                    onChange={(e) => handleUpdatePage('interactiveQuestion', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-stone-50 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-800 mb-1">
                    Aktivitas Ceria
                  </label>
                  <input
                    type="text"
                    value={currentPage.activityPrompt}
                    onChange={(e) => handleUpdatePage('activityPrompt', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-stone-50 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                  />
                </div>
              </div>

              {/* Scene Setting */}
              <div>
                <label className="block text-[11px] font-semibold text-stone-800 mb-1">
                  Latar Visual Adegan
                </label>
                <select
                  value={currentPage.sceneSetting}
                  onChange={(e) => handleUpdatePage('sceneSetting', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-stone-50 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans cursor-pointer capitalize"
                >
                  {sceneSettings.map((s, i) => (
                    <option key={i} value={s}>
                      {s.replace('-', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-amber-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-xl hover:bg-stone-100 cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-display text-xs font-semibold shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
