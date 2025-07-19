# E-Commerce Application

A full-stack e-commerce application built with Next.js (frontend) and NestJS (backend), featuring user authentication, product management, shopping cart, order processing, and review system.

## 🚀 Features

### Core Features
- **User Authentication**: JWT-based authentication with role-based access (Admin/Customer)
- **Product Management**: CRUD operations for products with image upload
- **Category Management**: Organize products by categories
- **Shopping Cart**: Add, update, remove items with guest checkout support
- **Order Processing**: Complete order workflow with status tracking
- **Review System**: Product reviews with rating and comments
- **Wishlist**: Save favorite products for later
- **Guest Checkout**: Allow unauthenticated users to place orders
- **Admin Dashboard**: Complete admin panel for managing the store

### Technical Features
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **State Management**: Redux Toolkit for client-side state
- **Form Validation**: Zod schemas for data validation
- **File Upload**: Image upload for products and categories
- **Real-time Updates**: Dynamic data fetching and updates
- **Error Handling**: Comprehensive error handling and user feedback

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Mantine UI** - React component library
- **Redux Toolkit** - State management
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **Zod** - Schema validation

### Backend
- **NestJS** - Node.js framework
- **TypeScript** - Type-safe JavaScript
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **Multer** - File upload handling
- **Nodemailer** - Email service
- **Zod** - Schema validation

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/mehmetuzunyayla/E-Commerce-Platform.git
cd E-Commerce-Platform
```

### 2. Install Dependencies

#### Frontend
```bash
cd client
npm install
```

#### Backend
```bash
cd server
npm install
```

### 3. Environment Configuration

#### Frontend (.env.local)
```env
BACKEND_URL=http://localhost:3001
```

#### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/ecommerce
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=0297b80951df3a
SMTP_PASS=00f2cd25c5ed28
SMTP_FROM=ecommerce@example.com
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001
```

### 4. Database Setup

1. Start MongoDB service
2. Run the seed script to populate the database:

```bash
cd server
npm run seed
```

### 5. Start the Application

#### Development Mode

**Backend:**
```bash
cd server
npm run start:dev
```

**Frontend:**
```bash
cd client
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## 👥 Demo Accounts

### Admin User
- **Email**: admin@example.com
- **Password**: admin123
- **Role**: Admin
- **Access**: Full admin dashboard, product management, order management, user management

### Customer User
- **Email**: customer@example.com
- **Password**: customer123
- **Role**: Customer
- **Access**: Browse products, add to cart, place orders, write reviews

## 📁 Project Structure

```
e-commerce-app/
├── client/                 # Frontend (Next.js)
│   ├── app/               # App Router pages
│   ├── components/        # Reusable components
│   ├── features/          # Redux slices
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Utilities and API
│   └── types/            # TypeScript types
├── server/                # Backend (NestJS)
│   ├── src/
│   │   ├── modules/      # Feature modules
│   │   ├── common/       # Shared utilities
│   │   └── config/       # Configuration
│   ├── uploads/          # Uploaded images
│   └── seed.ts           # Database seeding
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile

### Products
- `GET /products` - Get all products
- `GET /products/:id` - Get product by ID
- `POST /products` - Create product (Admin)
- `PATCH /products/:id` - Update product (Admin)
- `DELETE /products/:id` - Delete product (Admin)

### Categories
- `GET /categories` - Get all categories
- `POST /categories` - Create category (Admin)
- `PATCH /categories/:id` - Update category (Admin)
- `DELETE /categories/:id` - Delete category (Admin)

### Cart
- `GET /carts` - Get user cart
- `POST /carts/items` - Add item to cart
- `PATCH /carts/items/:productId` - Update cart item
- `DELETE /carts/items/:productId` - Remove item from cart
- `DELETE /carts/clear` - Clear cart

### Orders
- `GET /orders` - Get all orders (Admin)
- `GET /orders/user/:userId` - Get user orders
- `POST /orders` - Create order
- `POST /orders/guest` - Create guest order
- `PATCH /orders/:id` - Update order status (Admin)

### Reviews
- `GET /reviews/product/:productId` - Get product reviews
- `POST /reviews` - Create review
- `PATCH /reviews/:id` - Update review
- `DELETE /reviews/:id` - Delete review

### Wishlist
- `GET /wishlist` - Get user wishlist
- `POST /wishlist` - Add to wishlist
- `DELETE /wishlist/:productId` - Remove from wishlist

## 🎨 Features Overview

### User Interface
- **Modern Design**: Clean, responsive interface
- **Product Grid**: Display products with images and details
- **Search & Filter**: Find products by category and name
- **Product Details**: Detailed product view with reviews
- **Shopping Cart**: Real-time cart updates
- **Checkout Process**: Streamlined order completion

### Admin Dashboard
- **Product Management**: Add, edit, delete products
- **Category Management**: Organize products
- **Order Management**: View and update order status
- **User Management**: View user accounts
- **Image Upload**: Upload product and category images

### Customer Features
- **Browse Products**: View all available products
- **Add to Cart**: Add products to shopping cart
- **Guest Checkout**: Place orders without registration
- **Order History**: View past orders
- **Write Reviews**: Rate and review purchased products
- **Wishlist**: Save favorite products

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Admin and customer permissions
- **Input Validation**: Server-side validation with Zod
- **File Upload Security**: Image type and size validation
- **CORS Configuration**: Cross-origin request handling

## 🚀 Deployment

### Frontend Deployment (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables
3. Deploy automatically on push

### Backend Deployment (Railway/Render)
1. Connect your GitHub repository
2. Set environment variables
3. Configure MongoDB connection
4. Deploy the application

## 📝 Environment Variables

### Frontend (.env.local)
```env
BACKEND_URL=http://localhost:3001
```

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/ecommerce
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=0297b80951df3a
SMTP_PASS=00f2cd25c5ed28
SMTP_FROM=ecommerce@example.com
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001
```



## 📊 Database Schema

### Users
- `_id`: ObjectId
- `email`: String (unique)
- `password`: String (hashed)
- `firstName`: String
- `lastName`: String
- `role`: String (admin/customer)
- `isEmailVerified`: Boolean

### Products
- `_id`: ObjectId
- `name`: String
- `description`: String
- `price`: Number
- `category`: ObjectId (ref: Category)
- `images`: Array of Strings
- `stockQuantity`: Number
- `isFeatured`: Boolean

### Categories
- `_id`: ObjectId
- `name`: String
- `description`: String
- `image`: String

### Orders
- `_id`: ObjectId
- `user`: ObjectId (ref: User, optional for guest)
- `guestInfo`: Object (for guest orders)
- `items`: Array of OrderItems
- `totalPrice`: Number
- `status`: String
- `shippingAddress`: String
- `paymentMethod`: String

### Reviews
- `_id`: ObjectId
- `user`: ObjectId (ref: User)
- `product`: ObjectId (ref: Product)
- `rating`: Number (1-5)
- `comment`: String
- `isApproved`: Boolean

### Cart
- `_id`: ObjectId
- `user`: ObjectId (ref: User)
- `items`: Array of CartItems

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit your changes
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team

## 🎯 Roadmap

- [ ] Payment gateway integration
- [ ] Email notifications
- [ ] Advanced search and filtering
- [ ] Product variants (size, color)
- [ ] Inventory management
- [ ] Analytics dashboard
- [ ] Mobile app development
- [ ] Multi-language support
- [ ] Social media integration
- [ ] Advanced admin features

---

**Note**: This is a demo application. For production use, ensure proper security measures, environment configuration, and database optimization. 