import React, { useState } from 'react';
import { StoryBook, StoryCharacter, StoryGenerationParams, TargetAge, LanguageMode } from '../types';
import { soundEngine } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  X,
  Wand2,
  Users,
  Plus,
  Trash2,
  BookOpen,
  Palette,
  Compass,
  Heart,
  Lightbulb,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface StoryGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoryGenerated: (story: StoryBook) => void;
}

export const StoryGeneratorModal: React.FC<StoryGeneratorModalProps> = ({
  isOpen,
  onClose,
  onStoryGenerated,
}) => {
  const [topic, setTopic] = useState('');
  const [language, setLanguage] = useState<LanguageMode>('id');
  const [targetAge, setTargetAge] = useState<TargetAge>('early');
  const [genre, setGenre] = useState('Fabel Hewan');
  const [artStyle, setArtStyle] = useState('Cat Air Lembut (Soft Watercolor)');
  const [moralTheme, setMoralTheme] = useState('Persahabatan & Tolong Menolong');
  const [pageCount, setPageCount] = useState<number>(6);
  const [customNotes, setCustomNotes] = useState('');

  // Custom Characters
  const [characters, setCharacters] = useState<StoryCharacter[]>([
    { name: 'Milo', role: 'Tokoh Utama', traits: 'Penuh rasa ingin tahu dan ceria', emoji: '🦊' },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);

  const loadingPhrases = [
    'Merangkai benang-benang dongeng magis...',
    'Menghidupkan karakter-karakter menggemaskan...',
    'Menggambar ilustrasi latar alam yang menawan...',
    'Menyusun pertanyaan interaktif seru untuk anak...',
    'Menyematkan pesan budi pekerti yang hangat...',
    'Sentuhan akhir pada jilid buku dongeng...',
  ];

  // Rotate loading phrases
  React.useEffect(() => {
    let timer: any;
    if (isLoading) {
      timer = setInterval(() => {
        setLoadingPhraseIndex((prev) => (prev + 1) % loadingPhrases.length);
      }, 2500);
    }
    return () => clearInterval(timer);
  }, [isLoading]);

  if (!isOpen) return null;

  const inspirationPrompts = [
    { label: 'Kancil & Robot Hutan', topic: 'Seekor kancil cerdas bertemu robot pembersih sampah yang tersesat di hutan' },
    { label: 'Kelinci Ingin Terbang', topic: 'Kelinci kecil bertelinga panjang yang bercita-cita terbang ke negeri awan bersama burung gereja' },
    { label: 'Kuas Ajaib Berkilau', topic: 'Seorang anak pemalu menemukan kuas yang bisa menghidupkan warna-warna kebaikan di desanya' },
    { label: 'Naga Takut Gelap', topic: 'Naga kecil yang takut tidur dalam gua gelap sampai seekor kunang-kunang mengajarinya bermain bayangan' },
    { label: 'Detektif Kucing Kota Apung', topic: 'Kucing belang pintar yang memecahkan misteri hilangnya lonceng emas di kota air' },
  ];

  const genres = [
    'Fabel Hewan',
    'Petualangan Fantasi',
    'Sains Fiksi Anak',
    'Cerita Rakyat Nusantara',
    'Budi Pekerti Sehari-hari',
    'Misteri Cilik',
  ];

  const artStyles = [
    'Cat Air Lembut (Soft Watercolor)',
    'Kartun 3D Clay Lucu',
    'Gambar Tangan Pensil Warna',
    'Dongeng Rakyat Klasik & Batik',
    'Studio Anime Pastel',
  ];

  const moralThemes = [
    'Persahabatan & Tolong Menolong',
    'Kejujuran & Tanggung Jawab',
    'Menghargai Perbedaan & Toleransi',
    'Keberanian Mengatasi Rasa Takut',
    'Cinta Lingkungan & Menjaga Alam',
    'Kreativitas & Kerja Keras',
  ];

  const emojiOptions = ['🦊', '🐰', '🐻', '🦁', '🦉', '🐢', '🤖', '⭐', '👧', '👦', '🎨', '🚀', '🧚'];

  const addCharacter = () => {
    if (characters.length >= 4) return;
    setCharacters((prev) => [
      ...prev,
      {
        name: `Sahabat ${prev.length + 1}`,
        role: 'Sahabat Setia',
        traits: 'Baik hati dan suka berbagi',
        emoji: emojiOptions[(prev.length + 2) % emojiOptions.length],
      },
    ]);
  };

  const removeCharacter = (index: number) => {
    if (characters.length <= 1) return;
    setCharacters((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCharacter = (index: number, field: keyof StoryCharacter, value: string) => {
    setCharacters((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setErrorMessage('Silakan masukkan topik cerita atau pilih salah satu inspirasi di atas.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    soundEngine.playMagicalChime();

    try {
      const payload: StoryGenerationParams = {
        topic,
        language,
        targetAge,
        genre,
        artStyle,
        moralTheme,
        characters,
        pageCount,
        customNotes,
      };

      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Terjadi kendala saat menghasilkan cerita.');
      }

      const generated = data.story;
      const completeStory: StoryBook = {
        id: `story-${Date.now()}`,
        title: generated.title || topic,
        tagline: generated.tagline || 'Kisah indah penuh makna',
        moralLesson: generated.moralLesson || moralTheme,
        readingTimeMinutes: generated.readingTimeMinutes || Math.ceil(pageCount * 0.8),
        targetAgeGroup: generated.targetAgeGroup || (targetAge === 'toddler' ? '2-4 Tahun' : targetAge === 'early' ? '5-7 Tahun' : '8-10 Tahun'),
        genre: generated.genre || genre,
        artStyle: generated.artStyle || artStyle,
        characters: generated.characters || characters,
        cover: generated.cover || {
          visualDescription: topic,
          sceneSetting: 'enchanted-forest',
          colorPalette: 'emerald-gold',
        },
        pages: generated.pages || [],
        createdAt: new Date().toISOString().split('T')[0],
        isCustom: true,
      };

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      soundEngine.playMagicalChime();

      onStoryGenerated(completeStory);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.message || 'Gagal memanggil AI. Pastikan server memiliki koneksi internet dan API key yang sesuai.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#fffefc] rounded-3xl border border-amber-300 shadow-2xl p-5 sm:p-7 my-8 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-amber-950">
                Buat Dongeng Baru dengan AI
              </h2>
              <p className="text-xs text-stone-600 font-sans">
                Rancang cerita bergambar interaktif lengkap dengan ilustrasi dan pesan moral
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body (Scrollable) */}
        <form onSubmit={handleGenerate} className="flex-1 overflow-y-auto pr-1 py-4 space-y-5">
          {/* Inspiration Quick Chips */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900 mb-2">
              <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
              <span>Inspirasi Ide Cerita Cepat:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {inspirationPrompts.map((item, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setTopic(item.topic)}
                  className="px-2.5 py-1 text-xs rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-all cursor-pointer text-left"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Story Topic / Premise */}
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1.5 font-sans">
              Topik / Premis Dongeng <span className="text-red-500">*</span>
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Contoh: Petualangan anak beruang yang mencari madu pelangi bersama sahabat burung hantu bijak..."
              rows={2}
              required
              className="w-full px-3.5 py-2.5 text-sm bg-white rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 font-sans"
            />
          </div>

          {/* Age Group, Language & Page Count */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                Target Usia
              </label>
              <select
                value={targetAge}
                onChange={(e) => setTargetAge(e.target.value as TargetAge)}
                className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-800 font-sans cursor-pointer"
              >
                <option value="toddler">Balita (2 - 4 Tahun)</option>
                <option value="early">Pembaca Awal (5 - 7 Tahun)</option>
                <option value="middle">Anak Madya (8 - 10 Tahun)</option>
                <option value="preteen">Pra-Remaja (11+ Tahun)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                Bahasa Cerita
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as LanguageMode)}
                className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-800 font-sans cursor-pointer"
              >
                <option value="id">Bahasa Indonesia</option>
                <option value="bilingual">Dwibahasa (ID + Subtitle EN)</option>
                <option value="en">English (Bilingual Learner)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                Jumlah Halaman
              </label>
              <select
                value={pageCount}
                onChange={(e) => setPageCount(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-800 font-sans cursor-pointer"
              >
                <option value={4}>4 Halaman (Cerita Ringkas)</option>
                <option value={6}>6 Halaman (Pas untuk Dongeng Malam)</option>
                <option value={8}>8 Halaman (Petualangan Lengkap)</option>
              </select>
            </div>
          </div>

          {/* Genre & Art Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                Genre Cerita
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-800 font-sans cursor-pointer"
              >
                {genres.map((g, i) => (
                  <option key={i} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                Gaya Ilustrasi
              </label>
              <select
                value={artStyle}
                onChange={(e) => setArtStyle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-800 font-sans cursor-pointer"
              >
                {artStyles.map((style, i) => (
                  <option key={i} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Moral Theme */}
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1">
              Pesan Moral / Nilai Budi Pekerti
            </label>
            <select
              value={moralTheme}
              onChange={(e) => setMoralTheme(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-800 font-sans cursor-pointer"
            >
              {moralThemes.map((m, i) => (
                <option key={i} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Characters Section */}
          <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-950">
                <Users className="w-3.5 h-3.5 text-amber-700" />
                <span>Karakter Tokoh ({characters.length}/4)</span>
              </div>
              {characters.length < 4 && (
                <button
                  type="button"
                  onClick={addCharacter}
                  className="flex items-center gap-1 text-[11px] font-medium text-amber-800 hover:text-amber-950 px-2 py-0.5 rounded-lg bg-amber-100 hover:bg-amber-200 transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Tambah Tokoh</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              {characters.map((char, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-white rounded-xl border border-amber-200 text-xs"
                >
                  <select
                    value={char.emoji}
                    onChange={(e) => updateCharacter(index, 'emoji', e.target.value)}
                    className="p-1 rounded-lg bg-amber-100 text-base cursor-pointer border border-amber-300"
                  >
                    {emojiOptions.map((em, i) => (
                      <option key={i} value={em}>
                        {em}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={char.name}
                    onChange={(e) => updateCharacter(index, 'name', e.target.value)}
                    placeholder="Nama tokoh"
                    className="flex-1 px-2.5 py-1 bg-amber-50/50 rounded-lg border border-amber-200 text-stone-900 font-sans focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />

                  <input
                    type="text"
                    value={char.role}
                    onChange={(e) => updateCharacter(index, 'role', e.target.value)}
                    placeholder="Peran (misal: Sahabat)"
                    className="w-24 sm:w-28 px-2 py-1 bg-amber-50/50 rounded-lg border border-amber-200 text-stone-900 font-sans focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />

                  {characters.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCharacter(index)}
                      className="p-1 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1">
              Catatan Khusus (Opsional)
            </label>
            <input
              type="text"
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="Contoh: Masukkan lelucon tentang kue wortel, sertakan nama anak 'Kenzo'..."
              className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-800 font-sans"
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
        </form>

        {/* Loading Overlay or Action Buttons */}
        <div className="pt-3 border-t border-amber-200 flex items-center justify-between gap-3">
          {isLoading ? (
            <div className="w-full py-3 flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-2 text-amber-800 font-display font-semibold text-sm">
                <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
                <span>{loadingPhrases[loadingPhraseIndex]}</span>
              </div>
              <p className="text-[11px] text-stone-500 font-sans mt-1">
                Gemini AI sedang menuliskan teks dongeng dan merancang adegan cerita...
              </p>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-stone-700 hover:text-stone-900 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
              >
                Batal
              </button>

              <button
                onClick={handleGenerate}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-display font-semibold text-sm shadow-md transition-all active:scale-95 cursor-pointer ring-2 ring-amber-400/40"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>Hasilkan Dongeng Ajaib</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
