import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ItemModule } from './item/item.module';
import { ProcedureModule } from './procedure/procedure.module';
import { TransactionModule } from './transaction/transaction.module';
import { EthersModule } from './ethers/ethers.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(
      `mongodb://${process.env.DB_USER}:${process.env.DB_PWD}@localhost:27017/${process.env.DB_NAME}`,
    ),
    ProcedureModule,
    ItemModule,
    TransactionModule,
    EthersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
