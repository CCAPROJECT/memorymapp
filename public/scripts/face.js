let detector;
const video = document.getElementById("camera");

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

  const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
  detector = await faceLandmarksDetection.createDetector(model, {
    runtime: "mediapipe",
    refineLandmarks: true,
    solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh",
  });

  detectLoop();
}

let lastEmotion = "";
let lastTriggerTime = 0;

function updateMap(emotion) {
  const now = Date.now();
  if (emotion === lastEmotion && now - lastTriggerTime < 3000) return; // prevent spam

  lastEmotion = emotion;
  lastTriggerTime = now;

  // React visually to emotion
  switch (emotion) {
    case "happy":
      document.body.style.filter = "brightness(1.2)";
      console.log("😊 Map brightened (happy)");
      break;
    case "curious":
      document.body.style.filter = "hue-rotate(60deg)";
      console.log("😮 Map hue changed (curious)");
      break;
    case "neutral":
    default:
      document.body.style.filter = "none";
      console.log("😐 Map reset (neutral)");
  }
}

async function detectLoop() {
  if (!video || video.readyState < 2 || !detector) {
    requestAnimationFrame(detectLoop);
    return;
  }

  const faces = await detector.estimateFaces(video);
  if (faces.length > 0) {
    const keypoints = faces[0].keypoints;

    const leftMouth = keypoints[61];
    const rightMouth = keypoints[291];
    const mouthDistance = Math.abs(rightMouth.x - leftMouth.x);

    const upperEye = keypoints[159].y;
    const lowerEye = keypoints[145].y;
    const eyeOpenness = Math.abs(upperEye - lowerEye);

    const nose = keypoints[1].x;
    const faceCenter = (leftMouth.x + rightMouth.x) / 2;
    const delta = nose - faceCenter;

    // 🔍 Emotion Inference
    if (mouthDistance > 60) {
      updateMap("happy");
    } else if (eyeOpenness < 2.5) {
      updateMap("curious");
    } else {
      updateMap("neutral");
    }

    // 👁️ Direction Logging (optional)
    if (delta > 15) console.log("👉 Looking right");
    else if (delta < -15) console.log("👈 Looking left");
  }

  requestAnimationFrame(detectLoop);
}

setupCamera().then(initFaceDetection);
