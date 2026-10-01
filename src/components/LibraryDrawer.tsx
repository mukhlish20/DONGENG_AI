import React, { useRef } from 'react';
import { StoryBook } from '../types';
import { soundEngine } from '../utils/soundEffects';
import {
  BookMarked,
  X,
  Download,
  Upload,
  Plus,
  Trash2,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface LibraryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  stories: StoryBook[];
  activeStoryId: string;
  onSelectStory: (storyId: string) => void;
  onDeleteStory: (storyId: string) => void;
  onOpenCreateModal: () => void;
  onImportStory: (importedStory: StoryBook) => void;
}

export const LibraryDrawer: React.FC<LibraryDrawerProps> = ({
  isOpen,
  onClose,
  stories,
  activeStoryId,
  onSelectStory,
  onDeleteStory,
  onOpenCreateModal,
  onImportStory,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExportStory = (story: StoryBook) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(story, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${story.title.toLowerCase().replace(/\s+/g, '-')}.dongeng.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.title && Array.isArray(json.pages)) {
          soundEngine.playMagicalChime();
          onImportStory(json);
        } else {
          alert('Format berkas dongeng tidak sesuai.');
        }
      } catch {
        alert('Gagal membaca berkas JSON.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-md bg-[#fdfbf7] h-full shadow-2xl border-l border-amber-300 p-5 sm:p-6 flex flex-col justify-between">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-amber-200">
            <div className="flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-amber-800" />
              <h3 className="font-display font-bold text-amber-950 text-lg">
                Perpustakaan Dongeng
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-amber-100 text-stone-500 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={() => {
                onClose();
                onOpenCreateModal();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-display text-xs font-semibold shadow-xs cursor-pointer transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Dongeng Baru</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              title="Unggah / Impor Dongeng JSON"
              className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>

        {/* Stories List */}
        <div className="flex-1 overflow-y-auto my-4 pr-1 space-y-3">
          {stories.map((s) => {
            const isActive = s.id === activeStoryId;
            return (
              <div
                key={s.id}
                onClick={() => {
                  soundEngine.playPageTurn();
                  onSelectStory(s.id);
                  onClose();
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between ${
                  isActive
                    ? 'bg-amber-100/90 border-amber-500 shadow-sm ring-1 ring-amber-400'
                    : 'bg-white hover:bg-amber-50/70 border-stone-200 hover:border-amber-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-display font-bold text-sm text-stone-900 group-hover:text-amber-950">
                      {s.title}
                    </h4>
                    <p className="text-[11px] text-stone-600 font-sans line-clamp-2 mt-0.5">
                      {s.tagline}
                    </p>
                  </div>
                  {s.isCustom && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium shrink-0">
                      AI Studio
                    </span>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500 font-sans">
                  <span>{s.pages.length} Halaman · {s.targetAgeGroup}</span>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleExportStory(s)}
                      title="Unduh Dongeng sebagai berkas JSON"
                      className="p-1 hover:text-amber-800 rounded hover:bg-amber-100 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    {s.isCustom && (
                      <button
                        onClick={() => {
                          if (confirm(`Hapus dongeng "${s.title}"?`)) {
                            onDeleteStory(s.id);
                          }
                        }}
                        title="Hapus dongeng ini"
                        className="p-1 hover:text-red-600 rounded hover:bg-red-50 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="pt-3 border-t border-amber-200 text-center text-xs text-stone-500 font-sans">
          <span>Semua dongeng disimpan otomatis di peramban Anda.</span>
        </div>
      </div>
    </div>
  );
};
