import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export class ProductEntity {
  phid: number;
  address: string;

  constructor(object) {
    this.phid = object.phid;
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
  address: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
