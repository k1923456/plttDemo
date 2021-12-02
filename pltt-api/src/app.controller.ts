import { Controller, Get, Post, Put, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('object')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('')
  async getHello(@Req() request): Promise<string> {
    console.log(request.params);
    console.log(request.query);
    return await this.appService.getHello();
  }

  @Post('')
  async getObject(@Req() request): Promise<string> {
    console.log(request.body);
    return await this.appService.getHello();
  }
}
