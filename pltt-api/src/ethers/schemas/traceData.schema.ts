import { BigNumber } from '@ethersproject/bignumber';

export class TraceData {
  id: string;
  usedObject: string;
  usedNumber: string;
  isDeleted: boolean;

  constructor(object) {
    this.id = BigNumber.from(object.id).toString();
    this.usedObject = object.usedObject;
    this.usedNumber = BigNumber.from(object.usedNumber).toString();
    this.isDeleted = object.isDeleted !== undefined ? object.isDeleted : false;
  }

  getObject() {
    return {
      id: this.id,
      usedObject: this.usedObject,
      usedNumber: this.usedNumber,
      isDeleted: this.isDeleted,
    };
  }
}
