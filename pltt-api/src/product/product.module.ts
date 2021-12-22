import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Organization,
  OrganizationSchema,
} from '../schemas/organization.schema';
import { Item, ItemSchema } from '../schemas/item.schema';
import { Product, ProductSchema } from '../schemas/product.schema';
import { ItemService } from '../item/item.service';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ProductConsumer } from './product.consumer';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Organization.name, schema: OrganizationSchema },
      { name: Item.name, schema: ItemSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    BullModule.registerQueue({
      name: 'product',
    }),
  ],
  controllers: [ProductController],
  providers: [ProductService, ItemService, ProductConsumer],
})
export class ProductModule {}
