import { BigNumber } from '@ethersproject/bignumber';

export class Quantity {
  producedNumber: BigNumber;
  restNumber: BigNumber;
  packNumber: BigNumber;
  unit: string;

  constructor(object) {
    this.producedNumber = BigNumber.from(object.producedNumber);
    this.restNumber = object.restNumber !== undefined ? BigNumber.from(object.restNumber) : BigNumber.from(object.producedNumber);
    this.packNumber = object.packNumber !== undefined ? BigNumber.from(object.packNumber) : BigNumber.from(0);
    this.unit = object.unit;
  }

  getObject() {
    return {
      producedNumber: this.producedNumber,
      restNumber: this.restNumber,
      packNumber: this.packNumber,
      unit: this.unit,
    };
  }
}
