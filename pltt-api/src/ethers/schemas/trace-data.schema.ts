import { BigNumber } from '@ethersproject/bignumber';

export class TraceData {
  id: BigNumber;
  usedObject: string;
  usedNumber: BigNumber;
  isDeleted: boolean;

  constructor(object) {
    this.id = BigNumber.from(object.id);
    this.usedObject = object.usedObject;
    this.usedNumber = BigNumber.from(object.usedNumber);
    this.isDeleted = object.isDeleted;
  }
}
