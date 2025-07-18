import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import { readdir } from 'fs/promises';
import { join } from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('uploads-test')
  async testUploads(@Res() res: Response) {
    try {
      const uploadsPath = join(__dirname, '..', 'uploads');
      const categoriesPath = join(uploadsPath, 'categories');
      
      const categories = await readdir(categoriesPath);
      
      res.json({
        message: 'Uploads directory test',
        uploadsPath,
        categoriesPath,
        files: categories,
        testUrl: 'http://localhost:3001/uploads/categories/' + categories[0]
      });
    } catch (error) {
      res.status(500).json({
        error: error.message,
        message: 'Failed to read uploads directory'
      });
    }
  }
}
