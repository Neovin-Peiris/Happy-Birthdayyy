(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CANDLE_COUNT = 5;
  // The frosting's scalloped wave peaks sit at roughly x = 50, 70, 90, 110,
  // 130, 150, 170 out of the cake SVG's 220-wide viewBox (22.7%, 31.8%,
  // 40.9%, 50%, 59.1%, 68.2%, 77.3%). Candles are placed on five of those
  // peaks -- not evenly spaced by flexbox -- so every candle actually
  // touches frosting instead of some landing over a dip in the wave.
  const CANDLE_X_PERCENTS = [31.8, 40.9, 50, 59.1, 68.2];

  /* ===================== Starfield ===================== */
  const starCanvas = document.getElementById('starfield');
  const starCtx = starCanvas.getContext('2d');
  let stars = [];

  function resizeStarfield() {
    starCanvas.width = window.innerWidth * devicePixelRatio;
    starCanvas.height = window.innerHeight * devicePixelRatio;
    starCanvas.style.width = window.innerWidth + 'px';
    starCanvas.style.height = window.innerHeight + 'px';
    starCtx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    const count = Math.round((window.innerWidth * window.innerHeight) / 9000);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.3 + 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.4 + 0.15,
      drift: Math.random() * 0.05 + 0.01
    }));
  }

  function drawStars(t) {
    starCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (const s of stars) {
      const twinkle = reduceMotion ? 0.8 : 0.55 + Math.sin(t * 0.001 * s.speed + s.phase) * 0.45;
      starCtx.beginPath();
      starCtx.fillStyle = `rgba(245, 240, 255, ${Math.max(0.15, twinkle)})`;
      starCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      starCtx.fill();
      if (!reduceMotion) s.y -= s.drift;
      if (s.y < -5) s.y = window.innerHeight + 5;
    }
    requestAnimationFrame(drawStars);
  }

  resizeStarfield();
  window.addEventListener('resize', resizeStarfield);
  requestAnimationFrame(drawStars);

  /* ===================== Floating hearts ===================== */
  const heartsLayer = document.getElementById('floating-hearts');
  const heartGlyphs = ['💗', '💫', '✨', '💕'];

  function spawnHeart(x) {
    if (reduceMotion) return;
    const el = document.createElement('span');
    el.className = 'floating-heart';
    el.textContent = heartGlyphs[Math.floor(Math.random() * heartGlyphs.length)];
    const left = x != null ? x : Math.random() * window.innerWidth;
    el.style.left = left + 'px';
    el.style.setProperty('--drift', (Math.random() * 80 - 40) + 'px');
    el.style.animationDuration = (5 + Math.random() * 3) + 's';
    heartsLayer.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }

  setInterval(() => spawnHeart(), 2600);

  document.addEventListener('click', (e) => {
    if (e.target.closest('button, a')) return;
    spawnHeart(e.clientX);
  });

  /* ===================== Landing -> Site ===================== */
  const landing = document.getElementById('landing');
  const site = document.getElementById('site');
  const enterBtn = document.getElementById('enter-btn');

  enterBtn.addEventListener('click', () => {
    landing.classList.remove('active');
    landing.setAttribute('hidden', '');
    site.removeAttribute('hidden');
    site.scrollTo({ top: 0 });
    for (let i = 0; i < 6; i++) setTimeout(() => spawnHeart(), i * 150);
    startMic();
  });

  document.getElementById('replay-btn').addEventListener('click', () => {
    site.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  /* ===================== Candles ===================== */
  const candlesRow = document.getElementById('candles-row');
  const blowStatus = document.getElementById('blow-status');
  const relightBtn = document.getElementById('relight-btn');
  const micBtn = document.getElementById('mic-btn');
  const swipeHintBtn = document.getElementById('swipe-hint-btn');
  const swipeInstructions = document.getElementById('swipe-instructions');
  const cakeStage = document.querySelector('.cake-stage');
  const cakeEl = document.getElementById('cake');
  const eatStage = document.getElementById('eat-stage');
  const cakeBody = document.getElementById('cake-body');
  const sliceStatus = document.getElementById('slice-status');
  const envelope = document.getElementById('envelope');
  const rereadBtn = document.getElementById('reread-btn');

  function buildCandles() {
    candlesRow.innerHTML = '';
    for (let i = 0; i < CANDLE_COUNT; i++) {
      const c = document.createElement('div');
      c.className = 'candle';
      c.dataset.index = i;
      c.style.left = CANDLE_X_PERCENTS[i] + '%';
      const candleOffset = (Math.random() * 1.2).toFixed(2) + 's';
      for (let f = 0; f < 5; f++) {
        const fuego = document.createElement('span');
        fuego.className = 'fuego';
        if (!reduceMotion) fuego.style.animationDelay = candleOffset;
        c.appendChild(fuego);
      }
      c.addEventListener('click', () => extinguishOne(c));
      candlesRow.appendChild(c);
    }
  }
  buildCandles();

  if (!reduceMotion && 'IntersectionObserver' in window) {
    const cakeRiseObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          triggerCakeRiseIn();
          cakeRiseObserver.disconnect();
        }
      });
    }, { threshold: 0.2 });
    cakeRiseObserver.observe(cakeStage);
  } else {
    triggerCakeRiseIn();
  }

  function triggerCakeRiseIn() {
    cakeEl.classList.add('rise-in');
    if (reduceMotion) return;
    // Keep the candles hidden through the tier build-up, then run their
    // reveal as a one-off animation. The animation class is removed once
    // it finishes so it stops claiming `opacity` -- otherwise it would
    // permanently win over the later .consumed rule (an ongoing CSS
    // `animation` assignment always overrides a plain property value).
    candlesRow.style.opacity = '0';
    setTimeout(() => {
      candlesRow.style.opacity = '';
      candlesRow.classList.add('candle-reveal');
      setTimeout(() => candlesRow.classList.remove('candle-reveal'), 550);
    }, 720);
  }

  function litCandles() {
    return Array.from(candlesRow.querySelectorAll('.candle:not(.out)'));
  }

  function extinguishOne(candle) {
    if (candle.classList.contains('out')) return;
    candle.classList.add('puff');
    spawnSmoke(candle);
    setTimeout(() => {
      candle.classList.remove('puff');
      candle.classList.add('out');
      checkAllOut();
    }, reduceMotion ? 0 : 480);
  }

  function spawnSmoke(candle) {
    if (reduceMotion) return;
    const puff = document.createElement('span');
    puff.className = 'smoke';
    puff.style.setProperty('--dx', (Math.random() * 16 - 8) + 'px');
    candle.appendChild(puff);
    puff.addEventListener('animationend', () => puff.remove());
  }

  function extinguishWave() {
    const remaining = litCandles();
    if (!remaining.length) return;
    remaining.forEach((c, i) => {
      setTimeout(() => extinguishOne(c), reduceMotion ? 0 : i * 45);
    });
  }

  function checkAllOut() {
    if (litCandles().length === 0) {
      revealWish();
    }
  }

  function relightAll() {
    candlesRow.querySelectorAll('.candle').forEach((c) => {
      c.classList.remove('out', 'puff');
    });
    relightBtn.hidden = true;
    blowStatus.textContent = 'Blow into the mic like you mean it.';
    resetSliceStage();
  }
  relightBtn.addEventListener('click', relightAll);

  let revealed = false;
  function revealWish() {
    if (revealed) return;
    revealed = true;
    blowStatus.textContent = "That's it, babyyy. Wish made. No refunds.";
    relightBtn.hidden = false;
    eatStage.hidden = false;
    sliceStatus.hidden = false;
    candlesRow.classList.add('consumed');
    canEat = true;
    fireConfetti();
    setTimeout(() => { revealed = false; }, 800);
  }

  /* ---- Swipe-to-blow ---- */
  let swipeMode = false;
  swipeHintBtn.addEventListener('click', () => {
    swipeMode = !swipeMode;
    swipeInstructions.hidden = !swipeMode;
    swipeHintBtn.classList.toggle('active-mode', swipeMode);
  });

  let dragStartX = null, dragTraveled = 0;
  function onDragStart(x) { dragStartX = x; dragTraveled = 0; }
  function onDragMove(x) {
    if (dragStartX == null) return;
    dragTraveled += Math.abs(x - dragStartX);
    dragStartX = x;
    if (dragTraveled > 70) {
      dragTraveled = 0;
      extinguishWave();
    }
  }
  function onDragEnd() { dragStartX = null; dragTraveled = 0; }

  cakeStage.addEventListener('pointerdown', (e) => onDragStart(e.clientX));
  cakeStage.addEventListener('pointermove', (e) => { if (e.buttons) onDragMove(e.clientX); });
  cakeStage.addEventListener('pointerup', onDragEnd);
  cakeStage.addEventListener('pointercancel', onDragEnd);

  /* ---- Mic blow detection ---- */
  let audioCtx = null, analyser = null, micStream = null, micActive = false;
  const BLOW_THRESHOLD = 0.16;
  const SUSTAIN_FRAMES = 14;
  let sustainCount = 0;

  async function startMic() {
    if (micActive) return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      blowStatus.textContent = "Mic's not available here. Swipe it is, babyyy.";
      swipeMode = true;
      swipeInstructions.hidden = false;
      return;
    }
    try {
      blowStatus.textContent = 'Asking nicely for mic access...';
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(micStream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      micActive = true;
      micBtn.classList.add('active-mode');
      micBtn.textContent = '🎤 Listening...';
      blowStatus.textContent = 'Go on then. Blow.';
      monitorMic();
    } catch (err) {
      blowStatus.textContent = "Mic said no. Rude. Try swiping instead.";
      swipeMode = true;
      swipeInstructions.hidden = false;
    }
  }

  function monitorMic() {
    if (!micActive) return;
    const data = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(data);
    let sumSquares = 0;
    for (let i = 0; i < data.length; i++) {
      const v = (data[i] - 128) / 128;
      sumSquares += v * v;
    }
    const rms = Math.sqrt(sumSquares / data.length);

    if (rms > BLOW_THRESHOLD) {
      sustainCount++;
      blowStatus.textContent = 'Nice and steady... 🌬️';
    } else {
      sustainCount = Math.max(0, sustainCount - 1);
    }

    if (sustainCount > SUSTAIN_FRAMES) {
      sustainCount = 0;
      extinguishWave();
    }

    requestAnimationFrame(monitorMic);
  }

  micBtn.addEventListener('click', startMic);

  function stopMic() {
    if (micStream) micStream.getTracks().forEach((t) => t.stop());
    micActive = false;
  }
  window.addEventListener('beforeunload', stopMic);

  /* ===================== Eating the Cake / Envelope ===================== */
  // A plain, clean bite -- like a bite out of a cookie: one smooth circle,
  // no scalloped teeth. Every tap is the SAME size (it doesn't grow), but
  // it moves to a new spot each time, snaking across the cake starting at
  // the top-right (top-right, top-left, mid-left, mid-right, bottom-right,
  // bottom-left) so by the last tap the whole cake has been swept, not
  // just one point that ballooned outward.
  // Radius and grid are sized against the cake's actual rendered box
  // (~304 x 238px) so each row's two circles overlap well past the
  // center and consecutive rows overlap vertically too -- no strip of
  // cake can survive between bites.
  const BITE_RADIUS = 95;
  const BITE_SPOTS = [
    { x: 75, y: 17 }, // top-right (start)
    { x: 25, y: 17 }, // top-left
    { x: 25, y: 50 }, // mid-left
    { x: 75, y: 50 }, // mid-right
    { x: 75, y: 83 }, // bottom-right
    { x: 25, y: 83 }  // bottom-left
  ];
  const SLICE_MESSAGES = [
    'Tap the cake. Take a bite.',
    "Corner's gone.",
    'Two down.',
    'Halfway destroyed.',
    'More than halfway...',
    'Almost gone...',
    'Gone. No evidence.'
  ];
  let biteIndex = 0;
  let canEat = false;

  function spawnCrumbs(x, y) {
    if (reduceMotion) return;
    for (let i = 0; i < 5; i++) {
      const crumb = document.createElement('span');
      crumb.className = 'crumb';
      crumb.style.left = x + 'px';
      crumb.style.top = y + 'px';
      crumb.style.setProperty('--cx', (Math.random() * 40 - 20) + 'px');
      crumb.style.setProperty('--cr', (Math.random() * 180 - 90) + 'deg');
      cakeEl.appendChild(crumb);
      crumb.addEventListener('animationend', () => crumb.remove());
    }
  }

  // Each bite gets a few small, subtle tooth-mark bumps sitting right on
  // its rim (mostly flush, just barely poking past the edge) so the
  // boundary reads as an actual bite instead of a perfectly smooth hole
  // -- kept small and few so it doesn't turn into a ring of fangs.
  const TOOTH_COUNT = 6;
  const TOOTH_RADIUS = 13;
  const TOOTH_DIST = BITE_RADIUS * 0.94;

  function circleLayer(px, py, r) {
    return `radial-gradient(circle at ${px} ${py}, transparent ${r}px, black ${r + 1}px)`;
  }

  function biteLayersFor(spot) {
    const layers = [circleLayer(`${spot.x}%`, `${spot.y}%`, BITE_RADIUS)];
    for (let i = 0; i < TOOTH_COUNT; i++) {
      const angle = (i / TOOTH_COUNT) * Math.PI * 2;
      const dx = Math.cos(angle) * TOOTH_DIST;
      const dy = Math.sin(angle) * TOOTH_DIST;
      const px = dx ? `calc(${spot.x}% + ${dx.toFixed(1)}px)` : `${spot.x}%`;
      const py = dy ? `calc(${spot.y}% + ${dy.toFixed(1)}px)` : `${spot.y}%`;
      layers.push(circleLayer(px, py, TOOTH_RADIUS));
    }
    return layers;
  }

  function applyBiteMask() {
    if (biteIndex === 0) {
      cakeBody.style.webkitMaskImage = '';
      cakeBody.style.maskImage = '';
      cakeBody.style.maskComposite = '';
      return;
    }
    const layers = BITE_SPOTS.slice(0, biteIndex).flatMap(biteLayersFor);
    const value = layers.join(', ');
    cakeBody.style.webkitMaskImage = value;
    cakeBody.style.maskImage = value;
    cakeBody.style.maskComposite = layers.map(() => 'intersect').join(', ');
  }

  function biteSlice() {
    if (!canEat || biteIndex >= BITE_SPOTS.length) return;
    biteIndex++;
    applyBiteMask();
    cakeBody.classList.remove('bitten');
    void cakeBody.offsetWidth;
    cakeBody.classList.add('bitten');
    const spot = BITE_SPOTS[biteIndex - 1];
    const rect = cakeBody.getBoundingClientRect();
    const cakeRect = cakeEl.getBoundingClientRect();
    const x = rect.left + rect.width * (spot.x / 100) - cakeRect.left;
    const y = rect.top + rect.height * (spot.y / 100) - cakeRect.top;
    spawnCrumbs(x, y);
    sliceStatus.textContent = SLICE_MESSAGES[biteIndex];
    if (biteIndex === BITE_SPOTS.length) {
      setTimeout(() => {
        cakeBody.style.display = 'none';
        envelope.hidden = false;
        sliceStatus.textContent = 'Huh. There\'s an envelope under there.';
      }, 550);
    }
  }
  cakeBody.addEventListener('click', biteSlice);

  /* ===================== Heart-Trace Puzzle ===================== */
  const puzzleModal = document.getElementById('puzzle-modal');
  const puzzleClose = document.getElementById('puzzle-close');
  const puzzleStatus = document.getElementById('puzzle-status');
  const puzzleSvg = document.getElementById('puzzle-svg');
  const puzzleTrace = document.getElementById('puzzle-trace');
  const puzzleDots = Array.from(puzzleSvg.querySelectorAll('.puzzle-dot'))
    .sort((a, b) => (+a.dataset.index) - (+b.dataset.index));
  const dotPoints = puzzleDots.map((d) => ({ x: +d.getAttribute('cx'), y: +d.getAttribute('cy') }));
  const DOT_COUNT = puzzleDots.length;
  const HIT_RADIUS = 22;

  let traceActive = false;
  let activeIndex = -1;
  let confirmedPoints = [];

  function svgPointFromEvent(e) {
    const rect = puzzleSvg.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (200 / rect.width),
      y: (e.clientY - rect.top) * (200 / rect.height)
    };
  }
  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function renderTrace(current) {
    const pts = current ? confirmedPoints.concat([current]) : confirmedPoints;
    puzzleTrace.setAttribute('points', pts.map((p) => `${p.x},${p.y}`).join(' '));
  }
  function resetPuzzleTrace() {
    traceActive = false;
    activeIndex = -1;
    confirmedPoints = [];
    puzzleTrace.setAttribute('points', '');
    puzzleDots.forEach((d) => d.classList.remove('hit'));
    puzzleDots[0].classList.add('start-dot');
    puzzleStatus.textContent = 'Start at the top and trace the whole heart, love.';
  }

  function openPuzzle() {
    resetPuzzleTrace();
    puzzleModal.hidden = false;
  }
  envelope.addEventListener('click', openPuzzle);
  puzzleClose.addEventListener('click', () => {
    puzzleModal.hidden = true;
    resetPuzzleTrace();
  });

  puzzleSvg.addEventListener('pointerdown', (e) => {
    const p = svgPointFromEvent(e);
    if (dist(p, dotPoints[0]) <= HIT_RADIUS) {
      traceActive = true;
      activeIndex = 0;
      confirmedPoints = [dotPoints[0]];
      puzzleDots[0].classList.remove('start-dot');
      puzzleDots[0].classList.add('hit');
      puzzleStatus.textContent = 'Keep going...';
      renderTrace(p);
    }
  });

  puzzleSvg.addEventListener('pointermove', (e) => {
    if (!traceActive) return;
    const p = svgPointFromEvent(e);
    const nextIndex = activeIndex + 1;
    if (nextIndex < DOT_COUNT && dist(p, dotPoints[nextIndex]) <= HIT_RADIUS) {
      activeIndex = nextIndex;
      confirmedPoints.push(dotPoints[activeIndex]);
      puzzleDots[activeIndex].classList.add('hit');
      if (activeIndex === DOT_COUNT - 1) {
        confirmedPoints.push(dotPoints[0]);
        renderTrace(null);
        puzzleSuccess();
        return;
      }
    }
    renderTrace(p);
  });

  function endTrace() {
    if (!traceActive || activeIndex >= DOT_COUNT - 1) return;
    traceActive = false;
    puzzleStatus.textContent = 'Almost — trace the whole heart, love.';
    setTimeout(resetPuzzleTrace, 900);
  }
  puzzleSvg.addEventListener('pointerup', endTrace);
  puzzleSvg.addEventListener('pointercancel', endTrace);
  puzzleSvg.addEventListener('pointerleave', endTrace);

  function puzzleSuccess() {
    traceActive = false;
    puzzleStatus.textContent = 'There we go. 💫';
    setTimeout(() => {
      puzzleModal.hidden = true;
      resetPuzzleTrace();
      openLetter();
    }, 700);
  }

  /* ===================== Letter Modal ===================== */
  const letterModal = document.getElementById('letter-modal');
  const letterClose = document.getElementById('letter-close');

  function openLetter() {
    letterModal.hidden = false;
    envelope.hidden = true;
    sliceStatus.textContent = 'Consider yourself let in.';
    rereadBtn.hidden = false;
    for (let i = 0; i < 5; i++) setTimeout(() => spawnHeart(), i * 130);
  }
  letterClose.addEventListener('click', () => { letterModal.hidden = true; });
  rereadBtn.addEventListener('click', () => { letterModal.hidden = false; });

  function resetSliceStage() {
    biteIndex = 0;
    canEat = false;
    applyBiteMask();
    cakeBody.style.display = '';
    cakeBody.classList.remove('bitten');
    candlesRow.classList.remove('consumed');
    sliceStatus.textContent = SLICE_MESSAGES[0];
    sliceStatus.hidden = true;
    envelope.hidden = true;
    rereadBtn.hidden = true;
    eatStage.hidden = true;
    letterModal.hidden = true;
    puzzleModal.hidden = true;
    resetPuzzleTrace();
  }

  /* ===================== Confetti ===================== */
  let confettiCanvas = null, confettiCtx = null, confettiParticles = [];

  function ensureConfettiCanvas() {
    if (confettiCanvas) return;
    confettiCanvas = document.createElement('canvas');
    confettiCanvas.id = 'confetti-canvas';
    document.body.appendChild(confettiCanvas);
    confettiCtx = confettiCanvas.getContext('2d');
    const resize = () => {
      confettiCanvas.width = window.innerWidth * devicePixelRatio;
      confettiCanvas.height = window.innerHeight * devicePixelRatio;
      confettiCanvas.style.width = window.innerWidth + 'px';
      confettiCanvas.style.height = window.innerHeight + 'px';
      confettiCtx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);
  }

  const confettiColors = ['#f4c76b', '#ff9ecb', '#c9b6ff', '#ff6fa5', '#fff6e6'];

  function fireConfetti() {
    if (reduceMotion) return;
    ensureConfettiCanvas();
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight * 0.4;
    for (let i = 0; i < 90; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 6;
      confettiParticles.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size: 4 + Math.random() * 5,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        rot: Math.random() * Math.PI,
        vrot: (Math.random() - 0.5) * 0.3,
        life: 0,
        maxLife: 90 + Math.random() * 40
      });
    }
    if (!confettiRunning) { confettiRunning = true; animateConfetti(); }
  }

  let confettiRunning = false;
  function animateConfetti() {
    confettiCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    confettiParticles.forEach((p) => {
      p.vy += 0.12;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vrot;
      p.life++;
      const alpha = Math.max(0, 1 - p.life / p.maxLife);
      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate(p.rot);
      confettiCtx.globalAlpha = alpha;
      confettiCtx.fillStyle = p.color;
      confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      confettiCtx.restore();
    });
    confettiParticles = confettiParticles.filter((p) => p.life < p.maxLife);
    if (confettiParticles.length) {
      requestAnimationFrame(animateConfetti);
    } else {
      confettiRunning = false;
      confettiCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }

})();
