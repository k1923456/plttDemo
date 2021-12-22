import { BigNumber } from '@ethersproject/bignumber';

export class TraceData {
  shid: BigNumber;
  phid: BigNumber;
  name: string;
  usedObject: string;
  usedNumber: string;
  isDeleted: boolean;

  constructor(object) {
    this.shid =
      object.shid !== undefined
        ? BigNumber.from(object.shid)
        : BigNumber.from(0);
    this.phid =
      object.phid !== undefined
        ? BigNumber.from(object.phid)
        : BigNumber.from(0);
    this.name = object.name;
    this.usedObject = object.usedObject;
    this.usedNumber = BigNumber.from(object.usedNumber).toString();
    this.isDeleted = object.isDeleted !== undefined ? object.isDeleted : false;
  }

  getObject() {
    return {
      shid: this.shid,
      phid: this.phid,
      name: this.name,
      usedObject: this.usedObject,
      usedNumber: this.usedNumber,
      isDeleted: this.isDeleted,
    };
  }
}
