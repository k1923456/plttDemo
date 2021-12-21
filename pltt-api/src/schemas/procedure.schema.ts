import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BigNumber } from '@ethersproject/bignumber';

export type ProcedureDocument = Procedure & Document;

export class ProcedureEntity {
  procedureID: number;
  privateKey: string;

  constructor(object) {
    this.procedureID = object.procedureID;
    this.privateKey = object.privateKey;
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
