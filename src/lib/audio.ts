class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private windGain: GainNode | null = null;
  private windSource: AudioBufferSourceNode | null = null;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.windGain && this.ctx) {
      this.windGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
    } else if (!muted && this.windGain && this.ctx) {
      this.windGain.gain.setTargetAtTime(0.04, this.ctx.currentTime, 0.2);
    }
  }

  public startWind() {
    if (this.windGain) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      // Create filtered noise buffer for procedural wind breeze
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Brown noise filter
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 3.5;
      }

      this.windSource = this.ctx.createBufferSource();
      this.windSource.buffer = buffer;
      this.windSource.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 450;
      filter.Q.value = 1.2;

      this.windGain = this.ctx.createGain();
      this.windGain.gain.value = this.isMuted ? 0 : 0.04;

      this.windSource.connect(filter);
      filter.connect(this.windGain);
      this.windGain.connect(this.ctx.destination);

      this.windSource.start();
    } catch (e) {
      console.warn('Audio wind initialization error:', e);
    }
  }

  public stopWind() {
    if (this.windSource) {
      try {
        this.windSource.stop();
        this.windSource.disconnect();
      } catch {}
      this.windSource = null;
    }
    if (this.windGain) {
      this.windGain.disconnect();
      this.windGain = null;
    }
  }

  public playRingChime(combo: number = 1) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const baseFreq = 523.25; // C5
    // Increase frequency slightly with combo
    const pitchOffset = Math.min(combo * 40, 400);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq + pitchOffset, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq + pitchOffset + 261.6, t + 0.18);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.45);
  }

  public playCollectible() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const freqs = [659.25, 880, 1046.5]; // E5, A5, C6 arpeggio

    freqs.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + i * 0.05);

      gain.gain.setValueAtTime(0.12, t + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.05 + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + i * 0.05);
      osc.stop(t + i * 0.05 + 0.25);
    });
  }

  public playCollision() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.3);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.35);
  }

  public playBoost() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(750, t + 0.4);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.5);
  }

  public playCountdownTick(isFinal: boolean = false) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = isFinal ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(isFinal ? 880 : 440, t);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + (isFinal ? 0.35 : 0.15));

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + (isFinal ? 0.35 : 0.15));
  }

  public playGameOver() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [440, 370, 311, 261];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.14);

      gain.gain.setValueAtTime(0.15, t + idx * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.14 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + idx * 0.14);
      osc.stop(t + idx * 0.14 + 0.35);
    });
  }
}

export const sound = new SoundManager();
