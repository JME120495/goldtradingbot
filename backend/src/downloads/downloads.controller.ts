import { Controller, Post, Get, Body, Query, UseGuards, Request, Res, UnauthorizedException } from '@nestjs/common';
import { DownloadsService } from './downloads.service';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';

@Controller('downloads')
export class DownloadsController {
  constructor(private readonly downloadsService: DownloadsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('products')
  async getProducts() {
    return this.downloadsService.getProducts();
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('generate-url')
  async generateUrl(@Request() req, @Body('product') product: string) {
    return this.downloadsService.generateSignedUrl(req.user.userId, product);
  }

  @Get('file')
  async getFile(@Query('token') token: string, @Res() res: Response) {
    if (!token) throw new UnauthorizedException('Token required');
    
    const fileInfo = await this.downloadsService.getFile(token);
    
    res.download(fileInfo.path, fileInfo.filename);
  }
}
