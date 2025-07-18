import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { UserService } from './src/modules/user/user.service';
import { CategoryService } from './src/modules/category/category.service';
import { ProductService } from './src/modules/product/product.service';
import * as bcrypt from 'bcryptjs';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  // CATEGORY SEED
  const categoryService = app.get(CategoryService);
  const categories = [
    { name: 'Electronics', description: 'Devices, gadgets, and more.' },
    { name: 'Clothing', description: 'Men & Women fashion.' },
    { name: 'Home and Garden', description: 'Everything for your home.' },
    { name: 'Sports', description: 'Sportswear and equipment.' },
    { name: 'Books', description: 'Fiction, non-fiction, textbooks.' },
    { name: 'Health and Beauty', description: 'Beauty & wellness.' },
    { name: 'Toys', description: 'For kids of all ages.' },
    { name: 'Food', description: 'Groceries and gourmet.' },
  ];
  
  const createdCategories = [];
  for (const category of categories) {
    const existing = await categoryService.findAll();
    const existingCategory = existing.find(c => c.name === category.name);
    if (!existingCategory) {
      const newCategory = await categoryService.create(category);
      createdCategories.push(newCategory);
    } else {
      createdCategories.push(existingCategory);
    }
  }

  // ADMIN USER SEED
  const userService = app.get(UserService);
  const adminEmail = 'admin@example.com';
  const adminExists = await userService.findByEmail(adminEmail);
  if (!adminExists) {
    await userService.create({
      email: adminEmail,
      password: await bcrypt.hash('admin123', 10),
      firstName: 'Admin',
      lastName: 'User',
      phone: '0000000000',
      role: 'admin',
      emailVerified: true,
      addresses: [],
      favoriteCategories: [],
    });
    console.log('✅ Admin user created: admin@example.com / admin123');
  } else {
    console.log('ℹ️ Admin user already exists');
  }

  // CUSTOMER USER SEED
  const customerEmail = 'customer@example.com';
  const customerExists = await userService.findByEmail(customerEmail);
  if (!customerExists) {
    await userService.create({
      email: customerEmail,
      password: await bcrypt.hash('customer123', 10),
      firstName: 'John',
      lastName: 'Customer',
      phone: '1111111111',
      role: 'customer',
      emailVerified: true,
      addresses: [],
      favoriteCategories: [],
    });
    console.log('✅ Customer user created: customer@example.com / customer123');
  } else {
    console.log('ℹ️ Customer user already exists');
  }

  // PRODUCT SEED DATA
  const productService = app.get(ProductService);
  
  // Clear all existing products first
  await productService.clearAllProducts();
  
  const productData = {
    Electronics: [
      {
        name: 'Samsung Galaxy S24 Ultra',
        description: 'Premium Android smartphone with S Pen, 200MP camera, and AI features.',
        price: 1199,
        stockQuantity: 40,
        specifications: [
          { key: 'Storage', value: '256GB' },
          { key: 'RAM', value: '12GB' },
          { key: 'Screen', value: '6.8 inch' }
        ],
        tags: ['smartphone', 'samsung', 'android'],
        isFeatured: true,
        variants: [{ size: '', color: 'Titanium Gray' }]
      },
      {
        name: 'Apple AirPods Pro',
        description: 'Wireless earbuds with active noise cancellation and spatial audio.',
        price: 249,
        stockQuantity: 85,
        specifications: [
          { key: 'Battery Life', value: '6 hours' },
          { key: 'Noise Cancellation', value: 'Active' },
          { key: 'Water Resistance', value: 'IPX4' }
        ],
        tags: ['earbuds', 'wireless', 'apple'],
        isFeatured: false,
        variants: [{ size: '', color: 'White' }]
      },
      {
        name: 'Dell XPS 13 Laptop',
        description: 'Ultra-thin laptop with InfinityEdge display and premium build quality.',
        price: 999,
        stockQuantity: 35,
        specifications: [
          { key: 'Processor', value: 'Intel i7' },
          { key: 'RAM', value: '16GB' },
          { key: 'Storage', value: '512GB SSD' }
        ],
        tags: ['laptop', 'dell', 'ultrabook'],
        isFeatured: true,
        variants: [{ size: '13 inch', color: 'Platinum Silver' }]
      }
    ],
    Clothing: [
      {
        name: 'Adidas Ultraboost 22',
        description: 'Premium running shoes with Boost midsole for maximum energy return.',
        price: 180,
        stockQuantity: 60,
        specifications: [
          { key: 'Material', value: 'Primeknit' },
          { key: 'Midsole', value: 'Boost' },
          { key: 'Weight', value: '310g' }
        ],
        tags: ['running', 'adidas', 'ultraboost'],
        isFeatured: true,
        variants: [
          { size: 'US 8', color: 'Core Black' },
          { size: 'US 9', color: 'Core Black' },
          { size: 'US 10', color: 'Core Black' }
        ]
      },
      {
        name: 'Calvin Klein Jeans',
        description: 'Classic straight-leg jeans with perfect fit and stretch comfort.',
        price: 95,
        stockQuantity: 120,
        specifications: [
          { key: 'Material', value: '98% Cotton, 2% Elastane' },
          { key: 'Fit', value: 'Straight' },
          { key: 'Rise', value: 'Mid-rise' }
        ],
        tags: ['jeans', 'calvin-klein', 'denim'],
        isFeatured: false,
        variants: [
          { size: '30x32', color: 'Dark Blue' },
          { size: '32x32', color: 'Dark Blue' },
          { size: '34x32', color: 'Dark Blue' }
        ]
      },
      {
        name: 'North Face Puffer Jacket',
        description: 'Warm, lightweight puffer jacket perfect for cold weather activities.',
        price: 199,
        stockQuantity: 45,
        specifications: [
          { key: 'Fill', value: '600-fill down' },
          { key: 'Water Resistance', value: 'DWR finish' },
          { key: 'Weight', value: 'Lightweight' }
        ],
        tags: ['jacket', 'winter', 'north-face'],
        isFeatured: false,
        variants: [
          { size: 'S', color: 'Black' },
          { size: 'M', color: 'Black' },
          { size: 'L', color: 'Black' }
        ]
      }
    ],
    'Home and Garden': [
      {
        name: 'Dyson V15 Detect',
        description: 'Cordless vacuum with laser dust detection and powerful suction.',
        price: 699,
        stockQuantity: 25,
        specifications: [
          { key: 'Runtime', value: '60 minutes' },
          { key: 'Suction Power', value: '240AW' },
          { key: 'Dust Detection', value: 'Laser' }
        ],
        tags: ['vacuum', 'cordless', 'dyson'],
        isFeatured: true,
        variants: [{ size: '', color: 'Nickel' }]
      },
      {
        name: 'Weber Spirit Gas Grill',
        description: '3-burner gas grill with porcelain-enameled cooking grates.',
        price: 449,
        stockQuantity: 30,
        specifications: [
          { key: 'Burners', value: '3' },
          { key: 'Cooking Area', value: '529 sq in' },
          { key: 'BTU', value: '30,000' }
        ],
        tags: ['grill', 'gas', 'weber'],
        isFeatured: false,
        variants: [{ size: '', color: 'Black' }]
      },
      {
        name: 'Bosch Dishwasher',
        description: 'Quiet dishwasher with advanced cleaning technology and energy efficiency.',
        price: 899,
        stockQuantity: 20,
        specifications: [
          { key: 'Noise Level', value: '44 dB' },
          { key: 'Capacity', value: '16 place settings' },
          { key: 'Energy Rating', value: 'A++' }
        ],
        tags: ['dishwasher', 'bosch', 'appliance'],
        isFeatured: true,
        variants: [{ size: '', color: 'Stainless Steel' }]
      }
    ],
    Sports: [
      {
        name: 'Callaway Golf Driver',
        description: 'Professional golf driver with AI-designed face for maximum distance.',
        price: 499,
        stockQuantity: 15,
        specifications: [
          { key: 'Loft', value: '9°' },
          { key: 'Shaft', value: 'Graphite' },
          { key: 'Length', value: '45.75 inches' }
        ],
        tags: ['golf', 'driver', 'callaway'],
        isFeatured: true,
        variants: [{ size: '', color: 'Black/Red' }]
      },
      {
        name: 'Under Armour Training Shoes',
        description: 'Versatile training shoes for cross-training and gym workouts.',
        price: 120,
        stockQuantity: 80,
        specifications: [
          { key: 'Material', value: 'Mesh upper' },
          { key: 'Sole', value: 'Rubber' },
          { key: 'Weight', value: '280g' }
        ],
        tags: ['training', 'gym', 'under-armour'],
        isFeatured: false,
        variants: [
          { size: 'US 8', color: 'Gray' },
          { size: 'US 9', color: 'Gray' },
          { size: 'US 10', color: 'Gray' }
        ]
      },
      {
        name: 'Bowflex SelectTech Dumbbells',
        description: 'Adjustable dumbbells that replace 15 sets of weights in one.',
        price: 399,
        stockQuantity: 25,
        specifications: [
          { key: 'Weight Range', value: '5-52.5 lbs' },
          { key: 'Adjustments', value: '15 weight settings' },
          { key: 'Material', value: 'Steel' }
        ],
        tags: ['dumbbells', 'fitness', 'bowflex'],
        isFeatured: false,
        variants: [{ size: '', color: 'Black' }]
      }
    ],
    Books: [
      {
        name: 'Rich Dad Poor Dad',
        description: 'Robert Kiyosaki\'s guide to financial literacy and wealth building.',
        price: 16,
        stockQuantity: 180,
        specifications: [
          { key: 'Author', value: 'Robert Kiyosaki' },
          { key: 'Pages', value: '336' },
          { key: 'Format', value: 'Paperback' }
        ],
        tags: ['finance', 'self-help', 'education'],
        isFeatured: true,
        variants: [{ size: '', color: 'Paperback' }]
      },
      {
        name: 'The 7 Habits of Highly Effective People',
        description: 'Stephen Covey\'s classic on personal and professional effectiveness.',
        price: 22,
        stockQuantity: 150,
        specifications: [
          { key: 'Author', value: 'Stephen Covey' },
          { key: 'Pages', value: '432' },
          { key: 'Format', value: 'Hardcover' }
        ],
        tags: ['self-help', 'leadership', 'productivity'],
        isFeatured: true,
        variants: [{ size: '', color: 'Hardcover' }]
      },
      {
        name: 'Think and Grow Rich',
        description: 'Napoleon Hill\'s timeless principles for success and wealth.',
        price: 14,
        stockQuantity: 200,
        specifications: [
          { key: 'Author', value: 'Napoleon Hill' },
          { key: 'Pages', value: '256' },
          { key: 'Format', value: 'Paperback' }
        ],
        tags: ['success', 'motivation', 'classic'],
        isFeatured: false,
        variants: [{ size: '', color: 'Paperback' }]
      }
    ],
    'Health and Beauty': [
      {
        name: 'Foreo Luna 3',
        description: 'Smart facial cleansing device with T-Sonic technology.',
        price: 199,
        stockQuantity: 50,
        specifications: [
          { key: 'Battery Life', value: '650 uses' },
          { key: 'Modes', value: '16' },
          { key: 'Water Resistance', value: 'IPX7' }
        ],
        tags: ['skincare', 'cleanser', 'foreo'],
        isFeatured: true,
        variants: [{ size: '', color: 'Pink' }]
      },
      {
        name: 'Philips Sonicare Toothbrush',
        description: 'Electric toothbrush with pressure sensor and 3 cleaning modes.',
        price: 129,
        stockQuantity: 75,
        specifications: [
          { key: 'Battery Life', value: '3 weeks' },
          { key: 'Modes', value: '3' },
          { key: 'Pressure Sensor', value: 'Yes' }
        ],
        tags: ['dental', 'electric', 'philips'],
        isFeatured: false,
        variants: [{ size: '', color: 'White' }]
      },
      {
        name: 'Clarins Double Serum',
        description: 'Anti-aging serum with 21 plant extracts for youthful skin.',
        price: 89,
        stockQuantity: 60,
        specifications: [
          { key: 'Size', value: '1oz' },
          { key: 'Skin Type', value: 'All skin types' },
          { key: 'Fragrance', value: 'Natural' }
        ],
        tags: ['skincare', 'serum', 'clarins'],
        isFeatured: false,
        variants: [{ size: '1oz', color: 'Amber' }]
      }
    ],
    Toys: [
      {
        name: 'PlayStation 5',
        description: 'Next-generation gaming console with 4K graphics and ray tracing.',
        price: 499,
        stockQuantity: 30,
        specifications: [
          { key: 'Storage', value: '825GB SSD' },
          { key: 'Graphics', value: '4K' },
          { key: 'Ray Tracing', value: 'Yes' }
        ],
        tags: ['gaming', 'playstation', 'console'],
        isFeatured: true,
        variants: [{ size: '', color: 'White' }]
      },
      {
        name: 'Hot Wheels Ultimate Garage',
        description: 'Multi-level car garage with ramps, elevator, and 5 cars.',
        price: 49,
        stockQuantity: 80,
        specifications: [
          { key: 'Levels', value: '3' },
          { key: 'Cars Included', value: '5' },
          { key: 'Features', value: 'Ramps and elevator' }
        ],
        tags: ['hot-wheels', 'cars', 'garage'],
        isFeatured: false,
        variants: [{ size: '', color: 'Multi-color' }]
      },
      {
        name: 'Melissa & Doug Wooden Blocks',
        description: '100-piece wooden building blocks for creative construction play.',
        price: 35,
        stockQuantity: 100,
        specifications: [
          { key: 'Pieces', value: '100' },
          { key: 'Material', value: 'Wood' },
          { key: 'Age Range', value: '3+' }
        ],
        tags: ['blocks', 'wooden', 'educational'],
        isFeatured: false,
        variants: [{ size: '', color: 'Natural Wood' }]
      }
    ],
    Food: [
      {
        name: 'Blue Bottle Coffee Beans',
        description: 'Single-origin coffee beans with complex flavor profiles.',
        price: 18,
        stockQuantity: 120,
        specifications: [
          { key: 'Origin', value: 'Ethiopia' },
          { key: 'Roast', value: 'Light' },
          { key: 'Weight', value: '12oz' }
        ],
        tags: ['coffee', 'beans', 'blue-bottle'],
        isFeatured: true,
        variants: [{ size: '12oz', color: 'Dark Brown' }]
      },
      {
        name: 'Godiva Chocolate Assortment',
        description: 'Premium Belgian chocolate assortment with 24 pieces.',
        price: 35,
        stockQuantity: 90,
        specifications: [
          { key: 'Pieces', value: '24' },
          { key: 'Origin', value: 'Belgium' },
          { key: 'Cocoa Content', value: 'Various' }
        ],
        tags: ['chocolate', 'godiva', 'premium'],
        isFeatured: false,
        variants: [{ size: '24 pieces', color: 'Assorted' }]
      },
      {
        name: 'Manuka Honey',
        description: 'Premium Manuka honey with high MGO content for health benefits.',
        price: 45,
        stockQuantity: 60,
        specifications: [
          { key: 'MGO Rating', value: '400+' },
          { key: 'Weight', value: '8.8oz' },
          { key: 'Origin', value: 'New Zealand' }
        ],
        tags: ['honey', 'manuka', 'premium'],
        isFeatured: true,
        variants: [{ size: '8.8oz', color: 'Golden' }]
      }
    ]
  };

  // Create products for each category
  let totalCreated = 0;
  for (const [categoryName, products] of Object.entries(productData)) {
    const category = createdCategories.find(c => c.name === categoryName);
    if (category) {
      for (const product of products) {
        try {
          await productService.create({
            ...product,
            category: (category as any)._id,
            images: [], // Will be added later
            stockQuantity: product.stockQuantity
          });
          totalCreated++;
        } catch (error) {
          console.error(`❌ Failed to create product: ${product.name}`, error);
        }
      }
    }
  }


  
  await app.close();
}

bootstrap();
