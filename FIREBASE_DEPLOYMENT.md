
# Firebase Deployment Guide

## Prerequisites

1. Install Firebase CLI globally:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

## Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Update the Firebase configuration in `src/config/firebase.ts` with your project values
3. Update `.firebaserc` with your project ID

## Environment Variables

Create environment variables for production (if using):
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

## Deployment

### Manual Deployment
```bash
npm run build
firebase deploy
```

### Automated Deployment
```bash
node scripts/firebase-deploy.js
```

## Firebase Services Available

- **Authentication**: `auth` from `useFirebase` hook
- **Firestore Database**: `db` from `useFirebase` hook  
- **Storage**: `storage` from `useFirebase` hook
- **Analytics**: `analytics` from `useFirebase` hook

## Migration Notes

- Update your Web3Context to optionally use Firebase Auth
- Replace localStorage with Firestore for persistent data
- Update image uploads to use Firebase Storage
- Consider using Firebase Functions for backend logic
