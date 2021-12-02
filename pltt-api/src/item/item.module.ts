import { Module } from '@nestjs/common';
import { ItemService } from './item.service';
import { ProductService } from '../product/product.service'
import { ItemController } from './item.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Organization,
  OrganizationSchema,
} from '../schemas/organization.schema';
import { Item, ItemSchema } from '../schemas/item.schema';
import { Product, ProductSchema } from '../schemas/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Organization.name, schema: OrganizationSchema },
      { name: Item.name, schema: ItemSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [ItemController],
  providers: [ItemService, ProductService],
})
export class ItemModule {}
