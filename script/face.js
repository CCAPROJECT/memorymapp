const video = document.getElementById("camera");
const audio = document.getElementById("smile-sound");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let detector;
let blinkTimes = [];
let nodesHidden = false;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function drawFakeNodes() {
  if (nodesHidden) return;
  for (let i = 0; i < 8; i++) {
    const node = document.createElement("div");
    node.className = "node";
    node.style.left = `${Math.random() * window.innerWidth}px`;
    node.style.top = `${Math.random() * window.innerHeight}px`;
    document.body.appendChild(node);
  }
}

function hideNodes() {
  document.querySelectorAll(".node").forEach(n => n.remove());
  nodesHidden = true;
}

async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  return new Promise(resolve => {
    video.onloadedmetadata = () => {
      video.play();
      resolve(video);
    };
  });
}

async function initFaceDetection() {
  await tf.setBackend("webgl");
  await tf.ready();

  const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
  detector = await faceLandmarksDetection.createDetector(model, {
    runtime: "tfjs",
    refineLandmarks: true,
  });

  detectLoop();
}

async function detectLoop() {
  if (!video || video.readyState < 2 || !detector) {
    requestAnimationFrame(detectLoop);
    return;
  }

  const now = Date.now();
  const faces = await detector.estimateFaces(video);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (faces.length > 0) {
    const keypoints = faces[0].keypoints;

    // ✅ Use alternative eye landmarks (more stable across lighting)
    const upperEye = keypoints[386].y;
    const lowerEye = keypoints[374].y;
    const eyeOpenness = Math.abs(upperEye - lowerEye);

    // Estimate face size to auto-scale blink threshold
    const topFace = Math.min(...keypoints.map(p => p.y));
    const bottomFace = Math.max(...keypoints.map(p => p.y));
    const faceHeight = bottomFace - topFace;
    const blinkThreshold = faceHeight * 0.05;

    if (eyeOpenness < blinkThreshold) {
      if (blinkTimes.length === 0 || now - blinkTimes[blinkTimes.length - 1] > 300) {
        blinkTimes.push(now);
        console.log("👁️ Blink detected — eyeOpenness:", eyeOpenness.toFixed(2));
      }
    }

    blinkTimes = blinkTimes.filter(t => now - t < 1500);
    if (blinkTimes.length >= 2) {
      console.log("🎉 Double blink detected — playing sound!");
      audio.currentTime = 0;
      audio.play().catch(e => console.warn("🔇 Audio error:", e));
      blinkTimes = [];
    }

    // 😄 Smile detection
    const leftMouth = keypoints[61];
    const rightMouth = keypoints[291];
    const smileWidth = Math.abs(rightMouth.x - leftMouth.x);

    if (smileWidth > 60 && !nodesHidden) {
      console.log("😄 Smile detected — hiding nodes!");
      hideNodes();
    }

    // Draw keypoints
    keypoints.forEach(point => {
      const x = point.x / video.videoWidth * canvas.width;
      const y = point.y / video.videoHeight * canvas.height;
      ctx.fillStyle = "lime";
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, 2 * Math.PI);
      ctx.fill();
    });
  } else {
    console.log("⚠️ No face detected");
  }

  requestAnimationFrame(detectLoop);
}

window.addEventListener("DOMContentLoaded", async () => {
  await setupCamera();
  drawFakeNodes();
  await initFaceDetection();

  // Unlock audio on load (browsers might still restrict it)
  try {
    audio.play().then(() => {
      audio.pause();
      audio.currentTime = 0;
      console.log("🔓 Audio unlocked");
    });
  } catch (e) {
    console.warn("🔇 Audio unlock failed:", e);
  }
});
