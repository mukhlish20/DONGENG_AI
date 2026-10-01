import React from 'react';
import { StoryBook } from '../types';
import { SceneIllustration } from './SceneIllustration';
import { Printer, X, Download, BookOpen, Sparkles } from 'lucide-react';

interface PrintBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  story: StoryBook;
}

export const PrintBookModal: React.FC<PrintBookModalProps> = ({
  isOpen,
  onClose,
  story,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-stone-100 rounded-3xl shadow-2xl p-4 sm:p-6 my-6 flex flex-col max-h-[94vh]">
        {/* Modal Controls (Hidden in Print) */}
        <div className="no-print flex items-center justify-between pb-3 mb-3 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-800" />
            <div>
              <h3 className="font-display font-bold text-amber-950 text-base sm:text-lg">
                Format Cetak Buku & Simpan PDF
              </h3>
              <p className="text-xs text-stone-600">
                Pratinjau tata letak buku fisik. Klik tombol Cetak untuk mencetak atau simpan ke PDF.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-display font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Unduh PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-stone-200 text-stone-500 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Storybook Document Layout */}
        <div className="flex-1 overflow-y-auto pr-1 bg-white p-6 sm:p-10 rounded-2xl shadow-inner border border-stone-200 space-y-12 text-stone-900">
          {/* ================= COVER PAGE ================= */}
          <div className="print-page-break flex flex-col items-center justify-between min-h-[600px] border-4 border-amber-900/40 rounded-3xl p-8 bg-amber-50/50 text-center">
            <div className="w-full">
              <span className="text-xs uppercase tracking-widest text-amber-800 font-sans font-semibold">
                Koleksi DongengAI · Seri Budi Pekerti
              </span>
              <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-amber-950 mt-3 leading-tight">
                {story.title}
              </h1>
              <p className="text-sm font-serif-book italic text-stone-700 mt-2 max-w-lg mx-auto">
                "{story.tagline}"
              </p>
            </div>

            {/* Cover Illustration */}
            <div className="w-full max-w-sm my-6 rounded-2xl overflow-hidden shadow-lg border border-amber-300">
              <SceneIllustration
                page={story.pages[0]}
                artStyle={story.artStyle}
                isCover={true}
                bookTitle={story.title}
                className="aspect-square"
              />
            </div>

            <div className="w-full pt-4 border-t border-amber-300/80 text-xs text-stone-600 flex flex-col sm:flex-row items-center justify-between gap-2 font-sans">
              <span>Pesan Moral: <strong>{story.moralLesson}</strong></span>
              <span>Diciptakan dengan DongengAI</span>
            </div>
          </div>

          {/* ================= INNER PAGES ================= */}
          {story.pages.map((page, index) => (
            <div
              key={index}
              className="print-page-break p-6 sm:p-8 border border-stone-300 rounded-2xl flex flex-col justify-between min-h-[550px] bg-[#fdfbf7]"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Left: Illustration */}
                <div className="rounded-xl overflow-hidden shadow-sm border border-stone-200">
                  <SceneIllustration
                    page={page}
                    artStyle={story.artStyle}
                    className="min-h-[280px]"
                  />
                </div>

                {/* Right: Text */}
                <div className="flex flex-col justify-center">
                  <div className="text-xs text-amber-800 font-bold uppercase tracking-wider mb-1">
                    Bab {page.pageNumber}
                  </div>
                  <h3 className="font-display text-xl font-bold text-amber-950 mb-3">
                    {page.sceneTitle}
                  </h3>

                  <p className="font-serif-book text-stone-800 text-sm sm:text-base leading-relaxed mb-4">
                    {page.narrativeText}
                  </p>

                  {page.dialogue && (
                    <div className="p-3 bg-amber-100/70 border-l-3 border-amber-700 text-xs sm:text-sm font-serif-book italic text-amber-950 mb-3">
                      {page.dialogue}
                    </div>
                  )}

                  {page.englishTranslation && (
                    <div className="text-xs text-stone-500 font-sans italic mb-3">
                      EN: {page.englishTranslation}
                    </div>
                  )}

                  <div className="mt-2 p-2.5 bg-stone-100 rounded-lg text-xs text-stone-700 font-sans">
                    <strong>Tanya & Renungkan:</strong> {page.interactiveQuestion}
                  </div>
                </div>
              </div>

              {/* Page Number Footer */}
              <div className="pt-4 mt-4 border-t border-stone-200 flex justify-between text-xs text-stone-500 font-serif-book">
                <span>{story.title}</span>
                <span>Halaman {page.pageNumber}</span>
              </div>
            </div>
          ))}

          {/* ================= BACK COVER ================= */}
          <div className="print-page-break flex flex-col items-center justify-between min-h-[500px] border-4 border-amber-900/40 rounded-3xl p-8 bg-amber-50/70 text-center">
            <div className="w-full">
              <h2 className="font-display text-2xl font-bold text-amber-950 mb-2">
                Pesan Budi Pekerti Dongeng
              </h2>
              <p className="text-sm font-serif-book text-stone-800 max-w-md mx-auto leading-relaxed">
                "{story.moralLesson}"
              </p>
            </div>

            <div className="my-6 p-4 bg-white rounded-2xl border border-amber-200 max-w-sm">
              <span className="text-xs font-semibold text-amber-900 block mb-1">
                Karakter Utama:
              </span>
              <div className="flex flex-wrap justify-center gap-2 text-xs">
                {story.characters.map((c, i) => (
                  <span key={i} className="px-2 py-0.5 bg-amber-100 rounded-full text-amber-950">
                    {c.emoji} {c.name} ({c.role})
                  </span>
                ))}
              </div>
            </div>

            <div className="text-xs text-stone-500 font-sans">
              <p>Terima kasih telah membaca bersama DongengAI.</p>
              <p className="mt-1">Hak Cipta © 2026 · Buatan Indonesia</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
