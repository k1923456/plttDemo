import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrganizationDocument = Organization & Document;

export class OrganizationEntity {
  organizationID: number;
  organizationName: string;
  privateKey: string;

  constructor(object) {
    this.organizationID = object.organizationID;
    this.organizationName = object.organizationName;
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
  organizationName: string;

  @Prop()
  privateKey: string;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
