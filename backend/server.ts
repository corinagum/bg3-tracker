import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { setupAuth } from './auth.js';
import { setupRoutes } from './routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Setup authentication
setupAuth(app);

// Setup API routes
setupRoutes(app);

// Serve static files
app.use(express.static(path.join(__dirname, '../dist')));
app.use('/src', express.static(path.join(__dirname, '../src')));

// Serve the main application
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on http://localhost:${PORT}`);
  // eslint-disable-next-line no-console
  console.log('Steam authentication endpoints:');
  // eslint-disable-next-line no-console
  console.log(`  - Login: http://localhost:${PORT}/api/auth/steam`);
  // eslint-disable-next-line no-console
  console.log(`  - Status: http://localhost:${PORT}/api/auth/status`);
  // eslint-disable-next-line no-console
  console.log(`  - Logout: http://localhost:${PORT}/api/auth/logout`);
});
