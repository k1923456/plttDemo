import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  HttpException,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { ProductDto } from './dto/product.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ProductService } from './product.service';

@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    @InjectQueue('product') private productQueue: Queue,
  ) {}

  async AddProductJob(type: string, productDto: ProductDto) {
    return await this.productQueue.add(type, {
      productDto,
    });
  }

  checkSourceList(productDto: ProductDto) {
    for (let i = 0; i < productDto.sourceList.length; i++) {
      if (
        productDto.sourceList[i].shid !== undefined &&
        productDto.sourceList[i].phid !== undefined
      ) {
        throw new HttpException(
          `Source Product ${i} has both shid/phid`,
          HttpStatus.BAD_REQUEST,
        );
      } else if (
        productDto.sourceList[i].shid === undefined &&
        productDto.sourceList[i].phid === undefined
      ) {
        throw new HttpException(
          `Source Product ${i} missing one of shid/phid`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  @Get(':jobID')
  async query(@Param() params) {
    const job = await this.productQueue.getJob(params.jobID);
    if (job === null) {
      throw new HttpException(
        `Job ID ${params.jobID} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    const status = await job.getState();
    let failedReason = '';
    if (status === 'failed') {
      failedReason = job.failedReason;

      return {
        jobID: params.jobID,
        status,
        address: "",
        failedReason,
      };
    }

    const product = await this.productService.findOneProduct(
      job.data.productDto.phid,
    );
    if (product === null) {
      throw new HttpException(
        `Product has not been created`,
        HttpStatus.CONFLICT,
      );
    }

    return {
      jobID: params.jobID,
      status,
      address: product.address,
      failedReason,
    };
  }

  @Post()
  async create(@Body() productDto: ProductDto) {
    const product = await this.productService.findOneProduct(productDto.phid);
    if (product !== null) {
      throw new HttpException(`Product has been created`, HttpStatus.CONFLICT);
    }

    this.checkSourceList(productDto);
    const job = await this.AddProductJob('deployProduct', productDto);

    return {
      jobID: job.id,
      status: 'active',
    };
  }

  @Put()
  async update(@Body() productDto: ProductDto) {
    const product = await this.productService.findOneProduct(productDto.phid);
    if (product === null) {
      throw new HttpException(
        `Product has not been created`,
        HttpStatus.CONFLICT,
      );
    }
    this.checkSourceList(productDto);
    const job = await this.AddProductJob('modifyProduct', productDto);

    return {
      jobID: job.id,
      status: 'active',
    };
  }
}
