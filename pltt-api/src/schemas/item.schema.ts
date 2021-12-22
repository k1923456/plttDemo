import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export class ItemEntity {
  shid: number;
  title: string;
  address: string;

  constructor(object) {
    this.shid = object.shid;
    this.title = object.title;
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
  title: string;

  @Prop()
  address: string;
}

export const ItemSchema = SchemaFactory.createForClass(Item);
