import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export class ItemEntity {
  shid: number;
  address: string;

  constructor(object) {
    this.shid = object.shid;
    this.address = object.address;
  }
}

export type ItemDocument = Item & Document;

@Schema()
export class Item {
  @Prop()
  name: string;

  @Prop()
  shid: number;

  @Prop()
  address: string;
}

export const ItemSchema = SchemaFactory.createForClass(Item);
