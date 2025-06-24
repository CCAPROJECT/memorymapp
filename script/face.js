let detector;
let video = document.getElementById("camera");

async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  return new Promise(resolve => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

async function initFaceDetection() {
  await tf.setBackend('webgl');
  const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
  detector = await faceLandmarksDetection.createDetector(model, {
    runtime: 'mediapipe',
    solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
  });

  detectLoop();
}

async function detectLoop() {
  if (video.readyState < 2) {
    requestAnimationFrame(detectLoop);
    return;
  }

  const faces = await detector.estimateFaces(video);
  if (faces.length > 0) {
    const keypoints = faces[0].keypoints;

    // Smile detection
    const leftMouth = keypoints[61];
    const rightMouth = keypoints[291];
    const mouthDistance = Math.abs(rightMouth.x - leftMouth.x);
    if (mouthDistance > 60) {
      console.log("😄 Smile detected");
    }

    // Blink detection
    const upperEye = keypoints[159].y;
    const lowerEye = keypoints[145].y;
    const eyeOpenness = Math.abs(upperEye - lowerEye);
    if (eyeOpenness < 2.5) {
      console.log("👁️ Blink detected");
    }

    // Look direction
    const nose = keypoints[1].x;
    const faceCenter = (leftMouth.x + rightMouth.x) / 2;
    const delta = nose - faceCenter;
    if (delta > 15) {
      console.log("👈 Looking right");
    } else if (delta < -15) {
      console.log("👉 Looking left");
    }
  }

  requestAnimationFrame(detectLoop);
}

setupCamera().then(initFaceDetection);
