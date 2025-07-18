# Deployment Guide

This guide covers deploying the e-commerce application to various platforms.

## Prerequisites

1. **GitHub Repository**: Push your code to GitHub
2. **MongoDB Atlas**: Set up a cloud MongoDB database
3. **Environment Variables**: Prepare production environment variables

## Frontend Deployment (Vercel)

### 1. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Click "New Project"
4. Import your GitHub repository

### 2. Configure Environment Variables

In the Vercel dashboard, go to your project settings and add:

```env
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.com/api
```

### 3. Deploy

1. Vercel will automatically deploy on every push to main branch
2. You can also manually deploy from the dashboard
3. Get your production URL (e.g., `https://your-app.vercel.app`)

## Backend Deployment (Railway)

### 1. Connect to Railway

1. Go to [railway.app](https://railway.app)
2. Sign in with your GitHub account
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your repository

### 2. Configure Environment Variables

In Railway dashboard, add these environment variables:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce
JWT_SECRET=your-super-secret-production-jwt-key
PORT=3001
NODE_ENV=production
```

### 3. Configure Build Settings

Set the build command and start command:

**Build Command:**
```bash
npm install
```

**Start Command:**
```bash
npm run start:prod
```

### 4. Deploy

1. Railway will automatically deploy on every push
2. Get your production URL (e.g., `https://your-app.railway.app`)

## Alternative Backend Deployment (Render)

### 1. Connect to Render

1. Go to [render.com](https://render.com)
2. Sign in with your GitHub account
3. Click "New +" → "Web Service"
4. Connect your GitHub repository

### 2. Configure Service

- **Name**: your-app-backend
- **Environment**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm run start:prod`

### 3. Environment Variables

Add the same environment variables as Railway.

## MongoDB Atlas Setup

### 1. Create Cluster

1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (M0 Free tier is sufficient)

### 2. Configure Database Access

1. Go to "Database Access"
2. Create a new database user
3. Set username and password
4. Choose "Read and write to any database"

### 3. Configure Network Access

1. Go to "Network Access"
2. Click "Add IP Address"
3. For development: Add your IP
4. For production: Add `0.0.0.0/0` (allow all IPs)

### 4. Get Connection String

1. Go to "Clusters"
2. Click "Connect"
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password

## Environment Variables Reference

### Frontend (.env.local)
```env
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.com/api
```

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce
JWT_SECRET=your-super-secret-production-jwt-key
PORT=3001
NODE_ENV=production
```

## Production Checklist

### Security
- [ ] Use strong JWT secrets
- [ ] Enable HTTPS
- [ ] Set up proper CORS
- [ ] Use environment variables
- [ ] Remove debug logs
- [ ] Set up proper error handling

### Performance
- [ ] Enable compression
- [ ] Set up caching headers
- [ ] Optimize images
- [ ] Use CDN for static assets
- [ ] Enable database indexing

### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure logging
- [ ] Set up health checks
- [ ] Monitor database performance

## Custom Domain Setup

### Vercel (Frontend)

1. Go to your project settings
2. Click "Domains"
3. Add your custom domain
4. Configure DNS records as instructed

### Railway/Render (Backend)

1. Go to your service settings
2. Add custom domain
3. Configure DNS records
4. Update frontend environment variables

## SSL/HTTPS

### Vercel
- Automatic SSL certificates
- No additional configuration needed

### Railway/Render
- Automatic SSL certificates
- May need to configure custom domains

## Database Migration

### Development to Production

1. **Export local data** (if needed):
```bash
mongodump --db=ecommerce --out=./backup
```

2. **Import to production**:
```bash
mongorestore --uri="mongodb+srv://..." --db=ecommerce ./backup/ecommerce
```

### Seed Production Database

1. Set up production environment variables
2. Run seed script (remove demo data first):
```bash
npm run seed
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS is configured for frontend domain
   - Check environment variables

2. **Database Connection**
   - Verify MongoDB Atlas connection string
   - Check network access settings
   - Ensure database user has correct permissions

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

4. **Environment Variables**
   - Ensure all required variables are set
   - Check variable names and values
   - Restart services after changing variables

### Debugging

1. **Check Logs**
   - Vercel: Project dashboard → Functions → View logs
   - Railway: Service dashboard → Deployments → View logs
   - Render: Service dashboard → Logs

2. **Test Locally**
   - Test with production environment variables locally
   - Verify database connections

3. **Health Checks**
   - Add health check endpoints
   - Monitor service status

## Cost Optimization

### Free Tier Limits

- **Vercel**: 100GB bandwidth/month
- **Railway**: $5/month after free trial
- **Render**: Free tier available
- **MongoDB Atlas**: 512MB storage free

### Scaling Considerations

1. **Database**: Upgrade MongoDB Atlas plan
2. **Backend**: Upgrade Railway/Render plan
3. **Frontend**: Vercel Pro for more bandwidth
4. **CDN**: Consider Cloudflare for static assets

## Backup Strategy

### Database Backups

1. **MongoDB Atlas**: Automatic daily backups
2. **Manual Backups**: Use mongodump/mongorestore
3. **Export Data**: Use MongoDB Compass for data export

### Code Backups

1. **GitHub**: Primary code repository
2. **Environment Variables**: Store securely
3. **Documentation**: Keep deployment guides updated

## Monitoring and Analytics

### Recommended Tools

1. **Error Tracking**: Sentry
2. **Performance**: Vercel Analytics
3. **Database**: MongoDB Atlas monitoring
4. **Uptime**: UptimeRobot

### Health Checks

Add health check endpoints to your backend:

```typescript
@Get('health')
async healthCheck() {
  return { status: 'ok', timestamp: new Date().toISOString() };
}
```

## Security Best Practices

1. **Environment Variables**: Never commit secrets
2. **JWT Secrets**: Use strong, unique secrets
3. **Database**: Use connection string authentication
4. **CORS**: Configure for specific domains
5. **Rate Limiting**: Implement API rate limiting
6. **Input Validation**: Validate all user inputs
7. **HTTPS**: Always use HTTPS in production

## Performance Optimization

1. **Database Indexes**: Create indexes for frequently queried fields
2. **Caching**: Implement Redis for session storage
3. **Image Optimization**: Use Next.js Image component
4. **Code Splitting**: Implement lazy loading
5. **CDN**: Use CDN for static assets

## Support and Maintenance

1. **Regular Updates**: Keep dependencies updated
2. **Security Patches**: Monitor for security vulnerabilities
3. **Backup Verification**: Test backup restoration
4. **Performance Monitoring**: Monitor application performance
5. **User Feedback**: Collect and address user feedback

---

**Note**: This deployment guide covers the most common scenarios. Adjust based on your specific requirements and infrastructure choices. 