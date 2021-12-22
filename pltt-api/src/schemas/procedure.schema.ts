import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProcedureDocument = Procedure & Document;

export class ProcedureEntity {
  procedureID: number;
  procedureName: string;
  privateKey: string;

  constructor(object) {
    this.procedureID = object.procedureID;
    this.procedureName = object.procedureName;
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
  procedureName: string;

  @Prop()
  privateKey: string;
}

export const ProcedureSchema = SchemaFactory.createForClass(Procedure);
