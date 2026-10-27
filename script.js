// ---------- confetti (no libraries) ----------
const canvas = document.getElementById("confetti");
const ctx = canvas.getContext("2d");
const colors = ["#ff6ec7", "#b388ff", "#6ee7ff", "#d4ff4f", "#ffffff", "#ffd166"];
let pieces = [];
let running = false;
function start() {
  if (!running) { running = true; requestAnimationFrame(tick); }
}

function resize() {
  canvas.width = innerWidth * devicePixelRatio;
  canvas.height = innerHeight * devicePixelRatio;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}
addEventListener("resize", resize);
resize();

function burst(count = 160, x = innerWidth / 2, y = innerHeight / 2) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 10;
    pieces.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 6,
      size: 6 + Math.random() * 7,
      color: colors[(Math.random() * colors.length) | 0],
      rot: Math.random() * 360,
      vr: (Math.random() - 0.5) * 20,
      life: 0,
      shape: Math.random() < 0.3 ? "circle" : "rect",
    });
  }
  start();
}

function rain(count = 120) {
  for (let i = 0; i < count; i++) {
    pieces.push({
      x: Math.random() * innerWidth, y: -20 - Math.random() * innerHeight * 0.5,
      vx: (Math.random() - 0.5) * 2, vy: 2 + Math.random() * 3,
      size: 6 + Math.random() * 6, color: colors[(Math.random() * colors.length) | 0],
      rot: Math.random() * 360, vr: (Math.random() - 0.5) * 12, life: 0,
      shape: Math.random() < 0.3 ? "circle" : "rect",
    });
  }
  start();
}

function tick() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  pieces = pieces.filter((p) => p.y < innerHeight + 40 && p.life < 600);
  for (const p of pieces) {
    p.vy += 0.18;
    p.vx *= 0.99;
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    p.life++;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rot * Math.PI) / 180);
    ctx.fillStyle = p.color;
    if (p.shape === "circle") {
      ctx.beginPath();
      ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    }
    ctx.restore();
  }
  if (pieces.length) requestAnimationFrame(tick);
  else running = false;
}

// ---------- gate ----------
const gate = document.getElementById("gate");
const song = document.getElementById("song");
const musicBtn = document.getElementById("musicBtn");

document.getElementById("openBtn").addEventListener("click", () => {
  document.getElementById("envelope").classList.add("open");
  setTimeout(() => {
    gate.classList.add("gone");
    document.body.classList.remove("locked");
    burst(220);
    setTimeout(() => rain(150), 500);
    typeLines();
    tryMusic();
  }, 550);
});

// ---------- typing text ----------
const lines = [
  "the main character has entered the chat 💅",
  "today is literally a national holiday 🎉",
  "it's giving birthday queen energy 👑",
  "another year of being iconic, no cap ✨",
];
const typedEl = document.getElementById("typed");
function typeLines() {
  let li = 0, ci = 0, deleting = false;
  (function step() {
    const line = lines[li];
    typedEl.textContent = line.slice(0, ci);
    if (!deleting && ci < line.length) { ci++; return setTimeout(step, 55); }
    if (!deleting) { deleting = true; return setTimeout(step, 1800); }
    if (ci > 0) { ci--; return setTimeout(step, 25); }
    deleting = false;
    li = (li + 1) % lines.length;
    setTimeout(step, 300);
  })();
}

// ---------- music (optional: add music/song.mp3) ----------
function tryMusic() {
  song.play()
    .then(() => { musicBtn.hidden = false; musicBtn.classList.add("playing"); })
    .catch(() => {});
}
musicBtn.addEventListener("click", () => {
  if (song.paused) { song.play(); musicBtn.classList.add("playing"); }
  else { song.pause(); musicBtn.classList.remove("playing"); }
});

// ---------- photo fallback ----------
// tries 1.jpg, then 1.jpeg / 1.png / 1.webp, then shows a 🎀 placeholder
const exts = ["jpg", "jpeg", "png", "webp", "JPG", "PNG"];
document.querySelectorAll(".ph img").forEach((img) => {
  const base = img.getAttribute("src").replace(/\.[^.]+$/, "");
  let i = 0;
  const next = () => {
    i++;
    if (i < exts.length) img.src = `${base}.${exts[i]}`;
    else { img.parentElement.classList.add("empty"); img.remove(); }
  };
  img.addEventListener("error", next);
  if (img.complete && img.naturalWidth === 0) next();
});

// ---------- scroll reveal ----------
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (e.isIntersecting) {
      const delay = [...e.target.parentElement.children].indexOf(e.target) * 90;
      setTimeout(() => e.target.classList.add("in"), delay);
      io.unobserve(e.target);
    }
  }),
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// ---------- flip cards ----------
document.querySelectorAll(".flip").forEach((card) =>
  card.addEventListener("click", () => {
    card.classList.toggle("flipped");
    if (card.classList.contains("flipped")) {
      const r = card.getBoundingClientRect();
      burst(30, r.left + r.width / 2, r.top + r.height / 2);
    }
  })
);

// ---------- cake ----------
const flames = [...document.querySelectorAll(".flame")];
const hint = document.getElementById("cakeHint");
let wished = false;
document.querySelectorAll(".candle").forEach((c, i) =>
  c.addEventListener("click", (ev) => {
    ev.stopPropagation();
    blow(i);
  })
);
document.getElementById("cake").addEventListener("click", () => {
  const lit = flames.findIndex((f) => !f.classList.contains("out"));
  if (lit !== -1) blow(lit);
});
function blow(i) {
  flames[i].classList.add("out");
  const left = flames.filter((f) => !f.classList.contains("out")).length;
  hint.textContent = left ? `${left} more to go... 🌬️` : "yesss 🎉";
  if (!left && !wished) {
    wished = true;
    document.getElementById("wishDone").classList.add("show");
    burst(250);
    setTimeout(() => rain(200), 400);
  }
}

// ---------- extra confetti ----------
document.getElementById("partyBtn").addEventListener("click", (e) => {
  burst(200, e.clientX, e.clientY);
  rain(120);
});
