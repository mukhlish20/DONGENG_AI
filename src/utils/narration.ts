import { VoicePersona, VoiceProfile } from '../types';

export const VOICE_PROFILES: Record<VoicePersona, VoiceProfile> = {
  Kore: {
    id: 'Kore',
    name: 'Kore',
    title: 'Ibu Pendongeng (Hangat & Lembut)',
    description:
      'Suara hangat, penuh kasih, dan menenangkan seperti pelukan ibu. Sangat cocok untuk dongeng pengantar tidur anak (bedtime story).',
    avatar: '🌸',
    gender: 'female',
    accentColor: 'from-pink-500 to-rose-400',
    pitch: 0.98,
    rate: 0.92,
    elevenVoiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel
    sampleSentence:
      'Selamat malam anakku tersayang, pejamkan matamu dan mari kita dengarkan kisah yang penuh kedamaian ini.',
  },
  Leda: {
    id: 'Leda',
    name: 'Leda',
    title: 'Petualang Cilik (Ceria & Penuh Semangat)',
    description:
      'Suara ceria, ekspresif, dan bersemangat tinggi yang mengajak anak menjelajah tempat-tempat baru penuh keajaiban.',
    avatar: '🌟',
    gender: 'female',
    accentColor: 'from-amber-400 to-orange-500',
    pitch: 1.15,
    rate: 1.02,
    elevenVoiceId: 'EXAVITQu4vr4xnSDxMaL', // Bella
    sampleSentence:
      'Wah, lihat ke depan! Ada jembatan pelangi berkilau yang membawa kita ke istana awan!',
  },
  Puck: {
    id: 'Puck',
    name: 'Puck',
    title: 'Peri Rimba (Jenaka & Menggemaskan)',
    description:
      'Suara jenaka, lincah, dan penuh kejutan gembira, sangat pas untuk karakter fabel binatang dan makhluk ajaib.',
    avatar: '🧚',
    gender: 'fairy',
    accentColor: 'from-emerald-400 to-teal-500',
    pitch: 1.28,
    rate: 1.08,
    elevenVoiceId: 'AZnzlk1XvdvUeBnXmlld', // Domi
    sampleSentence:
      'Tring! Dengan sedikit taburan serbuk peri ini, semua kuncup bunga mulai bermekaran dan menari!',
  },
  Fenrir: {
    id: 'Fenrir',
    name: 'Fenrir',
    title: 'Kakek Bijak (Gagah & Berwibawa)',
    description:
      'Suara dalam, berwibawa, dan kokoh penuh petuah budi pekerti serta kisah kepahlawanan rimba raya.',
    avatar: '🦁',
    gender: 'male',
    accentColor: 'from-amber-700 to-amber-900',
    pitch: 0.82,
    rate: 0.88,
    elevenVoiceId: 'ErXwobaYiN019PkySvjV', // Antoni
    sampleSentence:
      'Dahulu kala di rimba raya yang damai, persahabatan dan tolong menolong adalah harta paling berharga di dunia.',
  },
  Aoede: {
    id: 'Aoede',
    name: 'Aoede',
    title: 'Bidadari Kisah (Melodis & Puitis)',
    description:
      'Suara mengalun merdu bak syair lagu, membacakan dongeng dengan intonasi sastra yang memikat hati.',
    avatar: '🎵',
    gender: 'female',
    accentColor: 'from-purple-400 to-indigo-500',
    pitch: 1.08,
    rate: 0.94,
    elevenVoiceId: 'MF3mGyEYCl7XYWbV9V6O', // Elli
    sampleSentence:
      'Angin sepoi menyanyikan kidung merdu di atas danau cermin yang berkilauan bermandikan cahaya rembulan.',
  },
  Charon: {
    id: 'Charon',
    name: 'Charon',
    title: 'Penjelajah Malam (Tenang & Teduh)',
    description:
      'Suara tenang, mendalam, dan hangat untuk membuka misteri rahasia semesta dan petualangan malam hari.',
    avatar: '🌙',
    gender: 'male',
    accentColor: 'from-slate-700 to-indigo-900',
    pitch: 0.78,
    rate: 0.86,
    elevenVoiceId: 'VR6AewLTigWG4xSOukaG', // Arnold
    sampleSentence:
      'Bintang kejora bersinar terang di cakrawala malam, memandu langkah para penjelajah cilik yang pemberani.',
  },
};

export interface NarrationState {
  isPlaying: boolean;
  isPaused: boolean;
  currentWordIndex: number;
  currentSentence: string;
  activePersona: VoicePersona;
  provider: 'elevenlabs-v2' | 'web-speech-google-flow';
}

