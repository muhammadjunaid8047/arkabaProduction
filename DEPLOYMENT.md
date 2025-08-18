# Deployment Guide for ArkABA

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Environment Variables**: Set up the required environment variables

## Environment Variables

Set these environment variables in your Vercel project settings:

### Required Variables

```bash
# Database
MONGODB_URI=your_mongodb_connection_string

# NextAuth.js
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret_key

# Email (for password reset and notifications)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your_email@gmail.com
EMAIL_SERVER_PASSWORD=your_app_password

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Pusher (for real-time features)
PUSHER_APP_ID=your_pusher_app_id
PUSHER_KEY=your_pusher_key
PUSHER_SECRET=your_pusher_secret
PUSHER_CLUSTER=your_pusher_cluster
```

### Optional Variables

```bash
# AutoCert (for development SSL)
PORT=3000
NODE_ENV=production
```

## Deployment Steps

### 1. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository containing your ArkABA project

### 2. Configure Project

1. **Framework Preset**: Next.js (should be auto-detected)
2. **Root Directory**: `./` (if your project is in the root)
3. **Build Command**: `npm run build` (default)
4. **Output Directory**: `.next` (default)
5. **Install Command**: `npm install` (default)

### 3. Set Environment Variables

1. In your Vercel project dashboard, go to "Settings" → "Environment Variables"
2. Add each environment variable from the list above
3. Make sure to set the correct `NEXTAUTH_URL` for your production domain

### 4. Deploy

1. Click "Deploy"
2. Vercel will automatically build and deploy your application
3. The first deployment may take 5-10 minutes

## Post-Deployment

### 1. Custom Domain (Optional)

1. Go to "Settings" → "Domains"
2. Add your custom domain
3. Update `NEXTAUTH_URL` to match your custom domain

### 2. Database Setup

1. Ensure your MongoDB database is accessible from Vercel's servers
2. If using MongoDB Atlas, whitelist Vercel's IP ranges or use 0.0.0.0/0

### 3. Stripe Webhooks

1. In your Stripe dashboard, add webhook endpoints
2. Use your Vercel domain: `https://your-domain.vercel.app/api/charge`

## Troubleshooting

### Build Errors

- **SWC Binary Issues**: The build should work automatically on Vercel
- **Environment Variables**: Ensure all required variables are set
- **Dependencies**: Check that all dependencies are in `package.json`

### Runtime Errors

- **Database Connection**: Verify `MONGODB_URI` is correct
- **NextAuth**: Ensure `NEXTAUTH_URL` matches your domain
- **API Routes**: Check Vercel function logs for API errors

### Performance

- **Image Optimization**: Next.js automatically optimizes images
- **Static Generation**: Pages are pre-rendered where possible
- **API Routes**: Serverless functions have a 10-second timeout by default

## Monitoring

1. **Vercel Analytics**: Enable in project settings
2. **Error Tracking**: Check function logs in Vercel dashboard
3. **Performance**: Monitor Core Web Vitals in Vercel analytics

## Security

1. **Environment Variables**: Never commit secrets to Git
2. **CORS**: API routes are configured for cross-origin requests
3. **Authentication**: NextAuth.js handles secure authentication

## Support

For issues specific to:
- **Vercel**: Check [Vercel documentation](https://vercel.com/docs)
- **Next.js**: Check [Next.js documentation](https://nextjs.org/docs)
- **Project-specific**: Check the project README or create an issue 