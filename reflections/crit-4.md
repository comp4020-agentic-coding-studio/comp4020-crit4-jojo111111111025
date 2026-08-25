# Crit 4 reflection

**Breakthrough.** The instrument only started feeling like an instrument once I
stopped treating pitch as a lookup into a fixed scale and let pointer position
drive frequency continuously. My first instinct was to snap the X axis onto a
pentatonic scale, the same way the keyboard keys map to notes, because "musical
scale" was the obvious framing from the brief. But the brief also says there's
no way to play it wrong, and a snapped scale quietly reintroduces "in tune" vs.
"in between" — the exact judgement it's ruling out. Switching pointer X to a
continuous log-frequency glide and keeping the discrete scale only for the
keyboard's seven fixed keys resolved the tension: two different input types,
two different but equally valid ways of being "correct."

**What this changed about how I want to build.** The Astro stack conversion
quietly dropped this page's meta description and og:image tags, and nothing in
the conversion script's own report flagged it — it only showed up because the
invariant tests turned red. That was a small, concrete instance of a habit I
want to keep: don't treat "the script ran without errors" as "the script
finished." The tests were the thing that actually told me something was wrong,
not my reading of the diff. I also had to be honest in this repo's process
notes about a real limitation — I couldn't run a headless browser to click
through the interaction myself in this environment — rather than writing
around it or implying I'd verified feel and expressiveness I hadn't. Writing
that down plainly, instead of smoothing it over, is the version of this habit
I want to keep past this course.
