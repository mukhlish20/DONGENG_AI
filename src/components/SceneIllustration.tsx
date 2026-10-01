import React, { useState } from 'react';
import { StoryPage } from '../types';
import { soundEngine } from '../utils/soundEffects';
import { Sparkles, Compass, Image as ImageIcon, Loader2, RefreshCw } from 'lucide-react';

interface SceneIllustrationProps {
  page: StoryPage;
  artStyle?: string;
  isCover?: boolean;
  bookTitle?: string;
  className?: string;
  onImageGenerated?: (imageUrl: string) => void;
}

export const SceneIllustration: React.FC<SceneIllustrationProps> = ({
  page,
  artStyle = 'watercolor',
  isCover = false,
  bookTitle,
  className = '',
  onImageGenerated,
}) => {
  const [interactiveCount, setInteractiveCount] = useState(0);
  const [bouncedIndex, setBouncedIndex] = useState<number | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const handleInteractiveTap = (index: number) => {
    soundEngine.playMagicalChime();
    setInteractiveCount((prev) => prev + 1);
    setBouncedIndex(index);
    setTimeout(() => setBouncedIndex(null), 800);
  };

  const handleGenerateFluxImage = async () => {
    setIsGeneratingImage(true);
    setGenerationError(null);
    soundEngine.playMagicalChime();

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `${page.illustrationPrompt}, children book illustration in ${artStyle} style, detailed background of ${page.sceneSetting}`,
          sceneSetting: page.sceneSetting,
          pageNumber: page.pageNumber,
        }),
      });

      const data = await response.json();
      if (data.imageUrl && onImageGenerated) {
        onImageGenerated(data.imageUrl);
        soundEngine.playMagicalChime();
      } else if (!data.imageUrl) {
        setGenerationError('Ilustrasi Flux AI belum tersedia dari worker saat ini.');
      }
    } catch (err: any) {
      console.log('Informasi status render ilustrasi:', err?.message);
      setGenerationError(err?.message || 'Gagal memanggil model Flux AI.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const setting = page.sceneSetting || 'enchanted-forest';

  // Palette gradients and atmospheric mood
  const getBackgroundTheme = () => {
    switch (setting) {
      case 'starry-sky':
        return {
          sky: 'from-slate-950 via-indigo-950 to-purple-900',
          ground: 'from-purple-900/60 to-indigo-950',
          accent: 'text-amber-300',
          elements: ['⭐', '🌙', '✨', '🪐', '💫'],
        };
      case 'underwater-coral':
        return {
          sky: 'from-sky-900 via-teal-900 to-cyan-950',
          ground: 'from-teal-800 to-emerald-950',
          accent: 'text-cyan-300',
          elements: ['🐠', '🐡', '🐚', '🪸', '🫧'],
        };
      case 'village-morning':
        return {
          sky: 'from-amber-100 via-orange-100 to-sky-200',
          ground: 'from-emerald-600 to-emerald-800',
          accent: 'text-amber-700',
          elements: ['🏡', '🌻', '🌾', '🦋', '☀️'],
        };
      case 'cozy-bedroom':
        return {
          sky: 'from-indigo-950 via-slate-900 to-amber-950/40',
          ground: 'from-amber-900/80 to-stone-900',
          accent: 'text-amber-200',
          elements: ['🕯️', '🧸', '🛏️', '✨', '📖'],
        };
      case 'cloud-kingdom':
        return {
          sky: 'from-sky-300 via-pink-200 to-indigo-200',
          ground: 'from-white/90 to-purple-100',
          accent: 'text-pink-600',
          elements: ['☁️', '🌈', '🏰', '🕊️', '✨'],
        };
      case 'mountain-river':
        return {
          sky: 'from-sky-200 via-cyan-100 to-emerald-100',
          ground: 'from-emerald-700 to-teal-900',
          accent: 'text-emerald-700',
          elements: ['🏔️', '🌲', '🐟', '💧', '🛶'],
        };
      case 'futuristic-city':
        return {
          sky: 'from-slate-950 via-purple-950 to-cyan-950',
          ground: 'from-cyan-900 to-slate-900',
          accent: 'text-cyan-300',
          elements: ['🚀', '🛸', '🤖', '⚡', '🏙️'],
        };
      case 'magical-library':
        return {
          sky: 'from-amber-950 via-stone-900 to-indigo-950',
          ground: 'from-amber-900 to-yellow-950',
          accent: 'text-amber-400',
          elements: ['📜', '🔮', '📚', '🕯️', '🦉'],
        };
      case 'sunny-meadow':
        return {
          sky: 'from-sky-300 via-amber-100 to-emerald-200',
          ground: 'from-lime-500 to-emerald-700',
          accent: 'text-amber-600',
          elements: ['🌼', '🐝', '🌿', '🍄', '🐞'],
        };
      case 'enchanted-forest':
      default:
        return {
          sky: 'from-emerald-950 via-teal-950 to-green-900',
          ground: 'from-green-900 to-emerald-950',
          accent: 'text-emerald-300',
          elements: ['🌲', '🍄', '🦌', '✨', '🌿'],
        };
    }
  };

  const theme = getBackgroundTheme();

  return (
    <div
      className={`relative w-full h-full min-h-[340px] md:min-h-[460px] rounded-2xl overflow-hidden shadow-inner flex flex-col justify-between p-5 select-none bg-gradient-to-b ${theme.sky} ${className}`}
    >
      {/* If real Flux AI image is available, render as full scene background */}
      {page.imageUrl && (
        <>
          <img
            src={page.imageUrl}
            alt={page.illustrationPrompt}
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
          {/* Subtle vignette scrim so controls remain crystal clear */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/50 z-1 pointer-events-none" />
        </>
      )}

      {/* Decorative Texture / Canvas Wash (when no custom image) */}
      {!page.imageUrl && (
        <>
          <div className="absolute inset-0 opacity-25 mix-blend-overlay pointer-events-none bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.4)_0%,transparent_70%)]" />
          <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-white/15 blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 -left-12 w-48 h-48 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />

          {/* Floating Animated Ambient Particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white/40 blur-[1px] animate-pulse"
                style={{
                  width: `${(i % 3) * 3 + 3}px`,
                  height: `${(i % 3) * 3 + 3}px`,
                  top: `${(i * 17 + 10) % 85}%`,
                  left: `${(i * 23 + 15) % 85}%`,
                  animationDuration: `${2.5 + i * 0.8}s`,
                  animationDelay: `${i * 0.4}s`,
                }}
              />
            ))}
          </div>
        </>
      )}

      {/* Top Header Bar on Illustration */}
      <div className="relative z-10 flex items-center justify-between text-xs text-white/90 font-sans tracking-wide">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-black/45 backdrop-blur-md rounded-full border border-white/15 shadow-xs">
          <Compass className="w-3.5 h-3.5 text-amber-300" />
          <span className="capitalize font-medium text-amber-100">
            {setting.replace('-', ' ')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Flux AI Render Button */}
          {onImageGenerated && (
            <button
              onClick={handleGenerateFluxImage}
              disabled={isGeneratingImage}
              title="Render adegan ini menggunakan Cloudflare Flux AI (@cf/black-forest-labs/flux-2-klein-9b)"
              className="flex items-center gap-1 px-2.5 py-1 bg-orange-600/80 hover:bg-orange-600 backdrop-blur-md rounded-full text-white text-[11px] font-medium transition-all active:scale-95 cursor-pointer shadow-xs border border-orange-400/40"
            >
              {isGeneratingImage ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Melukis...</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-3 h-3 text-orange-200" />
                  <span>{page.imageUrl ? 'Lukis Ulang Flux' : 'Lukis Flux AI'}</span>
                </>
              )}
            </button>
          )}

          {/* Interactive Tap Magic */}
          <button
            onClick={() => handleInteractiveTap(99)}
            title="Ketuk untuk kilauan ajaib!"
            className="flex items-center gap-1 px-2 py-1 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-transform active:scale-95 cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3 h-3 text-yellow-300 animate-spin" style={{ animationDuration: '6s' }} />
          </button>
        </div>
      </div>

      {/* Middle Interactive Composition (or Centered Prompt when Image Present) */}
      <div className="relative z-10 my-auto flex flex-col items-center justify-center text-center py-4">
        {!page.imageUrl ? (
          <div className="relative w-full max-w-[280px] md:max-w-[340px] aspect-[4/3] flex items-center justify-center">
            {/* Backdrop Circular Frame */}
            <div className="absolute inset-0 m-auto w-48 h-48 md:w-60 md:h-60 rounded-full bg-white/10 backdrop-blur-xs border border-white/20 shadow-2xl flex items-center justify-center overflow-hidden transition-all duration-700">
              <div className={`absolute -bottom-6 -left-6 -right-6 h-28 rounded-t-[100%] bg-gradient-to-t ${theme.ground} opacity-90`} />
              <div className="absolute bottom-2 -left-2 -right-2 h-14 rounded-t-[80%] bg-black/25 opacity-70" />
              <div className="absolute inset-0 bg-radial from-amber-200/20 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Interactive Theme Emojis */}
            <div className="relative z-20 flex items-center justify-center gap-4 md:gap-6 flex-wrap px-4">
              {theme.elements.map((emoji, idx) => (
                <button
                  key={idx}
                  onClick={() => handleInteractiveTap(idx)}
                  className={`transform transition-all duration-300 hover:scale-125 cursor-pointer select-none ${
                    bouncedIndex === idx ? 'scale-150 animate-bounce' : ''
                  } ${idx === 2 ? 'text-5xl md:text-6xl drop-shadow-xl' : 'text-3xl md:text-4xl drop-shadow-md'}`}
                  title="Ketuk untuk mendengar suara ajaib!"
                  style={{
                    transform: `translateY(${Math.sin(idx * 1.5 + interactiveCount * 0.4) * 8}px)`,
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-end">
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-xs text-orange-200 border border-orange-400/30">
              Dilukis oleh @cf/black-forest-labs/flux-2-klein-9b
            </span>
          </div>
        )}

        {/* Scene Prompt Subtext */}
        {isCover ? (
          <div className="mt-4 px-4 py-2 bg-black/50 backdrop-blur-md rounded-xl border border-white/15 max-w-xs">
            <h4 className="text-sm font-display font-semibold text-white tracking-wide">
              {bookTitle || 'Dongeng Istimewa'}
            </h4>
            <p className="text-[11px] text-amber-200/90 mt-0.5 line-clamp-2">
              {page.illustrationPrompt}
            </p>
          </div>
        ) : (
          <div className="mt-2 px-3 py-1.5 bg-black/45 backdrop-blur-xs rounded-lg border border-white/10 max-w-[280px]">
            <p className="text-[11px] text-stone-200 italic line-clamp-2">
              "{page.illustrationPrompt}"
            </p>
          </div>
        )}

        {generationError && (
          <div className="mt-2 text-[10px] text-amber-200 bg-black/60 px-2 py-1 rounded">
            {generationError}
          </div>
        )}
      </div>

      {/* Bottom Footer Info */}
      <div className="relative z-10 flex items-center justify-between text-[11px] text-white/80">
        <span className="font-sans px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-xs border border-white/10">
          Gaya: {artStyle}
        </span>
        <span className="font-serif-book italic text-amber-200/90 drop-shadow-sm">
          {page.sceneTitle}
        </span>
      </div>
    </div>
  );
};
