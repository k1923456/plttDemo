import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { EthersService } from '../ethers/ethers.service';
import { ProductDto, Source } from './dto/product.dto';
import { ProductService } from './product.service';
import { ItemService } from '../item/item.service';
import { ProductData } from '../ethers/schemas/product.schema';
import { TraceData } from '../ethers/schemas/traceData.schema';
import { Quantity } from '../ethers/schemas/quantity.schema';

@Processor('product')
export class ProductConsumer {
  constructor(
    private readonly ethersService: EthersService,
    private readonly productService: ProductService,
    private readonly itemService: ItemService,
  ) {}

  async getWallet(productDto: ProductDto) {
    let organizationWallet;
    let ownerWallet;
    // Organization
    const organizationData = await this.productService.findOneOrganization(
      productDto.organizationID,
    );
    if (organizationData === null) {
      const wallet = await this.ethersService.generateAccount(
        productDto.organizationID.toString(),
      );
      await this.productService.createOrganization(
        productDto,
        wallet._signingKey().privateKey,
      );
      organizationWallet = wallet;
    } else {
      organizationWallet = this.ethersService.getSigner(organizationData.privateKey);
    }

    // Owner
    const ownerData = await this.productService.findOneOrganization(
      productDto.ownerID,
    );
    if (ownerData === null) {
      const wallet = await this.ethersService.generateAccount(
        productDto.ownerID.toString(),
      );
      await this.productService.createOrganizationForOwner(
        productDto,
        wallet._signingKey().privateKey,
      );
      ownerWallet = wallet;
    } else {
      ownerWallet = this.ethersService.getSigner(ownerData.privateKey);
    }

    return {organizationWallet, ownerWallet}
  }

  generateProductData(productDto: ProductDto, organization: string, owner: string) {
    return new ProductData({ ...productDto, organization, owner });
  }

  generateTraceableObjectData(dto: ProductDto, sourceList) {
    const quantity = new Quantity(dto);
    const traceDataList: TraceData[] = [];
    for (let i = 0; i < sourceList.length; i++) {
      traceDataList.push(new TraceData(sourceList[i]));
    }

    return { quantity, traceDataList };
  }

  async getProduct(source: Source) {
    const sourceData = await this.productService.findOneProduct(source.phid);
    if (sourceData !== null) {
      return {
        phid: source.phid,
        usedObject: sourceData.address,
        usedNumber: source.usedNumber,
        isDeleted: false,
        name: sourceData.title
      };
    }
    return null;
  }

  async getItem(source: Source) {
    const sourceData = await this.itemService.findOneItem(source.shid);
    if (sourceData !== null) {
      return {
        shid: source.shid,
        usedObject: sourceData.address,
        usedNumber: source.usedNumber,
        isDeleted: false,
        name: sourceData.title
      };
    }
    return null;
  }

  async generateSourceList(productDto: ProductDto) {
    const sourceList = [];
    for (let i = 0; i < productDto.sourceList.length; i++) {
      if (productDto.sourceList[i].shid !== undefined) {
        const source = await this.getItem(productDto.sourceList[i]);
        if (source !== null) {
          sourceList.push(await this.getItem(productDto.sourceList[i]));
        } else {
          throw new Error(`Source ${productDto.sourceList[i].shid} is not created`)
        }
      } else {
        const source = await this.getProduct(productDto.sourceList[i]);
        if (source !== null) {
          sourceList.push(await this.getProduct(productDto.sourceList[i]));
        } else {
          throw new Error(`Source ${productDto.sourceList[i].phid} is not created`)
        }
      }
    }
    return sourceList;
  }

  @Process('deployProduct')
  async deployProduct(job: Job) {
    // Check Organization Existed
    const {organizationWallet, ownerWallet} = await this.getWallet(job.data.productDto);
    const productData = this.generateProductData(job.data.productDto, organizationWallet.address, ownerWallet.address);
    const sourceList = await this.generateSourceList(job.data.productDto);
    const { quantity, traceDataList } = this.generateTraceableObjectData(
      job.data.productDto,
      sourceList,
    );
    const productAddress = await this.ethersService.deployProduct(
      organizationWallet,
      productData,
      traceDataList,
      quantity,
    );
    await this.productService.createProduct(job.data.productDto, productAddress);
  }

  @Process('modifyProduct')
  async modifyProduct(job: Job) {
    // Check Organization Existed
    const product = await this.productService.findOneProduct(job.data.productDto.phid);
    const {organizationWallet, ownerWallet} = await this.getWallet(job.data.productDto);
    const productData = this.generateProductData(job.data.productDto, organizationWallet.address, ownerWallet.address);
    const sourceList = await this.generateSourceList(job.data.productDto);
    const { quantity, traceDataList } = this.generateTraceableObjectData(
      job.data.productDto,
      sourceList,
    );
    const productAddress = await this.ethersService.modifyProduct(
      organizationWallet,
      product.address,
      productData,
      traceDataList,
      quantity,
    );
    await this.productService.createProduct(job.data.productDto, productAddress);
  }
}
