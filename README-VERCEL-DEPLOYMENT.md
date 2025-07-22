# Vercel Deployment Guide

## Environment Variables

Before deploying to Vercel, make sure to add the following environment variables in your Vercel project settings:

### Required Environment Variables:

1. **MONGODB_URI**
   - Your MongoDB Atlas connection string
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`

2. **JWT_SECRET**
   - A secure random string for JWT token signing
   - Example: Use a 32+ character random string

3. **NEXT_PUBLIC_API_URL** (optional)
   - Your API URL for frontend requests
   - Default: Will use relative URLs

## Steps to Deploy:

1. **Go to Vercel Dashboard**
   - Navigate to your project settings
   - Go to "Environment Variables" tab

2. **Add Environment Variables**
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secure_jwt_secret
   ```

3. **Deploy**
   - Push your code to GitHub
   - Vercel will automatically deploy

## Important Notes:

- The application is configured to skip database connections during build time if MONGODB_URI is not present
- Make sure your MongoDB Atlas cluster allows connections from Vercel's IP addresses (or enable access from anywhere temporarily)
- After adding environment variables, redeploy your application

## Troubleshooting:

If you encounter build errors:
1. Check that all environment variables are properly set in Vercel
2. Ensure MongoDB Atlas allows connections from Vercel
3. Check the build logs for specific error messages