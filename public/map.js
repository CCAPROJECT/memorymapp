const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const tooltip = document.getElementById("tooltip");
let mouse = { x: 0, y: 0 };
let hoverNode = null;

const mapImg = new Image();
mapImg.src = 'world-map.png'; // Ensure this is in your public directory

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

function drawNodes() {
  hoverNode = null;
  for (let node of nodes) {
    const x = node.xRatio * canvas.width;
    const y = node.yRatio * canvas.height;

    ctx.shadowColor = node.color;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fillStyle = node.color;
    ctx.fill();
    ctx.shadowBlur = 0;

    for (let target of nodes) {
      if (target !== node) {
        const tx = target.xRatio * canvas.width;
        const ty = target.yRatio * canvas.height;
        ctx.strokeStyle = "rgba(255,255,255,0.05)";
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(tx, ty);
        ctx.stroke();
      }
    }

    const dx = mouse.x - x;
    const dy = mouse.y - y;
    if (Math.sqrt(dx * dx + dy * dy) < 15) {
      hoverNode = { ...node, x, y };
    }
  }
}

canvas.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

canvas.addEventListener("click", (e) => {
  for (let node of nodes) {
    const x = node.xRatio * canvas.width;
    const y = node.yRatio * canvas.height;
    const dx = e.clientX - x;
    const dy = e.clientY - y;
    if (Math.sqrt(dx * dx + dy * dy) < 15) {
      window.open(node.link, "_blank");
    }
  }
});

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (mapImg.complete) {
    ctx.drawImage(mapImg, 0, 0, canvas.width, canvas.height);
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

      let imgX = hoverNode.x + 30;
      let imgY = hoverNode.y + 20;

      if (hoverNode.name === "Antarctica") {
        imgX = hoverNode.x - -0.9;
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

// 🔁 Check orientation on mobile and show overlay
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

window.addEventListener("resize", checkOrientation);
window.addEventListener("orientationchange", checkOrientation);
window.addEventListener("load", checkOrientation);
