# Netlify Deployment Guide

This guide will help you deploy your TinHatCatters application to Netlify successfully.

## Prerequisites

- A Netlify account (free tier is sufficient)
- Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket)
- Firebase project set up (if you want full functionality)

## Quick Deployment Steps

### 1. Connect Your Repository

1. Log in to [Netlify](https://netlify.com)
2. Click "New site from Git"
3. Choose your Git provider (GitHub, GitLab, or Bitbucket)
4. Select your repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: `18` (automatically set via netlify.toml)

### 2. Set Environment Variables

**Important**: The app will work with demo configuration, but for full functionality, set up Firebase environment variables.

#### In Netlify Dashboard:
1. Go to Site settings → Environment variables
2. Add the following variables:

```
VITE_FIREBASE_API_KEY=your-actual-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
NODE_ENV=production
```

#### Getting Firebase Configuration:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Go to Project Settings → General
4. Scroll down to "Your apps" section
5. Click on the web app or add a new web app
6. Copy the configuration values

### 3. Deploy

1. Click "Deploy site" in Netlify
2. Wait for the build to complete
3. Your site will be available at a generated URL (e.g., `https://amazing-name-123456.netlify.app`)

## Troubleshooting

### Black Screen Issues

✅ **Fixed**: Added error boundary component that will show user-friendly error messages instead of black screens.

### Build Failures

- Check the deploy logs in Netlify dashboard
- Ensure all environment variables are set correctly
- Verify your Firebase configuration is valid

### Runtime Errors

- The app includes fallback configuration for missing environment variables
- Check browser console for specific error messages
- Error boundary will display helpful error information in development mode

### Performance Optimization

The build process may show warnings about large chunks. This is normal for this application due to:
- Phaser.js game engine
- Multiple UI libraries
- Firebase SDK

To optimize (optional):
1. Consider code splitting for game components
2. Implement lazy loading for non-critical routes

## Custom Domain (Optional)

1. In Netlify dashboard, go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow the DNS configuration instructions

## Continuous Deployment

Once connected, Netlify will automatically:
- Deploy when you push to your main branch
- Run the build process
- Update your live site

## Demo Mode

If you don't set Firebase environment variables, the app will run in demo mode with:
- Limited Firebase functionality
- Console warnings in development
- Basic game functionality still available

## Support

If you encounter issues:
1. Check Netlify deploy logs
2. Verify environment variables are set
3. Test the build locally with `npm run build`
4. Check browser console for errors

---

**Note**: The app is configured to work out of the box with demo settings. Setting up Firebase is only required for full functionality like user authentication and data persistence.