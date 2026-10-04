/* ==========================================================================
   Bitnätet: små fyrkanter ("bitar") som driver långsamt och kopplas ihop
   med linjer när de kommer nära varandra – och nära muspekaren.
   Färgerna läses från CSS-tokens (--particle, --particle-line, --color-accent),
   så nätet följer temat automatiskt.
   ========================================================================== */
(function () {
  const canvas = document.querySelector("canvas.bits");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const LINK_DISTANCE = 140;   // px: hur nära bitar måste vara för en linje
  const POINTER_DISTANCE = 180; // px: räckvidd för linjer till muspekaren
  const DENSITY = 16000;        // px² per bit – större tal = glesare nät
  const ACCENT_EVERY = 7;       // var 7:e bit är tegelröd

  let width = 0, height = 0, dpr = 1;
  let bits = [];
  let colors = {};
  let pointer = { x: -9999, y: -9999 };
  let running = true;

  function readColors() {
    const s = getComputedStyle(canvas); // läser tokens där canvasen sitter, så data-theme slår igenom
    colors = {
      bit: s.getPropertyValue("--particle").trim() || "#CBC8C3",
      line: s.getPropertyValue("--particle-line").trim() || "#E4E2DE",
      accent: s.getPropertyValue("--color-accent").trim() || "#C2452B",
    };
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.max(24, Math.round((width * height) / DENSITY));
    bits = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      size: i % ACCENT_EVERY === 0 ? 5 : 4,
      accent: i % ACCENT_EVERY === 0,
      phase: Math.random() * Math.PI * 2,
    }));
  }

  function step(t) {
    ctx.clearRect(0, 0, width, height);

    // Flytta bitarna, studsa mjukt mot kanterna
    for (const b of bits) {
      b.x += b.vx;
      b.y += b.vy;
      if (b.x < 0 || b.x > width) b.vx *= -1;
      if (b.y < 0 || b.y > height) b.vy *= -1;
    }

    // Linjer mellan bitar som är nära varandra
    ctx.lineWidth = 1;
    ctx.strokeStyle = colors.line;
    for (let i = 0; i < bits.length; i++) {
      for (let j = i + 1; j < bits.length; j++) {
        const a = bits[i], b = bits[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < LINK_DISTANCE) {
          ctx.globalAlpha = 1 - d / LINK_DISTANCE;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      // Linjer till muspekaren
      const p = bits[i];
      const dp = Math.hypot(p.x - pointer.x, p.y - pointer.y);
      if (dp < POINTER_DISTANCE) {
        ctx.globalAlpha = (1 - dp / POINTER_DISTANCE) * 0.9;
        ctx.strokeStyle = colors.accent;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(pointer.x, pointer.y);
        ctx.stroke();
        ctx.strokeStyle = colors.line;
      }
    }

    // Själva bitarna: små fyrkanter. Tegelbitarna pulserar svagt.
    for (const b of bits) {
      ctx.globalAlpha = b.accent ? 0.55 + 0.45 * Math.sin(t / 900 + b.phase) : 1;
      ctx.fillStyle = b.accent ? colors.accent : colors.bit;
      ctx.fillRect(b.x - b.size / 2, b.y - b.size / 2, b.size, b.size);
    }
    ctx.globalAlpha = 1;

    if (running && !reduceMotion.matches) rafId = requestAnimationFrame(step);
  }

  let rafId = 0;
  function start() {
    running = true;
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(step);
  }

  readColors();
  resize();
  start(); // Ritar minst en gång, även med reducerad rörelse (statiskt nät)

  window.addEventListener("resize", () => { resize(); if (reduceMotion.matches) step(0); });
  window.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    pointer = { x: e.clientX - r.left, y: e.clientY - r.top };
  });
  window.addEventListener("pointerleave", () => { pointer = { x: -9999, y: -9999 }; });

  // Pausa när fliken inte syns – sparar batteri
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) running = false;
    else if (!reduceMotion.matches) start();
  });
})();
