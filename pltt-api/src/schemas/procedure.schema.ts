import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BigNumber } from '@ethersproject/bignumber';

export type ProcedureDocument = Procedure & Document;

export class ProcedureDataEntity {
  procedure: string;
  name: string;
  mediaList: string[];
  sensorList: string[];
  startTime: BigNumber;
  endTime: BigNumber;

  constructor(object) {
    this.procedure = object.procedure;
    this.name = object.name;
    this.mediaList = object.mediaList;
    this.sensorList = object.sensorList;
    this.startTime = BigNumber.from(Date.parse(object.startTime) / 1000);
    this.endTime = BigNumber.from(Date.parse(object.endTime) / 1000);
  }
}

@Schema()
export class Procedure {
  @Prop()
  name: string;

  @Prop()
  procedureID: number;

  @Prop()
  privateKey: string;
}

export const ProcedureSchema = SchemaFactory.createForClass(Procedure);
