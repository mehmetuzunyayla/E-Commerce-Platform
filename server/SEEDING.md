# Database Seeding Instructions

## Quick Setup

1. **Start MongoDB** (if not already running):
   ```bash
   mongod
   ```

2. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   - Copy `env.example` to `.env`
   - Update the MongoDB URI if needed

4. **Run the seed script**:
   ```bash
   npm run seed
   ```

## What the seed script does:

- Creates 8 main categories (Electronics, Clothing, Home and Garden, Sports, Books, Health and Beauty, Toys, Food)
- Creates sample products for each category
- Creates an admin user (admin@ecommerce.com / admin123)
- Sets up featured products and popular items

## Demo Credentials:

- **Admin**: admin@ecommerce.com / admin123
- **Customer**: Register a new account or use any email

## Manual Seeding (if needed):

If the automatic seeding doesn't work, you can manually run:

```bash
npx ts-node seed.ts
```

This will populate your database with sample data for testing the e-commerce platform. 