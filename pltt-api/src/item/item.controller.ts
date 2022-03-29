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
import { ItemDto } from './dto/item.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ItemService } from './item.service';

@Controller('item')
export class ItemController {
  constructor(
    private readonly itemService: ItemService,
    @InjectQueue('item') private itemQueue: Queue,
  ) {}

  async AddItemJob(type: string, itemDto: ItemDto) {
    return await this.itemQueue.add(type, {
      itemDto,
    });
  }

  checkSourceList(itemDto: ItemDto) {
    for (let i = 0; i < itemDto.sourceList.length; i++) {
      if (
        itemDto.sourceList[i].shid !== undefined &&
        itemDto.sourceList[i].phid !== undefined
      ) {
        throw new HttpException(
          `Source Item ${i} has both shid/phid`,
          HttpStatus.BAD_REQUEST,
        );
      } else if (
        itemDto.sourceList[i].shid === undefined &&
        itemDto.sourceList[i].phid === undefined
      ) {
        throw new HttpException(
          `Source Item ${i} missing one of shid/phid`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  @Get(':jobID')
  async query(@Param() params) {
    const job = await this.itemQueue.getJob(params.jobID);
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

    const item = await this.itemService.findOneItem(job.data.itemDto.shid);
    if (item === null) {
      throw new HttpException(`Item has not been created`, HttpStatus.CONFLICT);
    }

    return {
      jobID: params.jobID,
      status,
      address: item.address,
      failedReason,
    };
  }

  @Post()
  async create(@Body() itemDto: ItemDto) {
    const item = await this.itemService.findOneItem(itemDto.shid);
    if (item !== null) {
      throw new HttpException(`Item has been created`, HttpStatus.CONFLICT);
    }

    this.checkSourceList(itemDto);
    console.log(itemDto)
    const job = await this.AddItemJob('deployItem', itemDto);

    return {
      jobID: job.id,
      status: 'active',
    };
  }

  @Put()
  async update(@Body() itemDto: ItemDto) {
    const item = await this.itemService.findOneItem(itemDto.shid);
    if (item === null) {
      throw new HttpException(`Item has not been created`, HttpStatus.CONFLICT);
    }
    this.checkSourceList(itemDto);
    const job = await this.AddItemJob('modifyItem', itemDto);

    return {
      jobID: job.id,
      status: 'active',
    };
  }
}
