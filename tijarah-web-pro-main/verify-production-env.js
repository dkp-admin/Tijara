#!/usr/bin/env node

// Load environment variables from .env.production
require('dotenv').config({ path: '.env.production' });

console.log('📄 Loading .env.production file...');

// Check if environment variables are loaded
const requiredVars = {
  'NODE_ENV': process.env.NODE_ENV,
  'NEXT_PUBLIC_APP_ENV': process.env.NEXT_PUBLIC_APP_ENV,
  'NEXT_PUBLIC_FRONTEND_URL': process.env.NEXT_PUBLIC_FRONTEND_URL,
  'NEXT_PUBLIC_PRODUCTION_API_URL': process.env.NEXT_PUBLIC_PRODUCTION_API_URL
};

// Display loaded variables
Object.entries(requiredVars).forEach(([key, value]) => {
  if (value) {
    console.log(`   ✅ Loaded ${key}=${value}`);
  } else {
    console.log(`   ❌ Missing ${key}`);
  }
});

console.log('\n🔍 Verifying Production Environment Configuration...');

// Display Node.js environment
console.log('\n📋 Node.js Environment:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`   Platform: ${process.platform}`);
console.log(`   Node Version: ${process.version}`);

// Display Next.js public environment variables
console.log('\n🌐 Next.js Public Environment Variables:');
console.log(`   ✅ NEXT_PUBLIC_APP_ENV: ${process.env.NEXT_PUBLIC_APP_ENV}`);
console.log(`   ✅ NEXT_PUBLIC_FRONTEND_URL: ${process.env.NEXT_PUBLIC_FRONTEND_URL}`);
console.log(`   ✅ NEXT_PUBLIC_PRODUCTION_API_URL: ${process.env.NEXT_PUBLIC_PRODUCTION_API_URL}`);

// Expected production values
console.log('\n🎯 Expected Production Values:');
console.log('   ✅ NEXT_PUBLIC_APP_ENV: production');
console.log('   ✅ NEXT_PUBLIC_FRONTEND_URL: https://demo-app.tijarah360.com');
console.log('   ✅ NEXT_PUBLIC_PRODUCTION_API_URL: https://be.tijarah360.com');

// Validation
console.log('\n🔧 Validation Results:');

let isValid = true;

// Check NODE_ENV
if (process.env.NODE_ENV === 'production') {
  console.log('   ✅ NODE_ENV is set to production');
} else {
  console.log(`   ❌ NODE_ENV should be 'production', got: ${process.env.NODE_ENV}`);
  isValid = false;
}

// Check NEXT_PUBLIC_APP_ENV
if (process.env.NEXT_PUBLIC_APP_ENV === 'production') {
  console.log('   ✅ NEXT_PUBLIC_APP_ENV is set to production');
} else {
  console.log(`   ❌ NEXT_PUBLIC_APP_ENV should be 'production', got: ${process.env.NEXT_PUBLIC_APP_ENV}`);
  isValid = false;
}

// Check NEXT_PUBLIC_FRONTEND_URL
if (process.env.NEXT_PUBLIC_FRONTEND_URL === 'https://demo-app.tijarah360.com') {
  console.log('   ✅ NEXT_PUBLIC_FRONTEND_URL is correctly set');
} else {
  console.log(`   ❌ NEXT_PUBLIC_FRONTEND_URL should be 'https://demo-app.tijarah360.com', got: ${process.env.NEXT_PUBLIC_FRONTEND_URL}`);
  isValid = false;
}

// Final result
console.log('\n============================================================');
if (isValid) {
  console.log('🎉 All environment variables are correctly configured for production!');
  process.exit(0);
} else {
  console.log('❌ Environment configuration has issues. Please fix the above errors.');
  process.exit(1);
}
