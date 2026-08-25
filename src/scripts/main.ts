import { Synth } from "./synth";
import {
  DEFAULT_KEY_CUTOFF,
  KEY_SCALE,
  MAX_CUTOFF,
  MIN_CUTOFF,
  cutoffFromY,
  freqFromX,
  resonanceFromSpeed,
  xFromFreq,
  yFromCutoff,
} from "./mapping";

const surface = document.querySelector<HTMLElement>("#surface");
const orb = document.querySelector<HTMLElement>("#orb");
const prompt = document.querySelector<HTMLElement>("#prompt");

if (surface && orb && prompt) {
  const synth = new Synth();
  const pointerLast = new Map<number, { x: number; y: number; t: number }>();

  let promptDismissed = false;
  function dismissPrompt(): void {
    if (promptDismissed) return;
    promptDismissed = true;
    prompt!.classList.add("hidden");
  }

  function setOrb(x: number, y: number, cutoff: number, active: boolean): void {
    const brightness = (cutoff - MIN_CUTOFF) / (MAX_CUTOFF - MIN_CUTOFF);
    orb!.style.left = `${x}px`;
    orb!.style.top = `${y}px`;
    orb!.style.setProperty("--scale", active ? "1.6" : "1");
    orb!.style.setProperty("--glow", String(0.35 + brightness * 0.65));
    orb!.style.setProperty("--hue", String(200 + brightness * 60));
    surface!.classList.toggle("is-active", active);
  }

  function frame(x: number, y: number, rect: DOMRect, active: boolean): { freq: number; cutoff: number } {
    const freq = freqFromX(x, rect.width);
    const cutoff = cutoffFromY(y, rect.height);
    setOrb(x, y, cutoff, active);
    return { freq, cutoff };
  }

  // --- Pointer Events: mouse, touch and pen all share this one path. ---

  surface.addEventListener("pointerdown", (event) => {
    synth.resume();
    surface.setPointerCapture(event.pointerId);
    const rect = surface.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const { freq, cutoff } = frame(x, y, rect, true);
    synth.noteOn(`pointer-${event.pointerId}`, freq, cutoff);
    pointerLast.set(event.pointerId, { x, y, t: performance.now() });
    dismissPrompt();
  });

  surface.addEventListener("pointermove", (event) => {
    const last = pointerLast.get(event.pointerId);
    if (!last) return; // only active (pressed) pointers play
    const rect = surface.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const now = performance.now();
    const dt = Math.max(1, now - last.t);
    const speed = Math.hypot(x - last.x, y - last.y) / dt;
    const { freq, cutoff } = frame(x, y, rect, true);
    synth.noteUpdate(`pointer-${event.pointerId}`, freq, cutoff, resonanceFromSpeed(speed));
    pointerLast.set(event.pointerId, { x, y, t: now });
  });

  function releasePointer(event: PointerEvent): void {
    if (!pointerLast.has(event.pointerId)) return;
    synth.noteOff(`pointer-${event.pointerId}`);
    pointerLast.delete(event.pointerId);
    if (pointerLast.size === 0) surface!.classList.remove("is-active");
  }

  surface.addEventListener("pointerup", releasePointer);
  surface.addEventListener("pointercancel", releasePointer);

  // --- Keyboard: A S D F G H J, mapped to a musical scale. ---

  const heldKeys = new Set<string>();

  window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    const freq = KEY_SCALE[key];
    if (freq === undefined || event.repeat) return;
    synth.resume();
    heldKeys.add(key);
    const rect = surface.getBoundingClientRect();
    const x = xFromFreq(freq, rect.width);
    const y = yFromCutoff(DEFAULT_KEY_CUTOFF, rect.height);
    setOrb(x, y, DEFAULT_KEY_CUTOFF, true);
    synth.noteOn(`key-${key}`, freq, DEFAULT_KEY_CUTOFF);
    dismissPrompt();
  });

  window.addEventListener("keyup", (event) => {
    const key = event.key.toLowerCase();
    if (KEY_SCALE[key] === undefined) return;
    heldKeys.delete(key);
    synth.noteOff(`key-${key}`);
    if (heldKeys.size === 0 && pointerLast.size === 0) surface!.classList.remove("is-active");
  });

  // Keep the orb sensibly placed if the window resizes mid-idle.
  window.addEventListener("resize", () => {
    if (synth.activeVoiceCount > 0) return;
    const rect = surface.getBoundingClientRect();
    setOrb(rect.width / 2, rect.height / 2, (MIN_CUTOFF + MAX_CUTOFF) / 2, false);
  });

  // Initial idle position, centred.
  const initialRect = surface.getBoundingClientRect();
  setOrb(initialRect.width / 2, initialRect.height / 2, (MIN_CUTOFF + MAX_CUTOFF) / 2, false);
}
