# Happy 25th, My Love 🎂

A one-page, no-build-tools birthday site: a starry landing screen, a
tall illustrated SVG cake with 5 blow-out-able candles that she then
eats to reveal a sealed envelope unlocked with a heart-tracing puzzle
(which opens the love letter), and a closing screen. Built with plain
HTML/CSS/JS — no framework, no install step.

## Preview it locally

You can just double-click `index.html` to open it in a browser, but the
mic-based candle blowing needs a proper `http://` (or `https://`) origin
to work (browsers block microphone access on `file://` pages). To
preview with the mic working, serve the folder locally:

```bash
# from this folder
python -m http.server 4173
# then open http://localhost:4173 in your browser
```

Any static server works (`npx serve`, VS Code's "Live Server", etc).

## Customize it

Everything you'll want to change lives in `index.html`, marked with
`<!-- EDIT: ... -->` comments:

- **Love letter** — it lives inside the `#letter-modal` overlay near
  the bottom of `index.html` (marked `<!-- EDIT: this is the love letter
  text -->`), not in its own scroll section. Edit the paragraphs inside
  `.letter-paper` there directly.
- **Tone** — the copy currently mixes sincere lines with playful,
  sarcastic ones on purpose. Adjust freely to match your own voice.

## How the interactive candles work

- The cake is an inline SVG (`.cake-illustration` in `index.html`) whose
  tiers rise into place with a staggered build-up animation the first
  time it scrolls into view. Each of the 5 candles has its own 5-layer
  flickering flame (the `.fuego` spans), with randomized timing so they
  don't flicker in unison.
- Tapping any single candle blows it out individually (handy for testing).
- Microphone permission is requested as soon as she taps **Tap to Begin,
  Babyyy** on the landing screen, so by the time she scrolls to the cake
  it's usually already listening — she can just blow. The **🎤 Let Me
  Blow (mic)** button re-requests it if she denied it the first time (or
  wants to retry), and listens for a sustained loud/breathy sound (a
  real blow) to extinguish all remaining candles in a wave. Needs
  `http://localhost` or `https://` — won't work over `file://`.
- A swipe/drag gesture across the cake also extinguishes the candles —
  works everywhere, no permissions needed, and is the silent automatic
  fallback if the mic is denied or unavailable (there's no dedicated
  button for it; it's just always listening for the gesture).
- Once every candle is out, confetti fires, a "Tap the cake. Take a
  bite." label appears above it, and the whole cake becomes tappable.
  Tapping it takes six same-sized bites — each one a cluster of a few
  overlapping round lobes (like an actual bite out of a cookie, not a
  clean hole-punch circle) — that snake across the cake starting at the
  top-right, until every part of it has been swept. Once it's gone,
  a wax-sealed envelope appears on the plate. Tapping
  the envelope opens a small puzzle: trace the
  heart-shaped pattern of dots to crack the seal and open the letter
  overlay — the starting dot is marked (pink, pulsing, labeled "start
  here") so it's obvious where to begin. Once unlocked, a **💌 Read It
  Again** button lets her reopen the letter without redoing the puzzle.
- There's no dedicated relight button anymore — **Do It All Again** on
  the closing screen both resets the whole ritual (candles, cake,
  envelope, and letter lock) and scrolls back to the top, so a full
  redo only lives at the very end.

## Deploying (free, in a few minutes)

Any static host works since there's no backend or build step. Easiest
options:

**GitHub Pages**
1. Push this folder to a new GitHub repo.
2. Repo Settings → Pages → Deploy from branch → `main` / root.
3. Your site is live at `https://<username>.github.io/<repo>/`.

**Netlify / Vercel**
1. Drag-and-drop this folder onto [app.netlify.com/drop](https://app.netlify.com/drop),
   or connect the repo on either platform.
2. No build command needed — root directory is the publish directory.

Either way, use `https://` in production — mobile browsers require a
secure origin for microphone access.

## Browser support notes

- Works on modern iOS Safari, Chrome, and Android browsers.
- Respects `prefers-reduced-motion` (animations tone down automatically).
- If mic permission is denied/unsupported, the swipe fallback kicks in
  automatically — nothing breaks.
