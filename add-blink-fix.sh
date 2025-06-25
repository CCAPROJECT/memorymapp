
#!/bin/bash

echo "🔧 Injecting working blink detection and audio fixes..."

# Replace face.js with working code
cat > public/scripts/face.js <<'EOF'
let detector;
let video = document.getElementById("camera");
const audio = document.getElementById("smile-sound");

let blinkTimes = [];

async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      video.play();
      resolve(video);
    };
  });
}

async function initFaceDetection() {
  await tf.setBackend('webgl');
  await tf.ready();

  const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
  detector = await faceLandmarksDetection.createDetector(model, {
    runtime: 'tfjs',
    refineLandmarks: true
  });

  detectLoop();
}

async function detectLoop() {
  if (!video || video.readyState < 2 || !detector) {
    requestAnimationFrame(detectLoop);
    return;
  }

  const faces = await detector.estimateFaces(video);
  const now = Date.now();

  if (faces.length > 0) {
    const keypoints = faces[0].keypoints;

    const leftEye = Math.abs(keypoints[159].y - keypoints[145].y);
    const rightEye = Math.abs(keypoints[386].y - keypoints[374].y);
    const eyeOpenness = (leftEye + rightEye) / 2;

    if (eyeOpenness < 4.5) {
      if (blinkTimes.length === 0 || now - blinkTimes[blinkTimes.length - 1] > 300) {
        blinkTimes.push(now);
        console.log("👁️ Blink detected at", now);
      }
    }

    blinkTimes = blinkTimes.filter(t => now - t < 1500);

    if (blinkTimes.length >= 2) {
      console.log("🎉 Double blink detected — playing sound!");
      audio.currentTime = 0;
      audio.play().catch(e => console.warn("🔇 Audio error:", e));
      blinkTimes = [];
    }
  }

  requestAnimationFrame(detectLoop);
}

window.addEventListener("DOMContentLoaded", async () => {
  await setupCamera();
  await initFaceDetection();

  // Unlock audio for autoplay
  audio.play().then(() => {
    audio.pause();
    audio.currentTime = 0;
    console.log("🔓 Audio unlocked");
  }).catch(e => console.warn("🔇 Audio unlock failed:", e));
});
EOF

echo "✅ Blink detection script installed at public/scripts/face.js"
