import { BigNumber } from '@ethersproject/bignumber';

export class Quantity {
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

  getObject() {
    return {
      producedNumber: this.producedNumber,
      restNumber: this.restNumber,
      packNumber: this.packNumber,
      unit: this.unit,
    };
  }
}
