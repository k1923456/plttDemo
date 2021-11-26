import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { readFileSync } from 'fs';
import { CreateItemDto } from '../item/dto/create-item.dto';

@Injectable()
export class EthersService {
    etherProvider : ethers.providers.BaseProvider;
    itemJSON;
    productFactory : ethers.ContractFactory;

    constructor() {
      this.etherProvider = ethers.getDefaultProvider(process.env.URL);
      this.itemJSON = JSON.parse(readFileSync(process.env.ITEM_JSON_PATH).toString())
    //   const productJSON = JSON.parse(readFileSync(process.env.PRODUCT_JSON_PATH).toString())
    //   this.ProductABI = .abi;      
    }

    generateAddress(id: string) {
      console.log(ethers.Wallet.createRandom(id)._signingKey());
      return ethers.Wallet.createRandom(id).address;
    }

    async getItemContractFactory(): Promise<ethers.ContractFactory> {
        return await new ethers.ContractFactory(this.itemJSON.abi, this.itemJSON.bytecode);
    }
    
    async getFirstAccountBalance(): Promise<string> {
      const balanceBN =  await this.etherProvider.getBalance('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
      return balanceBN.toString();
    }

    async createItem(createItemDto: CreateItemDto) {
        const itemData = {
            shid: 1234,
            organizationID: 1,
            producedDate: 1637857385,
            expirationDate: 2637857385,
            organization: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
            name: "茶葉",
            organizationName: "8D Tea",
          };
          const number = 1500;
          const packnumber = 5;
          const unit = "ML";
        const itemFactory = await this.getItemContractFactory();
        const signer = new ethers.Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', this.etherProvider)
        const item = await itemFactory.connect(signer).deploy(itemData, number, packnumber, unit);
        console.log(`Deployed item contract ${item.address}, Organization is ${(await item.itemData()).organization}`)
    }

    async modifyItem() {
        
    }

    async createProcedure() {

    }

    async modifyProcedure() {
        
    }

    async createTransaction() {

    }

    async modifyTransaction() {

    }
}
