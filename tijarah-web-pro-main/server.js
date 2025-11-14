#!/usr/bin/env node

// Load environment variables from .env.production
require('dotenv').config({ path: '.env.production' });

// Verify environment variables are loaded
console.log('🔍 Environment Variables Loaded:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NEXT_PUBLIC_APP_ENV:', process.env.NEXT_PUBLIC_APP_ENV);
console.log('NEXT_PUBLIC_FRONTEND_URL:', process.env.NEXT_PUBLIC_FRONTEND_URL);
console.log('NEXT_PUBLIC_PRODUCTION_API_URL:', process.env.NEXT_PUBLIC_PRODUCTION_API_URL);

// Validate environment
if (process.env.NEXT_PUBLIC_APP_ENV !== 'production') {
  console.error('❌ NEXT_PUBLIC_APP_ENV is not set to production!');
  process.exit(1);
}

console.log('✅ Environment validated - starting Next.js server...');

// Start Next.js server
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  })
  .once('error', (err) => {
    console.error(err);
    process.exit(1);
  })
  .listen(port, () => {
    console.log(`🚀 Ready on http://${hostname}:${port}`);
    console.log(`🌐 Environment: ${process.env.NEXT_PUBLIC_APP_ENV}`);
    console.log(`🎯 Frontend URL: ${process.env.NEXT_PUBLIC_FRONTEND_URL}`);
  });
});
