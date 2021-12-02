import { Controller, Get, Post, Body, Put, HttpException, HttpStatus } from '@nestjs/common';
import { ItemService } from './item.service';
import { ProductService } from '../product/product.service';
import { EthersService } from '../ethers/ethers.service';
import { CreateItemDto } from './dto/create-item.dto';

@Controller('item')
export class ItemController {
  constructor(
    private readonly itemService: ItemService,
    private readonly productService: ProductService,
    private readonly ethersService: EthersService,
  ) {}

  async getWallet(createItemDto: CreateItemDto) {
    const organizationData = await this.itemService.findOneOrganization(
      createItemDto.organizationID,
    );

    if (organizationData === null) {
      return await this.ethersService.generateAccount(
        createItemDto.organizationID.toString(),
      );
    } else {
      return this.ethersService.getSigner(organizationData.privateKey);
    }
  }

  async checkSourceList(createItemDto: CreateItemDto) {
    const sourceList = [];
    for (let i = 0; i < createItemDto.sourceList.length; i++) {
      const sourceData = await this.itemService.findOneItem(createItemDto.sourceList[i].id)
      const productData = await this.productService.findOneProduct(createItemDto.sourceList[i].id)
      if (sourceData !== null) {
        sourceList.push({
          id: createItemDto.sourceList[i].id,
          usedObject: sourceData.address,
          usedNumber: createItemDto.sourceList[i].usedNumber,
          isDeleted: false
        })
      }
      else if (productData !== null) {
        sourceList.push({
          id: createItemDto.sourceList[i].id,
          usedObject: productData.address,
          usedNumber: createItemDto.sourceList[i].usedNumber,
          isDeleted: false
        })
      } else {
        throw new HttpException(`Source Item ${createItemDto.sourceList[i].id} is not deployed`, HttpStatus.BAD_REQUEST);
      }
    }
    return sourceList;
  }

  @Post()
  async create(@Body() createItemDto: CreateItemDto) {
    // Check Organization Existed
    const wallet = await this.getWallet(createItemDto);

    // Check item existed and sources Existed
    let sourceList = [];
    if (createItemDto.sourceList !== undefined) {
      sourceList = await this.checkSourceList(createItemDto);
    }
    console.log("AAA")
    // Create item    
    const itemAddress = await this.ethersService.createItem(createItemDto, sourceList, wallet);

    // // Save all Data
    await this.itemService.createItem(createItemDto, itemAddress);
    await this.itemService.createOrganization(createItemDto, wallet._signingKey().privateKey);
    
  }

  @Put()
  async update(@Body() createItemDto: CreateItemDto) {
    // Check Organization Existed
    const wallet = await this.getWallet(createItemDto);

    // Update item    
    const itemAddress = await this.ethersService.modifyItem(createItemDto, wallet);

    // // Save all Data
    // await this.itemService.createItem(createItemDto, itemAddress);
    // await this.itemService.createOrganization(createItemDto, wallet.privateKey);
  }
}
