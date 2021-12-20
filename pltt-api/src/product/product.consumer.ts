import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { EthersService } from '../ethers/ethers.service';
import { ProductService } from './product.service';

@Processor('itemContract')
export class ItemConsumer {
  constructor(
    private readonly ethersService: EthersService,
    private readonly productService: ProductService,
  ) {}
  @Process('item')
  async deployContract(job: Job) {
    const progress = 0;
    // for (i = 0; i < 100; i++) {
    //   await doSomething(job.data);
    //   progress += 10;
    //   await job.progress(progress);
    // }
    console.log('----------------IN Jobs---------------');
    // console.log(job.data.wallet)
    // const productAddress = await this.ethersService.deployProduct(job.data.productDto, job.data.sourceList, this.ethersService.getSigner(job.data.privateKey));
    // await this.productService.createProduct(job.data.productDto, productAddress);
    console.log('----------------IN Jobs---------------');
    return {};
  }
}
