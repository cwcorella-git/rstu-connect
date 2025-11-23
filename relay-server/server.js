const express = require('express');
const Gun = require('gun');

// Initialize Express
const app = express();
const port = process.env.PORT || 8765;

// Enable CORS for browser clients (MUST be before Gun.serve)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'RSTU Gun.js relay server running' });
});

// Serve Gun (MUST be after CORS, before server.listen)
app.use(Gun.serve);

// Start HTTP server
const server = app.listen(port, () => {
  console.log(`[RSTU Gun Relay] Server started on port ${port}`);
  console.log(`[RSTU Gun Relay] Gun endpoint: http://localhost:${port}/gun`);
  console.log(`[RSTU Gun Relay] Health check: http://localhost:${port}/health`);
});

// Initialize Gun with the HTTP server (enable AXE for proper sync!)
const gun = Gun({
  web: server,
  // AXE is required for proper peer-to-peer syncing
});

console.log('[RSTU Gun Relay] Gun.js relay initialized');
console.log('[RSTU Gun Relay] Ready to relay messages for tenant organizing!');
