
// Safe fallback values for development/demo mode
const DEMO_CONFIG = {
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
  measurementId: "G-ABCDEF1234"
};

export const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || DEMO_CONFIG.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || DEMO_CONFIG.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || DEMO_CONFIG.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || DEMO_CONFIG.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || DEMO_CONFIG.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || DEMO_CONFIG.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || DEMO_CONFIG.measurementId
};

// Check if we're using demo configuration
export const isUsingDemoConfig = FIREBASE_CONFIG.apiKey === DEMO_CONFIG.apiKey;

// Log warning in development if using demo config
if (import.meta.env.DEV && isUsingDemoConfig) {
  console.warn('⚠️ Using demo Firebase configuration. Set environment variables for production.');
}

export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;
