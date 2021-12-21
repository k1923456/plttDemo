import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Organization,
  OrganizationSchema,
} from '../schemas/organization.schema';
import { Item, ItemSchema } from '../schemas/item.schema';
import { Procedure, ProcedureSchema } from '../schemas/procedure.schema';
import { ProcedureService } from './procedure.service';
import { ProcedureController } from './procedure.controller';
import { ItemService } from '../item/item.service';
import { ProcedureConsumer } from './procedure.consumer';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Procedure.name, schema: ProcedureSchema },
      { name: Organization.name, schema: OrganizationSchema },
      { name: Item.name, schema: ItemSchema },
    ]),
    BullModule.registerQueue({
      name: 'procedure',
    }),
  ],
  controllers: [ProcedureController],
  providers: [ProcedureService, ItemService, ProcedureConsumer],
})
export class ProcedureModule {}
