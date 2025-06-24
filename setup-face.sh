#!/bin/bash

echo "📦 Initializing Memory Map Face Navigation..."

# Create folders
mkdir -p public/face-model scripts styles

# Placeholder assets (skip downloading if you already have them)
touch public/{world-map.jpg,ccalogo.png,africa-img.png,europe-img.png}

# Download face detection model files
curl -o public/face-model/model.json https://storage.googleapis.com/tfjs-models/weights/face-landmarks-detection/mediapipe_face_landmark/model.json
curl -o public/face-model/group1-shard1of1.bin https://storage.googleapis.com/tfjs-models/weights/face-landmarks-detection/mediapipe_face_landmark/group1-shard1of1.bin

# Initialize project and install dependencies
npm init -y
npm install @tensorflow/tfjs @tensorflow-models/face-landmarks-detection

echo "✅ Project ready!"
echo "👉 Start a local server to test: npx http-server . -p 3000"
