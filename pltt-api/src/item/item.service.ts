import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  OrganizationEntity,
  Organization,
  OrganizationDocument,
} from '../schemas/organization.schema';
import { ItemEntity, Item, ItemDocument } from '../schemas/item.schema';
import { ItemDto } from './dto/item.dto';

@Injectable()
export class ItemService {
  constructor(
    @InjectModel(Organization.name)
    private organizationModel: Model<OrganizationDocument>,
    @InjectModel(Item.name) private itemModel: Model<ItemDocument>,
  ) {}

  async createItem(itemDto: ItemDto, itemAddress: string) {
    await this.itemModel
      .findOneAndUpdate(
        {
          shid: itemDto.shid,
        },
        new ItemEntity({
          shid: itemDto.shid,
          title: itemDto.title,
          address: itemAddress,
        }),
        { upsert: true },
      )
      .exec();
  }

  async createOrganization(itemDto: ItemDto, privateKey: string) {
    await this.organizationModel
      .findOneAndUpdate(
        {
          organizationID: itemDto.organizationID,
        },
        new OrganizationEntity({
          organizationID: itemDto.organizationID,
          organizationName: itemDto.organizationName,
          privateKey,
        }),
        { upsert: true },
      )
      .exec();
  }

  async findOneItem(shid: number) {
    return await this.itemModel.findOne({ shid }).exec();
  }

  async findOneOrganization(organizationID: number) {
    return await this.organizationModel.findOne({ organizationID });
  }
}
