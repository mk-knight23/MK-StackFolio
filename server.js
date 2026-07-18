import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

console.log('--- Starting Server ---');
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', PORT);
console.log('Directory:', __dirname);

const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');

// Debug: Check if dist exists
if (fs.existsSync(distPath)) {
    console.log('✅ Found dist directory');
    if (fs.existsSync(indexPath)) {
        console.log('✅ Found index.html');
    } else {
        console.log('❌ Missing index.html in dist');
    }
} else {
    console.log('❌ Missing dist directory');
}

// Health check endpoint
app.get('/healthz', (req, res) => {
    res.status(200).send('OK');
});

// Serve static files from the 'dist' directory
app.use(express.static(distPath));

// Handle SPA routing: return index.html for all non-asset requests
app.get('*', (req, res) => {
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Application build missing. Please check logs.');
    }
});

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on http://0.0.0.0:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});
