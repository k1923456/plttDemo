import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import {
  OrganizationEntity,
  Organization,
  OrganizationDocument,
} from '../schemas/organization.schema';
import { ItemEntity, Item, ItemDocument } from '../schemas/item.schema';
import { CreateItemDto } from './dto/create-item.dto';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class ItemService {
  constructor(
    @InjectModel(Organization.name)
    private organizationModel: Model<OrganizationDocument>,
    @InjectModel(Item.name) private itemModel: Model<ItemDocument>,
  ) {}

  async createItem(createItemDto: CreateItemDto, itemAddress: string) {
    await this.itemModel
      .findOneAndUpdate(
        {
          shid: createItemDto.shid,
        },
        new ItemEntity({shid: createItemDto.shid, address: itemAddress}),
        { upsert: true },
      )
      .exec();
  }

  async createOrganization(createItemDto: CreateItemDto, privateKey: string) {
    await this.organizationModel
      .findOneAndUpdate(
        {
          organizationID: createItemDto.organizationID,
        },
        new OrganizationEntity({
          organizationID: createItemDto.organizationID,
          privateKey
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
