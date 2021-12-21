import {
  Controller,
  Get,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { ProcedureDto } from './dto/procedure.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ItemService } from '../item/item.service';

@Controller('procedure')
export class ProcedureController {
  constructor(
    private readonly itemService: ItemService,
    @InjectQueue('procedure') private procedureQueue: Queue,
  ) {}

  async AddProcedureJob(type: string, procedureDto: ProcedureDto) {
    return await this.procedureQueue.add(type, {
      procedureDto,
    });
  }

  @Get(':jobID')
  async query(@Param() params) {
    const job = await this.procedureQueue.getJob(params.jobID);
    if (job === null) {
      throw new HttpException(
        `Job ID ${params.jobID} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    const item = await this.itemService.findOneItem(job.data.procedureDto.shid);
    if (item === null) {
      throw new HttpException(`Item has not been created`, HttpStatus.CONFLICT);
    }
    const status = await job.getState();
    let failedReason = '';
    if (status === 'failed') {
      failedReason = job.failedReason;
    }

    return {
      jobID: params.jobID,
      status,
      address: item.address,
      failedReason,
    };
  }

  @Post()
  async create(@Body() procedureDto: ProcedureDto) {
    const item = await this.itemService.findOneItem(procedureDto.shid);
    if (item === null) {
      throw new HttpException(`Item has not been created`, HttpStatus.CONFLICT);
    }

    const job = await this.AddProcedureJob('addProcedure', procedureDto);

    return {
      jobID: job.id,
      status: 'active',
    };
  }
}
