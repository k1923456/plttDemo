import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
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
import { ProductDto } from './dto/product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Organization.name)
    private organizationModel: Model<OrganizationDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async createProduct(productDto: ProductDto, productAddress: string) {
    await this.productModel
      .findOneAndUpdate(
        {
          phid: productDto.phid,
        },
        new ProductEntity({ shid: productDto.phid, title: productDto.title, address: productAddress }),
        { upsert: true },
      )
      .exec();
  }

  async createOrganization(productDto: ProductDto, privateKey: string) {
    await this.organizationModel
      .findOneAndUpdate(
        {
          organizationID: productDto.organizationID,
        },
        new OrganizationEntity({
          organizationID: productDto.organizationID,
          organizationName: productDto.organizationName,
          privateKey,
        }),
        { upsert: true },
      )
      .exec();
  }

  async createOrganizationForOwner(productDto: ProductDto, privateKey: string) {
    await this.organizationModel
      .findOneAndUpdate(
        {
          organizationID: productDto.ownerID,
        },
        new OrganizationEntity({
          organizationID: productDto.ownerID,
          organizationName: productDto.organizationName,
          privateKey,
        }),
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
