import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import {
  OrganizationEntity,
  Organization,
  OrganizationDocument,
} from '../schemas/organization.schema';
import {
  ProductEntity,
  Product,
  ProductDocument,
} from '../schemas/product.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Organization.name)
    private organizationModel: Model<OrganizationDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async createProduct(productEntity: ProductEntity, itemAddress: string) {
    await this.productModel
      .findOneAndUpdate(
        {
          phid: productEntity.phid,
        },
        productEntity,
        { upsert: true },
      )
      .exec();
  }

  async createOrganization(organizationEntity: OrganizationEntity) {
    await this.organizationModel
      .findOneAndUpdate(
        {
          organizationID: organizationEntity.organizationID,
        },
        organizationEntity,
        { upsert: true },
      )
      .exec();
  }

  async findOneProduct(phid: number) {
    return await this.productModel.findOne({ phid }).exec();
  }

  async findOneOrganization(organizationID: number) {
    return await this.organizationModel.findOne({ organizationID });
  }
}
