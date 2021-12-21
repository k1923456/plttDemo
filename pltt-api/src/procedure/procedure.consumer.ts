import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { EthersService } from '../ethers/ethers.service';
import { ItemService } from '../item/item.service';
import { ProcedureService } from './procedure.service';
import { ProcedureDto } from './dto/procedure.dto';
import { ProcedureData } from '../ethers/schemas/procedure.schema';

@Processor('procedure')
export class ProcedureConsumer {
  constructor(
    private readonly ethersService: EthersService,
    private readonly itemService: ItemService,
    private readonly procedureService: ProcedureService,
  ) {}

  async getWallet(procedureDto: ProcedureDto) {
    const procedureData = await this.procedureService.findOneProcedure(
      procedureDto.procedureID,
    );
    if (procedureData === null) {
      const wallet = await this.ethersService.generateAccount(
        procedureDto.procedureID.toString(),
      );
      await this.procedureService.createProcedure(
        procedureDto,
        wallet._signingKey().privateKey,
      );
      return wallet;
    } else {
      return this.ethersService.getSigner(procedureData.privateKey);
    }
  }

  generateProcedureData(procedureDto: ProcedureDto, procedure: string) {
    return new ProcedureData({ ...procedureDto, procedure });
  }

  @Process('addProcedure')
  async addProcedure(job: Job) {
    // Check Procedure Existed
    const item = await this.itemService.findOneItem(job.data.procedureDto.shid);
    const wallet = await this.getWallet(job.data.procedureDto);
    const procedureData = this.generateProcedureData(
      job.data.procedureDto,
      wallet.address,
    );
    await this.ethersService.addProcedure(wallet, item.address, procedureData);
  }
}
