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
  staging: "https://tjapi-qa.dev.tisostudio.com",
  production: "https://be.tijarah360.com",
  qa: "https://qa-k8s.tisostudio.com",
  development: "https://tjapi.dev.tisostudio.com",
  local: "http://localhost:3004",
  test: "https://qa-k8s.tisostudio.com",
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
  production: "https://app.tijarah360.com",
  qa: "https://tijarah-qa.vercel.app",
  test: "https://tijarah-test.vercel.app",
};

const env = process.env.NEXT_PUBLIC_APP_ENV;

export const firebase_vapid =
  "BEmqJOyrQaBdX9ncg_sJZ6hN6snHAkYcyZdn9qmlqqtafb9SYdcU5QV6YsE9EL1BWIZqvpE71aJb4E618RFjdRc";

export const HOST = hosts[env] || hosts.test;

//@ts-ignore
export const firebaseConfig = firebase_config[env] || firebase_config.local;

export const FRONTEND_URL = frontendUrl[env] || frontendUrl.local;

export const gtmConfig = {
  containerId: process.env.NEXT_PUBLIC_GTM_CONTAINER_ID,
};
export const AR_MENU_URL: any = {
  qa: `https://tiso-homepage-git-params-api-vasiqs-projects.vercel.app/`,
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
