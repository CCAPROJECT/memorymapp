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

const countryAnchors = [
  { name: "Nigeria", xRatio: 0.515, yRatio: 0.45, color: "black", continent: "Africa", flagColors: ["green", "white", "green"] },
  { name: "France", xRatio: 0.52, yRatio: 0.25, color: "blue", continent: "Europe", flagColors: ["blue", "white", "red"] },
  { name: "China", xRatio: 0.76, yRatio: 0.24, color: "yellow", continent: "Asia", flagColors: ["red", "gold"] },
  { name: "Brazil", xRatio: 0.37, yRatio: 0.63, color: "green", continent: "South America", flagColors: ["green", "yellow", "blue"] },
  { name: "Canada", xRatio: 0.26, yRatio: 0.19, color: "red", continent: "North America", flagColors: ["red", "white"] },
  { name: "Sydney", xRatio: 0.84, yRatio: 0.69, color: "orange", continent: "Australia", flagColors: ["blue", "red", "white"] },
  { name: "South Pole", xRatio: 0.59, yRatio: 0.93, color: "cyan", continent: "Antarctica", flagColors: ["white", "blue"] }
];

const previews = {};
for (const node of nodes) {
  const img = new Image();
  const imgName = `${node.name.toLowerCase().replace(/\s+/g, "-")}-img.png`;
  img.src = imgName;
  previews[node.name] = img;
}

const continentParticles = [];

function generateContinentParticles() {
  const numPerContinent = 30;

  for (let node of nodes) {
    const continent = node.name;
    for (let i = 0; i < numPerContinent; i++) {
      let offsetX = 0, offsetY = 0;

      switch (continent) {
        case "Africa": offsetX = (Math.random() - 0.5) * 0.06; offsetY = (Math.random() - 0.3) * 0.15; break;
        case "Europe": offsetX = (Math.random() - 0.5) * 0.05; offsetY = (Math.random() - 0.5) * 0.06; break;
        case "Asia": offsetX = (Math.random() - 0.5) * 0.14; offsetY = (Math.random() - 0.2) * 0.12; break;
        case "North America": offsetX = (Math.random() - 0.4) * 0.10; offsetY = (Math.random() - 0.3) * 0.12; break;
        case "South America": offsetX = (Math.random() - 0.5) * 0.07; offsetY = (Math.random() - 0.4) * 0.10; break;
        case "Australia": offsetX = (Math.random() - 0.4) * 0.05 + 0.03; offsetY = (Math.random() - 0.5) * 0.05; break;
        case "Antarctica": offsetX = (Math.random() - 0.5) * 0.06; offsetY = (Math.random() - 0.4) * 0.03; break;
      }

      const angle = Math.random() * Math.PI * 2;
      const radius = 15 + Math.random() * 25;
      const speed = 0.003 + Math.random() * 0.003;

      continentParticles.push({
        centerXRatio: node.xRatio + offsetX,
        centerYRatio: node.yRatio + offsetY,
        angle,
        radius,
        speed,
        color: node.color,
        glow: false
      });
    }
  }

  for (let anchor of countryAnchors) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 10 + Math.random() * 15;
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

function hexToRgb(color) {
  const temp = document.createElement("div");
  temp.style.color = color;
  document.body.appendChild(temp);
  const rgb = getComputedStyle(temp).color;
  document.body.removeChild(temp);
  const match = rgb.match(/\d+/g);
  return match ? match.slice(0, 3).join(",") : "255,255,255";
}

function drawContinentParticles() {
  const time = Date.now() * 0.002;

  for (let p of continentParticles) {
    p.angle += p.speed;

    const centerX = p.centerXRatio * window.innerWidth;
    const centerY = p.centerYRatio * window.innerHeight;
    const x = centerX + Math.cos(p.angle) * p.radius;
    const y = centerY + Math.sin(p.angle) * p.radius;

    let size = p.glow ? 3 + Math.sin(time * 4) * 1.5 : 1.8;

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);

    if (p.glow) {
      const alpha = 0.5 + 0.5 * Math.sin(time * 4);
      const anchor = countryAnchors.find(a =>
        Math.abs(a.xRatio - p.centerXRatio) < 0.001 &&
        Math.abs(a.yRatio - p.centerYRatio) < 0.001
      );

      if (anchor && anchor.flagColors.length > 0) {
        const index = Math.floor(time * 2) % anchor.flagColors.length;
        const rgb = hexToRgb(anchor.flagColors[index]);
        ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
        ctx.shadowColor = anchor.flagColors[index];
      } else {
        ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
        ctx.shadowColor = "yellow";
      }

      ctx.shadowBlur = 20;
    } else {
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 0;
    }

    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

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

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (mapImg.complete) {
    ctx.drawImage(mapImg, 0, 0, window.innerWidth, window.innerHeight);
  }

  drawContinentParticles();
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
