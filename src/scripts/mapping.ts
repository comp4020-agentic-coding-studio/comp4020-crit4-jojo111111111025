// Pure mapping functions between screen position and sound parameters.
// Pitch is mapped log-frequency (perceptually even octaves), so pointer X is
// a continuous glissando across two octaves rather than quantised notes —
// there is no "wrong" position.

export const MIN_FREQ = 220; // A3
export const MAX_FREQ = 880; // A5 (two octaves up)

export const MIN_CUTOFF = 200;
export const MAX_CUTOFF = 6000;

function clamp01(t: number): number {
  return Math.min(1, Math.max(0, t));
}

export function freqFromX(x: number, width: number): number {
  const t = clamp01(width > 0 ? x / width : 0);
  return MIN_FREQ * (MAX_FREQ / MIN_FREQ) ** t;
}

export function xFromFreq(freq: number, width: number): number {
  const t = Math.log(freq / MIN_FREQ) / Math.log(MAX_FREQ / MIN_FREQ);
  return width * clamp01(t);
}

// Higher on the surface reads as "brighter" (higher filter cutoff).
export function cutoffFromY(y: number, height: number): number {
  const t = 1 - clamp01(height > 0 ? y / height : 0);
  return MIN_CUTOFF * (MAX_CUTOFF / MIN_CUTOFF) ** t;
}

export function yFromCutoff(cutoff: number, height: number): number {
  const t = Math.log(cutoff / MIN_CUTOFF) / Math.log(MAX_CUTOFF / MIN_CUTOFF);
  return height * (1 - clamp01(t));
}

// Movement speed nudges filter resonance — a subtle extra expressive
// dimension, not a primary control.
export function resonanceFromSpeed(pixelsPerMs: number): number {
  return 1 + Math.min(pixelsPerMs * 6, 10);
}

// The seven natural-letter keys map to a C major scale — a musical scale
// rather than arbitrary frequencies, and one that reuses the QWERTY home row.
export const KEY_SCALE: Record<string, number> = {
  a: 261.63, // C4
  s: 293.66, // D4
  d: 329.63, // E4
  f: 349.23, // F4
  g: 392.0, // G4
  h: 440.0, // A4
  j: 493.88, // B4
};

export const DEFAULT_KEY_CUTOFF = 2200;
