import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { ItemModule } from './item/item.module';
import { ProcedureModule } from './procedure/procedure.module';
import { EthersModule } from './ethers/ethers.module';
import { ProductModule } from './product/product.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(
      `mongodb://${process.env.DB_USER}:${process.env.DB_PWD}@localhost:27017/${process.env.DB_NAME}`,
    ),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
        password: process.env.REDIS_PWD
      },
    }),
    EthersModule,
    ItemModule,
    ProcedureModule,
    ProductModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
