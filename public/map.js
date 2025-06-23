const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
}

resizeCanvas();
window.addEventListener("resize", () => {
  resizeCanvas();
  checkOrientation();
});

const tooltip = document.getElementById("tooltip");
let mouse = { x: 0, y: 0 };
let hoverNode = null;

const mapImg = new Image();
mapImg.src = 'world-map.jpg';

const nodes = [
  { name: "Africa", xRatio: 0.554, yRatio: 0.48, color: "black", link: "https://drive.google.com/drive/folders/1uh7xhju8vr7qaGvfxSwdetxghjaExShr?usp=drive_link" },
  { name: "Europe", xRatio: 0.54, yRatio: 0.23, color: "blue", link: "https://drive.google.com/drive/folders/1TxImjvrWV8ZbMBczkBHboP_XBMZEZWDC?usp=drive_link" },
  { name: "Asia", xRatio: 0.73, yRatio: 0.19, color: "yellow", link: "https://drive.google.com/drive/folders/1wZDQDcx_tvWG-epal5AK9BX74W9gxmXX?usp=drive_link" },
  { name: "North America", xRatio: 0.26, yRatio: 0.28, color: "red", link: "https://drive.google.com/drive/folders/1um7pugbMnzJBz8nOoug2CKC6vCUkMDBM?usp=drive_link" },
  { name: "South America", xRatio: 0.35, yRatio: 0.60, color: "green", link: "https://drive.google.com/drive/folders/1Cy-VQYlAqQ7jNlFCFxVnBZGbPKcG7zoJ?usp=drive_link" },
  { name: "Australia", xRatio: 0.81, yRatio: 0.68, color: "orange", link: "https://drive.google.com/drive/folders/1kz2mvuWANTBsy7egWegv55c2WfCuvODL?usp=drive_link" },
  { name: "Antarctica", xRatio: 0.59, yRatio: 0.90, color: "cyan", link: "https://drive.google.com/drive/folders/1IkjVZOYbDHP0uAhsQImEW5MKDn92kTm0?usp=drive_link" }
];

// 🟡 Country Anchors for glowing particles
const countryAnchors = [
  { name: "Nigeria", xRatio: 0.515, yRatio: 0.45, color: "black", continent: "Africa" },
  { name: "France", xRatio: 0.52, yRatio: 0.25, color: "blue", continent: "Europe" },
  { name: "China", xRatio: 0.76, yRatio: 0.24, color: "yellow", continent: "Asia" },
  { name: "Brazil", xRatio: 0.37, yRatio: 0.63, color: "green", continent: "South America" },
  // You can add more glowing countries here if needed
];

// 📦 Preload preview images
const previews = {};
for (const node of nodes) {
  const img = new Image();
  const imgName = `${node.name.toLowerCase().replace(/\s+/g, "-")}-img.png`;
  img.src = imgName;
  previews[node.name] = img;
}

// 🌍 Particle System
const continentParticles = [];

function generateContinentParticles() {
  const numPerContinent = 30;

  for (let node of nodes) {
    for (let i = 0; i < numPerContinent; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 20 + Math.random() * 40;
      const speed = 0.005 + Math.random() * 0.005;

      continentParticles.push({
        centerXRatio: node.xRatio,
        centerYRatio: node.yRatio,
        angle,
        radius,
        speed,
        color: node.color,
        glow: false
      });
    }
  }

// Add glowing particles for specific countries
for (let anchor of countryAnchors) {
  const angle = Math.random() * Math.PI * 2;

  // 🌟 Custom smaller radius for Nigeria only
  const radius = anchor.name === "Nigeria"
    ? 5 + Math.random() * 5  // 🔽 Small orbit for Nigeria
    : 10 + Math.random() * 15;

  const speed = 0.008;

  continentParticles.push({
    centerXRatio: anchor.xRatio,
    centerYRatio: anchor.yRatio,
    angle,
    radius,
    speed,
    color: anchor.color,
    glow: true
  });
}
}
generateContinentParticles();

function drawContinentParticles() {
  const time = Date.now() * 0.002;
  for (let p of continentParticles) {
    p.angle += p.speed;

    const centerX = p.centerXRatio * window.innerWidth;
    const centerY = p.centerYRatio * window.innerHeight;

    const x = centerX + Math.cos(p.angle) * p.radius;
    const y = centerY + Math.sin(p.angle) * p.radius;

    const size = p.glow ? 2.5 + Math.sin(time) * 1.5 : 1.8;

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = p.color;

    if (p.glow) {
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 15;
    }

    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

// 🌐 Draw Nodes (Continents)
function drawNodes() {
  hoverNode = null;
  for (let node of nodes) {
    const x = node.xRatio * window.innerWidth;
    const y = node.yRatio * window.innerHeight;

    ctx.shadowColor = node.color;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = node.color;
    ctx.fill();
    ctx.shadowBlur = 0;

    for (let target of nodes) {
      if (target !== node) {
        const tx = target.xRatio * window.innerWidth;
        const ty = target.yRatio * window.innerHeight;
        ctx.strokeStyle = "rgba(255,255,255,0.05)";
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(tx, ty);
        ctx.stroke();
      }
    }

    const dx = mouse.x - x;
    const dy = mouse.y - y;
    if (Math.sqrt(dx * dx + dy * dy) < 25) {
      hoverNode = { ...node, x, y };
    }
  }
}

// 🖱️ Interactions
canvas.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});
canvas.addEventListener("touchstart", (e) => {
  if (e.touches.length > 0) {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
  }
});
canvas.addEventListener("touchmove", (e) => {
  if (e.touches.length > 0) {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
  }
});
canvas.addEventListener("click", (e) => {
  const mouseX = e.clientX;
  const mouseY = e.clientY;
  for (let node of nodes) {
    const x = node.xRatio * window.innerWidth;
    const y = node.yRatio * window.innerHeight;
    const dx = mouseX - x;
    const dy = mouseY - y;
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      window.open(node.link, "_blank");
    }
  }
});

// 🔁 Animation Loop
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  if (mapImg.complete) {
    ctx.drawImage(mapImg, 0, 0, window.innerWidth, window.innerHeight);
  }

  drawContinentParticles(); // 🌍 with glowing ones!
  drawNodes();

  if (hoverNode) {
    tooltip.innerText = hoverNode.name;
    tooltip.style.left = hoverNode.x + 20 + "px";
    tooltip.style.top = hoverNode.y + "px";
    tooltip.style.display = "block";

    const img = previews[hoverNode.name];
    if (img && img.complete) {
      const previewWidth = 200;
      const previewHeight = 120;
      let imgX = hoverNode.x + 1;
      let imgY = hoverNode.y + 1;
      if (hoverNode.name === "Antarctica") {
        imgX = hoverNode.x - 0.2;
        imgY = hoverNode.y - 130;
      }
      ctx.drawImage(img, imgX, imgY, previewWidth, previewHeight);
    }
  } else {
    tooltip.style.display = "none";
  }

  requestAnimationFrame(draw);
}
draw();

// 📱 Orientation
function checkOrientation() {
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isPortrait = window.innerHeight > window.innerWidth;
  const notice = document.getElementById('rotate-notice');
  notice.style.display = (isMobile && isPortrait) ? "flex" : "none";
}
window.addEventListener("orientationchange", checkOrientation);
window.addEventListener("load", () => {
  resizeCanvas();
  checkOrientation();
});
