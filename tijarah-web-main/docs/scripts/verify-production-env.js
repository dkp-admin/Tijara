#!/usr/bin/env node

/**
 * Production Environment Verification Script
 * Verifies that the production environment variables are properly set
 */

// Load environment variables from .env.production if it exists
const fs = require('fs');
const path = require('path');

const envFile = path.join(__dirname, '.env.production');
if (fs.existsSync(envFile)) {
  console.log('📄 Loading .env.production file...');
  const envContent = fs.readFileSync(envFile, 'utf8');
  const envLines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));

  envLines.forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('='); // Handle values with = in them
      process.env[key] = value;
      console.log(`   ✅ Loaded ${key}=${value}`);
    }
  });
  console.log('');
} else {
  console.log('⚠️  .env.production file not found, using existing environment variables\n');
}

console.log('🔍 Verifying Production Environment Configuration...\n');

// Check Node.js environment
console.log('📋 Node.js Environment:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`   Platform: ${process.platform}`);
console.log(`   Node Version: ${process.version}\n`);

// Check Next.js public environment variables
console.log('🌐 Next.js Public Environment Variables:');
const requiredEnvVars = [
  'NEXT_PUBLIC_APP_ENV',
  'NEXT_PUBLIC_FRONTEND_URL',
  'NEXT_PUBLIC_PRODUCTION_API_URL'
];

let allValid = true;

requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  const status = value ? '✅' : '❌';
  console.log(`   ${status} ${envVar}: ${value || 'NOT SET'}`);
  if (!value) allValid = false;
});

console.log('\n🎯 Expected Production Values:');
console.log('   ✅ NEXT_PUBLIC_APP_ENV: production');
console.log('   ✅ NEXT_PUBLIC_FRONTEND_URL: https://demo-app.tijarah360.com');
console.log('   ✅ NEXT_PUBLIC_PRODUCTION_API_URL: https://be.tijarah360.com');

console.log('\n🔧 Validation Results:');
if (process.env.NODE_ENV === 'production') {
  console.log('   ✅ NODE_ENV is set to production');
} else {
  console.log(`   ❌ NODE_ENV should be 'production', got: '${process.env.NODE_ENV}'`);
  allValid = false;
}

if (process.env.NEXT_PUBLIC_APP_ENV === 'production') {
  console.log('   ✅ NEXT_PUBLIC_APP_ENV is set to production');
} else {
  console.log(`   ❌ NEXT_PUBLIC_APP_ENV should be 'production', got: '${process.env.NEXT_PUBLIC_APP_ENV}'`);
  allValid = false;
}

if (process.env.NEXT_PUBLIC_FRONTEND_URL === 'https://demo-app.tijarah360.com') {
  console.log('   ✅ NEXT_PUBLIC_FRONTEND_URL is correctly set');
} else {
  console.log(`   ❌ NEXT_PUBLIC_FRONTEND_URL should be 'https://demo-app.tijarah360.com', got: '${process.env.NEXT_PUBLIC_FRONTEND_URL}'`);
  allValid = false;
}

console.log('\n' + '='.repeat(60));

if (allValid) {
  console.log('🎉 All environment variables are correctly configured for production!');
  process.exit(0);
} else {
  console.log('❌ Some environment variables are missing or incorrect.');
  console.log('   Please check your .env.production file or environment setup.');
  process.exit(1);
}
