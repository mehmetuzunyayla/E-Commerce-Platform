import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req, ForbiddenException, UseInterceptors, UploadedFile } from '@nestjs/common';
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
  async findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.productService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Req() req: any, @Body() createProductDto: CreateProductZodDto) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Only admin can create products');
    return this.productService.create(createProductDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductZodDto, @Req() req: any) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Only admin can update products');
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string, @Req() req: any) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Only admin can delete products');
    return this.productService.delete(id);
  }

  // ---- Image upload endpoint ----
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
