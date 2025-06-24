const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Serve all static files from root and public/
app.use(express.static(__dirname)); // serve index.html
app.use(express.static(path.join(__dirname, 'public'))); // serve public assets

// Fallback to index.html
app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`✅ App running: http://localhost:${port}`);
});
