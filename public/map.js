const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;

  // Set canvas size in actual pixels * devicePixelRatio
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;

  // Set CSS size to actual window size
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";

  // Reset any existing transform before scaling
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  // Scale drawing context to device pixel ratio
  ctx.scale(dpr, dpr);

  // Enable high-quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
}

resizeCanvas(); // initial resize

window.addEventListener("resize", () => {
  resizeCanvas();
  checkOrientation();
});

const tooltip = document.getElementById("tooltip");
let mouse = { x: 0, y: 0 };
let hoverNode = null;

const mapImg = new Image();
mapImg.src = 'world-map.png';

const nodes = [
  { name: "Africa", xRatio: 0.554, yRatio: 0.48, color: "black", link: "https://drive.google.com/drive/folders/1uh7xhju8vr7qaGvfxSwdetxghjaExShr?usp=drive_link" },
  { name: "Europe", xRatio: 0.54, yRatio: 0.23, color: "blue", link: "https://drive.google.com/drive/folders/1TxImjvrWV8ZbMBczkBHboP_XBMZEZWDC?usp=drive_link" },
  { name: "Asia", xRatio: 0.73, yRatio: 0.19, color: "yellow", link: "https://drive.google.com/drive/folders/1wZDQDcx_tvWG-epal5AK9BX74W9gxmXX?usp=drive_link" },
  { name: "North America", xRatio: 0.26, yRatio: 0.28, color: "red", link: "https://drive.google.com/drive/folders/1um7pugbMnzJBz8nOoug2CKC6vCUkMDBM?usp=drive_link" },
  { name: "South America", xRatio: 0.35, yRatio: 0.60, color: "green", link: "https://drive.google.com/drive/folders/1Cy-VQYlAqQ7jNlFCFxVnBZGbPKcG7zoJ?usp=drive_link" },
  { name: "Australia", xRatio: 0.81, yRatio: 0.68, color: "orange", link: "https://drive.google.com/drive/folders/1kz2mvuWANTBsy7egWegv55c2WfCuvODL?usp=drive_link" },
  { name: "Antarctica", xRatio: 0.59, yRatio: 0.90, color: "cyan", link: "https://drive.google.com/drive/folders/1IkjVZOYbDHP0uAhsQImEW5MKDn92kTm0?usp=drive_link" }
];

// Preload preview images
const previews = {};
for (const node of nodes) {
  const img = new Image();
  const imgName = `${node.name.toLowerCase().replace(/\s+/g, "-")}-img.png`;
  img.src = imgName;
  previews[node.name] = img;
}

// Helper to get device pixel ratio for mouse coordinates
const dpr = window.devicePixelRatio || 1;

function drawNodes() {
  hoverNode = null;
  for (let node of nodes) {
    const x = node.xRatio * window.innerWidth;  // use CSS pixels for positions
    const y = node.yRatio * window.innerHeight;

    ctx.shadowColor = node.color;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
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
    if (Math.sqrt(dx * dx + dy * dy) < 7) {  // increased radius for easier hover
      hoverNode = { ...node, x, y };
    }
  }
}

canvas.addEventListener("mousemove", (e) => {
  // Convert mouse coords from device pixels to CSS pixels
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

canvas.addEventListener("click", (e) => {
  const mouseX = e.clientX;
  const mouseY = e.clientY;
  for (let node of nodes) {
    const x = node.xRatio * window.innerWidth;
    const y = node.yRatio * window.innerHeight;
    const dx = mouseX - x;
    const dy = mouseY - y;
    if (Math.sqrt(dx * dx + dy * dy) < 7) {  // match hover radius
      window.open(node.link, "_blank");
    }
  }
});

function draw() {
  // Clear entire canvas (in device pixels)
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  if (mapImg.complete) {
    // Draw map to fill CSS size, canvas is scaled internally by DPR
    ctx.drawImage(mapImg, 0, 0, window.innerWidth, window.innerHeight);
  }

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

// 🔁 Mobile orientation check
function checkOrientation() {
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isPortrait = window.innerHeight > window.innerWidth;
  const notice = document.getElementById('rotate-notice');
  if (isMobile && isPortrait) {
    notice.style.display = "flex";
  } else {
    notice.style.display = "none";
  }
}

window.addEventListener("orientationchange", checkOrientation);
window.addEventListener("load", () => {
  resizeCanvas();
  checkOrientation();
});
