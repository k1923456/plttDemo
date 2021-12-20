import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { EthersService } from '../ethers/ethers.service';
import { ProcedureService } from './procedure.service';
import { ProcedureDto } from './dto/procedure.dto';

@Controller('procedure')
export class ProcedureController {
  constructor(
    private readonly procedureService: ProcedureService,
    private ethersService: EthersService,
  ) {}

  @Post()
  create(@Body() procedureDto: ProcedureDto) {
    return this.procedureService.create(procedureDto);
  }

  @Get()
  findAll() {
    return this.procedureService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.procedureService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() procedureDto: ProcedureDto) {
    return this.procedureService.update(+id, procedureDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.procedureService.remove(+id);
  }
}
