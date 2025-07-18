# Database Seeding Guide

This document explains how to set up and seed the database with initial data for the e-commerce application.

## Prerequisites

1. **MongoDB** must be running locally or accessible via connection string
2. **Node.js** (v18 or higher) installed
3. **npm** or **yarn** package manager

## Quick Setup

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Set Environment Variables
Create a `.env` file in the `server` directory:
```env
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your-super-secret-jwt-key
PORT=3001
```

### 3. Run the Seed Script
```bash
npm run seed
```

## What Gets Created

### Demo Users

#### Admin User
- **Email**: admin@example.com
- **Password**: admin123
- **Role**: Admin
- **Access**: Full admin dashboard access

#### Customer User
- **Email**: customer@example.com
- **Password**: customer123
- **Role**: Customer
- **Access**: Browse products, place orders, write reviews

### Categories
The seed script creates the following product categories:
- **Electronics**: Smartphones, laptops, accessories
- **Clothing**: Shoes, jeans, jackets
- **Home and Garden**: Appliances, tools, furniture
- **Sports**: Equipment, apparel, accessories

### Products
Each category is populated with 3-4 sample products including:
- Product details (name, description, price)
- Stock quantities
- Product specifications
- Tags for search functionality
- Product variants (size, color)
- Featured product flags

## Sample Products by Category

### Electronics
1. **Samsung Galaxy S24 Ultra** - $1,199
2. **Apple AirPods Pro** - $249
3. **Dell XPS 13 Laptop** - $999

### Clothing
1. **Adidas Ultraboost 22** - $180
2. **Calvin Klein Jeans** - $95
3. **North Face Puffer Jacket** - $199

### Home and Garden
1. **Dyson V15 Detect** - $699
2. **Weber Spirit Gas Grill** - $449
3. **Bosch Dishwasher** - $899

### Sports
1. **Callaway Golf Driver** - $499
2. **Under Armour Training Shoes** - $120
3. **Nike Basketball** - $35

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  phone: String,
  role: String (admin/customer),
  emailVerified: Boolean,
  addresses: Array,
  favoriteCategories: Array
}
```

### Categories Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  image: String (optional)
}
```

### Products Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  price: Number,
  category: ObjectId (ref: Category),
  images: Array of Strings,
  stockQuantity: Number,
  specifications: Array of Objects,
  tags: Array of Strings,
  isFeatured: Boolean,
  variants: Array of Objects
}
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check the connection string in `.env`
   - Verify network connectivity

2. **Permission Errors**
   - Ensure you have write permissions to the database
   - Check if the database exists

3. **Duplicate Key Errors**
   - The seed script checks for existing data
   - It won't overwrite existing users or products
   - Clear the database manually if you want fresh data

### Manual Database Reset

If you want to start fresh:

```bash
# Connect to MongoDB shell
mongosh

# Switch to your database
use ecommerce

# Clear all collections
db.users.deleteMany({})
db.categories.deleteMany({})
db.products.deleteMany({})
db.orders.deleteMany({})
db.reviews.deleteMany({})
db.carts.deleteMany({})
db.wishlists.deleteMany({})

# Exit MongoDB shell
exit
```

Then run the seed script again:
```bash
npm run seed
```

## Customizing Seed Data

### Adding New Categories
Edit the `seed.ts` file and add new categories to the `categoryData` object:

```javascript
const categoryData = {
  'New Category': {
    name: 'New Category',
    description: 'Description for new category'
  }
  // ... existing categories
};
```

### Adding New Products
Add products to the `productData` object in `seed.ts`:

```javascript
const productData = {
  'New Category': [
    {
      name: 'New Product',
      description: 'Product description',
      price: 99.99,
      stockQuantity: 50,
      specifications: [
        { key: 'Feature', value: 'Value' }
      ],
      tags: ['tag1', 'tag2'],
      isFeatured: false,
      variants: [{ size: '', color: 'Default' }]
    }
  ]
};
```

### Modifying User Data
To change the demo user credentials, edit the user creation section in `seed.ts`:

```javascript
await userService.create({
  email: 'your-email@example.com',
  password: await bcrypt.hash('your-password', 10),
  firstName: 'Your',
  lastName: 'Name',
  phone: '1234567890',
  role: 'admin', // or 'customer'
  emailVerified: true,
  addresses: [],
  favoriteCategories: [],
});
```

## Production Considerations

1. **Remove Demo Data**: Clear all seed data before production
2. **Secure Passwords**: Use strong, unique passwords
3. **Environment Variables**: Use production-ready environment variables
4. **Database Indexes**: Ensure proper indexing for performance
5. **Backup Strategy**: Implement regular database backups

## Next Steps

After running the seed script:

1. **Start the Backend**:
   ```bash
   npm run start:dev
   ```

2. **Start the Frontend**:
   ```bash
   cd ../client
   npm run dev
   ```

3. **Test the Application**:
   - Visit http://localhost:3000
   - Login with demo credentials
   - Test all features

4. **Admin Access**:
   - Login as admin@example.com
   - Access admin dashboard at /admin
   - Manage products, categories, and orders

The application is now ready for development and testing! 