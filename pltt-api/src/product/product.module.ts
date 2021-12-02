import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Organization,
  OrganizationSchema,
} from '../schemas/organization.schema';
import { Product, ProductSchema } from '../schemas/product.schema';
import { ItemService } from '../item/item.service';
import { Item, ItemSchema } from '../schemas/item.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Organization.name, schema: OrganizationSchema },
      { name: Item.name, schema: ItemSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [ProductController],
  providers: [ProductService, ItemService]
})
export class ProductModule {}
