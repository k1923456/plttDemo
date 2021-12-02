import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrganizationDocument = Organization & Document;

export class OrganizationEntity {
  organizationID: number;
  privateKey: string;

  constructor(object) {
    this.organizationID = object.organizationID;
    this.privateKey = object.privateKey;
  }
}

@Schema()
export class Organization {
  @Prop()
  name: string;

  @Prop()
  organizationID: number;

  @Prop()
  privateKey: string;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
