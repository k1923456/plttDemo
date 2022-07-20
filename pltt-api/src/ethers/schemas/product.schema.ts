import { BigNumber } from '@ethersproject/bignumber';

export class ProductData {
  phid: BigNumber;
  organizationID: BigNumber;
  ownerID: BigNumber;
  transactionDate: BigNumber;
  expirationDate: BigNumber;
  organization: string;
  owner: string;
  name: string;
  organizationName: string;
  ownerName: string;

  constructor(object) {
    this.phid = BigNumber.from(object.phid);
    this.organizationID = BigNumber.from(object.organizationID);
    if (!object.ownerID) {
      this.ownerID = BigNumber.from(0);
    } else {
      this.ownerID = BigNumber.from(object.ownerID);
    }
    this.transactionDate = BigNumber.from(
      Date.parse(object.transactionDate) / 1000,
    );
    this.expirationDate = BigNumber.from(
      Date.parse(object.expirationDate) / 1000,
    );
    this.organization = object.organization;
    if (!object.owner) {
      this.owner = '';
    } else {
      this.owner = object.owner;
    }
    this.name = object.title;
    this.organizationName = object.organizationName;
    if (!object.ownerName) {
      this.ownerName = '';
    } else {
      this.ownerName = object.ownerName;
    }
  }

  getObeject() {
    return {
      shid: this.phid,
      organizationID: this.organizationID,
      ownerID: this.ownerID,
      transactionDate: this.transactionDate,
      expirationDate: this.expirationDate,
      organization: this.organization,
      owner: this.owner,
      name: this.name,
      organizationName: this.organizationName,
      ownerName: this.ownerName,
    };
  }
}
