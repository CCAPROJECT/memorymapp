const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const tooltip = document.getElementById("tooltip");
let mouse = { x: 0, y: 0 };
let hoverNode = null;

const mapImg = new Image();
mapImg.src = 'world-map.png'; // Make sure it's in public/

const nodes = [
  { name: "Africa", xRatio: 0.52, yRatio: 0.58, color: "white", link: "https://drive.google.com/" },
  { name: "Europe", xRatio: 0.50, yRatio: 0.37, color: "blue", link: "https://example.com" },
  { name: "Asia", xRatio: 0.70, yRatio: 0.35, color: "yellow", link: "https://youtube.com" },
  { name: "North America", xRatio: 0.22, yRatio: 0.33, color: "red", link: "https://north.com" },
  { name: "South America", xRatio: 0.29, yRatio: 0.60, color: "green", link: "https://south.com" },
  { name: "Australia", xRatio: 0.84, yRatio: 0.75, color: "orange", link: "https://australia.com" },
  { name: "Antarctica", xRatio: 0.50, yRatio: 0.95, color: "cyan", link: "https://antarctica.com" }
];

// Preload preview images
const previews = {};
for (const node of nodes) {
  const img = new Image();
  const imgName = `${node.name.toLowerCase().replace(/\s+/g, "-")}-img.png`; // e.g. "north-america-img.png"
  img.src = imgName;
  previews[node.name] = img;
}

function drawNodes() {
  hoverNode = null;
  for (let node of nodes) {
    const x = node.xRatio * canvas.width;
    const y = node.yRatio * canvas.height;

    // Glowing node
    ctx.shadowColor = node.color;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fillStyle = node.color;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Connect lines
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

    // Hover detection
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
  
      // Adjust this part for Antarctica to center the image
      let imgX = hoverNode.x + 30;
      let imgY = hoverNode.y + 20;
  
      // If the node is Antarctica, adjust the image position slightly
      if (hoverNode.name === "Antarctica") {
        imgX = hoverNode.x - -0.9; // Move image left (adjust as needed)
        imgY = hoverNode.y - 130; // Move image up (adjust as needed)
      }
  
      ctx.drawImage(img, imgX, imgY, previewWidth, previewHeight);
    }
  } else {
    tooltip.style.display = "none";
  }

  requestAnimationFrame(draw);
}

draw();
