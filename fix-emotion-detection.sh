#!/bin/bash

echo "🔧 Starting emotion detection fixes..."


# Add safe single video declaration to face.js
if ! grep -q "const video = document.getElementById(\"camera\")" ./public/scripts/face.js; then
  echo 'const video = document.getElementById("camera");' | cat - ./public/scripts/face.js > temp && mv temp ./public/scripts/face.js
fi

# 2. Fix runtime: "mediapipe" to "tfjs"
echo "🔁 Fixing model runtime to 'tfjs'..."
find . -type f -name "*.js" -exec sed -i '' 's/runtime: *["'\'']mediapipe["'\'']/runtime: "tfjs"/g' {} +

# 3. Remove mediapipe script tag from index.html
echo "🧽 Removing Mediapipe script..."
sed -i '' '/face_mesh\/face_mesh.js/d' ./index.html

# 4. Fix broken CSS link (styles/style.css to public/styles/style.css if needed)
echo "🧵 Fixing stylesheet path..."
sed -i '' 's|href="./styles/style.css"|href="public/styles/style.css"|g' ./index.html

# 5. Optional: Fix unsupported preload
echo "🎧 Adjusting preload for sound.mp3..."
sed -i '' 's|rel="preload" as="audio"|rel="preload" as="fetch" crossorigin="anonymous"|g' ./index.html

echo "✅ All fixes applied successfully!"
