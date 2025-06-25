const video = document.getElementById("camera");
const audio = document.getElementById("smile-sound");

let detector; // ✅ This must be global
let lastTriggerTime = 0; // ✅ Also global if you're using it

async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  return new Promise(resolve => {
    video.onloadedmetadata = () => {
      video.play();
      video.setAttribute("playsinline", true);
      video.style.display = "none";
      video.style.transform = "scaleX(-1)";
      resolve();
    };
  });
}

async function initFaceDetection() {
  await tf.setBackend("webgl");
  await tf.ready();

  const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
  detector = await faceLandmarksDetection.createDetector(model, {
    runtime: "tfjs",
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
  if (faces.length > 0) {
    console.log(`😃 Detected ${faces.length} face(s)`);

    const keypoints = faces[0].keypoints;

    const leftMouth = keypoints[61];
    const rightMouth = keypoints[291];
    const mouthDistance = Math.abs(rightMouth.x - leftMouth.x);

    console.log("👄 Mouth width:", mouthDistance);

    if (mouthDistance > 60) {
      console.log("✅ Smile width threshold passed");

      const now = Date.now();
      if (now - lastTriggerTime > 3000) {
        lastTriggerTime = now;
        if (audio) {
          audio.currentTime = 0;
          audio.play().then(() => {
            console.log("🔊 Sound played");
          }).catch(err => {
            console.warn("🔇 Audio play failed:", err);
          });
        }
      }
    } else {
      console.log("❌ Not smiling wide enough");
    }
  } else {
    console.log("🚫 No face detected");
  }

  requestAnimationFrame(detectLoop);
}

window.addEventListener("DOMContentLoaded", async () => {
  try {
    await setupCamera();
    await initFaceDetection();

    // ✅ Unlock audio only after user gesture (browser autoplay policy)
    window.addEventListener("click", () => {
      audio.play().then(() => {
        audio.pause();
        audio.currentTime = 0;
        console.log("🔓 Audio unlocked by user gesture");
      }).catch(err => console.warn("🔇 Audio unlock failed:", err));
    }, { once: true });

  } catch (e) {
    console.warn("❌ Smile detection setup failed:", e);
  }
});
