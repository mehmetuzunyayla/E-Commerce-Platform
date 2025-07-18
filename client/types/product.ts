// client/types/product.ts
export interface Category {
  _id: string;
  name: string;
  description: string;
  image?: string;
  status: 'active' | 'inactive';
  sortOrder?: number;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  specifications?: Record<string, string>;
  tags?: string[];
  variants?: any[]; // Add stricter typing if you support variants
  featured?: boolean;
  category: Category | string;
  stockQuantity?: number;
}
