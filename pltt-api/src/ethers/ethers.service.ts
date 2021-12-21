import { Injectable } from '@nestjs/common';
import { ethers, Wallet } from 'ethers';
import { readFileSync } from 'fs';
import { ItemData } from './schemas/item.schema';
import { ProcedureData } from './schemas/procedure.schema';
// import { ProductData } from './schemas/product.schema';
import { TraceData } from './schemas/traceData.schema';
import { Quantity } from './schemas/quantity.schema';

@Injectable()
export class EthersService {
  etherProvider;
  traceableObjectJSON;
  itemJSON;
  productJSON;

  constructor() {
    this.etherProvider = new ethers.providers.JsonRpcProvider(process.env.URL);
    this.itemJSON = JSON.parse(
      readFileSync(process.env.ITEM_JSON_PATH).toString(),
    );
    this.productJSON = JSON.parse(
      readFileSync(process.env.PRODUCT_JSON_PATH).toString(),
    );
    this.traceableObjectJSON = JSON.parse(
      readFileSync(process.env.TRACEABLE_OBJECT_JSON_PATH).toString(),
    );
  }

  async printRevertReason(error) {
    if (!error.transactionHash) {
      console.log(error);
      return error.message;
    }
    const tx = await this.etherProvider.getTransaction(error.transactionHash);
    if (!tx) {
      console.log('tx not found');
      return 'tx not found';
    } else {
      const code = await this.etherProvider.call(tx, tx.blockNumber);
      function hex_to_ascii(str1) {
        const hex = str1.toString();
        let str = '';
        for (let n = 0; n < hex.length; n += 2) {
          str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
        }
        return str;
      }
      function trimZeroBytes(data) {
        const i = data.indexOf('00');
        return data.slice(0, i);
      }
      const reason = hex_to_ascii(trimZeroBytes(code.substr(138)));
      console.log('revert reason:', reason);
      return `${reason}`;
    }
  }

  getSigner(privateKey: string) {
    return new ethers.Wallet(privateKey, this.etherProvider);
  }

  async generateAccount(id: string) {
    const wallet = ethers.Wallet.createRandom(id);
    return wallet.connect(this.etherProvider);
  }

  async getContractFactory(contractJSON): Promise<ethers.ContractFactory> {
    return await new ethers.ContractFactory(
      contractJSON.abi,
      contractJSON.bytecode,
    );
  }

  async deployItem(
    signer: Wallet,
    itemData: ItemData,
    traceDataList: TraceData[],
    quantity: Quantity,
  ) {
    try {
      console.log(`======== Begin deploy item ========`);
      const itemFactory = await this.getContractFactory(this.itemJSON);
      const item = await itemFactory.connect(signer).deploy(itemData, quantity);
      const itemName = (await item.itemData()).name;
      console.log(
        `Deployed item contract ${itemName} ( ${item.address} ), Organization is ${signer.address}`,
      );

      // Add destination of source item
      for (let i = 0; i < traceDataList.length; i++) {
        const itemSource = await itemFactory
          .connect(signer)
          .attach(traceDataList[i].usedObject);
        const itemSourceName = (await itemSource.itemData()).name;
        const tx = await itemSource.addDests(
          [
            {
              id: traceDataList[0].id,
              usedObject: item.address,
              usedNumber: traceDataList[0].usedNumber,
              isDeleted: false,
            },
          ],
          { gasLimit: 400000 },
        );
        const receipt = await tx.wait(1);
        console.log(
          `Source ${itemSourceName} ( ${itemSource.address} ) add ${itemName} as destination. (tx: ${receipt.transactionHash})`,
        );
      }
      if (traceDataList.length !== 0) {
        // Add sources of newly created item
        const tx = await item.addSources(traceDataList, { gasLimit: 400000 });
        const receipt = await tx.wait(1);
        const traceIDs = traceDataList.map((ele) => {
          return ele.id;
        });
        console.log(
          `Item ${itemName} add ${traceIDs.toString()} as sources. (tx: ${
            receipt.transactionHash
          })`,
        );
      }
      console.log(`======== End deploy item ========`);
      return item.address;
    } catch (e) {
      const msg = await this.printRevertReason(e);
      throw new Error(msg);
    }
  }

  async modifyItem(
    signer: Wallet,
    oldItemAddress: string,
    itemData: ItemData,
    traceDataList: TraceData[],
    quantity: Quantity,
  ) {
    try {
      console.log(`======== Begin modify item ========`);
      // Set all dest to true in sourceList
      const itemFactory = await this.getContractFactory(this.itemJSON);
      const oldItem = await itemFactory.connect(signer).attach(oldItemAddress);
      const oldSourceList = await oldItem.getSourceList();
      for (let i = 0; i < oldSourceList.length; i++) {
        const oldItemSource = await itemFactory
          .connect(signer)
          .attach(oldSourceList[i].usedObject);
        const tx = await oldItemSource.delDest(oldItemAddress);
        const receipt = await tx.wait(1);
        console.log(
          `Source ${oldItemSource.address} is deleted and restore number. (tx: ${receipt.transactionHash})`,
        );
      }
      // Set all source to true in destinationList
      const oldDestinationList = await oldItem.getDestinationList();
      for (let i = 0; i < oldDestinationList.length; i++) {
        const oldItemDestination = await itemFactory
          .connect(signer)
          .attach(oldDestinationList[i].usedObject);
        const tx = await oldItemDestination.delSource(oldItemAddress);
        const receipt = await tx.wait(1);
        console.log(
          `Item ${oldItemDestination.address} delete source ${oldItemAddress}. (tx: ${receipt.transactionHash})`,
        );
      }
      // destruct item
      const tx = await oldItem.destruct(signer.address);
      const receipt = await tx.wait(1);
      console.log(
        `Item ${oldItemAddress} has been destructed. (tx: ${receipt.transactionHash})`,
      );
      // deploy new Item
      const itemAddress = await this.deployItem(
        signer,
        itemData,
        traceDataList,
        quantity,
      );
      console.log(`======== End modify item ========`);
      return itemAddress;
    } catch (e) {
      const msg = await this.printRevertReason(e);
      throw new Error(msg);
    }
  }

  async addProcedure(
    signer: Wallet,
    itemAddress: string,
    procedureData: ProcedureData,
  ) {
    const itemFactory = await this.getContractFactory(this.itemJSON);
    const item = await itemFactory.connect(signer).attach(itemAddress);

    const tx = await item.addProcedure(procedureData);
    const receipt = await tx.wait(1);

    console.log(
      `Procedure ${procedureData.procedure} is added to item ${itemAddress}. (tx: ${receipt.transactionHash})`,
    );
  }

  // async deployProduct() {}

  // async modifyProduct() {}
}
