import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export class ProductEntity {
  phid: number;
  title: string;
  address: string;

  constructor(object) {
    this.phid = object.phid;
    this.title = object.title;
    this.address = object.address;
  }
}

export type ProductDocument = Product & Document;

@Schema()
export class Product {
  @Prop()
  name: string;

  @Prop()
  phid: number;

  @Prop()
  title: string;

  @Prop()
  address: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
