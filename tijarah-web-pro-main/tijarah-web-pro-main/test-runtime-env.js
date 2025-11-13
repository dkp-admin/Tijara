// Test what environment variables are actually available at runtime
console.log('🔍 RUNTIME ENVIRONMENT TEST');
console.log('===========================');

console.log('\n📋 Process Environment:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NEXT_PUBLIC_APP_ENV:', process.env.NEXT_PUBLIC_APP_ENV);
console.log('NEXT_PUBLIC_FRONTEND_URL:', process.env.NEXT_PUBLIC_FRONTEND_URL);
console.log('NEXT_PUBLIC_PRODUCTION_API_URL:', process.env.NEXT_PUBLIC_PRODUCTION_API_URL);

console.log('\n🔍 All NEXT_PUBLIC_ variables:');
Object.keys(process.env)
  .filter(key => key.startsWith('NEXT_PUBLIC_'))
  .forEach(key => {
    console.log(`${key}: ${process.env[key]}`);
  });

console.log('\n🧪 Testing config resolution:');
try {
  // Simulate the config.ts logic
  const env = process.env.NEXT_PUBLIC_APP_ENV;
  console.log('Resolved env:', env);
  
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
  
  const HOST = hosts[env] || hosts.test;
  const FRONTEND_URL = frontendUrl[env] || frontendUrl.local;
  
  console.log('Resolved HOST:', HOST);
  console.log('Resolved FRONTEND_URL:', FRONTEND_URL);
  
  if (env === 'production' && FRONTEND_URL === 'https://demo-app.tijarah360.com') {
    console.log('✅ Configuration is CORRECT for production!');
  } else {
    console.log('❌ Configuration is WRONG!');
    console.log(`Expected env: 'production', got: '${env}'`);
    console.log(`Expected frontend: 'https://demo-app.tijarah360.com', got: '${FRONTEND_URL}'`);
  }
  
} catch (error) {
  console.log('❌ Error testing config:', error.message);
}

console.log('\n===========================');
console.log('🔍 RUNTIME TEST COMPLETE');
console.log('===========================');
