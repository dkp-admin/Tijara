// ===== Template Config =====

export const amplifyConfig = {
  aws_project_region: process.env.NEXT_PUBLIC_AWS_PROJECT_REGION,
  aws_cognito_identity_pool_id:
    process.env.NEXT_PUBLIC_AWS_COGNITO_IDENTITY_POOL_ID,
  aws_cognito_region: process.env.NEXT_PUBLIC_AWS_COGNITO_REGION,
  aws_user_pools_id: process.env.NEXT_PUBLIC_AWS_USER_POOLS_ID,
  aws_user_pools_web_client_id:
    process.env.NEXT_PUBLIC_AWS_USER_POOLS_WEB_CLIENT_ID,
};

export const auth0Config = {
  base_url: process.env.NEXT_PUBLIC_AUTH0_BASE_URL,
  client_id: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID,
  issuer_base_url: process.env.NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL,
};

export const mapboxConfig = {
  apiKey: process.env.NEXT_PUBLIC_MAPBOX_API_KEY,
};

// =====

const hosts: any = {
  staging: "https://be-qa.tijarah360.com",
  production: "https://be.tijarah360.com",
  // qa: "https://be-qa.tijarah360.com",
  qa: "http://localhost:3004",
  development: "https://be-qa.tijarah360.com",
  local: "https://be-qa.tijarah360.com",
  test: "https://be-qa.tijarah360.com",
};

// For localhost development, use proxy to avoid CORS
const isLocalhost = typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// Only use proxy in development mode on localhost
const isDevelopment = process.env.NODE_ENV === 'development';

const localhostHosts: any = {
  staging: "/api/proxy",
  production: "/api/proxy",
  qa: "/api/proxy",
  development: "/api/proxy",
  local: "/api/proxy",
  test: "/api/proxy",
};

const firebase_config = {
  development: {
    apiKey: "AIzaSyCDjfawRYGWDvW6ox9iIWz29OEhwrKIAoY",
    authDomain: "tijarah360.firebaseapp.com",
    projectId: "tijarah360",
    storageBucket: "tijarah360.appspot.com",
    messagingSenderId: "329318000348",
    appId: "1:329318000348:web:989fcaed4492e1e5a03619",
    measurementId: "G-XKHJ97ZGH3",
  },
  production: {
    apiKey: "AIzaSyCDjfawRYGWDvW6ox9iIWz29OEhwrKIAoY",
    authDomain: "tijarah360.firebaseapp.com",
    projectId: "tijarah360",
    storageBucket: "tijarah360.appspot.com",
    messagingSenderId: "329318000348",
    appId: "1:329318000348:web:989fcaed4492e1e5a03619",
    measurementId: "G-XKHJ97ZGH3",
  },
  staging: {
    apiKey: "AIzaSyCDjfawRYGWDvW6ox9iIWz29OEhwrKIAoY",
    authDomain: "tijarah360.firebaseapp.com",
    projectId: "tijarah360",
    storageBucket: "tijarah360.appspot.com",
    messagingSenderId: "329318000348",
    appId: "1:329318000348:web:989fcaed4492e1e5a03619",
    measurementId: "G-XKHJ97ZGH3",
  },
  qa: {
    apiKey: "AIzaSyCDjfawRYGWDvW6ox9iIWz29OEhwrKIAoY",
    authDomain: "tijarah360.firebaseapp.com",
    projectId: "tijarah360",
    storageBucket: "tijarah360.appspot.com",
    messagingSenderId: "329318000348",
    appId: "1:329318000348:web:989fcaed4492e1e5a03619",
    measurementId: "G-XKHJ97ZGH3",
  },
  test: {
    apiKey: "AIzaSyCDjfawRYGWDvW6ox9iIWz29OEhwrKIAoY",
    authDomain: "tijarah360.firebaseapp.com",
    projectId: "tijarah360",
    storageBucket: "tijarah360.appspot.com",
    messagingSenderId: "329318000348",
    appId: "1:329318000348:web:989fcaed4492e1e5a03619",
    measurementId: "G-XKHJ97ZGH3",
  },
  local: {
    apiKey: "AIzaSyCDjfawRYGWDvW6ox9iIWz29OEhwrKIAoY",
    authDomain: "tijarah360.firebaseapp.com",
    projectId: "tijarah360",
    storageBucket: "tijarah360.appspot.com",
    messagingSenderId: "329318000348",
    appId: "1:329318000348:web:989fcaed4492e1e5a03619",
    measurementId: "G-XKHJ97ZGH3",
  },
};

const frontendUrl: any = {
  development: "https://tijarah.vercel.app",
  local: "http://localhost:3000",
  staging: "https://tijarah.vercel.app",
  production: "https://demo-app.tijarah360.com",
  qa: "https://tijarah-qa.vercel.app",
  test: "https://tijarah-test.vercel.app",
};

const env = process.env.NEXT_PUBLIC_APP_ENV || 'production';

// Debug logging for environment detection
if (typeof window === 'undefined') {
  console.log('🔍 [CONFIG] Environment Detection:');
  console.log('   NODE_ENV:', process.env.NODE_ENV);
  console.log('   NEXT_PUBLIC_APP_ENV:', process.env.NEXT_PUBLIC_APP_ENV);
  console.log('   Resolved env:', env);
}

export const firebase_vapid =
  "BEmqJOyrQaBdX9ncg_sJZ6hN6snHAkYcyZdn9qmlqqtafb9SYdcU5QV6YsE9EL1BWIZqvpE71aJb4E618RFjdRc";

// Temporarily enable proxy for CORS fix
export const HOST = (isLocalhost || env === 'production')
  ? (localhostHosts[env as string] || localhostHosts.test)
  : (hosts[env as string] || hosts.test);

//@ts-ignore
export const firebaseConfig = firebase_config[env as string] || firebase_config.local;

export const FRONTEND_URL = frontendUrl[env as string] || frontendUrl.local;

export const gtmConfig = {
  containerId: process.env.NEXT_PUBLIC_GTM_CONTAINER_ID,
};
export const AR_MENU_URL: any = {
  qa: `https://demo-app.tijarah360.com`,
  production: `https://tiso-homepage-git-params-api-vasiqs-projects.vercel.app/`,
};
export const LOCALSTORAGE_USER_TYPE_KEY = "userType";

export const DEFAULT_LAT_LNG = {
  lat: 24.44,
  lng: 45.06,
};

export const GMAP_KEY = "AIzaSyAOfoQHduiicOroXyJ5udHiUNEUG-hfx1M";

export const TAWK_PROPERTY_ID = "62309d0f1ffac05b1d7eb407";
export const TAWK_WIDGET_ID = "1fu6ub23n";
