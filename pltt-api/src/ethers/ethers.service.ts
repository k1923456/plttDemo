import { Injectable } from '@nestjs/common';
import { ethers, Wallet } from 'ethers';
import { readFileSync } from 'fs';
import { CreateItemDto } from '../item/dto/create-item.dto';
import { TraceData } from './schemas/trace-data.schema';
import { ItemData, ItemQuantity } from './schemas/item.schema';

@Injectable()
export class EthersService {
  etherProvider: ethers.providers.BaseProvider;
  traceableObjectJSON;
  itemJSON;
  productJSON;

  constructor() {
    this.etherProvider = ethers.getDefaultProvider(process.env.URL);
    this.traceableObjectJSON = JSON.parse(
      readFileSync(process.env.TRACEABLE_OBJECT_JSON_PATH).toString(),
    );
    this.itemJSON = JSON.parse(
      readFileSync(process.env.ITEM_JSON_PATH).toString(),
    );
    this.productJSON = JSON.parse(
      readFileSync(process.env.PRODUCT_JSON_PATH).toString(),
    );
  }

  generateAccount(id: string) {
    console.log(ethers.Wallet.createRandom(id)._signingKey());
    return ethers.Wallet.createRandom(id);
  }

  getSigner(privateKey: string) {
    return new ethers.Wallet(privateKey, this.etherProvider);
  }

  async getItemContractFactory(): Promise<ethers.ContractFactory> {
    return await new ethers.ContractFactory(
      this.itemJSON.abi,
      this.itemJSON.bytecode,
    );
  }

  async getProductContractFactory(): Promise<ethers.ContractFactory> {
    return await new ethers.ContractFactory(
      this.productJSON.abi,
      this.productJSON.bytecode,
    );
  }

  generateItemData(createItemDto: CreateItemDto, organization: string, sourceList) {
    console.log({...createItemDto, organization})
    const itemData = new ItemData({...createItemDto, organization})
    console.log(itemData)
    const itemQuantity = new ItemQuantity(createItemDto)
    console.log(itemQuantity)
    const itemSourceList: TraceData[] = [];
    for (let i = 0; i < sourceList.length; i++) {
      itemSourceList.push(new TraceData(sourceList[i]));
      console.log(itemSourceList)
    }
    console.log(itemSourceList)

    return { itemData, itemQuantity, itemSourceList }
  }

  async createItem(
    createItemDto: CreateItemDto,
    sourceList,
    signer: Wallet,
  ) {

    const {itemData, itemQuantity, itemSourceList} = this.generateItemData(createItemDto, signer.address, sourceList);
    const itemFactory = await this.getItemContractFactory();
    const item = await itemFactory
      .connect(signer)
      .deploy(itemData, itemQuantity);
    console.log('---------------------------------------------')
    console.log(
      `Deployed item contract ${item.address}, Organization is ${signer.address}`,
    );
    for (let i = 0; i < itemSourceList.length; i++) {
      const sourceItem = await itemFactory.attach(itemSourceList[i].usedObject);
      await sourceItem.addDests([item.address]);
      console.log(`Source ${sourceItem.address} add ${item.address} as dest`);
    }
    await item.addSources(itemSourceList);
    console.log(`SourceList ${sourceList.toString()} is added to ${item.address}`);
    console.log('---------------------------------------------')

    return item.address;
  }

  async modifyItem(
    createItemDto: CreateItemDto,
    signer: Wallet,
  ) {
    // const itemFactory = await this.getItemContractFactory();
    // const item = await itemFactory
    //   .attach(itemAddress)
    //   .connect(signer)
    //   .modify(itemData, itemQuantity);
    // console.log(
    //   `Modified item contract ${item.address}, Organization is ${signer.address}`,
    // );
  }

  async createProcedure() {}

  async modifyProcedure() {}

  async createTransaction() {}

  async modifyTransaction() {}
}
