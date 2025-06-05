const express = require('express');
const path = require('path');
const app = express();
const port = 3001;
const host = '0.0.0.0'; // This allows access from your local network

// Serve static files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Start server
app.listen(port, host, () => {
  console.log(`🌐 Local access:     http://localhost:${port}`);
  console.log(`📱 Network access:  http://172.16.0.84:${port}`);
});
