import { Injectable } from '@nestjs/common';
import { ethers, Wallet } from 'ethers';
import { readFileSync } from 'fs';
import { ItemData } from './schemas/item.schema';
import { ProcedureData } from './schemas/procedure.schema';
import { ProductData } from './schemas/product.schema';
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
      const productFactory = await this.getContractFactory(this.productJSON);
      console.log("AAA")
      const item = await itemFactory.connect(signer).deploy(itemData, quantity);
      console.log("AAA")
      const itemName = (await item.itemData()).name;
      console.log(
        `Deployed item contract ${itemName} ( ${item.address} ), Organization is ${signer.address}`,
      );

      // Add destination of source item
      for (let i = 0; i < traceDataList.length; i++) {
        let source;
        if (!traceDataList[i].shid.isZero()) {
          source = await itemFactory
          .connect(signer)
          .attach(traceDataList[i].usedObject);
        } else {
          source = await productFactory
          .connect(signer)
          .attach(traceDataList[i].usedObject);
        }
        const itemSourceName = (await source.itemData()).name;
        const tx = await source.addDests(
          [
            {
              shid: traceDataList[0].shid,
              phid: traceDataList[0].phid,
              usedObject: item.address,
              usedNumber: traceDataList[0].usedNumber,
              isDeleted: traceDataList[0].isDeleted,
              name: traceDataList[0].name,
            },
          ],
          { gasLimit: 400000 },
        );
        const receipt = await tx.wait(1);
        console.log(
          `Source ${itemSourceName} ( ${source.address} ) add ${itemName} as destination. (tx: ${receipt.transactionHash})`,
        );
      }
      if (traceDataList.length !== 0) {
        // Add sources of newly created item
        const tx = await item.addSources(traceDataList, { gasLimit: 400000 });
        const receipt = await tx.wait(1);
        const traceIDs = traceDataList.map((ele) => {
          return ele.shid.isZero ? ele.phid : ele.shid;
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
      const productFactory = await this.getContractFactory(this.productJSON);
      const oldItem = await itemFactory.connect(signer).attach(oldItemAddress);
      const oldSourceList = await oldItem.getSourceList();
      console.log(oldSourceList)
      for (let i = 0; i < oldSourceList.length; i++) {
        let source;
        if (!oldSourceList[i].shid.isZero()) {
          source = await itemFactory
          .connect(signer)
          .attach(oldSourceList[i].usedObject);
        } else {
          source = await productFactory
          .connect(signer)
          .attach(oldSourceList[i].usedObject);
        }
        const tx = await source.delDest(oldItemAddress);
        const receipt = await tx.wait(1);
        console.log(
          `Source ${source.address} is deleted and restore number. (tx: ${receipt.transactionHash})`,
        );
      }
      // Set all source to true in destinationList
      const oldDestinationList = await oldItem.getDestinationList();
      console.log(oldDestinationList)
      for (let i = 0; i < oldDestinationList.length; i++) {
        console.log(oldDestinationList[i])
        let dest;
        if (!oldDestinationList[i].shid.isZero()) {
          dest = await itemFactory
          .connect(signer)
          .attach(oldDestinationList[i].usedObject);
        } else {
          dest = await productFactory
          .connect(signer)
          .attach(oldDestinationList[i].usedObject);
        }
        const tx = await dest.delSource(oldItemAddress);
        const receipt = await tx.wait(1);
        console.log(
          `Item ${dest.address} delete source ${oldItemAddress}. (tx: ${receipt.transactionHash})`,
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
    console.log(`======== Begin add procedure ========`);
    const itemFactory = await this.getContractFactory(this.itemJSON);
    const item = await itemFactory.connect(signer).attach(itemAddress);

    const tx = await item.addProcedure(procedureData);
    const receipt = await tx.wait(1);

    console.log(
      `Procedure ${procedureData.procedure} is added to item ${itemAddress}. (tx: ${receipt.transactionHash})`,
    );
    console.log(`======== End add procedure ========`);
  }

  async deployProduct(
    signer: Wallet,
    productData: ProductData,
    traceDataList: TraceData[],
    quantity: Quantity,
  ) {
    // try {
    //   console.log(`======== Begin deploy product ========`);
    //   console.log("RRRR")
    //   const productFactory = await this.getContractFactory(this.productJSON);
    //   console.log("RRRR")
    //   console.log(productData)
    //   const product = await productFactory.connect(signer).deploy(productData, quantity);
    //   console.log("RRRR")
    //   const productName = (await product.productData()).name;
    //   console.log("RRRR")
    //   console.log(
    //     `Deployed product contract ${productName} ( ${product.address} ), Organization is ${signer.address}`,
    //   );

    //   // Add destination of source product
    //   for (let i = 0; i < traceDataList.length; i++) {
    //     console.log("ADASDASD")
    //     const productSource = await productFactory
    //       .connect(signer)
    //       .attach(traceDataList[i].usedObject);
    //     const productSourceName = (await productSource.productData()).name;
    //     console.log(productSourceName)
    //     const tx = await productSource.addDests(
    //       [
    //         {
    //           id: traceDataList[0].id,
    //           usedObject: product.address,
    //           usedNumber: traceDataList[0].usedNumber,
    //           isDeleted: false,
    //         },
    //       ],
    //       { gasLimit: 400000 },
    //     );
    //     const receipt = await tx.wait(1);
    //     console.log(
    //       `Source ${productSourceName} ( ${productSource.address} ) add ${productName} as destination. (tx: ${receipt.transactionHash})`,
    //     );
    //   }
    //   if (traceDataList.length !== 0) {
    //     // Add sources of newly created product
    //     const tx = await product.addSources(traceDataList, { gasLimit: 400000 });
    //     const receipt = await tx.wait(1);
    //     const traceIDs = traceDataList.map((ele) => {
    //       return ele.id;
    //     });
    //     console.log(
    //       `Product ${productName} add ${traceIDs.toString()} as sources. (tx: ${
    //         receipt.transactionHash
    //       })`,
    //     );
    //   }
    //   console.log(`======== End deploy product ========`);
    //   return product.address;
    // } catch (e) {
    //   const msg = await this.printRevertReason(e);
    //   throw new Error(msg);
    // }
  }

  async modifyProduct(
    signer: Wallet,
    oldProductAddress: string,
    productData: ProductData,
    traceDataList: TraceData[],
    quantity: Quantity,
  ) {
    // try {
    //   console.log(`======== Begin modify product ========`);
    //   // Set all dest to true in sourceList
    //   const productFactory = await this.getContractFactory(this.productJSON);
    //   const oldProduct = await productFactory.connect(signer).attach(oldProductAddress);
    //   const oldSourceList = await oldProduct.getSourceList();
    //   for (let i = 0; i < oldSourceList.length; i++) {
    //     const oldProductSource = await productFactory
    //       .connect(signer)
    //       .attach(oldSourceList[i].usedObject);
    //     const tx = await oldProductSource.delDest(oldProductAddress);
    //     const receipt = await tx.wait(1);
    //     console.log(
    //       `Source ${oldProductSource.address} is deleted and restore number. (tx: ${receipt.transactionHash})`,
    //     );
    //   }
    //   // Set all source to true in destinationList
    //   const oldDestinationList = await oldProduct.getDestinationList();
    //   for (let i = 0; i < oldDestinationList.length; i++) {
    //     const oldProductDestination = await productFactory
    //       .connect(signer)
    //       .attach(oldDestinationList[i].usedObject);
    //     const tx = await oldProductDestination.delSource(oldProductAddress);
    //     const receipt = await tx.wait(1);
    //     console.log(
    //       `Product ${oldProductDestination.address} delete source ${oldProductAddress}. (tx: ${receipt.transactionHash})`,
    //     );
    //   }
    //   // destruct product
    //   const tx = await oldProduct.destruct(signer.address);
    //   const receipt = await tx.wait(1);
    //   console.log(
    //     `Product ${oldProductAddress} has been destructed. (tx: ${receipt.transactionHash})`,
    //   );
    //   // deploy new Product
    //   const productAddress = await this.deployProduct(
    //     signer,
    //     productData,
    //     traceDataList,
    //     quantity,
    //   );
    //   console.log(`======== End modify product ========`);
    //   return productAddress;
    // } catch (e) {
    //   const msg = await this.printRevertReason(e);
    //   throw new Error(msg);
    // }
  }
}
