# Environment Configuration Examples

## Frontend Environment (.env.local)

Create a file named `.env.local` in the `client` directory:

```env
# Backend API URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001/api

# Optional: Analytics (if you want to add Google Analytics later)
# NEXT_PUBLIC_GA_ID=your-google-analytics-id

# Optional: Payment Gateway (for future implementation)
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

## Backend Environment (.env)

Create a file named `.env` in the `server` directory:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/ecommerce

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=3001
NODE_ENV=development

# Optional: Email Service (for future email notifications)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password

# Optional: File Upload Configuration
# MAX_FILE_SIZE=2097152
# UPLOAD_PATH=./uploads

# Optional: CORS Configuration
# CORS_ORIGIN=http://localhost:3000
```

## Production Environment Variables

For production deployment, you'll need to set these environment variables in your hosting platform:

### Frontend (Vercel/Netlify)
- `NEXT_PUBLIC_BACKEND_URL`: Your backend API URL

### Backend (Railway/Render/Heroku)
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: A strong secret key for JWT tokens
- `PORT`: Port number (usually set automatically)
- `NODE_ENV`: Set to "production"

## Security Notes

1. **Never commit `.env` files to version control**
2. **Use strong, unique JWT secrets in production**
3. **Use environment-specific MongoDB databases**
4. **Enable HTTPS in production**
5. **Set up proper CORS configuration for production domains** 