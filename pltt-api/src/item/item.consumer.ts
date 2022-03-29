import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { EthersService } from '../ethers/ethers.service';
import { ItemDto, Source } from './dto/item.dto';
import { ItemService } from './item.service';
import { ProcedureService } from '../procedure/procedure.service';
import { ProductService } from '../product/product.service';
import { ItemData } from '../ethers/schemas/item.schema';
import { TraceData } from '../ethers/schemas/traceData.schema';
import { Quantity } from '../ethers/schemas/quantity.schema';
import { ProcedureDto } from '../procedure/dto/procedure.dto';

@Processor('item')
export class ItemConsumer {
  constructor(
    private readonly ethersService: EthersService,
    private readonly itemService: ItemService,
    private readonly procedureService: ProcedureService,
    private readonly productService: ProductService,
  ) {}

  async getWallet(itemDto: ItemDto) {
    const organizationData = await this.itemService.findOneOrganization(
      itemDto.organizationID,
    );
    if (organizationData === null) {
      const wallet = await this.ethersService.generateAccount(
        itemDto.organizationID.toString(),
      );
      await this.itemService.createOrganization(
        itemDto,
        wallet._signingKey().privateKey,
      );
      return wallet;
    } else {
      return this.ethersService.getSigner(organizationData.privateKey);
    }
  }

  generateItemData(itemDto: ItemDto, organization: string) {
    return new ItemData({ ...itemDto, organization });
  }

  generateTraceableObjectData(dto: ItemDto, sourceList) {
    console.log("BBB")
    const quantity = new Quantity(dto);
    console.log("BBB")
    const traceDataList: TraceData[] = [];
    console.log("BBB")
    for (let i = 0; i < sourceList.length; i++) {
      traceDataList.push(new TraceData(sourceList[i]));
    }
    console.log("BBB")

    return { quantity, traceDataList };
  }

  async getItem(source: Source) {
    const sourceData = await this.itemService.findOneItem(source.shid);
    if (sourceData !== null) {
      return {
        shid: source.shid,
        usedObject: sourceData.address,
        usedNumber: source.usedNumber,
        isDeleted: false,
        name: sourceData.title,
      };
    }
    return null;
  }

  async getProduct(source: Source) {
    const sourceData = await this.productService.findOneProduct(source.phid);
    if (sourceData !== null) {
      return {
        phid: source.phid,
        usedObject: sourceData.address,
        usedNumber: source.usedNumber,
        isDeleted: false,
        name: sourceData.title,
      };
    }
    return null;
  }

  async generateSourceList(itemDto: ItemDto) {
    const sourceList = [];
    for (let i = 0; i < itemDto.sourceList.length; i++) {
      if (itemDto.sourceList[i].shid !== undefined) {
        const source = await this.getItem(itemDto.sourceList[i]);
        if (source !== null) {
          sourceList.push(await this.getItem(itemDto.sourceList[i]));
        } else {
          throw new Error(
            `Source ${itemDto.sourceList[i].shid} is not created`,
          );
        }
      } else {
        const source = await this.getProduct(itemDto.sourceList[i]);
        if (source !== null) {
          sourceList.push(await this.getProduct(itemDto.sourceList[i]));
        } else {
          throw new Error(
            `Source ${itemDto.sourceList[i].phid} is not created`,
          );
        }
      }
    }
    return sourceList;
  }

  async getProcedureWallet(procedureDto: ProcedureDto) {
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

  @Process('deployItem')
  async deployItem(job: Job) {
    // Check Organization Existed
    const wallet = await this.getWallet(job.data.itemDto);
    const itemData = this.generateItemData(job.data.itemDto, wallet.address);
    console.log("AAA")
    const sourceList = await this.generateSourceList(job.data.itemDto);
    console.log("AAA")
    const { quantity, traceDataList } = this.generateTraceableObjectData(
      job.data.itemDto,
      sourceList,
    );
    console.log("AAA")

    const itemAddress = await this.ethersService.deployItem(
      wallet,
      itemData,
      traceDataList,
      quantity,
    );
    console.log("AAA")
    await this.itemService.createItem(job.data.itemDto, itemAddress);
    console.log("AAA")
  }

  @Process('modifyItem')
  async modifyItem(job: Job) {
    // Check Organization Existed
    const item = await this.itemService.findOneItem(job.data.itemDto.shid);
    const wallet = await this.getWallet(job.data.itemDto);
    const itemData = this.generateItemData(job.data.itemDto, wallet.address);
    const sourceList = await this.generateSourceList(job.data.itemDto);
    const { quantity, traceDataList } = this.generateTraceableObjectData(
      job.data.itemDto,
      sourceList,
    );
    const { itemAddress, procedureList } = await this.ethersService.modifyItem(
      wallet,
      item.address,
      itemData,
      traceDataList,
      quantity,
    );
    // Add procedure back
    await procedureList.forEach(async (element) => {
      const wallet = await this.getProcedureWallet(element);
      await this.ethersService.addProcedure(wallet, itemAddress, element);
    });
    await this.itemService.createItem(job.data.itemDto, itemAddress);
  }
}