export class NarrationController {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private onStateChangeCallback: ((state: NarrationState) => void) | null = null;
  private activePersona: VoicePersona = 'Kore';
  private rate: number = 0.95;
  private availableVoices: SpeechSynthesisVoice[] = [];
  private audioCache = new Map<string, string>(); // text+persona -> audio base64 dataURI

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.availableVoices = this.synth.getVoices();
  }

  getActivePersona(): VoicePersona {
    return this.activePersona;
  }

  setActivePersona(persona: VoicePersona) {
    this.activePersona = persona;
    this.notifyState();
  }

  getActiveVoiceProfile(): VoiceProfile {
    return VOICE_PROFILES[this.activePersona] || VOICE_PROFILES.Kore;
  }

  getBestVoice(lang: 'id' | 'en' = 'id', profile: VoiceProfile): SpeechSynthesisVoice | null {
    if (this.availableVoices.length === 0) {
      this.loadVoices();
    }

    if (lang === 'id') {
      const idVoices = this.availableVoices.filter(
        (v) =>
          v.lang.startsWith('id') ||
          v.lang.includes('ID') ||
          v.name.toLowerCase().includes('indonesia')
      );

      if (idVoices.length > 0) {
        // Match gender preference if possible
        if (profile.gender === 'female') {
          const female = idVoices.find(
            (v) => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('gadis')
          );
          if (female) return female;
        } else if (profile.gender === 'male') {
          const male = idVoices.find(
            (v) => v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('pria')
          );
          if (male) return male;
        }
        return idVoices[0];
      }
    }

    // High quality natural or Google Flow voices in English
    const enVoices = this.availableVoices.filter((v) => v.lang.startsWith('en'));
    if (profile.gender === 'female') {
      const female = enVoices.find(
        (v) =>
          v.name.includes('Natural') ||
          v.name.includes('Google') ||
          v.name.includes('Samantha') ||
          v.name.includes('Jenny')
      );
      if (female) return female;
    } else {
      const male = enVoices.find(
        (v) =>
          v.name.includes('Natural') ||
          v.name.includes('Google') ||
          v.name.includes('Guy') ||
          v.name.includes('David')
      );
      if (male) return male;
    }

    return enVoices[0] || this.availableVoices[0] || null;
  }

  setRate(rate: number) {
    this.rate = Math.max(0.6, Math.min(1.5, rate));
  }

  getRate() {
    return this.rate;
  }

  async speak(
    text: string,
    lang: 'id' | 'en' = 'id',
    onWordBoundary?: (charIndex: number) => void,
    onEnd?: () => void
  ) {
    this.stop();

    const profile = this.getActiveVoiceProfile();
    const cacheKey = `${this.activePersona}_${text}`;

    // 1. Try to fetch high quality ElevenLabs audio via /api/tts route
    try {
      let audioUrl = this.audioCache.get(cacheKey);

      if (!audioUrl) {
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            voiceName: this.activePersona,
            voiceId: profile.elevenVoiceId,
            language: lang,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.audioUrl || data.dataURI) {
            audioUrl = data.audioUrl || data.dataURI;
            if (audioUrl) {
              this.audioCache.set(cacheKey, audioUrl);
            }
          }
        }
      }

      // If ElevenLabs audio URL exists, play via HTML5 Audio
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.playbackRate = this.rate;
        this.audioElement = audio;

        audio.onended = () => {
          this.audioElement = null;
          if (onEnd) onEnd();
          this.notifyState(false, false, -1, '');
        };

        audio.onerror = () => {
          this.audioElement = null;
          this.fallbackSpeechSynthesis(text, lang, profile, onWordBoundary, onEnd);
        };

        await audio.play();
        this.notifyState(true, false, 0, text, 'elevenlabs-v2');
        return;
      }
    } catch {
      // Proceed to fallback
    }

    // 2. Fallback: Google Flow Persona Speech Synthesis
    this.fallbackSpeechSynthesis(text, lang, profile, onWordBoundary, onEnd);
  }

  private fallbackSpeechSynthesis(
    text: string,
    lang: 'id' | 'en',
    profile: VoiceProfile,
    onWordBoundary?: (charIndex: number) => void,
    onEnd?: () => void
  ) {
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = this.rate * profile.rate;
    utterance.pitch = profile.pitch;

    const voice = this.getBestVoice(lang, profile);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = lang === 'id' ? 'id-ID' : 'en-US';
    }

    utterance.onboundary = (event) => {
      if (onWordBoundary) {
        onWordBoundary(event.charIndex);
      }
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
      this.notifyState(false, false, -1, '');
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis warning:', e);
      this.currentUtterance = null;
      if (onEnd) onEnd();
      this.notifyState(false, false, -1, '');
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
    this.notifyState(true, false, 0, text, 'web-speech-google-flow');
  }

  pause() {
    if (this.audioElement && !this.audioElement.paused) {
      this.audioElement.pause();
      this.notifyState(true, true);
    } else if (this.synth && this.synth.speaking) {
      this.synth.pause();
      this.notifyState(true, true);
    }
  }

  resume() {
    if (this.audioElement && this.audioElement.paused) {
      this.audioElement.play();
      this.notifyState(true, false);
    } else if (this.synth && this.synth.paused) {
      this.synth.resume();
      this.notifyState(true, false);
    }
  }

  stop() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.audioElement = null;
    }
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
    this.notifyState(false, false, -1, '');
  }

  isSpeaking(): boolean {
    if (this.audioElement) {
      return !this.audioElement.paused;
    }
    return !!(this.synth && this.synth.speaking);
  }

  isPaused(): boolean {
    if (this.audioElement) {
      return this.audioElement.paused && this.audioElement.currentTime > 0;
    }
    return !!(this.synth && this.synth.paused);
  }

  private notifyState(
    isPlaying = this.isSpeaking(),
    isPaused = this.isPaused(),
    currentWordIndex = 0,
    currentSentence = '',
    provider: 'elevenlabs-v2' | 'web-speech-google-flow' = 'web-speech-google-flow'
  ) {
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback({
        isPlaying,
        isPaused,
        currentWordIndex,
        currentSentence,
        activePersona: this.activePersona,
        provider,
      });
    }
  }

  onStateChange(cb: (state: NarrationState) => void) {
    this.onStateChangeCallback = cb;
  }
}

export const narrationController = new NarrationController();
