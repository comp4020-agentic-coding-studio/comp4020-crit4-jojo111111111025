import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

// Crit 4 spec: https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/crits/04-instrument/
// Only the mechanically-checkable lines are covered here — sound quality,
// latency and whether the mapping actually feels expressive are for a human
// to judge at the crit, not something a test can assert.

const DIST = resolve("dist");
const html = readFileSync(join(DIST, "index.html"), "utf8");
const doc = new JSDOM(html).window.document;

describe("crit 4: sound is made live, not played back", () => {
  it("ships no <audio> or <video> playback elements", () => {
    expect(doc.querySelectorAll("audio, video").length).toBe(0);
  });

  it("synthesises with the Web Audio API rather than sample playback", () => {
    expect(html).toContain("AudioContext");
    expect(html).toMatch(/createOscillator|OscillatorNode/);
  });
});

describe("crit 4: a stranger can play it uninstructed", () => {
  it("invites the first sound with a short prompt, not an instruction manual", () => {
    const prompt = doc.querySelector("#prompt");
    expect(prompt, "the opening screen needs a short invitation to act").toBeTruthy();
    const wordCount = (prompt!.textContent ?? "").trim().split(/\s+/).length;
    expect(wordCount, "a manual, not a prompt, if this is long").toBeLessThanOrEqual(6);
  });

  it("has a single obvious playing surface", () => {
    expect(doc.querySelectorAll("#surface").length).toBe(1);
  });
});

describe("crit 4: playable with whatever is at hand", () => {
  it("the surface is keyboard-focusable, not just clickable", () => {
    const surface = doc.querySelector("#surface");
    expect(surface?.getAttribute("tabindex")).toBe("0");
  });

  it("names a keyboard alternative for players without a pointer", () => {
    const label = doc.querySelector("#surface")?.getAttribute("aria-label") ?? "";
    expect(label.toLowerCase()).toMatch(/[a-z] [a-z] [a-z]/); // e.g. "A S D F G H J"
  });
});

describe("crit 4: no way to play it wrong", () => {
  it("ships no score, timer, or game-over affordances", () => {
    const text = (doc.body.textContent ?? "").toLowerCase();
    for (const forbidden of ["score", "game over", "you win", "you lose", "time left", "high score"]) {
      expect(text.includes(forbidden), `found "${forbidden}" in the shipped page`).toBe(false);
    }
  });
});
