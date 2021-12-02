import { BigNumber } from '@ethersproject/bignumber';

export class ItemData {
    shid: BigNumber;
    organizationID: BigNumber;
    producedDate: BigNumber;
    expirationDate: BigNumber;
    organization: string;
    name: string;
    organizationName: string;
  
    constructor(object) {
      this.shid = BigNumber.from(object.shid);
      this.organizationID = BigNumber.from(object.organizationID);
      this.producedDate = BigNumber.from(Date.parse(object.producedDate) / 1000);
      this.expirationDate = BigNumber.from(Date.parse(object.expirationDate) / 1000);
      this.organization = object.organization;
      this.name = object.title;
      this.organizationName = object.organizationName;
    }
  }
  
export class ItemQuantity {
    producedNumber: BigNumber;
    restNumber: BigNumber;
    packNumber: BigNumber;
    unit: string;
  
    constructor(object) {
      this.producedNumber = BigNumber.from(object.producedNumber);
      this.restNumber = BigNumber.from(object.restNumber);
      this.packNumber = BigNumber.from(object.packNumber);
      this.unit = object.unit;
    }
  }