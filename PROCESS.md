# Process overview

## What I built

**Ambient Synth** — a single full-viewport playing surface. Press and drag with
a mouse, finger, or pen to glide a synth voice's pitch (horizontal) and filter
brightness (vertical); hold the A S D F G H J keys for the same voice mapped
onto a C-major scale. There's no score, no goal, no way to play a "wrong" note
— you can only make a different sound.

## The moments that mattered

1. **The Astro conversion script silently dropped the page's meta tags.**
   Running the course's `stack-astro` conversion split `index.html` into
   `Layout.astro` + `index.astro`, but the generated layout kept only
   `<title>` — the `meta[name=description]` and `og:image` tags from the
   original head didn't make the trip, which only showed up as two failing
   invariant tests (`has a meta description`, `has an og:image card`), not as
   anything the script itself flagged. Rather than accept the loss, I added
   `description`/`card` props to `Layout.astro` and threaded them back through
   from `index.astro`, so the contract in `spec/invariants.test.ts` — not my
   eyeballing of the diff — is what caught it and confirmed the fix
   ([`266b666`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit4-jojo111111111025/commit/266b666)).

2. **Continuous glide instead of quantised notes.** The spec rules out any
   "wrong" way to play, which pushed against snapping pointer X to a pentatonic
   scale (a slip near a note boundary would look like a miss). Instead
   `mapping.ts` maps pointer X to frequency on a continuous logarithmic curve
   across two octaves — a theremin-style glissando where every position is a
   valid, different sound — and reserves the actual musical scale (C major)
   for the keyboard, which has seven discrete keys and no in-between positions
   to get "wrong"
   ([`e90b42e`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit4-jojo111111111025/commit/e90b42e)).

3. **One voice-id per pointer and per key, not one global voice.** An early
   sketch of the interaction had a single oscillator that pointer and keyboard
   both fought over, so pressing a key while dragging cut the pointer's note
   off. `Synth` keys its voice map by `pointer-<id>` / `key-<letter>`, so a
   drag and a held key sustain independently and multiple fingers/keys can
   sound together — checked by reading through the note-on/note-off paths for
   each input source rather than by a test, since polyphony correctness here
   is about not silently clobbering state
   ([`e355e6c`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit4-jojo111111111025/commit/e355e6c)).

4. **Turning the spec's checkable lines into tests, not vibes.** The published
   spec has lines like "a stranger can play it uninstructed" and "no way to
   play it wrong" that read as judgement calls, but parts of them are
   structurally checkable: is there a short prompt (not a manual)? Is the
   surface actually keyboard-focusable? Does the shipped page avoid
   score/game-over language? `spec/crit-4.test.ts` replaces the starter's
   worked example with exactly those checks, and is explicit in its own
   comments about what it can't cover (sound quality, latency, real
   expressiveness)
   ([`9c12a4b`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit4-jojo111111111025/commit/9c12a4b)).

## What still needs a human

`pnpm check` is green (typecheck, build, 24 spec/invariant tests). I could not
run a headless browser in this environment to click-test the interaction
myself — Playwright's Chromium is present but its system shared libraries
(`libnspr4.so` etc.) aren't installed and there's no `sudo` in this sandbox —
so latency, sound quality, whether the pitch/brightness mapping actually feels
expressive, and whether a genuine stranger discovers the interaction
unprompted are all unverified by me. Those are exactly the things the crit
brief says a test suite can't judge anyway; I did not claim otherwise, and no
user testing happened.

## Before you ship

`pnpm check:evidence` verifies your citations resolve to real commits, that a
reflection entry the marker reads is in `reflections/`, and that your
`CLAUDE.md` is there --- before a marker ever opens the file. It checks that
your map is traceable, not that it is good: the marker judges whether your
small, deliberately chosen set of moments shows real judgement and reflection. A
green check is not a substitute for that curation.

Images aren't checked: whether one renders is visible the moment you look. Open
this file on GitHub and look at it before you ship.
