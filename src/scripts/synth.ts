// A small polyphonic synth: one voice per active pointer or held key.
// AudioContext -> [Oscillator + sub-oscillator] -> BiquadFilter -> Gain -> destination.
// The context is created lazily and only ever resumed from a user gesture
// (see resume()) so nothing sounds before the player's first press.

const ATTACK_SECONDS = 0.04;
const RELEASE_SECONDS = 0.35;
const GLIDE_SECONDS = 0.03;
const VOICE_PEAK_GAIN = 0.28;

interface Voice {
  osc: OscillatorNode;
  sub: OscillatorNode;
  filter: BiquadFilterNode;
  gain: GainNode;
}

export class Synth {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private voices = new Map<string, Voice>();

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.8;
      this.master.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  /** Resume the (suspended-until-gesture) AudioContext. Call from the first pointerdown/keydown. */
  resume(): void {
    const ctx = this.ensureContext();
    if (ctx.state === "suspended") {
      void ctx.resume();
    }
  }

  get activeVoiceCount(): number {
    return this.voices.size;
  }

  noteOn(id: string, freqHz: number, cutoffHz: number, resonance = 2): void {
    const ctx = this.ensureContext();
    if (ctx.state === "suspended") void ctx.resume();
    if (this.voices.has(id)) {
      this.noteUpdate(id, freqHz, cutoffHz, resonance);
      return;
    }
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(freqHz, now);

    // A quiet sub-oscillator one octave down adds body without adding clutter.
    const sub = ctx.createOscillator();
    sub.type = "sine";
    sub.frequency.setValueAtTime(freqHz / 2, now);

    const oscGain = ctx.createGain();
    oscGain.gain.value = 0.8;
    const subGain = ctx.createGain();
    subGain.gain.value = 0.3;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.Q.setValueAtTime(resonance, now);
    filter.frequency.setValueAtTime(cutoffHz, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(VOICE_PEAK_GAIN, now + ATTACK_SECONDS);

    osc.connect(oscGain).connect(filter);
    sub.connect(subGain).connect(filter);
    filter.connect(gain).connect(this.master!);

    osc.start(now);
    sub.start(now);

    this.voices.set(id, { osc, sub, filter, gain });
  }

  noteUpdate(id: string, freqHz: number, cutoffHz: number, resonance = 2): void {
    const voice = this.voices.get(id);
    if (!voice || !this.ctx) return;
    const now = this.ctx.currentTime;
    voice.osc.frequency.setTargetAtTime(freqHz, now, GLIDE_SECONDS);
    voice.sub.frequency.setTargetAtTime(freqHz / 2, now, GLIDE_SECONDS);
    voice.filter.frequency.setTargetAtTime(cutoffHz, now, GLIDE_SECONDS);
    voice.filter.Q.setTargetAtTime(resonance, now, GLIDE_SECONDS);
  }

  noteOff(id: string): void {
    const voice = this.voices.get(id);
    if (!voice || !this.ctx) return;
    const now = this.ctx.currentTime;
    voice.gain.gain.cancelScheduledValues(now);
    voice.gain.gain.setValueAtTime(Math.max(voice.gain.gain.value, 0.0001), now);
    voice.gain.gain.exponentialRampToValueAtTime(0.0001, now + RELEASE_SECONDS);
    voice.osc.stop(now + RELEASE_SECONDS + 0.05);
    voice.sub.stop(now + RELEASE_SECONDS + 0.05);
    this.voices.delete(id);
  }
}
