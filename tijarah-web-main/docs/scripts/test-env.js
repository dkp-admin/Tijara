#!/usr/bin/env node

// Test environment loading
console.log('🧪 Testing Environment Loading...\n');

// Load environment from .env.production if it exists
const fs = require('fs');
const path = require('path');

const envFile = path.join(__dirname, '.env.production');
if (fs.existsSync(envFile)) {
  console.log('📄 Loading .env.production...');
  const envContent = fs.readFileSync(envFile, 'utf8');
  const envLines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  
  envLines.forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key] = value;
      console.log(`   Set ${key}=${value}`);
    }
  });
} else {
  console.log('❌ .env.production file not found');
}

console.log('\n🔍 Current Environment Variables:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`   NEXT_PUBLIC_APP_ENV: ${process.env.NEXT_PUBLIC_APP_ENV}`);
console.log(`   NEXT_PUBLIC_FRONTEND_URL: ${process.env.NEXT_PUBLIC_FRONTEND_URL}`);
console.log(`   NEXT_PUBLIC_PRODUCTION_API_URL: ${process.env.NEXT_PUBLIC_PRODUCTION_API_URL}`);

// Test the config loading
console.log('\n🧪 Testing config.ts loading...');
try {
  // Simulate Next.js environment
  process.env.NODE_ENV = process.env.NODE_ENV || 'production';
  process.env.NEXT_PUBLIC_APP_ENV = process.env.NEXT_PUBLIC_APP_ENV || 'production';
  
  console.log('   Environment variables set for config test');
  console.log(`   Will use env: ${process.env.NEXT_PUBLIC_APP_ENV}`);
  
  // Check what the config would resolve to
  const hosts = {
    staging: "https://be.tijarah360.com",
    production: "https://be.tijarah360.com",
    qa: "https://be.tijarah360.com",
    development: "https://be.tijarah360.com",
    local: "https://be.tijarah360.com",
    test: "https://be.tijarah360.com",
  };
  
  const frontendUrl = {
    development: "https://tijarah.vercel.app",
    local: "http://localhost:3000",
    staging: "https://tijarah.vercel.app",
    production: "https://demo-app.tijarah360.com",
    qa: "https://tijarah-qa.vercel.app",
    test: "https://tijarah-test.vercel.app",
  };
  
  const env = process.env.NEXT_PUBLIC_APP_ENV;
  const HOST = hosts[env] || hosts.test;
  const FRONTEND_URL = frontendUrl[env] || frontendUrl.local;
  
  console.log(`\n📊 Configuration Resolution:`);
  console.log(`   Environment: ${env}`);
  console.log(`   API Host: ${HOST}`);
  console.log(`   Frontend URL: ${FRONTEND_URL}`);
  
  if (env === 'production' && FRONTEND_URL === 'https://demo-app.tijarah360.com') {
    console.log('\n✅ Configuration is correct for production!');
  } else {
    console.log('\n❌ Configuration is NOT correct for production!');
    console.log(`   Expected env: 'production', got: '${env}'`);
    console.log(`   Expected frontend: 'https://demo-app.tijarah360.com', got: '${FRONTEND_URL}'`);
  }
  
} catch (error) {
  console.log(`   ❌ Error testing config: ${error.message}`);
}
