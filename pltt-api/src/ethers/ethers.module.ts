import { Module, Global } from '@nestjs/common';
import { EthersService } from './ethers.service';

@Global()
@Module({
      providers: [EthersService],
      exports: [EthersService]
})
export class EthersModule {}
