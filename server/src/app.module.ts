import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ProductModule } from './modules/product/product.module';
import { CategoryModule } from './modules/category/category.module';
import { OrderModule } from './modules/order/order.module';
import { CartModule } from './modules/cart/cart.module';
import { ReviewModule } from './modules/review/review.module';
import { RecommendationModule } from './modules/recommendation/recommendation.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    // 👇 Add this line to connect to MongoDB!
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce'),
    AuthModule,
    UserModule,
    ProductModule,
    CategoryModule,
    OrderModule,
    CartModule,
    ReviewModule,
    RecommendationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
