import { Injectable } from '@nestjs/common';
import { ProcedureDto } from './dto/procedure.dto';

@Injectable()
export class ProcedureService {
  create(procedureDto: ProcedureDto) {
    return 'This action adds a new procedure';
  }

  findAll() {
    return `This action returns all procedure`;
  }

  findOne(id: number) {
    return `This action returns a #${id} procedure`;
  }

  update(id: number, procedureDto: ProcedureDto) {
    return `This action updates a #${id} procedure`;
  }

  remove(id: number) {
    return `This action removes a #${id} procedure`;
  }
}
