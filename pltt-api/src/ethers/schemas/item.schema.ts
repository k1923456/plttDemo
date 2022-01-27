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
    this.expirationDate = object.expirationDate !== undefined ? BigNumber.from(
      Date.parse(object.expirationDate) / 1000,
    ) : BigNumber.from(0);
    this.organization = object.organization;
    this.name = object.title;
    this.organizationName = object.organizationName;
  }

  getObeject() {
    return {
      shid: this.shid,
      organizationID: this.organizationID,
      producedDate: this.producedDate,
      expirationDate: this.expirationDate,
      organization: this.organization,
      name: this.name,
      organizationName: this.organizationName,
    };
  }
}
