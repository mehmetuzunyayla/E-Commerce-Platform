import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req, ForbiddenException, UseInterceptors, UploadedFile, Query, BadRequestException } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductZodDto, UpdateProductZodDto } from './dto/create-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FileFilterCallback } from 'multer';

const imageFileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (!file.mimetype.match(/^image\/(jpg|jpeg|png|webp|gif)$/)) {
    cb(null, false);
  }
  cb(null, true);
};

const editFileName = (
  req: any,
  file: Express.Multer.File,
  cb: (error: Error | null, filename: string) => void
) => {
  const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
  cb(null, uniqueName);
};


@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async findAll(
    @Query('featured') featured?: string,
    @Query('sort') sort?: string,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
    @Query('ids') ids?: string,
  ) {
    // Handle batch fetch for wishlist
    if (ids) {
      const idArray = ids.split(',').map((id: string) => id.trim());
      return this.productService.findByIds(idArray);
    }
    
    const result = await this.productService.findAll({
      featured: featured === 'true',
      sort,
      limit: limit ? parseInt(limit) : undefined,
      page: page ? parseInt(page) : undefined,
    });
    return result;
  }

  @Get('count')
  async getCount() {
    const totalCount = await this.productService.getTotalCount();
    return { totalCount };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.productService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Req() req: any, @Body() createData: any) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Only admin can create products');
    
    try {
      // Manual validation without Zod to avoid version conflicts
      if (!createData.name || createData.name.length < 2) {
        throw new BadRequestException('Product name is required and must be at least 2 characters');
      }
      if (!createData.description || createData.description.length < 5) {
        throw new BadRequestException('Product description is required and must be at least 5 characters');
      }
      if (!createData.price || createData.price <= 0) {
        throw new BadRequestException('Product price is required and must be greater than 0');
      }
      if (!createData.category) {
        throw new BadRequestException('Product category is required');
      }
      if (!createData.stockQuantity || createData.stockQuantity < 0) {
        throw new BadRequestException('Product stock must be 0 or greater');
      }
      
      const result = await this.productService.create(createData);
      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Product creation error:', error);
      throw new BadRequestException('Failed to create product');
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateData: any, @Req() req: any) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Only admin can update products');
    
    try {
      // Manual validation without Zod to avoid version conflicts
      if (updateData.name !== undefined && updateData.name.length < 2) {
        throw new BadRequestException('Product name must be at least 2 characters');
      }
      if (updateData.description !== undefined && updateData.description.length < 5) {
        throw new BadRequestException('Product description must be at least 5 characters');
      }
      if (updateData.price !== undefined && updateData.price <= 0) {
        throw new BadRequestException('Product price must be greater than 0');
      }
      if (updateData.stockQuantity !== undefined && updateData.stockQuantity < 0) {
        throw new BadRequestException('Product stock must be 0 or greater');
      }
      
      const result = await this.productService.update(id, updateData);
      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Product update error:', error);
      throw new BadRequestException('Failed to update product');
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string, @Req() req: any) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Only admin can delete products');
    return this.productService.delete(id);
  }

  // ---- Temporary upload endpoint for new products ----
  @Post('temp-upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads/products',
      filename: editFileName,
    }),
    fileFilter: imageFileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  }))
  async tempUpload(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Only admin can upload images');
    if (!file) throw new ForbiddenException('No file uploaded or invalid file type');
    const imagePath = `/uploads/products/${file.filename}`;
    return { imagePath };
  }

  // ---- Image upload endpoint for existing products ----
  @Post(':id/upload-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads/products',
      filename: editFileName,
    }),
    fileFilter: imageFileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  }))
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Only admin can upload images');
    if (!file) throw new ForbiddenException('No file uploaded or invalid file type');
    const imagePath = `/uploads/products/${file.filename}`;
    // Optionally push to array, or replace – this example adds to array:
    return this.productService.pushImage(id, imagePath);
  }
}
