// js/core/canvas.js
// Animated background canvas — fog wisps, star field, rune grid
// Self-contained, no exports needed

const bgCanvas = document.getElementById('world-canvas');
const bgCtx    = bgCanvas.getContext('2d');
let W, H, t = 0;

function resize() { W = bgCanvas.width = window.innerWidth; H = bgCanvas.height = window.innerHeight; }
resize();
window.addEventListener('resize', resize);

/* Floating fog blobs */
const fogs = Array.from({ length: 5 }, (_, i) => ({
  x: Math.random() * 1200, y: Math.random() * 900,
  r: 200 + Math.random() * 200,
  vx: (Math.random() - 0.5) * 0.15,
  vy: (Math.random() - 0.5) * 0.08,
  hue: [270, 30, 200, 260, 310][i],
  a: 0.04 + Math.random() * 0.04,
}));

function drawBg() {
  /* Deep purple gradient background */
  const bg = bgCtx.createRadialGradient(W * .5, H * .45, 0, W * .5, H * .45, Math.max(W, H) * .85);
  bg.addColorStop(0,  'hsl(258,28%,8%)');
  bg.addColorStop(.5, 'hsl(252,24%,5%)');
  bg.addColorStop(1,  'hsl(248,30%,3%)');
  bgCtx.fillStyle = bg;
  bgCtx.fillRect(0, 0, W, H);

  /* Subtle rune grid lines */
  bgCtx.save();
  bgCtx.strokeStyle = 'rgba(201,168,76,0.03)';
  bgCtx.lineWidth = 1;
  const sp = 52, steps = Math.ceil(Math.max(W, H) / sp) + 4;
  for (let i = -steps; i < steps * 2; i++) {
    bgCtx.beginPath(); bgCtx.moveTo(i * sp, 0); bgCtx.lineTo(i * sp - H, H); bgCtx.stroke();
    bgCtx.beginPath(); bgCtx.moveTo(i * sp, 0); bgCtx.lineTo(i * sp + H, H); bgCtx.stroke();
  }
  bgCtx.restore();

  /* Drifting fog orbs */
  fogs.forEach(f => {
    f.x += f.vx; f.y += f.vy;
    if (f.x < -f.r) f.x = W + f.r; if (f.x > W + f.r) f.x = -f.r;
    if (f.y < -f.r) f.y = H + f.r; if (f.y > H + f.r) f.y = -f.r;
    const g = bgCtx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r);
    g.addColorStop(0, `hsla(${f.hue},50%,25%,${f.a})`);
    g.addColorStop(1, 'transparent');
    bgCtx.fillStyle = g;
    bgCtx.beginPath(); bgCtx.arc(f.x, f.y, f.r, 0, Math.PI * 2); bgCtx.fill();
  });

  /* Twinkling star field */
  bgCtx.fillStyle = 'rgba(220,200,160,0.4)';
  for (let s = 0; s < 80; s++) {
    const sx = (s * 137.5) % W;
    const sy = (s * 91.3)  % H;
    const sa = Math.sin(t * 0.8 + s) * 0.3 + 0.4;
    bgCtx.globalAlpha = sa * 0.3;
    bgCtx.beginPath(); bgCtx.arc(sx, sy, 0.8, 0, Math.PI * 2); bgCtx.fill();
  }
  bgCtx.globalAlpha = 1;
}

function loop() {
  /* If reduce effects is on — skip drawing, save battery */
  const s = window.getSettings?.() || {};
  if (!s.reduceEffects) {
    t += 0.016;
    bgCtx.clearRect(0, 0, W, H);
    drawBg();
  }
  requestAnimationFrame(loop);
}
loop();
