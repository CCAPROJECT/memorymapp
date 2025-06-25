const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const tooltip = document.getElementById("tooltip");

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const mapImg = new Image();
mapImg.src = 'public/world-map.jpg';

const nodes = [
  { name: "Africa", xRatio: 0.554, yRatio: 0.48, color: "black", link: "https://drive.google.com/..." },
  { name: "Europe", xRatio: 0.54, yRatio: 0.23, color: "blue", link: "https://drive.google.com/..." },
  { name: "Asia", xRatio: 0.73, yRatio: 0.19, color: "yellow", link: "https://drive.google.com/..." },
  { name: "North America", xRatio: 0.26, yRatio: 0.28, color: "red", link: "https://drive.google.com/..." },
  { name: "South America", xRatio: 0.35, yRatio: 0.60, color: "green", link: "https://drive.google.com/..." },
  { name: "Australia", xRatio: 0.81, yRatio: 0.68, color: "orange", link: "https://drive.google.com/..." },
  { name: "Antarctica", xRatio: 0.59, yRatio: 0.90, color: "cyan", link: "https://drive.google.com/..." }
];

let mouse = { x: 0, y: 0 };
let hoverNode = null;

canvas.addEventListener("mousemove", e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});
canvas.addEventListener("click", e => {
  const mx = e.clientX, my = e.clientY;
  for (let node of nodes) {
    const x = node.xRatio * window.innerWidth;
    const y = node.yRatio * window.innerHeight;
    const dx = mx - x;
    const dy = my - y;
    if (Math.sqrt(dx * dx + dy * dy) < 25) {
      window.open(node.link, "_blank");
    }
  }
});

function drawNodes() {
  hoverNode = null;
  for (let node of nodes) {
    const x = node.xRatio * window.innerWidth;
    const y = node.yRatio * window.innerHeight;

    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = node.color;
    ctx.fill();

    const dx = mouse.x - x;
    const dy = mouse.y - y;
    if (Math.sqrt(dx * dx + dy * dy) < 25) {
      hoverNode = { ...node, x, y };
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (mapImg.complete) {
    ctx.drawImage(mapImg, 0, 0, window.innerWidth, window.innerHeight);
  }

  drawNodes();

  if (hoverNode) {
    tooltip.innerText = hoverNode.name;
    tooltip.style.left = hoverNode.x + 20 + "px";
    tooltip.style.top = hoverNode.y + "px";
    tooltip.style.display = "block";
  } else {
    tooltip.style.display = "none";
  }

  requestAnimationFrame(draw);
}
draw();
