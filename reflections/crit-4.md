# Crit 4 reflection

**Breakthrough.** The instrument only started to feel like an instrument once I
stopped treating pitch as a lookup into a fixed scale and instead let the
pointer position continuously control frequency.

My first idea was to map the X axis to a pentatonic scale, similar to how the
keyboard maps keys to fixed notes, because a musical scale seemed like the
most natural approach. However, the brief also emphasises that **there should
be no wrong way to play**, and a fixed scale can quietly reintroduce the
distinction between being "in tune" and being "out of tune" — exactly the kind
of judgement the brief is trying to avoid.

I therefore changed the pointer's X axis to a **continuous logarithmic
frequency glide**, while keeping the keyboard mapped to seven discrete notes.
This resolved the tension between the two approaches: **the two input methods
provide two different but equally valid ways of playing the instrument.**

**What this changed about how I want to build.** During the conversion to
Astro, the conversion script quietly removed the page's existing `meta
description` and `og:image` tags. The conversion script itself did not report
this as a problem. I only discovered it when the invariant tests turned red.

This gave me a concrete lesson that I want to keep in future development: **I
should not treat "the script ran without errors" as meaning "the task is
finished."**

The tests were what actually showed me that something was wrong, rather than
simply relying on my own inspection of the diff.
