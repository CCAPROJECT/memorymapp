#!/bin/bash

echo "🛠️ Restoring Memory Map project for local development..."

# Ensure these folders exist
mkdir -p scripts styles public

# Move index.html back to root if needed
if [ -f public/index.html ]; then
  mv public/index.html .
fi

# Move JS back to scripts/
if [ -d public/scripts ]; then
  mv public/scripts/*.js scripts/
  rm -r public/scripts
fi

# Move CSS back to styles/
if [ -d public/styles ]; then
  mv public/styles/*.css styles/
  rm -r public/styles
fi

# Rebuild correct index.html
cat <<EOF > index.html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Memory Map</title>
  <link rel="stylesheet" href="styles/style.css" />
  <link rel="icon" href="public/ccalogo.png" type="image/png" />
  <link rel="preload" as="image" href="public/world-map.jpg" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body>
  <canvas id="canvas"></canvas>
  <canvas id="face-canvas"></canvas>
  <video id="camera" autoplay muted playsinline></video>
  <div id="tooltip" class="label"></div>
  <div id="rotate-notice">Please rotate your device to landscape mode for the best experience.</div>

  <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core"></script>
  <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-converter"></script>
  <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl"></script>
  <script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/face-landmarks-detection"></script>
  <script src="scripts/map.js"></script>
  <script src="scripts/face.js"></script>
</body>
</html>
EOF

echo "✅ Local structure restored."
echo "🚀 You can now run: node server.js"

