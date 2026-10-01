// Web Audio API sound generator for fairytale storybook experience

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMusicPlaying: boolean = false;
  private musicInterval: any = null;
  private masterGain: GainNode | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.25;
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Realistic paper turn whoosh
  playPageTurn() {
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      // White noise buffer for paper friction
      const bufferSize = this.ctx.sampleRate * 0.25;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      // Bandpass filter to sound like crisp book paper
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.frequency.exponentialRampToValueAtTime(450, now + 0.22);
      filter.Q.value = 2.5;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.25);
    } catch {
      // AudioContext maybe blocked until user gesture
    }
  }

  // Magical fairy chime
  playMagicalChime() {
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51]; // C5, E5, G5, C6, E6

      notes.forEach((freq, index) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.06);

        const startTime = now + index * 0.06;
        gain.gain.setValueAtTime(0.01, startTime);
        gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(startTime);
        osc.stop(startTime + 0.85);
      });
    } catch {
      // audio error handling
    }
  }

  // Interactive tap pop
  playTapPop() {
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.08);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // audio error handling
    }
  }

  // Ambient fairy tale music synthesizer
  toggleAmbientMusic(onStatusChange?: (playing: boolean) => void): boolean {
    this.initCtx();
    if (this.isMusicPlaying) {
      this.stopAmbientMusic();
      if (onStatusChange) onStatusChange(false);
      return false;
    } else {
      this.startAmbientMusic();
      if (onStatusChange) onStatusChange(true);
      return true;
    }
  }

  private startAmbientMusic() {
    if (!this.ctx) return;
    this.isMusicPlaying = true;

    // Soothing pentatonic scale (F Major pentatonic: F, G, A, C, D)
    const scale = [349.23, 392.0, 440.0, 523.25, 587.33, 698.46];
    let noteIndex = 0;

    const playStep = () => {
      if (!this.isMusicPlaying || !this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      // Gentle chord + harp chime
      const freq = scale[Math.floor(Math.random() * scale.length)];
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 2.5);

      noteIndex++;
    };

    playStep();
    this.musicInterval = setInterval(playStep, 1800);
  }

  stopAmbientMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  getIsMusicPlaying() {
    return this.isMusicPlaying;
  }
}

export const soundEngine = new SoundEngine();
