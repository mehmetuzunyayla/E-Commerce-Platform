import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req, ForbiddenException, UseInterceptors, UploadedFile } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryZodDto, UpdateCategoryZodDto } from './dto/create-category.dto';
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

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.categoryService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Req() req: any, @Body() createCategoryDto: CreateCategoryZodDto) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Only admin can create categories');
    return this.categoryService.create(createCategoryDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryZodDto, @Req() req: any) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Only admin can update categories');
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string, @Req() req: any) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Only admin can delete categories');
    return this.categoryService.delete(id);
  }

  // ---- Image upload endpoint ----
  @Post(':id/upload-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads/categories',
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
    const imagePath = `/uploads/categories/${file.filename}`;
    // This replaces the image field (if you want multiple images, adjust schema/logic)
    return this.categoryService.update(id, { image: imagePath });
  }
}
