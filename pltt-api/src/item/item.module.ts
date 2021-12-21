import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Organization,
  OrganizationSchema,
} from '../schemas/organization.schema';
import { Item, ItemSchema } from '../schemas/item.schema';
import { Product, ProductSchema } from '../schemas/product.schema';
import { ItemService } from './item.service';
import { ProductService } from '../product/product.service';
import { ItemController } from './item.controller';
import { ItemConsumer } from './item.consumer';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Organization.name, schema: OrganizationSchema },
      { name: Item.name, schema: ItemSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    BullModule.registerQueue({
      name: 'item',
    }),
  ],
  controllers: [ItemController],
  providers: [ItemService, ProductService, ItemConsumer],
})
export class ItemModule {}
