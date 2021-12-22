import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  ProcedureEntity,
  Procedure,
  ProcedureDocument,
} from '../schemas/procedure.schema';
import { ProcedureDto } from './dto/procedure.dto';

@Injectable()
export class ProcedureService {
  constructor(
    @InjectModel(Procedure.name)
    private procedureModel: Model<ProcedureDocument>,
  ) {}

  async createProcedure(procedureDto: ProcedureDto, privateKey: string) {
    await this.procedureModel
      .findOneAndUpdate(
        {
          procedureID: procedureDto.procedureID,
        },
        new ProcedureEntity({
          procedureID: procedureDto.procedureID,
          procedureName: procedureDto.procedureName,
          privateKey: privateKey,
        }),
        { upsert: true },
      )
      .exec();
  }

  async findOneProcedure(shid: number) {
    return await this.procedureModel.findOne({ shid }).exec();
  }
}
