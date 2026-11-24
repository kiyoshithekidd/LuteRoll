import type { KeyboardVoiceId, RelicRarity } from '../../shared/api';
import { midiToFrequency } from '../../shared/melodyGenerator';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private busInput: GainNode | null = null;
  private muted = false;
  private voice: KeyboardVoiceId = 'grand_piano';
  private lastDiceHitMs = 0;

  constructor() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden && this.ctx && this.ctx.state === 'running') {
          void this.ctx.suspend();
        }
      });
    }
  }

  private ensureContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
      this.setupTavernRoomBus(this.ctx);
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Subtle wooden-tavern slapback room warmth + gentle limiter so voices feel rich, not sterile.
   */
  private setupTavernRoomBus(ctx: AudioContext): void {
    const input = ctx.createGain();
    input.gain.setValueAtTime(0.95, ctx.currentTime);

    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-12, ctx.currentTime);
    compressor.ratio.setValueAtTime(3.5, ctx.currentTime);

    // Dry path
    input.connect(compressor);

    // Subtle warm room reflection (two short taps)
    const delayA = ctx.createDelay(0.25);
    delayA.delayTime.setValueAtTime(0.068, ctx.currentTime);
    const delayB = ctx.createDelay(0.25);
    delayB.delayTime.setValueAtTime(0.118, ctx.currentTime);

    const roomFilter = ctx.createBiquadFilter();
    roomFilter.type = 'lowpass';
    roomFilter.frequency.setValueAtTime(1650, ctx.currentTime);

    const wetGain = ctx.createGain();
    wetGain.gain.setValueAtTime(0.16, ctx.currentTime);

    input.connect(delayA);
    input.connect(delayB);
    delayA.connect(roomFilter);
    delayB.connect(roomFilter);
    roomFilter.connect(wetGain);
    wetGain.connect(compressor);

    compressor.connect(ctx.destination);
    this.busInput = input;
  }

  private getDestination(ctx: AudioContext): AudioNode {
    return this.busInput ?? ctx.destination;
  }

  public unlock(): void {
    this.ensureContext();
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(mute: boolean): void {
    this.muted = mute;
    if (mute && this.ctx && this.ctx.state === 'running') {
      void this.ctx.suspend();
    } else if (!mute && this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
  }

  public setVoice(voice: KeyboardVoiceId): void {
    this.voice = voice;
  }

  public getVoice(): KeyboardVoiceId {
    return this.voice;
  }

  /**
   * Synthesizes a note using the selected voice or an explicit voiceOverride (fixes B5 preview race).
   */
  public playNote(
    midi: number,
    durationMs = 420,
    voiceOverride?: KeyboardVoiceId
  ): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const activeVoice = voiceOverride ?? this.voice;
    const now = ctx.currentTime;
    const dur = Math.max(0.18, durationMs / 1000);
    const freq = midiToFrequency(midi);
    const dest = this.getDestination(ctx);

    const masterGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const osc2Gain = ctx.createGain();

    switch (activeVoice) {
      case 'tavern_lute': {
        // Warm plucked acoustic lute: crisp string attack + wooden soundboard resonance
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(freq, now);
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(freq * 2, now);
        osc2Gain.gain.setValueAtTime(0.28, now);
        osc2Gain.gain.exponentialRampToValueAtTime(0.015, now + 0.16);
        filter.frequency.setValueAtTime(Math.min(5800, freq * 8.5), now);
        filter.frequency.exponentialRampToValueAtTime(
          Math.max(460, freq * 1.9),
          now + Math.min(0.24, dur * 0.7)
        );
        filter.Q.setValueAtTime(1.6, now);
        masterGain.gain.setValueAtTime(0.001, now);
        masterGain.gain.linearRampToValueAtTime(0.32, now + 0.005);
        masterGain.gain.exponentialRampToValueAtTime(0.09, now + 0.14);
        masterGain.gain.exponentialRampToValueAtTime(0.0008, now + dur + 0.2);
        break;
      }
      case 'harpsichord': {
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(freq, now);
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(freq * 2, now);
        osc2Gain.gain.setValueAtTime(0.24, now);
        filter.frequency.setValueAtTime(Math.min(6200, freq * 8), now);
        filter.frequency.exponentialRampToValueAtTime(
          Math.max(700, freq * 2.5),
          now + dur * 0.65
        );
        masterGain.gain.setValueAtTime(0.001, now);
        masterGain.gain.linearRampToValueAtTime(0.24, now + 0.006);
        masterGain.gain.exponentialRampToValueAtTime(0.0008, now + dur * 0.9);
        break;
      }
      case 'electric_piano': {
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(freq, now);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 3, now);
        osc2Gain.gain.setValueAtTime(0.22, now);
        osc2Gain.gain.exponentialRampToValueAtTime(0.02, now + 0.14);
        filter.frequency.setValueAtTime(5000, now);
        masterGain.gain.setValueAtTime(0.001, now);
        masterGain.gain.linearRampToValueAtTime(0.3, now + 0.01);
        masterGain.gain.exponentialRampToValueAtTime(0.08, now + dur * 0.5);
        masterGain.gain.exponentialRampToValueAtTime(0.0008, now + dur + 0.16);
        break;
      }
      case 'cathedral_organ': {
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(freq, now);
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(freq * 2, now);
        osc2Gain.gain.setValueAtTime(0.16, now);
        filter.frequency.setValueAtTime(Math.min(3600, freq * 4.5), now);
        masterGain.gain.setValueAtTime(0.001, now);
        masterGain.gain.linearRampToValueAtTime(0.24, now + 0.03);
        masterGain.gain.setValueAtTime(0.22, now + dur * 0.8);
        masterGain.gain.exponentialRampToValueAtTime(0.0008, now + dur + 0.12);
        break;
      }
      case 'arcane_synth': {
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(freq, now);
        osc1.detune.setValueAtTime(-7, now);
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(freq, now);
        osc2.detune.setValueAtTime(7, now);
        osc2Gain.gain.setValueAtTime(0.5, now);
        filter.frequency.setValueAtTime(Math.min(5400, freq * 7), now);
        filter.frequency.exponentialRampToValueAtTime(
          Math.max(450, freq * 2.2),
          now + dur
        );
        masterGain.gain.setValueAtTime(0.001, now);
        masterGain.gain.linearRampToValueAtTime(0.2, now + 0.018);
        masterGain.gain.exponentialRampToValueAtTime(0.0008, now + dur + 0.16);
        break;
      }
      case 'celesta': {
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(freq, now);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 4, now);
        osc2Gain.gain.setValueAtTime(0.14, now);
        osc2Gain.gain.exponentialRampToValueAtTime(0.005, now + 0.18);
        filter.frequency.setValueAtTime(7000, now);
        masterGain.gain.setValueAtTime(0.001, now);
        masterGain.gain.linearRampToValueAtTime(0.28, now + 0.008);
        masterGain.gain.exponentialRampToValueAtTime(0.0008, now + dur + 0.22);
        break;
      }
      case 'honky_tonk': {
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(freq, now);
        osc1.detune.setValueAtTime(-11, now);
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(freq, now);
        osc2.detune.setValueAtTime(11, now);
        osc2Gain.gain.setValueAtTime(0.85, now);
        filter.frequency.setValueAtTime(Math.min(5200, freq * 6.5), now);
        filter.frequency.exponentialRampToValueAtTime(
          Math.max(500, freq * 2.4),
          now + dur
        );
        masterGain.gain.setValueAtTime(0.001, now);
        masterGain.gain.linearRampToValueAtTime(0.26, now + 0.01);
        masterGain.gain.exponentialRampToValueAtTime(0.0008, now + dur + 0.14);
        break;
      }
      case 'music_box': {
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(freq * 2, now);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 4, now);
        osc2Gain.gain.setValueAtTime(0.18, now);
        osc2Gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        filter.frequency.setValueAtTime(7500, now);
        masterGain.gain.setValueAtTime(0.001, now);
        masterGain.gain.linearRampToValueAtTime(0.24, now + 0.005);
        masterGain.gain.exponentialRampToValueAtTime(0.0008, now + dur + 0.2);
        break;
      }
      case 'clavinet': {
        osc1.type = 'square';
        osc1.frequency.setValueAtTime(freq, now);
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(freq, now);
        osc2Gain.gain.setValueAtTime(0.35, now);
        filter.frequency.setValueAtTime(Math.min(5800, freq * 7), now);
        filter.frequency.exponentialRampToValueAtTime(
          Math.max(420, freq * 1.8),
          now + dur * 0.55
        );
        masterGain.gain.setValueAtTime(0.001, now);
        masterGain.gain.linearRampToValueAtTime(0.2, now + 0.006);
        masterGain.gain.exponentialRampToValueAtTime(0.0008, now + dur * 0.85);
        break;
      }
      case 'accordion': {
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(freq, now);
        osc1.detune.setValueAtTime(-5, now);
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(freq, now);
        osc2.detune.setValueAtTime(6, now);
        osc2Gain.gain.setValueAtTime(0.65, now);
        filter.frequency.setValueAtTime(Math.min(3400, freq * 4.2), now);
        masterGain.gain.setValueAtTime(0.001, now);
        masterGain.gain.linearRampToValueAtTime(0.22, now + 0.025);
        masterGain.gain.setValueAtTime(0.2, now + dur * 0.8);
        masterGain.gain.exponentialRampToValueAtTime(0.0008, now + dur + 0.12);
        break;
      }
      case 'bell_organ': {
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(freq, now);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 2.5, now);
        osc2Gain.gain.setValueAtTime(0.26, now);
        filter.frequency.setValueAtTime(6400, now);
        masterGain.gain.setValueAtTime(0.001, now);
        masterGain.gain.linearRampToValueAtTime(0.28, now + 0.01);
        masterGain.gain.exponentialRampToValueAtTime(0.0008, now + dur + 0.24);
        break;
      }
      case 'astral_grand': {
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(freq, now);
        osc1.detune.setValueAtTime(-4, now);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 2, now);
        osc2.detune.setValueAtTime(4, now);
        osc2Gain.gain.setValueAtTime(0.28, now);
        filter.frequency.setValueAtTime(Math.min(6000, freq * 7), now);
        filter.frequency.exponentialRampToValueAtTime(
          Math.max(500, freq * 2.5),
          now + dur
        );
        masterGain.gain.setValueAtTime(0.001, now);
        masterGain.gain.linearRampToValueAtTime(0.3, now + 0.012);
        masterGain.gain.exponentialRampToValueAtTime(0.09, now + dur * 0.55);
        masterGain.gain.exponentialRampToValueAtTime(0.0008, now + dur + 0.22);
        break;
      }
      case 'grand_piano':
      default: {
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(freq, now);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 2, now);
        osc2Gain.gain.setValueAtTime(0.18, now);
        filter.frequency.setValueAtTime(Math.min(4800, freq * 6), now);
        filter.frequency.exponentialRampToValueAtTime(
          Math.max(400, freq * 2.1),
          now + dur
        );
        masterGain.gain.setValueAtTime(0.001, now);
        masterGain.gain.linearRampToValueAtTime(0.28, now + 0.012);
        masterGain.gain.exponentialRampToValueAtTime(0.08, now + dur * 0.45);
        masterGain.gain.exponentialRampToValueAtTime(0.0008, now + dur + 0.14);
        break;
      }
    }

    osc1.connect(filter);
    osc2.connect(osc2Gain);
    osc2Gain.connect(filter);
    filter.connect(masterGain);
    masterGain.connect(dest);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + dur + 0.24);
    osc2.stop(now + dur + 0.24);
  }

  /**
   * Soft root-5th lute pluck cue before a melody demo so the player's ear locks into the key.
   */
  public playChordCue(tonicMidi: number): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const base = tonicMidi >= 67 ? tonicMidi - 12 : tonicMidi - 12;
    this.playNote(base, 260, 'tavern_lute');
    window.setTimeout(() => {
      this.playNote(base + 7, 260, 'tavern_lute');
    }, 55);
  }

  /**
   * Procedural wood clack or felt thud for 3D d20 physics collisions.
   */
  public playDiceHit(intensity: number, surface: 'wood' | 'felt'): void {
    const nowMs = performance.now();
    if (nowMs - this.lastDiceHitMs < 42) return;
    this.lastDiceHitMs = nowMs;

    const ctx = this.ensureContext();
    if (!ctx) return;

    const clamped = Math.max(0.08, Math.min(1, intensity));
    const now = ctx.currentTime;
    const dest = this.getDestination(ctx);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    if (surface === 'wood') {
      // Crisp walnut tray clack
      const pitch = 340 + Math.random() * 140;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(pitch, now);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.48, now + 0.055);
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(920, now);
      filter.Q.setValueAtTime(1.8, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.24 * clamped, now + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);
    } else {
      // Soft felt thump
      const pitch = 135 + Math.random() * 45;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, now);
      osc.frequency.exponentialRampToValueAtTime(62, now + 0.07);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(420, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.22 * clamped, now + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    }

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  public playChestShake(): void {
    this.playDiceHit(0.6, 'wood');
    window.setTimeout(() => this.playDiceHit(0.8, 'wood'), 140);
    window.setTimeout(() => this.playDiceHit(0.55, 'wood'), 280);
  }

  public playRarityReveal(rarity: RelicRarity): void {
    const chord =
      rarity === 'mythic'
        ? [60, 64, 67, 71, 74, 79]
        : rarity === 'rare'
          ? [60, 64, 67, 72]
          : rarity === 'uncommon'
            ? [60, 64, 67]
            : [60, 67];
    const voice: KeyboardVoiceId =
      rarity === 'mythic' || rarity === 'rare' ? 'celesta' : 'tavern_lute';
    chord.forEach((n, idx) => {
      window.setTimeout(() => this.playNote(n, 340, voice), idx * 75);
    });
  }

  public playWrongNote(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(145, now);
    osc.frequency.exponentialRampToValueAtTime(92, now + 0.18);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(520, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  public playFanfare(): void {
    const notes = [60, 64, 67, 72];
    notes.forEach((n, idx) => {
      window.setTimeout(() => this.playNote(n, 320), idx * 95);
    });
  }

  public playLowDrum(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(42, now + 0.45);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.5);
  }

  public playTomatoSplat(): void {
    this.playLowDrum();
    window.setTimeout(() => this.playWrongNote(), 110);
    window.setTimeout(() => this.playDiceHit(0.9, 'felt'), 210);
  }
}

export const soundEngine = new SoundEngine();
