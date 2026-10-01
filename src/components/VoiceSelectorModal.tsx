import React, { useState } from 'react';
import { VoicePersona } from '../types';
import { VOICE_PROFILES, narrationController } from '../utils/narration';
import { soundEngine } from '../utils/soundEffects';
import { Volume2, Check, Sparkles, X, Radio } from 'lucide-react';

interface VoiceSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePersona: VoicePersona;
  onSelectPersona: (persona: VoicePersona) => void;
}

export const VoiceSelectorModal: React.FC<VoiceSelectorModalProps> = ({
  isOpen,
  onClose,
  activePersona,
  onSelectPersona,
}) => {
  const [previewingPersona, setPreviewingPersona] = useState<VoicePersona | null>(null);

  if (!isOpen) return null;

  const handlePreview = (e: React.MouseEvent, persona: VoicePersona) => {
    e.stopPropagation();
    soundEngine.playMagicalChime();
    setPreviewingPersona(persona);

    const profile = VOICE_PROFILES[persona];
    narrationController.setActivePersona(persona);
    narrationController.speak(profile.sampleSentence, 'id', undefined, () => {
      setPreviewingPersona(null);
    });
  };

  const handleSelect = (persona: VoicePersona) => {
    soundEngine.playMagicalChime();
    narrationController.stop();
    onSelectPersona(persona);
    narrationController.setActivePersona(persona);
    onClose();
  };

  const personas = Object.values(VOICE_PROFILES);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#fffefc] rounded-3xl border border-amber-300 shadow-2xl p-5 sm:p-7 my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg font-bold text-amber-950">
                  Pilih Suara Pendongeng (Google Flow)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
                  elevenlabs/eleven-multilingual-v2
                </span>
              </div>
              <p className="text-xs text-stone-600 font-sans">
                Suara bertutur alami khas Google Flow: Kore, Leda, Puck, Fenrir, Aoede & Charon
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              narrationController.stop();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Persona Cards Grid */}
        <div className="flex-1 overflow-y-auto py-4 grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans">
          {personas.map((profile) => {
            const isSelected = activePersona === profile.id;
            const isPreviewing = previewingPersona === profile.id;

            return (
              <div
                key={profile.id}
                onClick={() => handleSelect(profile.id)}
                className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-50/80 border-amber-500 shadow-md ring-2 ring-amber-300'
                    : 'bg-white hover:bg-stone-50 border-stone-200 hover:border-amber-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl bg-amber-100 shadow-xs border border-amber-200">
                        {profile.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-display font-bold text-base text-stone-900">
                            {profile.name}
                          </h4>
                          {isSelected && (
                            <span className="p-0.5 rounded-full bg-emerald-500 text-white">
                              <Check className="w-3 h-3 stroke-3" />
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-semibold text-amber-800">
                          {profile.title}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed mb-3">
                    {profile.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[10px] text-stone-400 font-mono">
                    Model: eleven-multilingual-v2
                  </span>

                  <button
                    onClick={(e) => handlePreview(e, profile.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                      isPreviewing
                        ? 'bg-purple-600 text-white animate-pulse'
                        : 'bg-stone-100 hover:bg-purple-100 text-stone-700 hover:text-purple-900'
                    }`}
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>{isPreviewing ? 'Memutar...' : 'Dengar Contoh'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-amber-200 flex items-center justify-between text-xs text-stone-600">
          <div className="flex items-center gap-1.5 text-amber-900">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Suara otomatis beralih intonasi sesuai emosi dongeng</span>
          </div>

          <button
            onClick={() => {
              narrationController.stop();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-display text-xs font-semibold cursor-pointer shadow-sm"
          >
            Gunakan Suara Ini
          </button>
        </div>
      </div>
    </div>
  );
};
