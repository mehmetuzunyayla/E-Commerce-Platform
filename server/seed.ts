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
  for (const category of categories) {
    const existing = await categoryService.findAll();
    if (!existing.find(c => c.name === category.name)) {
      await categoryService.create(category);
    }
  }

  // ADMIN USER SEED
  const userService = app.get(UserService);
  const adminEmail = 'admin@ecommerce.com';
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
    console.log('Seeded admin user:', adminEmail, 'password: admin123');
  }

  // PRODUCT SEED (add to Electronics)
  const productService = app.get(ProductService);
  const electronicsCategory = (await categoryService.findAll()).find(c => c.name === 'Electronics');
  if (electronicsCategory) {
    const existingProducts = await productService.findAll();
    if (!existingProducts.find(p => p.name === 'Smartphone')) {
      await productService.create({
        name: 'Smartphone',
        description: 'Latest model smartphone with all features.',
        price: 799,
        images: [],
        category: (electronicsCategory as any)._id,
        stockQuantity: 100,
        specifications: [{ key: 'Color', value: 'Black' }, { key: 'RAM', value: '8GB' }],
        tags: ['mobile', 'electronics'],
        isFeatured: true,
        variants: [{ size: '', color: 'Black' }],
      });
    }
  }

  console.log('Database seeded!');
  await app.close();
}

bootstrap();
