import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { EthersService } from '../ethers/ethers.service';
import { ItemDto, Source } from './dto/item.dto';
import { ItemService } from './item.service';
import { ProductService } from '../product/product.service';
import { ItemData } from '../ethers/schemas/item.schema';
import { TraceData } from '../ethers/schemas/traceData.schema';
import { Quantity } from '../ethers/schemas/quantity.schema';

@Processor('item')
export class ItemConsumer {
  constructor(
    private readonly ethersService: EthersService,
    private readonly itemService: ItemService,
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
    const quantity = new Quantity(dto);
    const traceDataList: TraceData[] = [];
    for (let i = 0; i < sourceList.length; i++) {
      traceDataList.push(new TraceData(sourceList[i]));
    }

    return { quantity, traceDataList };
  }

  async getItem(source: Source) {
    const sourceData = await this.itemService.findOneItem(source.shid);
    if (sourceData !== null) {
      return {
        id: source.shid,
        usedObject: sourceData.address,
        usedNumber: source.usedNumber,
        isDeleted: false,
      };
    }
    return null;
  }

  async getProduct(source: Source) {
    const productData = await this.productService.findOneProduct(source.phid);
    if (productData !== null) {
      return {
        id: source.phid,
        usedObject: productData.address,
        usedNumber: source.usedNumber,
        isDeleted: false,
      };
    }
    return null;
  }

  async generateSourceList(itemDto: ItemDto) {
    const sourceList = [];
    for (let i = 0; i < itemDto.sourceList.length; i++) {
      if (itemDto.sourceList[i].shid !== undefined) {
        sourceList.push(await this.getItem(itemDto.sourceList[i]));
      } else {
        sourceList.push(await this.getProduct(itemDto.sourceList[i]));
      }
    }
    return sourceList;
  }

  @Process('deployItem')
  async deployItem(job: Job) {
    // Check Organization Existed
    const wallet = await this.getWallet(job.data.itemDto);
    const itemData = this.generateItemData(job.data.itemDto, wallet.address);
    const sourceList = await this.generateSourceList(job.data.itemDto);
    const { quantity, traceDataList } = this.generateTraceableObjectData(
      job.data.itemDto,
      sourceList,
    );
    const itemAddress = await this.ethersService.deployItem(
      wallet,
      itemData,
      traceDataList,
      quantity,
    );
    await this.itemService.createItem(job.data.itemDto, itemAddress);
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
    const itemAddress = await this.ethersService.modifyItem(
      wallet,
      item.address,
      itemData,
      traceDataList,
      quantity,
    );
    await this.itemService.createItem(job.data.itemDto, itemAddress);
  }
}
