import { Injectable } from '@nestjs/common';
import { ProductService } from '../product/product.service';
import { OrderService } from '../order/order.service';

@Injectable()
export class RecommendationService {
  constructor(
    private readonly productService: ProductService,
    private readonly orderService: OrderService,
  ) {}

  // Recommend popular products by order count (simple example)
  async getPopularProducts(limit = 10) {
    const allOrders = await this.orderService.findAll();
    const countMap: { [productId: string]: number } = {};
    
    allOrders.forEach(order => {
      order.items.forEach(item => {
        // Handle both populated and unpopulated product field
        const productId = item.product && typeof item.product === 'object' && item.product._id 
          ? item.product._id.toString() 
          : item.product?.toString();
        
        if (productId) {
          countMap[productId] = (countMap[productId] || 0) + item.quantity;
        }
      });
    });
    
    const sorted = Object.entries(countMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);
    const popularProductIds = sorted.map(([id]) => id);
    
    // Fetch product details
    return this.productService.findAll().then(products =>
      products.filter((p: any) => popularProductIds.includes(p._id.toString()))
    );
  }

  // Recommend products bought together with a given product
  async getFrequentlyBoughtTogether(productId: string, limit = 5) {
    const allOrders = await this.orderService.findAll();
    const togetherMap: { [id: string]: number } = {};
    
    allOrders.forEach(order => {
      const productIds = order.items.map(item => {
        // Handle both populated and unpopulated product field
        const product = item.product && typeof item.product === 'object' && item.product._id 
          ? item.product._id.toString() 
          : item.product?.toString();
        return product;
      }).filter(Boolean); // Remove null/undefined values
      
      if (productIds.includes(productId)) {
        productIds.forEach(id => {
          if (id !== productId) togetherMap[id] = (togetherMap[id] || 0) + 1;
        });
      }
    });
    
    const sorted = Object.entries(togetherMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);
    const productIds = sorted.map(([id]) => id);
    
    return this.productService.findAll().then(products =>
      products.filter((p:any) => productIds.includes(p._id.toString()))
    );
  }
}
